import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit3, Trash2, X, Check, BookOpen, AlertTriangle, ExternalLink, User } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import type { DiagnosticProtocol, EvidenceLevel } from '../../../types';

interface ProtocolEntry {
  id: string;
  diseaseId: string;
  diseaseName: string;
  icd10: string;
  protocol: DiagnosticProtocol;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isActive: boolean;
}

const EVIDENCE_LABELS: Record<EvidenceLevel, { label: string; color: string }> = {
  A: { label: 'A — Yuqori', color: 'text-emerald-400 bg-emerald-500/10' },
  B: { label: 'B — O\'rta', color: 'text-blue-400 bg-blue-500/10' },
  C: { label: 'C — Past', color: 'text-yellow-400 bg-yellow-500/10' },
  D: { label: 'D — Juda past', color: 'text-red-400 bg-red-500/10' },
};

const MOCK: ProtocolEntry[] = [
  {
    id: 'p1', diseaseId: 'kb_migraine', diseaseName: 'Migren', icd10: 'G43.9',
    protocol: {
      diagnosticSteps: ['Nevrologik tekshiruv', "Qon bosimi o'lchash", "Bosh MRT (zarur bo'lsa)"],
      treatmentGuidelines: ["Ibuprofen 400mg og'riq paytida", "Qorong'u xonada dam olish", 'Trigger omillardan qochish'],
      redFlags: ["Birdan paydo bo'lgan kuchli bosh og'rig'i", 'Nutq buzilishi', "Ong yo'qotish"],
      source: 'WHO Headache Guidelines, 2022',
      sourceUrl: 'https://www.who.int/publications/headache-guidelines',
      evidenceLevel: 'A',
      lastReviewed: '2024-01-15',
    },
    createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.', createdAt: '2026-04-10T10:00:00Z', isActive: true,
  },
  {
    id: 'p2', diseaseId: 'kb_gastritis', diseaseName: 'Gastrit', icd10: 'K29.7',
    protocol: {
      diagnosticSteps: ['Fizik tekshiruv', 'FEGDS (gastroskopiya)', 'H.pylori testi'],
      treatmentGuidelines: ['Proton pompa inhibitorlari', 'Dietoterapiya', 'H.pylori eradikatsiyasi'],
      redFlags: ['Qon qusish', 'Qora najas', "Tez vazn yo'qotish"],
      source: "O'zR SSV Gastrit klinik protokoli, 2023",
      evidenceLevel: 'A',
    },
    createdBy: 'user_expert_2', createdByName: 'Dr. Aliyev B.', createdAt: '2026-04-11T08:00:00Z', isActive: true,
  },
  {
    id: 'p3', diseaseId: 'kb_hypertension', diseaseName: 'Gipertoniya', icd10: 'I10',
    protocol: {
      diagnosticSteps: ["24 soatlik qon bosimi monitoringi (SMAD)", 'EKG', 'Biokimyoviy qon tahlili', 'Buyrak UZI'],
      treatmentGuidelines: ['Hayot tarzi o\'zgarishi', 'Antihipertenziv terapiya', 'Muntazam monitoring'],
      redFlags: ["Qon bosimi 180/120 dan yuqori", "Ko'rish buzilishi", 'Kuchli bosh og\'rig\'i + qusish'],
      source: 'ESC/ESH Arterial Hypertension Guidelines, 2023',
      sourceUrl: 'https://www.escardio.org/Guidelines/hypertension',
      evidenceLevel: 'A',
      lastReviewed: '2023-08-25',
    },
    createdBy: 'user_expert_1', createdByName: 'Dr. Karimov A.', createdAt: '2026-04-12T09:00:00Z', isActive: true,
  },
];

