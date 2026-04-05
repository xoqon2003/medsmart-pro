import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { TariffLimitService } from '../config/tariff-guard';
import { CreateFaqDto } from './dto/create-faq.dto';
import { CreateMedicalServiceDto } from './dto/create-medical-service.dto';

@Injectable()
export class FaqServicesService {
  constructor(
    private prisma: PrismaService,
    private tariffLimit: TariffLimitService,
  ) {}

  private async getDoctorProfileId(userId: number): Promise<string> {
    const p = await this.prisma.doctorProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!p) throw new NotFoundException('Profil topilmadi');
    return p.id;
  }

  private async verifyOwner(userId: number, doctorId: string) {
    const p = await this.prisma.doctorProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!p || p.id !== doctorId) throw new ForbiddenException('Ruxsat yo\'q');
  }

  // ─── FAQ ────────────────────────────────────────────────────────────────────

  async getPublicFaq(doctorProfileId: string, category?: string) {
    const where: any = { doctorId: doctorProfileId, isActive: true };
    if (category) where.category = category;
    return this.prisma.fAQ.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async createFaq(userId: number, dto: CreateFaqDto) {
    await this.tariffLimit.checkLimit(userId, 'faq', 'faqLimit');
    const doctorId = await this.getDoctorProfileId(userId);
    return this.prisma.fAQ.create({ data: { doctorId, ...dto } });
  }

  async updateFaq(userId: number, id: string, dto: Partial<CreateFaqDto>) {
    const faq = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ topilmadi');
    await this.verifyOwner(userId, faq.doctorId);
    return this.prisma.fAQ.update({ where: { id }, data: dto });
  }

  async deleteFaq(userId: number, id: string) {
    const faq = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ topilmadi');
    await this.verifyOwner(userId, faq.doctorId);
    await this.prisma.fAQ.delete({ where: { id } });
    return { message: "O'chirildi" };
  }

  // ─── Medical Services ───────────────────────────────────────────────────────

  async getPublicServices(doctorProfileId: string, category?: string) {
    const where: any = { doctorId: doctorProfileId, isActive: true };
    if (category) where.category = category;
    return this.prisma.medicalService.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async createService(userId: number, dto: CreateMedicalServiceDto) {
    await this.tariffLimit.checkLimit(userId, 'services', 'servicesLimit');
    const doctorId = await this.getDoctorProfileId(userId);
    return this.prisma.medicalService.create({ data: { doctorId, ...dto } });
  }

  async updateService(userId: number, id: string, dto: Partial<CreateMedicalServiceDto>) {
    const svc = await this.prisma.medicalService.findUnique({ where: { id } });
    if (!svc) throw new NotFoundException('Xizmat topilmadi');
    await this.verifyOwner(userId, svc.doctorId);
    return this.prisma.medicalService.update({ where: { id }, data: dto });
  }

  async deleteService(userId: number, id: string) {
    const svc = await this.prisma.medicalService.findUnique({ where: { id } });
    if (!svc) throw new NotFoundException('Xizmat topilmadi');
    await this.verifyOwner(userId, svc.doctorId);
    await this.prisma.medicalService.delete({ where: { id } });
    return { message: "O'chirildi" };
  }
}
