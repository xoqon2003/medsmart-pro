import { api } from './apiClient';
import type { Tariff } from '../../app/types';

export const tariffService = {
  async getAll(): Promise<Tariff[]> {
    return api.get<Tariff[]>('/tariffs');
  },

  async getById(id: string): Promise<Tariff> {
    return api.get<Tariff>(`/tariffs/${id}`);
  },
};
