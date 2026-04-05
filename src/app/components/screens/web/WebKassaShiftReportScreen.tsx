import React from 'react';
import { motion } from 'motion/react';
import { Clock, Banknote, CreditCard, Smartphone, Printer, Download, CheckCircle } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const fmt = (n: number) => n.toLocaleString() + " so'm";

export function WebKassaShiftReportScreen() {
  const shift = {
    id: '#SM-045', kassir: 'Rahimova Mohira', opened: '2026-04-03 08:00', duration: '6s 35d',
    initial: 500000, naqd: 18400000, karta: 12400000, onlayn: 11600000,
    total: 42400000, count: 56, refunds: 1, refundAmount: 300000,
  };
  const breakdown = [
    { method: 'Naqd pul', icon: Banknote, count: 24, amount: 18400000, color: 'from-emerald-500 to-green-600' },
    { method: 'Karta (terminal)', icon: CreditCard, count: 14, amount: 12400000, color: 'from-blue-500 to-indigo-600' },
    { method: 'Payme', icon: Smartphone, count: 8, amount: 5800000, color: 'from-cyan-500 to-teal-600' },
    { method: 'Click', icon: Smartphone, count: 6, amount: 3200000, color: 'from-violet-500 to-purple-600' },
    { method: 'Uzum', icon: Smartphone, count: 4, amount: 2600000, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <WebPlatformLayout title="Smena hisoboti" subtitle="Joriy smena yakunlash hisoboti">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Shift info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold text-lg">Smena {shift.id}</h3>
              <p className="text-slate-400 text-sm">{shift.kassir}</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Ochiq | {shift.duration}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Ochilgan vaqt', value: shift.opened },
              { label: 'Boshlang\'ich qoldiq', value: fmt(shift.initial) },
              { label: 'To\'lovlar soni', value: String(shift.count) },
              { label: 'Qaytarilgan', value: `${shift.refunds} ta (${fmt(shift.refundAmount)})` },
            ].map(f => (
              <div key={f.label} className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">{f.label}</p>
                <p className="text-white text-sm font-medium">{f.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-4">To'lov usullari bo'yicha</h3>
          <div className="space-y-3">
            {breakdown.map(b => (
              <div key={b.method} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center shrink-0`}><b.icon className="w-5 h-5 text-white" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{b.method}</span>
                    <span className="text-white font-bold">{fmt(b.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full mr-3">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(b.amount / shift.total) * 100}%` }} />
                    </div>
                    <span className="text-slate-500 text-xs shrink-0">{b.count} ta ({Math.round((b.amount / shift.total) * 100)}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Total */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm">Smena jami daromad</p>
              <p className="text-white text-3xl font-bold mt-1">{fmt(shift.total)}</p>
              <p className="text-indigo-200 text-sm mt-1">{shift.count} ta to'lov</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"><Printer className="w-4 h-4" /> Chop etish</button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"><Download className="w-4 h-4" /> Excel yuklab olish</button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium transition-colors border border-red-500/20">Smenani yopish</button>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
