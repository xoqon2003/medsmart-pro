import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { AppStatus } from '@prisma/client';

const applicationIncludes = {
  patient: { select: { id: true, fullName: true, phone: true, avatar: true } },
  radiolog: { select: { id: true, fullName: true, specialty: true, avatar: true } },
  specialist: { select: { id: true, fullName: true, specialty: true, avatar: true } },
  doctor: { select: { id: true, fullName: true, specialty: true, avatar: true } },
  anamnez: true,
  files: true,
  payment: true,
  conclusions: { include: { author: { select: { id: true, fullName: true, role: true } } } },
  auditLog: { orderBy: { createdAt: 'desc' as const } },
  examinations: true,
};

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: { status?: string; patientId?: number; radiologId?: number; page?: number; limit?: number }) {
    const { status, patientId, radiologId, page = 1, limit = 20 } = filters;
    const where: any = {};
    if (status) where.status = status.toUpperCase() as AppStatus;
    if (patientId) where.patientId = patientId;
    if (radiologId) where.radiologId = radiologId;

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

  async create(data: any) {
    const count = await this.prisma.application.count();
    const arizaNumber = `MSP-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    const app = await this.prisma.application.create({
      data: {
        ...data,
        arizaNumber,
      },
      include: applicationIncludes,
    });

    // Audit log
    await this.prisma.auditEvent.create({
      data: {
        applicationId: app.id,
        action: 'APPLICATION_CREATED',
        actorId: data.patientId,
        actorRole: 'PATIENT',
        details: { serviceType: data.serviceType, urgency: data.urgency },
      },
    });

    return app;
  }

  async update(id: number, data: any) {
    return this.prisma.application.update({
      where: { id },
      data,
      include: applicationIncludes,
    });
  }

  async updateStatus(id: number, status: string, actorId?: number, actorRole?: string, notes?: string) {
    const oldApp = await this.prisma.application.findUnique({ where: { id } });
    if (!oldApp) throw new NotFoundException('Ariza topilmadi');

    const updateData: any = { status: status.toUpperCase() as AppStatus };
    if (status === 'ACCEPTED' || status === 'accepted') updateData.acceptedAt = new Date();
    if (status === 'DONE' || status === 'done') updateData.completedAt = new Date();
    if (notes) updateData.notes = notes;

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
        details: { from: oldApp.status, to: status.toUpperCase() },
      },
    });

    return app;
  }
}
