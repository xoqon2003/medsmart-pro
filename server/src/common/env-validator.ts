/**
 * Environment variables validator
 *
 * App bootstrap boshida muhit o'zgaruvchilarini tekshiradi.
 * Xavfli yoki default qiymatlar aniqlansa — app startup'da darhol to'xtaydi.
 *
 * Maqsad: Production deploy'da default/placeholder sirlar ishlatilmasligini kafolatlash.
 */

import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidator');

const MIN_SECRET_LENGTH = 32;

/**
 * Default/placeholder qiymatlarning marker bo'laklari.
 * Agar sir shulardan birini o'z ichiga olsa — u haqiqiy emas deb qaraymiz.
 */
const INSECURE_MARKERS = [
  'change-in-production',
  'YOUR_',
  'your-secret',
  'medsmart-pro-jwt-secret',
];

function isInsecureValue(value: string | undefined): boolean {
  if (!value) return true;
  return INSECURE_MARKERS.some((marker) =>
    value.toLowerCase().includes(marker.toLowerCase()),
  );
}

/**
 * Muhim muhit o'zgaruvchilarini tekshirish.
 * Agar biror muammo topilsa — process.exit(1).
 */
export function validateEnv(): void {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // ─── JWT_SECRET ──────────────────────────────────────────────────────
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.trim() === '') {
    errors.push(
      "JWT_SECRET o'rnatilmagan. .env faylga xavfsiz tasodifiy kalit qo'shing " +
        "(min 32 belgi, masalan: `openssl rand -base64 48`).",
    );
  } else if (isInsecureValue(jwtSecret)) {
    errors.push(
      "JWT_SECRET default/placeholder qiymatda! " +
        "Buni xavfsiz tasodifiy kalit bilan almashtiring: `openssl rand -base64 48`.",
    );
  } else if (jwtSecret.length < MIN_SECRET_LENGTH) {
    const msg =
      `JWT_SECRET juda qisqa (${jwtSecret.length} belgi). ` +
      `Tavsiya: kamida ${MIN_SECRET_LENGTH} belgi (HMAC-SHA256 uchun 256 bit).`;
    if (isProduction) errors.push(msg);
    else warnings.push(msg);
  }

  // ─── Natija ──────────────────────────────────────────────────────────
  if (warnings.length > 0) {
    warnings.forEach((w) => logger.warn(w));
  }

  if (errors.length > 0) {
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error("Muhit o'zgaruvchilari validatsiyasi MUVAFFAQIYATSIZ:");
    errors.forEach((e) => logger.error(`  ✗ ${e}`));
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }

  logger.log('Muhit o\'zgaruvchilari validatsiyasi muvaffaqiyatli');
}
