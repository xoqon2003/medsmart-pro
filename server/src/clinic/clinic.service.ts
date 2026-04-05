import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class ClinicService {
  constructor(private prisma: PrismaService) {}

  async findAll(city?: string, region?: string) {
    const where: any = { isVerified: true };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (region) where.region = { contains: region, mode: 'insensitive' };

    return this.prisma.clinic.findMany({
      where,
      include: {
        _count: { select: { doctors: { where: { isVerified: true, isActive: true } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: {
        doctors: {
          where: { isVerified: true, isActive: true },
          include: {
            doctor: {
              include: {
                user: { select: { id: true, fullName: true, specialty: true, avatar: true } },
              },
            },
          },
        },
      },
    });
    if (!clinic) throw new NotFoundException('Klinika topilmadi');
    return clinic;
  }

  async create(dto: CreateClinicDto, role: string) {
    if (!['ADMIN'].includes(role))
      throw new ForbiddenException("Faqat admin klinika qo'sha oladi");

    return this.prisma.clinic.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateClinicDto>, role: string) {
    if (!['ADMIN'].includes(role))
      throw new ForbiddenException('Faqat admin tahrirlashi mumkin');

    const clinic = await this.prisma.clinic.findUnique({ where: { id } });
    if (!clinic) throw new NotFoundException('Klinika topilmadi');

    return this.prisma.clinic.update({ where: { id }, data: dto });
  }

  async verify(id: string, adminId: number) {
    const clinic = await this.prisma.clinic.findUnique({ where: { id } });
    if (!clinic) throw new NotFoundException('Klinika topilmadi');

    return this.prisma.clinic.update({
      where: { id },
      data: { isVerified: true, verifiedBy: adminId },
    });
  }
}

export interface CreateClinicDto {
  name: string;
  address: string;
  city?: string;
  region?: string;
  phone?: string;
  email?: string;
  website?: string;
}
