import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, AppStatus, ServiceType, Urgency } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import type { CreateApplicationDto } from './dto/create-application.dto';

const applicationIncludes = {
  patient:  { select: { id: true, fullName: true, phone: true, avatar: true } },
  radiolog: { select: { id: true, fullName: true, specialty: true, avatar: true } },
  specialist: { select: { id: true, fullName: true, specialty: true, avatar: true } },
  doctor:   { select: { id: true, fullName: true, specialty: true, avatar: true } },
  anamnez: true,
  files: true,
  payment: true,
  conclusions: { include: { author: { select: { id: true, fullName: true, role: true } } } },
  // take:50 — cheksiz yozuv tortishdan himoya. Zarur bo'lsa alohida
  // GET /applications/:id/audit-log endpointi bilan to'liq tarix ko'rsatilsin.
  auditLog: { orderBy: { createdAt: 'desc' as const }, take: 50 },
  examinations: true,
} satisfies Prisma.ApplicationInclude;

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    status?: string;
    patientId?: number;
    radiologId?: number;
    page?: number;
    limit?: number;
  }) {
    const { status, patientId, radiologId, page = 1, limit = 20 } = filters;

    const where: Prisma.ApplicationWhereInput = {
      ...(status    && { status:    status.toUpperCase() as AppStatus }),
      ...(patientId  && { patientId }),
      ...(radiologId && { radiologId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: applicationIncludes,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async findById(id: number) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: applicationIncludes,
    });
    if (!app) throw new NotFoundException('Ariza topilmadi');
    return app;
  }

  async create(data: CreateApplicationDto & { patientId: number }) {
    const count = await this.prisma.application.count();
    const arizaNumber = `MSP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const app = await this.prisma.application.create({
      data: {
        arizaNumber,
        serviceType: data.serviceType as unknown as ServiceType,
        urgency:     (data.urgency ?? 'NORMAL') as unknown as Urgency,
        scanType:    data.scanType,
        organ:       data.organ,
        scanDate:    data.scanDate,
        price:       data.price,
        notes:       data.notes,
        patientId:   data.patientId,
        radiologId:  data.radiologId,
      } as Prisma.ApplicationUncheckedCreateInput,
      include: applicationIncludes,
    });

    // Audit log
    await this.prisma.auditEvent.create({
      data: {
        applicationId: app.id,
        action: 'APPLICATION_CREATED',
        actorId:   data.patientId,
        actorRole: 'PATIENT',
        details:   { serviceType: data.serviceType, urgency: data.urgency },
      },
    });

    return app;
  }

  async update(id: number, data: Prisma.ApplicationUncheckedUpdateInput) {
    return this.prisma.application.update({
      where: { id },
      data,
      include: applicationIncludes,
    });
  }

  async updateStatus(
    id: number,
    status: string,
    actorId?: number,
    actorRole?: string,
    notes?: string,
  ) {
    const oldApp = await this.prisma.application.findUnique({ where: { id } });
    if (!oldApp) throw new NotFoundException('Ariza topilmadi');

    const upperStatus = status.toUpperCase() as AppStatus;

    const updateData: Prisma.ApplicationUncheckedUpdateInput = {
      status: upperStatus,
      ...(upperStatus === 'ACCEPTED' && { acceptedAt:  new Date() }),
      ...(upperStatus === 'DONE'     && { completedAt: new Date() }),
      ...(notes && { notes }),
    };

    const app = await this.prisma.application.update({
      where: { id },
      data: updateData,
      include: applicationIncludes,
    });

    // Audit log
    await this.prisma.auditEvent.create({
      data: {
        applicationId: id,
        action: 'STATUS_CHANGED',
        actorId,
        actorRole,
        details: { from: oldApp.status, to: upperStatus },
      },
    });

    return app;
  }
}
