import { api, setAuthToken, setRefreshToken, clearTokens } from './apiClient';
import type { User } from '../../app/types';

// Backend enum → frontend type mapping
function mapUser(u: any): User {
  return {
    ...u,
    role: u.role?.toLowerCase(),
    gender: u.gender?.toLowerCase(),
    language: u.language?.toLowerCase(),
  };
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
  isNewUser?: boolean;
  needsPin?: boolean;
}

export const authService = {
  /**
   * Telegram Mini App orqali autentifikatsiya
   */
  async telegramAuth(initData: string) {
    const result = await api.post<AuthResponse>('/auth/telegram', { initData });
    setAuthToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    return {
      user: mapUser(result.user),
      isNewUser: result.isNewUser,
    };
  },

  /**
   * OTP kod yuborish (SMS)
   */
  async sendOtp(phone: string) {
    return api.post<{ message: string; phone: string; expiresIn: number }>('/auth/send-otp', { phone });
  },

  /**
   * OTP tekshirish va login
   */
  async verifyOtp(phone: string, otp: string) {
    const result = await api.post<AuthResponse>('/auth/verify-otp', { phone, otp });
    setAuthToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    return {
      user: mapUser(result.user),
      isNewUser: result.isNewUser,
      needsPin: result.needsPin,
    };
  },

  /**
   * PIN kod o'rnatish
   */
  async setPin(phone: string, pin: string) {
    return api.post<{ message: string }>('/auth/set-pin', { phone, pin });
  },

  /**
   * PIN bilan login (Web Platform)
   */
  async login(phone: string, pin: string) {
    const result = await api.post<AuthResponse>('/auth/login', { phone, pin });
    setAuthToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    return { user: mapUser(result.user) };
  },

  /**
   * Yangi bemor ro'yxatdan o'tishi
   */
  async registerPatient(data: { phone: string; fullName: string; gender?: string; birthDate?: string }) {
    return api.post<{ message: string; user: any }>('/auth/register-patient', data);
  },

  /**
   * Joriy foydalanuvchi ma'lumoti
   */
  async getMe() {
    const user = await api.get<any>('/auth/me');
    return mapUser(user);
  },

  /**
   * Chiqish
   */
  async logout() {
    const rt = localStorage.getItem('medsmart_refresh_token');
    if (rt) {
      try {
        await api.post('/auth/logout', { refreshToken: rt });
      } catch {
        // logout xatosi muhim emas
      }
    }
    clearTokens();
  },

  // ── Foydalanuvchi boshqaruvi ──────────────────────────────────────────

  async getUsers(): Promise<User[]> {
    const users = await api.get<any[]>('/users');
    return users.map(mapUser);
  },

  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await api.get<any>(`/users/${id}`);
      return mapUser(user);
    } catch {
      return null;
    }
  },

  async getUsersByRole(role: string): Promise<User[]> {
    const users = await api.get<any[]>(`/users?role=${role}`);
    return users.map(mapUser);
  },
};
