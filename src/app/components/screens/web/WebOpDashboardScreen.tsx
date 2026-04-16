import React from 'react';
import { motion } from 'motion/react';
import { FileText, Clock, CheckCircle, AlertTriangle, ArrowUpRight, FilePlus, UserSearch, ListOrdered, BarChart3 } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useNavigation } from '../../../store/navigationContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WEEK = [{ d: 'Dush', v: 18 }, { d: 'Sesh', v: 24 }, { d: 'Chor', v: 15 }, { d: 'Pay', v: 28 }, { d: 'Jum', v: 22 }, { d: 'Shan', v: 14 }, { d: 'Yak', v: 8 }];
const RECENT = [
  { id: '#1256', patient: 'Karimov A.', service: 'MRT bosh', status: 'new', time: '14:35' },
  { id: '#1255', patient: 'Xasanova N.', service: 'Qon tahlili', status: 'paid_pending', time: '14:22' },
  { id: '#1254', patient: 'Rahimov B.', service: 'USG qorin', status: 'accepted', time: '14:10' },
  { id: '#1253', patient: 'Toshmatova D.', service: 'Konsultatsiya', status: 'done', time: '13:55' },
  { id: '#1252', patient: 'Abdullayev S.', service: 'MSKT', status: 'conclusion_writing', time: '13:40' },
  { id: '#1251', patient: 'Mirzayeva G.', service: 'Rentgen', status: 'done', time: '13:28' },
];
const ST_BADGE: Record<string, string> = { new: 'bg-indigo-500/10 text-indigo-400', paid_pending: 'bg-amber-500/10 text-amber-400', accepted: 'bg-blue-500/10 text-blue-400', conclusion_writing: 'bg-purple-500/10 text-purple-400', done: 'bg-emerald-500/10 text-emerald-400' };
const ST_LABEL: Record<string, string> = { new: 'Yangi', paid_pending: 'To\'lov kutilmoqda', accepted: 'Qabul qilindi', conclusion_writing: 'Xulosa', done: 'Bajarildi' };

export function WebOpDashboardScreen() {
  const { navigate } = useNavigation();
  const kpis = [
    { label: 'Yangi arizalar', value: 12, icon: FileText, color: 'from-indigo-500 to-blue-600', change: '+3' },
    { label: 'Jarayonda', value: 34, icon: Clock, color: 'from-amber-500 to-orange-600' },
    { label: 'Bugun bajarilgan', value: 28, icon: CheckCircle, color: 'from-emerald-500 to-green-600', change: '+5' },
    { label: 'Kutilayotgan to\'lov', value: 8, icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
  ];
  const actions = [
    { label: 'Yangi ariza', icon: FilePlus, screen: 'web_op_create_app' as const, color: 'from-indigo-500 to-blue-600' },
    { label: 'Bemor qidirish', icon: UserSearch, screen: 'web_op_patient_search' as const, color: 'from-emerald-500 to-teal-600' },
    { label: 'Navbat', icon: ListOrdered, screen: 'web_op_queue' as const, color: 'from-violet-500 to-purple-600' },
    { label: 'Hisobot', icon: BarChart3, screen: 'web_admin_apps_report' as const, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <WebPlatformLayout title="Operator Dashboard" subtitle="Arizalar boshqaruvi va monitoring">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center`}><k.icon className="w-5 h-5 text-white" /></div>
                {k.change && <span className="text-emerald-400 text-xs font-medium flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />{k.change}</span>}
              </div>
              <p className="text-white text-2xl font-bold">{k.value}</p>
              <p className="text-slate-500 text-xs mt-1">{k.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Haftalik arizalar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={WEEK}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="d" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="Arizalar" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Tezkor amallar</h3>
            <div className="grid grid-cols-2 gap-3">
              {actions.map(a => (
                <button key={a.label} onClick={() => navigate(a.screen)}
                  className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800 transition-colors text-left group">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center mb-2`}><a.icon className="w-4 h-4 text-white" /></div>
                  <span className="text-slate-300 text-xs font-medium group-hover:text-white">{a.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-sm font-semibold">Oxirgi arizalar</h3>
            <button onClick={() => navigate('web_op_applications')} className="text-indigo-400 text-xs hover:text-indigo-300">Barchasini ko'rish →</button>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[500px]">
            <thead><tr className="border-b border-slate-800">
              {['Ariza', 'Bemor', 'Xizmat', 'Holat', 'Vaqt'].map(h => <th key={h} className="text-left text-slate-500 text-xs font-medium pb-3 pr-4">{h}</th>)}
            </tr></thead>
            <tbody>{RECENT.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.03 }} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="py-2.5 pr-4 text-indigo-400 text-sm font-medium">{r.id}</td>
                <td className="py-2.5 pr-4 text-white text-sm">{r.patient}</td>
                <td className="py-2.5 pr-4 text-slate-400 text-sm">{r.service}</td>
                <td className="py-2.5 pr-4"><span className={`text-xs px-2 py-0.5 rounded-full ${ST_BADGE[r.status]}`}>{ST_LABEL[r.status]}</span></td>
                <td className="py-2.5 text-slate-500 text-sm">{r.time}</td>
              </motion.tr>
            ))}</tbody>
          </table></div>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
