import { api } from './apiClient';
import type { Application } from '../../app/types';

// Backend enum → frontend lowercase mapping
function mapApplication(app: any): Application {
  return {
    ...app,
    status: app.status?.toLowerCase(),
    serviceType: app.serviceType?.toLowerCase()?.replace(/_/g, '_'),
    urgency: app.urgency?.toLowerCase(),
    price: Number(app.price),
    patient: app.patient ? { ...app.patient, role: app.patient.role?.toLowerCase() } : undefined,
    radiolog: app.radiolog ? { ...app.radiolog, role: app.radiolog.role?.toLowerCase() } : undefined,
    specialist: app.specialist ? { ...app.specialist, role: app.specialist.role?.toLowerCase() } : undefined,
    doctor: app.doctor ? { ...app.doctor, role: app.doctor.role?.toLowerCase() } : undefined,
    payment: app.payment ? {
      ...app.payment,
      amount: Number(app.payment.amount),
      provider: app.payment.provider?.toLowerCase(),
      status: app.payment.status?.toLowerCase(),
    } : undefined,
    conclusions: app.conclusions?.map((c: any) => ({
      ...c,
      conclusionType: c.conclusionType?.toLowerCase()?.replace(/_/g, '_'),
    })),
    auditLog: app.auditLog,
  };
}

// Map frontend enum to backend
function toBackendServiceType(st: string): string {
  return st.toUpperCase();
}

export const applicationService = {
  async getAll(): Promise<Application[]> {
    const result = await api.get<{ data: any[]; meta: any }>('/applications?limit=100');
    return result.data.map(mapApplication);
  },

  async getById(id: number): Promise<Application> {
    const app = await api.get<any>(`/applications/${id}`);
    return mapApplication(app);
  },

  async create(data: any): Promise<Application> {
    const payload = {
      ...data,
      serviceType: toBackendServiceType(data.serviceType),
      urgency: data.urgency?.toUpperCase(),
    };
    const app = await api.post<any>('/applications', payload);
    return mapApplication(app);
  },

  async update(id: number, data: any): Promise<Application> {
    const app = await api.put<any>(`/applications/${id}`, data);
    return mapApplication(app);
  },

  async updateStatus(id: number, status: string, notes?: string): Promise<Application> {
    const app = await api.patch<any>(`/applications/${id}/status`, { status, notes });
    return mapApplication(app);
  },
};
