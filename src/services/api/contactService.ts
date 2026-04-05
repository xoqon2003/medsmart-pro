import { api } from './apiClient';
import type { ContactRequest, MessageTemplate } from '../../app/types';

export const contactService = {
  // ─── Contact Requests ───────────────────────────────────────────────────────

  async createRequest(data: {
    doctorId: string;
    patientId?: number;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    requestType: string;
    message: string;
    templateUsed?: string;
  }): Promise<ContactRequest> {
    return api.post<ContactRequest>('/contacts/request', data);
  },

  async getRequests(status?: string): Promise<ContactRequest[]> {
    const params = status ? `?status=${status}` : '';
    return api.get<ContactRequest[]>(`/contacts/requests${params}`);
  },

  async updateStatus(id: string, status: string): Promise<ContactRequest> {
    return api.patch<ContactRequest>(`/contacts/requests/${id}`, { status });
  },

  async reply(id: string, reply: string): Promise<ContactRequest> {
    return api.post<ContactRequest>(`/contacts/requests/${id}/reply`, { reply });
  },

  // ─── Message Templates ──────────────────────────────────────────────────────

  async getTemplates(): Promise<MessageTemplate[]> {
    return api.get<MessageTemplate[]>('/templates');
  },

  async getPublicTemplates(doctorProfileId: string): Promise<Pick<MessageTemplate, 'id' | 'category' | 'title' | 'content'>[]> {
    return api.get(`/doctors/${doctorProfileId}/templates`);
  },

  async createTemplate(data: { category: string; title: string; content: string; sortOrder?: number }): Promise<MessageTemplate> {
    return api.post<MessageTemplate>('/templates', data);
  },

  async updateTemplate(id: string, data: Partial<MessageTemplate>): Promise<MessageTemplate> {
    return api.patch<MessageTemplate>(`/templates/${id}`, data);
  },

  async deleteTemplate(id: string) {
    return api.delete(`/templates/${id}`);
  },
};
