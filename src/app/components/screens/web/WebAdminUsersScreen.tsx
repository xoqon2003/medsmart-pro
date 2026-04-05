import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Download, Users, Shield, Ban, CheckCircle, X, ChevronRight } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import type { UserRole } from '../../../types';

const ROLES: UserRole[] = ['admin', 'doctor', 'radiolog', 'specialist', 'operator', 'kassir', 'patient'];
const ROLE_BADGE: Record<string, string> = { admin: 'bg-rose-500/10 text-rose-400', doctor: 'bg-blue-500/10 text-blue-400', radiolog: 'bg-emerald-500/10 text-emerald-400', specialist: 'bg-purple-500/10 text-purple-400', operator: 'bg-violet-500/10 text-violet-400', kassir: 'bg-amber-500/10 text-amber-400', patient: 'bg-indigo-500/10 text-indigo-400' };
const ROLE_LABELS: Record<string, string> = { admin: 'Admin', doctor: 'Shifokor', radiolog: 'Radiolog', specialist: 'Mutaxassis', operator: 'Operator', kassir: 'Kassir', patient: 'Bemor' };

const MOCK = [
  { id: '1', name: 'Karimov Aziz Baxtiyor o\'g\'li', phone: '+998901234567', email: 'aziz@mail.uz', role: 'admin' as UserRole, platform: 'web', lastLogin: '2026-04-03 14:30', isActive: true },
  { id: '2', name: 'Dr. Rahimov Sardor', phone: '+998902345678', email: 'rahimov@med.uz', role: 'doctor' as UserRole, platform: 'web', lastLogin: '2026-04-03 14:15', isActive: true },
  { id: '3', name: 'Xasanova Nilufar', phone: '+998903456789', email: 'nilufar@med.uz', role: 'radiolog' as UserRole, platform: 'web', lastLogin: '2026-04-03 13:45', isActive: true },
  { id: '4', name: 'Toshmatov Bobur', phone: '+998904567890', email: null, role: 'patient' as UserRole, platform: 'mini-app', lastLogin: '2026-04-03 12:30', isActive: true },
  { id: '5', name: 'Abdullayev Farhod', phone: '+998905678901', email: 'farhod@med.uz', role: 'operator' as UserRole, platform: 'web', lastLogin: '2026-04-03 14:00', isActive: true },
  { id: '6', name: 'Mirzayeva Gulnora', phone: '+998906789012', email: null, role: 'patient' as UserRole, platform: 'mini-app', lastLogin: '2026-04-02 18:20', isActive: true },
  { id: '7', name: 'Rahimova Mohira', phone: '+998907890123', email: 'mohira@med.uz', role: 'kassir' as UserRole, platform: 'web', lastLogin: '2026-04-03 08:00', isActive: true },
  { id: '8', name: 'Dr. Ergashev Baxtiyor', phone: '+998908901234', email: 'ergashev@med.uz', role: 'specialist' as UserRole, platform: 'web', lastLogin: '2026-04-03 11:30', isActive: true },
  { id: '9', name: 'Umarov Jasur', phone: '+998909012345', email: null, role: 'patient' as UserRole, platform: 'mini-app', lastLogin: '2026-04-01 09:15', isActive: false },
  { id: '10', name: 'Dr. Aliyeva Malika', phone: '+998900123456', email: 'aliyeva@med.uz', role: 'doctor' as UserRole, platform: 'web', lastLogin: '2026-04-03 13:00', isActive: true },
  { id: '11', name: 'Nazarov Otabek', phone: '+998911234567', email: null, role: 'patient' as UserRole, platform: 'mini-app', lastLogin: '2026-03-28 16:45', isActive: true },
  { id: '12', name: 'Dr. Ismoilov Nodir', phone: '+998912345678', email: 'ismoilov@med.uz', role: 'radiolog' as UserRole, platform: 'web', lastLogin: '2026-04-03 10:20', isActive: true },
  { id: '13', name: 'Qosimova Shahnoza', phone: '+998913456789', email: 'shahnoza@med.uz', role: 'operator' as UserRole, platform: 'web', lastLogin: '2026-04-02 14:10', isActive: true },
  { id: '14', name: 'Yusupov Doniyor', phone: '+998914567890', email: null, role: 'patient' as UserRole, platform: 'mini-app', lastLogin: '2026-04-03 07:30', isActive: true },
  { id: '15', name: 'Sultanova Kamola', phone: '+998915678901', email: null, role: 'patient' as UserRole, platform: 'mini-app', lastLogin: '2026-03-25 11:00', isActive: false },
];

export function WebAdminUsersScreen() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Barchasi');
  const [statusFilter, setStatusFilter] = useState('Barchasi');
  const [drawer, setDrawer] = useState<typeof MOCK[0] | null>(null);

  const filtered = MOCK.filter(u =>
    (roleFilter === 'Barchasi' || u.role === roleFilter) &&
    (statusFilter === 'Barchasi' || (statusFilter === 'Faol' ? u.isActive : !u.isActive)) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search) || u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <WebPlatformLayout title="Foydalanuvchilar" subtitle="Barcha foydalanuvchilar boshqaruvi">
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism, telefon yoki email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
            <option>Barchasi</option>{ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none">
            <option>Barchasi</option><option>Faol</option><option>Bloklangan</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"><Download className="w-4 h-4" /> Export</button>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead><tr className="border-b border-slate-800">
                {['Foydalanuvchi', 'Telefon', 'Email', 'Rol', 'Platforma', 'Oxirgi kirish', 'Holat', ''].map(h => (
                  <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    onClick={() => setDrawer(u)} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                        </div>
                        <span className="text-white text-sm font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-300 text-sm">{u.phone}</td>
                    <td className="px-5 py-3 text-slate-400 text-sm">{u.email || '-'}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.platform === 'web' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>{u.platform}</span></td>
                    <td className="px-5 py-3 text-slate-400 text-sm">{u.lastLogin}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{u.isActive ? 'Faol' : 'Bloklangan'}</span></td>
                    <td className="px-5 py-3"><ChevronRight className="w-4 h-4 text-slate-600" /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 text-xs">{filtered.length} ta foydalanuvchi</span>
          </div>
        </motion.div>

        <AnimatePresence>
          {drawer && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end" onClick={() => setDrawer(null)}>
              <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', damping: 30 }}
                onClick={e => e.stopPropagation()} className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-semibold">Foydalanuvchi profili</h3>
                    <button onClick={() => setDrawer(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">{drawer.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{drawer.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_BADGE[drawer.role]}`}>{ROLE_LABELS[drawer.role]}</span>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    {[
                      { label: 'Telefon', value: drawer.phone },
                      { label: 'Email', value: drawer.email || 'Ko\'rsatilmagan' },
                      { label: 'Platforma', value: drawer.platform },
                      { label: 'Oxirgi kirish', value: drawer.lastLogin },
                      { label: 'Holat', value: drawer.isActive ? 'Faol' : 'Bloklangan' },
                    ].map(f => (
                      <div key={f.label} className="flex justify-between">
                        <span className="text-slate-500 text-sm">{f.label}</span>
                        <span className="text-white text-sm">{f.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <select defaultValue={drawer.role} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none">
                      {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">Rolni o'zgartirish</button>
                      <button className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${drawer.isActive ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'}`}>
                        {drawer.isActive ? 'Bloklash' : 'Ochish'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WebPlatformLayout>
  );
}
