import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CacheService } from '../cache/cache.service';
import {
  CreateDoctorProfileDto,
  UpdateDoctorProfileDto,
  AddClinicDto,
  AddOperationTypeDto,
} from './dto';

@Injectable()
export class DoctorProfileService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  // ─── Public: barcha ochiq shifokorlar ───────────────────────────────────────

  async findAll(page = 1, limit = 20, specialty?: string) {
    const skip = (page - 1) * limit;
    const where: any = { isPublic: true };
    if (specialty) {
      where.user = { specialty };
    }

    const [items, total] = await Promise.all([
      this.prisma.doctorProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              specialty: true,
              avatar: true,
              isOnline: true,
            },
          },
          tariff: { select: { code: true, name: true } },
          clinics: {
            where: { isVerified: true, isActive: true },
            include: { clinic: { select: { id: true, name: true, city: true } } },
          },
        },
        orderBy: { averageRating: 'desc' },
      }),
      this.prisma.doctorProfile.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ─── Public: bitta shifokor profili (ID bo'yicha) ───────────────────────────

  async findById(id: string) {
    const cacheKey = `${CacheService.PREFIX.DOCTOR}${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const profile = await this.prisma.doctorProfile.findUnique({
      where: { id },
      include: this.publicIncludes(),
    });
    if (!profile) throw new NotFoundException('Shifokor profili topilmadi');
    if (!profile.isPublic) throw new ForbiddenException('Bu profil yopiq');

    await this.cache.set(cacheKey, profile, CacheService.TTL.DOCTOR);
    return profile;
  }

  // ─── Public: profil URL (slug) bo'yicha ─────────────────────────────────────

  async findBySlug(slug: string) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { profileUrl: slug },
      include: this.publicIncludes(),
    });
    if (!profile) throw new NotFoundException('Profil topilmadi');
    if (!profile.isPublic) throw new ForbiddenException('Bu profil yopiq');
    return profile;
  }

  // ─── Private: o'z profili ───────────────────────────────────────────────────

  async findMyProfile(userId: number) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      include: this.fullIncludes(),
    });
    if (!profile) throw new NotFoundException("Siz hali profil yaratamagansiz");
    return profile;
  }

  // ─── Profil yaratish ────────────────────────────────────────────────────────

  async create(userId: number, dto: CreateDoctorProfileDto) {
    const existing = await this.prisma.doctorProfile.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('Profil allaqachon mavjud');

    // Bepul tarif avtomatik
    const freeTariff = await this.prisma.tariff.findUnique({ where: { code: 'FREE' } });

    return this.prisma.doctorProfile.create({
      data: {
        userId,
        tariffId: freeTariff?.id,
        bio: dto.bio,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        experienceYears: dto.experienceYears ?? 0,
        subSpecialties: dto.subSpecialties ?? [],
        qualificationCategory: dto.qualificationCategory,
        licenseNumber: dto.licenseNumber,
        socialLinks: dto.socialLinks,
        profileUrl: dto.profileUrl,
        isPublic: dto.isPublic ?? true,
      },
      include: this.fullIncludes(),
    });
  }

  // ─── Profilni tahrirlash ────────────────────────────────────────────────────

  async update(userId: number, dto: UpdateDoctorProfileDto) {
    const profile = await this.prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profil topilmadi');

    // profileUrl uniq tekshiruvi
    if (dto.profileUrl && dto.profileUrl !== profile.profileUrl) {
      const taken = await this.prisma.doctorProfile.findUnique({
        where: { profileUrl: dto.profileUrl },
      });
      if (taken) throw new BadRequestException("Bu URL band, boshqa URL tanlang");
    }

    const updated = await this.prisma.doctorProfile.update({
      where: { userId },
      data: {
        bio: dto.bio,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        experienceYears: dto.experienceYears,
        subSpecialties: dto.subSpecialties,
        qualificationCategory: dto.qualificationCategory,
        socialLinks: dto.socialLinks,
        profileUrl: dto.profileUrl,
        isPublic: dto.isPublic,
      },
      include: this.fullIncludes(),
    });

    // Cache invalidate
    await this.cache.del(`${CacheService.PREFIX.DOCTOR}${profile.id}`);
    return updated;
  }

  // ─── Klinika qo'shish ───────────────────────────────────────────────────────

  async addClinic(userId: number, dto: AddClinicDto) {
    const profile = await this.getProfileOrThrow(userId);

    const clinic = await this.prisma.clinic.findUnique({ where: { id: dto.clinicId } });
    if (!clinic) throw new NotFoundException('Klinika topilmadi');

    const existing = await this.prisma.doctorClinic.findUnique({
      where: { doctorId_clinicId: { doctorId: profile.id, clinicId: dto.clinicId } },
    });
    if (existing) throw new BadRequestException('Bu klinika allaqachon qo\'shilgan');

    return this.prisma.doctorClinic.create({
      data: {
        doctorId: profile.id,
        clinicId: dto.clinicId,
        position: dto.position,
        department: dto.department,
        cabinet: dto.cabinet,
        floor: dto.floor,
      },
      include: { clinic: true },
    });
  }

  // ─── Klinika olib tashlash ──────────────────────────────────────────────────

  async removeClinic(userId: number, doctorClinicId: string) {
    const profile = await this.getProfileOrThrow(userId);
    const dc = await this.prisma.doctorClinic.findFirst({
      where: { id: doctorClinicId, doctorId: profile.id },
    });
    if (!dc) throw new NotFoundException('Klinika yozuvi topilmadi');
    await this.prisma.doctorClinic.delete({ where: { id: doctorClinicId } });
    return { message: "Klinika o'chirildi" };
  }

  // ─── Operatsiya turi qo'shish ───────────────────────────────────────────────

  async addOperationType(userId: number, dto: AddOperationTypeDto) {
    const profile = await this.getProfileOrThrow(userId);

    const existing = await this.prisma.doctorOperationType.findUnique({
      where: { doctorId_operationCode: { doctorId: profile.id, operationCode: dto.operationCode } },
    });
    if (existing) throw new BadRequestException('Bu operatsiya kodi allaqachon mavjud');

    return this.prisma.doctorOperationType.create({
      data: {
        doctorId: profile.id,
        operationCode: dto.operationCode,
        operationName: dto.operationName,
        operationNameRu: dto.operationNameRu,
        category: dto.category,
        complexity: dto.complexity ?? 'MEDIUM',
        avgDurationMin: dto.avgDurationMin,
        description: dto.description,
      },
    });
  }

  // ─── Statistika ─────────────────────────────────────────────────────────────

  async getStats(id: string) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { id },
      select: {
        totalConsultations: true,
        totalOperations: true,
        onlineConsultations: true,
        offlineConsultations: true,
        averageRating: true,
        totalRatings: true,
        overallRank: true,
        specialtyRank: true,
      },
    });
    if (!profile) throw new NotFoundException('Profil topilmadi');
    return profile;
  }

  // ─── Tarif o'zgartirish ─────────────────────────────────────────────────────

  async updateTariff(userId: number, tariffCode: string) {
    const profile = await this.getProfileOrThrow(userId);
    const tariff = await this.prisma.tariff.findUnique({
      where: { code: tariffCode as any },
    });
    if (!tariff) throw new NotFoundException('Tarif topilmadi');

    return this.prisma.doctorProfile.update({
      where: { id: profile.id },
      data: { tariffId: tariff.id },
      include: { tariff: true },
    });
  }

  // ─── Admin: klinika tasdiqlash ──────────────────────────────────────────────

  async verifyClinic(doctorClinicId: string, adminId: number) {
    const dc = await this.prisma.doctorClinic.findUnique({ where: { id: doctorClinicId } });
    if (!dc) throw new NotFoundException('Yozuv topilmadi');
    return this.prisma.doctorClinic.update({
      where: { id: doctorClinicId },
      data: { isVerified: true, verifiedBy: adminId },
    });
  }

  // ─── Admin: litsenziya tasdiqlash ───────────────────────────────────────────

  async verifyLicense(profileId: string, adminId: number) {
    return this.prisma.doctorProfile.update({
      where: { id: profileId },
      data: { licenseVerified: true },
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async getProfileOrThrow(userId: number) {
    const profile = await this.prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profil topilmadi');
    return profile;
  }

  private publicIncludes() {
    return {
      user: {
        select: {
          id: true,
          fullName: true,
          specialty: true,
          avatar: true,
          isOnline: true,
          lastSeenAt: true,
        },
      },
      tariff: { select: { code: true, name: true, features: true } },
      clinics: {
        where: { isVerified: true, isActive: true },
        include: { clinic: true },
      },
      operationTypes: true,
      education: { orderBy: { startYear: 'desc' as const } },
      workExperience: { orderBy: { startYear: 'desc' as const } },
      achievements: { orderBy: { year: 'desc' as const } },
      certificates: { orderBy: { year: 'desc' as const } },
    };
  }

  private fullIncludes() {
    return {
      user: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          specialty: true,
          avatar: true,
          isOnline: true,
          lastSeenAt: true,
          verificationStatus: true,
        },
      },
      tariff: true,
      clinics: { include: { clinic: true } },
      operationTypes: true,
      education: { orderBy: { startYear: 'desc' as const } },
      workExperience: { orderBy: { startYear: 'desc' as const } },
      achievements: { orderBy: { year: 'desc' as const } },
      certificates: { orderBy: { year: 'desc' as const } },
    };
  }
}
