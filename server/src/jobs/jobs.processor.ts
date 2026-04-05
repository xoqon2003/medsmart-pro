import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../config/prisma.service';

export const JOBS_QUEUE = 'medsmart-jobs';

export interface ReminderJobData {
  applicationId: string;
  userId: number;
  type: 'appointment_reminder' | 'payment_reminder' | 'result_ready';
}

export interface SlotCleanupJobData {
  date: string;
}

export interface InvoiceJobData {
  paymentId: number;
}

export interface NotificationJobData {
  userId: number;
  title: string;
  message: string;
  type: string;
}

@Processor(JOBS_QUEUE)
export class JobsProcessor {
  private readonly logger = new Logger(JobsProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('appointment-reminder')
  async handleAppointmentReminder(job: Job<ReminderJobData>) {
    const { applicationId, userId, type } = job.data;
    this.logger.log(`Processing reminder: ${type} for user ${userId}, app ${applicationId}`);

    try {
      // Bildirishnoma yaratish
      await this.prisma.notification.create({
        data: {
          userId,
          title: this.getReminderTitle(type),
          message: this.getReminderMessage(type),
          type: 'REMINDER',
        },
      });
      this.logger.log(`Reminder sent: ${type} for user ${userId}`);
    } catch (err) {
      this.logger.error(`Reminder failed: ${err}`);
      throw err;
    }
  }

  @Process('slot-cleanup')
  async handleSlotCleanup(job: Job<SlotCleanupJobData>) {
    const { date } = job.data;
    this.logger.log(`Cleaning up expired slots for date: ${date}`);

    try {
      const result = await this.prisma.bookingSlot.deleteMany({
        where: {
          date,
          status: 'free',
        },
      });
      this.logger.log(`Cleaned ${result.count} expired slots`);
    } catch (err) {
      this.logger.error(`Slot cleanup failed: ${err}`);
      throw err;
    }
  }

  @Process('generate-invoice')
  async handleInvoiceGeneration(job: Job<InvoiceJobData>) {
    const { paymentId } = job.data;
    this.logger.log(`Generating invoice for payment: ${paymentId}`);

    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: { application: { include: { patient: true } } },
      });

      if (!payment) {
        this.logger.warn(`Payment not found: ${paymentId}`);
        return;
      }

      // Invoice raqam generatsiya va notes ga saqlash
      const invoiceNumber = `INV-${Date.now()}`;
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { providerTransactionId: invoiceNumber },
      });

      this.logger.log(`Invoice generated: ${invoiceNumber}`);
    } catch (err) {
      this.logger.error(`Invoice generation failed: ${err}`);
      throw err;
    }
  }

  @Process('send-notification')
  async handleNotification(job: Job<NotificationJobData>) {
    const { userId, title, message, type } = job.data;
    this.logger.log(`Sending notification to user ${userId}: ${title}`);

    try {
      await this.prisma.notification.create({
        data: { userId, title, message, type },
      });
    } catch (err) {
      this.logger.error(`Notification send failed: ${err}`);
      throw err;
    }
  }

  private getReminderTitle(type: string): string {
    switch (type) {
      case 'appointment_reminder': return 'Qabulga eslatma';
      case 'payment_reminder': return "To'lov eslatmasi";
      case 'result_ready': return 'Natija tayyor';
      default: return 'Eslatma';
    }
  }

  private getReminderMessage(type: string): string {
    switch (type) {
      case 'appointment_reminder': return 'Sizning qabulingiz 1 soatdan keyin boshlanadi.';
      case 'payment_reminder': return "To'lov muddati yaqinlashmoqda.";
      case 'result_ready': return 'Tekshiruv natijasi tayyor. Ilovani tekshiring.';
      default: return '';
    }
  }
}
