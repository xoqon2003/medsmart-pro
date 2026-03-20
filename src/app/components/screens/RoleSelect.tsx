import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Stethoscope, Settings, ShieldCheck, ChevronRight, Lock, Eye, EyeOff, Activity, Banknote, Monitor } from 'lucide-react';
import { useApp } from '../../store/appStore';
import { authService } from '../../../services';
import type { UserRole } from '../../types';
import type { User as UserType } from '../../types';

const roles = [
  {
    id: 'patient' as UserRole,
    label: 'Bemor',
    description: 'Radiologik konsultatsiya olish',
    icon: User,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    pin: false,
  },
  {
    id: 'radiolog' as UserRole,
    label: 'Radiolog',
    description: "Arizalarni ko'rib xulosalar berish",
    icon: Stethoscope,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    pin: true,
  },
  {
    id: 'specialist' as UserRole,
    label: 'Mutaxassis',
    description: 'Tor mutaxassis konsultatsiyasi',
    icon: Activity,
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    pin: true,
  },
  {
    id: 'doctor' as UserRole,
    label: 'Shifokor',
    description: "Bemor xulosalarini ko'rish va yuklash",
    icon: Stethoscope,
    color: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    pin: true,
  },
  {
    id: 'operator' as UserRole,
    label: 'Operator',
    description: "Arizalar va to'lovlarni boshqarish",
    icon: Settings,
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    pin: true,
  },
  {
    id: 'admin' as UserRole,
    label: 'Admin',
    description: "Tizimni to'liq boshqarish",
    icon: ShieldCheck,
    color: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    pin: true,
  },
  {
    id: 'kassir' as UserRole,
    label: 'Kassir',
    description: "To'lovlarni qabul qilish va kassa",
    icon: Banknote,
    color: 'from-sky-600 to-blue-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    pin: true,
  },
];

const DEMO_PINS: Record<string, string> = {
  radiolog: '123456',
  operator: '654321',
  admin: '000000',
  specialist: '111111',
  doctor: '777777',
  kassir: '222222',
};

const DEMO_USERS: Record<UserRole, number> = {
  patient: 0,
  radiolog: 1,
  operator: 2,
  admin: 3,
  specialist: 6,
  doctor: 7,
  kassir: 8,
};

export function RoleSelect() {
  const { navigate, setUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    authService.getUsers().then(setUsers);
  }, []);

  const handleRoleSelect = (role: typeof roles[0]) => {
    setSelectedRole(role.id);
    setPin('');
    setError('');
    if (!role.pin) {
      const user = users[DEMO_USERS[role.id]];
      if (user) { setUser(user); navigate('patient_home'); }
    }
  };

  const handlePinSubmit = () => {
    if (!selectedRole) return;
    const correctPin = DEMO_PINS[selectedRole];
    if (pin === correctPin) {
      const user = users[DEMO_USERS[selectedRole]];
      if (user) setUser(user);
      if (selectedRole === 'radiolog') navigate('radiolog_dashboard');
      else if (selectedRole === 'operator') navigate('operator_dashboard');
      else if (selectedRole === 'admin') navigate('admin_dashboard');
      else if (selectedRole === 'specialist') navigate('specialist_dashboard');
      else if (selectedRole === 'doctor')  navigate('doctor_dashboard');
      else if (selectedRole === 'kassir')  navigate('kassir_dashboard');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(newAttempts >= 3 ? '3 marta xato. 10 daqiqa kuting.' : `PIN noto'g'ri. ${3 - newAttempts} urinish qoldi.`);
      setPin('');
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-white text-2xl mb-1">Kirish</h1>
          <p className="text-blue-200 text-sm">Rolni tanlang va davom eting</p>
        </motion.div>
      </div>

      <div className="flex-1 px-4 py-6 -mt-4">
        {/* Role cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {roles.map((role, i) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => handleRoleSelect(role)}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? `${role.border} ${role.bg} shadow-md scale-[1.02]`
                    : 'border-white bg-white shadow-sm hover:shadow-md'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-900 text-sm mb-0.5">{role.label}</p>
                <p className="text-gray-500 text-xs leading-tight">{role.description}</p>
                {role.pin && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* PIN input for protected roles */}
        <AnimatePresence>
          {selectedRole && selectedRoleData?.pin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-sm p-5 mb-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-gray-500" />
                <p className="text-gray-800 text-sm">{selectedRoleData.label} uchun PIN kiriting</p>
              </div>

              <div className="relative mb-3">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={e => { setPin(e.target.value.slice(0, 6)); setError(''); }}
                  placeholder="6 xonali PIN"
                  maxLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-lg tracking-widest text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
                />
                <button
                  onClick={() => setShowPin(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs mb-3 text-center"
                >
                  {error}
                </motion.p>
              )}

              <p className="text-gray-400 text-xs text-center mb-3">
                Demo PIN: <span className="text-blue-600">{DEMO_PINS[selectedRole] || '000000'}</span>
              </p>

              <button
                onClick={handlePinSubmit}
                disabled={pin.length !== 6 || attempts >= 3}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Kirish</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-amber-700 text-xs text-center">
            🎭 Demo rejim — Har bir rolni sinab ko'ring
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1">
            {Object.entries(DEMO_PINS).map(([role, pin]) => (
              <div key={role} className="text-center">
                <p className="text-amber-600 text-xs">{pin}</p>
                <p className="text-amber-500 text-xs capitalize">{role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Web Platform kirish */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('web_login')}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-indigo-900 font-semibold text-sm">Web Platforma</p>
              <p className="text-indigo-500 text-xs">Desktop · Admin · Operator · Kassir</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
}
