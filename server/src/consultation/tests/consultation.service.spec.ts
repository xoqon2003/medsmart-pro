import { Test } from '@nestjs/testing';
import { ConsultationService } from '../consultation.service';
import { PrismaService } from '../../config/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

// Prisma $transaction callback signature — `any` ishlatmasdan mock qilish
type MockPrisma = {
  consultationRequest: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
  };
  calendarSlot: { findUnique: jest.Mock; update: jest.Mock };
  $transaction: jest.Mock;
};
type TxCallback<T> = (tx: MockPrisma) => Promise<T>;

describe('ConsultationService', () => {
  let service: ConsultationService;
  let prisma: MockPrisma;

  beforeEach(async () => {
    prisma = {
      consultationRequest: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      calendarSlot: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      // Array-form ($transaction([...])) va callback-form ikkovini qo'llab-quvvatlaymiz
      $transaction: jest.fn(
        async (arg: TxCallback<unknown> | Promise<unknown>[]) => {
          if (Array.isArray(arg)) return Promise.all(arg);
          return (arg as TxCallback<unknown>)(prisma);
        },
      ),
    };

    const module = await Test.createTestingModule({
      providers: [
        ConsultationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ConsultationService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('free slot → PENDING consultation yaratadi', async () => {
      prisma.calendarSlot.findUnique.mockResolvedValue({ id: 's1', status: 'FREE' });
      prisma.consultationRequest.create.mockResolvedValue({ id: 'c1' });
      prisma.calendarSlot.update.mockResolvedValue({ id: 's1', status: 'BOOKED' });

      const res = await service.create(
        { doctorId: 'd1', slotId: 's1', consultType: 'ONLINE' },
        42,
        'PATIENT',
      );
      expect(res.id).toBe('c1');
      expect(prisma.consultationRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            patientId: 42,
            doctorId: 'd1',
            slotId: 's1',
            consultType: 'ONLINE',
            status: 'PENDING',
          }),
        }),
      );
      // PHI fields OLIB TASHLANGAN bo'lishi kerak
      const callArg = prisma.consultationRequest.create.mock.calls[0][0];
      expect(callArg.data).not.toHaveProperty('patientName');
      expect(callArg.data).not.toHaveProperty('patientPhone');
      expect(callArg.data).not.toHaveProperty('patientEmail');
      expect(prisma.calendarSlot.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { status: 'BOOKED' },
      });
    });

    it('band slot → BadRequest', async () => {
      prisma.calendarSlot.findUnique.mockResolvedValue({ id: 's1', status: 'BOOKED' });
      await expect(
        service.create(
          { doctorId: 'd1', slotId: 's1', consultType: 'ONLINE' },
          42,
          'PATIENT',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('slot yo\'q → NotFound', async () => {
      prisma.calendarSlot.findUnique.mockResolvedValue(null);
      await expect(
        service.create(
          { doctorId: 'd1', slotId: 's1', consultType: 'ONLINE' },
          42,
          'PATIENT',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('owner ko\'ra oladi', async () => {
      prisma.consultationRequest.findUnique.mockResolvedValue({
        id: 'c1',
        patientId: 42,
      });
      await expect(service.findOne('c1', 42, 'PATIENT')).resolves.toBeDefined();
    });

    it('boshqa patient → Forbidden', async () => {
      prisma.consultationRequest.findUnique.mockResolvedValue({
        id: 'c1',
        patientId: 42,
      });
      await expect(service.findOne('c1', 99, 'PATIENT')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('DOCTOR ko\'ra oladi', async () => {
      prisma.consultationRequest.findUnique.mockResolvedValue({
        id: 'c1',
        patientId: 42,
      });
      await expect(service.findOne('c1', 99, 'DOCTOR')).resolves.toBeDefined();
    });

    it('topilmasa NotFound', async () => {
      prisma.consultationRequest.findUnique.mockResolvedValue(null);
      await expect(service.findOne('c1', 42, 'PATIENT')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancel', () => {
    it('PENDING holatni bekor qilishi mumkin', async () => {
      prisma.consultationRequest.findUnique.mockResolvedValue({
        id: 'c1',
        patientId: 42,
        slotId: 's1',
        status: 'PENDING',
      });
      prisma.consultationRequest.update.mockResolvedValue({
        id: 'c1',
        status: 'CANCELLED',
      });

      const res = await service.cancel(
        'c1',
        { reason: 'busy' },
        42,
        'PATIENT',
      );
      expect(res.status).toBe('CANCELLED');
      expect(prisma.calendarSlot.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { status: 'FREE' },
      });
    });

    it('COMPLETED ni bekor qilib bo\'lmaydi', async () => {
      prisma.consultationRequest.findUnique.mockResolvedValue({
        id: 'c1',
        patientId: 42,
        slotId: 's1',
        status: 'COMPLETED',
      });
      await expect(
        service.cancel('c1', { reason: 'x' }, 42, 'PATIENT'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
