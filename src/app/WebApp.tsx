/**
 * MedSmartPro — Web Platform App
 * URL: localhost:5173/web.html (dev) | medsmart.uz/web (prod)
 * Mini App: localhost:5173/ (Telegram)
 * Backend: umumiy (shared API)
 */

import React from 'react';
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
import { Bell, Settings } from 'lucide-react';

// ── Web screen router ────────────────────────────────────────────────────────

function WebAppContent() {
  const { currentScreen } = useApp();

  switch (currentScreen) {

    // ── Asosiy ──
    case 'web_dashboard':
      return <WebPlatformDashboard />;

    // ── Admin Panel ──
    case 'web_admin':
      return <WebAdminScreen />;

    // ── Operator ──
    case 'web_operator':
      return <WebOperatorScreen />;

    // ── Kassa ──
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

    // ── Shifokor ──
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

    // ── Login (default) ──
    case 'web_login':
    default:
      return <WebPlatformLogin />;
  }
}

// ── App root ─────────────────────────────────────────────────────────────────

export default function WebApp() {
  return (
    <AppProvider initialScreen="web_login">
      <div className="min-h-screen font-sans antialiased">
        <WebAppContent />
      </div>
    </AppProvider>
  );
}
