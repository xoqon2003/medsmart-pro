// Mock servislar (backend ishlamayotganda)
export * from './mock';

// Mock'da yo'q servislarni API'dan import qilamiz (fallback)
export { doctorService } from './api/doctorService';
export { tariffService } from './api/tariffService';
export { portfolioService } from './api/portfolioService';
export { contactService } from './api/contactService';
export { messageService } from './api/messageService';
export { faqService } from './api/faqService';
export { extrasService } from './api/extrasService';
export { calendarService } from './api/calendarService';
export { wsService } from './api/websocketService';
export { laboratoryService } from './api/laboratoryService';
export type { LabOrder, LabTest, LabCategory } from './api/laboratoryService';
export { pharmacyService } from './api/pharmacyService';
export type { Prescription, PrescriptionItem, Medicine } from './api/pharmacyService';
export { emrService } from './api/emrService';
export type { MedicalRecord, Allergy, PatientSummary, IcdCode } from './api/emrService';
export { fileStorageService } from './api/fileStorageService';
export type { UploadResult } from './api/fileStorageService';
