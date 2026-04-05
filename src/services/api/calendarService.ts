import { api } from './apiClient';
import type { CalendarSetting, CalendarSlot, ConsultationRequest } from '../../app/types';

export const calendarService = {
  // Public
  async getCalendar(doctorId: string, year: number, month: number): Promise<{ settings: CalendarSetting | null; slots: CalendarSlot[] }> {
    return api.get(`/calendar/${doctorId}?year=${year}&month=${month}`);
  },

  async getSlots(doctorId: string, date: string): Promise<CalendarSlot[]> {
    return api.get<CalendarSlot[]>(`/calendar/${doctorId}/slots?date=${date}`);
  },

  // Doctor settings
  async getSettings(): Promise<CalendarSetting | null> {
    return api.get('/calendar/settings/me');
  },

  async upsertSettings(data: Partial<CalendarSetting>): Promise<CalendarSetting> {
    return api.post<CalendarSetting>('/calendar/settings', data);
  },

  // Generate slots
  async generateSlots(startDate: string, endDate: string): Promise<{ message: string; count: number }> {
    return api.post('/calendar/generate', { startDate, endDate });
  },

  // Block/Unblock
  async blockSlot(data: { date: string; startTime: string; endTime: string; blockReason?: string }): Promise<CalendarSlot> {
    return api.post<CalendarSlot>('/calendar/block', data);
  },

  async unblockSlot(slotId: string) {
    return api.delete(`/calendar/block/${slotId}`);
  },

  // Consultation
  async bookConsultation(data: {
    doctorId: string; slotId: string; consultType: string;
    patientName?: string; patientPhone?: string; reason?: string;
  }): Promise<ConsultationRequest> {
    return api.post<ConsultationRequest>('/consultations/book', data);
  },

  async cancelConsultation(id: string, cancelReason: string, cancelledBy: string) {
    return api.patch(`/consultations/${id}/cancel`, { cancelReason, cancelledBy });
  },

  async completeConsultation(id: string) {
    return api.patch(`/consultations/${id}/complete`);
  },

  async rateConsultation(id: string, rating: number, comment?: string) {
    return api.post(`/consultations/${id}/rate`, { rating, comment });
  },

  async rescheduleConsultation(id: string, newSlotId: string) {
    return api.patch(`/consultations/${id}/reschedule`, { newSlotId });
  },
};
