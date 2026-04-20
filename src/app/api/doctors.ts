import { apiFetch } from './http';

export interface DoctorItem {
  id: number;
  fullName: string;
  specialty: string | null;
  experience: number | null;
  rating: number | null;
  city: string | null;
  avatar: string | null;
}

/**
 * Tizimdagi shifokorlar ro'yxati.
 * GET /users?role=DOCTOR   (mavjud endpoint, auth shart emas — demo uchun)
 */
export const listDoctors = () =>
  apiFetch<DoctorItem[]>('/users', { params: { role: 'DOCTOR' } });
