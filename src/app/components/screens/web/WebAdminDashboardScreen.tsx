import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, FileText, Banknote, Activity, ArrowUpRight, TrendingUp, Server, Database, Wifi, HardDrive } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const WEEK = [
  { day: 'Dush', arizalar: 45, daromad: 12.5 }, { day: 'Sesh', arizalar: 52, daromad: 15.2 },
  { day: 'Chor', arizalar: 38, daromad: 10.8 }, { day: 'Pay', arizalar: 61, daromad: 18.3 },
  { day: 'Jum', arizalar: 58, daromad: 16.7 }, { day: 'Shan', arizalar: 42, daromad: 11.5 },
  { day: 'Yak', arizalar: 28, daromad: 8.2 },
];
const SERVICES = [
  { name: 'AI+Radiolog', value: 35, color: '#6366f1' }, { name: 'Faqat radiolog', value: 25, color: '#06b6d4' },
  { name: 'Rad+Mutaxassis', value: 20, color: '#8b5cf6' }, { name: 'Konsultatsiya', value: 12, color: '#f59e0b' },
  { name: 'Uyga chaqirish', value: 8, color: '#22c55e' },
];
const ACTIVITY = [
  { time: '14:35', user: 'Karimov A.', role: 'Operator', action: 'Ariza yaratildi #1256', type: 'create' },
  { time: '14:28', user: 'Dr. Rahimov', role: 'Shifokor', action: 'Xulosa yozildi #1254', type: 'update' },
  { time: '14:20', user: 'Toshmatova D.', role: 'Kassir', action: 'To\'lov qabul #1253 - 450,000', type: 'payment' },
  { time: '14:15', user: 'Admin', role: 'Admin', action: 'Foydalanuvchi roli o\'zgardi', type: 'update' },
  { time: '14:08', user: 'Xasanova N.', role: 'Radiolog', action: 'Xulosa tasdiqlandi #1251', type: 'update' },
  { time: '14:02', user: 'Abdullayev S.', role: 'Bemor', action: 'Yangi ariza #1255', type: 'create' },
  { time: '13:55', user: 'Dr. Mirza', role: 'Shifokor', action: 'Retsept yozildi #1250', type: 'create' },
  { time: '13:48', user: 'Operator-2', role: 'Operator', action: 'Ariza holati: Bajarildi #1248', type: 'update' },
];
const HEALTH = [
  { name: 'API Server', status: 'ok', latency: '12ms' }, { name: 'PostgreSQL', status: 'ok', latency: '3ms' },
  { name: 'Redis Cache', status: 'ok', latency: '1ms' }, { name: 'S3 Storage', status: 'ok', latency: '45ms' },
];

export function WebAdminDashboardScreen() {
  const kpis = [
    { label: 'Jami foydalanuvchilar', value: '2,847', sub: '+34 bu hafta', icon: Users, color: 'from-indigo-500 to-blue-600', change: '+3.2%' },
    { label: 'Bugungi arizalar', value: '156', sub: '12 ta kutilmoqda', icon: FileText, color: 'from-emerald-500 to-green-600', change: '+8.5%' },
    { label: 'Bugungi daromad', value: '45.2M', sub: "so'm", icon: Banknote, color: 'from-violet-500 to-purple-600', change: '+12.3%' },
    { label: 'API uptime', value: '99.97%', sub: 'Oxirgi 30 kun', icon: Activity, color: 'from-cyan-500 to-teal-600', change: '' },
  ];

  return (
    <WebPlatformLayout title="Admin Dashboard" subtitle="Tizim umumiy ko'rinishi va statistika">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}><k.icon className="w-5 h-5 text-white" /></div>
                {k.change && <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-medium"><ArrowUpRight className="w-3 h-3" />{k.change}</span>}
              </div>
              <p className="text-white text-2xl font-bold">{k.value}</p>
              <p className="text-slate-500 text-xs mt-1">{k.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Haftalik trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={WEEK}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="arizalar" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="Arizalar" />
                <Area type="monotone" dataKey="daromad" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} name="Daromad (M)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Xizmat turlari</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={SERVICES} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                {SERVICES.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => v + '%'} /></PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">{SERVICES.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400"><div className="w-2 h-2 rounded-full" style={{ background: s.color }} />{s.name}</span>
                <span className="text-white font-medium">{s.value}%</span>
              </div>
            ))}</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Oxirgi faollik</h3>
            <div className="space-y-0">
              {ACTIVITY.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.03 }}
                  className="flex items-center gap-3 py-2.5 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-600 text-xs w-12 shrink-0">{a.time}</span>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.type === 'create' ? 'bg-emerald-400' : a.type === 'payment' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                  <span className="text-white text-sm font-medium w-28 shrink-0">{a.user}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 shrink-0">{a.role}</span>
                  <span className="text-slate-400 text-sm truncate">{a.action}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Tizim holati</h3>
            <div className="space-y-3">
              {HEALTH.map(h => (
                <div key={h.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm">{h.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 text-xs font-medium">OK</span>
                    <span className="text-slate-500 text-xs">{h.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
