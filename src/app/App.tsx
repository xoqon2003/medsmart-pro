import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AppProvider, useApp } from './store/appStore';
import { LocaleProvider } from './store/LocaleContext';
import { BottomNav, SHOW_NAV_ON } from './components/ui/BottomNav';
import { ServiceSelectionBottomSheet } from './components/patient/ServiceSelectionBottomSheet';
import type { Screen } from './types';

// ── Eager (darhol yuklanadi) ──────────────────────────────────────────────────
import { SplashScreen } from './components/screens/SplashScreen';
import { RoleSelect }   from './components/screens/RoleSelect';
import { TermsAcceptDialog } from './components/common/TermsAcceptDialog';
import { PWAUpdatePrompt } from './components/common/PWAUpdatePrompt';
import { OfflineBanner } from './components/common/OfflineBanner';

// ── Lazy (ekranga o'tgandagina yuklanadi) ────────────────────────────────────
const lazy$ = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ [key: string]: T }>,
  name: string,
) =>
  lazy(() => factory().then((m) => ({ default: m[name] as T })));

// Patient
const PatientProfile         = lazy$(() => import('./components/screens/PatientProfile'),                      'PatientProfile');
const PatientHome            = lazy$(() => import('./components/screens/patient/PatientHome'),                  'PatientHome');
const FileUpload             = lazy$(() => import('./components/screens/patient/FileUpload'),                   'FileUpload');
const Anamnez                = lazy$(() => import('./components/screens/patient/Anamnez'),                     'Anamnez');
const ServiceSelect          = lazy$(() => import('./components/screens/patient/ServiceSelect'),                'ServiceSelect');
const Contract               = lazy$(() => import('./components/screens/patient/Contract'),                    'Contract');
const Payment                = lazy$(() => import('./components/screens/patient/Payment'),                     'Payment');
const StatusTracker          = lazy$(() => import('./components/screens/patient/StatusTracker'),               'StatusTracker');
const ConclusionView         = lazy$(() => import('./components/screens/patient/ConclusionView'),              'ConclusionView');
const KonsultatsiyaType      = lazy$(() => import('./components/screens/patient/KonsultatsiyaType'),           'KonsultatsiyaType');
const KonsultatsiyaSubType   = lazy$(() => import('./components/screens/patient/KonsultatsiyaSubType'),        'KonsultatsiyaSubType');
const KonsultatsiyaDoctor    = lazy$(() => import('./components/screens/patient/KonsultatsiyaDoctor'),         'KonsultatsiyaDoctor');
const KonsultatsiyaCalendar  = lazy$(() => import('./components/screens/patient/KonsultatsiyaCalendar'),       'KonsultatsiyaCalendar');
const KonsultatsiyaAnamnez   = lazy$(() => import('./components/screens/patient/KonsultatsiyaAnamnez'),        'KonsultatsiyaAnamnez');
const KonsultatsiyaConfirm   = lazy$(() => import('./components/screens/patient/KonsultatsiyaConfirm'),        'KonsultatsiyaConfirm');
const KonsultatsiyaSanatorium= lazy$(() => import('./components/screens/patient/KonsultatsiyaSanatorium'),     'KonsultatsiyaSanatorium');
const UygaChaqirishManzil    = lazy$(() => import('./components/screens/patient/UygaChaqirishManzil'),         'UygaChaqirishManzil');
const UygaChaqirishAloqa     = lazy$(() => import('./components/screens/patient/UygaChaqirishAloqa'),          'UygaChaqirishAloqa');
const UygaChaqirishVaqt      = lazy$(() => import('./components/screens/patient/UygaChaqirishVaqt'),           'UygaChaqirishVaqt');
const UygaChaqirishMutaxassis= lazy$(() => import('./components/screens/patient/UygaChaqirishMutaxassis'),     'UygaChaqirishMutaxassis');
const UygaChaqirishTasdiqlash= lazy$(() => import('./components/screens/patient/UygaChaqirishTasdiqlash'),     'UygaChaqirishTasdiqlash');
const TekshiruvCategory      = lazy$(() => import('./components/screens/patient/TekshiruvCategory'),           'TekshiruvCategory');
const TekshiruvExam          = lazy$(() => import('./components/screens/patient/TekshiruvExam'),               'TekshiruvExam');
const TekshiruvCenter        = lazy$(() => import('./components/screens/patient/TekshiruvCenter'),             'TekshiruvCenter');
const TekshiruvCalendar      = lazy$(() => import('./components/screens/patient/TekshiruvCalendar'),           'TekshiruvCalendar');
const TekshiruvConfirm       = lazy$(() => import('./components/screens/patient/TekshiruvConfirm'),            'TekshiruvConfirm');
const PatientContactForm     = lazy$(() => import('./components/screens/patient/PatientContactForm'),          'PatientContactForm');
const PatientBookingCalendar = lazy$(() => import('./components/screens/patient/PatientBookingCalendar'),      'PatientBookingCalendar');
const PatientBookingConfirm  = lazy$(() => import('./components/screens/patient/PatientBookingConfirm'),       'PatientBookingConfirm');
// AI Tavsiya
const SymptomInput           = lazy$(() => import('./components/screens/patient/SymptomInput'),                'SymptomInput');
const AdaptiveQuestions      = lazy$(() => import('./components/screens/patient/AdaptiveQuestions'),           'AdaptiveQuestions');
const DiagnosisResults       = lazy$(() => import('./components/screens/patient/DiagnosisResults'),            'DiagnosisResults');

