import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Download, ChevronRight } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useApp } from '../../../store/appStore';

const MOCK = [
  { id: 'P001', name: 'Karimov Aziz', phone: '+998901234567', age: 36, gender: 'Erkak', apps: 5, lastVisit: '2026-04-03', diagnosis: 'I10 Gipertenziya' },
  { id: 'P002', name: 'Xasanova Nilufar', phone: '+998903456789', age: 41, gender: 'Ayol', apps: 3, lastVisit: '2026-04-02', diagnosis: 'E11 Diabet 2-tur' },
  { id: 'P003', name: 'Rahimov Bobur', phone: '+998904567890', age: 48, gender: 'Erkak', apps: 8, lastVisit: '2026-04-03', diagnosis: 'M54.5 Bel og\'rig\'i' },
  { id: 'P004', name: 'Toshmatova Dilfuza', phone: '+998905678901', age: 31, gender: 'Ayol', apps: 2, lastVisit: '2026-04-01', diagnosis: 'J45 Bronxial astma' },
  { id: 'P005', name: 'Abdullayev Sardor', phone: '+998906789012', age: 44, gender: 'Erkak', apps: 12, lastVisit: '2026-04-03', diagnosis: 'I25.1 Yurak kasalligi' },
  { id: 'P006', name: 'Mirzayeva Gulnora', phone: '+998907890123', age: 34, gender: 'Ayol', apps: 4, lastVisit: '2026-03-28', diagnosis: 'E03.9 Gipotireoz' },
  { id: 'P007', name: 'Yusupov Doniyor', phone: '+998908901234', age: 38, gender: 'Erkak', apps: 6, lastVisit: '2026-04-03', diagnosis: 'K29.7 Gastrit' },
  { id: 'P008', name: 'Sultanova Kamola', phone: '+998909012345', age: 26, gender: 'Ayol', apps: 1, lastVisit: '2026-03-25', diagnosis: 'L20.9 Dermatit' },
  { id: 'P009', name: 'Nazarov Otabek', phone: '+998900123456', age: 51, gender: 'Erkak', apps: 15, lastVisit: '2026-04-02', diagnosis: 'I50.9 Yurak yetishmovchiligi' },
  { id: 'P010', name: 'Qosimova Shahnoza', phone: '+998911234567', age: 28, gender: 'Ayol', apps: 3, lastVisit: '2026-04-01', diagnosis: 'G43.9 Migren' },
  { id: 'P011', name: 'Umarov Jasur', phone: '+998912345678', age: 55, gender: 'Erkak', apps: 9, lastVisit: '2026-03-30', diagnosis: 'E78.5 Giperlipidemiya' },
  { id: 'P012', name: 'Aliyeva Mohira', phone: '+998913456789', age: 42, gender: 'Ayol', apps: 7, lastVisit: '2026-04-03', diagnosis: 'N39.0 Siydik infeksiya' },
];

export function WebDocPatientsScreen() {
  const { navigate } = useApp();
  const [search, setSearch] = useState('');
  const filtered = MOCK.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search) || p.diagnosis.toLowerCase().includes(search.toLowerCase()));

  return (
    <WebPlatformLayout title="Bemorlar" subtitle="Barcha bemorlar ro'yxati va tarix">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism, telefon yoki tashxis..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"><Download className="w-4 h-4" /> Export</button>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[850px]">
            <thead><tr className="border-b border-slate-800">
              {['Bemor', 'Telefon', 'Yoshi', 'Jinsi', 'Tashxis', 'Arizalar', 'Oxirgi tashrif', ''].map(h => (
                <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody>{filtered.map((p, i) => (
              <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                onClick={() => navigate('web_doc_emr')} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer">
                <td className="px-5 py-3"><div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{p.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <span className="text-white text-sm font-medium">{p.name}</span>
                </div></td>
                <td className="px-5 py-3 text-slate-300 text-sm">{p.phone}</td>
                <td className="px-5 py-3 text-white text-sm">{p.age}</td>
                <td className="px-5 py-3 text-slate-400 text-sm">{p.gender}</td>
                <td className="px-5 py-3"><span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-indigo-400">{p.diagnosis}</span></td>
                <td className="px-5 py-3 text-white text-sm">{p.apps}</td>
                <td className="px-5 py-3 text-slate-400 text-sm">{p.lastVisit}</td>
                <td className="px-5 py-3"><ChevronRight className="w-4 h-4 text-slate-600" /></td>
              </motion.tr>
            ))}</tbody>
          </table></div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
