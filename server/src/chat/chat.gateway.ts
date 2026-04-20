import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto, ChatMessageType } from './dto/send-message.dto';
import type { JwtPayload } from '../auth/jwt-payload.interface';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: number;
    userFullName: string;
  };
}

@WebSocketGateway({
  cors: { origin: '*', credentials: false },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  // ── Ulanish ──────────────────────────────────────────────────────────────────

  async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    try {
      const token =
        (socket.handshake.auth as Record<string, string>)['token'] ??
        (socket.handshake.headers['authorization'] ?? '').replace(
          'Bearer ',
          '',
        );

      if (!token) {
        this.logger.warn(`Socket ${socket.id}: token yo'q — uzilmoqda`);
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token);
      socket.data.userId = payload.sub;
      // fullName bazadan olish qimmat — payload dan kengaytirish mumkin, hozircha fallback
      socket.data.userFullName = `User #${payload.sub}`;

      this.logger.log(
        `Socket ulanish: userId=${payload.sub} socketId=${socket.id}`,
      );
    } catch {
      this.logger.warn(`Socket ${socket.id}: noto'g'ri token — uzilmoqda`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: AuthenticatedSocket): void {
    this.logger.log(
      `Socket uzildi: userId=${socket.data?.userId} socketId=${socket.id}`,
    );
  }

  // ── Xonaga qo'shilish ────────────────────────────────────────────────────────

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() roomId: string,
  ): Promise<void> {
    if (!socket.data?.userId) {
      socket.emit('error', { message: 'Autentifikatsiya talab qilinadi' });
      return;
    }

    await socket.join(roomId);
    this.logger.log(
      `userId=${socket.data.userId} xonaga qo'shildi: ${roomId}`,
    );

    // Xona tarixini yuboramiz
    const history = await this.chatService.getRoomHistory(roomId);
    socket.emit('room_history', history);
  }

  // ── Xabar yuborish ───────────────────────────────────────────────────────────

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() dto: SendMessageDto,
  ): Promise<void> {
    if (!socket.data?.userId) {
      socket.emit('error', { message: 'Autentifikatsiya talab qilinadi' });
      return;
    }

    // DTO validatsiya (minimal — class-validator WS da odatda qo'lda)
    if (!dto?.roomId || !dto?.content?.trim()) {
      socket.emit('error', { message: "roomId va content bo'sh bo'lmasligi kerak" });
      return;
    }

    const type = dto.type ?? ChatMessageType.TEXT;

    try {
      const saved = await this.chatService.saveMessage(
        socket.data.userId,
        dto.roomId,
        dto.content.trim(),
        type,
      );

      // Yuboruvchining to'liq ismini qo'shamiz
      saved.senderName = socket.data.userFullName;

      // Xonadagi barcha foydalanuvchilarga broadcast
      this.server.to(dto.roomId).emit('receive_message', saved);
    } catch (err) {
      this.logger.error('Xabar saqlashda xato:', err);
      socket.emit('error', { message: 'Xabar saqlanmadi, qayta urinib ko\'ring' });
    }
  }

  // ── Yozish indikatori ────────────────────────────────────────────────────────

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() roomId: string,
  ): void {
    if (!socket.data?.userId || !roomId) return;

    socket.to(roomId).emit('typing_indicator', {
      roomId,
      userId: socket.data.userId,
      userName: socket.data.userFullName,
    });
  }
}
