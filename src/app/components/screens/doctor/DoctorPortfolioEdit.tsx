import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../store/navigationContext';
import { doctorService } from '../../../../services/api/doctorService';
import { portfolioService } from '../../../../services/api/portfolioService';
import type { DoctorProfile, Education, WorkExperience, Achievement, Certificate } from '../../../types';
import {
  ChevronLeft, GraduationCap, Briefcase, Award, FileCheck,
  Plus, Trash2, X, Loader2, Save, Edit3,
} from 'lucide-react';

type Section = 'education' | 'experience' | 'achievements' | 'certificates';
type ModalType = { section: Section; mode: 'add' | 'edit'; item?: any } | null;

const DEGREES = [
  { value: 'BACHELOR', label: 'Bakalavr' },
  { value: 'MASTER', label: 'Magistr' },
  { value: 'PHD', label: 'PhD' },
  { value: 'DSC', label: 'DSc' },
  { value: 'RESIDENCY', label: 'Rezidentura' },
  { value: 'ORDINATURA', label: 'Ordinatura' },
];

const ACHIEVEMENT_GROUPS = [
  { value: 'SCIENTIFIC', label: 'Ilmiy' },
  { value: 'PRACTICAL', label: 'Amaliy' },
  { value: 'ORGANIZATIONAL', label: 'Tashkiliy' },
  { value: 'INTERNATIONAL', label: 'Xalqaro' },
  { value: 'STATE', label: 'Davlat' },
];

