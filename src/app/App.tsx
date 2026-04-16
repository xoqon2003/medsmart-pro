import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './store/appStore';
import { BottomNav, SHOW_NAV_ON } from './components/ui/BottomNav';
import { ServiceSelectionBottomSheet } from './components/patient/ServiceSelectionBottomSheet';
import type { Screen } from './types';

// ── Eager (darhol yuklanadi) ──────────────────────────────────────────────────
// Foydalanuvchi ilovani ochganda darhol ko'radigan ekranlar.
import { SplashScreen } from './components/screens/SplashScreen';
import { RoleSelect }   from './components/screens/RoleSelect';

// ── Lazy (ekranga o'tgandagina yuklanadi) ────────────────────────────────────
// Vite har birini alohida chunk qiladi — initial bundle ~60-70% kichrayadi.
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

// Operator / Admin
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

// ── Suspense fallback ─────────────────────────────────────────────────────────
function ScreenLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── App content ───────────────────────────────────────────────────────────────
function AppContent() {
  const { currentScreen, navigate, currentUser, serviceSheetOpen, closeServiceSheet } = useApp();
  const showNav = SHOW_NAV_ON.includes(currentScreen as Screen);

  const renderScreen = () => {
    switch (currentScreen) {
      // Eager ekranlar
      case 'splash':              return <SplashScreen />;
      case 'role_select':         return <RoleSelect />;
      // Patient
      case 'patient_profile':     return <PatientProfile />;
      case 'patient_home':        return <PatientHome />;
      case 'patient_upload':      return <FileUpload />;
      case 'patient_anamnez':     return <Anamnez />;
      case 'patient_service':     return <ServiceSelect />;
      case 'patient_contract':    return <Contract />;
      case 'patient_payment':     return <Payment />;
      case 'patient_status':      return <StatusTracker />;
      case 'patient_conclusion':  return <ConclusionView />;
      case 'patient_konsultatsiya': return <KonsultatsiyaType />;
      case 'patient_kons_type':     return <KonsultatsiyaType />;
      case 'patient_kons_subtype':  return <KonsultatsiyaSubType />;
      case 'patient_kons_doctor':   return <KonsultatsiyaDoctor />;
      case 'patient_kons_calendar': return <KonsultatsiyaCalendar />;
      case 'patient_kons_sanatorium': return <KonsultatsiyaSanatorium />;
      case 'patient_kons_anamnez':  return <KonsultatsiyaAnamnez />;
      case 'patient_kons_confirm':  return <KonsultatsiyaConfirm />;
      case 'home_visit_address':    return <UygaChaqirishManzil />;
      case 'home_visit_contact':    return <UygaChaqirishAloqa />;
      case 'home_visit_time':       return <UygaChaqirishVaqt />;
      case 'home_visit_specialist': return <UygaChaqirishMutaxassis />;
      case 'home_visit_confirm':    return <UygaChaqirishTasdiqlash />;
      case 'patient_tekshiruv':      return <TekshiruvCategory />;
      case 'patient_tks_category':   return <TekshiruvCategory />;
      case 'patient_tks_exam':       return <TekshiruvExam />;
      case 'patient_tks_center':     return <TekshiruvCenter />;
      case 'patient_tks_calendar':   return <TekshiruvCalendar />;
      case 'patient_tks_confirm':    return <TekshiruvConfirm />;
      case 'patient_symptom_input':       return <SymptomInput />;
      case 'patient_adaptive_questions':  return <AdaptiveQuestions />;
      case 'patient_diagnosis_results':   return <DiagnosisResults />;
      // Radiolog
      case 'radiolog_dashboard':  return <RadiologDashboard />;
      case 'radiolog_view':       return <ApplicationView />;
      case 'radiolog_conclude':   return <ConclusionEditor />;
      case 'radiolog_specialist': return <SpecialistReferral />;
      // Operator / Admin
      case 'operator_dashboard':   return <OperatorPanel />;
      case 'admin_dashboard':      return <AdminPanel />;
      case 'specialist_dashboard': return <SpecialistDashboard />;
      // Doctor
      case 'doctor_dashboard':        return <DoctorDashboard />;
      case 'doctor_patient_view':     return <DoctorDashboard />;
      case 'doctor_profile_setup':    return <DoctorProfileSetup />;
      case 'doctor_public_profile':   return <DoctorPublicProfile />;
      case 'doctor_private_panel':    return <DoctorPrivatePanel />;
      case 'doctor_tariff_select':    return <TariffSelection />;
      case 'doctor_clinic_manage':    return <DoctorClinicManage />;
      case 'doctor_verification':     return <DoctorPrivatePanel />;
      case 'doctor_portfolio':        return <DoctorPortfolio />;
      case 'doctor_portfolio_edit':   return <DoctorPortfolioEdit />;
      case 'patient_contact_form':    return <PatientContactForm />;
      case 'doctor_contact_requests': return <DoctorContactRequests />;
      case 'doctor_template_manager': return <DoctorTemplateManager />;
      case 'conversations_list':      return <ConversationsList />;
      case 'chat_screen':             return <ChatScreen />;
      case 'doctor_faq_view':         return <DoctorFAQView />;
      case 'doctor_faq_editor':       return <DoctorFAQEditor />;
      case 'doctor_services_view':    return <DoctorServicesView />;
      case 'doctor_services_editor':  return <DoctorServicesEditor />;
      case 'doctor_anonymous_number': return <DoctorAnonymousNumber />;
      case 'doctor_telegram_bot':     return <DoctorTelegramBot />;
      case 'doctor_ad_settings':      return <DoctorAdSettings />;
      case 'doctor_share_profile':    return <DoctorShareProfile />;
      case 'doctor_calendar_view':    return <DoctorCalendarView />;
      case 'doctor_calendar_settings':return <DoctorCalendarSettings />;
      case 'patient_booking_calendar':return <PatientBookingCalendar />;
      case 'patient_booking_confirm': return <PatientBookingConfirm />;
      // Web Platform
      case 'web_doctor_profiles':     return <WebDoctorProfilesScreen />;
      case 'web_tariff_manage':       return <WebTariffManageScreen />;
      case 'web_calendar_manage':     return <WebCalendarManageScreen />;
      case 'kassir_dashboard':        return <KassirDashboard />;
      case 'web_login':               return <WebPlatformLogin />;
      case 'web_dashboard':           return <WebPlatformDashboard />;
      // Shared
      case 'notifications':           return <NotificationsScreen />;
      case 'profile':                 return <ProfileScreen />;
      default:                        return <SplashScreen />;
    }
  };

  // Web platform sahifalarida max-w-md cheklash yo'q
  const isWebScreen = currentScreen.startsWith('web_');

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {isWebScreen ? (
        // Full-screen desktop layout — max-w-md yo'q
        <div className="min-h-screen relative">
          <Suspense fallback={<ScreenLoader />}>
            {renderScreen()}
          </Suspense>
        </div>
      ) : (
        <div className={`max-w-md mx-auto min-h-screen bg-gray-50 relative overflow-hidden ${showNav ? 'pb-[64px]' : ''}`}>
          <Suspense fallback={<ScreenLoader />}>
            {renderScreen()}
          </Suspense>
        </div>
      )}
      <BottomNav />

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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
