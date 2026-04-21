import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DiseasesService } from '../diseases.service';
import { DiseasesRepository } from '../diseases.repository';
import { EmbeddingService } from '../embedding.service';
import { PrismaService } from '../../config/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

/**
 * Disease KB v2 metadata CRUD (PR-15) testlari:
 *   scientists / research / genetics.
 *
 * Prisma mock'lari inline — alohida integration test DB ni ishlatadi.
 */
describe('DiseasesService — metadata CRUD', () => {
  let service: DiseasesService;
  let repo: jest.Mocked<DiseasesRepository>;
  let prisma: AnyObj;

  const editor = { id: 42, role: 'EDITOR' };
  const admin = { id: 1, role: 'ADMIN' };
  const patient = { id: 7, role: 'PATIENT' };

  beforeEach(() => {
    repo = {
      findUnique: jest.fn(),
    } as unknown as jest.Mocked<DiseasesRepository>;

    prisma = {
      diseaseScientist: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      diseaseResearch: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      diseaseGenetic: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      diseaseEditLog: {
        create: jest.fn(),
      },
    };

    const embeddingService = {
      embed: jest.fn(),
      embedDisease: jest.fn(),
      getEmbedding: jest.fn(),
    } as unknown as jest.Mocked<EmbeddingService>;

    service = new DiseasesService(
      prisma as unknown as PrismaService,
      repo,
      embeddingService,
    );
  });

  // ── Scientists ─────────────────────────────────────────────────────────────

  describe('listScientists', () => {
    it('PUBLISHED kasallik uchun olimlarni qaytaradi (public)', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'd1', status: 'PUBLISHED' });
      (prisma.diseaseScientist.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 's1', fullName: 'Riva-Rocci' },
      ]);

      const result = await service.listScientists('gipertoniya', null);

      expect(result).toHaveLength(1);
      expect(prisma.diseaseScientist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { diseaseId: 'd1' },
          orderBy: { orderIndex: 'asc' },
        }),
      );
    });

    it('DRAFT kasallikni public uchun yashiradi (NotFoundException)', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'd1', status: 'DRAFT' });
      await expect(service.listScientists('yashirin-d', null)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('ADMIN uchun DRAFT kasallik ham ochiq', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'd1', status: 'DRAFT' });
      (prisma.diseaseScientist.findMany as jest.Mock).mockResolvedValueOnce([]);
      await expect(service.listScientists('yashirin-d', admin)).resolves.toEqual([]);
    });
  });

  describe('createScientist', () => {
    it('PATIENT rolida ForbiddenException', async () => {
      await expect(
        service.createScientist('d1', { fullName: 'X', role: 'DISCOVERER' }, patient),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('EDITOR bo\'lmagan kasallik uchun NotFoundException', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce(null);
      await expect(
        service.createScientist('yoq', { fullName: 'X', role: 'DISCOVERER' }, editor),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('create va audit log yozadi', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'd1' });
      (prisma.diseaseScientist.create as jest.Mock).mockResolvedValueOnce({
        id: 's1',
        fullName: 'Bekhterev',
      });

      const result = await service.createScientist(
        'd1',
        { fullName: 'Bekhterev', role: 'DISCOVERER' },
        editor,
      );

      expect(result).toMatchObject({ id: 's1' });
      expect(prisma.diseaseScientist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ diseaseId: 'd1', orderIndex: 0 }),
        }),
      );
      expect(prisma.diseaseEditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ editType: 'CREATE', editorId: 42 }),
        }),
      );
    });
  });

  describe('updateScientist', () => {
    it('boshqa kasallikning olimini yangilashga urinish → NotFound', async () => {
      (prisma.diseaseScientist.findUnique as jest.Mock).mockResolvedValueOnce({
        diseaseId: 'd-boshqa',
      });
      await expect(
        service.updateScientist('d1', 's1', { country: 'Fransiya' }, editor),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('happy path update', async () => {
      (prisma.diseaseScientist.findUnique as jest.Mock).mockResolvedValueOnce({ diseaseId: 'd1' });
      (prisma.diseaseScientist.update as jest.Mock).mockResolvedValueOnce({
        id: 's1',
        country: 'Germaniya',
      });
      const result = await service.updateScientist('d1', 's1', { country: 'Germaniya' }, editor);
      expect(result).toMatchObject({ country: 'Germaniya' });
    });
  });

  describe('deleteScientist', () => {
    it('o\'chirilgach audit log yozadi', async () => {
      (prisma.diseaseScientist.findUnique as jest.Mock).mockResolvedValueOnce({ diseaseId: 'd1' });
      (prisma.diseaseScientist.delete as jest.Mock).mockResolvedValueOnce({ id: 's1' });
      const result = await service.deleteScientist('d1', 's1', editor);
      expect(result).toEqual({ ok: true });
      expect(prisma.diseaseEditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ editType: 'DELETE' }),
        }),
      );
    });
  });

  // ── Research ───────────────────────────────────────────────────────────────

  describe('createResearch', () => {
    it('DOI mavjud bo\'lsa ConflictException', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'd1' });
      (prisma.diseaseResearch.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'r-exists',
      });

      await expect(
        service.createResearch(
          'd1',
          {
            title: 'X',
            authors: 'Y',
            year: 2020,
            type: 'RCT',
            summaryMd: 'Lorem...',
            doi: '10.1000/dup',
          },
          editor,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('default evidenceLevel=C va isLandmark=false qo\'yadi', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'd1' });
      (prisma.diseaseResearch.create as jest.Mock).mockResolvedValueOnce({ id: 'r1' });

      await service.createResearch(
        'd1',
        {
          title: 'T',
          authors: 'A',
          year: 2020,
          type: 'GUIDELINE',
          summaryMd: 'Summary...',
        },
        editor,
      );

      expect(prisma.diseaseResearch.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            diseaseId: 'd1',
            evidenceLevel: 'C',
            isLandmark: false,
          }),
        }),
      );
    });
  });

  describe('listResearch', () => {
    it('isLandmark desc + year desc tartib', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'd1', status: 'PUBLISHED' });
      (prisma.diseaseResearch.findMany as jest.Mock).mockResolvedValueOnce([]);
      await service.listResearch('gipertoniya', null);
      expect(prisma.diseaseResearch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ isLandmark: 'desc' }, { year: 'desc' }],
        }),
      );
    });
  });

  // ── Genetics ───────────────────────────────────────────────────────────────

  describe('createGenetic', () => {
    it('barcha maydonlar optional — bo\'sh payload ham qabul qilinadi', async () => {
      (repo.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'd1' });
      (prisma.diseaseGenetic.create as jest.Mock).mockResolvedValueOnce({ id: 'g1' });

      const result = await service.createGenetic('d1', {}, editor);
      expect(result).toMatchObject({ id: 'g1' });
    });

    it('PATIENT → Forbidden', async () => {
      await expect(service.createGenetic('d1', {}, patient)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('deleteGenetic', () => {
    it('boshqa kasallikning yozuvini o\'chirishga urinish → NotFound', async () => {
      (prisma.diseaseGenetic.findUnique as jest.Mock).mockResolvedValueOnce({
        diseaseId: 'd-boshqa',
      });
      await expect(service.deleteGenetic('d1', 'g1', editor)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
