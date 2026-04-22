import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AppStatus, FileType, ServiceType, Urgency } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { CreateRadiologyDto } from './dto/create-radiology.dto';
import { AssignRadiologistDto } from './dto/assign-radiologist.dto';
import { UploadStudyDto } from './dto/upload-study.dto';

const DOCTOR_ROLES = ['DOCTOR', 'SPECIALIST', 'MEDICAL_EDITOR', 'ADMIN'] as const;
const RADIOLOGIST_ROLES = ['RADIOLOG', 'SPECIALIST', 'ADMIN'] as const;

const RADIOLOGY_SERVICE_TYPES: ServiceType[] = [
  ServiceType.AI_RADIOLOG,
  ServiceType.RADIOLOG_ONLY,
  ServiceType.RADIOLOG_SPECIALIST,
];

function inferFileType(mimeType: string): FileType {
  if (mimeType === 'application/dicom') return FileType.DICOM;
  if (mimeType.startsWith('image/')) return FileType.IMAGE;
  if (mimeType === 'application/pdf') return FileType.PDF;
  return FileType.OTHER;
}

@Injectable()
export class RadiologyService {
  constructor(private readonly prisma: PrismaService) {}

  private genArizaNumber() {
    return `RD-${randomUUID().slice(0, 12).toUpperCase()}`;
  }

  async create(dto: CreateRadiologyDto, userId: number) {
    if (!dto.scanType) throw new BadRequestException('scanType majburiy');
    return this.prisma.application.create({
      data: {
        arizaNumber: this.genArizaNumber(),
        patientId: userId,
        serviceType: (dto.serviceType as ServiceType | undefined) ?? ServiceType.AI_RADIOLOG,
        urgency: (dto.urgency as Urgency | undefined) ?? Urgency.NORMAL,
        scanType: dto.scanType,
        organ: dto.organ,
        scanFacility: dto.scanFacility,
        scanDate: dto.scanDate,
        price: dto.price,
        notes: dto.notes,
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
    const isRadiologist = RADIOLOGIST_ROLES.includes(
      role as (typeof RADIOLOGIST_ROLES)[number],
    );
    const isDoctor = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    const safeSkip = Math.max(0, Number.isFinite(skip) ? skip : 0);
    const safeTake = Math.min(100, Math.max(1, Number.isFinite(take) ? take : 20));

    const where = {
      serviceType: { in: RADIOLOGY_SERVICE_TYPES },
      ...(isRadiologist || isDoctor ? {} : { patientId: userId }),
      ...(isRadiologist && !isDoctor ? { radiologId: userId } : {}),
      ...(status ? { status: status as AppStatus } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: safeSkip,
        take: safeTake,
        include: {
          radiolog: { select: { id: true, fullName: true } },
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
        radiolog: { select: { id: true, fullName: true } },
        files: true,
        conclusions: true,
        patient: { select: { id: true, fullName: true } },
      },
    });
    if (!app) throw new NotFoundException('Topilmadi');
    if (!RADIOLOGY_SERVICE_TYPES.includes(app.serviceType))
      throw new NotFoundException('Topilmadi');

    const isOwner = app.patientId === userId;
    const isAssigned = app.radiologId === userId || app.specialistId === userId;
    const isAdmin = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    if (!isOwner && !isAssigned && !isAdmin)
      throw new ForbiddenException("Ruxsat yo'q");
    return app;
  }

  async assign(
    id: number,
    dto: AssignRadiologistDto,
    _userId: number,
    role: string,
  ) {
    const isAdmin = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    if (!isAdmin) throw new ForbiddenException("Faqat admin tayinlay oladi");

    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Topilmadi');
    return this.prisma.application.update({
      where: { id },
      data: {
        radiologId: dto.radiologistId,
        status: AppStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });
  }

  async uploadStudy(
    id: number,
    dto: UploadStudyDto,
    userId: number,
    role: string,
  ) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Topilmadi');

    const isAssigned = app.radiologId === userId;
    const isAdmin = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    if (!isAssigned && !isAdmin) throw new ForbiddenException("Ruxsat yo'q");

    const fileType = inferFileType(dto.mimeType);
    return this.prisma.$transaction(async (tx) => {
      await tx.fileRecord.create({
        data: {
          applicationId: id,
          fileType,
          s3Key: `${dto.bucket}/${dto.path}`,
          mimeType: dto.mimeType,
          sizeBytes: BigInt(dto.sizeBytes),
          originalName: dto.originalName,
        },
      });
      return tx.application.update({
        where: { id },
        data: {
          status: AppStatus.WITH_SPECIALIST,
          scanDate: dto.scanDate ?? app.scanDate,
        },
      });
    });
  }
}
