import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight, User, Phone, Calendar, MapPin, Heart, Shield,
  Globe, LogOut, Star, FileText, Award, Clock, TrendingUp,
  Edit2, CheckCircle, Activity
} from 'lucide-react';
import { useApp } from '../../store/appStore';
import { formatDate } from '../../data/mockData';

const ROLE_LABEL: Record<string, { label: string; color: string; bg: string; gradient: string }> = {
  patient:    { label: 'Bemor',      color: 'text-blue-200',   bg: 'bg-blue-500/30',   gradient: 'from-blue-900 to-indigo-900' },
  radiolog:   { label: 'Radiolog',   color: 'text-emerald-200',bg: 'bg-emerald-500/30',gradient: 'from-emerald-900 to-teal-900' },
  operator:   { label: 'Operator',   color: 'text-violet-200', bg: 'bg-violet-500/30', gradient: 'from-violet-900 to-purple-900' },
  specialist: { label: 'Mutaxassis', color: 'text-purple-200', bg: 'bg-purple-500/30', gradient: 'from-purple-900 to-violet-900' },
  doctor:     { label: 'Shifokor',   color: 'text-sky-200',    bg: 'bg-sky-500/30',    gradient: 'from-sky-900 to-blue-900' },
  admin:      { label: 'Admin',      color: 'text-rose-200',   bg: 'bg-rose-500/30',   gradient: 'from-rose-900 to-pink-900' },
};

export function ProfileScreen() {
  const { currentUser, navigate, goBack, setUser, applications } = useApp();
  const [editMode, setEditMode] = useState(false);

  if (!currentUser) return null;

  const roleInfo = ROLE_LABEL[currentUser.role] || ROLE_LABEL.patient;
  const isProfessional = ['radiolog', 'specialist', 'doctor'].includes(currentUser.role);

  const handleLogout = () => {
    setUser(null);
    navigate('role_select');
  };

  // Role-specific stats
  const myApps = applications.filter(a => {
    if (currentUser.role === 'patient') return a.patientId === currentUser.id;
    if (currentUser.role === 'radiolog') return a.radiologId === currentUser.id;
    if (currentUser.role === 'specialist') return a.specialistId === currentUser.id;
    if (currentUser.role === 'doctor') return a.doctorId === currentUser.id;
    return false;
  });
  const myDone = myApps.filter(a => a.status === 'done');

  const professionalStats = isProfessional ? [
    { label: 'Jami xulosa', value: (currentUser.totalConclusions || myDone.length || 0).toLocaleString(), icon: Award },
    { label: 'Tajriba', value: `${currentUser.experience || 0} yil`, icon: Clock },
    { label: 'Reyting', value: `${currentUser.rating || '—'} ⭐`, icon: Star },
  ] : [];

  const patientStats = currentUser.role === 'patient' ? [
    { label: 'Jami arizalar', value: myApps.length, icon: FileText },
    { label: 'Bajarildi', value: myDone.length, icon: CheckCircle },
    { label: 'Jarayonda', value: myApps.filter(a => !['done','failed','archived'].includes(a.status)).length, icon: Activity },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${roleInfo.gradient} pt-12 pb-24 px-5`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <h1 className="text-white text-lg">Profil</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center"
          >
            <Edit2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl mb-3 border-2 border-white/30 shadow-lg">
            {currentUser.avatar}
          </div>
          <p className="text-white text-lg">{currentUser.fullName}</p>
          <p className="text-white/60 text-sm">@{currentUser.username}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap justify-center">
            <span className={`text-xs px-3 py-1 rounded-full ${roleInfo.bg} ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
            {currentUser.rating && (
              <span className="text-xs bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded-full">
                ⭐ {currentUser.rating}
              </span>
            )}
            {currentUser.isActive && (
              <span className="text-xs bg-green-500/20 text-green-200 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                Faol
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-16 space-y-4 pb-24">
        {/* Stats (role-specific) */}
        {(professionalStats.length > 0 || patientStats.length > 0) && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Statistika
            </p>
            <div className={`grid gap-2 ${(professionalStats.length || patientStats.length) === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {(isProfessional ? professionalStats : patientStats).map(s => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-xl p-2.5 text-center"
                >
                  <s.icon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-gray-800 text-sm">{s.value}</p>
                  <p className="text-gray-400 text-xs leading-tight">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Personal info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-500 text-xs mb-3">Shaxsiy ma'lumotlar</p>
          <div className="space-y-3">
            {[
              { icon: Phone,    label: 'Telefon',         value: currentUser.phone },
              { icon: Calendar, label: "Tug'ilgan sana",  value: currentUser.birthDate ? formatDate(currentUser.birthDate) : '' },
              { icon: User,     label: 'Jinsi',           value: currentUser.gender === 'male' ? '👨 Erkak' : '👩 Ayol' },
              { icon: MapPin,   label: 'Shahar',          value: currentUser.city },
              { icon: Globe,    label: 'Til',             value: currentUser.language === 'uz' ? "🇺🇿 O'zbek" : '🇷🇺 Rus' },
            ].filter(item => item.value).map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{item.label}</p>
                  <p className="text-gray-800 text-sm">{item.value}</p>
                </div>
              </div>
            ))}
            {currentUser.chronicDiseases && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Surunkali kasalliklar</p>
                  <p className="text-gray-800 text-sm">{currentUser.chronicDiseases}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional info */}
        {isProfessional && (currentUser.license || currentUser.specialty) && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-3">Kasbiy ma'lumotlar</p>
            <div className="space-y-3">
              {currentUser.license && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Litsenziya</p>
                    <p className="text-gray-800 text-sm font-mono">{currentUser.license}</p>
                  </div>
                </div>
              )}
              {currentUser.specialty && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Ixtisoslik</p>
                    <p className="text-gray-800 text-sm">{currentUser.specialty}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Rating bar */}
            {currentUser.rating && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-gray-500 text-xs">Bemorlar bahosi</p>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(currentUser.rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-gray-700 text-xs ml-1">{currentUser.rating}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${(currentUser.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy & Security */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-500 text-xs mb-3">Maxfiylik va xavfsizlik</p>
          <div className="space-y-2.5">
            {[
              { icon: Shield, label: "Ma'lumotlarni eksport", desc: 'JSON/PDF formatida' },
              { icon: FileText, label: 'Shartnoma tarixi', desc: 'Imzolangan hujjatlar' },
            ].map(item => (
              <button key={item.label} className="w-full flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-800 text-sm">{item.label}</p>
                    <p className="text-gray-400 text-xs">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 border border-red-100 text-red-600 rounded-2xl py-3.5 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Chiqish (boshqa rol tanlash)</span>
        </button>

        <p className="text-center text-gray-400 text-xs">RadConsult v1.0.0 • PDPL 2019 ga mos</p>
      </div>
    </div>
  );
}