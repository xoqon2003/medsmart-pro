import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit3, Trash2, X, Pill } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const CATEGORIES = ['Barchasi', 'Antibiotik', 'Analgetik', 'Yurak-tomir', 'Endokrin', 'Oshqozon', 'Psixotrop', 'Vitamin', 'Allergiya', 'Boshqa'];
const FORMS = ['tablet', 'kapsul', 'sirop', 'inektsiya', 'malham', 'tomchi', 'boshqa'] as const;

const MOCK = [
  { id: '1', name: 'Amoksitsillin', genericName: 'Amoxicillin', form: 'kapsul', dosage: '500mg', manufacturer: 'Uzpharmsanoat', category: 'Antibiotik', isActive: true },
  { id: '2', name: 'Azitromitsin', genericName: 'Azithromycin', form: 'tablet', dosage: '500mg', manufacturer: 'Nobel Pharmsanoat', category: 'Antibiotik', isActive: true },
  { id: '3', name: 'Seftriakson', genericName: 'Ceftriaxone', form: 'inektsiya', dosage: '1g', manufacturer: 'Pharmatex', category: 'Antibiotik', isActive: true },
  { id: '4', name: 'Ibuprofen', genericName: 'Ibuprofen', form: 'tablet', dosage: '400mg', manufacturer: 'Uzbekfarmprom', category: 'Analgetik', isActive: true },
  { id: '5', name: 'Paratsetamol', genericName: 'Paracetamol', form: 'tablet', dosage: '500mg', manufacturer: 'Uzpharmsanoat', category: 'Analgetik', isActive: true },
  { id: '6', name: 'Diklofenak', genericName: 'Diclofenac', form: 'malham', dosage: '1%', manufacturer: 'Nobel Pharmsanoat', category: 'Analgetik', isActive: true },
  { id: '7', name: 'Metformin', genericName: 'Metformin', form: 'tablet', dosage: '850mg', manufacturer: 'Sanofi', category: 'Endokrin', isActive: true },
  { id: '8', name: 'Atorvastatin', genericName: 'Atorvastatin', form: 'tablet', dosage: '20mg', manufacturer: 'Pfizer', category: 'Yurak-tomir', isActive: true },
  { id: '9', name: 'Lizinopril', genericName: 'Lisinopril', form: 'tablet', dosage: '10mg', manufacturer: 'Teva', category: 'Yurak-tomir', isActive: true },
  { id: '10', name: 'Amlodipin', genericName: 'Amlodipine', form: 'tablet', dosage: '5mg', manufacturer: 'Pfizer', category: 'Yurak-tomir', isActive: true },
  { id: '11', name: 'Omeprazol', genericName: 'Omeprazole', form: 'kapsul', dosage: '20mg', manufacturer: 'AstraZeneca', category: 'Oshqozon', isActive: true },
  { id: '12', name: 'Pantoprazol', genericName: 'Pantoprazole', form: 'tablet', dosage: '40mg', manufacturer: 'Nycomed', category: 'Oshqozon', isActive: true },
  { id: '13', name: 'Levotiroksin', genericName: 'Levothyroxine', form: 'tablet', dosage: '100mkg', manufacturer: 'Berlin-Chemie', category: 'Endokrin', isActive: true },
  { id: '14', name: 'Tsetirizin', genericName: 'Cetirizine', form: 'tablet', dosage: '10mg', manufacturer: 'Uzpharmsanoat', category: 'Allergiya', isActive: true },
  { id: '15', name: 'Loratadin', genericName: 'Loratadine', form: 'sirop', dosage: '5mg/5ml', manufacturer: 'Nobel Pharmsanoat', category: 'Allergiya', isActive: true },
  { id: '16', name: 'B12 vitamin', genericName: 'Cyanocobalamin', form: 'inektsiya', dosage: '500mkg', manufacturer: 'Uzpharmsanoat', category: 'Vitamin', isActive: true },
  { id: '17', name: 'Sertralin', genericName: 'Sertraline', form: 'tablet', dosage: '50mg', manufacturer: 'Pfizer', category: 'Psixotrop', isActive: true },
  { id: '18', name: 'Aspirin Kardio', genericName: 'Acetylsalicylic acid', form: 'tablet', dosage: '100mg', manufacturer: 'Bayer', category: 'Yurak-tomir', isActive: true },
  { id: '19', name: 'Klopidogrel', genericName: 'Clopidogrel', form: 'tablet', dosage: '75mg', manufacturer: 'Sanofi', category: 'Yurak-tomir', isActive: false },
  { id: '20', name: 'Deksametazon', genericName: 'Dexamethasone', form: 'inektsiya', dosage: '4mg/ml', manufacturer: 'Pharmatex', category: 'Boshqa', isActive: true },
];

const FORM_LABELS: Record<string, string> = { tablet: 'Tablet', kapsul: 'Kapsul', sirop: 'Sirop', inektsiya: "In'ektsiya", malham: 'Malham', tomchi: 'Tomchi', boshqa: 'Boshqa' };
const FORM_COLORS: Record<string, string> = { tablet: 'bg-blue-500/10 text-blue-400', kapsul: 'bg-violet-500/10 text-violet-400', sirop: 'bg-amber-500/10 text-amber-400', inektsiya: 'bg-red-500/10 text-red-400', malham: 'bg-emerald-500/10 text-emerald-400', tomchi: 'bg-cyan-500/10 text-cyan-400', boshqa: 'bg-slate-500/10 text-slate-400' };

export function WebRefDrugsScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Barchasi');
  const [modal, setModal] = useState(false);

  const filtered = MOCK.filter(d =>
    (category === 'Barchasi' || d.category === category) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.genericName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <WebPlatformLayout title="Dori katalogi" subtitle="Dori vositalari ma'lumotnomasi">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nomi yoki INN bo'yicha qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Qo'shish
          </button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Nomi', 'INN', 'Shakli', 'Dozasi', 'Ishlab chiqaruvchi', 'Kategoriya', 'Holat', ''].map(h => (
                    <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-white text-sm font-medium">{d.name}</td>
                    <td className="px-5 py-3 text-slate-400 text-sm italic">{d.genericName}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${FORM_COLORS[d.form]}`}>{FORM_LABELS[d.form]}</span></td>
                    <td className="px-5 py-3 text-white text-sm font-mono">{d.dosage}</td>
                    <td className="px-5 py-3 text-slate-400 text-sm">{d.manufacturer}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{d.category}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {d.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
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
