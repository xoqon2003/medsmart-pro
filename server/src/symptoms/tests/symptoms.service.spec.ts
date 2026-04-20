import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SymptomsService } from '../symptoms.service';
import { PrismaService } from '../../config/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

describe('SymptomsService', () => {
  let service: SymptomsService;
  let prisma: AnyObj;

  beforeEach(() => {
    prisma = {
      $queryRaw: jest.fn(),
      symptom: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new SymptomsService(prisma as unknown as PrismaService);
  });

  it('findAll default pagination', async () => {
    (prisma.symptom.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.symptom.count as jest.Mock).mockResolvedValue(0);
    const result = await service.findAll({});
    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20 });
  });

  it('findAll q bilan $queryRaw chaqiradi', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
    await service.findAll({ q: 'bosh' } as never);
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('findOne not found', async () => {
    (prisma.symptom.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create as PATIENT → Forbidden', async () => {
    await expect(
      service.create({ code: 'X', nameUz: 'x', category: 'c' } as never, { id: 1, role: 'PATIENT' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('remove as EDITOR (non-ADMIN) → Forbidden', async () => {
    await expect(service.remove('s1', { id: 1, role: 'EDITOR' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
