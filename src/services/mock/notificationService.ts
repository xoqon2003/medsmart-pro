import type { Notification } from '../../app/types';
import { mockNotifications } from '../../app/data/mockData';

export interface INotificationService {
  getAll(): Promise<Notification[]>;
  getByUserId(userId: number): Promise<Notification[]>;
}

export const notificationService: INotificationService = {
  getAll: () => Promise.resolve([...mockNotifications]),
  getByUserId: (userId) =>
    Promise.resolve(mockNotifications.filter((n) => n.userId === userId)),
};
