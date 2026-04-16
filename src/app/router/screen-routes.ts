/**
 * Screen ↔ URL Path mapping.
 *
 * Nima uchun?
 *   Hozirgi navigation: navigate('patient_home') — URL yo'q, browser back
 *   ishlamaydi, deep link mumkin emas. Endi har ekran URL ga bog'lanadi.
 *
 * Til tanlovi: Uzbek slug — foydalanuvchi uchun tushunarli.
 *   patient_home → /bemor
 *   doctor_dashboard → /shifokor
 *   radiolog_dashboard → /radiolog
 *   web_admin → /web/admin
 *
 * Backward compatibility:
 *   useNavigation().navigate('screen') API o'zgarmaydi. 84 consumer tegmaydi.
 *   Faqat NavigationContext ichida React Router ishlatamiz.
 */

import type { Screen } from '../types';

/**
 * Screen → URL path.
 * Har bir Screen turidagi qiymat uchun URL path.
 */
export const SCREEN_TO_PATH: Record<Screen, string> = {
  // ── Eager ────────────────────────────────────────────────────────────────
  splash:              '/',
  role_select:         '/rol',

  // ── Bemor (Patient) ──────────────────────────────────────────────────────
  patient_home:        '/bemor',
  patient_profile:     '/bemor/profil',
  patient_upload:      '/bemor/fayl-yuklash',
  patient_anamnez:     '/bemor/anamnez',
  patient_service:     '/bemor/xizmat',
  patient_contract:    '/bemor/shartnoma',
  patient_payment:     '/bemor/tolov',
  patient_status:      '/bemor/status',
  patient_conclusion:  '/bemor/xulosa',

  // Konsultatsiya oqimi
  patient_konsultatsiya:   '/bemor/konsultatsiya',
  patient_kons_type:       '/bemor/konsultatsiya/tur',
  patient_kons_subtype:    '/bemor/konsultatsiya/subtur',
  patient_kons_doctor:     '/bemor/konsultatsiya/shifokor',
  patient_kons_calendar:   '/bemor/konsultatsiya/kalendar',
  patient_kons_sanatorium: '/bemor/konsultatsiya/sanatoriy',
  patient_kons_anamnez:    '/bemor/konsultatsiya/anamnez',
  patient_kons_confirm:    '/bemor/konsultatsiya/tasdiqlash',

  // Tekshiruv oqimi
  patient_tekshiruv:      '/bemor/tekshiruv',
  patient_tks_category:   '/bemor/tekshiruv/kategoriya',
  patient_tks_exam:       '/bemor/tekshiruv/turi',
  patient_tks_center:     '/bemor/tekshiruv/markaz',
  patient_tks_calendar:   '/bemor/tekshiruv/kalendar',
  patient_tks_confirm:    '/bemor/tekshiruv/tasdiqlash',

  // Uyga chaqirish
  home_visit_address:    '/bemor/uyga-chaqirish/manzil',
  home_visit_contact:    '/bemor/uyga-chaqirish/aloqa',
  home_visit_time:       '/bemor/uyga-chaqirish/vaqt',
  home_visit_specialist: '/bemor/uyga-chaqirish/mutaxassis',
  home_visit_confirm:    '/bemor/uyga-chaqirish/tasdiqlash',

  // AI Tavsiya
  patient_symptom_input:      '/bemor/ai/simptomlar',
  patient_adaptive_questions: '/bemor/ai/savollar',
  patient_diagnosis_results:  '/bemor/ai/natija',

  // Aloqa va Booking
  patient_contact_form:     '/bemor/aloqa-shakli',
  patient_booking_calendar: '/bemor/booking/kalendar',
  patient_booking_confirm:  '/bemor/booking/tasdiqlash',

  // ── Radiolog ─────────────────────────────────────────────────────────────
  radiolog_dashboard:  '/radiolog',
  radiolog_view:       '/radiolog/ariza',
  radiolog_conclude:   '/radiolog/xulosa',
  radiolog_specialist: '/radiolog/yuborish',

  // ── Shifokor (Doctor) ────────────────────────────────────────────────────
  doctor_dashboard:        '/shifokor',
  doctor_patient_view:     '/shifokor/bemor',
  doctor_profile_setup:    '/shifokor/profil-sozlash',
  doctor_public_profile:   '/d/:slug', // Deep link — URL param
  doctor_private_panel:    '/shifokor/panel',
  doctor_tariff_select:    '/shifokor/tarif',
  doctor_clinic_manage:    '/shifokor/klinika',
  doctor_verification:     '/shifokor/tasdiqlash',
  doctor_portfolio:        '/shifokor/portfolio',
  doctor_portfolio_edit:   '/shifokor/portfolio/tahrirlash',
  doctor_contact_requests: '/shifokor/aloqa-sorovlari',
  doctor_template_manager: '/shifokor/shablonlar',
  doctor_faq_view:         '/shifokor/faq',
  doctor_faq_editor:       '/shifokor/faq/tahrirlash',
  doctor_services_view:    '/shifokor/xizmatlar',
  doctor_services_editor:  '/shifokor/xizmatlar/tahrirlash',
  doctor_anonymous_number: '/shifokor/anonim-raqam',
  doctor_telegram_bot:     '/shifokor/telegram-bot',
  doctor_ad_settings:      '/shifokor/reklama',
  doctor_share_profile:    '/shifokor/ulashish',
  doctor_calendar_view:    '/shifokor/kalendar',
  doctor_calendar_settings: '/shifokor/kalendar/sozlamalar',

  // ── Operator, Admin, Specialist, Kassir (Mobile) ─────────────────────────
  operator_dashboard:   '/operator',
  admin_dashboard:      '/admin',
  specialist_dashboard: '/mutaxassis',
  kassir_dashboard:     '/kassir',

  // ── Shared ───────────────────────────────────────────────────────────────
  notifications:      '/bildirishnomalar',
  profile:            '/profil',
  conversations_list: '/suhbatlar',
  chat_screen:        '/suhbat',

  // ── Web Platform (Desktop) ───────────────────────────────────────────────
  web_login:          '/web/login',
  web_dashboard:      '/web',
  web_admin:          '/web/admin',
  web_operator:       '/web/operator',
  web_kassir:         '/web/kassir',
  web_radiolog:       '/web/radiolog',
  web_specialist:     '/web/mutaxassis',
  web_doctor:         '/web/shifokor',
  web_onlayn:         '/web/onlayn-qabul',
  web_arizalar:       '/web/arizalar',
  web_notifications:  '/web/bildirishnomalar',
  web_settings:       '/web/sozlamalar',
  web_bemor_profili:  '/web/bemor/profil',

  // Web Admin (kengaytirilgan)
  web_doctor_profiles: '/web/admin/shifokorlar',
  web_tariff_manage:   '/web/admin/tariflar',
  web_calendar_manage: '/web/admin/kalendar',

  // Web Spravochnik
  web_ref_specialties:  '/web/spravochnik/ixtisosliklar',
  web_ref_regions:      '/web/spravochnik/hududlar',
  web_ref_diagnoses:    '/web/spravochnik/tashxislar',
  web_ref_drugs:        '/web/spravochnik/dorilar',
  web_ref_lab_tests:    '/web/spravochnik/laboratoriya',
  web_ref_services:     '/web/spravochnik/xizmatlar',
  web_ref_templates:    '/web/spravochnik/shablonlar',
  web_ref_exam_centers: '/web/spravochnik/tekshiruv-markazlari',

  // Klinik Bilim Bazasi
  web_ref_kb_diseases:  '/web/kb/kasalliklar',
  web_ref_kb_symptoms:  '/web/kb/simptomlar',
  web_ref_kb_protocols: '/web/kb/protokollar',
  web_ref_kb_drugs:     '/web/kb/dorilar',

  // Web Admin — batafsil
  web_admin_dashboard:      '/web/admin/boshqaruv',
  web_admin_users:          '/web/admin/foydalanuvchilar',
  web_admin_roles:          '/web/admin/rollar',
  web_admin_audit:          '/web/admin/audit',
  web_admin_settings:       '/web/admin/sozlamalar',
  web_admin_logs:           '/web/admin/loglar',
  web_admin_sessions:       '/web/admin/sessiyalar',
  web_admin_payments:       '/web/admin/tolovlar',
  web_admin_doctors_report: '/web/admin/shifokorlar-hisobot',
  web_admin_apps_report:    '/web/admin/arizalar-hisobot',

  // Web Operator — batafsil
  web_op_dashboard:      '/web/operator/boshqaruv',
  web_op_create_app:     '/web/operator/ariza-yaratish',
  web_op_applications:   '/web/operator/arizalar',
  web_op_patient_search: '/web/operator/bemor-qidirish',
  web_op_queue:          '/web/operator/navbat',

  // Web Doctor — batafsil
  web_doc_dashboard:    '/web/shifokor/boshqaruv',
  web_doc_patients:     '/web/shifokor/bemorlar',
  web_doc_reception:    '/web/shifokor/qabul',
  web_doc_conclusion:   '/web/shifokor/xulosa',
  web_doc_prescription: '/web/shifokor/retsept',
  web_doc_lab_order:    '/web/shifokor/laboratoriya',
  web_doc_emr:          '/web/shifokor/emr',
  web_doc_statistics:   '/web/shifokor/statistika',

  // Web Kassa — batafsil
  web_kassa_dashboard:    '/web/kassa/boshqaruv',
  web_kassa_payment:      '/web/kassa/tolov',
  web_kassa_receipt:      '/web/kassa/chek',
  web_kassa_shift_report: '/web/kassa/smena-hisoboti',
  web_kassa_history:      '/web/kassa/tarix',
};

