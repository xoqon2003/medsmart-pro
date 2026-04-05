import { api } from './apiClient';
import type { Notification } from '../../app/types';

function mapNotification(n: any): Notification {
  return { ...n };
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const data = await api.get<any[]>('/notifications');
    return data.map(mapNotification);
  },

  async getByUserId(userId: number): Promise<Notification[]> {
    const data = await api.get<any[]>(`/notifications?userId=${userId}`);
    return data.map(mapNotification);
  },

  async markRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};
