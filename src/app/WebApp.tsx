/**
 * MedSmartPro — Web Platform App
 * URL: localhost:5173/web.html (dev) | medsmart.uz/web (prod)
 * Mini App: localhost:5173/ (Telegram)
 * Backend: umumiy (shared API)
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter } from 'react-router';
import { AppProvider, useApp } from './store/appStore';
import { WebPlatformLogin } from './components/screens/web/WebPlatformLogin';
import { WebPlatformDashboard } from './components/screens/web/WebPlatformDashboard';
import { WebDoctorScreen } from './components/screens/web/WebDoctorScreen';
import { WebOnlaynQabulScreen } from './components/screens/web/WebOnlaynQabulScreen';
import { WebArizalarJadvali } from './components/screens/web/WebArizalarJadvali';
import { WebOperatorScreen } from './components/screens/web/WebOperatorScreen';
import { WebKassirScreen } from './components/screens/web/WebKassirScreen';
import { WebRadiologScreen } from './components/screens/web/WebRadiologScreen';
import { WebSpecialistScreen } from './components/screens/web/WebSpecialistScreen';
import { WebAdminScreen } from './components/screens/web/WebAdminScreen';
import { WebComingSoon } from './components/screens/web/WebComingSoon';
import { WebXabarlarScreen } from './components/screens/web/WebXabarlarScreen';
import { WebSozlamalarScreen } from './components/screens/web/WebSozlamalarScreen';
import { WebBemorProfiliScreen } from './components/screens/web/WebBemorProfiliScreen';
import { WebDoctorProfilesScreen } from './components/screens/web/WebDoctorProfilesScreen';
import { WebTariffManageScreen } from './components/screens/web/WebTariffManageScreen';
import { WebCalendarManageScreen } from './components/screens/web/WebCalendarManageScreen';

// ── Spravochnik ekranlar ──
import { WebRefSpecialtiesScreen } from './components/screens/web/WebRefSpecialtiesScreen';
import { WebRefRegionsScreen } from './components/screens/web/WebRefRegionsScreen';
import { WebRefDiagnosesScreen } from './components/screens/web/WebRefDiagnosesScreen';
import { WebRefDrugsScreen } from './components/screens/web/WebRefDrugsScreen';
import { WebRefLabTestsScreen } from './components/screens/web/WebRefLabTestsScreen';
import { WebRefServicesScreen } from './components/screens/web/WebRefServicesScreen';
import { WebRefTemplatesScreen } from './components/screens/web/WebRefTemplatesScreen';
import { WebRefExamCentersScreen } from './components/screens/web/WebRefExamCentersScreen';
import { WebRefKBDiseasesScreen } from './components/screens/web/WebRefKBDiseasesScreen';
import { WebRefKBSymptomsScreen } from './components/screens/web/WebRefKBSymptomsScreen';
import { WebRefKBProtocolsScreen } from './components/screens/web/WebRefKBProtocolsScreen';
import { WebRefKBDrugsScreen } from './components/screens/web/WebRefKBDrugsScreen';

// ── Admin kengaytirilgan ──
import { WebAdminDashboardScreen } from './components/screens/web/WebAdminDashboardScreen';
import { WebAdminUsersScreen } from './components/screens/web/WebAdminUsersScreen';
import { WebAdminRolesScreen } from './components/screens/web/WebAdminRolesScreen';
import { WebAdminAuditScreen } from './components/screens/web/WebAdminAuditScreen';
import { WebAdminSettingsScreen } from './components/screens/web/WebAdminSettingsScreen';
import { WebAdminLogsScreen } from './components/screens/web/WebAdminLogsScreen';
import { WebAdminSessionsScreen } from './components/screens/web/WebAdminSessionsScreen';
import { WebAdminPaymentsScreen } from './components/screens/web/WebAdminPaymentsScreen';
import { WebAdminDoctorsReportScreen } from './components/screens/web/WebAdminDoctorsReportScreen';
import { WebAdminAppsReportScreen } from './components/screens/web/WebAdminAppsReportScreen';

// ── Operator kengaytirilgan ──
import { WebOpDashboardScreen } from './components/screens/web/WebOpDashboardScreen';
import { WebOpCreateAppScreen } from './components/screens/web/WebOpCreateAppScreen';
import { WebOpApplicationsScreen } from './components/screens/web/WebOpApplicationsScreen';
import { WebOpPatientSearchScreen } from './components/screens/web/WebOpPatientSearchScreen';
import { WebOpQueueScreen } from './components/screens/web/WebOpQueueScreen';

// ── Shifokor kengaytirilgan ──
import { WebDocDashboardScreen } from './components/screens/web/WebDocDashboardScreen';
import { WebDocPatientsScreen } from './components/screens/web/WebDocPatientsScreen';
import { WebDocReceptionScreen } from './components/screens/web/WebDocReceptionScreen';
import { WebDocConclusionScreen } from './components/screens/web/WebDocConclusionScreen';
import { WebDocPrescriptionScreen } from './components/screens/web/WebDocPrescriptionScreen';
import { WebDocLabOrderScreen } from './components/screens/web/WebDocLabOrderScreen';
import { WebDocEmrScreen } from './components/screens/web/WebDocEmrScreen';
import { WebDocStatisticsScreen } from './components/screens/web/WebDocStatisticsScreen';

// ── Kassa kengaytirilgan ──
import { WebKassaDashboardScreen } from './components/screens/web/WebKassaDashboardScreen';
import { WebKassaPaymentScreen } from './components/screens/web/WebKassaPaymentScreen';
import { WebKassaReceiptScreen } from './components/screens/web/WebKassaReceiptScreen';
import { WebKassaShiftReportScreen } from './components/screens/web/WebKassaShiftReportScreen';
import { WebKassaHistoryScreen } from './components/screens/web/WebKassaHistoryScreen';

// ── Web screen router ────────────────────────────────────────────────────────

function WebAppContent() {
  const { currentScreen } = useApp();

  switch (currentScreen) {

    // ── Asosiy ──
    case 'web_dashboard':
      return <WebPlatformDashboard />;

    // ── Admin Panel (eski) ──
    case 'web_admin':
      return <WebAdminScreen />;

    // ── Operator (eski) ──
    case 'web_operator':
      return <WebOperatorScreen />;

    // ── Kassa (eski) ──
    case 'web_kassir':
      return <WebKassirScreen />;

    // ── Radiolog ──
    case 'web_radiolog':
      return <WebRadiologScreen />;

    // ── Mutaxassis ──
    case 'web_specialist':
      return <WebSpecialistScreen />;

    // ── Arizalar jadvali ──
    case 'web_arizalar':
      return <WebArizalarJadvali />;

    // ── Onlayn qabul ──
    case 'web_onlayn':
      return <WebOnlaynQabulScreen />;

    // ── Shifokor (eski) ──
    case 'web_doctor':
      return <WebDoctorScreen />;

    // ── Xabarlar ──
    case 'web_notifications':
      return <WebXabarlarScreen />;

    // ── Sozlamalar ──
    case 'web_settings':
      return <WebSozlamalarScreen />;

    // ── Bemor profili / EMK ──
    case 'web_bemor_profili':
      return <WebBemorProfiliScreen />;

    // ── Shifokor boshqaruvi ──
    case 'web_doctor_profiles':
      return <WebDoctorProfilesScreen />;
    case 'web_tariff_manage':
      return <WebTariffManageScreen />;
    case 'web_calendar_manage':
      return <WebCalendarManageScreen />;

    // ══════ SPRAVOCHNIK ══════
    case 'web_ref_specialties':
      return <WebRefSpecialtiesScreen />;
    case 'web_ref_regions':
      return <WebRefRegionsScreen />;
    case 'web_ref_diagnoses':
      return <WebRefDiagnosesScreen />;
    case 'web_ref_drugs':
      return <WebRefDrugsScreen />;
    case 'web_ref_lab_tests':
      return <WebRefLabTestsScreen />;
    case 'web_ref_services':
      return <WebRefServicesScreen />;
    case 'web_ref_templates':
      return <WebRefTemplatesScreen />;
    case 'web_ref_exam_centers':
      return <WebRefExamCentersScreen />;

    // ══════ KLINIK BILIM BAZASI ══════
    case 'web_ref_kb_diseases':
      return <WebRefKBDiseasesScreen />;
    case 'web_ref_kb_symptoms':
      return <WebRefKBSymptomsScreen />;
    case 'web_ref_kb_protocols':
      return <WebRefKBProtocolsScreen />;
    case 'web_ref_kb_drugs':
      return <WebRefKBDrugsScreen />;

    // ══════ ADMIN KENGAYTIRILGAN ══════
    case 'web_admin_dashboard':
      return <WebAdminDashboardScreen />;
    case 'web_admin_users':
      return <WebAdminUsersScreen />;
    case 'web_admin_roles':
      return <WebAdminRolesScreen />;
    case 'web_admin_audit':
      return <WebAdminAuditScreen />;
    case 'web_admin_settings':
      return <WebAdminSettingsScreen />;
    case 'web_admin_logs':
      return <WebAdminLogsScreen />;
    case 'web_admin_sessions':
      return <WebAdminSessionsScreen />;
    case 'web_admin_payments':
      return <WebAdminPaymentsScreen />;
    case 'web_admin_doctors_report':
      return <WebAdminDoctorsReportScreen />;
    case 'web_admin_apps_report':
      return <WebAdminAppsReportScreen />;

    // ══════ OPERATOR KENGAYTIRILGAN ══════
    case 'web_op_dashboard':
      return <WebOpDashboardScreen />;
    case 'web_op_create_app':
      return <WebOpCreateAppScreen />;
    case 'web_op_applications':
      return <WebOpApplicationsScreen />;
    case 'web_op_patient_search':
      return <WebOpPatientSearchScreen />;
    case 'web_op_queue':
      return <WebOpQueueScreen />;

    // ══════ SHIFOKOR KENGAYTIRILGAN ══════
    case 'web_doc_dashboard':
      return <WebDocDashboardScreen />;
    case 'web_doc_patients':
      return <WebDocPatientsScreen />;
    case 'web_doc_reception':
      return <WebDocReceptionScreen />;
    case 'web_doc_conclusion':
      return <WebDocConclusionScreen />;
    case 'web_doc_prescription':
      return <WebDocPrescriptionScreen />;
    case 'web_doc_lab_order':
      return <WebDocLabOrderScreen />;
    case 'web_doc_emr':
      return <WebDocEmrScreen />;
    case 'web_doc_statistics':
      return <WebDocStatisticsScreen />;

    // ══════ KASSA KENGAYTIRILGAN ══════
    case 'web_kassa_dashboard':
      return <WebKassaDashboardScreen />;
    case 'web_kassa_payment':
      return <WebKassaPaymentScreen />;
    case 'web_kassa_receipt':
      return <WebKassaReceiptScreen />;
    case 'web_kassa_shift_report':
      return <WebKassaShiftReportScreen />;
    case 'web_kassa_history':
      return <WebKassaHistoryScreen />;

    // ── Login (default) ──
    case 'web_login':
    default:
      return <WebPlatformLogin />;
  }
}

// ── App root ─────────────────────────────────────────────────────────────────

export default function WebApp() {
  return (
    <BrowserRouter>
      <AppProvider initialScreen="web_login">
        <div className="min-h-screen font-sans antialiased">
          <WebAppContent />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
