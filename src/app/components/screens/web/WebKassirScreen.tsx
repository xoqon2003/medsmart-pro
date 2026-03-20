/**
 * WebKassirScreen — Kassa paneli (Web Platform)
 * To'lovlar, faktura chiqarish, smena boshqaruvi
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, RefreshCw, ChevronDown, CreditCard,
  Banknote, Smartphone, CheckCircle2, Clock,
  XCircle, TrendingUp, DollarSign, Eye,
  MoreVertical, Plus, Receipt, ArrowUpRight,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

// ── Tiplar ───────────────────────────────────────────────────────────────────

type PayMethod = 'naqd' | 'karta' | 'payme' | 'click' | 'uzum';
type PayStatus = 'tolangan' | 'kutmoqda' | 'bekor';

interface TolovRow {
  id: string;
  vaqt: string;
  bemor: string;
  xizmat: string;
  summa: number;
  metod: PayMethod;
  status: PayStatus;
  chek: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const TOLOVLAR: TolovRow[] = [
  { id:'CH-2025-0041', vaqt:'09:22', bemor:'Hasanova Malika',     xizmat:'MRT bosh miya',        summa:850000, metod:'karta',  status:'tolangan',  chek:'#8872' },
  { id:'CH-2025-0040', vaqt:'09:15', bemor:'Toshmatov Jasur',     xizmat:'KT ko\'krak',           summa:620000, metod:'payme',  status:'tolangan',  chek:'#8871' },
  { id:'CH-2025-0039', vaqt:'09:08', bemor:'Yunusova Dilnoza',    xizmat:'Rentgen qo\'l',         summa:150000, metod:'naqd',   status:'tolangan',  chek:'#8870' },
  { id:'CH-2025-0038', vaqt:'08:55', bemor:'Raximov Botir',       xizmat:'USG qorin',             summa:220000, metod:'click',  status:'kutmoqda',  chek:'—' },
  { id:'CH-2025-0037', vaqt:'08:40', bemor:'Normatova Sarvinoz',  xizmat:'MSKT umurtqa',          summa:980000, metod:'karta',  status:'tolangan',  chek:'#8869' },
  { id:'CH-2025-0036', vaqt:'08:30', bemor:'Qodirov Sherzod',     xizmat:'MRT bel',               summa:750000, metod:'uzum',   status:'tolangan',  chek:'#8868' },
  { id:'CH-2025-0035', vaqt:'08:18', bemor:'Abdullayeva Nozima',  xizmat:'EKG',                   summa:80000,  metod:'naqd',   status:'bekor',     chek:'—' },
  { id:'CH-2025-0034', vaqt:'08:05', bemor:'Pulatov Kamol',       xizmat:'KT appendiks',          summa:640000, metod:'payme',  status:'tolangan',  chek:'#8867' },
  { id:'CH-2025-0033', vaqt:'07:52', bemor:'Ismoilova Feruza',    xizmat:'USG homiladorlik',      summa:180000, metod:'naqd',   status:'tolangan',  chek:'#8866' },
  { id:'CH-2025-0032', vaqt:'07:38', bemor:'Xolmatov Eldor',      xizmat:'MRT yurak',             summa:1200000,metod:'karta',  status:'kutmoqda',  chek:'—' },
  { id:'CH-2025-0031', vaqt:'07:25', bemor:'Mirzayeva Lobar',     xizmat:'PAKET to\'liq',         summa:2500000,metod:'karta',  status:'tolangan',  chek:'#8865' },
  { id:'CH-2025-0030', vaqt:'07:10', bemor:'Karimov Ulugbek',     xizmat:'Rentgen ko\'krak',      summa:130000, metod:'click',  status:'tolangan',  chek:'#8864' },
];

// ── Yordamchi komponentlar ────────────────────────────────────────────────────

function MethodIcon({ m }: { m: PayMethod }) {
  const config: Record<PayMethod, { label: string; cls: string; icon: React.FC<any> }> = {
    naqd:  { label: 'Naqd',  cls: 'bg-emerald-500/15 text-emerald-400', icon: Banknote    },
    karta: { label: 'Karta', cls: 'bg-blue-500/15 text-blue-400',       icon: CreditCard  },
    payme: { label: 'Payme', cls: 'bg-cyan-500/15 text-cyan-400',       icon: Smartphone  },
    click: { label: 'Click', cls: 'bg-orange-500/15 text-orange-400',   icon: Smartphone  },
    uzum:  { label: 'Uzum',  cls: 'bg-violet-500/15 text-violet-400',   icon: Smartphone  },
  };
  const { label, cls, icon: Icon } = config[m];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

function StatusBadge({ s }: { s: PayStatus }) {
  const config: Record<PayStatus, { label: string; cls: string; icon: React.FC<any> }> = {
    tolangan:  { label: "To'langan",  cls: 'text-emerald-400', icon: CheckCircle2 },
    kutmoqda:  { label: 'Kutmoqda',   cls: 'text-amber-400',   icon: Clock        },
    bekor:     { label: 'Bekor',      cls: 'text-red-400',     icon: XCircle      },
  };
  const { label, cls, icon: Icon } = config[s];
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

function formatSum(n: number) {
  return n.toLocaleString('uz-UZ') + " so'm";
}

// ── Asosiy komponent ─────────────────────────────────────────────────────────

export function WebKassirScreen() {
  const [search, setSearch]     = useState('');
  const [metod, setMetod]       = useState('');
  const [status, setStatus]     = useState('');
  const [activeMenu, setMenu]   = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const [perPage, setPerPage]   = useState(10);

  // Statistika
  const bugunJami    = TOLOVLAR.filter(r => r.status === 'tolangan').reduce((s,r) => s+r.summa, 0);
  const kutmoqda     = TOLOVLAR.filter(r => r.status === 'kutmoqda').length;
  const tolangan     = TOLOVLAR.filter(r => r.status === 'tolangan').length;
  const naqd         = TOLOVLAR.filter(r => r.metod === 'naqd' && r.status === 'tolangan').reduce((s,r) => s+r.summa, 0);

  const filtered = useMemo(() => {
    let r = [...TOLOVLAR];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x => x.bemor.toLowerCase().includes(q) || x.id.toLowerCase().includes(q));
    }
    const mMap: Record<string,PayMethod> = { Naqd:'naqd', Karta:'karta', Payme:'payme', Click:'click', Uzum:'uzum' };
    if (metod) r = r.filter(x => x.metod === mMap[metod]);
    const sMap: Record<string,PayStatus> = { "To'langan":'tolangan', Kutmoqda:'kutmoqda', Bekor:'bekor' };
    if (status) r = r.filter(x => x.status === sMap[status]);
    return r;
  }, [search, metod, status]);

  return (
    <WebPlatformLayout title="Kassa" subtitle="To'lovlar va hisob-kitob">
      <div className="p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Bugungi tushum</p>
                <p className="text-xl font-bold text-white">{(bugunJami/1000000).toFixed(2)} mln</p>
                <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +12% kecha
                </p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Naqd pul</p>
                <p className="text-xl font-bold text-white">{(naqd/1000000).toFixed(2)} mln</p>
                <p className="text-xs text-slate-500 mt-0.5">Kassada</p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Banknote className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">To'langan</p>
                <p className="text-xl font-bold text-white">{tolangan}</p>
                <p className="text-xs text-slate-500 mt-0.5">Tranzaksiya</p>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-800/30 bg-amber-900/10 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-400 mb-1">Kutmoqda</p>
                <p className="text-xl font-bold text-white">{kutmoqda}</p>
                <p className="text-xs text-amber-400 mt-0.5">Tasdiqlanmagan</p>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Bemor yoki chek ID qidirish…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <button onClick={() => { setSearch(''); setMetod(''); setStatus(''); }}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <DropSel label="To'lov usuli" opts={['Naqd','Karta','Payme','Click','Uzum']} value={metod}  onChange={setMetod}  />
          <DropSel label="Holati"       opts={["To'langan",'Kutmoqda','Bekor']}         value={status} onChange={setStatus} />
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white text-sm transition-colors">
              <Receipt className="w-3.5 h-3.5" /> Smena hisoboti
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" /> TO'LOV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Chek ID / Vaqt','Bemor','Xizmat','Summa',"To'lov usuli",'Holati','Chek','Amallar'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page-1)*perPage, page*perPage).map((row, idx) => (
                  <motion.tr key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 py-3">
                      <div className="text-indigo-400 text-xs font-semibold">{row.id}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {row.vaqt}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-200 text-xs font-medium">{row.bemor}</td>
                    <td className="px-3 py-3 text-slate-300 text-xs">{row.xizmat}</td>
                    <td className="px-3 py-3">
                      <span className="text-white text-xs font-semibold">{formatSum(row.summa)}</span>
                    </td>
                    <td className="px-3 py-3"><MethodIcon m={row.metod} /></td>
                    <td className="px-3 py-3"><StatusBadge s={row.status} /></td>
                    <td className="px-3 py-3 text-slate-400 text-xs">{row.chek}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <div className="relative">
                          <button onClick={() => setMenu(activeMenu === row.id ? null : row.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          <AnimatePresence>
                            {activeMenu === row.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.93, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.93, y: 4 }}
                                transition={{ duration: 0.1 }}
                                onMouseLeave={() => setMenu(null)}
                                className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
                                {['Chek ko\'rish','Chek chiqarish','Qaytarish','Bekor qilish'].map((lbl, i) => (
                                  <button key={lbl} onClick={() => setMenu(null)}
                                    className={`w-full text-left px-3 py-2 text-xs transition-colors
                                      ${i >= 2 ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-slate-800'}`}>
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
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-600 text-sm">Ma'lumot topilmadi</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Ko'rsatish:</span>
              <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-sm focus:outline-none">
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span>— jami {filtered.length} ta</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <button disabled={page === 1} onClick={() => setPage(p => p-1)}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 transition-colors">←</button>
              <span>Sahifa {page}</span>
              <button disabled={page*perPage >= filtered.length} onClick={() => setPage(p => p+1)}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 transition-colors">→</button>
            </div>
          </div>
        </div>

      </div>
    </WebPlatformLayout>
  );
}

// ── DropSel ───────────────────────────────────────────────────────────────────

function DropSel({ label, opts, value, onChange }: {
  label: string; opts: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all
          ${value ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
        {value || label} <ChevronDown className="w-3.5 h-3.5" />
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
            {opts.map(o => (
              <button key={o} onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors
                  ${value === o ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-800'}`}>
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
