import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { doctorService } from '../../../../services/api/doctorService';
import {
  ChevronLeft, Star, MapPin, Phone, Calendar, MessageCircle,
  CheckCircle2, Clock, Award, Users, Stethoscope,
  Send, Instagram, Youtube, Globe, Share2, Loader2,
  GraduationCap, Briefcase, FileCheck, Medal,
} from 'lucide-react';
import type { DoctorProfile } from '../../../types';

const COMPLEXITY_LABELS: Record<string, string> = {
  SIMPLE: 'Oddiy', MEDIUM: "O'rta", COMPLEX: 'Murakkab', VERY_COMPLEX: 'Juda murakkab',
};

export function DoctorPublicProfile() {
  const { navigate, goBack } = useApp();
  const [tab, setTab] = useState<'about' | 'portfolio' | 'operations' | 'reviews'>('about');
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    doctorService.getMyProfile()
      .then(setProfile)
      .catch((err: any) => setError(err.message || 'Profil yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 text-sm text-center mb-4">{error || 'Profil topilmadi'}</p>
        <button onClick={goBack} className="text-blue-600 text-sm font-medium">Orqaga</button>
      </div>
    );
  }

  const user = profile.user!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack} className="p-2 rounded-full bg-white/20">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/20">
            <Share2 size={18} className="text-white" />
          </button>
        </div>

        {/* Doctor info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white/30 flex items-center justify-center overflow-hidden">
              {user.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-white">{user.fullName[0]}</span>
              }
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white">{user.fullName}</h1>
              {profile.licenseVerified && (
                <CheckCircle2 size={16} className="text-green-300 fill-green-300" />
              )}
            </div>
            <p className="text-blue-200 text-sm">{user.specialty}</p>
            {profile.qualificationCategory && (
              <span className="inline-block mt-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {profile.qualificationCategory}
              </span>
            )}
            <div className="flex items-center gap-1 mt-2">
              {renderStars(profile.averageRating)}
              <span className="text-white text-sm font-medium ml-1">{profile.averageRating}</span>
              <span className="text-blue-200 text-xs">({profile.totalRatings} ta baho)</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Konsultatsiya', value: profile.totalConsultations.toLocaleString() },
            { label: 'Operatsiya', value: profile.totalOperations.toLocaleString() },
            { label: 'Tajriba', value: `${profile.experienceYears} yil` },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-2.5 text-center">
              <p className="text-white font-bold text-base">{s.value}</p>
              <p className="text-blue-200 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA buttons */}
      <div className="px-4 -mt-3 flex gap-3">
        <button
          onClick={() => navigate('patient_kons_calendar')}
          className="flex-1 bg-white shadow-md rounded-2xl py-3 flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm"
        >
          <Calendar size={16} />
          Yozilish
        </button>
        <button
          onClick={() => navigate('patient_kons_type')}
          className="flex-1 bg-blue-600 rounded-2xl py-3 flex items-center justify-center gap-2 text-white font-semibold text-sm"
        >
          <MessageCircle size={16} />
          Konsultatsiya
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl flex p-1">
          {([['about', 'Haqida'], ['portfolio', 'Portfolio'], ['operations', "Operatsiyalar"], ['reviews', "Baholar"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === key ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-6 space-y-4">
        {/* About tab */}
        {tab === 'about' && (
          <>
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Stethoscope size={16} className="text-blue-500" />
                  Haqida
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Sub-specialties */}
            {profile.subSpecialties && profile.subSpecialties.length > 0 && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Award size={16} className="text-purple-500" />
                  Ixtisosliklar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.subSpecialties.map(s => (
                    <span key={s} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clinics */}
            {profile.clinics && profile.clinics.length > 0 && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  Ish joylari
                </h3>
                <div className="space-y-3">
                  {profile.clinics.map(dc => (
                    <div key={dc.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <MapPin size={16} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{dc.clinic.name}</p>
                        <p className="text-xs text-gray-500">{dc.clinic.address}</p>
                        {dc.position && <p className="text-xs text-blue-600 mt-0.5">{dc.position}</p>}
                        {dc.isVerified && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={10} className="text-green-500" />
                            <span className="text-xs text-green-600">Tasdiqlangan</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" />
                  Ijtimoiy tarmoqlar
                </h3>
                <div className="flex gap-3">
                  {profile.socialLinks.telegram && (
                    <a href={`https://t.me/${profile.socialLinks.telegram.replace('@', '')}`}
                       className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                      <Send size={16} className="text-sky-500" />
                    </a>
                  )}
                  {profile.socialLinks.instagram && (
                    <a href={`https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`}
                       className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                      <Instagram size={16} className="text-pink-500" />
                    </a>
                  )}
                  {profile.socialLinks.youtube && (
                    <a href={profile.socialLinks.youtube}
                       className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <Youtube size={16} className="text-red-500" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Portfolio tab */}
        {tab === 'portfolio' && (
          <>
            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <GraduationCap size={16} className="text-blue-500" />
                  Ta'lim
                </h3>
                <div className="space-y-3">
                  {profile.education.map((edu: any) => (
                    <div key={edu.id} className="border-l-2 border-blue-200 pl-3">
                      <p className="text-sm font-medium text-gray-900">{edu.institutionName}</p>
                      {edu.faculty && <p className="text-xs text-gray-600">{edu.faculty}</p>}
                      <p className="text-xs text-gray-400">{edu.startYear} — {edu.endYear ?? 'Hozir'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {profile.workExperience && profile.workExperience.length > 0 && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase size={16} className="text-green-500" />
                  Ish tajribasi
                </h3>
                <div className="space-y-3">
                  {profile.workExperience.map((exp: any) => (
                    <div key={exp.id} className="border-l-2 border-green-200 pl-3">
                      <p className="text-sm font-medium text-gray-900">{exp.organizationName}</p>
                      <p className="text-xs text-blue-600">{exp.position}</p>
                      <p className="text-xs text-gray-400">{exp.startYear} — {exp.endYear ?? 'Hozir'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile.achievements && profile.achievements.length > 0 && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  Yutuqlar
                </h3>
                <div className="space-y-2">
                  {profile.achievements.map((ach: any) => (
                    <div key={ach.id} className="flex items-center gap-2">
                      <Medal size={14} className="text-amber-500 shrink-0" />
                      <span className="text-sm text-gray-900">{ach.name}</span>
                      <span className="text-xs text-gray-400">{ach.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {profile.certificates && profile.certificates.length > 0 && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileCheck size={16} className="text-purple-500" />
                  Sertifikatlar
                </h3>
                <div className="space-y-2">
                  {profile.certificates.map((cert: any) => (
                    <div key={cert.id} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-900">{cert.name}</p>
                        <p className="text-xs text-gray-500">{cert.organization} — {cert.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!profile.education?.length && !profile.workExperience?.length && !profile.achievements?.length && !profile.certificates?.length) && (
              <div className="bg-white rounded-2xl p-8 text-center">
                <p className="text-sm text-gray-400">Portfolio ma'lumotlari hali kiritilmagan</p>
              </div>
            )}
          </>
        )}

        {/* Operations tab */}
        {tab === 'operations' && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              {profile.totalOperations} ta operatsiya bajarilgan
            </h3>
            <div className="space-y-3">
              {profile.operationTypes && profile.operationTypes.length > 0 ? (
                profile.operationTypes.map(op => (
                  <div key={op.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{op.operationName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{op.operationCode}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          op.complexity === 'VERY_COMPLEX' ? 'bg-red-50 text-red-600'
                          : op.complexity === 'COMPLEX' ? 'bg-orange-50 text-orange-600'
                          : op.complexity === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-green-50 text-green-600'
                        }`}>
                          {COMPLEXITY_LABELS[op.complexity]}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{op.count}</p>
                      <p className="text-xs text-gray-400">marta</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Operatsiyalar hali kiritilmagan</p>
              )}
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {tab === 'reviews' && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{profile.averageRating}</p>
                <div className="flex justify-center mt-1">{renderStars(profile.averageRating)}</div>
                <p className="text-xs text-gray-500 mt-1">{profile.totalRatings} ta baho</p>
              </div>
              <div className="flex-1">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center py-4">
              Baholar faqat konsultatsiyadan keyin ko'rsatiladi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