// Radiolog
const RadiologDashboard      = lazy$(() => import('./components/screens/radiolog/Dashboard'),                  'RadiologDashboard');
const ApplicationView        = lazy$(() => import('./components/screens/radiolog/ApplicationView'),            'ApplicationView');
const ConclusionEditor       = lazy$(() => import('./components/screens/radiolog/ConclusionEditor'),           'ConclusionEditor');
const SpecialistReferral     = lazy$(() => import('./components/screens/radiolog/SpecialistReferral'),         'SpecialistReferral');

// Operator / Admin / Specialist
const OperatorPanel          = lazy$(() => import('./components/screens/operator/OperatorPanel'),              'OperatorPanel');
const AdminPanel             = lazy$(() => import('./components/screens/admin/AdminPanel'),                    'AdminPanel');
const SpecialistDashboard    = lazy$(() => import('./components/screens/specialist/SpecialistDashboard'),      'SpecialistDashboard');

// Doctor
const DoctorDashboard        = lazy$(() => import('./components/screens/doctor/DoctorDashboard'),              'DoctorDashboard');
const DoctorProfileSetup     = lazy$(() => import('./components/screens/doctor/DoctorProfileSetup'),           'DoctorProfileSetup');
const DoctorPublicProfile    = lazy$(() => import('./components/screens/doctor/DoctorPublicProfile'),          'DoctorPublicProfile');
const DoctorPrivatePanel     = lazy$(() => import('./components/screens/doctor/DoctorPrivatePanel'),           'DoctorPrivatePanel');
const TariffSelection        = lazy$(() => import('./components/screens/doctor/TariffSelection'),              'TariffSelection');
const DoctorPortfolio        = lazy$(() => import('./components/screens/doctor/DoctorPortfolio'),              'DoctorPortfolio');
const DoctorPortfolioEdit    = lazy$(() => import('./components/screens/doctor/DoctorPortfolioEdit'),          'DoctorPortfolioEdit');
const DoctorClinicManage     = lazy$(() => import('./components/screens/doctor/DoctorClinicManage'),           'DoctorClinicManage');
const DoctorContactRequests  = lazy$(() => import('./components/screens/doctor/DoctorContactRequests'),        'DoctorContactRequests');
const DoctorTemplateManager  = lazy$(() => import('./components/screens/doctor/DoctorTemplateManager'),        'DoctorTemplateManager');
const DoctorFAQView          = lazy$(() => import('./components/screens/doctor/DoctorFAQView'),                'DoctorFAQView');
const DoctorFAQEditor        = lazy$(() => import('./components/screens/doctor/DoctorFAQEditor'),              'DoctorFAQEditor');
const DoctorServicesView     = lazy$(() => import('./components/screens/doctor/DoctorServicesView'),           'DoctorServicesView');
const DoctorServicesEditor   = lazy$(() => import('./components/screens/doctor/DoctorServicesEditor'),         'DoctorServicesEditor');
const DoctorAnonymousNumber  = lazy$(() => import('./components/screens/doctor/DoctorAnonymousNumber'),        'DoctorAnonymousNumber');
const DoctorTelegramBot      = lazy$(() => import('./components/screens/doctor/DoctorTelegramBot'),            'DoctorTelegramBot');
const DoctorAdSettings       = lazy$(() => import('./components/screens/doctor/DoctorAdSettings'),             'DoctorAdSettings');
const DoctorShareProfile     = lazy$(() => import('./components/screens/doctor/DoctorShareProfile'),           'DoctorShareProfile');
const DoctorCalendarView     = lazy$(() => import('./components/screens/doctor/DoctorCalendarView'),           'DoctorCalendarView');
const DoctorCalendarSettings = lazy$(() => import('./components/screens/doctor/DoctorCalendarSettings'),       'DoctorCalendarSettings');

