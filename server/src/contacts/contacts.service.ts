import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  // ─── Contact Requests ───────────────────────────────────────────────────────

  async createRequest(dto: CreateContactRequestDto) {
    return this.prisma.contactRequest.create({ data: dto });
  }

  async getRequests(userId: number, status?: string) {
    const profile = await this.getDoctorProfile(userId);
    const where: any = { doctorId: profile.id };
    if (status) where.status = status;

    return this.prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRequestStatus(userId: number, id: string, status: string) {
    const req = await this.prisma.contactRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Ariza topilmadi');

    const profile = await this.getDoctorProfile(userId);
    if (req.doctorId !== profile.id) throw new ForbiddenException('Ruxsat yo\'q');

    return this.prisma.contactRequest.update({
      where: { id },
      data: { status },
    });
  }

  async replyToRequest(userId: number, id: string, reply: string) {
    const req = await this.prisma.contactRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Ariza topilmadi');

    const profile = await this.getDoctorProfile(userId);
    if (req.doctorId !== profile.id) throw new ForbiddenException('Ruxsat yo\'q');

    return this.prisma.contactRequest.update({
      where: { id },
      data: { doctorReply: reply, status: 'REPLIED' },
    });
  }

  // ─── Message Templates ──────────────────────────────────────────────────────

  async getTemplates(userId: number) {
    const profile = await this.getDoctorProfile(userId);
    return this.prisma.messageTemplate.findMany({
      where: { doctorId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPublicTemplates(doctorProfileId: string) {
    return this.prisma.messageTemplate.findMany({
      where: { doctorId: doctorProfileId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, category: true, title: true, content: true },
    });
  }

  async createTemplate(userId: number, dto: CreateTemplateDto) {
    const profile = await this.getDoctorProfile(userId);
    return this.prisma.messageTemplate.create({
      data: { doctorId: profile.id, ...dto },
    });
  }

  async updateTemplate(userId: number, id: string, dto: Partial<CreateTemplateDto>) {
    const tmpl = await this.prisma.messageTemplate.findUnique({ where: { id } });
    if (!tmpl) throw new NotFoundException('Shablon topilmadi');

    const profile = await this.getDoctorProfile(userId);
    if (tmpl.doctorId !== profile.id) throw new ForbiddenException('Ruxsat yo\'q');

    return this.prisma.messageTemplate.update({ where: { id }, data: dto });
  }

  async deleteTemplate(userId: number, id: string) {
    const tmpl = await this.prisma.messageTemplate.findUnique({ where: { id } });
    if (!tmpl) throw new NotFoundException('Shablon topilmadi');

    const profile = await this.getDoctorProfile(userId);
    if (tmpl.doctorId !== profile.id) throw new ForbiddenException('Ruxsat yo\'q');

    await this.prisma.messageTemplate.delete({ where: { id } });
    return { message: "O'chirildi" };
  }

  // ─── Helper ─────────────────────────────────────────────────────────────────

  private async getDoctorProfile(userId: number) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw new NotFoundException('Profil topilmadi');
    return profile;
  }
}
