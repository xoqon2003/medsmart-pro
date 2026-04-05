import { api } from './apiClient';
import type { FAQ, MedicalService } from '../../app/types';

export const faqService = {
  // ─── FAQ ────────────────────────────────────────────────────────────────────

  async getPublicFaq(doctorProfileId: string, category?: string): Promise<FAQ[]> {
    const params = category ? `?category=${category}` : '';
    return api.get<FAQ[]>(`/doctors/${doctorProfileId}/faq${params}`);
  },

  async createFaq(data: Omit<FAQ, 'id' | 'doctorId' | 'viewCount' | 'sortOrder' | 'isActive'>): Promise<FAQ> {
    return api.post<FAQ>('/faq', data);
  },

  async updateFaq(id: string, data: Partial<FAQ>): Promise<FAQ> {
    return api.patch<FAQ>(`/faq/${id}`, data);
  },

  async deleteFaq(id: string) {
    return api.delete(`/faq/${id}`);
  },

  // ─── Medical Services ───────────────────────────────────────────────────────

  async getPublicServices(doctorProfileId: string, category?: string): Promise<MedicalService[]> {
    const params = category ? `?category=${category}` : '';
    return api.get<MedicalService[]>(`/doctors/${doctorProfileId}/services${params}`);
  },

  async createService(data: Omit<MedicalService, 'id' | 'doctorId' | 'sortOrder' | 'isActive'>): Promise<MedicalService> {
    return api.post<MedicalService>('/services', data);
  },

  async updateService(id: string, data: Partial<MedicalService>): Promise<MedicalService> {
    return api.patch<MedicalService>(`/services/${id}`, data);
  },

  async deleteService(id: string) {
    return api.delete(`/services/${id}`);
  },
};
