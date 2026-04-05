import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';
import { RolesGuard } from './roles.guard';
import { TelegramValidator } from './telegram.validator';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'medsmart-pro-jwt-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard, RolesGuard, TelegramValidator],
  exports: [AuthService, JwtGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
