/**
 * MedSmartPro — Web Platform Layout
 * Desktop sidebar + topbar + main content area
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, FileText, Banknote, Settings,
  Bell, LogOut, ChevronDown, ChevronRight, Search, Menu, X,
  Activity, BarChart3, Stethoscope, Layers,
  ClipboardList, UserCheck, HelpCircle, Globe,
  Crown, Calendar, Users, BookOpen, MapPin, Pill,
  TestTube, Building2, FileSearch, ScrollText, Terminal,
  MonitorSmartphone, FileBarChart, Shield, Wallet,
  UserPlus, ListOrdered, PenTool, FlaskConical, Heart,
  Receipt, Clock, History, FolderOpen, GraduationCap,
  Syringe, Tags, FilePlus, UserSearch, Columns3,
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import type { Screen, UserRole } from '../../../types';

// ── Nav strukturasi ─────────────────────────────────────────────────────────

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  screen: Screen;
  icon: React.ElementType;
  label: string;
  badge?: number | string;
  roles?: UserRole[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Asosiy',
    items: [
      { screen: 'web_dashboard',  icon: LayoutDashboard, label: 'Dashboard',    roles: ['admin', 'operator', 'kassir', 'radiolog', 'specialist', 'doctor'] },
    ],
  },
  {
    label: 'Xizmatlar',
    items: [
      { screen: 'web_arizalar',   icon: FileText,     label: 'Arizalar jadvali', roles: ['admin', 'operator', 'radiolog', 'specialist', 'doctor'] },
      { screen: 'web_radiolog',   icon: Stethoscope,  label: 'Radiologlar',   roles: ['admin', 'radiolog'] },
      { screen: 'web_specialist', icon: UserCheck,    label: 'Mutaxassislar',       roles: ['admin', 'specialist'] },
      { screen: 'web_onlayn',    icon: Globe,        label: 'Onlayn qabul',        roles: ['admin', 'doctor', 'specialist'] },
      { screen: 'web_doctor',    icon: ClipboardList,label: 'Shifokorlar',          roles: ['admin', 'doctor'] },
    ],
  },
  {
    label: 'Admin boshqaruvi',
    items: [
      { screen: 'web_admin_dashboard',      icon: BarChart3,          label: 'Admin Dashboard',   roles: ['admin'] },
      { screen: 'web_admin_users',          icon: Users,              label: 'Foydalanuvchilar',  roles: ['admin'] },
      { screen: 'web_admin_roles',          icon: Shield,             label: 'Rollar va ruxsatlar', roles: ['admin'] },
      { screen: 'web_admin_audit',          icon: ScrollText,         label: 'Audit log',         roles: ['admin'] },
      { screen: 'web_admin_settings',       icon: Settings,           label: 'Tizim sozlamalari', roles: ['admin'] },
      { screen: 'web_admin_logs',           icon: Terminal,           label: 'Tizim loglar',      roles: ['admin'] },
      { screen: 'web_admin_sessions',       icon: MonitorSmartphone,  label: 'Sessiyalar',        roles: ['admin'] },
      { screen: 'web_admin_payments',       icon: Wallet,             label: 'To\'lovlar hisoboti', roles: ['admin'] },
      { screen: 'web_admin_doctors_report', icon: FileBarChart,       label: 'Shifokorlar hisoboti', roles: ['admin'] },
      { screen: 'web_admin_apps_report',    icon: FileSearch,         label: 'Arizalar hisoboti', roles: ['admin'] },
    ],
  },
  {
    label: 'Operator panel',
    items: [
      { screen: 'web_op_dashboard',      icon: Layers,     label: 'Operator Dashboard', roles: ['admin', 'operator'] },
      { screen: 'web_op_create_app',     icon: FilePlus,   label: 'Ariza yaratish',     roles: ['admin', 'operator'] },
      { screen: 'web_op_applications',   icon: FileText,   label: 'Arizalar',           roles: ['admin', 'operator'] },
      { screen: 'web_op_patient_search', icon: UserSearch,  label: 'Bemor qidirish',     roles: ['admin', 'operator'] },
      { screen: 'web_op_queue',          icon: Columns3,   label: 'Navbat boshqaruvi',  roles: ['admin', 'operator'] },
    ],
  },
  {
    label: 'Shifokor panel',
    items: [
      { screen: 'web_doc_dashboard',    icon: Stethoscope,   label: 'Shifokor Dashboard', roles: ['admin', 'doctor'] },
      { screen: 'web_doc_patients',     icon: Users,          label: 'Bemorlar',           roles: ['admin', 'doctor'] },
      { screen: 'web_doc_reception',    icon: ClipboardList,  label: 'Qabulxona',          roles: ['admin', 'doctor'] },
      { screen: 'web_doc_conclusion',   icon: PenTool,        label: 'Xulosa yozish',      roles: ['admin', 'doctor'] },
      { screen: 'web_doc_prescription', icon: Syringe,        label: 'Retsept',            roles: ['admin', 'doctor'] },
      { screen: 'web_doc_lab_order',    icon: FlaskConical,   label: 'Lab buyurtma',       roles: ['admin', 'doctor'] },
      { screen: 'web_doc_emr',          icon: Heart,          label: 'Tibbiy karta (EMR)', roles: ['admin', 'doctor'] },
      { screen: 'web_doc_statistics',   icon: BarChart3,      label: 'Statistika',         roles: ['admin', 'doctor'] },
    ],
  },
  {
    label: 'Shifokor boshqaruvi',
    items: [
      { screen: 'web_doctor_profiles', icon: GraduationCap, label: 'Shifokor profillari', roles: ['admin'] },
      { screen: 'web_tariff_manage',   icon: Crown,         label: 'Tariflar',            roles: ['admin'] },
      { screen: 'web_calendar_manage', icon: Calendar,       label: 'Kalendar',            roles: ['admin', 'doctor'] },
    ],
  },
  {
    label: 'Kassa panel',
    items: [
      { screen: 'web_kassa_dashboard',     icon: Banknote, label: 'Kassa Dashboard',   roles: ['admin', 'kassir'] },
      { screen: 'web_kassa_payment',       icon: Wallet,   label: 'To\'lov qabul',    roles: ['admin', 'kassir'] },
      { screen: 'web_kassa_receipt',       icon: Receipt,  label: 'Chek chop etish',   roles: ['admin', 'kassir'] },
      { screen: 'web_kassa_shift_report',  icon: FileBarChart, label: 'Smena hisoboti', roles: ['admin', 'kassir'] },
      { screen: 'web_kassa_history',       icon: History,  label: 'To\'lovlar tarixi', roles: ['admin', 'kassir'] },
    ],
  },
  {
    label: 'Spravochnik',
    items: [
      { screen: 'web_ref_specialties',  icon: BookOpen,   label: 'Mutaxassisliklar',   roles: ['admin'] },
      { screen: 'web_ref_regions',      icon: MapPin,     label: 'Hududlar',           roles: ['admin'] },
      { screen: 'web_ref_diagnoses',    icon: Tags,       label: 'ICD-10 kodlar',      roles: ['admin'] },
      { screen: 'web_ref_drugs',        icon: Pill,       label: 'Dori katalogi',      roles: ['admin'] },
      { screen: 'web_ref_lab_tests',    icon: TestTube,   label: 'Lab testlar',        roles: ['admin'] },
      { screen: 'web_ref_services',     icon: FolderOpen, label: 'Xizmat kategoriyalari', roles: ['admin'] },
      { screen: 'web_ref_templates',    icon: FileText,   label: 'Hujjat shablonlari', roles: ['admin'] },
      { screen: 'web_ref_exam_centers', icon: Building2,  label: 'Tekshiruv markazlari', roles: ['admin'] },
    ],
  },
  {
    label: 'Tizim',
    items: [
      { screen: 'web_notifications', icon: Bell,     label: 'Xabarlar'   },
      { screen: 'web_settings',      icon: Settings, label: 'Sozlamalar' },
    ],
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator', operator: 'Operator', kassir: 'Kassir',
  radiolog: 'Radiolog', specialist: 'Mutaxassis', doctor: 'Shifokor', patient: 'Bemor',
};
const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'from-rose-500 to-pink-600', operator: 'from-violet-500 to-purple-600',
  kassir: 'from-sky-500 to-blue-600', radiolog: 'from-emerald-500 to-teal-600',
  specialist: 'from-purple-500 to-indigo-600', doctor: 'from-blue-500 to-cyan-600',
  patient: 'from-indigo-500 to-blue-600',
};

// ── Props ───────────────────────────────────────────────────────────────────

interface WebPlatformLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

// ── Asosiy Layout ───────────────────────────────────────────────────────────

export function WebPlatformLayout({ children, title, subtitle }: WebPlatformLayoutProps) {
  const { currentUser, currentScreen, navigate, unreadCount } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dark = true; // Light mode kelajakda qo'shiladi
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const role = currentUser?.role ?? 'admin';
  const roleGradient = ROLE_COLORS[role] || ROLE_COLORS.admin;

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const visibleGroups = useMemo(() =>
    NAV_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(item => !item.roles || item.roles.includes(role)),
    })).filter(g => g.items.length > 0),
  [role]);

  const handleLogout = () => navigate('web_login');

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'bg-slate-950' : 'bg-gray-50'}`}>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ══════ SIDEBAR ══════ */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`
          hidden lg:flex flex-col h-full shrink-0 relative z-20 overflow-hidden
          border-r ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <Activity className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
                className="ml-3 overflow-hidden whitespace-nowrap"
              >
                <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>MedSmartPro</p>
                <p className="text-indigo-400 text-xs">Web Platforma</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {visibleGroups.map(group => {
            const isCollapsed = collapsedGroups[group.label];
            const hasActiveItem = group.items.some(item => currentScreen === item.screen);
            return (
            <div key={group.label}>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => toggleGroup(group.label)}
                    className={`w-full flex items-center justify-between text-xs font-semibold uppercase tracking-widest px-3 py-1.5 mb-0.5 rounded-lg transition-colors
                      ${hasActiveItem && isCollapsed ? (dark ? 'text-indigo-400' : 'text-indigo-600') : (dark ? 'text-slate-500 hover:text-slate-400' : 'text-gray-400 hover:text-gray-500')}`}>
                    {group.label}
                    <ChevronRight className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} />
                  </motion.button>
                )}
              </AnimatePresence>
              <AnimatePresence initial={false}>
              {!isCollapsed && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = currentScreen === item.screen;
                  return (
                    <button key={item.screen} onClick={() => navigate(item.screen)}
                      title={!sidebarOpen ? item.label : undefined}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative
                        ${active
                          ? dark
                            ? 'bg-indigo-600/20 text-indigo-400'
                            : 'bg-indigo-50 text-indigo-600'
                          : dark
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      {active && (
                        <motion.div layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full"
                        />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : ''}`} />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className="text-sm font-medium flex-1 text-left whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {sidebarOpen && item.badge && (
                        <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full shrink-0">
                          {item.badge}
                        </span>
                      )}
                      {sidebarOpen && item.screen === 'web_notifications' && unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              </motion.div>
              )}
              </AnimatePresence>
            </div>
          );
          })}
        </div>

        {/* Foydalanuvchi profil qismi */}
        <div className={`p-3 border-t ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
          <div className={`flex items-center gap-3 p-2 rounded-xl ${dark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} transition-colors cursor-pointer`}
            onClick={() => navigate('profile')}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleGradient} flex items-center justify-center shrink-0`}>
              <span className="text-white text-xs font-bold">
                {currentUser?.fullName?.slice(0, 2).toUpperCase() ?? 'AD'}
              </span>
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 min-w-0 overflow-hidden">
                  <p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser?.fullName?.split(' ')[0] ?? 'Admin'}
                  </p>
                  <p className="text-xs text-indigo-400">{ROLE_LABELS[role]}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30 }}
            className={`fixed left-0 top-0 h-full w-64 z-40 lg:hidden flex flex-col
              ${dark ? 'bg-slate-900' : 'bg-white'} shadow-2xl`}
          >
            <div className={`flex items-center justify-between h-16 px-4 border-b ${dark ? 'border-slate-800' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>MedSmartPro</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-5 px-2">
              {visibleGroups.map(group => (
                <div key={group.label}>
                  <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-2 text-slate-500">{group.label}</p>
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const active = currentScreen === item.screen;
                    return (
                      <button key={item.screen} onClick={() => { navigate(item.screen); setMobileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm
                          ${active ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                      >
                        <Icon className="w-4 h-4" />{item.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ══════ MAIN AREA ══════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── TOPBAR ── */}
        <header className={`h-16 flex items-center justify-between px-4 lg:px-6 shrink-0 border-b z-10
          ${dark ? 'bg-slate-900/80 border-slate-800 backdrop-blur-sm' : 'bg-white border-gray-200 shadow-sm'}`}>

          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop sidebar toggle */}
            <button onClick={() => setSidebarOpen(v => !v)}
              className={`hidden lg:flex p-2 rounded-xl transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
              <Menu className="w-4 h-4" />
            </button>

            {/* Page title */}
            <div>
              <h1 className={`font-semibold text-sm lg:text-base ${dark ? 'text-white' : 'text-gray-900'}`}>
                {title ?? 'Dashboard'}
              </h1>
              {subtitle && (
                <p className={`text-xs hidden sm:block ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Qidiruv */}
            <button onClick={() => setSearchOpen(v => !v)}
              className={`p-2 rounded-xl transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-400 hover:bg-gray-100'}`}>
              <Search className="w-4 h-4" />
            </button>

            {/* Mini app ga o'tish */}
            <button onClick={() => navigate('role_select')} title="Mini ilovaga o'tish"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${dark ? 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700' : 'text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
              <Globe className="w-3.5 h-3.5" />
              Mini App
            </button>

            {/* Bildirishnomalar */}
            <button onClick={() => navigate('web_notifications')} className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Profil */}
            <div className="relative">
              <button onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${roleGradient} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">
                    {currentUser?.fullName?.slice(0, 2).toUpperCase() ?? 'AD'}
                  </span>
                </div>
                <span className={`text-sm font-medium hidden sm:block ${dark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {currentUser?.fullName?.split(' ')[0] ?? 'Admin'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl overflow-hidden z-50 border"
                    style={{ background: dark ? '#1e293b' : '#fff', borderColor: dark ? '#334155' : '#e5e7eb' }}
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div className="p-3 border-b" style={{ borderColor: dark ? '#334155' : '#e5e7eb' }}>
                      <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{currentUser?.fullName}</p>
                      <p className="text-xs text-indigo-400">{ROLE_LABELS[role]}</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { icon: Settings, label: 'Profil sozlamalari', action: () => navigate('profile') },
                        { icon: HelpCircle, label: 'Yordam', action: () => {} },
                        { icon: LogOut, label: 'Chiqish', action: handleLogout, danger: true },
                      ].map(item => (
                        <button key={item.label} onClick={() => { item.action(); setProfileOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors
                            ${item.danger
                              ? 'text-red-400 hover:bg-red-500/10'
                              : dark ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 52, opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className={`shrink-0 border-b overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3 px-6 h-full">
                <Search className="w-4 h-4 text-slate-500 shrink-0" />
                <input autoFocus type="text" placeholder="Qidirish: bemor, ariza, to'lov..."
                  onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                />
                <button onClick={() => setSearchOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONTENT ── */}
        <main className={`flex-1 overflow-y-auto ${dark ? 'bg-slate-950' : 'bg-gray-50'}`}>
          {children}
        </main>

        {/* Status bar */}
        <div className={`h-6 flex items-center px-6 justify-between shrink-0 border-t
          ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-500 text-xs">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Onlayn
            </span>
            <span className={`text-xs ${dark ? 'text-slate-600' : 'text-gray-400'}`}>MedSmartPro v2.0</span>
          </div>
          <span className={`text-xs ${dark ? 'text-slate-600' : 'text-gray-400'}`}>
            {new Date().toLocaleString('uz-UZ', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
