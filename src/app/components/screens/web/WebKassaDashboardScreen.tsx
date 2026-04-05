/**
 * Kassa Dashboard — Joriy smena, kunlik statistika
 */
import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Banknote, TrendingUp, CreditCard, Wallet, Clock,
  ArrowUpRight, ArrowDownRight, DollarSign, BarChart3,
  Play, Square, RefreshCw,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useApp } from '../../../store/appStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// ── Mock data ──

const HOURLY_DATA = [
  { hour: '08:00', naqd: 1200000, karta: 800000, onlayn: 600000 },
  { hour: '09:00', naqd: 2400000, karta: 1500000, onlayn: 1200000 },
  { hour: '10:00', naqd: 3100000, karta: 2200000, onlayn: 1800000 },
  { hour: '11:00', naqd: 2800000, karta: 1900000, onlayn: 2100000 },
  { hour: '12:00', naqd: 1500000, karta: 1100000, onlayn: 900000 },
  { hour: '13:00', naqd: 2000000, karta: 1600000, onlayn: 1400000 },
  { hour: '14:00', naqd: 2600000, karta: 2000000, onlayn: 1700000 },
  { hour: '15:00', naqd: 1800000, karta: 1300000, onlayn: 1100000 },
];

const PAYMENT_METHOD_DATA = [
  { name: 'Naqd', value: 18400000, color: '#22c55e' },
  { name: 'Karta', value: 12400000, color: '#3b82f6' },
  { name: 'Payme', value: 5800000, color: '#06b6d4' },
  { name: 'Click', value: 3200000, color: '#8b5cf6' },
  { name: 'Uzum', value: 2600000, color: '#f59e0b' },
];

const RECENT_PAYMENTS = [
  { id: 1, time: '14:35', patient: 'Karimov Aziz', service: 'MRT bosh', amount: 450000, method: 'Naqd', status: 'qabul' },
  { id: 2, time: '14:22', patient: 'Xasanova Nilufar', service: 'Qon tahlili', amount: 85000, method: 'Karta', status: 'qabul' },
  { id: 3, time: '14:10', patient: 'Rahimov Bobur', service: 'USG qorin', amount: 200000, method: 'Payme', status: 'qabul' },
  { id: 4, time: '13:55', patient: 'Toshmatova Dilfuza', service: 'Konsultatsiya', amount: 150000, method: 'Naqd', status: 'qabul' },
  { id: 5, time: '13:40', patient: 'Abdullayev Sardor', service: 'MSKT ko\'krak', amount: 550000, method: 'Click', status: 'qabul' },
  { id: 6, time: '13:28', patient: 'Mirzayeva Gulnora', service: 'Rentgen', amount: 120000, method: 'Uzum', status: 'qabul' },
];

const fmt = (n: number) => {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return n.toLocaleString();
};

export function WebKassaDashboardScreen() {
  const { navigate } = useApp();
  const [shiftOpen] = useState(true);

  const kpis = [
    { label: 'Smena jami', value: '42.4M', sub: '56 ta to\'lov', icon: Banknote, color: 'from-emerald-500 to-green-600', change: '+12%' },
    { label: 'Naqd', value: '18.4M', sub: '24 ta to\'lov', icon: Wallet, color: 'from-green-500 to-emerald-600', change: '+8%' },
    { label: 'Karta/Onlayn', value: '24.0M', sub: '32 ta to\'lov', icon: CreditCard, color: 'from-blue-500 to-indigo-600', change: '+15%' },
    { label: 'Smena vaqti', value: '6s 35d', sub: 'Ochilgan: 08:00', icon: Clock, color: 'from-violet-500 to-purple-600' },
  ];

  return (
    <WebPlatformLayout title="Kassa Dashboard" subtitle="Joriy smena va kunlik statistika">
      <div className="p-6 space-y-6">

        {/* Shift status bar */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Smena ochiq</span>
            <span className="text-slate-500 text-sm">|</span>
            <span className="text-slate-400 text-sm">Kassir: Rahimova Mohira</span>
            <span className="text-slate-500 text-sm">|</span>
            <span className="text-slate-400 text-sm">Boshlang'ich: 500,000 so'm</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('web_kassa_payment')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">
              <Play className="w-3 h-3" /> To'lov qabul
            </button>
            <button onClick={() => navigate('web_kassa_shift_report')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium transition-colors border border-red-500/20">
              <Square className="w-3 h-3" /> Smenani yopish
            </button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
                {kpi.change && (
                  <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-medium">
                    <ArrowUpRight className="w-3 h-3" />{kpi.change}
                  </span>
                )}
              </div>
              <p className="text-white text-xl font-bold">{kpi.value}</p>
              <p className="text-slate-500 text-xs mt-1">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Hourly chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Soatlik daromad</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={HOURLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => fmt(v)} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#fff' }} formatter={(v: number) => v.toLocaleString() + " so'm"} />
                <Bar dataKey="naqd" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} name="Naqd" />
                <Bar dataKey="karta" stackId="a" fill="#3b82f6" name="Karta" />
                <Bar dataKey="onlayn" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Onlayn" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Payment methods pie */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">To'lov usullari</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={PAYMENT_METHOD_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" stroke="none">
                  {PAYMENT_METHOD_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => fmt(v) + " so'm"} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {PAYMENT_METHOD_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </span>
                  <span className="text-white font-medium">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent payments */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-semibold">Oxirgi to'lovlar</h3>
            <button onClick={() => navigate('web_kassa_history')}
              className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors">Barchasini ko'rish →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Vaqt', 'Bemor', 'Xizmat', 'Summa', 'Usul', 'Holat'].map(h => (
                    <th key={h} className="text-left text-slate-500 text-xs font-medium pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_PAYMENTS.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.04 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4 text-slate-400 text-sm">{p.time}</td>
                    <td className="py-3 pr-4 text-white text-sm font-medium">{p.patient}</td>
                    <td className="py-3 pr-4 text-slate-300 text-sm">{p.service}</td>
                    <td className="py-3 pr-4 text-white text-sm font-medium">{p.amount.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.method === 'Naqd' ? 'bg-emerald-500/10 text-emerald-400' :
                        p.method === 'Karta' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-violet-500/10 text-violet-400'
                      }`}>{p.method}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Qabul qilindi</span>
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
