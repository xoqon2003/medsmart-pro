import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Banknote, CreditCard, Wifi, Search, ChevronRight, X, Check,
  TrendingUp, Clock, AlertCircle, Printer, Download, Eye,
  Calculator, Lock, Unlock, Receipt, RefreshCw, ChevronDown,
  ArrowUpRight, ArrowDownLeft, Building2, BarChart3, History,
  Smartphone, CheckCircle2, XCircle, Hourglass, Filter,
  LogOut, Bell, User,
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { mockKassaTolovlar, mockKassaSmena } from '../../../data/mockData';
import type { KassaTolov, KassaTolovUsuli } from '../../../types';

// ── Yordamchi funksiyalar ──────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('uz-UZ') + " so'm";

const tolovUsulIcon = (usul: KassaTolovUsuli) => {
  const map: Record<KassaTolovUsuli, React.ReactNode> = {
    naqd:     <Banknote   className="w-4 h-4" />,
    karta:    <CreditCard className="w-4 h-4" />,
    payme:    <Smartphone className="w-4 h-4" />,
    click:    <Smartphone className="w-4 h-4" />,
    uzum:     <Smartphone className="w-4 h-4" />,
    uzcard:   <CreditCard className="w-4 h-4" />,
    humo:     <CreditCard className="w-4 h-4" />,
    terminal: <CreditCard className="w-4 h-4" />,
  };
  return map[usul] ?? <Banknote className="w-4 h-4" />;
};

const tolovUsulNomi = (usul: KassaTolovUsuli) => {
  const map: Record<KassaTolovUsuli, string> = {
    naqd: 'Naqd', karta: 'Karta', payme: 'Payme',
    click: 'Click', uzum: 'Uzum', uzcard: 'Uzcard',
    humo: 'Humo', terminal: 'Terminal',
  };
  return map[usul] ?? usul;
};

const tolovUsulRang = (usul: KassaTolovUsuli) => {
  if (usul === 'naqd')   return 'bg-green-100  text-green-700';
  if (usul === 'karta' || usul === 'uzcard' || usul === 'humo' || usul === 'terminal')
                          return 'bg-blue-100   text-blue-700';
  return                         'bg-orange-100 text-orange-700';
};

const holatiBadge = (holati: KassaTolov['holati']) => {
  if (holati === 'qabul_qilindi') return { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'To\'landi',    cls: 'bg-emerald-100 text-emerald-700' };
  if (holati === 'kutilmoqda')    return { icon: <Hourglass     className="w-3.5 h-3.5" />, label: 'Kutilmoqda',  cls: 'bg-amber-100   text-amber-700'   };
  if (holati === 'bekor')         return { icon: <XCircle       className="w-3.5 h-3.5" />, label: 'Bekor',       cls: 'bg-red-100     text-red-700'     };
  return                                  { icon: <RefreshCw     className="w-3.5 h-3.5" />, label: 'Qaytarildi', cls: 'bg-purple-100  text-purple-700'  };
};

// ── To'lov qabul qilish modali ─────────────────────────────────────────────

interface TolovQabulModalProps {
  tolov: KassaTolov;
  onClose: () => void;
  onSuccess: (id: number, usul: KassaTolovUsuli, berilganPul?: number) => void;
}

