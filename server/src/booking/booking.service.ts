import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CacheService } from '../cache/cache.service';
import { UserRole } from '@prisma/client';

const SPECIALTIES = [
  'Kardiolog', 'Nevrolog', 'Ortoped', 'Terapevt', 'Pediatr',
  'Ginekolog', 'Urolog', 'Dermatolog', 'Oftalmolog', 'LOR',
];

const GEO = [
  {
    region: 'Toshkent',
    districts: [
      { name: 'Chilonzor', clinics: ['MedLine Chilonzor', 'City Med Plus'] },
      { name: 'Yunusobod', clinics: ['Yunusobod Med', 'Premium Clinic'] },
      { name: 'Mirzo Ulug\'bek', clinics: ['Central Hospital', 'MedStar'] },
    ],
  },
  {
    region: 'Samarqand',
    districts: [
      { name: 'Samarqand shahar', clinics: ['Samarqand Med Center', 'Al-Xorazmiy klinikasi'] },
    ],
  },
];

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getDoctors(filters?: { query?: string; specialties?: string[] }) {
    const where: any = {
      role: UserRole.DOCTOR,
      isActive: true,
    };

    if (filters?.specialties?.length) {
      where.specialty = { in: filters.specialties };
    }

    const doctors = await this.prisma.user.findMany({
      where,
      select: {
        id: true, fullName: true, specialty: true, experience: true,
        rating: true, avatar: true, totalConclusions: true, city: true,
      },
    });

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      return doctors.filter(d =>
        d.fullName.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q),
      );
    }

    return doctors;
  }

  async getSlots(doctorId: number, date: string) {
    const hours = Array.from({ length: 17 }, (_, i) => {
      const h = Math.floor(i / 2) + 9;
      const m = i % 2 === 0 ? '00' : '30';
      return `${String(h).padStart(2, '0')}:${m}`;
    });

    const booked = await this.prisma.bookingSlot.findMany({
      where: { doctorId, date, status: 'busy' },
    });
    const busyTimes = new Set(booked.map(b => b.time));

    const slots: Record<string, 'free' | 'busy'> = {};
    for (const time of hours) {
      const hash = (doctorId * 31 + date.charCodeAt(5) * 17 + parseInt(time.replace(':', ''))) % 7;
      slots[time] = busyTimes.has(time) || hash === 0 ? 'busy' : 'free';
    }
    return slots;
  }

  async getGeo() {
    const cached = await this.cache.getGeo();
    if (cached) return cached;

    await this.cache.setGeo(GEO);
    return GEO;
  }

  async getSpecialties() {
    const cached = await this.cache.getSpecialties();
    if (cached) return cached;

    await this.cache.setSpecialties(SPECIALTIES);
    return SPECIALTIES;
  }

  /* ── TT-001: Klinika qidiruv ── */

  async searchClinics(filters: {
    q?: string;
    region?: string;
    district?: string;
    minServices?: number;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { address: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.region) {
      where.region = filters.region;
    }

    if (filters.district) {
      where.city = filters.district;
    }

    if (filters.minServices) {
      where.servicesCount = { gte: filters.minServices };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.clinic.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isTop: 'desc' }, { rating: 'desc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          address: true,
          region: true,
          city: true,
          servicesCount: true,
          rating: true,
          logoUrl: true,
          isTop: true,
          description: true,
          _count: { select: { doctors: true } },
        },
      }),
      this.prisma.clinic.count({ where }),
    ]);

    return {
      data: data.map(c => ({
        ...c,
        doctorsCount: c._count.doctors,
        _count: undefined,
      })),
      total,
      page,
      limit,
    };
  }

  async getNearbyClinics(lat: number, lng: number, radius: number = 10) {
    // Haversine formula orqali yaqin klinikalarni topish
    // PostgreSQL da raw SQL bilan
    const radiusKm = radius;
    const clinics = await this.prisma.$queryRaw<any[]>`
      SELECT
        id, name, address, region, city, "servicesCount", rating,
        "logoUrl", "isTop", description, latitude, longitude,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(latitude))
        )) AS distance
      FROM "Clinic"
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      HAVING distance <= ${radiusKm}
      ORDER BY distance ASC
      LIMIT 20
    `;

    return clinics;
  }

  async getTopClinics(limit: number = 10) {
    const now = new Date();
    const data = await this.prisma.clinic.findMany({
      where: {
        isTop: true,
        OR: [
          { topExpiresAt: null },
          { topExpiresAt: { gt: now } },
        ],
      },
      orderBy: { topPriority: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        address: true,
        region: true,
        city: true,
        servicesCount: true,
        rating: true,
        logoUrl: true,
        isTop: true,
        description: true,
        _count: { select: { doctors: true } },
      },
    });

    return data.map(c => ({
      ...c,
      doctorsCount: c._count.doctors,
      _count: undefined,
    }));
  }
}