export function WebRefKBProtocolsScreen() {
  const [search, setSearch] = useState('');
  const [protocols, setProtocols] = useState<ProtocolEntry[]>(MOCK);
  const [editing, setEditing] = useState<ProtocolEntry | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => protocols.filter(p =>
    p.diseaseName.toLowerCase().includes(search.toLowerCase()) ||
    p.icd10.toLowerCase().includes(search.toLowerCase()) ||
    p.protocol.source.toLowerCase().includes(search.toLowerCase())
  ), [protocols, search]);

  const openNew = () => {
    setEditing({
      id: `p_${Date.now()}`, diseaseId: '', diseaseName: '', icd10: '',
      protocol: { diagnosticSteps: [], treatmentGuidelines: [], redFlags: [], source: '' },
      createdBy: 'current_user', createdByName: 'Joriy foydalanuvchi',
      createdAt: new Date().toISOString(), isActive: true,
    });
    setShowModal(true);
  };

  const openEdit = (p: ProtocolEntry) => { setEditing({ ...p, protocol: { ...p.protocol } }); setShowModal(true); };

  const save = () => {
    if (!editing) return;
    setProtocols(prev => {
      const exists = prev.find(p => p.id === editing.id);
      return exists ? prev.map(p => p.id === editing.id ? editing : p) : [editing, ...prev];
    });
    setShowModal(false);
  };

  return (
    <WebPlatformLayout title="Diagnostik protokollar" subtitle="Klinik bilim bazasi — davolash standartlari va yo'riqnomalar">
      <div className="p-6 space-y-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Kasallik, ICD-10 yoki manba bo'yicha qidirish..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
            </div>
            <button onClick={openNew}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Yangi protokol
            </button>
          </div>
        </motion.div>

        {/* Kartochkalar */}
        <div className="space-y-4">
          {filtered.map((p, i) => {
            const evLabel = p.protocol.evidenceLevel ? EVIDENCE_LABELS[p.protocol.evidenceLevel] : null;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors cursor-pointer"
                onClick={() => openEdit(p)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400 font-mono text-sm">{p.icd10}</span>
                      <h3 className="text-white font-semibold">{p.diseaseName}</h3>
                      {evLabel && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${evLabel.color}`}>{evLabel.label}</span>}
                    </div>
                    <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {p.protocol.source}
                      {p.protocol.sourceUrl && <ExternalLink className="w-3 h-3 text-indigo-400" />}
                    </p>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => setProtocols(prev => prev.filter(x => x.id !== p.id))} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1.5 font-medium">Diagnostika ({p.protocol.diagnosticSteps.length})</p>
                    <ul className="space-y-1">
                      {p.protocol.diagnosticSteps.slice(0, 3).map((s, j) => (
                        <li key={j} className="text-xs text-slate-300 flex items-start gap-1">
                          <span className="text-indigo-400 mt-0.5">{j + 1}.</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1.5 font-medium">Davolash ({p.protocol.treatmentGuidelines.length})</p>
                    <ul className="space-y-1">
                      {p.protocol.treatmentGuidelines.slice(0, 3).map((s, j) => (
                        <li key={j} className="text-xs text-slate-300 flex items-start gap-1">
                          <span className="text-emerald-400 mt-0.5">{j + 1}.</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1.5 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" /> Red Flags ({p.protocol.redFlags.length})
                    </p>
                    <ul className="space-y-1">
                      {p.protocol.redFlags.slice(0, 3).map((s, j) => (
                        <li key={j} className="text-xs text-red-400 flex items-start gap-1">
                          <span className="mt-0.5">!</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User className="w-3 h-3" /> {p.createdByName} · {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                  {p.protocol.lastReviewed && (
                    <span className="text-xs text-slate-500">Ko'rib chiqilgan: {p.protocol.lastReviewed}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              Protokol topilmadi
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
                <h2 className="text-white text-lg font-semibold">{editing.diseaseName || 'Yangi protokol'}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
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
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Dalillar darajasi</label>
                    <select value={editing.protocol.evidenceLevel || ''}
                      onChange={e => setEditing({ ...editing, protocol: { ...editing.protocol, evidenceLevel: (e.target.value || undefined) as any } })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
                      <option value="">Tanlanmagan</option>
                      <option value="A">A — Yuqori</option>
                      <option value="B">B — O'rta</option>
                      <option value="C">C — Past</option>
                      <option value="D">D — Juda past</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Diagnostika bosqichlari (har biri yangi qatorda)</label>
                  <textarea value={editing.protocol.diagnosticSteps.join('\n')}
                    onChange={e => setEditing({ ...editing, protocol: { ...editing.protocol, diagnosticSteps: e.target.value.split('\n').filter(Boolean) } })}
                    rows={4} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Davolash yo'riqnomalari</label>
                  <textarea value={editing.protocol.treatmentGuidelines.join('\n')}
                    onChange={e => setEditing({ ...editing, protocol: { ...editing.protocol, treatmentGuidelines: e.target.value.split('\n').filter(Boolean) } })}
                    rows={4} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Red Flags
                  </label>
                  <textarea value={editing.protocol.redFlags.join('\n')}
                    onChange={e => setEditing({ ...editing, protocol: { ...editing.protocol, redFlags: e.target.value.split('\n').filter(Boolean) } })}
                    rows={3} className="w-full px-4 py-2.5 bg-slate-800 border border-red-500/30 rounded-xl text-sm text-white outline-none focus:border-red-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Manba *</label>
                    <input value={editing.protocol.source}
                      onChange={e => setEditing({ ...editing, protocol: { ...editing.protocol, source: e.target.value } })}
                      placeholder="WHO Guidelines 2022..."
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Manba URL</label>
                    <input value={editing.protocol.sourceUrl || ''}
                      onChange={e => setEditing({ ...editing, protocol: { ...editing.protocol, sourceUrl: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
                  </div>
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
