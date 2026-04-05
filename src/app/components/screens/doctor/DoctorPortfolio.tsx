import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { doctorService } from '../../../../services/api/doctorService';
import type { DoctorProfile, Education, WorkExperience, Achievement, Certificate } from '../../../types';
import {
  ChevronLeft, GraduationCap, Briefcase, Award, FileCheck,
  Star, Stethoscope, MessageCircle, TrendingUp, Clock,
  CheckCircle2, Loader2, Medal,
} from 'lucide-react';

const DEGREE_LABELS: Record<string, string> = {
  BACHELOR: 'Bakalavr',
  MASTER: 'Magistr',
  PHD: 'PhD',
  DSC: 'DSc',
  RESIDENCY: 'Rezidentura',
  ORDINATURA: 'Ordinatura',
};

const GROUP_LABELS: Record<string, string> = {
  SCIENTIFIC: 'Ilmiy',
  PRACTICAL: 'Amaliy',
  ORGANIZATIONAL: 'Tashkiliy',
  INTERNATIONAL: 'Xalqaro',
  STATE: 'Davlat',
};

const STICKER_COLORS: Record<string, string> = {
  GOLD: 'bg-amber-100 text-amber-700 border-amber-300',
  SILVER: 'bg-gray-100 text-gray-700 border-gray-300',
  BRONZE: 'bg-orange-100 text-orange-700 border-orange-300',
  SPECIAL: 'bg-purple-100 text-purple-700 border-purple-300',
};

export function DoctorPortfolio() {
  const { goBack } = useApp();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'education' | 'experience' | 'achievements' | 'certificates'>('education');

  useEffect(() => {
    doctorService.getMyProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 text-sm">Profil topilmadi</p>
        <button onClick={goBack} className="mt-4 text-blue-600 text-sm">Orqaga</button>
      </div>
    );
  }

  const education = profile.education ?? [];
  const experience = profile.workExperience ?? [];
  const achievements = profile.achievements ?? [];
  const certificates = profile.certificates ?? [];

  const stats = [
    { label: 'Konsultatsiya', value: profile.totalConsultations.toLocaleString(), icon: <MessageCircle size={16} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Operatsiya', value: profile.totalOperations.toLocaleString(), icon: <Stethoscope size={16} />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Tajriba', value: `${profile.experienceYears} yil`, icon: <Clock size={16} />, color: 'bg-green-50 text-green-600' },
    { label: 'Reyting', value: profile.averageRating.toFixed(1), icon: <Star size={16} />, color: 'bg-amber-50 text-amber-600' },
  ];

  const tabs = [
    { key: 'education' as const, label: "Ta'lim", icon: <GraduationCap size={14} />, count: education.length },
    { key: 'experience' as const, label: 'Tajriba', icon: <Briefcase size={14} />, count: experience.length },
    { key: 'achievements' as const, label: 'Yutuqlar', icon: <Award size={14} />, count: achievements.length },
    { key: 'certificates' as const, label: 'Sertifikatlar', icon: <FileCheck size={14} />, count: certificates.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Professional Portfolio</h1>
          <p className="text-xs text-gray-500">{profile.user?.fullName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-4 gap-2">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl p-2.5 text-center">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-1.5`}>
                {s.icon}
              </div>
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="bg-white rounded-2xl flex p-1 gap-0.5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                tab === t.key ? 'bg-blue-500 text-white' : 'text-gray-500'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.count > 0 && (
                <span className={`text-[10px] px-1 rounded-full ${
                  tab === t.key ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {/* Education Tab */}
        {tab === 'education' && (
          education.length > 0 ? education.map(edu => (
            <div key={edu.id} className="bg-white rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <GraduationCap size={18} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{edu.institutionName}</p>
                  {edu.faculty && <p className="text-xs text-gray-600">{edu.faculty}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {DEGREE_LABELS[edu.degree] ?? edu.degree}
                    </span>
                    <span className="text-xs text-gray-400">
                      {edu.startYear} — {edu.endYear ?? 'Hozir'}
                    </span>
                  </div>
                  {edu.isVerified && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 size={10} className="text-green-500" />
                      <span className="text-[10px] text-green-600">Tasdiqlangan</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <EmptyState text="Ta'lim ma'lumotlari kiritilmagan" />
          )
        )}

        {/* Experience Tab */}
        {tab === 'experience' && (
          experience.length > 0 ? experience.map(exp => (
            <div key={exp.id} className="bg-white rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{exp.organizationName}</p>
                  <p className="text-xs text-blue-600">{exp.position}</p>
                  {exp.department && <p className="text-xs text-gray-500">{exp.department}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {exp.startYear} — {exp.endYear ?? 'Hozir'}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-gray-500 mt-1">{exp.description}</p>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <EmptyState text="Ish tajribasi kiritilmagan" />
          )
        )}

        {/* Achievements Tab */}
        {tab === 'achievements' && (
          achievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {achievements.map(ach => (
                <div key={ach.id} className={`bg-white rounded-2xl p-3 border ${
                  ach.stickerType ? STICKER_COLORS[ach.stickerType] ?? 'border-gray-100' : 'border-gray-100'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Medal size={16} className={
                      ach.stickerType === 'GOLD' ? 'text-amber-500'
                      : ach.stickerType === 'SILVER' ? 'text-gray-400'
                      : ach.stickerType === 'BRONZE' ? 'text-orange-500'
                      : 'text-purple-500'
                    } />
                    <span className="text-[10px] text-gray-400">{ach.year}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 line-clamp-2">{ach.name}</p>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                    {GROUP_LABELS[ach.group] ?? ach.group}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Yutuqlar kiritilmagan" />
          )
        )}

        {/* Certificates Tab */}
        {tab === 'certificates' && (
          certificates.length > 0 ? certificates.map(cert => (
            <div key={cert.id} className="bg-white rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <FileCheck size={18} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{cert.name}</p>
                  <p className="text-xs text-gray-600">{cert.organization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{cert.direction}</span>
                    <span className="text-xs text-gray-400">{cert.year}</span>
                  </div>
                  {cert.isVerified && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 size={10} className="text-green-500" />
                      <span className="text-[10px] text-green-600">Tasdiqlangan</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <EmptyState text="Sertifikatlar kiritilmagan" />
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
