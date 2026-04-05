import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CreateEducationDto } from './dto/create-education.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  // ─── Portfolio olish (ochiq) ────────────────────────────────────────────────

  async getPortfolio(doctorProfileId: string) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { id: doctorProfileId },
      select: {
        id: true,
        experienceYears: true,
        totalConsultations: true,
        totalOperations: true,
        averageRating: true,
        totalRatings: true,
        overallRank: true,
        specialtyRank: true,
        education: { orderBy: { startYear: 'desc' } },
        workExperience: { orderBy: { startYear: 'desc' } },
        achievements: { orderBy: { year: 'desc' } },
        certificates: { orderBy: { year: 'desc' } },
      },
    });
    if (!profile) throw new NotFoundException('Profil topilmadi');
    return profile;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async getDoctorProfileId(userId: number): Promise<string> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw new NotFoundException('Profil topilmadi');
    return profile.id;
  }

  private async verifyOwnership(userId: number, doctorId: string) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile || profile.id !== doctorId) {
      throw new ForbiddenException("Faqat o'z ma'lumotlaringizni o'zgartirishingiz mumkin");
    }
  }

  // ─── Education CRUD ─────────────────────────────────────────────────────────

  async addEducation(userId: number, dto: CreateEducationDto) {
    const doctorId = await this.getDoctorProfileId(userId);
    return this.prisma.education.create({
      data: { doctorId, ...dto },
    });
  }

  async updateEducation(userId: number, id: string, dto: Partial<CreateEducationDto>) {
    const edu = await this.prisma.education.findUnique({ where: { id } });
    if (!edu) throw new NotFoundException("Ta'lim yozuvi topilmadi");
    await this.verifyOwnership(userId, edu.doctorId);
    return this.prisma.education.update({ where: { id }, data: dto });
  }

  async deleteEducation(userId: number, id: string) {
    const edu = await this.prisma.education.findUnique({ where: { id } });
    if (!edu) throw new NotFoundException("Ta'lim yozuvi topilmadi");
    await this.verifyOwnership(userId, edu.doctorId);
    await this.prisma.education.delete({ where: { id } });
    return { message: "O'chirildi" };
  }

  // ─── WorkExperience CRUD ────────────────────────────────────────────────────

  async addExperience(userId: number, dto: CreateExperienceDto) {
    const doctorId = await this.getDoctorProfileId(userId);
    return this.prisma.workExperience.create({
      data: { doctorId, ...dto },
    });
  }

  async updateExperience(userId: number, id: string, dto: Partial<CreateExperienceDto>) {
    const exp = await this.prisma.workExperience.findUnique({ where: { id } });
    if (!exp) throw new NotFoundException('Tajriba yozuvi topilmadi');
    await this.verifyOwnership(userId, exp.doctorId);
    return this.prisma.workExperience.update({ where: { id }, data: dto });
  }

  async deleteExperience(userId: number, id: string) {
    const exp = await this.prisma.workExperience.findUnique({ where: { id } });
    if (!exp) throw new NotFoundException('Tajriba yozuvi topilmadi');
    await this.verifyOwnership(userId, exp.doctorId);
    await this.prisma.workExperience.delete({ where: { id } });
    return { message: "O'chirildi" };
  }

  // ─── Achievement CRUD ───────────────────────────────────────────────────────

  async addAchievement(userId: number, dto: CreateAchievementDto) {
    const doctorId = await this.getDoctorProfileId(userId);
    return this.prisma.achievement.create({
      data: { doctorId, ...dto },
    });
  }

  async updateAchievement(userId: number, id: string, dto: Partial<CreateAchievementDto>) {
    const ach = await this.prisma.achievement.findUnique({ where: { id } });
    if (!ach) throw new NotFoundException('Yutuq topilmadi');
    await this.verifyOwnership(userId, ach.doctorId);
    return this.prisma.achievement.update({ where: { id }, data: dto });
  }

  async deleteAchievement(userId: number, id: string) {
    const ach = await this.prisma.achievement.findUnique({ where: { id } });
    if (!ach) throw new NotFoundException('Yutuq topilmadi');
    await this.verifyOwnership(userId, ach.doctorId);
    await this.prisma.achievement.delete({ where: { id } });
    return { message: "O'chirildi" };
  }

  // ─── Certificate CRUD ──────────────────────────────────────────────────────

  async addCertificate(userId: number, dto: CreateCertificateDto) {
    const doctorId = await this.getDoctorProfileId(userId);
    return this.prisma.certificate.create({
      data: {
        doctorId,
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async updateCertificate(userId: number, id: string, dto: Partial<CreateCertificateDto>) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Sertifikat topilmadi');
    await this.verifyOwnership(userId, cert.doctorId);
    return this.prisma.certificate.update({
      where: { id },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async deleteCertificate(userId: number, id: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Sertifikat topilmadi');
    await this.verifyOwnership(userId, cert.doctorId);
    await this.prisma.certificate.delete({ where: { id } });
    return { message: "O'chirildi" };
  }
}
