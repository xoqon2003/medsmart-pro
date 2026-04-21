import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DiseasesService } from '../diseases.service';
import { DiseasesRepository } from '../diseases.repository';
import { EmbeddingService } from '../embedding.service';
import { PrismaService } from '../../config/prisma.service';

type Caller = { id: number; role: string } | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

describe('DiseasesService', () => {
  let service: DiseasesService;
  let repo: jest.Mocked<DiseasesRepository>;
  let prisma: AnyObj;
  let embeddingService: jest.Mocked<EmbeddingService>;

  beforeEach(() => {
    repo = {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<DiseasesRepository>;

    prisma = {
      $queryRaw: jest.fn(),
      $executeRaw: jest.fn(),
      $transaction: jest.fn(async (ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
      disease: {
        create: jest.fn(),
        update: jest.fn(),
      },
      diseaseEditLog: {
        create: jest.fn(),
      },
      diseaseSymptom: {
        findMany: jest.fn(),
      },
    };

    embeddingService = {
      embed: jest.fn().mockResolvedValue(Array.from<number>({ length: 1536 }).fill(0.01)),
      embedDisease: jest.fn().mockResolvedValue(Array.from<number>({ length: 1536 }).fill(0.01)),
      getEmbedding: jest.fn().mockResolvedValue(Array.from<number>({ length: 1536 }).fill(0.01)),
    } as unknown as jest.Mocked<EmbeddingService>;

    service = new DiseasesService(
      prisma as unknown as PrismaService,
      repo,
      embeddingService,
    );
  });

  describe('findAll', () => {
    it('pagination default qaytaradi', async () => {
      repo.findMany.mockResolvedValue([]);
      repo.count.mockResolvedValue(0);

      const result = await service.findAll({}, null);

      expect(result).toEqual({ items: [], total: 0, page: 1, limit: 20 });
      expect(repo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 20, skip: 0 }),
      );
    });

    it('q berilganda $queryRaw chaqiradi (FTS)', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      const result = await service.findAll({ q: 'gipert' } as never, null);
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result.items).toEqual([]);
    });

    it('public status=PUBLISHED filterini qo\'llaydi', async () => {
      repo.findMany.mockResolvedValue([]);
      repo.count.mockResolvedValue(0);
      await service.findAll({}, null);
      expect(repo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
    });
  });

  describe('findBySlug', () => {
    it('topilmasa NotFoundException', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findBySlug('yoq', 'L1', null)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('public uchun PUBLISHED bo\'lmagan kasallikni yashiradi', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValue({
        id: 'a',
        status: 'DRAFT',
        blocks: [],
      });
      await expect(service.findBySlug('a', 'L1', null)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('scientists, research, genetics include qiladi', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValue({
        id: 'd1',
        status: 'PUBLISHED',
        blocks: [],
        scientists: [],
        research: [],
        genetics: [],
      });

      await service.findBySlug('gipertoniya-i10', 'L1', null);

      const callArg = (repo.findUnique as jest.Mock).mock.calls[0][0] as {
        include: Record<string, unknown>;
      };
      expect(callArg.include).toHaveProperty('scientists');
      expect(callArg.include).toHaveProperty('research');
      expect(callArg.include).toHaveProperty('genetics');
    });
  });

  describe('create', () => {
    it('slug avtomatik generate qilinadi va audit log yoziladi', async () => {
      const caller: Caller = { id: 1, role: 'EDITOR' };
      (repo.findFirst as jest.Mock).mockResolvedValue(null);
      const createdDisease = { id: 'd1', slug: 'gipertoniya-i10' };
      (prisma.disease.create as jest.Mock).mockResolvedValue(createdDisease);

      const result = await service.create(
        { icd10: 'I10', nameUz: 'Gipertoniya', category: 'cardiology' } as never,
        caller,
      );

      expect(result).toEqual(createdDisease);
      expect(prisma.disease.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'gipertoniya-i10', editorId: 1 }),
        }),
      );
      expect(prisma.diseaseEditLog.create).toHaveBeenCalled();
    });

    it('PATIENT rolida ForbiddenException', async () => {
      const caller: Caller = { id: 2, role: 'PATIENT' };
      await expect(
        service.create(
          { icd10: 'I10', nameUz: 'Gipertoniya', category: 'cardiology' } as never,
          caller,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('update', () => {
    it('audit log yozadi (STATUS_CHANGE agar status o\'zgarsa)', async () => {
      const caller: Caller = { id: 1, role: 'MEDICAL_EDITOR' };
      (repo.findUnique as jest.Mock).mockResolvedValue({
        id: 'd1',
        slug: 'old-i10',
        nameUz: 'Eski',
        icd10: 'I10',
        status: 'DRAFT',
      });
      (prisma.disease.update as jest.Mock).mockResolvedValue({ id: 'd1', status: 'REVIEW' });

      await service.update('d1', { status: 'REVIEW' } as never, caller);

      expect(prisma.diseaseEditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ editType: 'STATUS_CHANGE' }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('faqat ADMIN arxivlashi mumkin', async () => {
      await expect(service.remove('d1', { id: 1, role: 'EDITOR' })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('soft delete sifatida status=ARCHIVED qo\'yadi', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValue({ id: 'd1', status: 'PUBLISHED' });
      (prisma.disease.update as jest.Mock).mockResolvedValue({ id: 'd1', status: 'ARCHIVED' });

      await service.remove('d1', { id: 1, role: 'ADMIN' });

      expect(prisma.disease.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ARCHIVED' } }),
      );
    });
  });

  describe('semanticSearch', () => {
    it('bo\'sh natija qaytarsa [] qaytaradi', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      const result = await service.semanticSearch('noma\'lum');
      expect(result).toEqual([]);
      expect(embeddingService.embed).toHaveBeenCalledWith('noma\'lum');
    });

    it('natijalarni distance tartibida qaytaradi', async () => {
      const rawRows = [
        { id: 'id1', distance: 0.1 },
        { id: 'id2', distance: 0.3 },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(rawRows);
      (repo.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'id2', slug: 's2', nameUz: 'B', nameLat: null, icd10: 'B00' },
        { id: 'id1', slug: 's1', nameUz: 'A', nameLat: null, icd10: 'A00' },
      ]);

      const result = await service.semanticSearch('kasallik', 5);

      expect(result[0].id).toBe('id1');
      expect(result[1].id).toBe('id2');
    });
  });

  describe('indexDiseaseEmbedding', () => {
    it('kasallik topilmasa NotFoundException', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.indexDiseaseEmbedding('yoq')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('embedding yangilanadi — $executeRaw chaqiriladi', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce({
        nameUz: 'Gipertoniya',
        nameLat: 'Hypertension',
        synonyms: [],
      });
      (prisma.$executeRaw as jest.Mock).mockResolvedValueOnce(1);

      const result = await service.indexDiseaseEmbedding('d1');

      expect(result).toEqual({ ok: true });
      expect(embeddingService.embedDisease).toHaveBeenCalled();
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
