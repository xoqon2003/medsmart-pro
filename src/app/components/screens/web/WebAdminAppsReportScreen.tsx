import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, TrendingUp, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const TREND = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, arizalar: Math.floor(Math.random() * 30 + 20), bajarilgan: Math.floor(Math.random() * 25 + 15) }));
const STATUS_DATA = [
  { name: 'Yangi', value: 34, color: '#6366f1' }, { name: 'Jarayonda', value: 42, color: '#f59e0b' },
  { name: 'Bajarildi', value: 142, color: '#22c55e' }, { name: 'Bekor', value: 16, color: '#ef4444' },
];
const SERVICE_DATA = [
  { name: 'AI+Rad', value: 85 }, { name: 'Radiolog', value: 62 }, { name: 'Rad+Mut', value: 45 },
  { name: 'Konsult', value: 28 }, { name: 'Uyga', value: 14 },
];

const FUNNEL = [
  { stage: 'Yaratilgan', count: 234, pct: 100, color: 'from-indigo-500 to-indigo-600' },
  { stage: 'To\'langan', count: 198, pct: 85, color: 'from-blue-500 to-blue-600' },
  { stage: 'Jarayonda', count: 156, pct: 67, color: 'from-cyan-500 to-cyan-600' },
  { stage: 'Bajarilgan', count: 142, pct: 61, color: 'from-emerald-500 to-emerald-600' },
];

export function WebAdminAppsReportScreen() {
  const [period, setPeriod] = useState('Oy');

  return (
    <WebPlatformLayout title="Arizalar hisoboti" subtitle="Arizalar statistikasi va tendensiyalar">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['Hafta', 'Oy', '3 Oy'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Funnel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4">Konversiya voronkasi</h3>
          <div className="flex items-center gap-2">
            {FUNNEL.map((f, i) => (
              <React.Fragment key={f.stage}>
                <div className="flex-1">
                  <div className={`bg-gradient-to-r ${f.color} rounded-xl p-4 text-center`}>
                    <p className="text-white text-2xl font-bold">{f.count}</p>
                    <p className="text-white/80 text-xs mt-1">{f.stage}</p>
                  </div>
                  <div className="text-center mt-1"><span className="text-slate-500 text-xs">{f.pct}%</span></div>
                </div>
                {i < FUNNEL.length - 1 && <ArrowRight className="w-5 h-5 text-slate-600 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Trend chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">30 kunlik trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="arizalar" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="Arizalar" />
                <Area type="monotone" dataKey="bajarilgan" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} name="Bajarilgan" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status pie */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Holat bo'yicha</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart><Pie data={STATUS_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" stroke="none">
                {STATUS_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie></PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">{STATUS_DATA.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400"><div className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}</span>
                <span className="text-white font-medium">{s.value}</span>
              </div>
            ))}</div>
          </motion.div>
        </div>

        {/* Service type bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4">Xizmat turlari bo'yicha</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SERVICE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Arizalar soni" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
