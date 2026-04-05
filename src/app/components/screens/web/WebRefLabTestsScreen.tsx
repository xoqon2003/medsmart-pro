import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Edit3, Trash2, TestTube } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const CATS = ['Barchasi', 'Qon tahlili', 'Bioximiya', 'Gormonlar', 'Koagulogramma', 'Immunologiya', 'Peshob', 'Boshqa'];

const MOCK = [
  { id: '1', code: 'CBC', name: 'Umumiy qon tahlili (OAK)', category: 'Qon tahlili', referenceRange: '-', unit: '-', price: 45000, isActive: true },
  { id: '2', code: 'GLU', name: 'Glyukoza (qon qandi)', category: 'Bioximiya', referenceRange: '3.9-6.1', unit: 'mmol/l', price: 25000, isActive: true },
  { id: '3', code: 'CHOL', name: 'Umumiy xolesterin', category: 'Bioximiya', referenceRange: '<5.2', unit: 'mmol/l', price: 30000, isActive: true },
  { id: '4', code: 'TG', name: 'Triglitseridlar', category: 'Bioximiya', referenceRange: '<1.7', unit: 'mmol/l', price: 30000, isActive: true },
  { id: '5', code: 'AST', name: 'Aspartataminotransferaza', category: 'Bioximiya', referenceRange: '0-40', unit: 'U/L', price: 25000, isActive: true },
  { id: '6', code: 'ALT', name: 'Alaninaminotransferaza', category: 'Bioximiya', referenceRange: '0-41', unit: 'U/L', price: 25000, isActive: true },
  { id: '7', code: 'CREA', name: 'Kreatinin', category: 'Bioximiya', referenceRange: '62-115', unit: 'mkmol/l', price: 25000, isActive: true },
  { id: '8', code: 'UREA', name: 'Mochevina (BUN)', category: 'Bioximiya', referenceRange: '2.5-8.3', unit: 'mmol/l', price: 25000, isActive: true },
  { id: '9', code: 'TSH', name: 'Tireotrop gormon', category: 'Gormonlar', referenceRange: '0.4-4.0', unit: 'mIU/L', price: 55000, isActive: true },
  { id: '10', code: 'FT3', name: 'Erkin T3', category: 'Gormonlar', referenceRange: '3.1-6.8', unit: 'pmol/l', price: 50000, isActive: true },
  { id: '11', code: 'FT4', name: 'Erkin T4', category: 'Gormonlar', referenceRange: '12-22', unit: 'pmol/l', price: 50000, isActive: true },
  { id: '12', code: 'HBA1C', name: 'Glikozillangangemoglobin', category: 'Bioximiya', referenceRange: '<6.0', unit: '%', price: 65000, isActive: true },
  { id: '13', code: 'PT', name: 'Protrombin vaqti', category: 'Koagulogramma', referenceRange: '11-13.5', unit: 'sek', price: 35000, isActive: true },
  { id: '14', code: 'INR', name: 'Xalqaro normalizatsiya indeksi', category: 'Koagulogramma', referenceRange: '0.8-1.2', unit: '-', price: 35000, isActive: true },
  { id: '15', code: 'FIB', name: 'Fibrinogen', category: 'Koagulogramma', referenceRange: '2.0-4.0', unit: 'g/l', price: 30000, isActive: true },
  { id: '16', code: 'CRP', name: 'C-reaktiv oqsil', category: 'Immunologiya', referenceRange: '<5', unit: 'mg/l', price: 40000, isActive: true },
  { id: '17', code: 'RF', name: 'Revmatoid faktor', category: 'Immunologiya', referenceRange: '<14', unit: 'IU/ml', price: 45000, isActive: true },
  { id: '18', code: 'UA', name: 'Umumiy peshob tahlili', category: 'Peshob', referenceRange: '-', unit: '-', price: 20000, isActive: true },
  { id: '19', code: 'FE', name: 'Temir (serum)', category: 'Bioximiya', referenceRange: '12.5-32.2', unit: 'mkmol/l', price: 35000, isActive: true },
  { id: '20', code: 'FERR', name: 'Ferritin', category: 'Bioximiya', referenceRange: '20-250', unit: 'ng/ml', price: 50000, isActive: true },
];

const fmt = (n: number) => n.toLocaleString() + " so'm";

export function WebRefLabTestsScreen() {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Barchasi');

  const filtered = MOCK.filter(t =>
    (cat === 'Barchasi' || t.category === cat) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <WebPlatformLayout title="Lab testlar katalogi" subtitle="Laboratoriya tekshiruvlari va narxlar">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kod yoki nomi bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">{CATS.map(c => <option key={c}>{c}</option>)}</select>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> Qo'shish</button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead><tr className="border-b border-slate-800">
                {['Kod', 'Nomi', 'Kategoriya', 'Normal qiymati', 'Birlik', 'Narxi', 'Holat', ''].map(h => (
                  <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((t, i) => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3"><span className="text-indigo-400 text-sm font-mono font-bold">{t.code}</span></td>
                    <td className="px-5 py-3 text-white text-sm">{t.name}</td>
                    <td className="px-5 py-3"><span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{t.category}</span></td>
                    <td className="px-5 py-3 text-emerald-400 text-sm font-mono">{t.referenceRange}</td>
                    <td className="px-5 py-3 text-slate-400 text-sm">{t.unit}</td>
                    <td className="px-5 py-3 text-white text-sm font-medium">{fmt(t.price)}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{t.isActive ? 'Faol' : 'Nofaol'}</span></td>
                    <td className="px-5 py-3"><div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div></td>
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
