import React from 'react';
import { motion } from 'motion/react';
import { Home, PlusCircle, Bell, User, BarChart2, Layers, Stethoscope, Activity, Banknote } from 'lucide-react';
import { useApp } from '../../store/appStore';
import type { Screen } from '../../types';

interface NavItem {
  screen: Screen;
  icon: React.ElementType;
  label: string;
  matchScreens?: Screen[];
}

const PATIENT_NAV: NavItem[] = [
  { screen: 'patient_home', icon: Home, label: 'Asosiy', matchScreens: ['patient_home', 'patient_status', 'patient_conclusion'] },
  { screen: 'patient_upload', icon: PlusCircle, label: 'Yangi ariza' },
  { screen: 'notifications', icon: Bell, label: 'Xabarlar' },
  { screen: 'profile', icon: User, label: 'Profil' },
];

const RADIOLOG_NAV: NavItem[] = [
  { screen: 'radiolog_dashboard', icon: Home, label: 'Dashboard' },
  { screen: 'notifications', icon: Bell, label: 'Xabarlar' },
  { screen: 'profile', icon: User, label: 'Profil' },
];

const DOCTOR_NAV: NavItem[] = [
  { screen: 'doctor_dashboard', icon: Stethoscope, label: 'Dashboard', matchScreens: ['doctor_dashboard', 'doctor_patient_view'] },
  { screen: 'notifications', icon: Bell, label: 'Xabarlar' },
  { screen: 'profile', icon: User, label: 'Profil' },
];

const SPECIALIST_NAV: NavItem[] = [
  { screen: 'specialist_dashboard', icon: Activity, label: 'Dashboard' },
  { screen: 'notifications', icon: Bell, label: 'Xabarlar' },
  { screen: 'profile', icon: User, label: 'Profil' },
];

const OPERATOR_NAV: NavItem[] = [
  { screen: 'operator_dashboard', icon: Layers, label: 'Panel' },
  { screen: 'notifications', icon: Bell, label: 'Xabarlar' },
  { screen: 'profile', icon: User, label: 'Profil' },
];

const ADMIN_NAV: NavItem[] = [
  { screen: 'admin_dashboard', icon: BarChart2, label: 'Admin' },
  { screen: 'notifications', icon: Bell, label: 'Xabarlar' },
  { screen: 'profile', icon: User, label: 'Profil' },
];

const KASSIR_NAV: NavItem[] = [
  { screen: 'kassir_dashboard', icon: Banknote, label: 'Kassa' },
  { screen: 'notifications', icon: Bell, label: 'Xabarlar' },
  { screen: 'profile', icon: User, label: 'Profil' },
];

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  patient: PATIENT_NAV,
  radiolog: RADIOLOG_NAV,
  doctor: DOCTOR_NAV,
  specialist: SPECIALIST_NAV,
  operator: OPERATOR_NAV,
  admin: ADMIN_NAV,
  kassir: KASSIR_NAV,
};

export const SHOW_NAV_ON: Screen[] = [
  'patient_home', 'patient_status', 'patient_conclusion',
  'radiolog_dashboard',
  'doctor_dashboard', 'doctor_patient_view',
  'specialist_dashboard',
  'operator_dashboard',
  'admin_dashboard',
  'kassir_dashboard',
  'notifications',
  'profile',
];

const ROLE_COLORS: Record<string, string> = {
  patient:   '#2563eb',
  radiolog:  '#059669',
  doctor:    '#0284c7',
  specialist:'#7c3aed',
  operator:  '#6d28d9',
  admin:     '#e11d48',
  kassir:    '#0369a1',
};

export function BottomNav() {
  const { currentUser, currentScreen, navigate, unreadCount, openServiceSheet } = useApp();

  if (!currentUser) return null;
  if (!SHOW_NAV_ON.includes(currentScreen as Screen)) return null;

  const items = NAV_BY_ROLE[currentUser.role];
  if (!items || items.length === 0) return null;

  const activeColor = ROLE_COLORS[currentUser.role] || '#2563eb';

  const isActive = (item: NavItem): boolean => {
    if (item.matchScreens) return item.matchScreens.includes(currentScreen as Screen);
    return currentScreen === item.screen;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className="w-full max-w-md pointer-events-auto"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}
      >
        <div className="flex items-center justify-around px-1 pt-2 pb-4">
          {items.map(item => {
            const Icon = item.icon;
            const active = isActive(item);
            const isNotif = item.screen === 'notifications';
            return (
              <button
                key={item.screen}
                onClick={() => {
                  if (item.screen === 'patient_upload') { openServiceSheet(); return; }
                  navigate(item.screen);
                }}
                className="flex flex-col items-center gap-0.5 flex-1 py-1 relative"
              >
                {active && (
                  <motion.div
                    layoutId="bnav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: activeColor }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors duration-150`}
                    style={{ color: active ? activeColor : '#9ca3af' }}
                  />
                  {isNotif && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center px-0.5" style={{ fontSize: '9px' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs transition-colors duration-150`}
                  style={{ color: active ? activeColor : '#9ca3af' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
