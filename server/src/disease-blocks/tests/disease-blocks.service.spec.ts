import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DiseaseBlocksService } from '../disease-blocks.service';
import { PrismaService } from '../../config/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

describe('DiseaseBlocksService', () => {
  let service: DiseaseBlocksService;
  let prisma: AnyObj;

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
      disease: {
        findUnique: jest.fn(),
      },
      diseaseBlock: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      diseaseEditLog: {
        create: jest.fn(),
      },
      reference: {
        findUnique: jest.fn(),
      },
      diseaseReference: {
        create: jest.fn(),
      },
    };
    service = new DiseaseBlocksService(prisma as unknown as PrismaService);
  });

  it('noto\'g\'ri marker → 422', async () => {
    (prisma.disease.findUnique as jest.Mock).mockResolvedValue({ id: 'd1', status: 'PUBLISHED' });
    await expect(
      service.create(
        'slug',
        { marker: 'foobar' as never, label: 'x', contentMd: 'y' } as never,
        { id: 1, role: 'EDITOR' },
      ),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('EDITOR rolisiz → Forbidden', async () => {
    await expect(
      service.create(
        'slug',
        { marker: 'etiology', label: 'x', contentMd: 'y' } as never,
        { id: 1, role: 'PATIENT' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('public da non-PUBLISHED disease → 404', async () => {
    (prisma.disease.findUnique as jest.Mock).mockResolvedValue({
      id: 'd1',
      status: 'DRAFT',
    });
    await expect(service.listForDisease('slug', {} as never, null)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create success — diseaseEditLog yozadi', async () => {
    (prisma.disease.findUnique as jest.Mock).mockResolvedValue({ id: 'd1', status: 'PUBLISHED' });
    (prisma.diseaseBlock.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.diseaseBlock.create as jest.Mock).mockResolvedValue({ id: 'b1' });
    (prisma.diseaseEditLog.create as jest.Mock).mockResolvedValue({ id: 'log1' });

    await service.create(
      'slug',
      { marker: 'etiology', label: 'Etio', contentMd: 'markdown' } as never,
      { id: 1, role: 'EDITOR' },
    );

    expect(prisma.diseaseBlock.create).toHaveBeenCalled();
    expect(prisma.diseaseEditLog.create).toHaveBeenCalled();
  });
});
