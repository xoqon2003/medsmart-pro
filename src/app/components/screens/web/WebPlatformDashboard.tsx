/**
 * MedSmartPro — Web Platform Dashboard
 * Admin / Operator / Kassir uchun desktop dashboard
 * KPI kartalar · Grafik · Jadval · Real-time stats
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, Users, FileText, Banknote,
  Clock, CheckCircle2, AlertCircle, XCircle, ArrowUpRight,
  MoreHorizontal, Download, RefreshCw, Eye, ChevronRight,
  Activity, Stethoscope, CreditCard, Wifi, Zap,
  Calendar, Filter, BarChart2,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useApp } from '../../../store/appStore';
// TODO: Real API dan olish — hozircha seed data
import { mockApplications, mockUsers, mockKassaTolovlar } from '../../../data/mockData';

// ── Mock grafik ma'lumotlari ────────────────────────────────────────────────

const WEEK_DATA = [
  { kun: 'Du', arizalar: 12, tolovlar: 1850000, bemorlar: 10 },
  { kun: 'Se', arizalar: 19, tolovlar: 2340000, bemorlar: 17 },
  { kun: 'Ch', arizalar: 15, tolovlar: 1920000, bemorlar: 14 },
  { kun: 'Pa', arizalar: 22, tolovlar: 3100000, bemorlar: 20 },
  { kun: 'Ju', arizalar: 28, tolovlar: 3850000, bemorlar: 25 },
  { kun: 'Sh', arizalar: 18, tolovlar: 2200000, bemorlar: 16 },
  { kun: 'Ya', arizalar: 9,  tolovlar: 1100000, bemorlar: 8  },
];

const MONTH_DATA = Array.from({ length: 30 }, (_, i) => ({
  kun: `${i + 1}`,
  arizalar: Math.floor(10 + Math.random() * 25),
  tolovlar: Math.floor(1000000 + Math.random() * 3000000),
  bemorlar: Math.floor(8 + Math.random() * 20),
}));

const SERVICE_DATA = [
  { name: 'AI + Radiolog', value: 42, color: '#6366f1' },
  { name: 'Faqat Radiolog', value: 28, color: '#06b6d4' },
  { name: 'Rad + Mutaxassis', value: 18, color: '#10b981' },
  { name: 'Konsultatsiya', value: 8,  color: '#f59e0b' },
  { name: 'Uyga chaqirish', value: 4,  color: '#ef4444' },
];

const STATUS_DATA = [
  { name: 'Yangi',     value: 14, color: '#3b82f6' },
  { name: 'Jarayonda', value: 31, color: '#8b5cf6' },
  { name: 'Bajarildi', value: 48, color: '#10b981' },
  { name: 'Bekor',     value: 7,  color: '#ef4444' },
];

const fmt = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
};
const fmtSum = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

// ── KPI Karta ───────────────────────────────────────────────────────────────

interface KpiKartaProps {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}

function KpiKarta({ label, value, change, icon: Icon, color, sub }: KpiKartaProps) {
  const positive = change >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
          positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white text-2xl font-bold mb-1">{value}</p>
      {sub && <p className="text-slate-600 text-xs">{sub}</p>}
    </motion.div>
  );
}

// ── Tooltip customlash ──────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300 capitalize">{p.name}:</span>
          <span className="text-white font-medium">
            {p.name === 'tolovlar' ? fmtSum(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Asosiy Dashboard ────────────────────────────────────────────────────────

type Period = 'bugun' | 'hafta' | 'oy';

export function WebPlatformDashboard() {
  const { applications, currentUser, navigate, setSelectedApplication } = useApp();
  const [period, setPeriod] = useState<Period>('hafta');
  const [chartType, setChartType] = useState<'arizalar' | 'tolovlar' | 'bemorlar'>('arizalar');

  const chartData = period === 'oy' ? MONTH_DATA : WEEK_DATA;

  // Statistika hisoblash
  const stats = useMemo(() => {
    const total = applications.length;
    const done = applications.filter(a => a.status === 'done').length;
    const pending = applications.filter(a => ['new', 'paid_pending', 'accepted'].includes(a.status)).length;
    const paid = mockKassaTolovlar.filter(t => t.holati === 'qabul_qilindi').reduce((s, t) => s + t.tolanganSumma, 0);
    const waiting = mockKassaTolovlar.filter(t => t.holati === 'kutilmoqda').length;
    return { total, done, pending, paid, waiting };
  }, [applications]);

  const kpiCards: KpiKartaProps[] = [
    { label: "Jami arizalar (bu oy)", value: `${stats.total + 123}`, change: 12,  icon: FileText,   color: 'bg-indigo-600',  sub: `${stats.pending} ta jarayonda` },
    { label: "Bugungi daromad",        value: fmtSum(stats.paid),    change: 8.5, icon: Banknote,   color: 'bg-emerald-600', sub: `${mockKassaTolovlar.length} ta to'lov` },
    { label: "Faol bemorlar",          value: `${mockUsers.filter(u=>u.role==='patient').length + 847}`, change: 5.2, icon: Users, color: 'bg-sky-600', sub: 'Jami ro\'yxatda' },
    { label: "Kutilayotgan to'lovlar", value: `${stats.waiting}`,    change: -3,  icon: Clock,      color: 'bg-amber-600',   sub: "Kassaga kelishi kerak" },
  ];

  // So'ngi arizalar
  const recentApps = useMemo(() =>
    [...applications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [applications]
  );

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      new:                 { label: 'Yangi',        cls: 'bg-blue-500/15 text-blue-400' },
      paid_pending:        { label: "To'lov kutilmoqda", cls: 'bg-yellow-500/15 text-yellow-400' },
      accepted:            { label: 'Qabul qilindi', cls: 'bg-cyan-500/15 text-cyan-400' },
      conclusion_writing:  { label: 'Xulosa yozilmoqda', cls: 'bg-purple-500/15 text-purple-400' },
      with_specialist:     { label: 'Mutaxassisda', cls: 'bg-violet-500/15 text-violet-400' },
      done:                { label: 'Bajarildi',    cls: 'bg-emerald-500/15 text-emerald-400' },
      failed:              { label: 'Muvaffaqiyatsiz', cls: 'bg-red-500/15 text-red-400' },
    };
    const b = map[status] ?? { label: status, cls: 'bg-slate-500/15 text-slate-400' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${b.cls}`}>{b.label}</span>;
  };

  return (
    <WebPlatformLayout
      title="Dashboard"
      subtitle={`Xush kelibsiz, ${currentUser?.fullName?.split(' ')[0] ?? 'Admin'}!`}
    >
      <div className="p-6 space-y-6">

        {/* ── KPI KARTALAR ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}>
              <KpiKarta {...kpi} />
            </motion.div>
          ))}
        </div>

        {/* ── GRAFIK + PIE ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Area/Bar grafik */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="xl:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold text-sm">Faollik grafigi</h3>
                <p className="text-slate-500 text-xs">Arizalar va daromad dinamikasi</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Period */}
                <div className="flex bg-slate-800 rounded-lg p-0.5">
                  {(['bugun', 'hafta', 'oy'] as Period[]).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                        period === p ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}>
                      {p === 'bugun' ? 'Bugun' : p === 'hafta' ? 'Hafta' : 'Oy'}
                    </button>
                  ))}
                </div>
                {/* Chart type */}
                <select value={chartType} onChange={e => setChartType(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                  <option value="arizalar">Arizalar</option>
                  <option value="tolovlar">To'lovlar</option>
                  <option value="bemorlar">Bemorlar</option>
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="kun" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => chartType === 'tolovlar' ? fmt(v) : v} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey={chartType} stroke="#6366f1" strokeWidth={2}
                  fill="url(#grad1)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie chart — xizmat turlari */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <h3 className="text-white font-semibold text-sm mb-1">Xizmat turlari</h3>
            <p className="text-slate-500 text-xs mb-4">Taqsimot (bu oy)</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={SERVICE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                  paddingAngle={3} dataKey="value">
                  {SERVICE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`, 'Ulush']}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
                  labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {SERVICE_DATA.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-slate-400 text-xs truncate">{item.name}</span>
                  </div>
                  <span className="text-slate-300 text-xs font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── JADVAL + QO'SHIMCHA ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* So'ngi arizalar jadvali */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="xl:col-span-2 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-white font-semibold text-sm">So'ngi arizalar</h3>
                <p className="text-slate-500 text-xs">Barcha holat va to'lovlar</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors">
                  <Filter className="w-3.5 h-3.5" /> Filtr
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
            </div>

            {/* Jadval sarlavha */}
            <div className="grid grid-cols-12 gap-3 px-5 py-2.5 border-b border-slate-800/60">
              {['ID / Sana', 'Bemor', 'Xizmat', 'Summa', 'Holat', ''].map((h, i) => (
                <div key={i} className={`text-slate-500 text-xs font-medium ${
                  i === 0 ? 'col-span-2' : i === 1 ? 'col-span-3' : i === 2 ? 'col-span-3' : i === 3 ? 'col-span-2' : i === 4 ? 'col-span-1' : 'col-span-1'
                }`}>{h}</div>
              ))}
            </div>

            {/* Qatorlar */}
            <div className="divide-y divide-slate-800/50">
              {recentApps.map((app, i) => (
                <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="grid grid-cols-12 gap-3 px-5 py-3.5 hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => { setSelectedApplication(app); navigate('operator_dashboard'); }}
                >
                  <div className="col-span-2">
                    <p className="text-indigo-400 text-xs font-mono">{app.arizaNumber}</p>
                    <p className="text-slate-600 text-xs">{new Date(app.createdAt).toLocaleDateString('uz-UZ', { day:'2-digit', month:'2-digit' })}</p>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-white text-xs">{app.patient?.fullName?.slice(0,1) ?? '?'}</span>
                    </div>
                    <p className="text-slate-300 text-xs truncate">{app.patient?.fullName ?? `Bemor #${app.patientId}`}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-slate-300 text-xs">{app.scanType} — {app.organ}</p>
                    <p className="text-slate-600 text-xs capitalize">{app.urgency === 'emergency' ? '🔴 Shoshilinch' : app.urgency === 'urgent' ? '🟡 Tezkor' : '🟢 Oddiy'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-emerald-400 text-xs font-medium">{fmt(app.price)} so'm</p>
                    <p className={`text-xs ${app.payment?.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {app.payment?.status === 'paid' ? "To'langan" : "Kutilmoqda"}
                    </p>
                  </div>
                  <div className="col-span-1 flex items-center">{statusBadge(app.status)}</div>
                  <div className="col-span-1 flex items-center justify-end">
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
              <p className="text-slate-600 text-xs">{applications.length} ta ariza ko'rsatilmoqda</p>
              <button onClick={() => navigate('operator_dashboard')}
                className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                Barchasini ko'rish <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* O'ng panel */}
          <div className="space-y-4">

            {/* Holat taqsimoti */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Holat taqsimoti</h3>
              <div className="space-y-3">
                {STATUS_DATA.map(item => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-xs">{item.name}</span>
                      <span className="text-slate-300 text-xs font-medium">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tezkor harakatlar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Tezkor harakatlar</h3>
              <div className="space-y-2">
                {[
                  { label: 'Operatorlar paneli',  screen: 'operator_dashboard'  as const, icon: Activity,    color: 'text-violet-400' },
                  { label: 'Kassir moduli',        screen: 'kassir_dashboard'    as const, icon: Banknote,    color: 'text-sky-400' },
                  { label: 'Admin panel',          screen: 'admin_dashboard'     as const, icon: BarChart2,   color: 'text-rose-400' },
                  { label: 'Bildirishnomalar',     screen: 'notifications'       as const, icon: Zap,         color: 'text-amber-400' },
                ].map(item => (
                  <button key={item.screen} onClick={() => navigate(item.screen)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-slate-300 text-sm group-hover:text-white transition-colors flex-1 text-left">{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tizim holati */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">Tizim holati</h3>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Barcha tizimlar ishlayapti
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'API Server',       ok: true  },
                  { label: 'Ma\'lumotlar bazasi', ok: true },
                  { label: 'Payme Gateway',    ok: true  },
                  { label: 'SMS (Eskiz)',      ok: true  },
                  { label: 'Fayl xizmati (R2)', ok: true },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">{s.label}</span>
                    <span className={`flex items-center gap-1 text-xs ${s.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                      {s.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {s.ok ? 'Aktiv' : 'Xato'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── BAR CHART — Haftalik to'lovlar ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold text-sm">To'lov usullari (hafta)</h3>
              <p className="text-slate-500 text-xs">Naqd · Karta · Onlayn taqsimoti</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors">
              <Download className="w-3.5 h-3.5" /> Hisobot
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEK_DATA.map(d => ({
              ...d,
              naqd:  Math.floor(d.tolovlar * 0.28),
              karta: Math.floor(d.tolovlar * 0.35),
              onlayn:Math.floor(d.tolovlar * 0.37),
            }))} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="kun" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v === 'naqd' ? 'Naqd' : v === 'karta' ? 'Karta' : 'Onlayn'}</span>} />
              <Bar dataKey="naqd"   fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="karta"  fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="onlayn" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </WebPlatformLayout>
  );
}
