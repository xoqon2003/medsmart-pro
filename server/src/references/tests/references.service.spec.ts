import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReferencesService } from '../references.service';
import { PrismaService } from '../../config/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

describe('ReferencesService', () => {
  let service: ReferencesService;
  let prisma: AnyObj;

  beforeEach(() => {
    prisma = {
      reference: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      diseaseReference: {
        count: jest.fn(),
      },
    };
    service = new ReferencesService(prisma as unknown as PrismaService);
  });

  it('findAll default pagination', async () => {
    (prisma.reference.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.reference.count as jest.Mock).mockResolvedValue(0);
    const r = await service.findAll({});
    expect(r).toEqual({ items: [], total: 0, page: 1, limit: 20 });
  });

  it('create as PATIENT → Forbidden', async () => {
    await expect(
      service.create({ type: 'DOI', citation: 'abc' } as never, { id: 1, role: 'PATIENT' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('create with duplicate DOI → Conflict', async () => {
    (prisma.reference.findUnique as jest.Mock).mockResolvedValue({ id: 'r1' });
    await expect(
      service.create(
        { type: 'DOI', citation: 'abc', doi: '10.1000/abc' } as never,
        { id: 1, role: 'EDITOR' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('remove — ishlatilgan bo\'lsa 409', async () => {
    (prisma.reference.findUnique as jest.Mock).mockResolvedValue({ id: 'r1' });
    (prisma.diseaseReference.count as jest.Mock).mockResolvedValue(3);
    await expect(service.remove('r1', { id: 1, role: 'EDITOR' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('remove — ishlatilmagan bo\'lsa delete qiladi', async () => {
    (prisma.reference.findUnique as jest.Mock).mockResolvedValue({ id: 'r1' });
    (prisma.diseaseReference.count as jest.Mock).mockResolvedValue(0);
    (prisma.reference.delete as jest.Mock).mockResolvedValue({ id: 'r1' });
    const out = await service.remove('r1', { id: 1, role: 'EDITOR' });
    expect(out).toEqual({ id: 'r1' });
  });

  it('findOne not found', async () => {
    (prisma.reference.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
