import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit3, Trash2, X, Check, Pill, User, AlertCircle } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import type { DrugRecommendation } from '../../../types';

interface DiseasesDrugMap {
  id: string;
  diseaseId: string;
  diseaseName: string;
  icd10: string;
  drugs: DrugRecommendation[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

const MOCK: DiseasesDrugMap[] = [
  {
    id: 'dm1', diseaseId: 'kb_migraine', diseaseName: 'Migren', icd10: 'G43.9',
    drugs: [
      { id: 'dr1', drugName: 'Ibuprofen', dosage: '400mg', frequency: "Og'riq paytida, kuniga 3 martadan ko'p emas", duration: 'Kerakligiga qarab', contraindications: ['Oshqozon yarasi', 'Buyrak yetishmovchiligi'], sideEffects: ["Oshqozon og'rig'i"], source: 'WHO protokoli', isFirstLine: true },
      { id: 'dr2', drugName: 'Sumatriptan', dosage: '50mg', frequency: 'Xuruj boshida 1 ta', duration: 'Kerakligiga qarab', contraindications: ['Yurak kasalliklari'], sideEffects: ["Bosim ko'tarilishi"], source: 'EHF Guidelines 2023', isFirstLine: false },
    ],
    createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.', createdAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'dm2', diseaseId: 'kb_gastritis', diseaseName: 'Gastrit', icd10: 'K29.7',
    drugs: [
      { id: 'dr3', drugName: 'Omeprazol', dosage: '20mg', frequency: 'Kuniga 1 marta, och qoringa', duration: '2-4 hafta', contraindications: ['Jigar yetishmovchiligi'], sideEffects: ["Bosh og'rig'i", 'Ich ketishi'], source: 'ACG Guidelines 2023', isFirstLine: true },
      { id: 'dr4', drugName: 'De-nol (Vismut subtsitrat)', dosage: '120mg', frequency: 'Kuniga 4 marta', duration: '4-8 hafta', contraindications: ['Homiladorlik'], sideEffects: ['Til qorayishi', 'Ich qotishi'], source: "O'zR SSV protokoli", isFirstLine: false },
    ],
    createdBy: 'user_expert_2', createdByName: 'Dr. Aliyev B.', createdAt: '2026-04-11T08:00:00Z',
  },
  {
    id: 'dm3', diseaseId: 'kb_hypertension', diseaseName: 'Gipertoniya', icd10: 'I10',
    drugs: [
      { id: 'dr5', drugName: 'Amlodipin', dosage: '5-10mg', frequency: 'Kuniga 1 marta', duration: 'Doimiy', contraindications: ['Og\'ir gipotoniya', 'Aorta stenozi'], sideEffects: ['Oyoq shishi', 'Yuz qizarishi'], source: 'ESC/ESH 2023', isFirstLine: true },
      { id: 'dr6', drugName: 'Lizinopril', dosage: '10-20mg', frequency: 'Kuniga 1 marta', duration: 'Doimiy', contraindications: ['Homiladorlik', 'Ikki tomonlama buyrak arteri stenozi'], sideEffects: ['Quruq yo\'tal', 'Bosh aylanishi'], source: 'ESC/ESH 2023', isFirstLine: true },
    ],
    createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.', createdAt: '2026-04-12T09:00:00Z',
  },
];

export function WebRefKBDrugsScreen() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<DiseasesDrugMap[]>(MOCK);
  const [editing, setEditing] = useState<DiseasesDrugMap | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => data.filter(d =>
    d.diseaseName.toLowerCase().includes(search.toLowerCase()) ||
    d.icd10.toLowerCase().includes(search.toLowerCase()) ||
    d.drugs.some(dr => dr.drugName.toLowerCase().includes(search.toLowerCase()))
  ), [data, search]);

  const totalDrugs = data.reduce((sum, d) => sum + d.drugs.length, 0);
  const firstLineDrugs = data.reduce((sum, d) => sum + d.drugs.filter(dr => dr.isFirstLine).length, 0);

  const openNew = () => {
    setEditing({
      id: `dm_${Date.now()}`, diseaseId: '', diseaseName: '', icd10: '', drugs: [],
      createdBy: 'current_user', createdByName: 'Joriy foydalanuvchi', createdAt: new Date().toISOString(),
    });
    setShowModal(true);
  };

  const openEdit = (d: DiseasesDrugMap) => {
    setEditing({ ...d, drugs: d.drugs.map(dr => ({ ...dr })) });
    setShowModal(true);
  };

  const save = () => {
    if (!editing) return;
    setData(prev => {
      const exists = prev.find(d => d.id === editing.id);
      return exists ? prev.map(d => d.id === editing.id ? editing : d) : [editing, ...prev];
    });
    setShowModal(false);
  };

