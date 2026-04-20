import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../config/prisma.service';
import { nextStatus, KbStatus } from './state-machine';
import { KB_MODERATION_QUEUE } from './kb-moderation.processor';

/**
 * KB blok moderatsiya xizmati.
 *
 * Har transit status update + DiseaseEditLog yaratish + BullMQ job qo'shishdan
 * iborat bo'ladi. Prisma client `DiseaseBlock`/`DiseaseEditLog` uchun
 * regenerate qilinmagan ehtimoli borligi uchun `any` bypass ishlatiladi
 * (xuddi `DiseaseBlocksService` dagidek).
 */

type Caller = { id: number; role: string };

type BlockRow = {
  id: string;
  diseaseId: string;
  marker: string;
  label: string;
  status: KbStatus;
  lastEditedBy: number | null;
  publishedAt: Date | null;
};

@Injectable()
export class KbModerationService implements OnModuleInit {
  private readonly logger = new Logger(KbModerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(KB_MODERATION_QUEUE) private readonly queue: Queue,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get p(): any {
    return this.prisma;
  }

  async onModuleInit() {
    if (process.env.SKIP_DB_CONNECT === 'true') return;
    await this.setupRecurringJobs();
  }

  private async setupRecurringJobs() {
    try {
      const existing = await this.queue.getRepeatableJobs();
      for (const j of existing) {
        if (j.name === 'lifecycle_refresh_check') {
          await this.queue.removeRepeatableByKey(j.key);
        }
      }
      // Har oyning 1-sanasi 03:00 da lifecycle scan
      await this.queue.add(
        'lifecycle_refresh_check',
        { thresholdMonths: 12 },
        {
          repeat: { cron: '0 3 1 * *' },
          removeOnComplete: true,
        },
      );
      this.logger.log('KB moderation recurring jobs configured');
    } catch (err) {
      this.logger.warn(`Skipping recurring job setup: ${String(err)}`);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async loadBlockOr404(blockId: string): Promise<BlockRow> {
    const block = (await this.p.diseaseBlock.findUnique({
      where: { id: blockId },
    })) as BlockRow | null;
    if (!block) throw new NotFoundException('Blok topilmadi');
    return block;
  }

  private async loadDiseaseMeta(diseaseId: string): Promise<{
    id: string;
    nameUz: string;
    editorId: number | null;
  } | null> {
    return (await this.p.disease.findUnique({
      where: { id: diseaseId },
      select: { id: true, nameUz: true, editorId: true },
    })) as { id: string; nameUz: string; editorId: number | null } | null;
  }

  private async enqueueSafely(name: string, data: unknown) {
    try {
      await this.queue.add(name, data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      });
    } catch (err) {
      // Redis mavjud bo'lmasa testlarda yoki codegen paytida crash qilmaymiz
      this.logger.warn(`Queue add failed (${name}): ${String(err)}`);
    }
  }

  // ── Transitions ──────────────────────────────────────────────────────────

  async submitReview(blockId: string, caller: Caller, note?: string) {
    const block = await this.loadBlockOr404(blockId);
    const to = nextStatus(block.status, 'submit-review', caller.role);

    const [updated] = await this.prisma.$transaction([
      this.p.diseaseBlock.update({
        where: { id: blockId },
        data: { status: to, lastEditedBy: caller.id, lastEditedAt: new Date() },
      }),
      this.p.diseaseEditLog.create({
        data: {
          diseaseId: block.diseaseId,
          blockId,
          editorId: caller.id,
          editType: 'STATUS_CHANGE',
          diffJson: {
            action: 'submit-review',
            from: block.status,
            to,
            note: note ?? null,
          } as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);

    const disease = await this.loadDiseaseMeta(block.diseaseId);
    await this.enqueueSafely('notify_review_needed', {
      blockId,
      diseaseId: block.diseaseId,
      diseaseName: disease?.nameUz,
      submittedBy: caller.id,
    });

    return updated;
  }

  async approve(blockId: string, caller: Caller, signature?: string) {
    const block = await this.loadBlockOr404(blockId);
    const to = nextStatus(block.status, 'approve', caller.role);

    const [updated] = await this.prisma.$transaction([
      this.p.diseaseBlock.update({
        where: { id: blockId },
        data: { status: to, lastEditedBy: caller.id, lastEditedAt: new Date() },
      }),
      this.p.diseaseEditLog.create({
        data: {
          diseaseId: block.diseaseId,
          blockId,
          editorId: caller.id,
          editType: 'STATUS_CHANGE',
          diffJson: {
            action: 'approve',
            from: block.status,
            to,
            signature: signature ?? null,
          } as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);

    if (block.lastEditedBy) {
      await this.enqueueSafely('notify_approved', {
        blockId,
        diseaseId: block.diseaseId,
        editorId: block.lastEditedBy,
        approvedBy: caller.id,
        signature,
      });
    }

    return updated;
  }

  async reject(blockId: string, caller: Caller, reason: string) {
    const block = await this.loadBlockOr404(blockId);
    const to = nextStatus(block.status, 'reject', caller.role);

    const [updated] = await this.prisma.$transaction([
      this.p.diseaseBlock.update({
        where: { id: blockId },
        data: { status: to, lastEditedBy: caller.id, lastEditedAt: new Date() },
      }),
      this.p.diseaseEditLog.create({
        data: {
          diseaseId: block.diseaseId,
          blockId,
          editorId: caller.id,
          editType: 'STATUS_CHANGE',
          diffJson: {
            action: 'reject',
            from: block.status,
            to,
            reason,
          } as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);

    if (block.lastEditedBy) {
      await this.enqueueSafely('notify_rejected', {
        blockId,
        diseaseId: block.diseaseId,
        editorId: block.lastEditedBy,
        rejectedBy: caller.id,
        reason,
      });
    }

    return updated;
  }

  async publish(blockId: string, caller: Caller) {
    const block = await this.loadBlockOr404(blockId);
    const to = nextStatus(block.status, 'publish', caller.role);

    const [updated] = await this.prisma.$transaction([
      this.p.diseaseBlock.update({
        where: { id: blockId },
        data: {
          status: to,
          publishedAt: new Date(),
          lastEditedBy: caller.id,
          lastEditedAt: new Date(),
        },
      }),
      this.p.diseaseEditLog.create({
        data: {
          diseaseId: block.diseaseId,
          blockId,
          editorId: caller.id,
          editType: 'STATUS_CHANGE',
          diffJson: {
            action: 'publish',
            from: block.status,
            to,
          } as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);

    const disease = await this.loadDiseaseMeta(block.diseaseId);
    await this.enqueueSafely('notify_published', {
      blockId,
      diseaseId: block.diseaseId,
      editorId: block.lastEditedBy,
      diseaseEditorId: disease?.editorId ?? null,
      publishedBy: caller.id,
    });

    return updated;
  }

  async archive(blockId: string, caller: Caller) {
    const block = await this.loadBlockOr404(blockId);
    const to = nextStatus(block.status, 'archive', caller.role);

    const [updated] = await this.prisma.$transaction([
      this.p.diseaseBlock.update({
        where: { id: blockId },
        data: { status: to, lastEditedBy: caller.id, lastEditedAt: new Date() },
      }),
      this.p.diseaseEditLog.create({
        data: {
          diseaseId: block.diseaseId,
          blockId,
          editorId: caller.id,
          editType: 'STATUS_CHANGE',
          diffJson: {
            action: 'archive',
            from: block.status,
            to,
          } as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);
    return updated;
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  async getReviewQueue(page = 1, limit = 20) {
    const p = Math.max(page, 1);
    const l = Math.min(Math.max(limit, 1), 100);
    const offset = (p - 1) * l;

    const [items, total] = await Promise.all([
      this.p.diseaseBlock.findMany({
        where: { status: 'REVIEW' },
        include: {
          disease: {
            select: { id: true, slug: true, nameUz: true, icd10: true },
          },
          // Last UPDATE log — carries diffJson.before.contentMd for diff viewer
          editLogs: {
            where: { editType: 'UPDATE' },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              editor: { select: { id: true, fullName: true } },
            },
          },
        },
        orderBy: { updatedAt: 'asc' },
        skip: offset,
        take: l,
      }),
      this.p.diseaseBlock.count({ where: { status: 'REVIEW' } }),
    ]);

    return { items, total, page: p, limit: l };
  }

  async getHistory(blockId: string) {
    const logs = (await this.p.diseaseEditLog.findMany({
      where: { blockId },
      include: {
        editor: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })) as unknown;
    return logs;
  }

  // ── Admin manual trigger ─────────────────────────────────────────────────

  async runLifecycleScan(thresholdMonths = 12) {
    await this.enqueueSafely('lifecycle_refresh_check', { thresholdMonths });
    return { queued: true, thresholdMonths };
  }
}
