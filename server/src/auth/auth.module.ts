import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';
import { TelegramValidator } from './telegram.validator';
import { SmsModule } from '../sms/sms.module';

/**
 * @Global — JwtGuard, RolesGuard va JwtService ilovaning ixtiyoriy modulida
 * AuthModule ni qayta import qilmasdan ishlatilishi uchun. 20+ modul
 * JwtGuard ishlatadi, ularning har birini import qilish DI duplikatsiyasi
 * va test qilishda muammolar yaratardi.
 */
@Global()
@Module({
  imports: [
    JwtModule.register({
      // Weak fallback OLIB TASHLANDI. main.ts'dagi validateEnv() bootstrap boshida
      // JWT_SECRET mavjud va xavfsiz ekanligini kafolatlaydi.
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard, RolesGuard, TelegramValidator],
  exports: [AuthService, JwtGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
