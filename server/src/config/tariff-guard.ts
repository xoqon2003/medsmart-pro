import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './prisma.service';

/**
 * Tarif feature flag tekshiruv guard.
 * Controller/handler'da @RequireFeature('hasCalendar') deb ishlatiladi.
 */
export const FEATURE_KEY = 'requiredFeature';

export function RequireFeature(feature: string) {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(FEATURE_KEY, feature, descriptor?.value ?? target);
    return descriptor ?? target;
  };
}

@Injectable()
export class TariffGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<string>(FEATURE_KEY, context.getHandler());
    if (!feature) return true; // no feature requirement

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    if (!userId) return true; // not authenticated, let other guards handle

    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      include: { tariff: true },
    });

    if (!profile || !profile.tariff) {
      throw new ForbiddenException('Tarif tanlanmagan. Iltimos tarif tanlang.');
    }

    const features = profile.tariff.features as Record<string, any>;
    if (!features) {
      throw new ForbiddenException('Tarif xususiyatlari aniqlanmadi');
    }

    // Boolean feature check (hasCalendar, hasPortfolio, etc.)
    if (features[feature] === false) {
      throw new ForbiddenException(
        `Bu funksiya sizning tarifingizda mavjud emas. Tarifni yangilang.`
      );
    }

    return true;
  }
}

/**
 * Tarif limiti tekshiruv service.
 * Service'larda qo'lda chaqiriladi: await tariffLimitService.checkLimit(userId, 'faq', 'faqLimit')
 */
@Injectable()
export class TariffLimitService {
  constructor(private prisma: PrismaService) {}

  async checkLimit(userId: number, entity: 'faq' | 'services' | 'patients', limitKey: string): Promise<void> {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      include: { tariff: true },
    });

    if (!profile?.tariff) {
      throw new ForbiddenException('Tarif tanlanmagan');
    }

    const features = profile.tariff.features as Record<string, any>;
    const limit = features[limitKey];

    // -1 = unlimited
    if (limit === -1 || limit === undefined) return;

    let currentCount = 0;

    if (entity === 'faq') {
      currentCount = await this.prisma.fAQ.count({ where: { doctorId: profile.id, isActive: true } });
    } else if (entity === 'services') {
      currentCount = await this.prisma.medicalService.count({ where: { doctorId: profile.id, isActive: true } });
    } else if (entity === 'patients') {
      currentCount = await this.prisma.consultationRequest.count({
        where: { doctorId: profile.id, status: { not: 'CANCELLED' } },
      });
    }

    if (currentCount >= limit) {
      throw new ForbiddenException(
        `Tarif limitiga yetdingiz (${currentCount}/${limit}). Tarifni yangilang.`
      );
    }
  }
}
