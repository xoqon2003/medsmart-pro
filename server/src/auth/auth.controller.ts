import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';
import {
  SendOtpDto,
  VerifyOtpDto,
  LoginDto,
  SetPinDto,
  TelegramAuthDto,
  RefreshTokenDto,
  RegisterPatientDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Telegram Mini App orqali autentifikatsiya
   * POST /api/v1/auth/telegram
   */
  @Post('telegram')
  async telegramAuth(@Body() dto: TelegramAuthDto) {
    return this.authService.telegramAuth(dto.initData);
  }

  /**
   * OTP kod yuborish (SMS orqali)
   * POST /api/v1/auth/send-otp
   */
  @Post('send-otp')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  /**
   * OTP kodni tekshirish va login
   * POST /api/v1/auth/verify-otp
   */
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  /**
   * PIN kod o'rnatish (OTP tasdiqlangandan keyin)
   * POST /api/v1/auth/set-pin
   */
  @Post('set-pin')
  async setPin(@Body() dto: SetPinDto) {
    return this.authService.setPin(dto.phone, dto.pin);
  }

  /**
   * PIN kod bilan login (Web Platform)
   * POST /api/v1/auth/login
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.pin);
  }

  /**
   * Token yangilash (Refresh)
   * POST /api/v1/auth/refresh
   */
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  /**
   * Yangi bemor ro'yxatdan o'tishi
   * POST /api/v1/auth/register-patient
   */
  @Post('register-patient')
  async registerPatient(@Body() dto: RegisterPatientDto) {
    return this.authService.registerPatient(dto);
  }

  /**
   * Joriy foydalanuvchi ma'lumoti
   * GET /api/v1/auth/me
   */
  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.sub);
  }

  /**
   * Chiqish (Logout)
   * POST /api/v1/auth/logout
   */
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }
}
