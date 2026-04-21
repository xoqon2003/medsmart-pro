import { NotFoundException } from '@nestjs/common';
import { KbModerationService } from '../kb-moderation.service';
import { PrismaService } from '../../config/prisma.service';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

function buildMocks() {
  const mockDiseaseBlock = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };
  const mockDiseaseEditLog = { create: jest.fn() };
  const mockDisease = { findUnique: jest.fn() };

  const prisma: AnyObj = {
    $transaction: jest.fn(async (ops: unknown[]) =>
      Promise.all(ops as Promise<unknown>[]),
    ),
    diseaseBlock: mockDiseaseBlock,
    diseaseEditLog: mockDiseaseEditLog,
    disease: mockDisease,
  };

  const mockQueue: AnyObj = {
    add: jest.fn().mockResolvedValue({}),
    getRepeatableJobs: jest.fn().mockResolvedValue([]),
  };

  return { prisma, mockQueue, mockDiseaseBlock, mockDiseaseEditLog, mockDisease };
}

function buildService(prisma: AnyObj, queue: AnyObj): KbModerationService {
  // Bypass onModuleInit by patching SKIP_DB_CONNECT
  const original = process.env.SKIP_DB_CONNECT;
  process.env.SKIP_DB_CONNECT = 'true';
  const svc = new KbModerationService(
    prisma as unknown as PrismaService,
    queue as never,
  );
  process.env.SKIP_DB_CONNECT = original;
  return svc;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('KbModerationService', () => {
  let prisma: AnyObj;
  let queue: AnyObj;
  let mockDiseaseBlock: AnyObj;
  let mockDiseaseEditLog: AnyObj;
  let mockDisease: AnyObj;
  let svc: KbModerationService;

  beforeEach(() => {
    ({ prisma, mockQueue: queue, mockDiseaseBlock, mockDiseaseEditLog, mockDisease } =
      buildMocks());
    svc = buildService(prisma, queue);
    jest.clearAllMocks();
  });

  // ── loadBlockOr404 ──────────────────────────────────────────────────────────

  it('1. blok topilmasa → NotFoundException', async () => {
    mockDiseaseBlock.findUnique.mockResolvedValue(null);
    await expect(
      svc.approve('nonexistent-id', { id: 1, role: 'MEDICAL_EDITOR' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // ── approve ─────────────────────────────────────────────────────────────────

  it('2. approve: REVIEW → APPROVED, $transaction chaqiriladi', async () => {
    const block = {
      id: 'blk-1', diseaseId: 'dis-1', marker: 'etiology',
      label: 'Etiologiya', status: 'REVIEW', lastEditedBy: 5, publishedAt: null,
    };
    mockDiseaseBlock.findUnique.mockResolvedValue(block);
    mockDiseaseBlock.update.mockResolvedValue({ ...block, status: 'APPROVED' });
    mockDiseaseEditLog.create.mockResolvedValue({ id: 'log-1' });
    mockDisease.findUnique.mockResolvedValue({ id: 'dis-1', nameUz: 'Test', editorId: 5 });

    const result = await svc.approve('blk-1', { id: 10, role: 'MEDICAL_EDITOR' });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(mockDiseaseBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'blk-1' },
        data: expect.objectContaining({ status: 'APPROVED' }),
      }),
    );
    expect(mockDiseaseEditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          editType: 'STATUS_CHANGE',
          editorId: 10,
        }),
      }),
    );
    expect((result as AnyObj).status).toBe('APPROVED');
  });

  it('3. approve: EDITOR roli → ForbiddenException (state-machine throws)', async () => {
    const block = {
      id: 'blk-2', diseaseId: 'dis-1', marker: 'etiology',
      label: 'Etiologiya', status: 'REVIEW', lastEditedBy: 5, publishedAt: null,
    };
    mockDiseaseBlock.findUnique.mockResolvedValue(block);
    await expect(
      svc.approve('blk-2', { id: 99, role: 'EDITOR' }),
    ).rejects.toThrow();
  });

  // ── reject ──────────────────────────────────────────────────────────────────

  it('4. reject: REVIEW → DRAFT, reason diffJson ga yoziladi', async () => {
    const block = {
      id: 'blk-3', diseaseId: 'dis-1', marker: 'symptoms',
      label: 'Simptomlar', status: 'REVIEW', lastEditedBy: 3, publishedAt: null,
    };
    mockDiseaseBlock.findUnique.mockResolvedValue(block);
    mockDiseaseBlock.update.mockResolvedValue({ ...block, status: 'DRAFT' });
    mockDiseaseEditLog.create.mockResolvedValue({ id: 'log-2' });
    mockDisease.findUnique.mockResolvedValue({ id: 'dis-1', nameUz: 'Test', editorId: 3 });

    await svc.reject('blk-3', { id: 10, role: 'MEDICAL_EDITOR' }, 'Mazmun yetarli emas');

    expect(mockDiseaseEditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          diffJson: expect.objectContaining({
            action: 'reject',
            reason: 'Mazmun yetarli emas',
          }),
        }),
      }),
    );
  });

  // ── publish ─────────────────────────────────────────────────────────────────

  it('5. publish: APPROVED → PUBLISHED, publishedAt set qilinadi', async () => {
    const block = {
      id: 'blk-4', diseaseId: 'dis-1', marker: 'treatment',
      label: "Davolash", status: 'APPROVED', lastEditedBy: 3, publishedAt: null,
    };
    mockDiseaseBlock.findUnique.mockResolvedValue(block);
    mockDiseaseBlock.update.mockResolvedValue({ ...block, status: 'PUBLISHED' });
    mockDiseaseEditLog.create.mockResolvedValue({ id: 'log-3' });
    mockDisease.findUnique.mockResolvedValue({ id: 'dis-1', nameUz: 'Test', editorId: 3 });

    await svc.publish('blk-4', { id: 1, role: 'ADMIN' });

    expect(mockDiseaseBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PUBLISHED',
          publishedAt: expect.any(Date),
        }),
      }),
    );
  });

  // ── getReviewQueue ───────────────────────────────────────────────────────────

  it('6. getReviewQueue: REVIEW statusdagi bloklarni qaytaradi', async () => {
    const fakeBlocks = [
      { id: 'blk-5', status: 'REVIEW', disease: { id: 'd1', slug: 'flu' }, editLogs: [] },
    ];
    mockDiseaseBlock.findMany.mockResolvedValue(fakeBlocks);
    mockDiseaseBlock.count.mockResolvedValue(1);

    const result = await svc.getReviewQueue(1, 20);

    expect(mockDiseaseBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'REVIEW' } }),
    );
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
  });

  it('7. getReviewQueue: limit 100 dan oshmasligi kerak', async () => {
    mockDiseaseBlock.findMany.mockResolvedValue([]);
    mockDiseaseBlock.count.mockResolvedValue(0);

    await svc.getReviewQueue(1, 999);

    expect(mockDiseaseBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  // ── archive ──────────────────────────────────────────────────────────────────

  it('8. archive: har qanday non-ARCHIVED status → ARCHIVED', async () => {
    const block = {
      id: 'blk-6', diseaseId: 'dis-1', marker: 'diagnosis',
      label: 'Tashxis', status: 'PUBLISHED', lastEditedBy: 2, publishedAt: new Date(),
    };
    mockDiseaseBlock.findUnique.mockResolvedValue(block);
    mockDiseaseBlock.update.mockResolvedValue({ ...block, status: 'ARCHIVED' });
    mockDiseaseEditLog.create.mockResolvedValue({ id: 'log-4' });

    const result = await svc.archive('blk-6', { id: 1, role: 'ADMIN' });
    expect((result as AnyObj).status).toBe('ARCHIVED');
  });
});
