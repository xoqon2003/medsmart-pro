import React from 'react';
import { motion } from 'motion/react';
import { Users, Clock, CheckCircle, Timer, Play, PenTool, Syringe, FlaskConical } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useApp } from '../../../store/appStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const WEEK = [{ d: 'Dush', v: 8 }, { d: 'Sesh', v: 12 }, { d: 'Chor', v: 6 }, { d: 'Pay', v: 10 }, { d: 'Jum', v: 9 }, { d: 'Shan', v: 5 }, { d: 'Yak', v: 0 }];
const QUEUE = [
  { id: 1, name: 'Karimov Aziz', time: '14:30', service: 'Konsultatsiya', status: 'waiting' },
  { id: 2, name: 'Xasanova Nilufar', time: '14:45', service: 'Takroriy qabul', status: 'waiting' },
  { id: 3, name: 'Rahimov Bobur', time: '15:00', service: 'Birlamchi qabul', status: 'waiting' },
  { id: 4, name: 'Toshmatova Dilfuza', time: '15:15', service: 'Lab natijalar', status: 'waiting' },
  { id: 5, name: 'Abdullayev Sardor', time: '15:30', service: 'Konsultatsiya', status: 'waiting' },
  { id: 6, name: 'Mirzayeva Gulnora', time: '13:00', service: 'Birlamchi qabul', status: 'done' },
  { id: 7, name: 'Yusupov Doniyor', time: '13:30', service: 'Konsultatsiya', status: 'done' },
  { id: 8, name: 'Sultanova Kamola', time: '14:00', service: 'Takroriy qabul', status: 'done' },
];

export function WebDocDashboardScreen() {
  const { navigate } = useApp();
  const waiting = QUEUE.filter(q => q.status === 'waiting');
  const done = QUEUE.filter(q => q.status === 'done');

  const kpis = [
    { label: 'Bugungi navbat', value: QUEUE.length, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'Kutilayotgan', value: waiting.length, icon: Clock, color: 'from-amber-500 to-orange-600' },
    { label: 'Bajarilgan', value: done.length, icon: CheckCircle, color: 'from-emerald-500 to-green-600' },
    { label: 'O\'rtacha vaqt', value: '12 min', icon: Timer, color: 'from-violet-500 to-purple-600' },
  ];
  const actions = [
    { label: 'Qabulni boshlash', icon: Play, screen: 'web_doc_reception' as const, color: 'from-emerald-500 to-green-600' },
    { label: 'Xulosa yozish', icon: PenTool, screen: 'web_doc_conclusion' as const, color: 'from-indigo-500 to-blue-600' },
    { label: 'Retsept', icon: Syringe, screen: 'web_doc_prescription' as const, color: 'from-violet-500 to-purple-600' },
    { label: 'Lab buyurtma', icon: FlaskConical, screen: 'web_doc_lab_order' as const, color: 'from-cyan-500 to-teal-600' },
  ];

  return (
    <WebPlatformLayout title="Shifokor Dashboard" subtitle="Bugungi navbat va ish ko'rsatkichlari">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}><k.icon className="w-5 h-5 text-white" /></div>
              <p className="text-white text-2xl font-bold">{k.value}</p>
              <p className="text-slate-500 text-xs mt-1">{k.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white text-sm font-semibold mb-4">Bugungi navbat</h3>
              <div className="space-y-2">
                {waiting.map((q, i) => (
                  <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{q.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div><p className="text-white text-sm font-medium">{q.name}</p><p className="text-slate-500 text-xs">{q.service}</p></div>
                    </div>
                    <span className="text-slate-400 text-sm">{q.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-white text-sm font-semibold mb-4">Haftalik ko'rsatkich</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={WEEK}>
                  <XAxis dataKey="d" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="v" fill="#6366f1" radius={[6, 6, 0, 0]} name="Bemorlar" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Tezkor amallar</h3>
            <div className="space-y-3">
              {actions.map(a => (
                <button key={a.label} onClick={() => navigate(a.screen)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-800 transition-colors text-left">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0`}><a.icon className="w-4 h-4 text-white" /></div>
                  <span className="text-slate-300 text-sm font-medium">{a.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
