import { Test } from '@nestjs/testing';
import { HomeVisitService } from '../home-visit.service';
import { PrismaService } from '../../config/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AppStatus, ServiceType, Urgency } from '@prisma/client';
import type { CreateHomeVisitDto } from '../dto/create-home-visit.dto';
import type { UpdateHomeVisitDto } from '../dto/update-home-visit.dto';

type MockPrisma = {
  application: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe('HomeVisitService', () => {
  let service: HomeVisitService;
  let prisma: MockPrisma;

  beforeEach(async () => {
    prisma = {
      application: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(async (arg: Promise<unknown>[]) => {
        if (Array.isArray(arg)) return Promise.all(arg);
        throw new Error('Array form kutilgan edi');
      }),
    };
    const module = await Test.createTestingModule({
      providers: [
        HomeVisitService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(HomeVisitService);
  });

  afterEach(() => jest.clearAllMocks());

  it("create: manzil yo'q → BadRequest", async () => {
    const dto: CreateHomeVisitDto = { hvAddress: '', price: 100_000 };
    await expect(service.create(dto, 42)).rejects.toThrow(BadRequestException);
  });

  it('create: HOME_VISIT serviceType bilan saqlaydi', async () => {
    prisma.application.create.mockResolvedValue({ id: 1 });
    const dto: CreateHomeVisitDto = {
      hvAddress: 'Toshkent, Chilonzor 10',
      price: 150_000,
      urgency: Urgency.NORMAL,
    };
    await service.create(dto, 42);
    expect(prisma.application.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          serviceType: ServiceType.HOME_VISIT,
          patientId: 42,
          urgency: Urgency.NORMAL,
        }),
      }),
    );
  });

  it('list: paginated natija qaytaradi (items + total)', async () => {
    prisma.application.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    prisma.application.count.mockResolvedValue(2);
    const res = await service.list(42, 'PATIENT', undefined, 0, 10);
    expect(res).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      total: 2,
      skip: 0,
      take: 10,
    });
    expect(prisma.application.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
  });

  it('list: take > 100 → 100 ga cheklanadi', async () => {
    prisma.application.findMany.mockResolvedValue([]);
    prisma.application.count.mockResolvedValue(0);
    const res = await service.list(42, 'PATIENT', undefined, 0, 999);
    expect(res.take).toBe(100);
  });

  it('findOne: boshqa serviceType → NotFound', async () => {
    prisma.application.findUnique.mockResolvedValue({
      id: 1,
      patientId: 42,
      serviceType: ServiceType.AI_RADIOLOG,
    });
    await expect(service.findOne(1, 42, 'PATIENT')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findOne: boshqa patient → Forbidden', async () => {
    prisma.application.findUnique.mockResolvedValue({
      id: 1,
      patientId: 42,
      serviceType: ServiceType.HOME_VISIT,
      doctorId: null,
      specialistId: null,
    });
    await expect(service.findOne(1, 99, 'PATIENT')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("findOne: DOCTOR ko'ra oladi", async () => {
    prisma.application.findUnique.mockResolvedValue({
      id: 1,
      patientId: 42,
      serviceType: ServiceType.HOME_VISIT,
      doctorId: null,
      specialistId: null,
    });
    await expect(service.findOne(1, 99, 'DOCTOR')).resolves.toBeDefined();
  });

  it('update: owner statusni yangilay oladi', async () => {
    prisma.application.findUnique.mockResolvedValue({
      id: 1,
      patientId: 42,
      serviceType: ServiceType.HOME_VISIT,
    });
    prisma.application.update.mockResolvedValue({
      id: 1,
      status: AppStatus.HV_ARRIVED,
    });
    const dto: UpdateHomeVisitDto = { status: AppStatus.HV_ARRIVED };
    const res = await service.update(1, dto, 42, 'PATIENT');
    expect(res.status).toBe(AppStatus.HV_ARRIVED);
    expect(prisma.application.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: AppStatus.HV_ARRIVED },
    });
  });

  it('update: begona foydalanuvchi → Forbidden', async () => {
    prisma.application.findUnique.mockResolvedValue({
      id: 1,
      patientId: 42,
      serviceType: ServiceType.HOME_VISIT,
    });
    const dto: UpdateHomeVisitDto = { notes: 'hack' };
    await expect(service.update(1, dto, 99, 'PATIENT')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('update: boshqa serviceType → NotFound', async () => {
    prisma.application.findUnique.mockResolvedValue({
      id: 1,
      patientId: 42,
      serviceType: ServiceType.AI_RADIOLOG,
    });
    const dto: UpdateHomeVisitDto = { notes: 'x' };
    await expect(service.update(1, dto, 42, 'PATIENT')).rejects.toThrow(
      NotFoundException,
    );
  });
});
