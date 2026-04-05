import { api } from './apiClient';

export interface LabTest {
  id: string;
  testCode: string;
  testName: string;
  category: string;
  status: string;
  result?: any;
  resultText?: string;
  normalRange?: string;
  unit?: string;
  price: number;
  completedAt?: string;
}

export interface LabOrder {
  id: string;
  patientId: number;
  doctorId?: number;
  status: string;
  totalPrice: number;
  notes?: string;
  sampleDate?: string;
  completedAt?: string;
  createdAt: string;
  tests: LabTest[];
  patient?: { id: number; fullName: string; phone: string };
  doctor?: { id: number; fullName: string; specialty: string };
}

export interface LabCategory {
  code: string;
  name: string;
}

export const laboratoryService = {
  async createOrder(data: {
    patientId: number;
    doctorId?: number;
    applicationId?: number;
    notes?: string;
    tests: { testCode: string; testName: string; category: string; price: number }[];
  }): Promise<LabOrder> {
    return api.post('/laboratory/orders', data);
  },

  async getOrders(filters?: { patientId?: number; status?: string; page?: number; limit?: number }) {
    const params: string[] = [];
    if (filters?.patientId) params.push(`patientId=${filters.patientId}`);
    if (filters?.status) params.push(`status=${filters.status}`);
    if (filters?.page) params.push(`page=${filters.page}`);
    if (filters?.limit) params.push(`limit=${filters.limit}`);
    const url = '/laboratory/orders' + (params.length ? '?' + params.join('&') : '');
    return api.get(url);
  },

  async getOrder(id: string): Promise<LabOrder> {
    return api.get(`/laboratory/orders/${id}`);
  },

  async collectSample(orderId: string): Promise<LabOrder> {
    return api.put(`/laboratory/orders/${orderId}/collect-sample`, {});
  },

  async startProcessing(orderId: string): Promise<LabOrder> {
    return api.put(`/laboratory/orders/${orderId}/start`, {});
  },

  async updateTestResult(testId: string, data: { result?: any; resultText?: string }): Promise<LabTest> {
    return api.put(`/laboratory/tests/${testId}/result`, data);
  },

  async cancelOrder(orderId: string): Promise<LabOrder> {
    return api.put(`/laboratory/orders/${orderId}/cancel`, {});
  },

  async getCategories(): Promise<LabCategory[]> {
    return api.get('/laboratory/categories');
  },
};