/**
 * URL path → Screen (reverse map).
 *
 * NavigationContext currentScreen ni location.pathname dan derive qiladi.
 * Dinamik URL lar (/d/:slug) static map da yo'q — ular alohida matching qilinadi.
 */
export const PATH_TO_SCREEN: Record<string, Screen> = Object.fromEntries(
  (Object.entries(SCREEN_TO_PATH) as [Screen, string][])
    .filter(([, path]) => !path.includes(':')) // Dynamic paths tashlab yuboriladi
    .map(([screen, path]) => [path, screen]),
) as Record<string, Screen>;

/**
 * Dynamic URL patternlari (route param bilan).
 * React Router bu patternlarni avtomatik match qiladi, lekin bizga
 * location.pathname → Screen reverse lookup uchun kerak.
 */
const DYNAMIC_PATTERNS: Array<{ pattern: RegExp; screen: Screen }> = [
  { pattern: /^\/d\/[^/]+$/, screen: 'doctor_public_profile' },
];

/**
 * Joriy URL pathdan Screen ni aniqlash.
 * Static path bo'lsa — PATH_TO_SCREEN dan.
 * Dynamic bo'lsa — regex matching.
 * Topilmasa — 'splash'.
 */
export function pathToScreen(pathname: string): Screen {
  // 1. Static match
  const exact = PATH_TO_SCREEN[pathname];
  if (exact) return exact;

  // 2. Dynamic patternlar
  for (const { pattern, screen } of DYNAMIC_PATTERNS) {
    if (pattern.test(pathname)) return screen;
  }

  // 3. Default — splash
  return 'splash';
}

/**
 * Screen → path conversion (navigate uchun).
 * Dynamic route uchun param berilsa substitution qiladi.
 *
 * @example
 * screenToPath('patient_home')                      // '/bemor'
 * screenToPath('doctor_public_profile', { slug: 'dr-aziz' }) // '/d/dr-aziz'
 */
export function screenToPath(
  screen: Screen,
  params?: Record<string, string>,
): string {
  let path = SCREEN_TO_PATH[screen];
  if (!path) return '/';

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  return path;
}
