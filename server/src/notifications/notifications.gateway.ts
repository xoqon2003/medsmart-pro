import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://medsmart-pro.vercel.app',
      /^https:\/\/.*\.telegram\.org$/,
    ],
    credentials: true,
  },
  namespace: '/ws',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  // userId -> socket ID mapping
  private userSockets = new Map<number, Set<string>>();

  constructor(private jwt: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token as string;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwt.verify(token);
      const userId = payload.sub as number;

      // User room ga qo'shish
      client.join(`user:${userId}`);
      client.data.userId = userId;
      client.data.role = payload.role;

      // Socket mapping
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      this.logger.log(`Connected: user=${userId}, socket=${client.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.logger.log(`Disconnected: user=${userId}`);
    }
  }

  /**
   * Foydalanuvchiga bildirishnoma yuborish
   */
  sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Yangi bildirishnoma
   */
  notifyUser(userId: number, notification: any) {
    this.sendToUser(userId, 'notification:new', notification);
  }

  /**
   * Ariza holati o'zgardi
   */
  notifyApplicationStatusChanged(userId: number, data: { applicationId: number; status: string; message?: string }) {
    this.sendToUser(userId, 'application:status-changed', data);
  }

  /**
   * Shifokor online/offline holati
   */
  notifyDoctorStatus(doctorId: number, isOnline: boolean) {
    this.server.emit('doctor:status', { doctorId, isOnline });
  }

  /**
   * Yangi xabar
   */
  notifyNewMessage(userId: number, message: any) {
    this.sendToUser(userId, 'message:new', message);
  }

  /**
   * To'lov holati o'zgardi
   */
  notifyPaymentStatus(userId: number, data: { paymentId: number; status: string }) {
    this.sendToUser(userId, 'payment:status-changed', data);
  }

  /**
   * Foydalanuvchi online ekanligini tekshirish
   */
  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId) && (this.userSockets.get(userId)?.size ?? 0) > 0;
  }

  /**
   * Client dan kelgan ping
   */
  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    return { event: 'pong', data: { timestamp: Date.now() } };
  }
}
