import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Trash2, Printer, Save, Syringe } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const DRUG_DB = [
  { name: 'Amoksitsillin 500mg', inn: 'Amoxicillin', form: 'Kapsul' },
  { name: 'Ibuprofen 400mg', inn: 'Ibuprofen', form: 'Tablet' },
  { name: 'Omeprazol 20mg', inn: 'Omeprazole', form: 'Kapsul' },
  { name: 'Metformin 850mg', inn: 'Metformin', form: 'Tablet' },
  { name: 'Atorvastatin 20mg', inn: 'Atorvastatin', form: 'Tablet' },
  { name: 'Lizinopril 10mg', inn: 'Lisinopril', form: 'Tablet' },
  { name: 'Paratsetamol 500mg', inn: 'Paracetamol', form: 'Tablet' },
  { name: 'Azitromitsin 500mg', inn: 'Azithromycin', form: 'Tablet' },
];

interface PrescItem { id: number; drug: string; dose: string; route: string; schedule: string; duration: string; note: string; }

export function WebDocPrescriptionScreen() {
  const [drugSearch, setDrugSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [items, setItems] = useState<PrescItem[]>([
    { id: 1, drug: 'Amoksitsillin 500mg', dose: '500mg', route: 'Og\'iz orqali', schedule: '3 x 1', duration: '7 kun', note: 'Ovqatdan keyin' },
    { id: 2, drug: 'Omeprazol 20mg', dose: '20mg', route: 'Og\'iz orqali', schedule: '1 x 1', duration: '14 kun', note: 'Ovqatdan 30 min oldin' },
    { id: 3, drug: 'Ibuprofen 400mg', dose: '400mg', route: 'Og\'iz orqali', schedule: '2 x 1', duration: '5 kun', note: 'Og\'riqda' },
  ]);

  const filtered = drugSearch.length >= 2 ? DRUG_DB.filter(d => d.name.toLowerCase().includes(drugSearch.toLowerCase()) || d.inn.toLowerCase().includes(drugSearch.toLowerCase())) : [];
  const addDrug = (name: string) => {
    setItems(prev => [...prev, { id: Date.now(), drug: name, dose: '', route: 'Og\'iz orqali', schedule: '1 x 1', duration: '7 kun', note: '' }]);
    setDrugSearch(''); setShowSearch(false);
  };
  const removeDrug = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <WebPlatformLayout title="Retsept yozish" subtitle="Dori buyurtmasi va retsept">
      <div className="p-6 space-y-5">
        {/* Patient header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><span className="text-white text-sm font-bold">KA</span></div>
          <div><p className="text-white font-medium text-sm">Karimov Aziz</p><p className="text-slate-500 text-xs">36 yosh | Ariza #1256</p></div>
        </motion.div>

        {/* Drug search */}
        <div className="relative">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={drugSearch} onChange={e => { setDrugSearch(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)} placeholder="Dori qidirish (nom yoki INN)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
            </div>
          </div>
          {showSearch && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
              {filtered.map(d => (
                <button key={d.name} onClick={() => addDrug(d.name)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-800 text-left transition-colors">
                  <div><p className="text-white text-sm">{d.name}</p><p className="text-slate-500 text-xs">{d.inn} | {d.form}</p></div>
                  <Plus className="w-4 h-4 text-indigo-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prescription table */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[800px]">
            <thead><tr className="border-b border-slate-800">
              {['#', 'Dori nomi', 'Dozasi', 'Yo\'l', 'Sxema', 'Davomiyligi', 'Izoh', ''].map(h => (
                <th key={h} className="text-left text-slate-500 text-xs font-medium px-4 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody>{items.map((item, i) => (
              <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-slate-800/50">
                <td className="px-4 py-2 text-slate-500 text-sm">{i + 1}</td>
                <td className="px-4 py-2 text-white text-sm font-medium">{item.drug}</td>
                <td className="px-4 py-2"><input defaultValue={item.dose} className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs w-20 outline-none" /></td>
                <td className="px-4 py-2"><select defaultValue={item.route} className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs outline-none">
                  <option>Og'iz orqali</option><option>In'ektsiya (IV)</option><option>In'ektsiya (IM)</option><option>Tashqi</option>
                </select></td>
                <td className="px-4 py-2"><input defaultValue={item.schedule} className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs w-16 outline-none" /></td>
                <td className="px-4 py-2"><input defaultValue={item.duration} className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs w-20 outline-none" /></td>
                <td className="px-4 py-2"><input defaultValue={item.note} className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs w-32 outline-none" /></td>
                <td className="px-4 py-2"><button onClick={() => removeDrug(item.id)} className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button></td>
              </motion.tr>
            ))}</tbody>
          </table></div>
        </motion.div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"><Save className="w-4 h-4" /> Saqlash</button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"><Printer className="w-4 h-4" /> Chop etish</button>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