// Shared
const ConversationsList      = lazy$(() => import('./components/screens/shared/ConversationsList'),            'ConversationsList');
const ChatScreen             = lazy$(() => import('./components/screens/shared/ChatScreen'),                   'ChatScreen');
const NotificationsScreen    = lazy$(() => import('./components/screens/NotificationsScreen'),                 'NotificationsScreen');
const ProfileScreen          = lazy$(() => import('./components/screens/ProfileScreen'),                       'ProfileScreen');

// Web Platform
const WebPlatformLogin       = lazy$(() => import('./components/screens/web/WebPlatformLogin'),                'WebPlatformLogin');
const WebPlatformDashboard   = lazy$(() => import('./components/screens/web/WebPlatformDashboard'),            'WebPlatformDashboard');
const WebDoctorProfilesScreen= lazy$(() => import('./components/screens/web/WebDoctorProfilesScreen'),         'WebDoctorProfilesScreen');
const WebTariffManageScreen  = lazy$(() => import('./components/screens/web/WebTariffManageScreen'),           'WebTariffManageScreen');
const WebCalendarManageScreen= lazy$(() => import('./components/screens/web/WebCalendarManageScreen'),         'WebCalendarManageScreen');

// Kassir
const KassirDashboard        = lazy$(() => import('./components/screens/kassir/KassirDashboard'),              'KassirDashboard');

// Kasalliklar KB
const DiseaseListPage      = lazy$(() => import('./pages/diseases/DiseaseListPage'),  'DiseaseListPage');
const DiseaseCardPage      = lazy$(() => import('./pages/diseases/DiseaseCardPage'),  'DiseaseCardPage');

// KB Admin
const KBDiseaseEditorPage  = lazy$(() => import('./pages/kb/KBDiseaseEditorPage'),   'KBDiseaseEditorPage');
const KBReviewQueuePage    = lazy$(() => import('./pages/kb/KBReviewQueuePage'),      'KBReviewQueuePage');

// Shifokor Inbox (Triage natijalar)
const CasesInboxPage       = lazy$(() => import('./pages/cases/CasesInboxPage'),      'CasesInboxPage');
const CaseDetailPage       = lazy$(() => import('./pages/cases/CaseDetailPage'),      'CaseDetailPage');

