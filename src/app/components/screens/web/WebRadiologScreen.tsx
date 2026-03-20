/**
 * WebRadiologScreen — Radiolog ishchi oynasi (Web Platform)
 * DICOM ko'rish, xulosa yozish, navbat boshqaruvi
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, RefreshCw, ChevronDown, Eye,
  MoreVertical, FileText, Clock, CheckCircle2,
  AlertCircle, Monitor, Pencil, Send,
  Layers, ArrowRight,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

// ── Tiplar ───────────────────────────────────────────────────────────────────

type RadStatus = 'yangi' | 'korilmoqda' | 'xulosa_yozildi' | 'tasdiqlandi';
type Urgency   = 'kritik' | 'yuqori' | 'orta' | 'past';

interface RadRow {
  id: string;
  vaqt: string;
  bemor: string;
  gender: 'male' | 'female';
  age: number;
  urgency: Urgency;
  scanType: string;
  shifokor: string;
  status: RadStatus;
  xulosaBor: boolean;
  rasmlar: number;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const ROWS: RadRow[] = [
  { id:'RD-0091', vaqt:'09:30', bemor:'Hasanova Malika Yusupovna',   gender:'female', age:34, urgency:'kritik',  scanType:'MRT bosh miya',      shifokor:'Dr. Karimov',   status:'yangi',        xulosaBor:false, rasmlar:128 },
  { id:'RD-0090', vaqt:'09:15', bemor:'Toshmatov Jasur Rahimovich',  gender:'male',   age:47, urgency:'yuqori',  scanType:'KT ko\'krak',          shifokor:'Dr. Nazarov',   status:'korilmoqda',   xulosaBor:false, rasmlar:64  },
  { id:'RD-0089', vaqt:'08:58', bemor:'Yunusova Dilnoza Hamidovna',  gender:'female', age:29, urgency:'orta',    scanType:'Rentgen qo\'l',         shifokor:'Dr. Mirzayev',  status:'xulosa_yozildi',xulosaBor:true, rasmlar:4   },
  { id:'RD-0088', vaqt:'08:44', bemor:'Raximov Botir Aliyevich',     gender:'male',   age:61, urgency:'past',    scanType:'USG qorin',            shifokor:'Dr. Usmonov',   status:'tasdiqlandi',  xulosaBor:true,  rasmlar:12  },
  { id:'RD-0087', vaqt:'08:31', bemor:'Normatova Sarvinoz Bekovna',  gender:'female', age:22, urgency:'orta',    scanType:'MSKT umurtqa',         shifokor:'Dr. Karimov',   status:'yangi',        xulosaBor:false, rasmlar:312 },
  { id:'RD-0086', vaqt:'08:20', bemor:'Qodirov Sherzod Mansurovich', gender:'male',   age:55, urgency:'yuqori',  scanType:'MRT bel',              shifokor:'Dr. Nazarov',   status:'korilmoqda',   xulosaBor:false, rasmlar:256 },
  { id:'RD-0085', vaqt:'08:05', bemor:'Mirzayeva Lobar Erkinovna',   gender:'female', age:41, urgency:'past',    scanType:'KT bosh',              shifokor:'Dr. Mirzayev',  status:'tasdiqlandi',  xulosaBor:true,  rasmlar:96  },
  { id:'RD-0084', vaqt:'07:50', bemor:'Pulatov Kamol Yusufovich',    gender:'male',   age:38, urgency:'orta',    scanType:'KT appendiks',         shifokor:'Dr. Usmonov',   status:'xulosa_yozildi',xulosaBor:true, rasmlar:48  },
  { id:'RD-0083', vaqt:'07:35', bemor:'Xolmatov Eldor Nurboyevich',  gender:'male',   age:52, urgency:'kritik',  scanType:'MRT yurak',            shifokor:'Dr. Nazarov',   status:'tasdiqlandi',  xulosaBor:true,  rasmlar:192 },
  { id:'RD-0082', vaqt:'07:20', bemor:'Karimova Nodira Tohirovna',   gender:'female', age:45, urgency:'past',    scanType:'Rentgen ko\'krak',      shifokor:'Dr. Karimov',   status:'tasdiqlandi',  xulosaBor:true,  rasmlar:3   },
];

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ s }: { s: RadStatus }) {
  const cfg: Record<RadStatus, { label: string; cls: string; icon: React.FC<any> }> = {
    yangi:          { label: 'Yangi',          cls: 'text-sky-400',     icon: Clock        },
    korilmoqda:     { label: 'Ko\'rilmoqda',    cls: 'text-amber-400',   icon: Monitor      },
    xulosa_yozildi: { label: 'Xulosa yozildi', cls: 'text-indigo-400',  icon: FileText     },
    tasdiqlandi:    { label: 'Tasdiqlandi',    cls: 'text-emerald-400', icon: CheckCircle2 },
  };
  const { label, cls, icon: Icon } = cfg[s];
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${cls}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

function UrgencyBadge({ u }: { u: Urgency }) {
  const cfg: Record<Urgency, { label: string; cls: string }> = {
    kritik: { label: 'Kritik', cls: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    yuqori: { label: 'Yuqori', cls: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
    orta:   { label: "O'rta",  cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
    past:   { label: 'Past',   cls: 'bg-slate-600/40 text-slate-400 border border-slate-600/40' },
  };
  const { label, cls } = cfg[u];
  return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${cls}`}>{label}</span>;
}

// ── Xulosa panel ─────────────────────────────────────────────────────────────

function XulosaPaneli({ row, onClose }: { row: RadRow; onClose: () => void }) {
  const [text, setText] = useState(
    row.xulosaBor
      ? `Tekshiruv natijalari:\n\n${row.scanType} tekshiruvi o'tkazildi.\n\nPatologik o'zgarishlar aniqlanmadi. Anatomik tuzilmalar normal holatda.\n\nXulosa: Radiolog xulosasi.`
      : ''
  );
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 16 }}
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">{row.bemor}</h3>
            <p className="text-slate-400 text-sm mt-0.5">{row.id} • {row.scanType} • {row.rasmlar} ta rasm</p>
          </div>
          <UrgencyBadge u={row.urgency} />
        </div>

        {/* DICOM preview placeholder */}
        <div className="mx-6 mt-4 h-36 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-24 h-24 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Monitor className="w-8 h-8 text-slate-600" />
            </div>
          ))}
          <div className="text-slate-600 text-xs text-center">
            <Layers className="w-6 h-6 mx-auto mb-1" />
            {row.rasmlar} ta<br/>DICOM rasm
          </div>
        </div>

        {/* Xulosa */}
        <div className="px-6 py-4">
          <label className="text-slate-400 text-xs font-medium mb-2 block">Radiolog xulosasi</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={6}
            placeholder="Xulosa matnini yozing…"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 text-sm resize-none outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
            Yopish
          </button>
          <button className="flex-1 py-2.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-sm transition-colors flex items-center justify-center gap-2">
            <Pencil className="w-3.5 h-3.5" /> Saqlash
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Send className="w-3.5 h-3.5" /> Tasdiqlash
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Asosiy komponent ─────────────────────────────────────────────────────────

