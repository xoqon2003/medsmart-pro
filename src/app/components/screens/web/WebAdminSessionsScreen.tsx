import React from 'react';
import { motion } from 'motion/react';
import { MonitorSmartphone, Globe, Smartphone, Monitor, Trash2 } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const MOCK = [
  { id: '1', user: 'Karimov A.', role: 'admin', platform: 'web', device: 'Chrome 124 / Windows 11', ip: '192.168.1.45', loginAt: '2026-04-03 08:15', lastActive: '2026-04-03 14:35' },
  { id: '2', user: 'Dr. Rahimov S.', role: 'doctor', platform: 'web', device: 'Firefox 125 / macOS', ip: '192.168.1.78', loginAt: '2026-04-03 09:00', lastActive: '2026-04-03 14:28' },
  { id: '3', user: 'Xasanova N.', role: 'radiolog', platform: 'web', device: 'Chrome 124 / Windows 10', ip: '192.168.1.55', loginAt: '2026-04-03 08:30', lastActive: '2026-04-03 14:08' },
  { id: '4', user: 'Toshmatov B.', role: 'patient', platform: 'mini-app', device: 'Telegram / Android 14', ip: '10.0.0.15', loginAt: '2026-04-03 12:30', lastActive: '2026-04-03 12:45' },
  { id: '5', user: 'Abdullayev F.', role: 'operator', platform: 'web', device: 'Edge 124 / Windows 11', ip: '192.168.1.35', loginAt: '2026-04-03 08:00', lastActive: '2026-04-03 14:02' },
  { id: '6', user: 'Mirzayeva G.', role: 'patient', platform: 'mini-app', device: 'Telegram / iOS 17', ip: '10.0.0.22', loginAt: '2026-04-03 13:28', lastActive: '2026-04-03 13:40' },
  { id: '7', user: 'Rahimova M.', role: 'kassir', platform: 'web', device: 'Chrome 124 / Windows 10', ip: '192.168.1.30', loginAt: '2026-04-03 08:00', lastActive: '2026-04-03 13:35' },
  { id: '8', user: 'Dr. Ergashev B.', role: 'specialist', platform: 'web', device: 'Safari 17 / macOS', ip: '192.168.1.60', loginAt: '2026-04-03 10:30', lastActive: '2026-04-03 13:08' },
  { id: '9', user: 'Dr. Aliyeva M.', role: 'doctor', platform: 'web', device: 'Chrome 124 / Windows 11', ip: '192.168.1.82', loginAt: '2026-04-03 09:15', lastActive: '2026-04-03 13:15' },
  { id: '10', user: 'Qosimova Sh.', role: 'operator', platform: 'web', device: 'Chrome 124 / Windows 10', ip: '192.168.1.36', loginAt: '2026-04-03 08:30', lastActive: '2026-04-03 12:50' },
  { id: '11', user: 'Yusupov D.', role: 'patient', platform: 'mini-app', device: 'Telegram / Android 13', ip: '10.0.0.33', loginAt: '2026-04-03 07:30', lastActive: '2026-04-03 08:15' },
  { id: '12', user: 'Dr. Ismoilov N.', role: 'radiolog', platform: 'web', device: 'Chrome 124 / Linux', ip: '192.168.1.88', loginAt: '2026-04-03 09:45', lastActive: '2026-04-03 12:30' },
];

const PLAT_BADGE: Record<string, string> = { web: 'bg-blue-500/10 text-blue-400', 'mini-app': 'bg-purple-500/10 text-purple-400', mobile: 'bg-green-500/10 text-green-400' };

export function WebAdminSessionsScreen() {
  const web = MOCK.filter(s => s.platform === 'web').length;
  const mini = MOCK.filter(s => s.platform === 'mini-app').length;

  const kpis = [
    { label: 'Jami faol', value: MOCK.length, icon: MonitorSmartphone, color: 'from-indigo-500 to-blue-600' },
    { label: 'Web', value: web, icon: Monitor, color: 'from-blue-500 to-cyan-600' },
    { label: 'Mini App', value: mini, icon: Smartphone, color: 'from-purple-500 to-violet-600' },
  ];

  return (
    <WebPlatformLayout title="Sessiyalar" subtitle="Faol foydalanuvchi sessiyalari">
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}><k.icon className="w-5 h-5 text-white" /></div>
              <div><p className="text-white text-xl font-bold">{k.value}</p><p className="text-slate-500 text-xs">{k.label}</p></div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead><tr className="border-b border-slate-800">
                {['Foydalanuvchi', 'Rol', 'Platforma', 'Qurilma', 'IP', 'Kirish vaqti', 'Oxirgi faollik', ''].map(h => (
                  <th key={h} className="text-left text-slate-500 text-xs font-medium px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {MOCK.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-white text-sm font-medium">{s.user}</td>
                    <td className="px-5 py-3"><span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{s.role}</span></td>
                    <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${PLAT_BADGE[s.platform]}`}>{s.platform}</span></td>
                    <td className="px-5 py-3 text-slate-400 text-sm">{s.device}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs font-mono">{s.ip}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{s.loginAt}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{s.lastActive}</td>
                    <td className="px-5 py-3">
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors" title="Sessiyani tugatish">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
