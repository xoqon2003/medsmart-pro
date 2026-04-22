import { Test } from '@nestjs/testing';
import { TgAuthService } from '../tg-auth.service';
import { PrismaService } from '../../config/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('@medsmart/tg-auth', () => ({
  verifyInitData: jest.fn(),
}));

import { verifyInitData } from '@medsmart/tg-auth';

describe('TgAuthService', () => {
  let service: TgAuthService;
  let prisma: { user: { upsert: jest.Mock } };
  let jwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue({
          id: 7,
          name: 'Ali',
          role: 'PATIENT',
        }),
      },
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('jwt-xyz') };

    const module = await Test.createTestingModule({
      providers: [
        TgAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(TgAuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('valid initData → upsert + JWT', async () => {
    (verifyInitData as jest.Mock).mockReturnValue({
      ok: true,
      user: { id: 42, first_name: 'Ali' },
    });
    const res = await service.loginFromInitData('raw-init-data');
    expect(res.token).toBe('jwt-xyz');
    expect(prisma.user.upsert).toHaveBeenCalled();
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 7, role: 'PATIENT', src: 'tg' }),
    );
  });

  it('expired initData → Unauthorized', async () => {
    (verifyInitData as jest.Mock).mockReturnValue({
      ok: false,
      reason: 'expired',
    });
    await expect(service.loginFromInitData('x')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('hash_mismatch → Unauthorized', async () => {
    (verifyInitData as jest.Mock).mockReturnValue({
      ok: false,
      reason: 'hash_mismatch',
    });
    await expect(service.loginFromInitData('x')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
