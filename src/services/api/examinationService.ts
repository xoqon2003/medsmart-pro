import { api } from './apiClient';

export interface Center {
  id: number;
  name: string;
  region: string;
  district: string;
  rating: number;
  price: number;
  distanceKm: number;
}

export interface CenterFilter {
  region?: string;
  district?: string;
}

export const examinationService = {
  async getCenters(filters?: CenterFilter): Promise<Center[]> {
    let url = '/examinations/centers';
    const params: string[] = [];
    if (filters?.region) params.push(`region=${encodeURIComponent(filters.region)}`);
    if (filters?.district) params.push(`district=${encodeURIComponent(filters.district)}`);
    if (params.length) url += '?' + params.join('&');

    return api.get(url);
  },

  async getExamsByCategory(category: string): Promise<string[]> {
    return api.get(`/examinations/exams/${category}`);
  },
};
