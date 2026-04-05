import React from 'react';
import { motion } from 'motion/react';
import { Clock, User, Stethoscope, AlertTriangle } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const COLS = [
  { key: 'waiting', label: 'Navbatda', color: 'border-indigo-500', bg: 'bg-indigo-500/5', items: [
    { id: 1, patient: 'Karimov A.', service: 'MRT bosh', doctor: 'Dr. Rahimov', time: '14:30', urgency: 'normal', wait: '15 min' },
    { id: 2, patient: 'Xasanova N.', service: 'Konsultatsiya', doctor: 'Dr. Aliyeva', time: '14:45', urgency: 'urgent', wait: '8 min' },
    { id: 3, patient: 'Toshmatova D.', service: 'USG qorin', doctor: 'Dr. Mirza', time: '15:00', urgency: 'normal', wait: '5 min' },
    { id: 4, patient: 'Sultanova K.', service: 'Qon tahlili', doctor: 'Lab', time: '15:15', urgency: 'normal', wait: '2 min' },
    { id: 5, patient: 'Yusupov D.', service: 'MRT tizza', doctor: 'Dr. Rahimov', time: '15:30', urgency: 'emergency', wait: '0 min' },
  ]},
  { key: 'active', label: 'Qabulda', color: 'border-amber-500', bg: 'bg-amber-500/5', items: [
    { id: 6, patient: 'Rahimov B.', service: 'MSKT ko\'krak', doctor: 'Dr. Ergashev', time: '14:00', urgency: 'normal', wait: '35 min' },
    { id: 7, patient: 'Abdullayev S.', service: 'Konsultatsiya', doctor: 'Dr. Kamalova', time: '14:15', urgency: 'urgent', wait: '20 min' },
    { id: 8, patient: 'Mirzayeva G.', service: 'Rentgen', doctor: 'Dr. Ismoilov', time: '14:20', urgency: 'normal', wait: '15 min' },
  ]},
  { key: 'done', label: 'Bajarildi', color: 'border-emerald-500', bg: 'bg-emerald-500/5', items: [
    { id: 9, patient: 'Nazarov O.', service: 'MRT bosh', doctor: 'Dr. Rahimov', time: '08:30', urgency: 'normal', wait: '-' },
    { id: 10, patient: 'Qosimova Sh.', service: 'Qon tahlili', doctor: 'Lab', time: '09:00', urgency: 'normal', wait: '-' },
    { id: 11, patient: 'Umarov J.', service: 'USG', doctor: 'Dr. Mirza', time: '09:45', urgency: 'normal', wait: '-' },
    { id: 12, patient: 'Aliyeva M.', service: 'Konsultatsiya', doctor: 'Dr. Aliyeva', time: '10:15', urgency: 'normal', wait: '-' },
    { id: 13, patient: 'Ergashev B.', service: 'MSKT', doctor: 'Dr. Ergashev', time: '11:00', urgency: 'urgent', wait: '-' },
    { id: 14, patient: 'Ismoilov N.', service: 'MRT', doctor: 'Dr. Rahimov', time: '12:00', urgency: 'normal', wait: '-' },
  ]},
];

const URG_STRIP: Record<string, string> = { normal: 'bg-blue-500', urgent: 'bg-amber-500', emergency: 'bg-red-500' };

export function WebOpQueueScreen() {
  return (
    <WebPlatformLayout title="Navbat boshqaruvi" subtitle="Kunlik navbat va qabul holati">
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 h-[calc(100vh-180px)]">
          {COLS.map((col, ci) => (
            <motion.div key={col.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}
              className={`flex flex-col rounded-2xl border-t-2 ${col.color} ${col.bg} overflow-hidden`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold text-sm">{col.label}</h3>
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{col.items.length}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {col.items.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 + i * 0.04 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors cursor-pointer relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${URG_STRIP[item.urgency]}`} />
                    <div className="pl-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">{item.patient}</span>
                        <span className="text-slate-500 text-xs">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{item.service}</span>
                        {item.urgency !== 'normal' && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.urgency === 'urgent' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                            <AlertTriangle className="w-3 h-3 inline mr-0.5" />{item.urgency === 'urgent' ? 'Shoshilinch' : 'Favqulodda'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1"><Stethoscope className="w-3 h-3" />{item.doctor}</span>
                        {item.wait !== '-' && <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{item.wait}</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </WebPlatformLayout>
  );
}
