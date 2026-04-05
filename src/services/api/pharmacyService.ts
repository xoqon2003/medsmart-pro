import { api } from './apiClient';

export interface Medicine {
  id: string;
  name: string;
  nameRu?: string;
  genericName?: string;
  manufacturer?: string;
  category: string;
  form: string;
  dosage?: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  requiresRx: boolean;
  description?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  isFilled: boolean;
  medicine?: Medicine;
}

export interface Prescription {
  id: string;
  patientId: number;
  doctorId: number;
  status: string;
  diagnosis?: string;
  notes?: string;
  validUntil?: string;
  createdAt: string;
  items: PrescriptionItem[];
  patient?: { id: number; fullName: string; phone: string };
  doctor?: { id: number; fullName: string; specialty: string };
}

export const pharmacyService = {
  async createPrescription(data: {
    patientId: number;
    diagnosis?: string;
    notes?: string;
    validUntil?: string;
    items: { medicineName: string; dosage: string; frequency: string; duration: string; quantity: number; instructions?: string }[];
  }): Promise<Prescription> {
    return api.post('/pharmacy/prescriptions', data);
  },

  async getPrescriptions(filters?: { patientId?: number; doctorId?: number; status?: string; page?: number }) {
    const params: string[] = [];
    if (filters?.patientId) params.push(`patientId=${filters.patientId}`);
    if (filters?.doctorId) params.push(`doctorId=${filters.doctorId}`);
    if (filters?.status) params.push(`status=${filters.status}`);
    if (filters?.page) params.push(`page=${filters.page}`);
    const url = '/pharmacy/prescriptions' + (params.length ? '?' + params.join('&') : '');
    return api.get(url);
  },

  async getPrescription(id: string): Promise<Prescription> {
    return api.get(`/pharmacy/prescriptions/${id}`);
  },

  async fillItem(itemId: string) {
    return api.put(`/pharmacy/prescriptions/items/${itemId}/fill`, {});
  },

  async getMedicines(filters?: { category?: string; query?: string; page?: number }) {
    const params: string[] = [];
    if (filters?.category) params.push(`category=${encodeURIComponent(filters.category)}`);
    if (filters?.query) params.push(`query=${encodeURIComponent(filters.query)}`);
    if (filters?.page) params.push(`page=${filters.page}`);
    const url = '/pharmacy/medicines' + (params.length ? '?' + params.join('&') : '');
    return api.get(url);
  },

  async createMedicine(data: Partial<Medicine>): Promise<Medicine> {
    return api.post('/pharmacy/medicines', data);
  },

  async updateMedicine(id: string, data: Partial<Medicine>): Promise<Medicine> {
    return api.put(`/pharmacy/medicines/${id}`, data);
  },

  async updateStock(id: string, quantity: number) {
    return api.put(`/pharmacy/medicines/${id}/stock`, { quantity });
  },

  async getCategories() {
    return api.get('/pharmacy/categories');
  },
};
