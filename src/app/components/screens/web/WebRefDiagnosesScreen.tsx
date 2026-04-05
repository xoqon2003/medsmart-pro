import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit3, Trash2, X, Tags, Filter } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const CATEGORIES = ['Barchasi', 'Infektsion (A00-B99)', 'Onkologiya (C00-D48)', 'Qon (D50-D89)', 'Endokrin (E00-E90)', 'Psixik (F00-F99)', 'Nerv (G00-G99)', 'Ko\'z (H00-H59)', 'Quloq (H60-H95)', 'Yurak-tomir (I00-I99)', 'Nafas (J00-J99)', 'Hazm (K00-K93)', 'Teri (L00-L99)', 'Suyak-mushak (M00-M99)', 'Siydik (N00-N99)'];

const MOCK = [
  { id: '1', code: 'A09', name: 'Infektsion gastroenterit va kolit', category: 'Infektsion (A00-B99)', icdVersion: 'ICD-10', isActive: true },
  { id: '2', code: 'B34.9', name: 'Virus infektsiyasi, aniqlanmagan', category: 'Infektsion (A00-B99)', icdVersion: 'ICD-10', isActive: true },
  { id: '3', code: 'C34', name: 'Bronx va o\'pka xavfli o\'smasi', category: 'Onkologiya (C00-D48)', icdVersion: 'ICD-10', isActive: true },
  { id: '4', code: 'D50.9', name: 'Temir tanqisligi anemiyasi', category: 'Qon (D50-D89)', icdVersion: 'ICD-10', isActive: true },
  { id: '5', code: 'E11', name: 'Ikkinchi turdagi qandli diabet', category: 'Endokrin (E00-E90)', icdVersion: 'ICD-10', isActive: true },
  { id: '6', code: 'E03.9', name: 'Gipotireoz, aniqlanmagan', category: 'Endokrin (E00-E90)', icdVersion: 'ICD-10', isActive: true },
  { id: '7', code: 'E78.5', name: 'Giperlipidemiya, aniqlanmagan', category: 'Endokrin (E00-E90)', icdVersion: 'ICD-10', isActive: true },
  { id: '8', code: 'G43.9', name: 'Migren, aniqlanmagan', category: 'Nerv (G00-G99)', icdVersion: 'ICD-10', isActive: true },
  { id: '9', code: 'G47.0', name: 'Uyqusizlik', category: 'Nerv (G00-G99)', icdVersion: 'ICD-10', isActive: true },
  { id: '10', code: 'I10', name: 'Essensiyal (birlamchi) gipertenziya', category: 'Yurak-tomir (I00-I99)', icdVersion: 'ICD-10', isActive: true },
  { id: '11', code: 'I20.9', name: 'Stenokardiya, aniqlanmagan', category: 'Yurak-tomir (I00-I99)', icdVersion: 'ICD-10', isActive: true },
  { id: '12', code: 'I25.1', name: 'Aterosklerotik yurak kasalligi', category: 'Yurak-tomir (I00-I99)', icdVersion: 'ICD-10', isActive: true },
  { id: '13', code: 'I50.9', name: 'Yurak yetishmovchiligi', category: 'Yurak-tomir (I00-I99)', icdVersion: 'ICD-10', isActive: true },
  { id: '14', code: 'J06.9', name: 'Yuqori nafas yo\'llari infektsiyasi', category: 'Nafas (J00-J99)', icdVersion: 'ICD-10', isActive: true },
  { id: '15', code: 'J18.9', name: 'Pnevmoniya, aniqlanmagan', category: 'Nafas (J00-J99)', icdVersion: 'ICD-10', isActive: true },
  { id: '16', code: 'J45', name: 'Bronxial astma', category: 'Nafas (J00-J99)', icdVersion: 'ICD-10', isActive: true },
  { id: '17', code: 'K21.0', name: 'Gastroezofageal refluks', category: 'Hazm (K00-K93)', icdVersion: 'ICD-10', isActive: true },
  { id: '18', code: 'K25', name: 'Oshqozon yarasi', category: 'Hazm (K00-K93)', icdVersion: 'ICD-10', isActive: true },
  { id: '19', code: 'K29.7', name: 'Gastrit, aniqlanmagan', category: 'Hazm (K00-K93)', icdVersion: 'ICD-10', isActive: true },
  { id: '20', code: 'L20.9', name: 'Atopik dermatit', category: 'Teri (L00-L99)', icdVersion: 'ICD-10', isActive: true },
  { id: '21', code: 'M54.5', name: 'Bel og\'rig\'i', category: 'Suyak-mushak (M00-M99)', icdVersion: 'ICD-10', isActive: true },
  { id: '22', code: 'M79.3', name: 'Pannikulit, aniqlanmagan', category: 'Suyak-mushak (M00-M99)', icdVersion: 'ICD-10', isActive: false },
  { id: '23', code: 'N18.9', name: 'Surunkali buyrak kasalligi', category: 'Siydik (N00-N99)', icdVersion: 'ICD-10', isActive: true },
  { id: '24', code: 'N39.0', name: 'Siydik yo\'llari infektsiyasi', category: 'Siydik (N00-N99)', icdVersion: 'ICD-10', isActive: true },
  { id: '25', code: 'F41.1', name: 'Umumlashgan tashvish buzilishi', category: 'Psixik (F00-F99)', icdVersion: 'ICD-10', isActive: true },
];

export function WebRefDiagnosesScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Barchasi');
  const [modal, setModal] = useState(false);

  const filtered = MOCK.filter(d =>
    (category === 'Barchasi' || d.category === category) &&
    (d.code.toLowerCase().includes(search.toLowerCase()) || d.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <WebPlatformLayout title="ICD-10 Tashxis kodlari" subtitle="Xalqaro kasalliklar tasnifi">
      <div className="p-6 space-y-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Kod yoki nomi bo'yicha qidirish... (masalan: I10 yoki gipertenziya)"
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 text-base" />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 min-w-[200px]">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setModal(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" /> Qo'shish
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-2">{filtered.length} ta natija topildi</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-800">
                  {['ICD Kod', 'Nomi', 'Kategoriya', 'Holat', 'Amallar'].map(h => (
                    <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3"><span className="text-indigo-400 text-sm font-mono font-bold">{d.code}</span></td>
                    <td className="px-5 py-3 text-white text-sm">{d.name}</td>
                    <td className="px-5 py-3"><span className="text-slate-400 text-xs bg-slate-800 px-2 py-0.5 rounded-full">{d.category.split(' ')[0]}</span></td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {d.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
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
