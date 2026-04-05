export { authService } from './authService';
export { applicationService } from './applicationService';
export { notificationService } from './notificationService';
export { bookingService } from './bookingService';
export { examinationService } from './examinationService';

export type { IAuthService } from './authService';
export type { IApplicationService } from './applicationService';
export type { INotificationService } from './notificationService';
export type { IBookingService, GeoRegion, GeoDistrict, DoctorFilter } from './bookingService';
export type { ClinicSearchResult, ClinicFilters } from '../../app/types';
export type { IExaminationService, Center, CenterFilter } from './examinationService';
export { EXAMS_BY_CATEGORY } from './examinationService';