// ── Suspense fallback ─────────────────────────────────────────────────────────
function ScreenLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── URL Routes ────────────────────────────────────────────────────────────────
// Har bir URL path → komponent. Screen tipi va SCREEN_TO_PATH bilan 1-to-1.
function AppRoutes() {
  return (
    <Routes>
      {/* Eager */}
      <Route path="/"    element={<SplashScreen />} />
      <Route path="/rol" element={<RoleSelect />} />

      {/* Bemor (Patient) */}
      <Route path="/bemor"                           element={<PatientHome />} />
      <Route path="/bemor/profil"                    element={<PatientProfile />} />
      <Route path="/bemor/fayl-yuklash"              element={<FileUpload />} />
      <Route path="/bemor/anamnez"                   element={<Anamnez />} />
      <Route path="/bemor/xizmat"                    element={<ServiceSelect />} />
      <Route path="/bemor/shartnoma"                 element={<Contract />} />
      <Route path="/bemor/tolov"                     element={<Payment />} />
      <Route path="/bemor/status"                    element={<StatusTracker />} />
      <Route path="/bemor/xulosa"                    element={<ConclusionView />} />

      {/* Konsultatsiya */}
      <Route path="/bemor/konsultatsiya"             element={<KonsultatsiyaType />} />
      <Route path="/bemor/konsultatsiya/tur"         element={<KonsultatsiyaType />} />
      <Route path="/bemor/konsultatsiya/subtur"      element={<KonsultatsiyaSubType />} />
      <Route path="/bemor/konsultatsiya/shifokor"    element={<KonsultatsiyaDoctor />} />
      <Route path="/bemor/konsultatsiya/kalendar"    element={<KonsultatsiyaCalendar />} />
      <Route path="/bemor/konsultatsiya/sanatoriy"   element={<KonsultatsiyaSanatorium />} />
      <Route path="/bemor/konsultatsiya/anamnez"     element={<KonsultatsiyaAnamnez />} />
      <Route path="/bemor/konsultatsiya/tasdiqlash"  element={<KonsultatsiyaConfirm />} />

      {/* Tekshiruv */}
      <Route path="/bemor/tekshiruv"                 element={<TekshiruvCategory />} />
      <Route path="/bemor/tekshiruv/kategoriya"      element={<TekshiruvCategory />} />
      <Route path="/bemor/tekshiruv/turi"            element={<TekshiruvExam />} />
      <Route path="/bemor/tekshiruv/markaz"          element={<TekshiruvCenter />} />
      <Route path="/bemor/tekshiruv/kalendar"        element={<TekshiruvCalendar />} />
      <Route path="/bemor/tekshiruv/tasdiqlash"      element={<TekshiruvConfirm />} />

      {/* Uyga chaqirish */}
      <Route path="/bemor/uyga-chaqirish/manzil"     element={<UygaChaqirishManzil />} />
      <Route path="/bemor/uyga-chaqirish/aloqa"      element={<UygaChaqirishAloqa />} />
      <Route path="/bemor/uyga-chaqirish/vaqt"       element={<UygaChaqirishVaqt />} />
      <Route path="/bemor/uyga-chaqirish/mutaxassis" element={<UygaChaqirishMutaxassis />} />
      <Route path="/bemor/uyga-chaqirish/tasdiqlash" element={<UygaChaqirishTasdiqlash />} />

      {/* AI Tavsiya */}
      <Route path="/bemor/ai/simptomlar"             element={<SymptomInput />} />
      <Route path="/bemor/ai/savollar"               element={<AdaptiveQuestions />} />
      <Route path="/bemor/ai/natija"                 element={<DiagnosisResults />} />

      {/* Aloqa va Booking */}
      <Route path="/bemor/aloqa-shakli"              element={<PatientContactForm />} />
      <Route path="/bemor/booking/kalendar"          element={<PatientBookingCalendar />} />
      <Route path="/bemor/booking/tasdiqlash"        element={<PatientBookingConfirm />} />

      {/* Radiolog */}
      <Route path="/radiolog"                        element={<RadiologDashboard />} />
      <Route path="/radiolog/ariza"                  element={<ApplicationView />} />
      <Route path="/radiolog/xulosa"                 element={<ConclusionEditor />} />
      <Route path="/radiolog/yuborish"               element={<SpecialistReferral />} />

      {/* Shifokor (Doctor) */}
      <Route path="/shifokor"                        element={<DoctorDashboard />} />
      <Route path="/shifokor/bemor"                  element={<DoctorDashboard />} />
      <Route path="/shifokor/profil-sozlash"         element={<DoctorProfileSetup />} />
      <Route path="/shifokor/panel"                  element={<DoctorPrivatePanel />} />
      <Route path="/shifokor/tarif"                  element={<TariffSelection />} />
      <Route path="/shifokor/klinika"                element={<DoctorClinicManage />} />
      <Route path="/shifokor/tasdiqlash"             element={<DoctorPrivatePanel />} />
      <Route path="/shifokor/portfolio"              element={<DoctorPortfolio />} />
      <Route path="/shifokor/portfolio/tahrirlash"   element={<DoctorPortfolioEdit />} />
      <Route path="/shifokor/aloqa-sorovlari"        element={<DoctorContactRequests />} />
      <Route path="/shifokor/shablonlar"             element={<DoctorTemplateManager />} />
      <Route path="/shifokor/faq"                    element={<DoctorFAQView />} />
      <Route path="/shifokor/faq/tahrirlash"         element={<DoctorFAQEditor />} />
      <Route path="/shifokor/xizmatlar"              element={<DoctorServicesView />} />
      <Route path="/shifokor/xizmatlar/tahrirlash"   element={<DoctorServicesEditor />} />
      <Route path="/shifokor/anonim-raqam"           element={<DoctorAnonymousNumber />} />
      <Route path="/shifokor/telegram-bot"           element={<DoctorTelegramBot />} />
      <Route path="/shifokor/reklama"                element={<DoctorAdSettings />} />
      <Route path="/shifokor/ulashish"               element={<DoctorShareProfile />} />
      <Route path="/shifokor/kalendar"               element={<DoctorCalendarView />} />
      <Route path="/shifokor/kalendar/sozlamalar"    element={<DoctorCalendarSettings />} />

      {/* Doctor deep-link (jamoat profili) */}
      <Route path="/d/:slug"                         element={<DoctorPublicProfile />} />

      {/* Operator, Admin, Specialist, Kassir */}
      <Route path="/operator"                        element={<OperatorPanel />} />
      <Route path="/admin"                           element={<AdminPanel />} />
      <Route path="/mutaxassis"                      element={<SpecialistDashboard />} />
      <Route path="/kassir"                          element={<KassirDashboard />} />

      {/* Shared */}
      <Route path="/bildirishnomalar"                element={<NotificationsScreen />} />
      <Route path="/profil"                          element={<ProfileScreen />} />
      <Route path="/suhbatlar"                       element={<ConversationsList />} />
      <Route path="/suhbat"                          element={<ChatScreen />} />

      {/* Web Platform (desktop) — asosiy */}
      <Route path="/web/login"                       element={<WebPlatformLogin />} />
      <Route path="/web"                             element={<WebPlatformDashboard />} />

      {/* Web Admin */}
      <Route path="/web/admin/shifokorlar"           element={<WebDoctorProfilesScreen />} />
      <Route path="/web/admin/tariflar"              element={<WebTariffManageScreen />} />
      <Route path="/web/admin/kalendar"              element={<WebCalendarManageScreen />} />

      {/* Kasalliklar KB */}
      <Route path="/kasalliklar"       element={<DiseaseListPage />} />
      <Route path="/kasalliklar/:slug" element={<DiseaseCardPage />} />

      {/* KB Admin */}
      <Route path="/kb/diseases/new"        element={<KBDiseaseEditorPage />} />
      <Route path="/kb/diseases/:slug/edit" element={<KBDiseaseEditorPage />} />
      <Route path="/kb/review"              element={<KBReviewQueuePage />} />

      {/* Shifokor Inbox — triage natijalar */}
      <Route path="/shifokor/inbox"     element={<CasesInboxPage />} />
      <Route path="/shifokor/inbox/:id" element={<CaseDetailPage />} />

      {/* Fallback — noma'lum URL splash ga yuboriladi */}
      <Route path="*" element={<SplashScreen />} />
    </Routes>
  );
}

