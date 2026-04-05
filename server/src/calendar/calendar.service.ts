import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { TariffLimitService } from '../config/tariff-guard';
import { UpdateCalendarSettingsDto, BookConsultationDto, BlockSlotDto } from './dto';

@Injectable()
export class CalendarService {
  constructor(
    private prisma: PrismaService,
    private tariffLimit: TariffLimitService,
  ) {}

  private async getDoctorId(userId: number): Promise<string> {
    const p = await this.prisma.doctorProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!p) throw new NotFoundException('Profil topilmadi');
    return p.id;
  }

  // ─── Calendar Settings ──────────────────────────────────────────────────────

  async getSettings(userId: number) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.calendarSetting.findUnique({ where: { doctorId } });
  }

  async upsertSettings(userId: number, dto: UpdateCalendarSettingsDto) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.calendarSetting.upsert({
      where: { doctorId },
      create: { doctorId, ...dto },
      update: dto,
    });
  }

  // ─── Slot Generatsiya ────────────────────────────────────────────────────────

  async generateSlots(userId: number, startDate: string, endDate: string) {
    const doctorId = await this.getDoctorId(userId);
    const settings = await this.prisma.calendarSetting.findUnique({ where: { doctorId } });
    if (!settings) throw new NotFoundException('Kalendar sozlamalari topilmadi');
    if (!settings.isActive) throw new BadRequestException('Kalendar nofaol');

    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots: any[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (!settings.workDays.includes(dayOfWeek)) continue;

      // Parse start/end times
      const [startH, startM] = settings.startTime.split(':').map(Number);
      const [endH, endM] = settings.endTime.split(':').map(Number);
      const dayStartMin = startH * 60 + startM;
      const dayEndMin = endH * 60 + endM;

      let currentMin = dayStartMin;
      while (currentMin + settings.slotDuration <= dayEndMin) {
        const slotStart = `${String(Math.floor(currentMin / 60)).padStart(2, '0')}:${String(currentMin % 60).padStart(2, '0')}`;
        const slotEndMin = currentMin + settings.slotDuration;
        const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, '0')}:${String(slotEndMin % 60).padStart(2, '0')}`;

        slots.push({
          doctorId,
          date: new Date(d),
          startTime: slotStart,
          endTime: slotEnd,
          status: 'FREE',
        });

        currentMin = slotEndMin + settings.breakDuration;
      }
    }

    if (slots.length === 0) return { message: 'Slotlar yo\'q', count: 0 };

    // Mavjud slotlarni o'chirmaymiz — faqat yangilarini qo'shamiz
    const existing = await this.prisma.calendarSlot.findMany({
      where: {
        doctorId,
        date: { gte: start, lte: end },
      },
      select: { date: true, startTime: true },
    });

    const existingKeys = new Set(
      existing.map(e => `${e.date.toISOString().split('T')[0]}_${e.startTime}`)
    );

    const newSlots = slots.filter(s => {
      const key = `${s.date.toISOString().split('T')[0]}_${s.startTime}`;
      return !existingKeys.has(key);
    });

    if (newSlots.length === 0) return { message: 'Barcha slotlar allaqachon mavjud', count: 0 };

    await this.prisma.calendarSlot.createMany({ data: newSlots });
    return { message: `${newSlots.length} ta slot yaratildi`, count: newSlots.length };
  }

  // ─── Calendar View (public) ─────────────────────────────────────────────────

  async getCalendar(doctorId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [settings, slots] = await Promise.all([
      this.prisma.calendarSetting.findUnique({ where: { doctorId } }),
      this.prisma.calendarSlot.findMany({
        where: { doctorId, date: { gte: startDate, lte: endDate } },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      }),
    ]);

    return { settings, slots };
  }

  async getSlots(doctorId: string, date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return this.prisma.calendarSlot.findMany({
      where: { doctorId, date: { gte: dayStart, lte: dayEnd } },
      orderBy: { startTime: 'asc' },
    });
  }

  // ─── Block/Unblock Slots ────────────────────────────────────────────────────

  async blockSlot(userId: number, dto: BlockSlotDto) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.calendarSlot.create({
      data: {
        doctorId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        status: 'BLOCKED',
        blockedBy: 'DOCTOR',
        blockReason: dto.blockReason,
      },
    });
  }

  async unblockSlot(userId: number, slotId: string) {
    const slot = await this.prisma.calendarSlot.findUnique({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('Slot topilmadi');
    const doctorId = await this.getDoctorId(userId);
    if (slot.doctorId !== doctorId) throw new ForbiddenException('Ruxsat yo\'q');
    await this.prisma.calendarSlot.delete({ where: { id: slotId } });
    return { message: "Bandlik bekor qilindi" };
  }

  // ─── Consultation Booking ───────────────────────────────────────────────────

  async bookConsultation(patientId: number, dto: BookConsultationDto) {
    const slot = await this.prisma.calendarSlot.findUnique({ where: { id: dto.slotId } });
    if (!slot) throw new NotFoundException('Slot topilmadi');
    if (slot.status !== 'FREE') throw new BadRequestException('Bu vaqt band');

    // Narxni aniqlash
    const settings = await this.prisma.calendarSetting.findUnique({ where: { doctorId: dto.doctorId } });
    const priceMap: Record<string, number> = {
      OFFLINE: settings?.offlinePrice ?? 0,
      ONLINE: settings?.onlinePrice ?? 0,
      PHONE: settings?.phonePrice ?? 0,
      VIDEO: settings?.videoPrice ?? 0,
    };

    const [consultation] = await this.prisma.$transaction([
      this.prisma.consultationRequest.create({
        data: {
          patientId,
          doctorId: dto.doctorId,
          slotId: dto.slotId,
          consultType: dto.consultType,
          patientName: dto.patientName,
          patientPhone: dto.patientPhone,
          patientEmail: dto.patientEmail,
          reason: dto.reason,
          price: priceMap[dto.consultType] ?? 0,
        },
      }),
      this.prisma.calendarSlot.update({
        where: { id: dto.slotId },
        data: { status: 'BOOKED' },
      }),
    ]);

    return consultation;
  }

  async cancelConsultation(userId: number, consultId: string, cancelReason: string, cancelledBy: string) {
    const consult = await this.prisma.consultationRequest.findUnique({ where: { id: consultId } });
    if (!consult) throw new NotFoundException('Konsultatsiya topilmadi');

    await this.prisma.$transaction([
      this.prisma.consultationRequest.update({
        where: { id: consultId },
        data: { status: 'CANCELLED', cancelReason, cancelledBy },
      }),
      this.prisma.calendarSlot.update({
        where: { id: consult.slotId },
        data: { status: 'FREE' },
      }),
    ]);

    return { message: 'Bekor qilindi' };
  }

  async completeConsultation(userId: number, consultId: string) {
    const doctorId = await this.getDoctorId(userId);
    const consult = await this.prisma.consultationRequest.findUnique({ where: { id: consultId } });
    if (!consult) throw new NotFoundException('Konsultatsiya topilmadi');
    if (consult.doctorId !== doctorId) throw new ForbiddenException('Ruxsat yo\'q');

    return this.prisma.consultationRequest.update({
      where: { id: consultId },
      data: { status: 'COMPLETED' },
    });
  }

  async rateConsultation(consultId: string, rating: number, comment?: string) {
    const consult = await this.prisma.consultationRequest.findUnique({ where: { id: consultId } });
    if (!consult) throw new NotFoundException('Konsultatsiya topilmadi');
    if (consult.status !== 'COMPLETED') throw new BadRequestException('Faqat yakunlangan konsultatsiyaga baho berish mumkin');

    return this.prisma.consultationRequest.update({
      where: { id: consultId },
      data: { rating, comment },
    });
  }

  async rescheduleConsultation(userId: number, consultId: string, newSlotId: string) {
    const doctorId = await this.getDoctorId(userId);
    const consult = await this.prisma.consultationRequest.findUnique({ where: { id: consultId } });
    if (!consult) throw new NotFoundException('Konsultatsiya topilmadi');
    if (consult.doctorId !== doctorId) throw new ForbiddenException('Ruxsat yo\'q');

    const newSlot = await this.prisma.calendarSlot.findUnique({ where: { id: newSlotId } });
    if (!newSlot || newSlot.status !== 'FREE') throw new BadRequestException('Yangi slot bo\'sh emas');

    await this.prisma.$transaction([
      this.prisma.calendarSlot.update({ where: { id: consult.slotId }, data: { status: 'FREE' } }),
      this.prisma.calendarSlot.update({ where: { id: newSlotId }, data: { status: 'BOOKED' } }),
      this.prisma.consultationRequest.update({
        where: { id: consultId },
        data: { slotId: newSlotId, status: 'RESCHEDULED', rescheduledTo: newSlotId },
      }),
    ]);

    return { message: "Qayta ko'chirildi" };
  }
}
