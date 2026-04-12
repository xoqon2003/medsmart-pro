import React from 'react';
import { AppProvider, useApp } from './store/appStore';
import { SplashScreen } from './components/screens/SplashScreen';
import { RoleSelect } from './components/screens/RoleSelect';
import { PatientProfile } from './components/screens/PatientProfile';
import { PatientHome } from './components/screens/patient/PatientHome';
import { FileUpload } from './components/screens/patient/FileUpload';
import { Anamnez } from './components/screens/patient/Anamnez';
import { ServiceSelect } from './components/screens/patient/ServiceSelect';
import { Contract } from './components/screens/patient/Contract';
import { Payment } from './components/screens/patient/Payment';
import { StatusTracker } from './components/screens/patient/StatusTracker';
import { ConclusionView } from './components/screens/patient/ConclusionView';
import { KonsultatsiyaType } from './components/screens/patient/KonsultatsiyaType';
import { KonsultatsiyaSubType } from './components/screens/patient/KonsultatsiyaSubType';
import { KonsultatsiyaDoctor } from './components/screens/patient/KonsultatsiyaDoctor';
import { KonsultatsiyaCalendar } from './components/screens/patient/KonsultatsiyaCalendar';
import { KonsultatsiyaAnamnez } from './components/screens/patient/KonsultatsiyaAnamnez';
import { KonsultatsiyaConfirm } from './components/screens/patient/KonsultatsiyaConfirm';
import { KonsultatsiyaSanatorium } from './components/screens/patient/KonsultatsiyaSanatorium';
import { UygaChaqirishManzil } from './components/screens/patient/UygaChaqirishManzil';
import { UygaChaqirishAloqa } from './components/screens/patient/UygaChaqirishAloqa';
import { UygaChaqirishVaqt } from './components/screens/patient/UygaChaqirishVaqt';
import { UygaChaqirishMutaxassis } from './components/screens/patient/UygaChaqirishMutaxassis';
import { UygaChaqirishTasdiqlash } from './components/screens/patient/UygaChaqirishTasdiqlash';
import { TekshiruvCategory } from './components/screens/patient/TekshiruvCategory';
import { TekshiruvExam } from './components/screens/patient/TekshiruvExam';
import { TekshiruvCenter } from './components/screens/patient/TekshiruvCenter';
import { TekshiruvCalendar } from './components/screens/patient/TekshiruvCalendar';
import { TekshiruvConfirm } from './components/screens/patient/TekshiruvConfirm';
import { RadiologDashboard } from './components/screens/radiolog/Dashboard';
import { ApplicationView } from './components/screens/radiolog/ApplicationView';
import { ConclusionEditor } from './components/screens/radiolog/ConclusionEditor';
import { SpecialistReferral } from './components/screens/radiolog/SpecialistReferral';
import { OperatorPanel } from './components/screens/operator/OperatorPanel';
import { AdminPanel } from './components/screens/admin/AdminPanel';
import { SpecialistDashboard } from './components/screens/specialist/SpecialistDashboard';
import { DoctorDashboard } from './components/screens/doctor/DoctorDashboard';
import { DoctorProfileSetup } from './components/screens/doctor/DoctorProfileSetup';
import { DoctorPublicProfile } from './components/screens/doctor/DoctorPublicProfile';
import { DoctorPrivatePanel } from './components/screens/doctor/DoctorPrivatePanel';
import { TariffSelection } from './components/screens/doctor/TariffSelection';
import { DoctorPortfolio } from './components/screens/doctor/DoctorPortfolio';
import { DoctorPortfolioEdit } from './components/screens/doctor/DoctorPortfolioEdit';
import { DoctorClinicManage } from './components/screens/doctor/DoctorClinicManage';
import { PatientContactForm } from './components/screens/patient/PatientContactForm';
import { DoctorContactRequests } from './components/screens/doctor/DoctorContactRequests';
import { DoctorTemplateManager } from './components/screens/doctor/DoctorTemplateManager';
import { ConversationsList } from './components/screens/shared/ConversationsList';
import { ChatScreen } from './components/screens/shared/ChatScreen';
import { DoctorFAQView } from './components/screens/doctor/DoctorFAQView';
import { DoctorFAQEditor } from './components/screens/doctor/DoctorFAQEditor';
import { DoctorServicesView } from './components/screens/doctor/DoctorServicesView';
import { DoctorServicesEditor } from './components/screens/doctor/DoctorServicesEditor';
import { DoctorAnonymousNumber } from './components/screens/doctor/DoctorAnonymousNumber';
import { DoctorTelegramBot } from './components/screens/doctor/DoctorTelegramBot';
import { DoctorAdSettings } from './components/screens/doctor/DoctorAdSettings';
import { DoctorShareProfile } from './components/screens/doctor/DoctorShareProfile';
import { DoctorCalendarView } from './components/screens/doctor/DoctorCalendarView';
import { DoctorCalendarSettings } from './components/screens/doctor/DoctorCalendarSettings';
import { PatientBookingCalendar } from './components/screens/patient/PatientBookingCalendar';
import { PatientBookingConfirm } from './components/screens/patient/PatientBookingConfirm';
import { WebDoctorProfilesScreen } from './components/screens/web/WebDoctorProfilesScreen';
import { WebTariffManageScreen } from './components/screens/web/WebTariffManageScreen';
import { WebCalendarManageScreen } from './components/screens/web/WebCalendarManageScreen';
import { KassirDashboard } from './components/screens/kassir/KassirDashboard';
import { SymptomInput } from './components/screens/patient/SymptomInput';
import { AdaptiveQuestions } from './components/screens/patient/AdaptiveQuestions';
import { DiagnosisResults } from './components/screens/patient/DiagnosisResults';
import { WebPlatformLogin } from './components/screens/web/WebPlatformLogin';
import { WebPlatformDashboard } from './components/screens/web/WebPlatformDashboard';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { BottomNav, SHOW_NAV_ON } from './components/ui/BottomNav';
import { ServiceSelectionBottomSheet } from './components/patient/ServiceSelectionBottomSheet';
import type { Screen } from './types';

