import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

const METHODS = [
  { key: 'naqd', label: 'Naqd pul', icon: Banknote, color: 'from-emerald-500 to-green-600' },
  { key: 'karta', label: 'Karta (terminal)', icon: CreditCard, color: 'from-blue-500 to-indigo-600' },
  { key: 'payme', label: 'Payme', icon: Smartphone, color: 'from-cyan-500 to-teal-600' },
  { key: 'click', label: 'Click', icon: Smartphone, color: 'from-violet-500 to-purple-600' },
  { key: 'uzum', label: 'Uzum', icon: Smartphone, color: 'from-amber-500 to-orange-600' },
];

const PENDING = [
  { id: '#1256', patient: 'Karimov Aziz', service: 'MRT bosh miya', amount: 450000 },
  { id: '#1255', patient: 'Xasanova Nilufar', service: 'Qon tahlili paket', amount: 85000 },
  { id: '#1254', patient: 'Rahimov Bobur', service: 'USG qorin', amount: 200000 },
  { id: '#1253', patient: 'Toshmatova Dilfuza', service: 'Konsultatsiya', amount: 150000 },
];

const fmt = (n: number) => n.toLocaleString() + " so'm";

export function WebKassaPaymentScreen() {
  const [selected, setSelected] = useState<typeof PENDING[0] | null>(null);
  const [method, setMethod] = useState('naqd');
  const [received, setReceived] = useState('');
  const [search, setSearch] = useState('');
  const [done, setDone] = useState(false);

  const change = selected && method === 'naqd' && Number(received) > 0 ? Number(received) - selected.amount : 0;

  if (done && selected) {
    return (
      <WebPlatformLayout title="To'lov qabul" subtitle="To'lov muvaffaqiyatli">
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">To'lov qabul qilindi!</h2>
            <p className="text-slate-400 mb-1">{selected.patient} — {selected.id}</p>
            <p className="text-white text-xl font-bold mb-6">{fmt(selected.amount)}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setDone(false); setSelected(null); }} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors">Yangi to'lov</button>
              <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">Chek chop etish</button>
            </div>
          </motion.div>
        </div>
      </WebPlatformLayout>
    );
  }

  return (
    <WebPlatformLayout title="To'lov qabul" subtitle="To'lov qabul qilish">
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Left: Search & select */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ariza # yoki bemor ismi..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800"><h3 className="text-white text-sm font-semibold">Kutilayotgan to'lovlar</h3></div>
              {PENDING.filter(p => !search || p.patient.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)).map(p => (
                <button key={p.id} onClick={() => setSelected(p)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors text-left ${selected?.id === p.id ? 'bg-indigo-600/10' : ''}`}>
                  <div><p className="text-white text-sm font-medium">{p.patient}</p><p className="text-slate-500 text-xs">{p.id} | {p.service}</p></div>
                  <span className="text-white font-bold text-sm">{fmt(p.amount)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Payment form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-5 pb-4 border-b border-slate-800">
                  <p className="text-white font-semibold">{selected.patient}</p>
                  <p className="text-slate-400 text-sm">{selected.id} — {selected.service}</p>
                  <p className="text-white text-2xl font-bold mt-2">{fmt(selected.amount)}</p>
                </div>
                <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">To'lov usuli</h4>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {METHODS.map(m => (
                    <button key={m.key} onClick={() => setMethod(m.key)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-colors ${method === m.key ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}><m.icon className="w-4 h-4 text-white" /></div>
                      {m.label}
                    </button>
                  ))}
                </div>
                {method === 'naqd' && (
                  <div className="mb-5">
                    <label className="text-slate-400 text-xs mb-1 block">Qabul qilingan summa</label>
                    <input value={received} onChange={e => setReceived(e.target.value)} type="number" placeholder="Summa kiriting"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg font-bold outline-none focus:border-indigo-500" />
                    {change > 0 && <p className="text-emerald-400 text-sm mt-2">Qaytim: {fmt(change)}</p>}
                  </div>
                )}
                <button onClick={() => setDone(true)}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
                  To'lovni tasdiqlash — {fmt(selected.amount)}
                </button>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600 text-sm py-20">Ariza tanlang</div>
            )}
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
