import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit3, Trash2, X, Check, AlertTriangle, User } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { BODY_ZONES } from '../../../data/clinicalKB';
import type { KBSymptom } from '../../../types';

const SYMPTOM_CATEGORIES = [
  'Barchasi', "Og'riq", 'Isitma', 'Nafas', 'Hazm', 'Nevrologik',
  'Siydik', 'Teri', 'Allergik', 'Umumiy', 'Boshqa',
];

const MOCK_SYMPTOMS: KBSymptom[] = [
  { id: 's1', nameUz: "Bosh og'rig'i", nameRu: 'Головная боль', nameLat: 'Cephalgia', category: "Og'riq", bodyZone: 'head', severity: 'moderate', relatedDiseases: ['kb_migraine', 'kb_hypertension'], isRedFlag: false, isActive: true, createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.', createdAt: '2026-04-10T10:00:00Z' },
  { id: 's2', nameUz: "Ko'ngil aynash", nameRu: 'Тошнота', nameLat: 'Nausea', category: 'Hazm', bodyZone: 'abdomen', relatedDiseases: ['kb_migraine', 'kb_gastritis'], isRedFlag: false, isActive: true, createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.', createdAt: '2026-04-10T10:00:00Z' },
  { id: 's3', nameUz: "Qorin og'rig'i", nameRu: 'Боль в животе', nameLat: 'Abdominal pain', category: "Og'riq", bodyZone: 'abdomen', severity: 'moderate', relatedDiseases: ['kb_gastritis'], isRedFlag: false, isActive: true, createdBy: 'user_expert_2', createdByName: 'Dr. Aliyev B.', createdAt: '2026-04-11T08:00:00Z' },
  { id: 's4', nameUz: "Ko'krak og'rig'i + chap qo'lga berilish", nameRu: 'Боль в груди с иррадиацией', nameLat: 'Chest pain with radiation', category: "Og'riq", bodyZone: 'chest', severity: 'critical', relatedDiseases: [], isRedFlag: true, isActive: true, createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.', createdAt: '2026-04-10T10:00:00Z' },
  { id: 's5', nameUz: "Yo'tal", nameRu: 'Кашель', nameLat: 'Cough', category: 'Nafas', bodyZone: 'chest', relatedDiseases: ['kb_bronchitis'], isRedFlag: false, isActive: true, createdBy: 'user_expert_2', createdByName: 'Dr. Aliyev B.', createdAt: '2026-04-11T08:00:00Z' },
  { id: 's6', nameUz: "Nutq buzilishi (birdan)", nameRu: 'Внезапное нарушение речи', nameLat: 'Acute dysphasia', category: 'Nevrologik', bodyZone: 'head', severity: 'critical', relatedDiseases: [], isRedFlag: true, isActive: true, createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.', createdAt: '2026-04-10T10:00:00Z' },
  { id: 's7', nameUz: 'Tashnalik', nameRu: 'Жажда', nameLat: 'Polydipsia', category: 'Umumiy', bodyZone: 'whole_body', relatedDiseases: ['kb_diabetes'], isRedFlag: false, isActive: true, createdBy: 'user_expert_2', createdByName: 'Dr. Aliyev B.', createdAt: '2026-04-11T08:00:00Z' },
  { id: 's8', nameUz: "Bel og'rig'i", nameRu: 'Боль в пояснице', nameLat: 'Low back pain', category: "Og'riq", bodyZone: 'back', severity: 'moderate', relatedDiseases: ['kb_osteochondrosis'], isRedFlag: false, isActive: true, createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.', createdAt: '2026-04-10T10:00:00Z' },
];

export function WebRefKBSymptomsScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Barchasi');
  const [symptoms, setSymptoms] = useState<KBSymptom[]>(MOCK_SYMPTOMS);
  const [showRedFlagOnly, setShowRedFlagOnly] = useState(false);
  const [editing, setEditing] = useState<KBSymptom | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => symptoms.filter(s =>
    (category === 'Barchasi' || s.category === category) &&
    (!showRedFlagOnly || s.isRedFlag) &&
    (s.nameUz.toLowerCase().includes(search.toLowerCase()) ||
     (s.nameRu || '').toLowerCase().includes(search.toLowerCase()) ||
     (s.nameLat || '').toLowerCase().includes(search.toLowerCase()))
  ), [symptoms, category, showRedFlagOnly, search]);

  const openNew = () => {
    setEditing({
      id: `s_${Date.now()}`, nameUz: '', category: '', bodyZone: '',
      relatedDiseases: [], isRedFlag: false, isActive: true,
      createdBy: 'current_user', createdByName: 'Joriy foydalanuvchi',
      createdAt: new Date().toISOString(),
    });
    setShowModal(true);
  };

  const openEdit = (s: KBSymptom) => { setEditing({ ...s }); setShowModal(true); };

  const save = () => {
    if (!editing) return;
    setSymptoms(prev => {
      const exists = prev.find(s => s.id === editing.id);
      return exists ? prev.map(s => s.id === editing.id ? editing : s) : [editing, ...prev];
    });
    setShowModal(false);
  };

  const updateField = <K extends keyof KBSymptom>(key: K, value: KBSymptom[K]) => {
    if (editing) setEditing({ ...editing, [key]: value });
  };

  return (
    <WebPlatformLayout title="Simptomlar lug'ati" subtitle="Klinik bilim bazasi — tibbiy simptomlar katalogi">
      <div className="p-6 space-y-5">
        {/* Filtrlar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Simptom qidirish (o'zbekcha, ruscha, lotincha)..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 min-w-[160px]">
              {SYMPTOM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setShowRedFlagOnly(!showRedFlagOnly)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                showRedFlagOnly ? 'bg-red-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
              }`}>
              <AlertTriangle className="w-4 h-4" />
              Red Flag
            </button>
            <button onClick={openNew}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Yangi simptom
            </button>
          </div>
        </motion.div>

        {/* Statistika */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Jami', value: symptoms.length, color: 'text-slate-300' },
            { label: 'Red Flag', value: symptoms.filter(s => s.isRedFlag).length, color: 'text-red-400' },
            { label: 'Faol', value: symptoms.filter(s => s.isActive).length, color: 'text-emerald-400' },
            { label: 'Kategoriyalar', value: new Set(symptoms.map(s => s.category)).size, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Jadval */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase">
                <th className="px-5 py-3">Simptom</th>
                <th className="px-5 py-3">Lotincha</th>
                <th className="px-5 py-3">Kategoriya</th>
                <th className="px-5 py-3">Tana zonasi</th>
                <th className="px-5 py-3">Red Flag</th>
                <th className="px-5 py-3">Kiritgan</th>
                <th className="px-5 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                  onClick={() => openEdit(s)}>
                  <td className="px-5 py-3">
                    <p className="text-white text-sm font-medium">{s.nameUz}</p>
                    {s.nameRu && <p className="text-slate-500 text-xs">{s.nameRu}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-sm italic">{s.nameLat || '—'}</td>
                  <td className="px-5 py-3 text-slate-400 text-sm">{s.category}</td>
                  <td className="px-5 py-3 text-slate-400 text-sm">
                    {BODY_ZONES.find(z => z.id === s.bodyZone)?.label || s.bodyZone}
                  </td>
                  <td className="px-5 py-3">
                    {s.isRedFlag ? (
                      <span className="flex items-center gap-1 text-red-400 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" /> Xavfli
                      </span>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-400 text-xs">{s.createdByName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => setSymptoms(prev => prev.filter(x => x.id !== s.id))} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-sm">Simptom topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/60 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-[15%] inset-y-[10%] bg-slate-900 border border-slate-700 rounded-2xl z-50 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h2 className="text-white text-lg font-semibold">{editing.nameUz || 'Yangi simptom'}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Nomi (o'zbekcha) *</label>
                    <input value={editing.nameUz} onChange={e => updateField('nameUz', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Nomi (ruscha)</label>
                    <input value={editing.nameRu || ''} onChange={e => updateField('nameRu', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Nomi (lotincha)</label>
                    <input value={editing.nameLat || ''} onChange={e => updateField('nameLat', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Kategoriya *</label>
                    <select value={editing.category} onChange={e => updateField('category', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
                      <option value="">Tanlang...</option>
                      {SYMPTOM_CATEGORIES.filter(c => c !== 'Barchasi').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Tana zonasi *</label>
                    <select value={editing.bodyZone} onChange={e => updateField('bodyZone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
                      <option value="">Tanlang...</option>
                      {BODY_ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Og'irlik darajasi</label>
                    <select value={editing.severity || ''} onChange={e => updateField('severity', (e.target.value || undefined) as any)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
                      <option value="">Tanlanmagan</option>
                      <option value="mild">Yengil</option>
                      <option value="moderate">O'rta</option>
                      <option value="severe">Og'ir</option>
                      <option value="critical">Kritik</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.isRedFlag}
                      onChange={e => updateField('isRedFlag', e.target.checked)}
                      className="rounded border-slate-600" />
                    <span className="text-sm text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Red Flag (hayotga xavfli)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.isActive}
                      onChange={e => updateField('isActive', e.target.checked)}
                      className="rounded border-slate-600" />
                    <span className="text-sm text-slate-400">Faol</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 gap-2">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white">Bekor qilish</button>
                <button onClick={save} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium">
                  <Check className="w-4 h-4" /> Saqlash
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </WebPlatformLayout>
  );
}
