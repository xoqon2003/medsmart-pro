import { api } from './apiClient';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const fileStorageService = {
  async uploadAvatar(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/files/avatar', formData);
  },

  async uploadDocument(file: File, applicationId: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload(`/files/document/${applicationId}`, formData);
  },

  async uploadConclusion(file: File, conclusionId: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload(`/files/conclusion/${conclusionId}`, formData);
  },

  async uploadPortfolio(file: File, doctorId: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload(`/files/portfolio/${doctorId}`, formData);
  },

  async deleteFile(bucket: string, key: string) {
    return api.delete(`/files/${bucket}/${key}`);
  },

  async getSignedUrl(bucket: string, key: string, expiresIn?: number): Promise<string> {
    const params = [`bucket=${bucket}`, `key=${key}`];
    if (expiresIn) params.push(`expiresIn=${expiresIn}`);
    const result = await api.get<{ url: string }>(`/files/signed-url?${params.join('&')}`);
    return result.url;
  },
};
