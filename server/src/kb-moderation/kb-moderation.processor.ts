import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../config/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

export const KB_MODERATION_QUEUE =
  process.env.KB_MODERATION_QUEUE_NAME || 'kb-moderation';

export type KbJobType =
  | 'notify_review_needed'
  | 'notify_approved'
  | 'notify_rejected'
  | 'notify_published'
  | 'lifecycle_refresh_check';

export interface NotifyReviewNeededData {
  blockId: string;
  diseaseId: string;
  diseaseName?: string;
  submittedBy: number;
}

export interface NotifyApprovedData {
  blockId: string;
  diseaseId: string;
  editorId: number;
  approvedBy: number;
  signature?: string;
}

export interface NotifyRejectedData {
  blockId: string;
  diseaseId: string;
  editorId: number;
  rejectedBy: number;
  reason: string;
}

export interface NotifyPublishedData {
  blockId: string;
  diseaseId: string;
  editorId?: number;
  diseaseEditorId?: number | null;
  publishedBy: number;
}

export interface LifecycleRefreshCheckData {
  thresholdMonths?: number;
}

@Processor(KB_MODERATION_QUEUE)
export class KbModerationProcessor {
  private readonly logger = new Logger(KbModerationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get p(): any {
    return this.prisma;
  }

  @Process('notify_review_needed')
  async handleReviewNeeded(job: Job<NotifyReviewNeededData>) {
    const { blockId, diseaseId, diseaseName } = job.data;
    this.logger.log(`Review needed: block=${blockId} disease=${diseaseId}`);
    try {
      const editors = (await this.prisma.user.findMany({
        where: { role: 'MEDICAL_EDITOR' },
        select: { id: true },
      })) as Array<{ id: number }>;

      await Promise.all(
        editors.map((u) =>
          this.notifications.create({
            userId: u.id,
            title: 'Yangi blok ko\'rib chiqishga yuborildi',
            message: `${diseaseName ?? 'Kasallik'} bloki tasdiqlashingizni kutmoqda`,
            type: 'kb_review_needed',
          }),
        ),
      );
    } catch (err) {
      this.logger.error(`notify_review_needed failed: ${String(err)}`);
      throw err;
    }
  }

  @Process('notify_approved')
  async handleApproved(job: Job<NotifyApprovedData>) {
    const { editorId, blockId } = job.data;
    this.logger.log(`Approved: block=${blockId} editor=${editorId}`);
    try {
      await this.notifications.create({
        userId: editorId,
        title: 'Blok tasdiqlandi',
        message: `Sizning blokingiz tasdiqlandi (id=${blockId})`,
        type: 'kb_approved',
      });
    } catch (err) {
      this.logger.error(`notify_approved failed: ${String(err)}`);
      throw err;
    }
  }

  @Process('notify_rejected')
  async handleRejected(job: Job<NotifyRejectedData>) {
    const { editorId, blockId, reason } = job.data;
    this.logger.log(`Rejected: block=${blockId} editor=${editorId}`);
    try {
      await this.notifications.create({
        userId: editorId,
        title: 'Blok rad etildi',
        message: `Blok (id=${blockId}) rad etildi. Sabab: ${reason}`,
        type: 'kb_rejected',
      });
    } catch (err) {
      this.logger.error(`notify_rejected failed: ${String(err)}`);
      throw err;
    }
  }

  @Process('notify_published')
  async handlePublished(job: Job<NotifyPublishedData>) {
    const { blockId, editorId, diseaseEditorId } = job.data;
    this.logger.log(`Published: block=${blockId}`);
    try {
      const recipients = new Set<number>();
      if (editorId) recipients.add(editorId);
      if (diseaseEditorId) recipients.add(diseaseEditorId);

      await Promise.all(
        Array.from(recipients).map((userId) =>
          this.notifications.create({
            userId,
            title: 'Blok chop etildi',
            message: `Blok (id=${blockId}) public nashrda`,
            type: 'kb_published',
          }),
        ),
      );
    } catch (err) {
      this.logger.error(`notify_published failed: ${String(err)}`);
      throw err;
    }
  }

  @Process('lifecycle_refresh_check')
  async handleLifecycleRefreshCheck(job: Job<LifecycleRefreshCheckData>) {
    const months = job.data?.thresholdMonths ?? 12;
    this.logger.log(`Lifecycle refresh scan (threshold=${months} months)`);
    try {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - months);

      const staleBlocks = (await this.p.diseaseBlock.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: { lt: cutoff },
        },
        select: {
          id: true,
          label: true,
          lastEditedBy: true,
          disease: { select: { id: true, nameUz: true, editorId: true } },
        },
        take: 200,
      })) as Array<{
        id: string;
        label: string;
        lastEditedBy: number | null;
        disease: { id: string; nameUz: string; editorId: number | null };
      }>;

      const admins = (await this.prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'MEDICAL_EDITOR'] } },
        select: { id: true },
      })) as Array<{ id: number }>;

      for (const b of staleBlocks) {
        const recipients = new Set<number>();
        admins.forEach((a) => recipients.add(a.id));
        if (b.lastEditedBy) recipients.add(b.lastEditedBy);
        if (b.disease.editorId) recipients.add(b.disease.editorId);

        for (const userId of recipients) {
          await this.notifications.create({
            userId,
            title: 'Blokni yangilash vaqti',
            message: `"${b.disease.nameUz} — ${b.label}" bloki ${months} oydan ortiq yangilanmagan`,
            type: 'kb_lifecycle_refresh',
          });
        }
      }
      this.logger.log(`Lifecycle scan complete: ${staleBlocks.length} stale blocks`);
    } catch (err) {
      this.logger.error(`lifecycle_refresh_check failed: ${String(err)}`);
      throw err;
    }
  }
}
