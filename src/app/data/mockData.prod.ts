// Production stub — faqat production build'da ishlatiladi (vite.config.ts aliasi orqali).
// mockData.ts o'rniga bo'sh massivlar qaytaradi — komponlarga null-xavfsiz fallback.
// Haqiqiy ma'lumotlar real API va useApp() store'dan keladi.
import type { User, Application, Notification, PricingConfig, KassaTolov, KassaSmena } from '../types';

// PRICING — haqiqiy biznes mantiq uchun kerak, production'da ham saqlanadi.
export const PRICING: PricingConfig = {
  ai_radiolog: 150000,
  radiolog_only: 200000,
  radiolog_specialist: 350000,
  urgencyMultiplier: {
    normal: 1.0,
    urgent: 1.5,
    emergency: 2.0,
  },
};

// Quyidagilar production'da bo'sh — ma'lumotlar API'dan keladi.
export const mockUsers: User[] = [];
export const mockApplications: Application[] = [];
export const mockNotifications: Notification[] = [];
export const mockKassaTolovlar: KassaTolov[] = [];

export const mockKassaSmena: KassaSmena = {
  id: 0,
  kassirId: 0,
  kassirIsmi: '',
  ochilganVaqt: new Date().toISOString(),
  boshlanghichQoldiq: 0,
  naqd: 0,
  karta: 0,
  onlayn: 0,
  jami: 0,
  tolovlarSoni: 0,
  holati: 'ochiq',
};
