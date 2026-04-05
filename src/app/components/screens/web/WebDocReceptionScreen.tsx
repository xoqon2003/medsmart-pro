import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, ChevronRight, Timer, User, Thermometer, Heart, Scale, Activity } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const QUEUE = [
  { id: 1, name: 'Karimov Aziz', time: '14:30', service: 'Birlamchi', status: 'current' },
  { id: 2, name: 'Xasanova Nilufar', time: '14:45', service: 'Takroriy', status: 'waiting' },
  { id: 3, name: 'Rahimov Bobur', time: '15:00', service: 'Birlamchi', status: 'waiting' },
  { id: 4, name: 'Toshmatova Dilfuza', time: '15:15', service: 'Lab natijalar', status: 'waiting' },
  { id: 5, name: 'Abdullayev Sardor', time: '15:30', service: 'Konsultatsiya', status: 'waiting' },
];

export function WebDocReceptionScreen() {
  const [selected, setSelected] = useState(QUEUE[0]);

  return (
    <WebPlatformLayout title="Qabulxona" subtitle="Joriy qabul va navbat">
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-[calc(100vh-180px)]">
          {/* Left: Queue */}
          <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Bugungi navbat</h3>
              <span className="text-slate-500 text-xs">{QUEUE.length} bemor</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {QUEUE.map((q, i) => (
                <motion.button key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(q)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                    selected.id === q.id ? 'bg-indigo-600/20 border border-indigo-500/30' :
                    q.status === 'current' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                    'hover:bg-slate-800 border border-transparent'
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    q.status === 'current' ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}>
                    {q.status === 'current' ? <Play className="w-3 h-3 text-white" /> :
                      <span className="text-slate-400 text-xs font-bold">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{q.name}</p>
                    <p className="text-slate-500 text-xs">{q.service} | {q.time}</p>
                  </div>
                  {q.status === 'current' && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0">Qabulda</span>}
                </motion.button>
              ))}
            </div>
            <div className="p-3 border-t border-slate-800">
              <button className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <ChevronRight className="w-4 h-4" /> Keyingi bemorni chaqirish
              </button>
            </div>
          </div>

          {/* Right: Patient card */}
          <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto">
            <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">{selected.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <h2 className="text-white text-lg font-semibold">{selected.name}</h2>
                    <p className="text-slate-400 text-sm">{selected.service} | {selected.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Timer className="w-4 h-4" />
                  <span className="text-white font-mono text-lg">12:34</span>
                </div>
              </div>

              <h3 className="text-white font-semibold text-sm mb-3">Vital belgilar</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Qon bosimi', icon: Heart, unit: 'mmHg', placeholder: '120/80' },
                  { label: 'Yurak urishi', icon: Activity, unit: 'bpm', placeholder: '72' },
                  { label: 'Harorat', icon: Thermometer, unit: '°C', placeholder: '36.6' },
                  { label: 'Vazn', icon: Scale, unit: 'kg', placeholder: '75' },
                ].map(v => (
                  <div key={v.label} className="bg-slate-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <v.icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400 text-xs">{v.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input placeholder={v.placeholder} className="w-full bg-transparent text-white text-lg font-bold outline-none placeholder-slate-700" />
                      <span className="text-slate-600 text-xs shrink-0">{v.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-white font-semibold text-sm mb-3">Shikoyatlar va izohlar</h3>
              <textarea rows={4} placeholder="Bemorning shikoyatlari va shifokor izohlari..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none resize-none focus:border-indigo-500 mb-6" />

              <div className="flex items-center gap-3">
                <button className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">Xulosaga o'tish</button>
                <button className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors">Lab buyurtma</button>
                <button className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors">Retsept</button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
