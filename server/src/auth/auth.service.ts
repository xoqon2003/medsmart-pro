import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../config/prisma.service';
import { SmsService } from '../sms/sms.service';
import { TelegramValidator, TelegramUser } from './telegram.validator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private sms: SmsService,
    private telegramValidator: TelegramValidator,
  ) {}

  // ── Telegram Mini App Auth ──────────────────────────────────────────────

  async telegramAuth(initData: string) {
    const tgUser: TelegramUser = this.telegramValidator.validate(initData);

    // Foydalanuvchini Telegram ID bo'yicha qidirish
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(tgUser.id) },
    });

    if (!user) {
      // Yangi foydalanuvchi yaratish (PATIENT rolida)
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(tgUser.id),
          username: tgUser.username || null,
          fullName: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
          phone: `tg_${tgUser.id}`, // Telegram orqali kelganlar uchun vaqtinchalik
          role: 'PATIENT',
          language: tgUser.language_code === 'ru' ? 'RU' : 'UZ',
        },
      });
    }

    const tokens = await this.generateTokenPair(user.id, user.role);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
      isNewUser: !user.phone || user.phone.startsWith('tg_'),
    };
  }

  // ── OTP Yuborish ────────────────────────────────────────────────────────

  async sendOtp(phone: string) {
    // Rate limiting: oxirgi 1 daqiqa ichida yuborilgan OTP bormi
    const recentOtp = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      throw new BadRequestException('OTP allaqachon yuborildi. 1 daqiqadan keyin qayta urinib ko\'ring');
    }

    // Eski OTP larni o'chirish
    await this.prisma.otpCode.deleteMany({ where: { phone } });

    // Yangi 6 xonali OTP yaratish
    const code = crypto.randomInt(100000, 999999).toString();

    // OTP ni DB ga saqlash (5 daqiqa amal muddati)
    await this.prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // SMS orqali yuborish
    await this.sms.sendOtp(phone, code);

    return {
      message: 'OTP yuborildi',
      phone,
      expiresIn: 300, // 5 daqiqa (soniyalarda)
    };
  }

  // ── OTP Tekshirish va Login ─────────────────────────────────────────────

  async verifyOtp(phone: string, otp: string) {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('OTP topilmadi yoki muddati tugagan');
    }

    if (otpRecord.attempts >= 3) {
      await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });
      throw new UnauthorizedException('Juda ko\'p urinish. Yangi OTP so\'rang');
    }

    if (otpRecord.code !== otp) {
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      throw new UnauthorizedException("Noto'g'ri OTP kod");
    }

    // OTP to'g'ri — o'chirib tashlaymiz
    await this.prisma.otpCode.delete({ where: { id: otpRecord.id } });

    // Foydalanuvchini topish yoki yaratish
    let user = await this.prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      // Yangi foydalanuvchi (keyin profil to'ldiriladi)
      user = await this.prisma.user.create({
        data: {
          phone,
          fullName: '',
          role: 'PATIENT',
        },
      });
    }

    const tokens = await this.generateTokenPair(user.id, user.role);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
      isNewUser,
      needsPin: !user.pin,
    };
  }

  // ── PIN O'rnatish ───────────────────────────────────────────────────────

  async setPin(phone: string, pin: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { pin: hashedPin },
    });

    return { message: 'PIN kod muvaffaqiyatli o\'rnatildi' };
  }

  // ── PIN bilan Login (Web Platform) ──────────────────────────────────────

  async login(phone: string, pin: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    if (!user.pin) {
      throw new UnauthorizedException('PIN kod belgilanmagan. Avval OTP orqali kiring');
    }

    const isValid = await bcrypt.compare(pin, user.pin);
    if (!isValid) {
      throw new UnauthorizedException("Noto'g'ri PIN kod");
    }

    const tokens = await this.generateTokenPair(user.id, user.role);
    return { ...tokens, user: this.sanitizeUser(user) };
  }

  // ── Refresh Token ───────────────────────────────────────────────────────

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token topilmadi');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
      throw new UnauthorizedException('Refresh token muddati tugagan');
    }

    // Eski tokenni o'chirish (rotation)
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    // Yangi token juftligini yaratish
    const tokens = await this.generateTokenPair(tokenRecord.user.id, tokenRecord.user.role);
    return { ...tokens, user: this.sanitizeUser(tokenRecord.user) };
  }

  // ── Bemor Ro'yxatdan O'tishi ────────────────────────────────────────────

  async registerPatient(data: { phone: string; fullName: string; gender?: string; birthDate?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) {
      throw new ConflictException('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan');
    }

    const user = await this.prisma.user.create({
      data: {
        phone: data.phone,
        fullName: data.fullName,
        role: 'PATIENT',
        gender: data.gender === 'MALE' ? 'MALE' : data.gender === 'FEMALE' ? 'FEMALE' : undefined,
        birthDate: data.birthDate || null,
      },
    });

    return { message: 'Ro\'yxatdan o\'tdingiz', user: this.sanitizeUser(user) };
  }

  // ── Joriy Foydalanuvchi ─────────────────────────────────────────────────

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }
    return this.sanitizeUser(user);
  }

  // ── Chiqish (Logout) ───────────────────────────────────────────────────

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return { message: 'Muvaffaqiyatli chiqildi' };
  }

  // ── Token Yaratish ──────────────────────────────────────────────────────

  private async generateTokenPair(userId: number, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, role },
      { expiresIn: '7d' },
    );

    const refreshTokenStr = crypto.randomBytes(64).toString('hex');

    // Eski refresh tokenlarni tozalash (har user uchun max 5 ta)
    const existingTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (existingTokens.length >= 5) {
      const toDelete = existingTokens.slice(4).map((t) => t.id);
      await this.prisma.refreshToken.deleteMany({ where: { id: { in: toDelete } } });
    }

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenStr,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 kun
      },
    });

    return { accessToken, refreshToken: refreshTokenStr };
  }

  private sanitizeUser(user: any) {
    const { pin, ...rest } = user;
    // BigInt ni string ga aylantirish (JSON serialization uchun)
    if (rest.telegramId) {
      rest.telegramId = rest.telegramId.toString();
    }
    return rest;
  }
}
