import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  JOBS_QUEUE,
  ReminderJobData,
  SlotCleanupJobData,
  InvoiceJobData,
  NotificationJobData,
} from './jobs.processor';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectQueue(JOBS_QUEUE) private jobsQueue: Queue) {}

  /**
   * Qabul eslatmasi — 1 soat oldin yuboriladi
   */
  async scheduleAppointmentReminder(
    applicationId: string,
    userId: number,
    appointmentDate: Date,
  ): Promise<void> {
    const delay = appointmentDate.getTime() - Date.now() - 60 * 60 * 1000; // 1 soat oldin
    if (delay <= 0) {
      this.logger.warn(`Appointment too soon for reminder: ${applicationId}`);
      return;
    }

    await this.jobsQueue.add(
      'appointment-reminder',
      { applicationId, userId, type: 'appointment_reminder' } as ReminderJobData,
      {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      },
    );
    this.logger.log(`Reminder scheduled for app ${applicationId} in ${Math.round(delay / 60000)} min`);
  }

  /**
   * To'lov eslatmasi — 24 soat keyin
   */
  async schedulePaymentReminder(applicationId: string, userId: number): Promise<void> {
    await this.jobsQueue.add(
      'appointment-reminder',
      { applicationId, userId, type: 'payment_reminder' } as ReminderJobData,
      {
        delay: 24 * 60 * 60 * 1000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      },
    );
  }

  /**
   * O'tgan kunlik slotlarni tozalash
   */
  async scheduleSlotCleanup(date: string): Promise<void> {
    await this.jobsQueue.add(
      'slot-cleanup',
      { date } as SlotCleanupJobData,
      {
        attempts: 2,
        removeOnComplete: true,
      },
    );
  }

  /**
   * Invoice (hisob-faktura) generatsiya qilish
   */
  async scheduleInvoiceGeneration(paymentId: number): Promise<void> {
    await this.jobsQueue.add(
      'generate-invoice',
      { paymentId } as InvoiceJobData,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
      },
    );
  }

  /**
   * Oddiy notification yuborish (kechiktirilgan)
   */
  async sendDelayedNotification(
    userId: number,
    title: string,
    message: string,
    type: string,
    delayMs = 0,
  ): Promise<void> {
    await this.jobsQueue.add(
      'send-notification',
      { userId, title, message, type } as NotificationJobData,
      {
        delay: delayMs,
        attempts: 2,
        removeOnComplete: true,
      },
    );
  }

  /**
   * Har kuni ertalab o'tgan slotlarni tozalash (cron)
   */
  async setupRecurringJobs(): Promise<void> {
    // Mavjud repeatable joblarni tozalash
    const repeatableJobs = await this.jobsQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.jobsQueue.removeRepeatableByKey(job.key);
    }

    // Har kuni 02:00 da slot cleanup
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    await this.jobsQueue.add(
      'slot-cleanup',
      { date: dateStr } as SlotCleanupJobData,
      {
        repeat: { cron: '0 2 * * *' },
        removeOnComplete: true,
      },
    );

    this.logger.log('Recurring jobs configured');
  }
}
