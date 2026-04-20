import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { ChatMessageType } from './dto/send-message.dto';
import type { ChatMessageResponseDto } from './dto/chat-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Yangi xabarni DB ga saqlaydi va response DTO qaytaradi.
   */
  async saveMessage(
    senderId: number,
    roomId: string,
    content: string,
    type: ChatMessageType,
  ): Promise<ChatMessageResponseDto> {
    const message = await this.prisma.chatMessage.create({
      data: {
        roomId,
        senderId,
        content,
        type,
      },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
    });

    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName: message.sender.fullName ?? `User #${message.senderId}`,
      content: message.content,
      type: message.type as ChatMessageType,
      createdAt: message.createdAt.toISOString(),
    };
  }

  /**
   * Xona tarixini qaytaradi — oxirgi `limit` ta xabar, yangilikdan eskiga.
   */
  async getRoomHistory(
    roomId: string,
    limit = 50,
  ): Promise<ChatMessageResponseDto[]> {
    const messages = await this.prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        sender: { select: { id: true, fullName: true } },
      },
    });

    // Eskidan yangiga tartiblab qaytaramiz (UI uchun qulay)
    return messages
      .reverse()
      .map((m) => ({
        id: m.id,
        roomId: m.roomId,
        senderId: m.senderId,
        senderName: m.sender.fullName ?? `User #${m.senderId}`,
        content: m.content,
        type: m.type as ChatMessageType,
        createdAt: m.createdAt.toISOString(),
      }));
  }
}
