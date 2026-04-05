import { api } from './apiClient';
import type { ChatMessage, Conversation, MessagePermission } from '../../app/types';

export const messageService = {
  async getConversations(): Promise<Conversation[]> {
    return api.get<Conversation[]>('/messages/conversations');
  },

  async getMessages(partnerId: number, page = 1): Promise<ChatMessage[]> {
    return api.get<ChatMessage[]>(`/messages/${partnerId}?page=${page}`);
  },

  async sendMessage(data: {
    receiverId: number;
    content?: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    consultId?: string;
  }): Promise<ChatMessage> {
    return api.post<ChatMessage>('/messages', data);
  },

  async markAsRead(messageId: string) {
    return api.patch(`/messages/${messageId}/read`);
  },

  async checkPermission(doctorProfileId: string): Promise<{ hasPermission: boolean; permission?: MessagePermission }> {
    return api.get(`/messages/permission/check/${doctorProfileId}`);
  },

  async requestPermission(doctorProfileId: string): Promise<MessagePermission> {
    return api.post<MessagePermission>('/messages/permission/request', { doctorId: doctorProfileId });
  },

  async grantPermission(permissionId: string, durationDays: number): Promise<MessagePermission> {
    return api.patch<MessagePermission>(`/messages/permission/${permissionId}/grant`, { durationDays });
  },

  async revokePermission(permissionId: string): Promise<MessagePermission> {
    return api.patch<MessagePermission>(`/messages/permission/${permissionId}/revoke`);
  },
};
