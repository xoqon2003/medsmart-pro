import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async findAll() {
    return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findByUserId(userId: number) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { items, unreadCount };
  }

  async markRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }

  /**
   * Bildirishnoma yaratish va real-time yuborish
   */
  async create(data: {
    userId: number;
    title: string;
    message: string;
    type?: string;
    applicationId?: number;
  }) {
    const notification = await this.prisma.notification.create({ data });

    // WebSocket orqali real-time yuborish
    this.gateway.notifyUser(data.userId, notification);

    return notification;
  }

  /**
   * Ariza holati o'zgarganda bildirish
   */
  async notifyApplicationStatus(userId: number, applicationId: number, status: string) {
    const statusMessages: Record<string, string> = {
      ACCEPTED: 'Arizangiz qabul qilindi',
      PAID_PENDING: 'To\'lov kutilmoqda',
      CONCLUSION_WRITING: 'Xulosa yozilmoqda',
      DONE: 'Xulosa tayyor',
      FAILED: 'Ariza rad etildi',
    };

    const message = statusMessages[status] || `Ariza holati: ${status}`;

    await this.create({
      userId,
      title: 'Ariza holati yangilandi',
      message,
      type: 'application_status',
      applicationId,
    });

    this.gateway.notifyApplicationStatusChanged(userId, { applicationId, status, message });
  }
}
