import type { User, UserRole } from '../../app/types';
import { mockUsers } from '../../app/data/mockData';

export interface IAuthService {
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  getUsersByRole(role: UserRole): Promise<User[]>;
}

export const authService: IAuthService = {
  getUsers: () => Promise.resolve([...mockUsers]),
  getUserById: (id) => Promise.resolve(mockUsers.find((u) => u.id === id) ?? null),
  getUsersByRole: (role) => Promise.resolve(mockUsers.filter((u) => u.role === role)),
};