function TolovQabulModal({ tolov, onClose, onSuccess }: TolovQabulModalProps) {
  const [usul, setUsul] = useState<KassaTolovUsuli>('naqd');
  const [berilganPul, setBerilganPul] = useState('');
  const [step, setStep] = useState<'usul' | 'summa' | 'tasdiqlash' | 'muvaffaqiyat'>('usul');

  const qaytim = usul === 'naqd' && berilganPul
    ? Math.max(0, parseInt(berilganPul.replace(/\s/g, '')) - tolov.tolashKerak)
    : 0;

  const usullar: { key: KassaTolovUsuli; label: string; icon: React.ReactNode; rang: string }[] = [
    { key: 'naqd',     label: 'Naqd pul',  icon: <Banknote   className="w-5 h-5" />, rang: 'from-green-500  to-emerald-500' },
    { key: 'karta',    label: 'Karta',      icon: <CreditCard className="w-5 h-5" />, rang: 'from-blue-500   to-indigo-500'  },
    { key: 'terminal', label: 'Terminal',   icon: <CreditCard className="w-5 h-5" />, rang: 'from-sky-500    to-blue-400'    },
    { key: 'payme',    label: 'Payme',      icon: <Smartphone className="w-5 h-5" />, rang: 'from-orange-500 to-orange-400'  },
    { key: 'click',    label: 'Click',      icon: <Smartphone className="w-5 h-5" />, rang: 'from-blue-600   to-blue-400'    },
    { key: 'uzum',     label: 'Uzum',       icon: <Smartphone className="w-5 h-5" />, rang: 'from-purple-600 to-violet-500'  },
    { key: 'uzcard',   label: 'Uzcard',     icon: <CreditCard className="w-5 h-5" />, rang: 'from-teal-500   to-emerald-400' },
    { key: 'humo',     label: 'Humo',       icon: <CreditCard className="w-5 h-5" />, rang: 'from-green-600  to-teal-500'    },
  ];

  const handleTasdiqlash = () => {
    setStep('muvaffaqiyat');
    setTimeout(() => {
      onSuccess(tolov.id, usul, usul === 'naqd' ? parseInt(berilganPul.replace(/\s/g, '')) : undefined);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 400, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 400, opacity: 0 }} transition={{ type: 'spring', damping: 30 }}
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-5 pt-5 pb-3 border-b border-gray-100 z-10">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-gray-900 font-semibold">To'lov qabul qilish</h2>
            <button onClick={onClose} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-xs text-gray-500">{tolov.invoiceRaqam} · {tolov.bemorIsmi}</p>
        </div>

        <div className="px-5 py-4">
          {/* Faktura xulosa */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            <p className="text-xs text-gray-500 mb-1">{tolov.xizmatNomi}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Asosiy summa</span>
              <span className="text-sm text-gray-700">{fmt(tolov.summa)}</span>
            </div>
            {tolov.chegirma > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-red-500">Chegirma</span>
                <span className="text-sm text-red-500">- {fmt(tolov.chegirma)}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-900">To'lash kerak</span>
              <span className="text-lg font-bold text-blue-600">{fmt(tolov.tolashKerak)}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 1-qadam: Usul tanlash */}
            {step === 'usul' && (
              <motion.div key="usul" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <p className="text-sm font-medium text-gray-700 mb-3">To'lov usulini tanlang</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {usullar.map(u => (
                    <button
                      key={u.key}
                      onClick={() => setUsul(u.key)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                        usul === u.key
                          ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${u.rang} flex items-center justify-center text-white shrink-0`}>
                        {u.icon}
                      </div>
                      <span className="text-sm text-gray-800">{u.label}</span>
                      {usul === u.key && <Check className="w-4 h-4 text-blue-500 ml-auto" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => usul === 'naqd' ? setStep('summa') : setStep('tasdiqlash')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-3.5 font-medium flex items-center justify-center gap-2"
                >
                  Davom etish <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* 2-qadam: Naqd — qancha pul berildi */}
            {step === 'summa' && (
              <motion.div key="summa" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('usul')} className="p-1 text-gray-400 hover:text-gray-600">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <p className="text-sm font-medium text-gray-700">Berilgan naqd pul miqdori</p>
                </div>

                <div className="bg-green-50 rounded-2xl p-4 mb-4">
                  <p className="text-xs text-green-600 mb-1">To'lash kerak:</p>
                  <p className="text-2xl font-bold text-green-700">{fmt(tolov.tolashKerak)}</p>
                </div>

                {/* Tez tanlash tugmalari */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[tolov.tolashKerak, tolov.tolashKerak + 50000, tolov.tolashKerak + 100000, tolov.tolashKerak + 200000].map(val => (
                    <button
                      key={val}
                      onClick={() => setBerilganPul(val.toString())}
                      className={`py-2 rounded-xl text-xs font-medium transition-all ${
                        berilganPul === val.toString()
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {(val / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>

                <div className="relative mb-4">
                  <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={berilganPul}
                    onChange={e => setBerilganPul(e.target.value)}
                    placeholder="Miqdor kiriting..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-lg"
                  />
                </div>

                {berilganPul && parseInt(berilganPul) >= tolov.tolashKerak && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4 flex items-center justify-between"
                  >
                    <span className="text-amber-700 text-sm">Qaytim:</span>
                    <span className="text-amber-800 font-bold text-lg">{fmt(qaytim)}</span>
                  </motion.div>
                )}

                <button
                  onClick={() => setStep('tasdiqlash')}
                  disabled={!berilganPul || parseInt(berilganPul) < tolov.tolashKerak}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl py-3.5 font-medium disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  Tasdiqlashga o'tish <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* 3-qadam: Tasdiqlash */}
            {step === 'tasdiqlash' && (
              <motion.div key="tasdiqlash" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep(usul === 'naqd' ? 'summa' : 'usul')} className="p-1 text-gray-400 hover:text-gray-600">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <p className="text-sm font-medium text-gray-700">Tasdiqlash</p>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                    <Row label="Bemor"          value={tolov.bemorIsmi} />
                    <Row label="Xizmat"         value={tolov.xizmatNomi} small />
                    <Row label="To'lov usuli"   value={tolovUsulNomi(usul)} />
                    <Row label="To'lash kerak"  value={fmt(tolov.tolashKerak)} bold blue />
                    {usul === 'naqd' && berilganPul && (
                      <>
                        <Row label="Berilgan"   value={fmt(parseInt(berilganPul))} />
                        <Row label="Qaytim"     value={fmt(qaytim)} bold />
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleTasdiqlash}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Check className="w-5 h-5" /> To'lovni tasdiqlash
                </button>
              </motion.div>
            )}

            {/* Muvaffaqiyat */}
            {step === 'muvaffaqiyat' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                  className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-200"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">To'lov qabul qilindi!</h3>
                <p className="text-gray-500 text-sm text-center">{fmt(tolov.tolashKerak)} · {tolovUsulNomi(usul)}</p>
                {usul === 'naqd' && qaytim > 0 && (
                  <div className="mt-4 bg-amber-100 rounded-2xl px-6 py-3 text-center">
                    <p className="text-amber-600 text-xs mb-1">Qaytim bering:</p>
                    <p className="text-amber-800 text-2xl font-bold">{fmt(qaytim)}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Kichik yordamchi Row komponenti
function Row({ label, value, bold, blue, small }: { label: string; value: string; bold?: boolean; blue?: boolean; small?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 text-xs shrink-0">{label}</span>
      <span className={`text-right ${small ? 'text-xs' : 'text-sm'} ${bold ? 'font-semibold' : ''} ${blue ? 'text-blue-600' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );
}

// ── Faktura detail modali ──────────────────────────────────────────────────

function FakturaModal({ tolov, onClose, onPrint }: { tolov: KassaTolov; onClose: () => void; onPrint: () => void }) {
  const badge = holatiBadge(tolov.holati);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 400, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 400, opacity: 0 }} transition={{ type: 'spring', damping: 30 }}
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900 font-bold text-base">HISOB-FAKTURA</h2>
              <p className="text-blue-600 text-sm font-medium">{tolov.invoiceRaqam}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Holati</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.cls}`}>
              {badge.icon} {badge.label}
            </span>
          </div>

          {/* Bemor */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Bemor ma'lumoti</p>
            <Row label="F.I.O."       value={tolov.bemorIsmi} bold />
            <Row label="Ariza"        value={`#${tolov.applicationId}`} />
          </div>

          {/* Xizmat */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Xizmat va to'lov</p>
            <Row label="Xizmat"       value={tolov.xizmatNomi} small />
            <Row label="Summa"        value={fmt(tolov.summa)} />
            {tolov.chegirma > 0 && <Row label="Chegirma"  value={`- ${fmt(tolov.chegirma)}`} />}
            <Row label="To'lash kerak" value={fmt(tolov.tolashKerak)} bold blue />
            {tolov.holati === 'qabul_qilindi' && (
              <>
                <Row label="To'langan"  value={fmt(tolov.tolanganSumma)} />
                {tolov.qaytim > 0 && <Row label="Qaytim"  value={fmt(tolov.qaytim)} />}
              </>
            )}
          </div>

          {/* To'lov usuli va sana */}
          <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${tolovUsulRang(tolov.tolovUsuli)}`}>
                {tolovUsulIcon(tolov.tolovUsuli)} {tolovUsulNomi(tolov.tolovUsuli)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(tolov.sanaVaqt).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {tolov.izoh && (
            <p className="text-xs text-gray-400 italic px-1">{tolov.izoh}</p>
          )}

          {/* Tugmalar */}
          <div className="grid grid-cols-2 gap-3 pt-2 pb-2">
            <button
              onClick={onPrint}
              className="flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-700 text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" /> Chop etish
            </button>
            <button
              onClick={onPrint}
              className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Yuklab olish
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Smena yopish modali ────────────────────────────────────────────────────

function SmenaYopishModal({ onClose, onConfirm, smena }: {
  onClose: () => void;
  onConfirm: () => void;
  smena: typeof mockKassaSmena;
}) {
  const { navigate } = useApp();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-500 to-rose-600 px-5 py-4">
          <h3 className="text-white font-bold text-lg">Smenani yopish</h3>
          <p className="text-red-100 text-xs">Bugungi smena xisoboti</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Naqd" value={fmt(smena.naqd)} color="green" icon={<Banknote className="w-4 h-4" />} />
            <StatBox label="Karta" value={fmt(smena.karta)} color="blue" icon={<CreditCard className="w-4 h-4" />} />
            <StatBox label="Onlayn" value={fmt(smena.onlayn)} color="orange" icon={<Smartphone className="w-4 h-4" />} />
            <StatBox label="Jami to'lovlar" value={smena.tolovlarSoni.toString()} color="purple" icon={<Receipt className="w-4 h-4" />} />
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-gray-600 font-medium">Jami daromad</span>
            <span className="text-xl font-bold text-gray-900">{fmt(smena.jami)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button onClick={onClose} className="py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-700 text-sm font-medium transition-colors">
              Bekor qilish
            </button>
            <button
              onClick={() => { onConfirm(); navigate('role_select'); }}
              className="py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl text-sm font-medium"
            >
              Smenani yop
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatBox({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  const colors: Record<string, string> = {
    green:  'bg-green-50  text-green-600',
    blue:   'bg-blue-50   text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    teal:   'bg-teal-50   text-teal-600',
  };
  return (
    <div className={`rounded-2xl p-3 ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-1.5 mb-1 opacity-70">{icon}<span className="text-xs">{label}</span></div>
      <p className="font-bold text-sm">{value}</p>
    </div>
  );
}

// ── Asosiy KassirDashboard ─────────────────────────────────────────────────

type Tab = 'asosiy' | 'tolovlar' | 'smena' | 'statistika';
type FilterHolat = 'barchasi' | 'kutilmoqda' | 'qabul_qilindi' | 'bekor';
type FilterUsul = 'barchasi' | KassaTolovUsuli;

export function KassirDashboard() {
  const { currentUser, navigate, unreadCount } = useApp();

  const [tab, setTab] = useState<Tab>('asosiy');
  const [qidiruv, setQidiruv] = useState('');
  const [filterHolat, setFilterHolat] = useState<FilterHolat>('barchasi');
  const [filterUsul, setFilterUsul] = useState<FilterUsul>('barchasi');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTolov, setSelectedTolov] = useState<KassaTolov | null>(null);
  const [showQabul, setShowQabul] = useState(false);
  const [showFaktura, setShowFaktura] = useState(false);
  const [showSmenaYopish, setShowSmenaYopish] = useState(false);
  const [tolovlar, setTolovlar] = useState<KassaTolov[]>(mockKassaTolovlar);
  const [smena] = useState(mockKassaSmena);

  // Filtr va qidiruv
  const filteredTolovlar = useMemo(() => {
    return tolovlar.filter(t => {
      const matchQ   = !qidiruv || t.bemorIsmi.toLowerCase().includes(qidiruv.toLowerCase()) || t.invoiceRaqam.toLowerCase().includes(qidiruv.toLowerCase());
      const matchH   = filterHolat === 'barchasi' || t.holati === filterHolat;
      const matchU   = filterUsul  === 'barchasi' || t.tolovUsuli === filterUsul;
      return matchQ && matchH && matchU;
    });
  }, [tolovlar, qidiruv, filterHolat, filterUsul]);

  // Kutilayotgan to'lovlar (asosiy tab uchun)
  const kutilmoqda = useMemo(() => tolovlar.filter(t => t.holati === 'kutilmoqda'), [tolovlar]);

  // Bugungi statistika
  const bugunStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const bugunTolovlar = tolovlar.filter(t => t.sanaVaqt.startsWith(today) && t.holati === 'qabul_qilindi');
    return {
      naqd:   bugunTolovlar.filter(t => t.tolovUsuli === 'naqd').reduce((s, t) => s + t.tolanganSumma, 0),
      karta:  bugunTolovlar.filter(t => ['karta', 'uzcard', 'humo', 'terminal'].includes(t.tolovUsuli)).reduce((s, t) => s + t.tolanganSumma, 0),
      onlayn: bugunTolovlar.filter(t => ['payme', 'click', 'uzum'].includes(t.tolovUsuli)).reduce((s, t) => s + t.tolanganSumma, 0),
      jami:   bugunTolovlar.reduce((s, t) => s + t.tolanganSumma, 0),
      soni:   bugunTolovlar.length,
    };
  }, [tolovlar]);

  const handleTolovSuccess = (id: number, usul: KassaTolovUsuli, berilganPul?: number) => {
    setTolovlar(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        holati: 'qabul_qilindi',
        tolovUsuli: usul,
        tolanganSumma: t.tolashKerak,
        qaytim: berilganPul ? Math.max(0, berilganPul - t.tolashKerak) : 0,
        sanaVaqt: new Date().toISOString(),
      };
    }));
    setTimeout(() => { setShowQabul(false); setSelectedTolov(null); }, 1600);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'asosiy',     label: 'Asosiy',     icon: <Building2  className="w-4 h-4" /> },
    { key: 'tolovlar',   label: "To'lovlar",   icon: <Receipt    className="w-4 h-4" /> },
    { key: 'smena',      label: 'Smena',       icon: <Clock      className="w-4 h-4" /> },
    { key: 'statistika', label: 'Statistika',  icon: <BarChart3  className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── TOP HEADER ── */}
      <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600 pt-10 pb-6 px-4 relative overflow-hidden">
        {/* Fon dekor */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute top-4 right-16 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currentUser?.fullName?.slice(0, 2).toUpperCase() || 'KS'}
              </span>
            </div>
            <div>
              <p className="text-white/70 text-xs">Kassir</p>
              <p className="text-white font-semibold text-sm">{currentUser?.fullName || 'Kassir'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('notifications')}
              className="relative w-9 h-9 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition-colors"
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white rounded-full flex items-center justify-center px-1" style={{ fontSize: 9 }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('profile')}
              className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition-colors"
            >
              <User className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setShowSmenaYopish(true)}
              className="w-9 h-9 bg-red-500/70 hover:bg-red-500/90 rounded-xl flex items-center justify-center transition-colors"
              title="Smenani yopish"
            >
              <LogOut className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Bugungi jami */}
        <div className="relative">
          <p className="text-white/60 text-xs mb-1">Bugungi daromad</p>
          <p className="text-white text-3xl font-bold mb-3">{fmt(bugunStats.jami)}</p>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Banknote className="w-3.5 h-3.5 text-green-300" />
                <span className="text-white/70 text-xs">Naqd</span>
              </div>
              <p className="text-white font-semibold text-sm">{(bugunStats.naqd / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-white/70 text-xs">Karta</span>
              </div>
              <p className="text-white font-semibold text-sm">{(bugunStats.karta / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Wifi className="w-3.5 h-3.5 text-orange-300" />
                <span className="text-white/70 text-xs">Onlayn</span>
              </div>
              <p className="text-white font-semibold text-sm">{(bugunStats.onlayn / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLAR ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="flex">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 relative transition-colors ${
                tab === t.key ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.icon}
              <span className="text-xs">{t.label}</span>
              {tab === t.key && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-24 space-y-4">

        {/* ═══════════════ ASOSIY TAB ═══════════════ */}
        {tab === 'asosiy' && (
          <div className="space-y-4">

            {/* Qidiruv */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={qidiruv}
                onChange={e => setQidiruv(e.target.value)}
                placeholder="Bemor ismi yoki invoys raqami..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Kutilayotgan to'lovlar */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-800 font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Kutilayotgan to'lovlar
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{kutilmoqda.length}</span>
                </h3>
              </div>

              {kutilmoqda.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-gray-200">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Barcha to'lovlar qabul qilindi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {kutilmoqda
                    .filter(t => !qidiruv || t.bemorIsmi.toLowerCase().includes(qidiruv.toLowerCase()) || t.invoiceRaqam.toLowerCase().includes(qidiruv.toLowerCase()))
                    .map(tolov => (
                      <KutilayotganKarta
                        key={tolov.id}
                        tolov={tolov}
                        onQabul={() => { setSelectedTolov(tolov); setShowQabul(true); }}
                        onKorish={() => { setSelectedTolov(tolov); setShowFaktura(true); }}
                      />
                    ))
                  }
                </div>
              )}
            </section>

            {/* So'ngi to'lovlar */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-800 font-semibold">So'ngi to'lovlar</h3>
                <button onClick={() => setTab('tolovlar')} className="text-blue-600 text-xs flex items-center gap-1">
                  Barchasi <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {tolovlar
                  .filter(t => t.holati === 'qabul_qilindi')
                  .slice(0, 4)
                  .map(tolov => (
                    <TolovKarta
                      key={tolov.id}
                      tolov={tolov}
                      onClick={() => { setSelectedTolov(tolov); setShowFaktura(true); }}
                    />
                  ))
                }
              </div>
            </section>
          </div>
        )}

        {/* ═══════════════ TO'LOVLAR TAB ═══════════════ */}
        {tab === 'tolovlar' && (
          <div className="space-y-3">
            {/* Qidiruv + Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={qidiruv}
                  onChange={e => setQidiruv(e.target.value)}
                  placeholder="Qidirish..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <button
                onClick={() => setShowFilter(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  showFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" /> Filtr
              </button>
            </div>

            {/* Filter paneli */}
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3 overflow-hidden"
                >
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Holat</p>
                    <div className="flex flex-wrap gap-2">
                      {(['barchasi', 'kutilmoqda', 'qabul_qilindi', 'bekor'] as FilterHolat[]).map(h => (
                        <button
                          key={h}
                          onClick={() => setFilterHolat(h)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                            filterHolat === h ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {h === 'barchasi' ? 'Barchasi' : h === 'kutilmoqda' ? 'Kutilmoqda' : h === 'qabul_qilindi' ? "To'landi" : 'Bekor'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">To'lov usuli</p>
                    <div className="flex flex-wrap gap-2">
                      {(['barchasi', 'naqd', 'karta', 'payme', 'click', 'uzum', 'uzcard', 'humo'] as FilterUsul[]).map(u => (
                        <button
                          key={u}
                          onClick={() => setFilterUsul(u)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                            filterUsul === u ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {u === 'barchasi' ? 'Barchasi' : tolovUsulNomi(u as KassaTolovUsuli)}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Natijalar soni */}
            <p className="text-xs text-gray-400 px-1">{filteredTolovlar.length} ta natija</p>

            {/* To'lovlar ro'yxati */}
            <div className="space-y-2">
              {filteredTolovlar.map(tolov => (
                <TolovKarta
                  key={tolov.id}
                  tolov={tolov}
                  onClick={() => { setSelectedTolov(tolov); setShowFaktura(true); }}
                  showQabul={tolov.holati === 'kutilmoqda'}
                  onQabul={() => { setSelectedTolov(tolov); setShowQabul(true); }}
                />
              ))}
              {filteredTolovlar.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Hech narsa topilmadi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ SMENA TAB ═══════════════ */}
        {tab === 'smena' && (
          <div className="space-y-4">
            {/* Smena holati */}
            <div className={`rounded-3xl p-5 ${smena.holati === 'ochiq' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {smena.holati === 'ochiq'
                    ? <Unlock className="w-5 h-5 text-white" />
                    : <Lock   className="w-5 h-5 text-white" />
                  }
                  <span className="text-white font-bold text-lg">
                    Smena {smena.holati === 'ochiq' ? 'OCHIQ' : 'YOPIQ'}
                  </span>
                </div>
                <div className="bg-white/20 rounded-xl px-3 py-1">
                  <span className="text-white text-xs">#{smena.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/15 rounded-2xl p-3">
                  <p className="text-white/70 text-xs mb-1">Ochilgan vaqt</p>
                  <p className="text-white font-medium text-sm">
                    {new Date(smena.ochilganVaqt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="bg-white/15 rounded-2xl p-3">
                  <p className="text-white/70 text-xs mb-1">Boshlang'ich naqd</p>
                  <p className="text-white font-medium text-sm">{fmt(smena.boshlanghichQoldiq)}</p>
                </div>
              </div>

              <div className="bg-white/15 rounded-2xl p-3 flex items-center justify-between">
                <span className="text-white/80 text-sm">Kassir</span>
                <span className="text-white font-medium text-sm">{smena.kassirIsmi}</span>
              </div>
            </div>

            {/* Smena statistikasi */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" /> Smena xisoboti
              </h3>
              <div className="space-y-3">
                <SmenaQator icon={<Banknote   className="w-4 h-4" />} label="Naqd to'lovlar"   value={fmt(smena.naqd)}   rang="green"  />
                <SmenaQator icon={<CreditCard className="w-4 h-4" />} label="Karta to'lovlar"  value={fmt(smena.karta)}  rang="blue"   />
                <SmenaQator icon={<Smartphone className="w-4 h-4" />} label="Onlayn to'lovlar" value={fmt(smena.onlayn)} rang="orange" />
                <div className="border-t border-gray-100 pt-3 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-semibold">Jami daromad</span>
                    <span className="text-blue-600 text-xl font-bold">{fmt(smena.jami)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-500 text-xs">To'lovlar soni</span>
                    <span className="text-gray-700 font-medium">{smena.tolovlarSoni} ta</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Naqd hisobi */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-green-600" /> Kassa hisobi
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Boshlang'ich naqd</span>
                  <span className="text-gray-700 font-medium">{fmt(smena.boshlanghichQoldiq)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-green-600 text-sm flex items-center gap-1"><ArrowDownLeft className="w-3.5 h-3.5" /> Naqd kirim</span>
                  <span className="text-green-600 font-medium">+ {fmt(smena.naqd)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700 font-semibold">Joriy naqd qoldiq</span>
                  <span className="text-blue-600 font-bold text-lg">{fmt(smena.boshlanghichQoldiq + smena.naqd)}</span>
                </div>
              </div>
            </div>

            {/* Smena yopish tugmasi */}
            {smena.holati === 'ochiq' && (
              <button
                onClick={() => setShowSmenaYopish(true)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-3xl font-semibold text-base shadow-lg shadow-red-200 hover:shadow-xl transition-shadow"
              >
                <Lock className="w-5 h-5" /> Smenani yopish
              </button>
            )}
          </div>
        )}

        {/* ═══════════════ STATISTIKA TAB ═══════════════ */}
        {tab === 'statistika' && (
          <div className="space-y-4">

            {/* Umumiy ko'rsatkichlar */}
            <div className="grid grid-cols-2 gap-3">
              <StatKarta label="Bugun" jami={bugunStats.jami} soni={bugunStats.soni} rang="blue" />
              <StatKarta label="Bu hafta" jami={smena.jami + 1840000} soni={smena.tolovlarSoni + 8} rang="purple" />
              <StatKarta label="Bu oy" jami={smena.jami + 12450000} soni={smena.tolovlarSoni + 67} rang="teal" />
              <StatKarta label="Jami" jami={smena.jami + 45800000} soni={smena.tolovlarSoni + 214} rang="green" />
            </div>

            {/* To'lov usullari taqsimoti */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> To'lov usullari
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Naqd pul',   value: bugunStats.naqd,   total: bugunStats.jami, rang: 'bg-green-500',  icon: <Banknote   className="w-3.5 h-3.5 text-green-600" /> },
                  { label: 'Karta',      value: bugunStats.karta,  total: bugunStats.jami, rang: 'bg-blue-500',   icon: <CreditCard className="w-3.5 h-3.5 text-blue-600"  /> },
                  { label: 'Onlayn',     value: bugunStats.onlayn, total: bugunStats.jami, rang: 'bg-orange-500', icon: <Smartphone className="w-3.5 h-3.5 text-orange-600"/> },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        {item.icon} {item.label}
                      </div>
                      <span className="text-xs text-gray-500">{fmt(item.value)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bugunStats.jami > 0 ? (item.value / bugunStats.jami) * 100 : 0}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full ${item.rang} rounded-full`}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-right mt-0.5">
                      {bugunStats.jami > 0 ? ((item.value / bugunStats.jami) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Oxirgi tranzaksiyalar */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" /> Oxirgi tranzaksiyalar
              </h3>
              <div className="space-y-3">
                {tolovlar.filter(t => t.holati === 'qabul_qilindi').slice(0, 5).map(tolov => (
                  <div key={tolov.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium truncate">{tolov.bemorIsmi}</p>
                      <p className="text-xs text-gray-400">{tolov.invoiceRaqam}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-green-600">+{(tolov.tolanganSumma / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tolov.sanaVaqt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALLAR ── */}
      <AnimatePresence>
        {showQabul && selectedTolov && (
          <TolovQabulModal
            tolov={selectedTolov}
            onClose={() => { setShowQabul(false); setSelectedTolov(null); }}
            onSuccess={handleTolovSuccess}
          />
        )}
        {showFaktura && selectedTolov && (
          <FakturaModal
            tolov={selectedTolov}
            onClose={() => { setShowFaktura(false); setSelectedTolov(null); }}
            onPrint={() => alert('🖨️ Chop etilmoqda...')}
          />
        )}
        {showSmenaYopish && (
          <SmenaYopishModal
            smena={smena}
            onClose={() => setShowSmenaYopish(false)}
            onConfirm={() => setShowSmenaYopish(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Kichik komponentlar ────────────────────────────────────────────────────

function KutilayotganKarta({ tolov, onQabul, onKorish }: {
  tolov: KassaTolov;
  onQabul: () => void;
  onKorish: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-amber-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{tolov.bemorIsmi}</p>
          <p className="text-xs text-gray-400">{tolov.invoiceRaqam}</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-xl text-xs font-medium shrink-0">
          <Hourglass className="w-3 h-3" /> Kutilmoqda
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{tolov.xizmatNomi}</p>
      <div className="flex items-center justify-between mb-3">
        <span className="text-blue-600 font-bold text-base">{fmt(tolov.tolashKerak)}</span>
        {tolov.chegirma > 0 && (
          <span className="text-xs text-red-500">Chegirma: -{fmt(tolov.chegirma)}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onKorish}
          className="flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 text-xs font-medium transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Ko'rish
        </button>
        <button
          onClick={onQabul}
          className="flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-xs font-medium"
        >
          <Check className="w-3.5 h-3.5" /> Qabul qilish
        </button>
      </div>
    </motion.div>
  );
}

function TolovKarta({ tolov, onClick, showQabul, onQabul }: {
  tolov: KassaTolov;
  onClick: () => void;
  showQabul?: boolean;
  onQabul?: () => void;
}) {
  const badge = holatiBadge(tolov.holati);
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${tolovUsulRang(tolov.tolovUsuli)}`}>
          {tolovUsulIcon(tolov.tolovUsuli)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-semibold text-gray-900 truncate">{tolov.bemorIsmi}</p>
            <span className="text-sm font-bold text-gray-800 ml-2 shrink-0">
              {fmt(tolov.holati === 'qabul_qilindi' ? tolov.tolanganSumma : tolov.tolashKerak)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">{tolov.invoiceRaqam}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
              {badge.icon} {badge.label}
            </span>
          </div>
        </div>
      </div>
      {showQabul && onQabul && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={e => { e.stopPropagation(); onQabul(); }}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-medium"
          >
            <Banknote className="w-3.5 h-3.5" /> To'lovni qabul qilish
          </button>
        </div>
      )}
    </div>
  );
}

function SmenaQator({ icon, label, value, rang }: { icon: React.ReactNode; label: string; value: string; rang: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-600', blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors[rang]}`}>{icon}</div>
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
      <span className="text-gray-800 font-semibold text-sm">{value}</span>
    </div>
  );
}

function StatKarta({ label, jami, soni, rang }: { label: string; jami: number; soni: number; rang: string }) {
  const bg: Record<string, string> = {
    blue: 'from-blue-500 to-indigo-600', purple: 'from-purple-500 to-violet-600',
    teal: 'from-teal-500 to-emerald-600', green: 'from-green-500 to-teal-600',
  };
  return (
    <div className={`bg-gradient-to-br ${bg[rang]} rounded-3xl p-4 text-white`}>
      <p className="text-white/70 text-xs mb-2">{label}</p>
      <p className="text-white font-bold text-base mb-1">{(jami / 1000000).toFixed(1)}M so'm</p>
      <p className="text-white/60 text-xs">{soni} ta to'lov</p>
    </div>
  );
}
