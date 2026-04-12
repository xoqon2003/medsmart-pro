import React, { useState } from 'react';
import { useApp } from '../../../store/appStore';
import { doctorService } from '../../../../services/api/doctorService';
import {
  ChevronLeft, Camera, Plus, X, Globe, Instagram,
  Send, Youtube, Linkedin, Facebook, CheckCircle2,
} from 'lucide-react';

const SPECIALTIES = [
  "Kardiolog", "Nevrolog", "Xirurg", "Terapevt", "Pediatr",
  "Ginekolog", "Urolog", "Ortoped", "Gastroenterolog", "Endokrinolog",
  "Okulist", "Lor", "Dermatolog", "Psixiatr", "Onkolog",
  "Travmatolog", "Nefrologiya", "Revmatolog", "Infeksionist", "Boshqa",
];

const QUALIFICATIONS = ["Oliy toifa", "1-toifa", "2-toifa", "Toifasiz"];

interface FormData {
  bio: string;
  birthDate: string;
  experienceYears: string;
  qualificationCategory: string;
  licenseNumber: string;
  subSpecialties: string[];
  profileUrl: string;
  isPublic: boolean;
  socialLinks: {
    telegram: string;
    instagram: string;
    youtube: string;
    facebook: string;
    linkedin: string;
  };
}

const STEPS = ["Asosiy", "Hujjatlar", "Ijtimoiy", "URL"];

export function DoctorProfileSetup() {
  const { navigate, goBack, currentUser } = useApp();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    bio: '',
    birthDate: '',
    experienceYears: '',
    qualificationCategory: '',
    licenseNumber: '',
    subSpecialties: [],
    profileUrl: '',
    isPublic: true,
    socialLinks: { telegram: '', instagram: '', youtube: '', facebook: '', linkedin: '' },
  });

  const setField = (key: keyof FormData, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleSubSpecialty = (s: string) => {
    setField('subSpecialties',
      form.subSpecialties.includes(s)
        ? form.subSpecialties.filter(x => x !== s)
        : [...form.subSpecialties, s]
    );
  };

  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await doctorService.createProfile({
        ...form,
        experienceYears: +form.experienceYears,
        socialLinks: Object.fromEntries(
          Object.entries(form.socialLinks).filter(([, v]) => v.trim() !== '')
        ),
      });
      navigate('doctor_tariff_select');
    } catch (err: any) {
      setError(err.message || 'Profil yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.experienceYears !== '';
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Profil yaratish</h1>
            <p className="text-xs text-gray-500">{step + 1} / {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Step 0: Asosiy ma'lumotlar */}
        {step === 0 && (
          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center py-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {currentUser?.avatar
                    ? <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-3xl font-bold text-gray-400">
                        {currentUser?.fullName?.[0] ?? 'S'}
                      </span>
                  }
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow">
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Profil suratini o'zgartirish</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio / Tavsif
              </label>
              <textarea
                value={form.bio}
                onChange={e => setField('bio', e.target.value)}
                placeholder="O'zingiz haqingizda qisqa ma'lumot..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Tug'ilgan sana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tug'ilgan sana
              </label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => setField('birthDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tajriba */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tajriba yili <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.experienceYears}
                onChange={e => setField('experienceYears', e.target.value)}
                placeholder="Masalan: 10"
                min={0}
                max={60}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Qo'shimcha mutaxassisliklar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qo'shimcha mutaxassisliklar
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSubSpecialty(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.subSpecialties.includes(s)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Hujjatlar */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
              Hujjatlar platforma jamoasi tomonidan tekshiriladi. Tasdiqlangach profilda galochka ko'rinadi.
            </div>

            {/* Malaka toifasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Malaka toifasi
              </label>
              <select
                value={form.qualificationCategory}
                onChange={e => setField('qualificationCategory', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">— Tanlang —</option>
                {QUALIFICATIONS.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            {/* Malaka sertifikati */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Malaka sertifikati (PDF/JPG)
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400">
                <Plus size={20} className="text-gray-400" />
                <span className="text-sm text-gray-500">Fayl yuklash</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
              </label>
            </div>

            {/* Litsenziya raqami */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shifokorlik litsenziyasi raqami
              </label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={e => setField('licenseNumber', e.target.value)}
                placeholder="Masalan: LS-2019-XXXXX"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Litsenziya hujjati */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Litsenziya hujjati (PDF/JPG)
              </label>
              <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-400">
                <Plus size={20} className="text-gray-400" />
                <span className="text-sm text-gray-500">Fayl yuklash</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Ijtimoiy tarmoqlar */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              Bemorlar siz bilan bog'lanishi uchun ijtimoiy tarmoqlaringizni qo'shing (ixtiyoriy)
            </p>
            {[
              { key: 'telegram', label: 'Telegram', icon: <Send size={16} />, placeholder: '@username' },
              { key: 'instagram', label: 'Instagram', icon: <Instagram size={16} />, placeholder: '@username' },
              { key: 'youtube', label: 'YouTube', icon: <Youtube size={16} />, placeholder: 'kanal URL' },
              { key: 'facebook', label: 'Facebook', icon: <Facebook size={16} />, placeholder: 'profil URL' },
              { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={16} />, placeholder: 'profil URL' },
            ].map(({ key, label, icon, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-gray-500">
                    {icon}
                  </div>
                  <input
                    type="text"
                    value={(form.socialLinks as any)[key]}
                    onChange={e => setField('socialLinks', { ...form.socialLinks, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Profil URL */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Globe size={18} className="text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Shaxsiy profil manzili</p>
                  <p className="text-xs text-green-600 mt-1">
                    Bu manzilni bemorrlaringizga yuboring — ular profilingizni ko'ra oladilar
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profil URL (ixtiyoriy)
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-xs text-gray-500 whitespace-nowrap">
                  medsmart-pro.vercel.app/d/
                </span>
                <input
                  type="text"
                  value={form.profileUrl}
                  onChange={e => setField('profileUrl', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="ismi-familiya"
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
              {form.profileUrl && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  medsmart-pro.vercel.app/d/{form.profileUrl}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setField('isPublic', !form.isPublic)}
                  className={`w-12 h-6 rounded-full transition-colors ${form.isPublic ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${
                    form.isPublic ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Profil ochiq</p>
                  <p className="text-xs text-gray-500">
                    {form.isPublic ? "Hamma ko'ra oladi" : "Faqat ruxsat berganlar"}
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        {error && (
          <p className="text-red-500 text-xs text-center mb-2">{error}</p>
        )}
        <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-medium text-sm"
          >
            Orqaga
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40"
          >
            Keyingi
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
          >
            {loading ? "Saqlanmoqda..." : "Profil saqlash"}
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