export function DoctorPortfolioEdit() {
  const { goBack } = useNavigation();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [section, setSection] = useState<Section>('education');

  const loadProfile = () => {
    doctorService.getMyProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProfile(); }, []);

  const education = profile?.education ?? [];
  const experience = profile?.workExperience ?? [];
  const achievements = profile?.achievements ?? [];
  const certificates = profile?.certificates ?? [];

  const handleDelete = async (sec: Section, id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      if (sec === 'education') await portfolioService.deleteEducation(id);
      else if (sec === 'experience') await portfolioService.deleteExperience(id);
      else if (sec === 'achievements') await portfolioService.deleteAchievement(id);
      else if (sec === 'certificates') await portfolioService.deleteCertificate(id);
      loadProfile();
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  const sections: { key: Section; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'education', label: "Ta'lim", icon: <GraduationCap size={16} />, count: education.length },
    { key: 'experience', label: 'Tajriba', icon: <Briefcase size={16} />, count: experience.length },
    { key: 'achievements', label: 'Yutuqlar', icon: <Award size={16} />, count: achievements.length },
    { key: 'certificates', label: 'Sertifikatlar', icon: <FileCheck size={16} />, count: certificates.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 flex-1">Portfolio tahrirlash</h1>
      </div>

      {/* Section Tabs */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                section === s.key ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              {s.icon}
              {s.label}
              <span className={`text-[10px] px-1.5 rounded-full ${
                section === s.key ? 'bg-white/20' : 'bg-gray-100'
              }`}>{s.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* Add Button */}
        <button
          onClick={() => setModal({ section, mode: 'add' })}
          className="w-full bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-blue-600 text-sm font-medium hover:border-blue-300 transition-colors"
        >
          <Plus size={18} />
          Qo'shish
        </button>

        {/* Education List */}
        {section === 'education' && education.map(item => (
          <ItemCard
            key={item.id}
            title={item.institutionName}
            subtitle={item.faculty ?? ''}
            badge={DEGREES.find(d => d.value === item.degree)?.label ?? item.degree}
            period={`${item.startYear} — ${item.endYear ?? 'Hozir'}`}
            onEdit={() => setModal({ section: 'education', mode: 'edit', item })}
            onDelete={() => handleDelete('education', item.id)}
          />
        ))}

        {/* Experience List */}
        {section === 'experience' && experience.map(item => (
          <ItemCard
            key={item.id}
            title={item.organizationName}
            subtitle={item.position}
            badge={item.department}
            period={`${item.startYear} — ${item.endYear ?? 'Hozir'}`}
            onEdit={() => setModal({ section: 'experience', mode: 'edit', item })}
            onDelete={() => handleDelete('experience', item.id)}
          />
        ))}

        {/* Achievements List */}
        {section === 'achievements' && achievements.map(item => (
          <ItemCard
            key={item.id}
            title={item.name}
            subtitle={ACHIEVEMENT_GROUPS.find(g => g.value === item.group)?.label ?? item.group}
            period={String(item.year)}
            onEdit={() => setModal({ section: 'achievements', mode: 'edit', item })}
            onDelete={() => handleDelete('achievements', item.id)}
          />
        ))}

        {/* Certificates List */}
        {section === 'certificates' && certificates.map(item => (
          <ItemCard
            key={item.id}
            title={item.name}
            subtitle={item.organization}
            badge={item.direction}
            period={String(item.year)}
            onEdit={() => setModal({ section: 'certificates', mode: 'edit', item })}
            onDelete={() => handleDelete('certificates', item.id)}
          />
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <FormModal
          modal={modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); loadProfile(); }}
        />
      )}
    </div>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function ItemCard({ title, subtitle, badge, period, onEdit, onDelete }: {
  title: string; subtitle?: string; badge?: string; period: string;
  onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
          <div className="flex items-center gap-2 mt-1">
            {badge && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{badge}</span>
            )}
            <span className="text-xs text-gray-400">{period}</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-gray-100">
            <Edit3 size={14} className="text-gray-400" />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-50">
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function FormModal({ modal, onClose, onSaved }: {
  modal: NonNullable<ModalType>; onClose: () => void; onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, any>>(modal.item ?? {});

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal.section === 'education') {
        if (modal.mode === 'add') await portfolioService.addEducation(form as any);
        else await portfolioService.updateEducation(form.id, form);
      } else if (modal.section === 'experience') {
        if (modal.mode === 'add') await portfolioService.addExperience(form as any);
        else await portfolioService.updateExperience(form.id, form);
      } else if (modal.section === 'achievements') {
        if (modal.mode === 'add') await portfolioService.addAchievement(form as any);
        else await portfolioService.updateAchievement(form.id, form);
      } else if (modal.section === 'certificates') {
        if (modal.mode === 'add') await portfolioService.addCertificate(form as any);
        else await portfolioService.updateCertificate(form.id, form);
      }
      onSaved();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const TITLES: Record<Section, string> = {
    education: "Ta'lim",
    experience: 'Ish tajribasi',
    achievements: 'Yutuq',
    certificates: 'Sertifikat',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-gray-900">
            {modal.mode === 'add' ? "Qo'shish" : 'Tahrirlash'}: {TITLES[modal.section]}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {modal.section === 'education' && (
            <>
              <Field label="Muassasa nomi" value={form.institutionName ?? ''} onChange={v => set('institutionName', v)} required />
              <Field label="Fakultet/Yo'nalish" value={form.faculty ?? ''} onChange={v => set('faculty', v)} />
              <SelectField label="Daraja" value={form.degree ?? ''} onChange={v => set('degree', v)} options={DEGREES} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Boshlanish yili" value={form.startYear ?? ''} onChange={v => set('startYear', +v)} type="number" required />
                <Field label="Tugash yili" value={form.endYear ?? ''} onChange={v => set('endYear', v ? +v : undefined)} type="number" />
              </div>
              <Field label="Diplom raqami" value={form.diplomaNumber ?? ''} onChange={v => set('diplomaNumber', v)} />
            </>
          )}

          {modal.section === 'experience' && (
            <>
              <Field label="Tashkilot nomi" value={form.organizationName ?? ''} onChange={v => set('organizationName', v)} required />
              <Field label="Lavozim" value={form.position ?? ''} onChange={v => set('position', v)} required />
              <Field label="Bo'lim" value={form.department ?? ''} onChange={v => set('department', v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Boshlanish yili" value={form.startYear ?? ''} onChange={v => set('startYear', +v)} type="number" required />
                <Field label="Tugash yili" value={form.endYear ?? ''} onChange={v => set('endYear', v ? +v : undefined)} type="number" />
              </div>
              <Field label="Tavsif" value={form.description ?? ''} onChange={v => set('description', v)} multiline />
            </>
          )}

          {modal.section === 'achievements' && (
            <>
              <Field label="Yutuq nomi" value={form.name ?? ''} onChange={v => set('name', v)} required />
              <SelectField label="Guruh" value={form.group ?? ''} onChange={v => set('group', v)} options={ACHIEVEMENT_GROUPS} required />
              <Field label="Yil" value={form.year ?? ''} onChange={v => set('year', +v)} type="number" required />
              <Field label="Tavsif" value={form.description ?? ''} onChange={v => set('description', v)} multiline />
            </>
          )}

          {modal.section === 'certificates' && (
            <>
              <Field label="Sertifikat nomi" value={form.name ?? ''} onChange={v => set('name', v)} required />
              <Field label="Bergan tashkilot" value={form.organization ?? ''} onChange={v => set('organization', v)} required />
              <Field label="Yo'nalish" value={form.direction ?? ''} onChange={v => set('direction', v)} required />
              <Field label="Yil" value={form.year ?? ''} onChange={v => set('year', +v)} type="number" required />
              <Field label="Sertifikat raqami" value={form.certificateNum ?? ''} onChange={v => set('certificateNum', v)} />
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form Field Components ────────────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', required, multiline }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; required?: boolean; multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-1 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 mb-1 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tanlang...</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