  const addDrug = () => {
    if (!editing) return;
    const newDrug: DrugRecommendation = {
      id: `dr_${Date.now()}`, drugName: '', dosage: '', frequency: '',
      duration: '', contraindications: [], sideEffects: [], source: '', isFirstLine: false,
    };
    setEditing({ ...editing, drugs: [...editing.drugs, newDrug] });
  };

  const updateDrug = (drugId: string, field: string, value: any) => {
    if (!editing) return;
    setEditing({
      ...editing,
      drugs: editing.drugs.map(d => d.id === drugId ? { ...d, [field]: value } : d),
    });
  };

  const removeDrug = (drugId: string) => {
    if (!editing) return;
    setEditing({ ...editing, drugs: editing.drugs.filter(d => d.id !== drugId) });
  };

  return (
    <WebPlatformLayout title="Dori tavsiylari" subtitle="Klinik bilim bazasi — kasallik bo'yicha dori mapping">
      <div className="p-6 space-y-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Kasallik, ICD-10 yoki dori nomi bo'yicha qidirish..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
            </div>
            <button onClick={openNew}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Yangi mapping
            </button>
          </div>
        </motion.div>

        {/* Statistika */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Kasalliklar', value: data.length, color: 'text-slate-300' },
            { label: 'Jami dorilar', value: totalDrugs, color: 'text-blue-400' },
            { label: 'Birinchi qator', value: firstLineDrugs, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Kartochkalar */}
        <div className="space-y-4">
          {filtered.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors cursor-pointer"
              onClick={() => openEdit(entry)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-mono text-sm">{entry.icd10}</span>
                    <h3 className="text-white font-semibold">{entry.diseaseName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400">
                      {entry.drugs.length} dori
                    </span>
                  </div>
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(entry)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => setData(prev => prev.filter(x => x.id !== entry.id))} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="space-y-2">
                {entry.drugs.map(drug => (
                  <div key={drug.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-2.5">
                    <Pill className={`w-4 h-4 flex-shrink-0 ${drug.isFirstLine ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{drug.drugName}</span>
                        <span className="text-slate-500 text-xs">{drug.dosage}</span>
                        {drug.isFirstLine && <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">1-qator</span>}
                      </div>
                      <p className="text-slate-500 text-xs">{drug.frequency} · {drug.duration}</p>
                    </div>
                    <span className="text-xs text-slate-600">{drug.source}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-800">
                <User className="w-3 h-3" /> {entry.createdByName} · {new Date(entry.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              <Pill className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              Dori tavsiylari topilmadi
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/60 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-[10%] inset-y-[5%] bg-slate-900 border border-slate-700 rounded-2xl z-50 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h2 className="text-white text-lg font-semibold">{editing.diseaseName || 'Yangi dori mapping'}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Kasallik nomi *</label>
                    <input value={editing.diseaseName} onChange={e => setEditing({ ...editing, diseaseName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">ICD-10</label>
                    <input value={editing.icd10} onChange={e => setEditing({ ...editing, icd10: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 font-mono" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300 font-medium">Dorilar ro'yxati</label>
                  <button onClick={addDrug}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs">
                    <Plus className="w-3 h-3" /> Dori qo'shish
                  </button>
                </div>

                {editing.drugs.map((drug, idx) => (
                  <div key={drug.id} className="bg-slate-800 rounded-xl p-4 space-y-3 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Pill className="w-3 h-3" /> #{idx + 1}
                        {drug.isFirstLine && <span className="text-emerald-400">(birinchi qator)</span>}
                      </span>
                      <button onClick={() => removeDrug(drug.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={drug.drugName} placeholder="Dori nomi *"
                        onChange={e => updateDrug(drug.id, 'drugName', e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                      <input value={drug.dosage} placeholder="Dozasi"
                        onChange={e => updateDrug(drug.id, 'dosage', e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                      <input value={drug.frequency} placeholder="Qabul tartibi"
                        onChange={e => updateDrug(drug.id, 'frequency', e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                      <input value={drug.duration} placeholder="Davomiylik"
                        onChange={e => updateDrug(drug.id, 'duration', e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                      <input value={drug.contraindications.join(', ')} placeholder="Kontraindikatsiyalar (vergul bilan)"
                        onChange={e => updateDrug(drug.id, 'contraindications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                      <input value={drug.source} placeholder="Manba (protokol)"
                        onChange={e => updateDrug(drug.id, 'source', e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={drug.isFirstLine}
                        onChange={e => updateDrug(drug.id, 'isFirstLine', e.target.checked)}
                        className="rounded border-slate-600" />
                      <span className="text-xs text-slate-400">Birinchi qator dori</span>
                    </label>
                  </div>
                ))}

                {editing.drugs.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    <Pill className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Dori tavsiylari hali qo'shilmagan
                  </div>
                )}
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
