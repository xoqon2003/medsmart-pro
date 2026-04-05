import { api } from './apiClient';

export interface MedicalRecord {
  id: string;
  patientId: number;
  doctorId: number;
  recordType: string;
  icdCode?: string;
  diagnosis?: string;
  symptoms: string[];
  findings?: string;
  treatment?: string;
  notes?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  attachments: string[];
  isConfidential: boolean;
  createdAt: string;
  patient?: { id: number; fullName: string; phone: string; birthDate?: string; gender?: string };
  doctor?: { id: number; fullName: string; specialty: string };
}

export interface Allergy {
  id: string;
  patientId: number;
  allergen: string;
  severity: string;
  reaction?: string;
  notes?: string;
}

export interface PatientSummary {
  patient: any;
  allergies: Allergy[];
  recentRecords: MedicalRecord[];
  recentLabOrders: any[];
  activePrescriptions: any[];
}

export interface IcdCode {
  code: string;
  name: string;
}

export const emrService = {
  async createRecord(data: {
    patientId: number;
    recordType: string;
    icdCode?: string;
    diagnosis?: string;
    symptoms?: string[];
    findings?: string;
    treatment?: string;
    notes?: string;
    vitals?: any;
  }): Promise<MedicalRecord> {
    return api.post('/emr/records', data);
  },

  async getPatientHistory(patientId: number, filters?: { recordType?: string; page?: number }) {
    const params: string[] = [];
    if (filters?.recordType) params.push(`recordType=${filters.recordType}`);
    if (filters?.page) params.push(`page=${filters.page}`);
    const url = `/emr/patients/${patientId}/history` + (params.length ? '?' + params.join('&') : '');
    return api.get(url);
  },

  async getRecord(id: string): Promise<MedicalRecord> {
    return api.get(`/emr/records/${id}`);
  },

  async updateRecord(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    return api.put(`/emr/records/${id}`, data);
  },

  async getPatientSummary(patientId: number): Promise<PatientSummary> {
    return api.get(`/emr/patients/${patientId}/summary`);
  },

  async getPatientAllergies(patientId: number): Promise<Allergy[]> {
    return api.get(`/emr/patients/${patientId}/allergies`);
  },

  async addAllergy(patientId: number, data: { allergen: string; severity: string; reaction?: string; notes?: string }): Promise<Allergy> {
    return api.post(`/emr/patients/${patientId}/allergies`, data);
  },

  async removeAllergy(id: string) {
    return api.delete(`/emr/allergies/${id}`);
  },

  async searchIcdCodes(query: string): Promise<IcdCode[]> {
    return api.get(`/emr/icd/search?q=${encodeURIComponent(query)}`);
  },
};
