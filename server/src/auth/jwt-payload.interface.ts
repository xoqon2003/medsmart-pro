/**
 * JWT payload interfeysi — token ichidagi ma'lumotlar tuzilishi.
 * JwtGuard va boshqa guard/service larda ishlatiladi.
 */
export interface JwtPayload {
  /** Foydalanuvchi ID (standard JWT "subject" maydoni) */
  sub: number;
  /** Foydalanuvchi roli — UserRole enum qiymatlari (masalan: 'PATIENT', 'ADMIN') */
  role: string;
  /** Issued At — token yaratilgan vaqt (Unix timestamp) */
  iat?: number;
  /** Expiration — token muddati tugash vaqti (Unix timestamp) */
  exp?: number;
}
