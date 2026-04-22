import { Test } from '@nestjs/testing';
import { RadiologyService } from '../radiology.service';
import { PrismaService } from '../../config/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('RadiologyService', () => {
  let service: RadiologyService;
  let prisma: {
    application: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    fileRecord: { create: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      application: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      fileRecord: { create: jest.fn() },
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
    };
    const module = await Test.createTestingModule({
      providers: [
        RadiologyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(RadiologyService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create: scanType majburiy', async () => {
    await expect(
      service.create({ scanType: '', price: 100_000 } as any, 42),
    ).rejects.toThrow(BadRequestException);
  });

  it('create: AI_RADIOLOG default serviceType', async () => {
    prisma.application.create.mockResolvedValue({ id: 1 });
    await service.create({ scanType: 'CT', price: 100_000 } as any, 42);
    expect(prisma.application.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          serviceType: 'AI_RADIOLOG',
          patientId: 42,
          scanType: 'CT',
        }),
      }),
    );
  });

  it('assign: faqat admin → Forbidden boshqa role uchun', async () => {
    await expect(
      service.assign(1, { radiologistId: 5 }, 42, 'PATIENT'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('findOne: non-radiology serviceType → NotFound', async () => {
    prisma.application.findUnique.mockResolvedValue({
      id: 1,
      patientId: 42,
      serviceType: 'HOME_VISIT',
    });
    await expect(service.findOne(1, 42, 'PATIENT')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('uploadStudy: tayinlanmagan radiolog → Forbidden', async () => {
    prisma.application.findUnique.mockResolvedValue({
      id: 1,
      radiologId: 99,
      patientId: 42,
      serviceType: 'AI_RADIOLOG',
    });
    await expect(
      service.uploadStudy(
        1,
        {
          bucket: 'b',
          path: 'p',
          mimeType: 'image/png',
          sizeBytes: 100,
          originalName: 'f.png',
        },
        42,
        'RADIOLOG',
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
