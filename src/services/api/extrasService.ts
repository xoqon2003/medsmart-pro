import { api } from './apiClient';
import type { AnonymousNumber, CallSchedule, TelegramBotConfig, AdSetting } from '../../app/types';

export const extrasService = {
  // Anonymous Number
  async getAnonymousNumber(): Promise<AnonymousNumber | null> {
    return api.get('/extras/anonymous-number');
  },
  async upsertAnonymousNumber(data: Partial<AnonymousNumber>): Promise<AnonymousNumber> {
    return api.post<AnonymousNumber>('/extras/anonymous-number', data);
  },

  // Call Schedule
  async getCallSchedule(): Promise<CallSchedule | null> {
    return api.get('/extras/call-schedule');
  },
  async upsertCallSchedule(data: Partial<CallSchedule>): Promise<CallSchedule> {
    return api.post<CallSchedule>('/extras/call-schedule', data);
  },

  // Telegram Bot
  async getTelegramBot(): Promise<TelegramBotConfig | null> {
    return api.get('/extras/telegram-bot');
  },
  async upsertTelegramBot(data: Partial<TelegramBotConfig>): Promise<TelegramBotConfig> {
    return api.post<TelegramBotConfig>('/extras/telegram-bot', data);
  },

  // Ad Settings
  async getAdSettings(): Promise<AdSetting | null> {
    return api.get('/extras/ad-settings');
  },
  async upsertAdSettings(data: Partial<AdSetting>): Promise<AdSetting> {
    return api.post<AdSetting>('/extras/ad-settings', data);
  },
};
