import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TgAuthController } from './tg-auth.controller';
import { TgAuthService } from './tg-auth.service';

/**
 * JWT_SECRET main.ts (bootstrap) da validateEnv() orqali tekshiriladi —
 * process boshlanishida majburiy. Shuning uchun bu yerda `process.env.JWT_SECRET!`
 * ishlatish xavfsiz: agar o'rnatilmagan bo'lsa, app shu nuqtaga yetib kelmagan bo'lardi.
 * Hech qanday hardcoded "dev-insecure-secret" fallback YO'Q.
 */
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  // Defensive guard: normalda validateEnv() da to'xtaydi, bu shunchaki qo'shimcha sug'urta
  throw new Error(
    'JWT_SECRET env variable majburiy. .env faylga qo\'shing: `openssl rand -base64 48`',
  );
}

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [TgAuthController],
  providers: [TgAuthService],
  exports: [TgAuthService],
})
export class TgAuthModule {}
