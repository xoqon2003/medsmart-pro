import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, User, Users, Stethoscope, Building2, Lock,
  Check, AlertCircle, Search, X, CalendarDays, UserPlus,
} from 'lucide-react';
import type { ApplicantType, RelativeInfo, DoctorReferralInfo, SavedPatient } from '../../../types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ArizachiSelectorProps {
  value: ApplicantType;
  relativeInfo?: RelativeInfo;
  doctorReferral?: DoctorReferralInfo;
  savedRelatives: RelativeInfo[];
  savedPatients: SavedPatient[];
  currentUserRole?: string;
  onChangeType: (type: ApplicantType) => void;
  onChangeRelative: (r: RelativeInfo) => void;
  onChangeDoctorReferral: (d: DoctorReferralInfo) => void;
  onSaveRelative?: (r: RelativeInfo) => void;
  onSavePatient?: (p: SavedPatient) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const APPLICANT_TYPES = [
  { key: 'self' as ApplicantType, label: "O'zim", icon: User, color: 'blue', locked: false },
  { key: 'relative' as ApplicantType, label: 'Qarindoshim', icon: Users, color: 'violet', locked: false },
  { key: 'doctor' as ApplicantType, label: 'Shifokor', icon: Stethoscope, color: 'teal', locked: false },
  { key: 'organization' as ApplicantType, label: 'Tashkilot', icon: Building2, color: 'gray', locked: true },
];

const SPECIALTIES = [
  'Radiolog', 'Onkolog', 'Kardiolog', 'Nevrolog', 'Ortoped',
  'Jarroh', 'Terapevt', 'Endokrinolog', 'Gastroenterolog', 'Boshqa',
];

const colorMap: Record<string, { bg: string; border: string; iconBg: string; iconText: string; ring: string; accent: string; accentLight: string }> = {
  blue:   { bg: 'bg-blue-600',   border: 'border-blue-600',   iconBg: 'bg-blue-100',   iconText: 'text-blue-600',   ring: 'focus:ring-blue-100',   accent: 'bg-blue-600 border-blue-600',   accentLight: 'bg-blue-50 border-blue-200 text-blue-700' },
  violet: { bg: 'bg-violet-600', border: 'border-violet-600', iconBg: 'bg-violet-100', iconText: 'text-violet-600', ring: 'focus:ring-violet-100', accent: 'bg-violet-600 border-violet-600', accentLight: 'bg-violet-50 border-violet-200 text-violet-700' },
  teal:   { bg: 'bg-teal-600',   border: 'border-teal-600',   iconBg: 'bg-teal-100',   iconText: 'text-teal-600',   ring: 'focus:ring-teal-100',   accent: 'bg-teal-600 border-teal-600',   accentLight: 'bg-teal-50 border-teal-100 text-teal-700' },
  gray:   { bg: 'bg-gray-100',   border: 'border-gray-200',   iconBg: 'bg-gray-200',   iconText: 'text-gray-400',   ring: 'focus:ring-gray-100',   accent: 'bg-gray-300 border-gray-300',   accentLight: 'bg-gray-50 border-gray-200 text-gray-400' },
};

// ─── Year Picker ─────────────────────────────────────────────────────────────

