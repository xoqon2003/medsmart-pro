import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const FEATURE_FLAG_KEY = 'featureFlag';

/**
 * Controller yoki metod ustidagi dekorator. Qaysi `process.env` flag qiymati
 * `'true'` bo'lganida endpoint ishlashini belgilaydi. Flag kontroller darajasida
 * qo'yilsa butun controllerga ta'sir qiladi; metod darajasida qo'yilsa faqat
 * shu metodga. Agar flag `'true'` bo'lmasa — `FeatureFlagGuard` 404 qaytaradi.
 *
 * Namuna: `@FeatureFlag('APP_FEATURE_DISEASE_KB')`
 */
export const FeatureFlag = (envKey: string) => SetMetadata(FEATURE_FLAG_KEY, envKey);

/**
 * Feature flag guard — berilgan env o'zgaruvchi `'true'` bo'lmasa endpointni
 * mavjud emas deb (`404`) qaytaradi. Bu shablon CLAUDE.md §Loyiha qoidalari.5
 * bo'yicha yangi modullar `false` bilan prod'ga chiqishi uchun.
 *
 * Controller yoki metod ustida `@FeatureFlag('APP_FEATURE_X')` + `@UseGuards(FeatureFlagGuard)`
 * bilan ishlatiladi.
 */
@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const envKey = this.reflector.getAllAndOverride<string | undefined>(FEATURE_FLAG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Agar dekorator umuman ishlatilmagan bo'lsa — guardni shartsiz o'tkazamiz
    // (bu holat noto'g'ri sozlash, lekin crash emas).
    if (!envKey) return true;

    if (process.env[envKey] !== 'true') {
      throw new NotFoundException('Not Found');
    }
    return true;
  }
}
