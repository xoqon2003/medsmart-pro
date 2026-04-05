import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Phone, User, Calendar, FileText } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const PATIENTS = [
  { id: 'P001', name: 'Karimov Aziz Baxtiyor o\'g\'li', phone: '+998901234567', birthYear: '1990', gender: 'Erkak', apps: 5, lastApp: '2026-04-03' },
  { id: 'P002', name: 'Xasanova Nilufar Rustam qizi', phone: '+998903456789', birthYear: '1985', gender: 'Ayol', apps: 3, lastApp: '2026-04-02' },
  { id: 'P003', name: 'Rahimov Bobur Anvar o\'g\'li', phone: '+998904567890', birthYear: '1978', gender: 'Erkak', apps: 8, lastApp: '2026-04-03' },
  { id: 'P004', name: 'Toshmatova Dilfuza Karim qizi', phone: '+998905678901', birthYear: '1995', gender: 'Ayol', apps: 2, lastApp: '2026-04-01' },
  { id: 'P005', name: 'Abdullayev Sardor Farhod o\'g\'li', phone: '+998906789012', birthYear: '1982', gender: 'Erkak', apps: 12, lastApp: '2026-04-03' },
  { id: 'P006', name: 'Mirzayeva Gulnora Tolib qizi', phone: '+998907890123', birthYear: '1992', gender: 'Ayol', apps: 4, lastApp: '2026-03-28' },
  { id: 'P007', name: 'Yusupov Doniyor Bahrom o\'g\'li', phone: '+998908901234', birthYear: '1988', gender: 'Erkak', apps: 6, lastApp: '2026-04-03' },
  { id: 'P008', name: 'Sultanova Kamola Rashid qizi', phone: '+998909012345', birthYear: '2000', gender: 'Ayol', apps: 1, lastApp: '2026-03-25' },
  { id: 'P009', name: 'Nazarov Otabek Ilhom o\'g\'li', phone: '+998900123456', birthYear: '1975', gender: 'Erkak', apps: 15, lastApp: '2026-04-02' },
  { id: 'P010', name: 'Qosimova Shahnoza Akbar qizi', phone: '+998911234567', birthYear: '1998', gender: 'Ayol', apps: 3, lastApp: '2026-04-01' },
];

export function WebOpPatientSearchScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof PATIENTS[0] | null>(null);

  const filtered = search.length >= 2
    ? PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search) || p.id.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <WebPlatformLayout title="Bemor qidirish" subtitle="Telefon, ism yoki ID bo'yicha">
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} autoFocus
                placeholder="Bemor ismi, telefon raqami yoki ID kiriting..."
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-base outline-none focus:border-indigo-500" />
            </div>
            {search.length > 0 && search.length < 2 && <p className="text-slate-500 text-xs mt-2">Kamida 2 ta belgi kiriting</p>}
          </motion.div>

          {filtered.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6">
              <div className="p-4 border-b border-slate-800"><span className="text-slate-400 text-sm">{filtered.length} ta natija</span></div>
              {filtered.map((p, i) => (
                <motion.button key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(p)}
                  className={`w-full flex items-center justify-between px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors text-left ${selected?.id === p.id ? 'bg-indigo-600/10' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">{p.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <p className="text-slate-400 text-xs">{p.phone} | {p.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{p.apps} ariza</p>
                    <p className="text-slate-500 text-xs">Oxirgi: {p.lastApp}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Bemor profili</h3>
                  <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{selected.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                  </div>
                  <div>
                    <p className="text-white text-lg font-semibold">{selected.name}</p>
                    <p className="text-indigo-400 text-sm">{selected.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: Phone, label: 'Telefon', value: selected.phone },
                    { icon: Calendar, label: 'Tug\'ilgan yili', value: selected.birthYear },
                    { icon: User, label: 'Jinsi', value: selected.gender },
                    { icon: FileText, label: 'Arizalar soni', value: String(selected.apps) },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                      <f.icon className="w-4 h-4 text-slate-500" />
                      <div><p className="text-slate-500 text-xs">{f.label}</p><p className="text-white text-sm">{f.value}</p></div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
