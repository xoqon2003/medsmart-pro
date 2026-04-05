import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Save, CheckCircle } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const ROLES = ['admin', 'doctor', 'radiolog', 'specialist', 'operator', 'kassir', 'patient'];
const ROLE_LABELS: Record<string, string> = { admin: 'Admin', doctor: 'Shifokor', radiolog: 'Radiolog', specialist: 'Mutaxassis', operator: 'Operator', kassir: 'Kassir', patient: 'Bemor' };
const ROLE_COLORS: Record<string, string> = { admin: 'text-rose-400', doctor: 'text-blue-400', radiolog: 'text-emerald-400', specialist: 'text-purple-400', operator: 'text-violet-400', kassir: 'text-amber-400', patient: 'text-indigo-400' };

const PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard ko\'rish', defaults: { admin: true, doctor: true, radiolog: true, specialist: true, operator: true, kassir: true, patient: false } },
  { key: 'apps_view', label: 'Arizalarni ko\'rish', defaults: { admin: true, doctor: true, radiolog: true, specialist: true, operator: true, kassir: false, patient: true } },
  { key: 'apps_create', label: 'Ariza yaratish', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: true, kassir: false, patient: true } },
  { key: 'apps_manage', label: 'Arizalar boshqarish', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: true, kassir: false, patient: false } },
  { key: 'conclusion_write', label: 'Xulosa yozish', defaults: { admin: true, doctor: false, radiolog: true, specialist: true, operator: false, kassir: false, patient: false } },
  { key: 'users_view', label: 'Foydalanuvchilar ko\'rish', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: true, kassir: false, patient: false } },
  { key: 'users_manage', label: 'Foydalanuvchilar boshqarish', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: false, kassir: false, patient: false } },
  { key: 'payments_view', label: 'To\'lovlar ko\'rish', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: true, kassir: true, patient: true } },
  { key: 'payments_manage', label: 'To\'lovlar boshqarish', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: false, kassir: true, patient: false } },
  { key: 'kassa', label: 'Kassa operatsiyalari', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: false, kassir: true, patient: false } },
  { key: 'reference', label: 'Spravochnik boshqarish', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: false, kassir: false, patient: false } },
  { key: 'settings', label: 'Tizim sozlamalari', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: false, kassir: false, patient: false } },
  { key: 'audit', label: 'Audit log ko\'rish', defaults: { admin: true, doctor: false, radiolog: false, specialist: false, operator: false, kassir: false, patient: false } },
  { key: 'reports', label: 'Hisobotlar', defaults: { admin: true, doctor: true, radiolog: false, specialist: false, operator: true, kassir: true, patient: false } },
  { key: 'chat', label: 'Chat/Xabarlar', defaults: { admin: true, doctor: true, radiolog: true, specialist: true, operator: true, kassir: false, patient: true } },
  { key: 'files', label: 'Fayl yuklash', defaults: { admin: true, doctor: true, radiolog: true, specialist: true, operator: true, kassir: false, patient: true } },
];

export function WebAdminRolesScreen() {
  const [matrix, setMatrix] = useState(() =>
    PERMISSIONS.reduce((acc, p) => ({ ...acc, [p.key]: { ...p.defaults } }), {} as Record<string, Record<string, boolean>>)
  );
  const [saved, setSaved] = useState(false);

  const toggle = (perm: string, role: string) => {
    setMatrix(prev => ({ ...prev, [perm]: { ...prev[perm], [role]: !prev[perm][role] } }));
    setSaved(false);
  };

  return (
    <WebPlatformLayout title="Rollar va ruxsatlar" subtitle="Rol-ruxsat matritsasi">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">{ROLES.length} rol, {PERMISSIONS.length} ruxsat</p>
          <button onClick={() => setSaved(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            {saved ? <><CheckCircle className="w-4 h-4" /> Saqlandi</> : <><Save className="w-4 h-4" /> Saqlash</>}
          </button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-500 text-xs font-medium px-5 py-3 w-52">Ruxsat</th>
                  {ROLES.map(r => (
                    <th key={r} className="text-center px-3 py-3">
                      <span className={`text-xs font-semibold ${ROLE_COLORS[r]}`}>{ROLE_LABELS[r]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((p, i) => (
                  <motion.tr key={p.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3 text-slate-300 text-sm">{p.label}</td>
                    {ROLES.map(r => (
                      <td key={r} className="text-center px-3 py-3">
                        <button onClick={() => toggle(p.key, r)}
                          className={`w-8 h-5 rounded-full transition-colors ${matrix[p.key]?.[r] ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${matrix[p.key]?.[r] ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
