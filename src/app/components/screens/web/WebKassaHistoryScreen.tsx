import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const fmt = (n: number) => n.toLocaleString() + " so'm";
const METHOD_BADGE: Record<string, string> = { Naqd: 'bg-emerald-500/10 text-emerald-400', Karta: 'bg-blue-500/10 text-blue-400', Payme: 'bg-cyan-500/10 text-cyan-400', Click: 'bg-violet-500/10 text-violet-400', Uzum: 'bg-amber-500/10 text-amber-400' };
const STATUS_BADGE: Record<string, string> = { 'Qabul qilindi': 'bg-emerald-500/10 text-emerald-400', Qaytarildi: 'bg-red-500/10 text-red-400', Kutilmoqda: 'bg-amber-500/10 text-amber-400' };

const MOCK = [
  { id: 'PAY-001', date: '2026-04-03 14:35', patient: 'Karimov Aziz', app: '#1256', service: 'MRT bosh', amount: 450000, method: 'Naqd', status: 'Qabul qilindi', kassir: 'Rahimova M.' },
  { id: 'PAY-002', date: '2026-04-03 14:22', patient: 'Xasanova Nilufar', app: '#1255', service: 'Qon tahlili', amount: 85000, method: 'Payme', status: 'Qabul qilindi', kassir: 'Rahimova M.' },
  { id: 'PAY-003', date: '2026-04-03 14:10', patient: 'Rahimov Bobur', app: '#1254', service: 'USG qorin', amount: 200000, method: 'Click', status: 'Qabul qilindi', kassir: 'Rahimova M.' },
  { id: 'PAY-004', date: '2026-04-03 13:55', patient: 'Toshmatova Dilfuza', app: '#1253', service: 'Konsultatsiya', amount: 150000, method: 'Karta', status: 'Qabul qilindi', kassir: 'Rahimova M.' },
  { id: 'PAY-005', date: '2026-04-03 13:40', patient: 'Abdullayev Sardor', app: '#1252', service: 'MSKT ko\'krak', amount: 550000, method: 'Payme', status: 'Qabul qilindi', kassir: 'Rahimova M.' },
  { id: 'PAY-006', date: '2026-04-03 13:28', patient: 'Mirzayeva Gulnora', app: '#1251', service: 'Rentgen', amount: 120000, method: 'Uzum', status: 'Qabul qilindi', kassir: 'Rahimova M.' },
  { id: 'PAY-007', date: '2026-04-03 13:15', patient: 'Yusupov Doniyor', app: '#1250', service: 'MRT tizza', amount: 450000, method: 'Naqd', status: 'Qaytarildi', kassir: 'Rahimova M.' },
  { id: 'PAY-008', date: '2026-04-03 13:00', patient: 'Sultanova Kamola', app: '#1249', service: 'Lab paket', amount: 180000, method: 'Payme', status: 'Qabul qilindi', kassir: 'Rahimova M.' },
  { id: 'PAY-009', date: '2026-04-03 12:45', patient: 'Nazarov Otabek', app: '#1248', service: 'Konsultatsiya', amount: 150000, method: 'Naqd', status: 'Qabul qilindi', kassir: 'Rahimova M.' },
  { id: 'PAY-010', date: '2026-04-03 12:30', patient: 'Qosimova Shahnoza', app: '#1247', service: 'USG', amount: 200000, method: 'Karta', status: 'Qabul qilindi', kassir: 'Rahimova M.' },
  { id: 'PAY-011', date: '2026-04-02 16:20', patient: 'Umarov Jasur', app: '#1246', service: 'MRT bosh', amount: 450000, method: 'Click', status: 'Qabul qilindi', kassir: 'Farhod A.' },
  { id: 'PAY-012', date: '2026-04-02 15:45', patient: 'Aliyeva Mohira', app: '#1245', service: 'Lab', amount: 65000, method: 'Naqd', status: 'Qabul qilindi', kassir: 'Farhod A.' },
];

export function WebKassaHistoryScreen() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('Bugun');

  const filtered = MOCK.filter(p => !search || p.patient.toLowerCase().includes(search.toLowerCase()) || p.app.includes(search) || p.id.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.reduce((a, p) => a + (p.status !== 'Qaytarildi' ? p.amount : 0), 0);

  return (
    <WebPlatformLayout title="To'lovlar tarixi" subtitle="Barcha to'lovlar ro'yxati">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['Bugun', 'Hafta', 'Oy', 'Barchasi'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{p}</button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bemor, ariza # yoki to'lov ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"><Download className="w-4 h-4" /> Export</button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[1000px]">
            <thead><tr className="border-b border-slate-800">
              {['ID', 'Sana', 'Bemor', 'Ariza', 'Xizmat', 'Summa', 'Usul', 'Holat', 'Kassir'].map(h => (
                <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody>{filtered.map((p, i) => (
              <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3 text-slate-500 text-xs font-mono">{p.id}</td>
                <td className="px-5 py-3 text-slate-400 text-sm">{p.date}</td>
                <td className="px-5 py-3 text-white text-sm font-medium">{p.patient}</td>
                <td className="px-5 py-3 text-indigo-400 text-sm">{p.app}</td>
                <td className="px-5 py-3 text-slate-300 text-sm">{p.service}</td>
                <td className="px-5 py-3 text-white text-sm font-medium">{fmt(p.amount)}</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${METHOD_BADGE[p.method]}`}>{p.method}</span></td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                <td className="px-5 py-3 text-slate-400 text-sm">{p.kassir}</td>
              </motion.tr>
            ))}</tbody>
          </table></div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <span className="text-slate-500 text-xs">{filtered.length} ta to'lov | Jami: <span className="text-white font-medium">{fmt(total)}</span></span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-slate-400 text-sm">1 / 1</span>
              <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