function YearPicker({ value, onChange, onClose }: { value: string; onChange: (y: string) => void; onClose: () => void }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && listRef.current) {
      const idx = years.indexOf(parseInt(value));
      if (idx >= 0) {
        listRef.current.scrollTop = idx * 44 - 88;
      }
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">Yilni tanlang</p>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
      <div ref={listRef} className="h-52 overflow-y-auto py-1">
        {years.map(y => (
          <button
            key={y}
            onClick={() => { onChange(String(y)); onClose(); }}
            className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
              String(y) === value
                ? 'bg-violet-600 text-white font-semibold'
                : 'text-gray-700 hover:bg-violet-50'
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Person Form (shared for relative & patient) ──────────────────────────────

interface PersonFormProps {
  form: Record<string, string | boolean>;
  errors: Record<string, string>;
  accentColor: 'violet' | 'teal';
  onChange: (field: string, val: string | boolean) => void;
  showDiagnosis?: boolean;
}

function PersonForm({ form, errors, accentColor, onChange, showDiagnosis = false }: PersonFormProps) {
  const [showYearPicker, setShowYearPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const c = accentColor === 'violet'
    ? { ring: 'focus:ring-violet-100 focus:border-violet-400', genderActive: 'bg-violet-600 border-violet-600 text-white', checkActive: 'bg-violet-600 border-violet-600' }
    : { ring: 'focus:ring-teal-100 focus:border-teal-400', genderActive: 'bg-teal-600 border-teal-600 text-white', checkActive: 'bg-teal-600 border-teal-600' };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowYearPicker(false);
    };
    if (showYearPicker) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showYearPicker]);

  return (
    <div className="space-y-3">
      {/* Familiya / Ismi */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block font-medium">Familiyasi *</label>
          <input
            value={(form.lastName as string) || ''}
            onChange={e => onChange('lastName', e.target.value)}
            placeholder="Karimov"
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50 transition-colors ${errors.lastName ? 'border-red-300 bg-red-50' : `border-gray-200 ${c.ring}`}`}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block font-medium">Ismi *</label>
          <input
            value={(form.firstName as string) || ''}
            onChange={e => onChange('firstName', e.target.value)}
            placeholder="Sardor"
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50 transition-colors ${errors.firstName ? 'border-red-300 bg-red-50' : `border-gray-200 ${c.ring}`}`}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
      </div>

      {/* Otasining ismi */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block font-medium">Otasining ismi</label>
        <input
          value={(form.middleName as string) || ''}
          onChange={e => onChange('middleName', e.target.value)}
          placeholder="Aliyevich"
          className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50 ${c.ring}`}
        />
      </div>

      {/* Tug'ilgan yili + Jinsi */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block font-medium">Tug'ilgan yili *</label>
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setShowYearPicker(p => !p)}
              className={`w-full flex items-center justify-between border rounded-xl px-3 py-2.5 text-sm bg-gray-50 transition-colors ${errors.birthYear ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-violet-300'}`}
            >
              <span className={(form.birthYear as string) ? 'text-gray-800' : 'text-gray-400'}>
                {(form.birthYear as string) || '1990'}
              </span>
              <CalendarDays className={`w-4 h-4 ${accentColor === 'violet' ? 'text-violet-400' : 'text-teal-400'}`} />
            </button>
            <AnimatePresence>
              {showYearPicker && (
                <YearPicker
                  value={(form.birthYear as string) || ''}
                  onChange={v => { onChange('birthYear', v); }}
                  onClose={() => setShowYearPicker(false)}
                />
              )}
            </AnimatePresence>
          </div>
          {errors.birthYear && <p className="text-red-500 text-xs mt-1">{errors.birthYear}</p>}
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block font-medium">Jinsi *</label>
          <div className="flex gap-1.5 h-[42px] items-center">
            {[{ val: 'male', label: 'Erkak' }, { val: 'female', label: 'Ayol' }].map(g => (
              <button
                key={g.val}
                onClick={() => onChange('gender', g.val)}
                className={`flex-1 h-full rounded-xl border text-xs font-medium transition-all ${
                  form.gender === g.val ? c.genderActive : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>
      </div>

      {/* Telefon */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block font-medium">Telefon raqami</label>
        <input
          value={(form.phone as string) || ''}
          onChange={e => onChange('phone', e.target.value)}
          placeholder="+998 90 123 45 67"
          inputMode="tel"
          className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50 ${c.ring}`}
        />
      </div>

      {/* Diagnosis (for patients) */}
      {showDiagnosis && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block font-medium">Asosiy tashxis (ixtiyoriy)</label>
          <input
            value={(form.diagnosis as string) || ''}
            onChange={e => onChange('diagnosis', e.target.value)}
            placeholder="Masalan: Gipertoniya, 2-darajali"
            className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50 ${c.ring}`}
          />
        </div>
      )}

      {/* Save checkbox */}
      <button
        onClick={() => onChange('saveForFuture', !(form.saveForFuture as boolean))}
        className="flex items-center gap-2.5 py-1"
      >
        <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all flex-shrink-0 ${form.saveForFuture ? c.checkActive + ' border-transparent' : 'border-gray-300 bg-white'}`}>
          {form.saveForFuture && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
        </div>
        <span className="text-xs text-gray-600 select-none">Keyingi safar uchun saqlash</span>
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ArizachiSelector({
  value,
  relativeInfo,
  doctorReferral,
  savedRelatives,
  savedPatients,
  currentUserRole,
  onChangeType,
  onChangeRelative,
  onChangeDoctorReferral,
  onSaveRelative,
  onSavePatient,
}: ArizachiSelectorProps) {
  // Relative state
  const [showSavedRelatives, setShowSavedRelatives] = useState(false);
  const [relForm, setRelForm] = useState<Record<string, string | boolean>>(relativeInfo as any || {});
  const [relErrors, setRelErrors] = useState<Record<string, string>>({});
  const [relSaved, setRelSaved] = useState(false);

  // Doctor / Patient state
  const [patientSearch, setPatientSearch] = useState('');
  const [showSavedPatients, setShowSavedPatients] = useState(false);
  const [patForm, setPatForm] = useState<Record<string, string | boolean>>(doctorReferral?.patient as any || {});
  const [patErrors, setPatErrors] = useState<Record<string, string>>({});
  const [patSaved, setPatSaved] = useState(false);
  const [doctorForm, setDoctorForm] = useState<Partial<DoctorReferralInfo>>(doctorReferral || {});
  const [showNewPatient, setShowNewPatient] = useState(false);

  const filteredPatients = savedPatients.filter(p => {
    const q = patientSearch.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      (p.middleName || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q)
    );
  });

  const handleTypeClick = (key: ApplicantType, locked: boolean) => {
    if (locked) return;
    onChangeType(key);
    setShowSavedRelatives(false);
    setShowSavedPatients(false);
  };

  // ── Relative handlers ──
  const handleRelField = (field: string, val: string | boolean) => {
    const updated = { ...relForm, [field]: val };
    setRelForm(updated);
    setRelErrors(p => ({ ...p, [field]: '' }));
    setRelSaved(false);
    if (updated.lastName && updated.firstName && updated.birthYear && updated.gender) {
      onChangeRelative(updated as any as RelativeInfo);
    }
  };

  const handleSelectSavedRelative = (r: RelativeInfo) => {
    setRelForm(r as any);
    onChangeRelative(r);
    setShowSavedRelatives(false);
    setRelSaved(true);
  };

  const handleSaveRelative = () => {
    const errs: Record<string, string> = {};
    if (!relForm.lastName?.toString().trim()) errs.lastName = 'Familiyani kiriting';
    if (!relForm.firstName?.toString().trim()) errs.firstName = 'Ismni kiriting';
    if (!relForm.birthYear?.toString().trim()) errs.birthYear = "Tug'ilgan yilni kiriting";
    if (!relForm.gender) errs.gender = 'Jinsni tanlang';
    if (Object.keys(errs).length) { setRelErrors(errs); return; }
    onSaveRelative?.(relForm as any as RelativeInfo);
    setRelSaved(true);
  };

  // ── Patient handlers ──
  const handlePatField = (field: string, val: string | boolean) => {
    const updated = { ...patForm, [field]: val };
    setPatForm(updated);
    setPatErrors(p => ({ ...p, [field]: '' }));
    setPatSaved(false);
    if (updated.lastName && updated.firstName && updated.birthYear && updated.gender) {
      onChangeDoctorReferral({ ...doctorForm, patient: updated as any as SavedPatient } as DoctorReferralInfo);
    }
  };

  const handleSelectSavedPatient = (p: SavedPatient) => {
    setPatForm(p as any);
    setPatientSearch(`${p.lastName} ${p.firstName}`);
    setShowSavedPatients(false);
    setShowNewPatient(false);
    setPatSaved(true);
    onChangeDoctorReferral({ ...doctorForm, patient: p } as DoctorReferralInfo);
  };

  const handleSavePatient = () => {
    const errs: Record<string, string> = {};
    if (!patForm.lastName?.toString().trim()) errs.lastName = 'Familiyani kiriting';
    if (!patForm.firstName?.toString().trim()) errs.firstName = 'Ismni kiriting';
    if (!patForm.birthYear?.toString().trim()) errs.birthYear = "Tug'ilgan yilni kiriting";
    if (!patForm.gender) errs.gender = 'Jinsni tanlang';
    if (Object.keys(errs).length) { setPatErrors(errs); return; }
    onSavePatient?.(patForm as any as SavedPatient);
    setPatSaved(true);
  };

  const handleDoctorField = (field: keyof DoctorReferralInfo, val: string) => {
    const updated = { ...doctorForm, [field]: val };
    setDoctorForm(updated);
    if (updated.toSpecialty) onChangeDoctorReferral({ ...updated, patient: doctorReferral?.patient } as DoctorReferralInfo);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <p className="text-gray-700 text-sm font-semibold">Ariza kim uchun?</p>

      {/* 4 icon qator */}
      <div className="grid grid-cols-4 gap-2">
        {APPLICANT_TYPES.map(({ key, label, icon: Icon, color, locked }) => {
          const active = value === key;
          const c = colorMap[color];
          return (
            <button
              key={key}
              onClick={() => handleTypeClick(key, locked)}
              disabled={locked}
              className={`relative flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border transition-all duration-200
                ${active ? `${c.bg} ${c.border}` : locked ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed' : 'bg-gray-50 border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'}
              `}
            >
              {locked && <Lock className="absolute top-1.5 right-1.5 w-2.5 h-2.5 text-gray-400" />}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-white/20' : c.iconBg}`}>
                <Icon className={`w-4 h-4 ${active ? 'text-white' : c.iconText}`} />
              </div>
              <span className={`text-xs font-medium leading-tight text-center ${active ? 'text-white' : locked ? 'text-gray-400' : 'text-gray-600'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tashkilot */}
      {value === 'organization' && (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-400">Faqat tizim administratori orqali ochiladi</p>
        </div>
      )}

      {/* ──── QARINDOSHIM ──── */}
      <AnimatePresence>
        {value === 'relative' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-1 space-y-3">

              {/* Saqlanganlar */}
              {savedRelatives.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSavedRelatives(p => !p)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-violet-200 bg-violet-50 text-sm text-violet-700 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Saqlanganlardan tanlash</span>
                      <span className="bg-violet-200 text-violet-700 text-xs rounded-full px-1.5 py-0.5 font-semibold">{savedRelatives.length}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSavedRelatives ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showSavedRelatives && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                      >
                        {savedRelatives.map((r, i) => (
                          <button
                            key={r.id || i}
                            onClick={() => handleSelectSavedRelative(r)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-violet-50 text-left border-b border-gray-100 last:border-0 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-violet-600">
                                  {r.firstName?.[0]}{r.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{r.lastName} {r.firstName}</p>
                                <p className="text-xs text-gray-400">{r.birthYear} · {r.gender === 'male' ? 'Erkak' : 'Ayol'}{r.phone ? ` · ${r.phone}` : ''}</p>
                              </div>
                            </div>
                            {relativeInfo?.id === r.id && <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Divider */}
              {savedRelatives.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 px-1">yoki yangi qo'shing</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}

              <PersonForm
                form={relForm}
                errors={relErrors}
                accentColor="violet"
                onChange={handleRelField}
              />

              {/* Save button */}
              {relForm.saveForFuture && !relSaved && onSaveRelative && (
                <motion.button
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSaveRelative}
                  className="w-full py-2.5 rounded-xl border border-violet-300 text-violet-700 text-sm font-semibold bg-violet-50 hover:bg-violet-100 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Ro'yxatga saqlash
                </motion.button>
              )}
              {relSaved && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs font-medium">Saqlandi! Keyingi safar saqlanganlardan topasiz.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── SHIFOKOR ──── */}
      <AnimatePresence>
        {value === 'doctor' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-1 space-y-3">
              {/* Info banner */}
              <div className="flex items-start gap-2 bg-teal-50 border border-teal-100 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-teal-700 leading-relaxed">
                  Bemorni tanlang — ariza shu bemor nomidan yaratiladi
                </p>
              </div>

              {/* Bemor qidiruv */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">Bemor</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={patientSearch}
                    onChange={e => {
                      setPatientSearch(e.target.value);
                      setShowSavedPatients(true);
                      if (!e.target.value) setShowSavedPatients(false);
                    }}
                    onFocus={() => savedPatients.length > 0 && setShowSavedPatients(true)}
                    placeholder="Ism yoki telefon orqali qidiring..."
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 bg-gray-50"
                  />
                  {patientSearch && (
                    <button onClick={() => { setPatientSearch(''); setShowSavedPatients(false); setPatForm({}); setPatSaved(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Qidiruv natijalari */}
                <AnimatePresence>
                  {showSavedPatients && savedPatients.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto"
                    >
                      {filteredPatients.length === 0 ? (
                        <div className="px-4 py-4 text-center">
                          <p className="text-sm text-gray-400">Bemor topilmadi</p>
                          <button
                            onClick={() => { setShowSavedPatients(false); setShowNewPatient(true); }}
                            className="mt-2 text-xs text-teal-600 font-semibold hover:underline"
                          >
                            + Yangi bemor qo'shish
                          </button>
                        </div>
                      ) : (
                        filteredPatients.map((p, i) => (
                          <button
                            key={p.id || i}
                            onClick={() => handleSelectSavedPatient(p)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 text-left border-b border-gray-100 last:border-0 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-teal-600">
                                {p.firstName?.[0]}{p.lastName?.[0]}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{p.lastName} {p.firstName} {p.middleName || ''}</p>
                              <p className="text-xs text-gray-400">{p.birthYear} · {p.gender === 'male' ? 'Erkak' : 'Ayol'}{p.phone ? ` · ${p.phone}` : ''}</p>
                              {p.diagnosis && <p className="text-xs text-teal-600 truncate">{p.diagnosis}</p>}
                            </div>
                            {doctorReferral?.patient?.id === p.id && <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />}
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Yangi bemor tugmasi */}
              {!showNewPatient && savedPatients.length === 0 && (
                <button
                  onClick={() => setShowNewPatient(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-teal-300 text-teal-600 text-sm font-medium hover:bg-teal-50 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Yangi bemor ma'lumotlarini kiriting
                </button>
              )}

              {/* Yangi bemor formasi */}
              <AnimatePresence>
                {showNewPatient && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-600">Bemor ma'lumotlari</p>
                        <button onClick={() => setShowNewPatient(false)} className="text-xs text-gray-400 hover:text-gray-600">Yopish</button>
                      </div>
                      <PersonForm
                        form={patForm}
                        errors={patErrors}
                        accentColor="teal"
                        onChange={handlePatField}
                        showDiagnosis
                      />
                      {patForm.saveForFuture && !patSaved && onSavePatient && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={handleSavePatient}
                          className="w-full py-2.5 rounded-xl border border-teal-300 text-teal-700 text-sm font-semibold bg-teal-50 hover:bg-teal-100 transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Bemorni saqlash
                        </motion.button>
                      )}
                      {patSaved && (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                          <Check className="w-4 h-4 flex-shrink-0" />
                          <p className="text-xs font-medium">Bemor saqlandi! Keyingi safar qidiruvdan topasiz.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tanlangan bemor ko'rsatish */}
              {patSaved && !showNewPatient && patForm.firstName && (
                <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-teal-700">
                      {(patForm.firstName as string)?.[0]}{(patForm.lastName as string)?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-teal-800">{patForm.lastName as string} {patForm.firstName as string}</p>
                    <p className="text-xs text-teal-600">{patForm.birthYear as string} · {patForm.gender === 'male' ? 'Erkak' : 'Ayol'}</p>
                  </div>
                  <Check className="w-4 h-4 text-teal-600 ml-auto flex-shrink-0" />
                </div>
              )}

              {/* Yo'naltirish mutaxassis */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block font-medium">Qaysi mutaxasisga yo'naltirish? *</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleDoctorField('toSpecialty', s)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                        doctorForm.toSpecialty === s
                          ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-teal-200 hover:bg-teal-50/50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sabab */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Yo'naltirish sababi</label>
                <textarea
                  value={doctorForm.reason || ''}
                  onChange={e => handleDoctorField('reason', e.target.value)}
                  placeholder="Masalan: MRT natijasini radiolog ko'rib chiqishi kerak..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 resize-none bg-gray-50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
