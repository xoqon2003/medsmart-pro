import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const STATUS_OPTS = ['Barchasi', 'Yangi', 'To\'lov kutilmoqda', 'Qabul qilindi', 'Xulosa yozilmoqda', 'Bajarildi', 'Bekor qilindi'];
const SERVICE_OPTS = ['Barchasi', 'AI+Radiolog', 'Faqat Radiolog', 'Rad+Mutaxassis', 'Konsultatsiya', 'Uyga chaqirish'];
const ST_BADGE: Record<string, string> = { new: 'bg-indigo-500/10 text-indigo-400', paid_pending: 'bg-amber-500/10 text-amber-400', accepted: 'bg-blue-500/10 text-blue-400', conclusion_writing: 'bg-purple-500/10 text-purple-400', done: 'bg-emerald-500/10 text-emerald-400', failed: 'bg-red-500/10 text-red-400' };
const ST_LABEL: Record<string, string> = { new: 'Yangi', paid_pending: 'To\'lov kutilmoqda', accepted: 'Qabul qilindi', conclusion_writing: 'Xulosa', done: 'Bajarildi', failed: 'Bekor' };
const URG_BADGE: Record<string, string> = { normal: 'bg-slate-800 text-slate-400', urgent: 'bg-amber-500/10 text-amber-400', emergency: 'bg-red-500/10 text-red-400' };

const MOCK = Array.from({ length: 15 }, (_, i) => ({
  id: `#${1256 - i}`, date: `2026-04-0${3 - Math.floor(i / 5)} ${14 - i}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  patient: ['Karimov A.', 'Xasanova N.', 'Rahimov B.', 'Toshmatova D.', 'Abdullayev S.', 'Mirzayeva G.', 'Yusupov D.', 'Sultanova K.', 'Nazarov O.', 'Qosimova Sh.', 'Umarov J.', 'Aliyeva M.', 'Ergashev B.', 'Ismoilov N.', 'Kamalova D.'][i],
  service: ['MRT bosh', 'Qon tahlili', 'USG qorin', 'Konsultatsiya', 'MSKT', 'Rentgen', 'MRT tizza', 'Lab', 'Konsultatsiya', 'MRT bosh', 'USG', 'MSKT ko\'krak', 'MRT', 'Rentgen', 'Lab'][i],
  amount: [450000, 85000, 200000, 150000, 550000, 120000, 450000, 65000, 150000, 450000, 200000, 550000, 450000, 120000, 85000][i],
  status: ['new', 'paid_pending', 'accepted', 'done', 'conclusion_writing', 'done', 'new', 'done', 'accepted', 'paid_pending', 'done', 'conclusion_writing', 'done', 'new', 'done'][i],
  urgency: ['normal', 'normal', 'urgent', 'normal', 'emergency', 'normal', 'normal', 'normal', 'urgent', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal'][i],
  operator: ['Farhod A.', 'Shahnoza Q.', 'Farhod A.', 'Shahnoza Q.', 'Farhod A.'][i % 5],
}));

export function WebOpApplicationsScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Barchasi');
  const [page, setPage] = useState(1);

  return (
    <WebPlatformLayout title="Arizalar" subtitle="Kengaytirilgan arizalar jadvali">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ariza #, bemor, telefon..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
            {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
            {SERVICE_OPTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"><Download className="w-4 h-4" /> Export CSV</button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[950px]">
            <thead><tr className="border-b border-slate-800">
              {['Ariza #', 'Sana', 'Bemor', 'Xizmat', 'Summa', 'Holat', 'Ustuvorlik', 'Operator'].map(h => (
                <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody>{MOCK.map((a, i) => (
              <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer">
                <td className="px-5 py-3 text-indigo-400 text-sm font-medium">{a.id}</td>
                <td className="px-5 py-3 text-slate-400 text-sm">{a.date}</td>
                <td className="px-5 py-3 text-white text-sm font-medium">{a.patient}</td>
                <td className="px-5 py-3 text-slate-300 text-sm">{a.service}</td>
                <td className="px-5 py-3 text-white text-sm">{a.amount.toLocaleString()}</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${ST_BADGE[a.status]}`}>{ST_LABEL[a.status]}</span></td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${URG_BADGE[a.urgency]}`}>{a.urgency === 'normal' ? 'Oddiy' : a.urgency === 'urgent' ? 'Shoshilinch' : 'Favqulodda'}</span></td>
                <td className="px-5 py-3 text-slate-400 text-sm">{a.operator}</td>
              </motion.tr>
            ))}</tbody>
          </table></div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <span className="text-slate-500 text-xs">{MOCK.length} ta ariza</span>
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