// ── App content ───────────────────────────────────────────────────────────────
function AppContent() {
  const { currentScreen, navigate, currentUser, serviceSheetOpen, closeServiceSheet } = useApp();
  const showNav = SHOW_NAV_ON.includes(currentScreen as Screen);

  // Web platform sahifalarida max-w-md cheklash yo'q
  const isWebScreen = currentScreen.startsWith('web_');

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {isWebScreen ? (
        // Full-screen desktop layout — max-w-md yo'q
        <div className="min-h-screen relative">
          <Suspense fallback={<ScreenLoader />}>
            <AppRoutes />
          </Suspense>
        </div>
      ) : (
        <div className={`max-w-md mx-auto min-h-screen bg-gray-50 relative overflow-hidden ${showNav ? 'pb-[64px]' : ''}`}>
          <Suspense fallback={<ScreenLoader />}>
            <AppRoutes />
          </Suspense>
        </div>
      )}
      <BottomNav />

      {/* Offline holat banneri — tarmoq ulanishi yo'qligida yuqorida ko'rinadi */}
      <OfflineBanner />

      {/* PWA yangi versiya taklifi — Service Worker yangilanishida ko'rinadi */}
      <PWAUpdatePrompt />

      {/* Bir martalik shartlar dialogi — app birinchi ochilganda */}
      <TermsAcceptDialog />

      {/* Global service selection sheet — triggered from anywhere */}
      <ServiceSelectionBottomSheet
        open={serviceSheetOpen}
        onOpenChange={(open) => { if (!open) closeServiceSheet(); }}
        onSelect={(key) => {
          closeServiceSheet();
          if (!currentUser) { navigate('role_select'); return; }
          if (key === 'radiology')     navigate('patient_upload');
          if (key === 'konsultatsiya') navigate('patient_konsultatsiya');
          if (key === 'tekshiruv')     navigate('patient_tks_category');
          if (key === 'ai_tavsiya')    navigate('patient_symptom_input');
        }}
      />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
// BrowserRouter AppProvider dan yuqorida bo'lishi SHART —
// NavigationProvider ichida useNavigate() chaqiradi.
export default function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </LocaleProvider>
    </BrowserRouter>
  );
}
