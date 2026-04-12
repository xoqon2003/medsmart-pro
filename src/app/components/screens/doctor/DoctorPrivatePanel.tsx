import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { doctorService } from '../../../../services/api/doctorService';
import type { DoctorProfile } from '../../../types';
import {
  User, Settings, Star, Calendar, MessageCircle, FileText,
  Building2, Stethoscope, Crown, ChevronRight, Eye, EyeOff,
  TrendingUp, CheckCircle2, Clock, Bell, Share2, Plus, Loader2,
  Briefcase, Mail, HelpCircle, Phone, Send,
} from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}

const TARIFF_LABELS: Record<string, { label: string; color: string }> = {
  FREE: { label: 'Bepul tarif', color: 'bg-gray-100 text-gray-700' },
  START: { label: 'Start tarif', color: 'bg-blue-100 text-blue-700' },
  LITE: { label: 'Lite tarif', color: 'bg-purple-100 text-purple-700' },
  PREMIUM: { label: 'Premium tarif', color: 'bg-amber-100 text-amber-700' },
};

export function DoctorPrivatePanel() {
  const { navigate, currentUser, goBack } = useApp();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  useEffect(() => {
    doctorService.getMyProfile()
      .then((p) => {
        setProfile(p);
        setProfileVisible(p.isPublic);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tariffCode = profile?.tariff?.code ?? 'FREE';
  const tariffInfo = TARIFF_LABELS[tariffCode] ?? TARIFF_LABELS.FREE;

  const stats: StatCard[] = [
    {
      label: 'Jami konsultatsiya',
      value: profile?.totalConsultations?.toLocaleString() ?? '0',
      icon: <MessageCircle size={18} />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Jami operatsiya',
      value: profile?.totalOperations?.toLocaleString() ?? '0',
      icon: <Stethoscope size={18} />,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: "O'rtacha reyting",
      value: profile?.averageRating?.toFixed(1) ?? '0.0',
      sub: `${profile?.totalRatings ?? 0} ta baho`,
      icon: <Star size={18} />,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Reyting (mutaxassislik)',
      value: profile?.specialtyRank ? `#${profile.specialtyRank}` : '-',
      sub: currentUser?.specialty ?? '',
      icon: <TrendingUp size={18} />,
      color: 'bg-green-50 text-green-600',
    },
  ];

  const menuItems = [
    { label: 'Profilni tahrirlash', icon: <User size={18} />, screen: 'doctor_profile_setup', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Portfolio', icon: <Briefcase size={18} />, screen: 'doctor_portfolio_edit', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Tarif va obuna', icon: <Crown size={18} />, screen: 'doctor_tariff_select', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Klinikalar', icon: <Building2 size={18} />, screen: 'doctor_clinic_manage', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Xabarlar (Chat)', icon: <MessageCircle size={18} />, screen: 'conversations_list', color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Arizalar', icon: <Mail size={18} />, screen: 'doctor_contact_requests', color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'FAQ', icon: <HelpCircle size={18} />, screen: 'doctor_faq_editor', color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Xizmatlar', icon: <Stethoscope size={18} />, screen: 'doctor_services_editor', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Xabar shablonlari', icon: <FileText size={18} />, screen: 'doctor_template_manager', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Verifikatsiya', icon: <CheckCircle2 size={18} />, screen: 'doctor_verification', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Anonim nomer', icon: <Phone size={18} />, screen: 'doctor_anonymous_number', color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Telegram bot', icon: <Send size={18} />, screen: 'doctor_telegram_bot', color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Reklama', icon: <Eye size={18} />, screen: 'doctor_ad_settings', color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Profil ulashish', icon: <Share2 size={18} />, screen: 'doctor_share_profile', color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Kalendar', icon: <Calendar size={18} />, screen: 'doctor_calendar_view', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Bildirishnomalar', icon: <Bell size={18} />, screen: 'notifications', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const handleToggleVisibility = async () => {
    const newValue = !profileVisible;
    setProfileVisible(newValue);
    try {
      await doctorService.updateProfile({ isPublic: newValue });
    } catch {
      setProfileVisible(!newValue);
    }
  };

  const profileUrl = profile?.profileUrl
    ? `medsmart-pro.vercel.app/d/${profile.profileUrl}`
    : currentUser?.fullName
      ? `medsmart-pro.vercel.app/d/${currentUser.fullName.toLowerCase().replace(/\s+/g, '-')}`
      : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center overflow-hidden">
              {currentUser?.avatar
                ? <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-xl font-bold text-blue-600">{currentUser?.fullName?.[0] ?? 'S'}</span>
              }
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{currentUser?.fullName ?? 'Shifokor'}</p>
              <p className="text-xs text-gray-500">{currentUser?.specialty ?? 'Mutaxassislik'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggleVisibility}
              className="p-2 rounded-xl bg-gray-100"
            >
              {profileVisible
                ? <Eye size={18} className="text-gray-600" />
                : <EyeOff size={18} className="text-gray-400" />
              }
            </button>
            <button
              onClick={() => navigate('doctor_public_profile')}
              className="p-2 rounded-xl bg-blue-50"
            >
              <Share2 size={18} className="text-blue-600" />
            </button>
          </div>
        </div>

        {/* Tarif badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 ${tariffInfo.color} text-xs px-2.5 py-1 rounded-full font-medium`}>
            <Crown size={12} />
            {tariffInfo.label}
          </span>
          {!profileVisible && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
              <EyeOff size={12} />
              Profil yopiq
            </span>
          )}
          {profile?.licenseVerified && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full">
              <CheckCircle2 size={12} />
              Tasdiqlangan
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3.5">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-2`}>
                {s.icon}
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              {s.sub && <p className="text-xs text-green-600 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Tezkor harakatlar</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Yozilish', icon: <Plus size={20} />, action: () => navigate('patient_kons_calendar'), color: 'bg-blue-50 text-blue-600' },
              { label: 'Profil', icon: <User size={20} />, action: () => navigate('doctor_public_profile'), color: 'bg-green-50 text-green-600' },
              { label: 'Ulashish', icon: <Share2 size={20} />, action: () => {}, color: 'bg-purple-50 text-purple-600' },
            ].map(a => (
              <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center`}>
                  {a.icon}
                </div>
                <span className="text-xs text-gray-600">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => navigate(item.screen as any)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                i < menuItems.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <span className="flex-1 text-sm font-medium text-gray-800 text-left">{item.label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>

        {/* Profile URL card */}
        {profileUrl && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-semibold text-sm">Shaxsiy profil manzili</p>
                <p className="text-blue-200 text-xs mt-1">{profileUrl}</p>
              </div>
              <button
                onClick={() => navigate('doctor_public_profile')}
                className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl"
              >
                Ko'rish
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                <Share2 size={12} />
                Ulashish
              </button>
              <button
                onClick={() => navigate('doctor_profile_setup')}
                className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1"
              >
                <Settings size={12} />
                Sozlash
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
