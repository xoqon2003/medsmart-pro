// Production build uchun: real API implementatsiyalari.
// Bu fayl vite.config.ts aliasi orqali core-switch.mock.ts o'rniga ishlatiladi.
// mockData.ts hech qachon import qilinmaydi → bundle dan chiqariladi.

export { authService } from './api/authService';
export { applicationService } from './api/applicationService';
export { notificationService } from './api/notificationService';
export { bookingService } from './api/bookingService';
export { examinationService } from './api/examinationService';

// EXAMS_BY_CATEGORY — mock/examinationService.ts da aniqlangan statik konstanta,
// u mockData.ts ga bog'liq EMAS, shuning uchun production'da ham xavfsiz.
export { EXAMS_BY_CATEGORY } from './mock/examinationService';

// Type-only re-exportlar — Vite/esbuild ular uchun hech qanday kod generatsiya qilmaydi.
export type { IAuthService } from './mock/authService';
export type { IApplicationService } from './mock/applicationService';
export type { INotificationService } from './mock/notificationService';
export type { IBookingService, GeoRegion, GeoDistrict, DoctorFilter } from './mock/bookingService';
export type { IExaminationService, Center, CenterFilter } from './mock/examinationService';
export type { ClinicSearchResult, ClinicFilters } from '../app/types';
