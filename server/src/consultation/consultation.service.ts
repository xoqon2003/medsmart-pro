import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { CancelConsultationDto } from './dto/cancel-consultation.dto';

const DOCTOR_ROLES = ['DOCTOR', 'SPECIALIST', 'MEDICAL_EDITOR', 'ADMIN'] as const;
type UserRole = string;

// Consultation statuslari (schema.prisma'da String @default("PENDING"))
const CONSULT_STATUS = [
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED',
] as const;
type ConsultStatus = (typeof CONSULT_STATUS)[number];

@Injectable()
export class ConsultationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * PHI siyosati: patientName/patientPhone/patientEmail DTO'dan emas, User profilidan olinadi.
   * CLAUDE.md qoida #6: Supabase prod'ga PHI yozilmaydi — shuning uchun fieldlarni ataylab
   * yozmaymiz. Schema'dagi null-able ustunlar legacy; `docs/architecture/PHI-ROUTING.md`
   * da to'liq migratsiya rejasi bor.
   */
  async create(dto: CreateConsultationDto, userId: number, _role: UserRole) {
    const slot = await this.prisma.calendarSlot.findUnique({
      where: { id: dto.slotId },
    });
    if (!slot) throw new NotFoundException('Slot topilmadi');
    if (slot.status === 'BOOKED') throw new BadRequestException('Slot band');

    return this.prisma.$transaction(async (tx) => {
      const consult = await tx.consultationRequest.create({
        data: {
          patientId: userId,
          doctorId: dto.doctorId,
          slotId: dto.slotId,
          consultType: dto.consultType,
          reason: dto.reason,
          price: dto.price ?? 0,
          status: 'PENDING',
        },
      });
      await tx.calendarSlot.update({
        where: { id: dto.slotId },
        data: { status: 'BOOKED' },
      });
      return consult;
    });
  }

  async list(
    userId: number,
    role: UserRole,
    status?: string,
    skip = 0,
    take = 20,
  ) {
    const isDoctor = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    // Pagination: salbiy qiymatlarni 0 ga, max 100 ga cheklaymiz
    const safeSkip = Math.max(0, Number.isFinite(skip) ? skip : 0);
    const safeTake = Math.min(100, Math.max(1, Number.isFinite(take) ? take : 20));

    const where = {
      ...(isDoctor ? {} : { patientId: userId }),
      ...(status ? { status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.consultationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: safeSkip,
        take: safeTake,
        // minimum-necessary: faqat public doctor maydonlari va slot vaqtlari
        include: {
          doctor: {
            select: {
              id: true,
              user: { select: { fullName: true, specialty: true } },
            },
          },
          slot: {
            select: { id: true, date: true, startTime: true, endTime: true },
          },
        },
      }),
      this.prisma.consultationRequest.count({ where }),
    ]);

    return { items, total, skip: safeSkip, take: safeTake };
  }

  async findOne(id: string, userId: number, role: UserRole) {
    const c = await this.prisma.consultationRequest.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            user: { select: { fullName: true, specialty: true } },
          },
        },
        slot: true,
      },
    });
    if (!c) throw new NotFoundException('Topilmadi');

    const isOwner = c.patientId === userId;
    const isAdmin = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    if (!isOwner && !isAdmin) throw new ForbiddenException("Ruxsat yo'q");
    return c;
  }

  async update(
    id: string,
    dto: UpdateConsultationDto,
    userId: number,
    role: UserRole,
  ) {
    const c = await this.prisma.consultationRequest.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Topilmadi');

    const isOwner = c.patientId === userId;
    const isAdmin = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    if (!isOwner && !isAdmin) throw new ForbiddenException("Ruxsat yo'q");

    return this.prisma.consultationRequest.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.meetingUrl !== undefined ? { meetingUrl: dto.meetingUrl } : {}),
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
        ...(dto.isPaid !== undefined ? { isPaid: dto.isPaid } : {}),
      },
    });
  }

  async cancel(
    id: string,
    dto: CancelConsultationDto,
    userId: number,
    role: UserRole,
  ) {
    const c = await this.prisma.consultationRequest.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Topilmadi');

    const isOwner = c.patientId === userId;
    const isAdmin = DOCTOR_ROLES.includes(role as (typeof DOCTOR_ROLES)[number]);
    if (!isOwner && !isAdmin) throw new ForbiddenException("Ruxsat yo'q");
    if (c.status === 'COMPLETED' || c.status === 'CANCELLED') {
      throw new BadRequestException('Bu konsultatsiyani bekor qilib bo\'lmaydi');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.consultationRequest.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelReason: dto.reason,
          cancelledBy: isOwner ? 'PATIENT' : 'DOCTOR',
        },
      });
      await tx.calendarSlot.update({
        where: { id: c.slotId },
        data: { status: 'FREE' },
      });
      return updated;
    });
  }
}

export { CONSULT_STATUS };
export type { ConsultStatus };
