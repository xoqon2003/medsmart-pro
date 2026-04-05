import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, FileText, Star, Banknote, TrendingUp, ArrowUpRight } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const MONTHLY = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, bemorlar: Math.floor(Math.random() * 8 + 2), xulosalar: Math.floor(Math.random() * 7 + 1) }));
const SERVICES = [
  { name: 'Konsultatsiya', value: 40, color: '#6366f1' }, { name: 'Takroriy qabul', value: 30, color: '#06b6d4' },
  { name: 'Xulosa', value: 20, color: '#8b5cf6' }, { name: 'Boshqa', value: 10, color: '#f59e0b' },
];
const WEEKLY_LOAD = [{ d: 'Dush', v: 8 }, { d: 'Sesh', v: 12 }, { d: 'Chor', v: 6 }, { d: 'Pay', v: 10 }, { d: 'Jum', v: 9 }, { d: 'Shan', v: 5 }, { d: 'Yak', v: 0 }];

export function WebDocStatisticsScreen() {
  const [period, setPeriod] = useState('Bu oy');
  const kpis = [
    { label: 'Bu oy bemorlar', value: 45, icon: Users, color: 'from-blue-500 to-indigo-600', change: '+8', prev: 37 },
    { label: 'Xulosalar', value: 42, icon: FileText, color: 'from-emerald-500 to-green-600', change: '+6', prev: 36 },
    { label: 'O\'rtacha reyting', value: '4.8', icon: Star, color: 'from-amber-500 to-orange-600', change: '+0.1', prev: 4.7 },
    { label: 'Daromad', value: '12.5M', icon: Banknote, color: 'from-violet-500 to-purple-600', change: '+15%', prev: 10.8 },
  ];

  return (
    <WebPlatformLayout title="Statistika" subtitle="Shaxsiy ko'rsatkichlar va tahlil">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['Bu hafta', 'Bu oy', '3 oy'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{p}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}><k.icon className="w-5 h-5 text-white" /></div>
                <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-medium"><ArrowUpRight className="w-3 h-3" />{k.change}</span>
              </div>
              <p className="text-white text-2xl font-bold">{k.value}</p>
              <p className="text-slate-500 text-xs mt-1">{k.label}</p>
              <p className="text-slate-600 text-xs mt-0.5">O'tgan oy: {k.prev}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">30 kunlik trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={MONTHLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="bemorlar" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="Bemorlar" />
                <Area type="monotone" dataKey="xulosalar" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} name="Xulosalar" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Xizmat turlari</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart><Pie data={SERVICES} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" stroke="none">
                {SERVICES.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie></PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">{SERVICES.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400"><div className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}</span>
                <span className="text-white font-medium">{s.value}%</span>
              </div>
            ))}</div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white text-sm font-semibold mb-4">Haftalik ish yuklamasi</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY_LOAD}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="d" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="v" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Bemorlar" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