function AppContent() {
  const { currentScreen, navigate, currentUser, serviceSheetOpen, closeServiceSheet } = useApp();
  const showNav = SHOW_NAV_ON.includes(currentScreen as Screen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':              return <SplashScreen />;
      case 'role_select':         return <RoleSelect />;
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
      // ── AI Tavsiya (Simptom tahlili) ─────────────────────────
      case 'patient_symptom_input':       return <SymptomInput />;
      case 'patient_adaptive_questions':  return <AdaptiveQuestions />;
      case 'patient_diagnosis_results':   return <DiagnosisResults />;
      case 'radiolog_dashboard':  return <RadiologDashboard />;
      case 'radiolog_view':       return <ApplicationView />;
      case 'radiolog_conclude':   return <ConclusionEditor />;
      case 'radiolog_specialist': return <SpecialistReferral />;
      case 'operator_dashboard':  return <OperatorPanel />;
      case 'admin_dashboard':     return <AdminPanel />;
      case 'specialist_dashboard':return <SpecialistDashboard />;
      case 'doctor_dashboard':       return <DoctorDashboard />;
      // doctor_patient_view is now handled inside DoctorDashboard as viewMode='detail'
      case 'doctor_patient_view':    return <DoctorDashboard />;
      // TZ-01: Shifokor profil ekranlari
      case 'doctor_profile_setup':   return <DoctorProfileSetup />;
      case 'doctor_public_profile':  return <DoctorPublicProfile />;
      case 'doctor_private_panel':   return <DoctorPrivatePanel />;
      case 'doctor_tariff_select':   return <TariffSelection />;
      case 'doctor_clinic_manage':   return <DoctorClinicManage />;
      case 'doctor_verification':    return <DoctorPrivatePanel />;
      case 'doctor_portfolio':       return <DoctorPortfolio />;
      case 'doctor_portfolio_edit':  return <DoctorPortfolioEdit />;
      case 'patient_contact_form':   return <PatientContactForm />;
      case 'doctor_contact_requests': return <DoctorContactRequests />;
      case 'doctor_template_manager': return <DoctorTemplateManager />;
      case 'conversations_list':     return <ConversationsList />;
      case 'chat_screen':            return <ChatScreen />;
      case 'doctor_faq_view':        return <DoctorFAQView />;
      case 'doctor_faq_editor':      return <DoctorFAQEditor />;
      case 'doctor_services_view':   return <DoctorServicesView />;
      case 'doctor_services_editor': return <DoctorServicesEditor />;
      case 'doctor_anonymous_number': return <DoctorAnonymousNumber />;
      case 'doctor_telegram_bot':    return <DoctorTelegramBot />;
      case 'doctor_ad_settings':     return <DoctorAdSettings />;
      case 'doctor_share_profile':   return <DoctorShareProfile />;
      case 'doctor_calendar_view':   return <DoctorCalendarView />;
      case 'doctor_calendar_settings': return <DoctorCalendarSettings />;
      case 'patient_booking_calendar': return <PatientBookingCalendar />;
      case 'patient_booking_confirm':  return <PatientBookingConfirm />;
      case 'web_doctor_profiles':     return <WebDoctorProfilesScreen />;
      case 'web_tariff_manage':       return <WebTariffManageScreen />;
      case 'web_calendar_manage':     return <WebCalendarManageScreen />;
      case 'kassir_dashboard':       return <KassirDashboard />;
      case 'web_login':           return <WebPlatformLogin />;
      case 'web_dashboard':       return <WebPlatformDashboard />;
      case 'notifications':       return <NotificationsScreen />;
      case 'profile':             return <ProfileScreen />;
      default:                    return <SplashScreen />;
    }
  };

  // Web platform sahifalarida max-w-md cheklash yo'q
  const isWebScreen = currentScreen.startsWith('web_');

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      {isWebScreen ? (
        // Full-screen desktop layout — max-w-md yo'q
        <div className="min-h-screen relative">
          {renderScreen()}
        </div>
      ) : (
        <div className={`max-w-md mx-auto min-h-screen bg-gray-50 relative overflow-hidden ${showNav ? 'pb-[64px]' : ''}`}>
          {renderScreen()}
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