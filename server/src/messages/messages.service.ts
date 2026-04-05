import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  // ─── Xabarlar ───────────────────────────────────────────────────────────────

  async getConversations(userId: number) {
    const sent = await this.prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const received = await this.prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const partnerIds = [...new Set([
      ...sent.map(s => s.receiverId),
      ...received.map(r => r.senderId),
    ])];

    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const lastMsg = await this.prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: partnerId },
              { senderId: partnerId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await this.prisma.message.count({
          where: { senderId: partnerId, receiverId: userId, isRead: false },
        });

        const partner = await this.prisma.user.findUnique({
          where: { id: partnerId },
          select: { id: true, fullName: true, avatar: true },
        });

        return {
          partnerId,
          partnerName: partner?.fullName ?? 'Noma\'lum',
          partnerAvatar: partner?.avatar,
          lastMessage: lastMsg?.content,
          lastMessageAt: lastMsg?.createdAt,
          unreadCount,
        };
      }),
    );

    return conversations.sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  async getMessages(userId: number, partnerId: number, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        sender: { select: { id: true, fullName: true, avatar: true } },
      },
    });
  }

  async sendMessage(senderId: number, dto: SendMessageDto) {
    return this.prisma.message.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        content: dto.content,
        messageType: dto.messageType ?? 'TEXT',
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        consultId: dto.consultId,
      },
      include: {
        sender: { select: { id: true, fullName: true, avatar: true } },
      },
    });
  }

  async markAsRead(userId: number, messageId: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Xabar topilmadi');
    if (msg.receiverId !== userId) throw new ForbiddenException('Ruxsat yo\'q');

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // ─── Ruxsat tizimi ──────────────────────────────────────────────────────────

  async checkPermission(patientId: number, doctorProfileId: string) {
    const permission = await this.prisma.messagePermission.findFirst({
      where: {
        patientId,
        doctorId: doctorProfileId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
    });
    return { hasPermission: !!permission, permission };
  }

  async requestPermission(patientId: number, doctorProfileId: string) {
    const existing = await this.prisma.messagePermission.findFirst({
      where: { patientId, doctorId: doctorProfileId, status: { in: ['ACTIVE', 'REQUESTED'] } },
    });
    if (existing?.status === 'ACTIVE') return existing;
    if (existing?.status === 'REQUESTED') return existing;

    return this.prisma.messagePermission.create({
      data: {
        patientId,
        doctorId: doctorProfileId,
        grantedBy: 'AUTO',
        status: 'REQUESTED',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta default
      },
    });
  }

  async grantPermission(userId: number, permissionId: string, durationDays: number) {
    const perm = await this.prisma.messagePermission.findUnique({ where: { id: permissionId } });
    if (!perm) throw new NotFoundException('Ruxsat topilmadi');

    // shifokor ekanini tekshirish
    const profile = await this.prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile || profile.id !== perm.doctorId) throw new ForbiddenException('Ruxsat yo\'q');

    return this.prisma.messagePermission.update({
      where: { id: permissionId },
      data: {
        status: 'ACTIVE',
        grantedBy: 'DOCTOR',
        expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      },
    });
  }

  async revokePermission(userId: number, permissionId: string) {
    const perm = await this.prisma.messagePermission.findUnique({ where: { id: permissionId } });
    if (!perm) throw new NotFoundException('Ruxsat topilmadi');

    const profile = await this.prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile || profile.id !== perm.doctorId) throw new ForbiddenException('Ruxsat yo\'q');

    return this.prisma.messagePermission.update({
      where: { id: permissionId },
      data: { status: 'REVOKED' },
    });
  }
}
