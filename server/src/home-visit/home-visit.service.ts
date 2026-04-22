import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AppStatus, ServiceType, Urgency } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateHomeVisitDto } from './dto/create-home-visit.dto';
import { UpdateHomeVisitDto } from './dto/update-home-visit.dto';

const DOCTOR_ROLES = ['DOCTOR', 'SPECIALIST', 'MEDICAL_EDITOR', 'ADMIN'] as const;

@Injectable()
export class HomeVisitService {
  constructor(private readonly prisma: PrismaService) {}

  private genArizaNumber() {
    return `HV-${randomUUID().slice(0, 12).toUpperCase()}`;
  }

  async create(dto: CreateHomeVisitDto, userId: number) {
    if (!dto.hvAddress) throw new BadRequestException('Manzil majburiy');
    return this.prisma.application.create({
      data: {
        arizaNumber: this.genArizaNumber(),
        patientId: userId,
        serviceType: ServiceType.HOME_VISIT,
        urgency: (dto.urgency as Urgency | undefined) ?? Urgency.NORMAL,
        price: dto.price,
        notes: dto.notes,
        hvClinicName: dto.hvClinicName,
        hvDoctorName: dto.hvDoctorName,
        hvDoctorSpeciality: dto.hvDoctorSpeciality,
        hvVisitDay: dto.hvVisitDay,
        hvTimeSlot: dto.hvTimeSlot,
        hvAddress: dto.hvAddress,
      },
    });
  }

  async list(
    userId: number,
    role: string,
    status?: string,
    skip = 0,
    take = 20,
  ) {
    const isDoctor = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    const safeSkip = Math.max(0, Number.isFinite(skip) ? skip : 0);
    const safeTake = Math.min(100, Math.max(1, Number.isFinite(take) ? take : 20));

    const where = {
      serviceType: ServiceType.HOME_VISIT,
      ...(isDoctor ? {} : { patientId: userId }),
      ...(status ? { status: status as AppStatus } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: safeSkip,
        take: safeTake,
        include: {
          doctor: { select: { id: true, fullName: true } },
          patient: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { items, total, skip: safeSkip, take: safeTake };
  }

  async findOne(id: number, userId: number, role: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        doctor: { select: { id: true, fullName: true } },
        patient: { select: { id: true, fullName: true } },
      },
    });
    if (!app || app.serviceType !== ServiceType.HOME_VISIT)
      throw new NotFoundException('Topilmadi');

    const isOwner = app.patientId === userId;
    const isAssigned = app.doctorId === userId || app.specialistId === userId;
    const isAdmin = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    if (!isOwner && !isAssigned && !isAdmin)
      throw new ForbiddenException("Ruxsat yo'q");
    return app;
  }

  async update(
    id: number,
    dto: UpdateHomeVisitDto,
    userId: number,
    role: string,
  ) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app || app.serviceType !== ServiceType.HOME_VISIT)
      throw new NotFoundException('Topilmadi');

    const isOwner = app.patientId === userId;
    const isAdmin = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    if (!isOwner && !isAdmin) throw new ForbiddenException("Ruxsat yo'q");

    return this.prisma.application.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status as AppStatus } : {}),
        ...(dto.hvVisitDay !== undefined ? { hvVisitDay: dto.hvVisitDay } : {}),
        ...(dto.hvTimeSlot !== undefined ? { hvTimeSlot: dto.hvTimeSlot } : {}),
        ...(dto.hvAddress !== undefined ? { hvAddress: dto.hvAddress } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.ratingComment !== undefined
          ? { ratingComment: dto.ratingComment }
          : {}),
      },
    });
  }
}
