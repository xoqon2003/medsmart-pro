/**
 * WebAdminScreen — Admin paneli (Web Platform)
 * Foydalanuvchi boshqaruvi, statistika, tizim sozlamalari
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, ShieldCheck, Activity, TrendingUp,
  Plus, Search, MoreVertical, Edit2, Trash2,
  CheckCircle2, XCircle, Clock, BarChart3,
  ArrowUpRight, Cpu, Database, Globe,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

// ── Tiplar ───────────────────────────────────────────────────────────────────

type Role = 'admin' | 'operator' | 'kassir' | 'radiolog' | 'specialist' | 'doctor';
type UserStatus = 'active' | 'inactive' | 'blocked';

interface UserRow {
  id: string;
  ism: string;
  email: string;
  role: Role;
  klinika: string;
  status: UserStatus;
  royxatSana: string;
  oxirgiKirish: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const USERS: UserRow[] = [
  { id:'U-001', ism:'Rahimov Alisher Baxtiyorovich',   email:'admin@medsmart.uz',       role:'admin',      klinika:'MedSmartPro HQ',         status:'active',   royxatSana:'01.01.25', oxirgiKirish:'Bugun, 09:15' },
  { id:'U-002', ism:'Nazarova Zulfiya Hamidovna',       email:'operator@nuriolam.uz',    role:'operator',   klinika:'Nurli olam klinikasi',   status:'active',   royxatSana:'15.01.25', oxirgiKirish:'Bugun, 08:40' },
  { id:'U-003', ism:'Xoliqov Jasur Mirzo\'evich',       email:'kassir@nuriolam.uz',      role:'kassir',     klinika:'Nurli olam klinikasi',   status:'active',   royxatSana:'15.01.25', oxirgiKirish:'Bugun, 09:00' },
  { id:'U-004', ism:'Sotvoldiyev Behruz Umarovich',    email:'rad1@nuriolam.uz',        role:'radiolog',   klinika:'Nurli olam klinikasi',   status:'active',   royxatSana:'20.01.25', oxirgiKirish:'Kecha, 18:30' },
  { id:'U-005', ism:'Ergashev Mansur Tohirovich',       email:'rad2@nuriolam.uz',        role:'radiolog',   klinika:'Nurli olam klinikasi',   status:'active',   royxatSana:'20.01.25', oxirgiKirish:'Bugun, 08:55' },
  { id:'U-006', ism:'Tursunov Nurbek Salimovich',       email:'neuro@nuriolam.uz',       role:'specialist', klinika:'Nurli olam klinikasi',   status:'active',   royxatSana:'05.02.25', oxirgiKirish:'Bugun, 10:00' },
  { id:'U-007', ism:'Karimov Saidakbar Yusupovich',    email:'doctor@nuriolam.uz',      role:'doctor',     klinika:'Nurli olam klinikasi',   status:'active',   royxatSana:'05.02.25', oxirgiKirish:'Bugun, 09:45' },
  { id:'U-008', ism:'Mirzayeva Gulnora Baxtiyorovna',  email:'doctor2@nuriolam.uz',     role:'doctor',     klinika:'Nurli olam klinikasi',   status:'inactive', royxatSana:'10.02.25', oxirgiKirish:'3 kun oldin' },
  { id:'U-009', ism:'Usmonov Dilshod Qodirov',          email:'doctor3@meditsin.uz',     role:'doctor',     klinika:'Meditsin markazi',       status:'blocked',  royxatSana:'01.03.25', oxirgiKirish:'Blok qilingan' },
  { id:'U-010', ism:'Qodirov Ulugbek Normatovich',     email:'operator2@meditsin.uz',   role:'operator',   klinika:'Meditsin markazi',       status:'active',   royxatSana:'01.03.25', oxirgiKirish:'Bugun, 08:20' },
];

const ROLE_LABELS: Record<Role, { label: string; cls: string }> = {
  admin:      { label: 'Admin',       cls: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  operator:   { label: 'Operator',    cls: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
  kassir:     { label: 'Kassir',      cls: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
  radiolog:   { label: 'Radiolog',    cls: 'bg-violet-500/20 text-violet-400 border border-violet-500/30' },
  specialist: { label: 'Mutaxassis',  cls: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  doctor:     { label: 'Shifokor',    cls: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' },
};

// ── Tizim holati ma'lumotlari ─────────────────────────────────────────────────

const SYS_METRICS = [
  { label: 'CPU', value: 34, unit: '%', icon: Cpu,      color: 'text-blue-400',    bar: 'bg-blue-500' },
  { label: 'RAM', value: 62, unit: '%', icon: Database, color: 'text-violet-400',  bar: 'bg-violet-500' },
  { label: 'Disk',value: 48, unit: '%', icon: Database, color: 'text-emerald-400', bar: 'bg-emerald-500' },
  { label: 'API', value: 99.8,unit:'%', icon: Globe,    color: 'text-amber-400',   bar: 'bg-amber-500' },
];

// ── Komponentlar ─────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  const { label, cls } = ROLE_LABELS[role];
  return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${cls}`}>{label}</span>;
}

function StatusDot({ s }: { s: UserStatus }) {
  const cfg: Record<UserStatus, { label: string; dot: string; text: string }> = {
    active:   { label: 'Aktiv',       dot: 'bg-emerald-400', text: 'text-emerald-400' },
    inactive: { label: 'Nofaol',      dot: 'bg-slate-500',   text: 'text-slate-400'   },
    blocked:  { label: 'Bloklangan',  dot: 'bg-red-400',     text: 'text-red-400'     },
  };
  const { label, dot, text } = cfg[s];
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${text}`}>
      <span className={`w-2 h-2 rounded-full ${dot} ${s === 'active' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

// ── Foydalanuvchi qo'shish modali ─────────────────────────────────────────────

function AddUserModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ ism: '', email: '', role: 'operator', klinika: '' });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 16 }}
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl"
      >
        <h3 className="text-white font-semibold text-lg mb-5">Yangi foydalanuvchi</h3>
        <div className="space-y-3">
          {[
            { label: 'To\'liq ism',   key: 'ism',      placeholder: 'Familiya Ism Otasining ismi' },
            { label: 'Email',         key: 'email',    placeholder: 'example@klinika.uz' },
            { label: 'Klinika',       key: 'klinika',  placeholder: 'Klinika nomi' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">{label}</label>
              <input
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Rol</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500/50 transition-colors"
            >
              {Object.entries(ROLE_LABELS).map(([k, { label }]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
            Bekor
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            Saqlash
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Asosiy komponent ─────────────────────────────────────────────────────────

export function WebAdminScreen() {
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('');
  const [activeMenu, setMenu]     = useState<string | null>(null);
  const [showAddModal, setAddModal] = useState(false);
  const [activeTab, setTab]       = useState<'users' | 'system'>('users');

  const filtered = USERS.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search || u.ism.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  const activeCount   = USERS.filter(u => u.status === 'active').length;
  const inactiveCount = USERS.filter(u => u.status === 'inactive').length;
  const blockedCount  = USERS.filter(u => u.status === 'blocked').length;

  return (
    <WebPlatformLayout title="Admin paneli" subtitle="Foydalanuvchilar va tizim boshqaruvi">
      <div className="p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Jami foydalanuvchi', value: USERS.length, icon: Users,       color: 'bg-slate-800/60 border-slate-700/60', sub: 'Ro\'yxatda' },
            { label: 'Aktiv',              value: activeCount,   icon: CheckCircle2,color: 'bg-slate-800/60 border-slate-700/60', sub: 'Online' },
            { label: 'Nofaol',             value: inactiveCount, icon: Clock,       color: 'bg-slate-800/60 border-slate-700/60', sub: 'Kirmagani' },
            { label: 'Bloklangan',         value: blockedCount,  icon: XCircle,     color: 'bg-red-900/20 border-red-800/40',     sub: 'Taqiqlangan' },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <Icon className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl border border-slate-700/60 w-fit">
          {[
            { key: 'users',  label: 'Foydalanuvchilar', icon: Users    },
            { key: 'system', label: 'Tizim holati',      icon: Activity },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Ism yoki email qidirish…"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors" />
              </div>
              <RoleDropSel value={roleFilter} onChange={setRole} />
              <button onClick={() => setAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors ml-auto">
                <Plus className="w-3.5 h-3.5" /> FOYDALANUVCHI
              </button>
            </div>

            {/* Users table */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['ID','To\'liq ism','Email','Rol','Klinika','Holati','So\'nggi kirish','Amallar'].map(h => (
                        <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u, idx) => (
                      <motion.tr key={u.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 py-3 text-slate-500 text-xs">{u.id}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                              {u.ism.charAt(0)}
                            </div>
                            <span className="text-slate-200 text-xs font-medium">{u.ism}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-400 text-xs">{u.email}</td>
                        <td className="px-3 py-3"><RoleBadge role={u.role} /></td>
                        <td className="px-3 py-3 text-slate-400 text-xs">{u.klinika}</td>
                        <td className="px-3 py-3"><StatusDot s={u.status} /></td>
                        <td className="px-3 py-3 text-slate-400 text-xs">{u.oxirgiKirish}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-900/20 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="relative">
                              <button onClick={() => setMenu(activeMenu === u.id ? null : u.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                              <AnimatePresence>
                                {activeMenu === u.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.93, y: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.93, y: 4 }}
                                    transition={{ duration: 0.1 }}
                                    onMouseLeave={() => setMenu(null)}
                                    className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
                                    {['Tahrirlash','Parol tiklash', u.status === 'blocked' ? 'Blokni ochish' : 'Bloklash','O\'chirish'].map((lbl, i) => (
                                      <button key={lbl} onClick={() => setMenu(null)}
                                        className={`w-full text-left px-3 py-2 text-xs transition-colors
                                          ${i === 3 ? 'text-red-400 hover:bg-red-500/10' : i === 2 ? 'text-amber-400 hover:bg-amber-900/20' : 'text-slate-300 hover:bg-slate-800'}`}>
                                        {lbl}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-600 text-sm">Foydalanuvchi topilmadi</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Server metrics */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> Server resurslar
              </h3>
              <div className="space-y-4">
                {SYS_METRICS.map(({ label, value, unit, icon: Icon, color, bar }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Icon className={`w-3.5 h-3.5 ${color}`} /> {label}
                      </span>
                      <span className={`text-sm font-semibold ${color}`}>{value}{unit}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-2 rounded-full ${bar}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tizim statistikasi */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Bugungi statistika
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Jami so'rovlar",      value: '1,284',  change: '+8%',  up: true  },
                  { label: 'Yangi arizalar',       value: '41',     change: '+12%', up: true  },
                  { label: "To'lovlar soni",       value: '38',     change: '+5%',  up: true  },
                  { label: "Kunlik tushum",        value: '8.4 mln',change: '+15%', up: true  },
                  { label: 'API javob vaqti',      value: '142ms',  change: '-3ms', up: true  },
                  { label: 'Xato darajasi',        value: '0.02%',  change: '-0.01%',up: true },
                ].map(({ label, value, change, up }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                    <span className="text-slate-400 text-sm">{label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-semibold">{value}</span>
                      <span className={`text-xs flex items-center gap-0.5 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                        <ArrowUpRight className="w-3 h-3" /> {change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Klinikalar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 lg:col-span-2">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Klinikalar ro'yxati
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Nurli olam klinikasi', users: 8, arizalar: 41, status: 'active' },
                  { name: 'Meditsin markazi',     users: 5, arizalar: 18, status: 'active' },
                  { name: 'Shifobaxsh shifoxona', users: 3, arizalar: 7,  status: 'inactive' },
                ].map(k => (
                  <div key={k.name} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-slate-200 text-sm font-medium">{k.name}</p>
                      <span className={`w-2 h-2 rounded-full mt-1.5 ${k.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span><span className="text-white font-semibold">{k.users}</span> foydalanuvchi</span>
                      <span><span className="text-white font-semibold">{k.arizalar}</span> ariza/kun</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      <AnimatePresence>
        {showAddModal && <AddUserModal onClose={() => setAddModal(false)} />}
      </AnimatePresence>
    </WebPlatformLayout>
  );
}

// ── RoleDropSel ───────────────────────────────────────────────────────────────

function RoleDropSel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const opts = Object.entries(ROLE_LABELS).map(([k, { label }]) => ({ k, label }));
  const current = opts.find(o => o.k === value.toLowerCase())?.label;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all
          ${value ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
        {current || 'Rol'} <Users className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            onMouseLeave={() => setOpen(false)}
            className="absolute top-full mt-1 left-0 z-50 min-w-[140px] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            <button onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">Hammasi</button>
            {opts.map(({ k, label }) => (
              <button key={k} onClick={() => { onChange(k); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors
                  ${value === k ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-800'}`}>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
