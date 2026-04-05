import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { CacheService } from '../cache/cache.service';
import { TariffCode } from '@prisma/client';
import { CreateTariffDto } from './dto';

// TZ-01 bo'yicha boshlang'ich tarif feature flaglari
const DEFAULT_FEATURES: Record<TariffCode, object> = {
  FREE: {
    maxPatients: 3,
    hasPortfolio: false,
    hasCalendar: false,
    hasFaq: false,
    faqLimit: 0,
    hasServices: false,
    servicesLimit: 0,
    hasMessaging: false,
    hasAnonymousNumber: false,
    hasTelegramBot: false,
    showAds: true,
    canChangeTemplate: false,
    profileUrl: false,
    setupLimit: 0,
    callTimeLimit: false,
  },
  START: {
    maxPatients: 50,
    hasPortfolio: true,
    portfolioType: 'basic',
    hasCalendar: true,
    hasFaq: true,
    faqLimit: 3,
    hasServices: true,
    servicesLimit: 5,
    hasMessaging: true,
    hasAnonymousNumber: false,
    hasTelegramBot: false,
    showAds: true,
    adsReduced: true,
    canChangeTemplate: true,
    templateChangesPerMonth: 2,
    profileUrl: true,
    setupLimit: 1,
    callTimeLimit: false,
  },
  LITE: {
    maxPatients: 200,
    hasPortfolio: true,
    portfolioType: 'full',
    hasCalendar: true,
    hasFaq: true,
    faqLimit: -1,
    hasServices: true,
    servicesLimit: 20,
    hasMessaging: true,
    hasAnonymousNumber: false,
    hasTelegramBot: true,
    showAds: true,
    adsMinimal: true,
    canChangeTemplate: true,
    profileUrl: true,
    setupLimit: 2,
    callTimeLimit: true,
  },
  PREMIUM: {
    maxPatients: -1,
    hasPortfolio: true,
    portfolioType: 'full',
    hasCalendar: true,
    hasFaq: true,
    faqLimit: -1,
    hasServices: true,
    servicesLimit: -1,
    hasMessaging: true,
    hasAnonymousNumber: true,
    hasTelegramBot: true,
    showAds: false,
    canChangeTemplate: true,
    profileUrl: true,
    profileUrlCustom: true,
    setupLimit: -1,
    callTimeLimit: true,
  },
};

@Injectable()
export class TariffService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findAll() {
    const cached = await this.cache.getTariffs();
    if (cached) return cached;

    const tariffs = await this.prisma.tariff.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    await this.cache.setTariffs(tariffs);
    return tariffs;
  }

  async findById(id: string) {
    const tariff = await this.prisma.tariff.findUnique({ where: { id } });
    if (!tariff) throw new NotFoundException('Tarif topilmadi');
    return tariff;
  }

  async findByCode(code: TariffCode) {
    const tariff = await this.prisma.tariff.findUnique({ where: { code } });
    if (!tariff) throw new NotFoundException('Tarif topilmadi');
    return tariff;
  }

  async create(dto: CreateTariffDto, role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException('Faqat admin tarif yaratishi mumkin');
    const tariff = await this.prisma.tariff.create({ data: dto as any });
    await this.cache.invalidateTariffs();
    return tariff;
  }

  async update(id: string, dto: Partial<CreateTariffDto>, role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException('Faqat admin tarif tahrirlashi mumkin');
    const tariff = await this.prisma.tariff.findUnique({ where: { id } });
    if (!tariff) throw new NotFoundException('Tarif topilmadi');
    const updated = await this.prisma.tariff.update({ where: { id }, data: dto as any });
    await this.cache.invalidateTariffs();
    return updated;
  }

  // Boshlang'ich 4 ta tarif seed qilish (migration dan keyin bir marta chaqiriladi)
  async seed() {
    const existing = await this.prisma.tariff.count();
    if (existing > 0) return { message: 'Tariflar allaqachon mavjud' };

    const tariffs = [
      {
        code: TariffCode.FREE,
        name: "Bepul (Oddiy)",
        price: 0,
        sortOrder: 0,
        description: "Boshlang'ich tarif. Cheklangan imkoniyatlar.",
        features: DEFAULT_FEATURES.FREE,
      },
      {
        code: TariffCode.START,
        name: "Start",
        price: 99000,
        sortOrder: 1,
        description: "Kengaytirilgan imkoniyatlar. Kichik amaliyot uchun.",
        features: DEFAULT_FEATURES.START,
      },
      {
        code: TariffCode.LITE,
        name: "Lite",
        price: 199000,
        sortOrder: 2,
        description: "Ko'p bemorlar, portfolio, kalendar to'liq.",
        features: DEFAULT_FEATURES.LITE,
      },
      {
        code: TariffCode.PREMIUM,
        name: "Premium",
        price: 399000,
        sortOrder: 3,
        description: "Barcha imkoniyatlar. Anonim nomer va telegram bot.",
        features: DEFAULT_FEATURES.PREMIUM,
      },
    ];

    await this.prisma.tariff.createMany({ data: tariffs });
    return { message: "4 ta tarif yaratildi", count: 4 };
  }
}
