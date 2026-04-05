import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SmsService } from '../src/sms/sms.service';
import { TelegramValidator } from '../src/auth/telegram.validator';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

// Mock PrismaService
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  otpCode: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn(),
};

const mockSms = {
  sendOtp: jest.fn().mockResolvedValue(true),
};

const mockTelegramValidator = {
  validate: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: SmsService, useValue: mockSms },
        { provide: TelegramValidator, useValue: mockTelegramValidator },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('yangi telefon raqamga OTP yuborishi kerak', async () => {
      mockPrisma.otpCode.findFirst.mockResolvedValue(null);
      mockPrisma.otpCode.create.mockResolvedValue({ id: '1', phone: '+998901234567', code: '123456' });

      const result = await service.sendOtp('+998901234567');
      expect(result).toHaveProperty('message');
      expect(mockSms.sendOtp).toHaveBeenCalled();
    });

    it('1 daqiqa ichida qayta OTP yuborilmasligi kerak', async () => {
      mockPrisma.otpCode.findFirst.mockResolvedValue({
        id: '1',
        createdAt: new Date(), // hozirgi vaqt
      });

      await expect(service.sendOtp('+998901234567')).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyOtp', () => {
    it("noto'g'ri OTP da xato qaytarishi kerak", async () => {
      mockPrisma.otpCode.findFirst.mockResolvedValue({
        id: '1',
        phone: '+998901234567',
        code: '123456',
        attempts: 0,
        expiresAt: new Date(Date.now() + 300000),
      });

      await expect(service.verifyOtp('+998901234567', '000000')).rejects.toThrow();
    });

    it("to'g'ri OTP da token qaytarishi kerak", async () => {
      mockPrisma.otpCode.findFirst.mockResolvedValue({
        id: '1',
        phone: '+998901234567',
        code: '123456',
        attempts: 0,
        expiresAt: new Date(Date.now() + 300000),
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, role: 'PATIENT', phone: '+998901234567', fullName: 'Test' });
      mockPrisma.otpCode.delete.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({ token: 'refresh-token' });
      mockPrisma.refreshToken.count.mockResolvedValue(1);

      const result = await service.verifyOtp('+998901234567', '123456');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('login', () => {
    it('mavjud bo\'lmagan foydalanuvchi uchun xato qaytarishi kerak', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login('+998901234567', '1234')).rejects.toThrow(UnauthorizedException);
    });
  });
});
