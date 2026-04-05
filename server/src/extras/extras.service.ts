import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class ExtrasService {
  constructor(private prisma: PrismaService) {}

  private async getDoctorId(userId: number): Promise<string> {
    const p = await this.prisma.doctorProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!p) throw new NotFoundException('Profil topilmadi');
    return p.id;
  }

  // ─── Anonymous Number ───────────────────────────────────────────────────────

  async getAnonymousNumber(userId: number) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.anonymousNumber.findUnique({ where: { doctorId } });
  }

  async upsertAnonymousNumber(userId: number, data: { virtualNumber?: string; realNumber?: string; provider?: string; isActive?: boolean }) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.anonymousNumber.upsert({
      where: { doctorId },
      create: { doctorId, ...data },
      update: data,
    });
  }

  // ─── Call Schedule ──────────────────────────────────────────────────────────

  async getCallSchedule(userId: number) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.callSchedule.findUnique({ where: { doctorId } });
  }

  async upsertCallSchedule(userId: number, data: { workDays?: number[]; startTime?: string; endTime?: string; lunchStart?: string; lunchEnd?: string; isActive?: boolean }) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.callSchedule.upsert({
      where: { doctorId },
      create: { doctorId, ...data },
      update: data,
    });
  }

  // ─── Telegram Bot ───────────────────────────────────────────────────────────

  async getTelegramBot(userId: number) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.telegramBotConfig.findUnique({ where: { doctorId } });
  }

  async upsertTelegramBot(userId: number, data: { botToken?: string; channelId?: string; channelUrl?: string; isOwnBot?: boolean; autoPost?: boolean }) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.telegramBotConfig.upsert({
      where: { doctorId },
      create: { doctorId, ...data },
      update: data,
    });
  }

  // ─── Ad Settings ────────────────────────────────────────────────────────────

  async getAdSettings(userId: number) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.adSetting.findUnique({ where: { doctorId } });
  }

  async upsertAdSettings(userId: number, data: { showBannerAds?: boolean; showPopupAds?: boolean; showInFeedAds?: boolean; adFrequency?: string }) {
    const doctorId = await this.getDoctorId(userId);
    return this.prisma.adSetting.upsert({
      where: { doctorId },
      create: { doctorId, ...data },
      update: data,
    });
  }
}
