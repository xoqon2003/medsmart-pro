import { api } from './apiClient';
import type { Education, WorkExperience, Achievement, Certificate } from '../../app/types';

export const portfolioService = {
  // ─── Portfolio olish ────────────────────────────────────────────────────────

  async getPortfolio(doctorProfileId: string) {
    return api.get<{
      id: string;
      experienceYears: number;
      totalConsultations: number;
      totalOperations: number;
      averageRating: number;
      totalRatings: number;
      overallRank: number | null;
      specialtyRank: number | null;
      education: Education[];
      workExperience: WorkExperience[];
      achievements: Achievement[];
      certificates: Certificate[];
    }>(`/doctors/${doctorProfileId}/portfolio`);
  },

  // ─── Education ──────────────────────────────────────────────────────────────

  async addEducation(data: Omit<Education, 'id' | 'doctorId' | 'isVerified'>): Promise<Education> {
    return api.post<Education>('/portfolio/education', data);
  },

  async updateEducation(id: string, data: Partial<Education>): Promise<Education> {
    return api.patch<Education>(`/portfolio/education/${id}`, data);
  },

  async deleteEducation(id: string) {
    return api.delete(`/portfolio/education/${id}`);
  },

  // ─── WorkExperience ─────────────────────────────────────────────────────────

  async addExperience(data: Omit<WorkExperience, 'id' | 'doctorId'>): Promise<WorkExperience> {
    return api.post<WorkExperience>('/portfolio/experience', data);
  },

  async updateExperience(id: string, data: Partial<WorkExperience>): Promise<WorkExperience> {
    return api.patch<WorkExperience>(`/portfolio/experience/${id}`, data);
  },

  async deleteExperience(id: string) {
    return api.delete(`/portfolio/experience/${id}`);
  },

  // ─── Achievement ────────────────────────────────────────────────────────────

  async addAchievement(data: Omit<Achievement, 'id' | 'doctorId' | 'isVerified'>): Promise<Achievement> {
    return api.post<Achievement>('/portfolio/achievements', data);
  },

  async updateAchievement(id: string, data: Partial<Achievement>): Promise<Achievement> {
    return api.patch<Achievement>(`/portfolio/achievements/${id}`, data);
  },

  async deleteAchievement(id: string) {
    return api.delete(`/portfolio/achievements/${id}`);
  },

  // ─── Certificate ────────────────────────────────────────────────────────────

  async addCertificate(data: Omit<Certificate, 'id' | 'doctorId' | 'isVerified'>): Promise<Certificate> {
    return api.post<Certificate>('/portfolio/certificates', data);
  },

  async updateCertificate(id: string, data: Partial<Certificate>): Promise<Certificate> {
    return api.patch<Certificate>(`/portfolio/certificates/${id}`, data);
  },

  async deleteCertificate(id: string) {
    return api.delete(`/portfolio/certificates/${id}`);
  },
};
