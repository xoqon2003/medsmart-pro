import { api } from './apiClient';
import type { DoctorProfile, Tariff } from '../../app/types';

export interface CreateDoctorProfileData {
  bio?: string;
  birthDate?: string;
  experienceYears?: number;
  subSpecialties?: string[];
  qualificationCategory?: string;
  licenseNumber?: string;
  socialLinks?: Record<string, string>;
  profileUrl?: string;
  isPublic?: boolean;
}

export interface AddClinicData {
  clinicId: string;
  position?: string;
  department?: string;
  cabinet?: string;
  floor?: number;
}

export interface AddOperationData {
  operationCode: string;
  operationName: string;
  operationNameRu?: string;
  category: string;
  complexity?: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'VERY_COMPLEX';
  avgDurationMin?: number;
  description?: string;
}

interface DoctorsListResponse {
  items: DoctorProfile[];
  total: number;
  page: number;
  limit: number;
}

export const doctorService = {
  // ─── Public ─────────────────────────────────────────────────────────────────

  async getAll(page = 1, limit = 20, specialty?: string): Promise<DoctorsListResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (specialty) params.set('specialty', specialty);
    return api.get<DoctorsListResponse>(`/doctors?${params}`);
  },

  async getPublicProfile(id: string): Promise<DoctorProfile> {
    return api.get<DoctorProfile>(`/doctors/${id}`);
  },

  async getProfileBySlug(slug: string): Promise<DoctorProfile> {
    return api.get<DoctorProfile>(`/doctors/url/${slug}`);
  },

  async getStats(id: string) {
    return api.get<{
      totalConsultations: number;
      totalOperations: number;
      onlineConsultations: number;
      offlineConsultations: number;
      averageRating: number;
      totalRatings: number;
      overallRank: number | null;
      specialtyRank: number | null;
    }>(`/doctors/${id}/stats`);
  },

  // ─── Authenticated ──────────────────────────────────────────────────────────

  async getMyProfile(): Promise<DoctorProfile> {
    return api.get<DoctorProfile>('/doctors/me/profile');
  },

  async createProfile(data: CreateDoctorProfileData): Promise<DoctorProfile> {
    return api.post<DoctorProfile>('/doctors/profile', data);
  },

  async updateProfile(data: Partial<CreateDoctorProfileData>): Promise<DoctorProfile> {
    return api.patch<DoctorProfile>('/doctors/profile', data);
  },

  async addClinic(data: AddClinicData) {
    return api.post('/doctors/clinics', data);
  },

  async removeClinic(doctorClinicId: string) {
    return api.delete(`/doctors/clinics/${doctorClinicId}`);
  },

  async addOperationType(data: AddOperationData) {
    return api.post('/doctors/operations', data);
  },

  async subscribeTariff(tariffCode: string): Promise<DoctorProfile> {
    return api.post<DoctorProfile>('/doctors/subscribe', { tariffCode });
  },
};
