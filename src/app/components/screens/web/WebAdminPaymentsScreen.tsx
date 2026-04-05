import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Banknote, TrendingUp, ArrowUpRight, Download, CreditCard, Wallet, RotateCcw } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DAILY = [
  { day: 'Dush', amount: 32.5 }, { day: 'Sesh', amount: 41.2 }, { day: 'Chor', amount: 28.8 },
  { day: 'Pay', amount: 48.6 }, { day: 'Jum', amount: 45.2 }, { day: 'Shan', amount: 35.1 }, { day: 'Yak', amount: 18.3 },
];
const METHODS = [
  { name: 'Payme', value: 35, color: '#06b6d4' }, { name: 'Click', value: 22, color: '#8b5cf6' },
  { name: 'Naqd', value: 20, color: '#22c55e' }, { name: 'Karta', value: 15, color: '#3b82f6' },
  { name: 'Uzum', value: 8, color: '#f59e0b' },
];
const PAYMENTS = [
  { id: 1, date: '2026-04-03 14:35', patient: 'Karimov Aziz', app: '#1256', amount: 450000, method: 'Naqd', status: 'Qabul qilindi' },
  { id: 2, date: '2026-04-03 14:22', patient: 'Xasanova Nilufar', app: '#1255', amount: 85000, method: 'Payme', status: 'Qabul qilindi' },
  { id: 3, date: '2026-04-03 14:10', patient: 'Rahimov Bobur', app: '#1254', amount: 200000, method: 'Click', status: 'Qabul qilindi' },
  { id: 4, date: '2026-04-03 13:55', patient: 'Toshmatova D.', app: '#1253', amount: 150000, method: 'Karta', status: 'Qabul qilindi' },
  { id: 5, date: '2026-04-03 13:40', patient: 'Abdullayev S.', app: '#1252', amount: 550000, method: 'Payme', status: 'Qabul qilindi' },
  { id: 6, date: '2026-04-03 13:28', patient: 'Mirzayeva G.', app: '#1251', amount: 120000, method: 'Uzum', status: 'Qabul qilindi' },
  { id: 7, date: '2026-04-03 13:15', patient: 'Yusupov D.', app: '#1250', amount: 300000, method: 'Naqd', status: 'Qaytarildi' },
  { id: 8, date: '2026-04-03 13:00', patient: 'Sultanova K.', app: '#1249', amount: 450000, method: 'Payme', status: 'Qabul qilindi' },
];

const fmt = (n: number) => n.toLocaleString() + " so'm";

export function WebAdminPaymentsScreen() {
  const [period, setPeriod] = useState('Hafta');
  const kpis = [
    { label: 'Jami daromad', value: '249.7M', icon: Banknote, color: 'from-emerald-500 to-green-600', change: '+12%' },
    { label: 'Naqd', value: '49.9M', icon: Wallet, color: 'from-green-500 to-emerald-600', change: '+5%' },
    { label: 'Onlayn', value: '162.3M', icon: CreditCard, color: 'from-blue-500 to-indigo-600', change: '+18%' },
    { label: 'Qaytarilgan', value: '2.1M', icon: RotateCcw, color: 'from-red-500 to-rose-600', change: '-3%' },
  ];

  return (
    <WebPlatformLayout title="To'lovlar hisoboti" subtitle="Moliyaviy statistika va hisobotlar">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['Bugun', 'Hafta', 'Oy'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{p}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"><Download className="w-4 h-4" /> Export</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}><k.icon className="w-5 h-5 text-white" /></div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${k.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}><ArrowUpRight className="w-3 h-3" />{k.change}</span>
              </div>
              <p className="text-white text-xl font-bold">{k.value}</p>
              <p className="text-slate-500 text-xs mt-1">{k.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Kunlik daromad</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={DAILY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v + 'M'} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => v + 'M so\'m'} />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">To'lov usullari</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart><Pie data={METHODS} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" stroke="none">
                {METHODS.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie></PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">{METHODS.map(m => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400"><div className="w-2 h-2 rounded-full" style={{ background: m.color }} />{m.name}</span>
                <span className="text-white font-medium">{m.value}%</span>
              </div>
            ))}</div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4">Oxirgi to'lovlar</h3>
          <div className="overflow-x-auto"><table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-slate-800">
              {['Sana', 'Bemor', 'Ariza', 'Summa', 'Usul', 'Holat'].map(h => <th key={h} className="text-left text-slate-500 text-xs font-medium pb-3 pr-4">{h}</th>)}
            </tr></thead>
            <tbody>{PAYMENTS.map((p, i) => (
              <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.03 }}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pr-4 text-slate-400 text-sm">{p.date}</td>
                <td className="py-3 pr-4 text-white text-sm font-medium">{p.patient}</td>
                <td className="py-3 pr-4 text-indigo-400 text-sm">{p.app}</td>
                <td className="py-3 pr-4 text-white text-sm font-medium">{fmt(p.amount)}</td>
                <td className="py-3 pr-4"><span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{p.method}</span></td>
                <td className="py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'Qaytarildi' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{p.status}</span></td>
              </motion.tr>
            ))}</tbody>
          </table></div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
