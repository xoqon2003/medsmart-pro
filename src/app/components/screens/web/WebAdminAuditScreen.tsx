import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Download, Filter, ScrollText } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const ACTIONS = ['Barchasi', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT'];
const ACTION_COLORS: Record<string, string> = { CREATE: 'bg-emerald-500/10 text-emerald-400', UPDATE: 'bg-blue-500/10 text-blue-400', DELETE: 'bg-red-500/10 text-red-400', LOGIN: 'bg-indigo-500/10 text-indigo-400', LOGOUT: 'bg-slate-500/10 text-slate-400', VIEW: 'bg-cyan-500/10 text-cyan-400', EXPORT: 'bg-amber-500/10 text-amber-400' };

const MOCK = [
  { id: '1', timestamp: '2026-04-03 14:35:22', actor: 'Karimov A.', role: 'admin', action: 'CREATE', target: 'Application #1256', details: 'Yangi ariza yaratildi', ip: '192.168.1.45' },
  { id: '2', timestamp: '2026-04-03 14:28:15', actor: 'Dr. Rahimov', role: 'doctor', action: 'UPDATE', target: 'Conclusion #890', details: 'Xulosa yangilandi', ip: '192.168.1.78' },
  { id: '3', timestamp: '2026-04-03 14:20:08', actor: 'Toshmatova D.', role: 'kassir', action: 'CREATE', target: 'Payment #456', details: 'To\'lov qabul qilindi: 450,000', ip: '192.168.1.30' },
  { id: '4', timestamp: '2026-04-03 14:15:33', actor: 'Admin', role: 'admin', action: 'UPDATE', target: 'User #234', details: 'Rol o\'zgartildi: patient → operator', ip: '192.168.1.10' },
  { id: '5', timestamp: '2026-04-03 14:08:47', actor: 'Xasanova N.', role: 'radiolog', action: 'UPDATE', target: 'Conclusion #889', details: 'Xulosa tasdiqlandi', ip: '192.168.1.55' },
  { id: '6', timestamp: '2026-04-03 14:02:11', actor: 'Abdullayev S.', role: 'patient', action: 'CREATE', target: 'Application #1255', details: 'Yangi ariza (mini-app)', ip: '10.0.0.15' },
  { id: '7', timestamp: '2026-04-03 13:55:29', actor: 'Dr. Mirza', role: 'doctor', action: 'CREATE', target: 'Prescription #123', details: 'Retsept yozildi', ip: '192.168.1.80' },
  { id: '8', timestamp: '2026-04-03 13:48:45', actor: 'Farhod A.', role: 'operator', action: 'UPDATE', target: 'Application #1248', details: 'Holat: done', ip: '192.168.1.35' },
  { id: '9', timestamp: '2026-04-03 13:40:17', actor: 'Admin', role: 'admin', action: 'DELETE', target: 'Template #45', details: 'Shablon o\'chirildi', ip: '192.168.1.10' },
  { id: '10', timestamp: '2026-04-03 13:35:52', actor: 'Rahimova M.', role: 'kassir', action: 'EXPORT', target: 'Report', details: 'Smena hisoboti export', ip: '192.168.1.30' },
  { id: '11', timestamp: '2026-04-03 13:28:03', actor: 'Mirzayeva G.', role: 'patient', action: 'LOGIN', target: 'Session', details: 'Mini-app orqali kirdi', ip: '10.0.0.22' },
  { id: '12', timestamp: '2026-04-03 13:20:18', actor: 'Admin', role: 'admin', action: 'UPDATE', target: 'SystemSetting', details: 'max_upload_mb: 10 → 20', ip: '192.168.1.10' },
  { id: '13', timestamp: '2026-04-03 13:15:44', actor: 'Dr. Aliyeva', role: 'doctor', action: 'VIEW', target: 'EMR #567', details: 'Tibbiy karta ko\'rildi', ip: '192.168.1.82' },
  { id: '14', timestamp: '2026-04-03 13:08:31', actor: 'Ergashev B.', role: 'specialist', action: 'CREATE', target: 'Conclusion #888', details: 'Mutaxassis xulosa', ip: '192.168.1.60' },
  { id: '15', timestamp: '2026-04-03 13:00:55', actor: 'Nazarov O.', role: 'patient', action: 'LOGOUT', target: 'Session', details: 'Sessiya tugadi', ip: '10.0.0.18' },
];

export function WebAdminAuditScreen() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('Barchasi');
  const [period, setPeriod] = useState('Bugun');

  const filtered = MOCK.filter(a =>
    (actionFilter === 'Barchasi' || a.action === actionFilter) &&
    (a.actor.toLowerCase().includes(search.toLowerCase()) || a.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <WebPlatformLayout title="Audit log" subtitle="Barcha tizim harakatlar tarixi">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['Bugun', 'Hafta', 'Oy'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{p}</button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
            {ACTIONS.map(a => <option key={a}>{a}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"><Download className="w-4 h-4" /> Export</button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead><tr className="border-b border-slate-800">
                {['Vaqt', 'Foydalanuvchi', 'Rol', 'Amal', 'Maqsad', 'Tafsilotlar', 'IP'].map(h => (
                  <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-slate-500 text-xs font-mono">{a.timestamp}</td>
                    <td className="px-5 py-3 text-white text-sm font-medium">{a.actor}</td>
                    <td className="px-5 py-3"><span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{a.role}</span></td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[a.action]}`}>{a.action}</span></td>
                    <td className="px-5 py-3 text-indigo-400 text-sm">{a.target}</td>
                    <td className="px-5 py-3 text-slate-400 text-sm max-w-[200px] truncate">{a.details}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs font-mono">{a.ip}</td>
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
