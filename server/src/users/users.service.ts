import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CacheService } from '../cache/cache.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findAll(role?: string) {
    const where = role ? { role: role.toUpperCase() as UserRole } : {};
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        telegramId: true,
        username: true,
        phone: true,
        fullName: true,
        role: true,
        gender: true,
        birthDate: true,
        city: true,
        language: true,
        isActive: true,
        avatar: true,
        specialty: true,
        experience: true,
        rating: true,
        totalConclusions: true,
        createdAt: true,
      },
    });
  }

  async findById(id: number) {
    const cached = await this.cache.getUser(id);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        telegramId: true,
        username: true,
        phone: true,
        fullName: true,
        role: true,
        gender: true,
        birthDate: true,
        city: true,
        chronicDiseases: true,
        language: true,
        isActive: true,
        avatar: true,
        license: true,
        specialty: true,
        experience: true,
        rating: true,
        totalConclusions: true,
        createdAt: true,
      },
    });

    if (user) await this.cache.setUser(id, user);
    return user;
  }

  async update(id: number, data: any) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });
    await this.cache.invalidateUser(id);
    return user;
  }
}
