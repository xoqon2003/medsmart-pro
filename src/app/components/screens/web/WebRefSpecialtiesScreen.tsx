import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit3, Trash2, ToggleLeft, ToggleRight, X, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import type { Specialty } from '../../../types';

const MOCK: Specialty[] = [
  { id: '1', name: 'Kardiologiya', code: 'KAR', description: 'Yurak-qon tomir kasalliklari', isActive: true, sortOrder: 1, doctorCount: 12 },
  { id: '2', name: 'Nevrologiya', code: 'NEV', description: 'Asab tizimi kasalliklari', isActive: true, sortOrder: 2, doctorCount: 8 },
  { id: '3', name: 'Travmatologiya', code: 'TRA', description: 'Shikastlanishlar va suyak kasalliklari', isActive: true, sortOrder: 3, doctorCount: 6 },
  { id: '4', name: 'Dermatologiya', code: 'DER', description: 'Teri kasalliklari', isActive: true, sortOrder: 4, doctorCount: 5 },
  { id: '5', name: 'Pediatriya', code: 'PED', description: 'Bolalar kasalliklari', isActive: true, sortOrder: 5, doctorCount: 10 },
  { id: '6', name: 'Otorinolaringologiya', code: 'ORL', description: 'Quloq-burun-tomoq', isActive: true, sortOrder: 6, doctorCount: 4 },
  { id: '7', name: 'Oftalmologiya', code: 'OFT', description: 'Ko\'z kasalliklari', isActive: true, sortOrder: 7, doctorCount: 7 },
  { id: '8', name: 'Urologiya', code: 'URO', description: 'Siydik-tanosil tizimi', isActive: true, sortOrder: 8, doctorCount: 5 },
  { id: '9', name: 'Ginekologiya', code: 'GIN', description: 'Ayollar kasalliklari', isActive: true, sortOrder: 9, doctorCount: 9 },
  { id: '10', name: 'Pulmonologiya', code: 'PUL', description: 'O\'pka kasalliklari', isActive: true, sortOrder: 10, doctorCount: 3 },
  { id: '11', name: 'Endokrinologiya', code: 'END', description: 'Ichki sekretsiya bezlari', isActive: false, sortOrder: 11, doctorCount: 4 },
  { id: '12', name: 'Gastroenterologiya', code: 'GAS', description: 'Oshqozon-ichak tizimi', isActive: true, sortOrder: 12, doctorCount: 6 },
  { id: '13', name: 'Revmatologiya', code: 'REV', description: 'Bo\'g\'im va biriktiruvchi to\'qima', isActive: true, sortOrder: 13, doctorCount: 2 },
  { id: '14', name: 'Onkologiya', code: 'ONK', description: 'O\'sma kasalliklari', isActive: true, sortOrder: 14, doctorCount: 5 },
  { id: '15', name: 'Nefrologiya', code: 'NEF', description: 'Buyrak kasalliklari', isActive: false, sortOrder: 15, doctorCount: 3 },
];

export function WebRefSpecialtiesScreen() {
  const [items, setItems] = useState(MOCK);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [modal, setModal] = useState<Specialty | null>(null);
  const [isNew, setIsNew] = useState(false);

  const filtered = items.filter(s =>
    (showInactive || s.isActive) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
  );

  const kpis = [
    { label: 'Jami', value: items.length, icon: BookOpen, color: 'from-indigo-500 to-blue-600' },
    { label: 'Faol', value: items.filter(s => s.isActive).length, icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
    { label: 'Shifokorlar', value: items.reduce((a, s) => a + (s.doctorCount || 0), 0), icon: Users, color: 'from-violet-500 to-purple-600' },
  ];

  const openNew = () => { setIsNew(true); setModal({ id: '', name: '', code: '', description: '', isActive: true, sortOrder: items.length + 1, doctorCount: 0 }); };
  const openEdit = (s: Specialty) => { setIsNew(false); setModal({ ...s }); };
  const toggleActive = (id: string) => setItems(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));

  return (
    <WebPlatformLayout title="Mutaxassisliklar" subtitle="Tibbiy mutaxassisliklar katalogi">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}>
                <k.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white text-xl font-bold">{k.value}</p>
                <p className="text-slate-500 text-xs">{k.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <label className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer">
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} className="rounded" />
            Nofaollarni ko'rsatish
          </label>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Qo'shish
          </button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Kod', 'Nomi', 'Tavsif', 'Shifokorlar', 'Holati', 'Amallar'].map(h => (
                    <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3"><span className="text-indigo-400 text-sm font-mono">{s.code}</span></td>
                    <td className="px-5 py-3 text-white text-sm font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-slate-400 text-sm">{s.description}</td>
                    <td className="px-5 py-3 text-white text-sm">{s.doctorCount}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(s.id)} className="flex items-center gap-1.5">
                        {s.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-600" />}
                        <span className={`text-xs ${s.isActive ? 'text-emerald-400' : 'text-slate-600'}`}>{s.isActive ? 'Faol' : 'Nofaol'}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <AnimatePresence>
          {modal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-semibold">{isNew ? 'Yangi mutaxassislik' : 'Tahrirlash'}</h3>
                  <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Kod', key: 'code' as const, placeholder: 'Masalan: KAR' },
                    { label: 'Nomi', key: 'name' as const, placeholder: 'Mutaxassislik nomi' },
                    { label: 'Tavsif', key: 'description' as const, placeholder: 'Qisqa tavsif' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-slate-400 text-xs font-medium mb-1 block">{f.label}</label>
                      <input value={modal[f.key] || ''} onChange={e => setModal({ ...modal, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-slate-400 text-sm">
                      <input type="checkbox" checked={modal.isActive} onChange={e => setModal({ ...modal, isActive: e.target.checked })} className="rounded" />
                      Faol
                    </label>
                    <button onClick={() => setModal(null)}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
                      Saqlash
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WebPlatformLayout>
  );
}
