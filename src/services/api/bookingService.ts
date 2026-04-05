import { api } from './apiClient';
import type { User, ClinicSearchResult, ClinicFilters } from '../../app/types';

export interface DoctorFilter {
  query?: string;
  specialties?: string[];
}

export interface GeoDistrict {
  name: string;
  clinics: string[];
}

export interface GeoRegion {
  region: string;
  districts: { name: string; clinics: string[] }[];
}

function mapDoctor(d: any): User {
  return { ...d, role: d.role?.toLowerCase() };
}

export const bookingService = {
  async getDoctors(filters?: DoctorFilter): Promise<User[]> {
    let url = '/booking/doctors';
    const params: string[] = [];
    if (filters?.query) params.push(`query=${encodeURIComponent(filters.query)}`);
    if (filters?.specialties?.length) params.push(`specialties=${filters.specialties.join(',')}`);
    if (params.length) url += '?' + params.join('&');

    const data = await api.get<any[]>(url);
    return data.map(mapDoctor);
  },

  async getSlots(doctorId: number, date: string): Promise<Record<string, 'free' | 'busy'>> {
    return api.get(`/booking/doctors/${doctorId}/slots?date=${date}`);
  },

  async getGeo(): Promise<GeoRegion[]> {
    return api.get('/booking/geo');
  },

  async getSpecialties(): Promise<string[]> {
    return api.get('/booking/specialties');
  },

  /* ── TT-001: Klinika qidiruv ── */

  async searchClinics(filters: ClinicFilters): Promise<{ data: ClinicSearchResult[]; total: number }> {
    const params: string[] = [];
    if (filters.query) params.push(`q=${encodeURIComponent(filters.query)}`);
    if (filters.region) params.push(`region=${encodeURIComponent(filters.region)}`);
    if (filters.district) params.push(`district=${encodeURIComponent(filters.district)}`);
    if (filters.minServices) params.push(`minServices=${filters.minServices}`);
    const qs = params.length ? '?' + params.join('&') : '';
    return api.get(`/booking/clinics/search${qs}`);
  },

  async getNearbyClinics(lat: number, lng: number, radius?: number): Promise<ClinicSearchResult[]> {
    let url = `/booking/clinics/nearby?lat=${lat}&lng=${lng}`;
    if (radius) url += `&radius=${radius}`;
    return api.get(url);
  },

  async getTopClinics(limit?: number): Promise<ClinicSearchResult[]> {
    const qs = limit ? `?limit=${limit}` : '';
    return api.get(`/booking/clinics/top${qs}`);
  },
};