export function WebRadiologScreen() {
  const [search, setSearch]     = useState('');
  const [urgFilter, setUrg]     = useState('');
  const [statFilter, setStat]   = useState('');
  const [activeMenu, setMenu]   = useState<string | null>(null);
  const [xulosamRow, setXulosa] = useState<RadRow | null>(null);
  const [page, setPage]         = useState(1);
  const [perPage, setPerPage]   = useState(10);

  // Stats
  const yangi       = ROWS.filter(r => r.status === 'yangi').length;
  const korilmoqda  = ROWS.filter(r => r.status === 'korilmoqda').length;
  const tasdiqlandi = ROWS.filter(r => r.status === 'tasdiqlandi').length;
  const kritikCount = ROWS.filter(r => r.urgency === 'kritik').length;

  const filtered = useMemo(() => {
    let r = [...ROWS];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x => x.bemor.toLowerCase().includes(q) || x.id.toLowerCase().includes(q));
    }
    const uMap: Record<string,Urgency> = { Kritik:'kritik', Yuqori:'yuqori', "O'rta":'orta', Past:'past' };
    if (urgFilter) r = r.filter(x => x.urgency === uMap[urgFilter]);
    const sMap: Record<string,RadStatus> = {
      'Yangi':'yangi', "Ko'rilmoqda":'korilmoqda',
      'Xulosa yozildi':'xulosa_yozildi', 'Tasdiqlandi':'tasdiqlandi'
    };
    if (statFilter) r = r.filter(x => x.status === sMap[statFilter]);
    return r;
  }, [search, urgFilter, statFilter]);

  return (
    <WebPlatformLayout title="Radiolog ishchi oynasi" subtitle="DICOM tekshiruv va xulosa yozish">
      <div className="p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Yangi navbat',    value: yangi,       icon: Clock,        color: 'bg-slate-800/60 border-slate-700/60' },
            { label: "Ko'rilmoqda",     value: korilmoqda,  icon: Monitor,      color: 'bg-slate-800/60 border-slate-700/60' },
            { label: 'Tasdiqlangan',    value: tasdiqlandi, icon: CheckCircle2, color: 'bg-slate-800/60 border-slate-700/60' },
            { label: 'Shoshilinch',     value: kritikCount, icon: AlertCircle,  color: 'bg-red-900/20 border-red-800/40' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl border p-4 ${color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-white">{value}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/5">
                  <Icon className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Bemor yoki ID qidirish…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <button onClick={() => { setSearch(''); setUrg(''); setStat(''); }}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <DropSel label="Shoshilinchligi" opts={['Kritik','Yuqori',"O'rta",'Past']}
            value={urgFilter} onChange={setUrg} />
          <DropSel label="Holati" opts={['Yangi',"Ko'rilmoqda",'Xulosa yozildi','Tasdiqlandi']}
            value={statFilter} onChange={setStat} />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {['ID / Vaqt','Bemor','Jinsi/Yosh','Shoshilinchligi','Tekshiruv turi','Shifokor','Rasmlar','Holati','Xulosa','Amallar'].map(h => (
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
                    className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors
                      ${row.urgency === 'kritik' && row.status === 'yangi' ? 'bg-red-900/10' : ''}`}>
                    <td className="px-3 py-3">
                      <div className="text-indigo-400 text-xs font-semibold">{row.id}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {row.vaqt}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-slate-200 text-xs font-medium">{row.bemor}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-xs">
                      {row.gender === 'male' ? '♂' : '♀'} {row.age}
                    </td>
                    <td className="px-3 py-3"><UrgencyBadge u={row.urgency} /></td>
                    <td className="px-3 py-3 text-slate-300 text-xs font-medium">{row.scanType}</td>
                    <td className="px-3 py-3 text-slate-400 text-xs">{row.shifokor}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Layers className="w-3 h-3" /> {row.rasmlar}
                      </span>
                    </td>
                    <td className="px-3 py-3"><StatusBadge s={row.status} /></td>
                    <td className="px-3 py-3">
                      {row.xulosaBor
                        ? <span className="text-emerald-400 text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Bor
                          </span>
                        : <span className="text-slate-600 text-xs">—</span>
                      }
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setXulosa(row)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 text-xs transition-colors">
                          {row.xulosaBor ? <Eye className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                          {row.xulosaBor ? "Ko'r" : 'Yoz'}
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
                                className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
                                {["DICOM ochish", "Xulosa yozish", "Mutaxassisga yo'llash", "Shifokorga qaytarish"].map((lbl, i) => (
                                  <button key={lbl} onClick={() => setMenu(null)}
                                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2
                                      ${i === 3 ? 'text-amber-400 hover:bg-amber-500/10' : 'text-slate-300 hover:bg-slate-800'}`}>
                                    {i === 2 && <ArrowRight className="w-3 h-3" />}
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
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-600 text-sm">Ma'lumot topilmadi</td></tr>
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
              <button disabled={page===1} onClick={() => setPage(p=>p-1)}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 transition-colors">←</button>
              <span>Sahifa {page}</span>
              <button disabled={page*perPage>=filtered.length} onClick={() => setPage(p=>p+1)}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 transition-colors">→</button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {xulosamRow && <XulosaPaneli row={xulosamRow} onClose={() => setXulosa(null)} />}
      </AnimatePresence>
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
            className="absolute top-full mt-1 left-0 z-50 min-w-[150px] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
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
