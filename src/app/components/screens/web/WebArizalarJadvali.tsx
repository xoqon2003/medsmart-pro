/**
 * WebArizalarJadvali — Arizalar jadvali (Web Platform)
 * Operator / Radiolog / Mutaxassis uchun umumiy ariza ro'yxati
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, RefreshCw, ChevronDown, ChevronUp,
  Eye, MoreVertical, Download, Filter,
  UserPlus, Building2, User, Stethoscope,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { WebBemorModal } from './WebBemorModal';

// ── Tip lar ─────────────────────────────────────────────────────────────────

type Urgency    = 'kritik' | 'yuqori' | 'orta' | 'past';
type Status     = 'yangi' | 'jarayonda' | 'bajarildi' | 'bekor';
type ScanType   = 'MRT' | 'MSKT' | 'Rentgen' | 'KT' | 'USG' | 'PAKET' | 'Kasallik tarixi' | 'EKG';
type ArizachiType = 'doctor' | 'operator' | 'patient' | 'org';

interface ArizaRow {
  id: string;       // A-0-XXXX-25
  date: string;     // 03.09.25
  arizachiType: ArizachiType;
  bemor: string;
  gender: 'male' | 'female';
  age: number;
  urgency: Urgency;
  status: Status;
  hasFile: boolean;
  scanType: ScanType;
  shikoyat: 'none' | 'low' | 'high';   // circle color
  aiStatus: [number, number, number];   // 0=gray,1=blue,2=green each box
  ijroVaqti: string;
}

// ── Mock ma'lumotlar ─────────────────────────────────────────────────────────

const ROWS: ArizaRow[] = [
  { id:'A-0-0007-25', date:'03.09.25', arizachiType:'doctor',   bemor:'SAFAROVA SABINA RAXMATULLAYEVNA',   gender:'female', age:25, urgency:'kritik',  status:'yangi',      hasFile:true,  scanType:'MRT',            shikoyat:'high', aiStatus:[1,2,0], ijroVaqti:'2 soat'  },
  { id:'A-0-0008-25', date:'03.09.25', arizachiType:'doctor',   bemor:'ALIBOYEV SHUXRAT HAMDAMBOYEVICH',   gender:'male',   age:77, urgency:'yuqori',  status:'yangi',      hasFile:true,  scanType:'PAKET',          shikoyat:'high', aiStatus:[2,1,1], ijroVaqti:'6 soat'  },
  { id:'A-0-0009-25', date:'03.09.25', arizachiType:'doctor',   bemor:'XUDOYQULOV SANJAR SHAHARBOYEVICH',  gender:'male',   age:41, urgency:'orta',    status:'yangi',      hasFile:true,  scanType:'MSKT',           shikoyat:'none', aiStatus:[0,0,0], ijroVaqti:'1 kun'   },
  { id:'A-0-0006-25', date:'03.09.25', arizachiType:'doctor',   bemor:'AKBARALIYEV JAVHONGIR JAMSHIDOVICH',gender:'male',   age:23, urgency:'past',    status:'yangi',      hasFile:true,  scanType:'Rentgen',        shikoyat:'none', aiStatus:[0,0,0], ijroVaqti:'05.09.25'},
  { id:'A-0-0005-25', date:'01.09.25', arizachiType:'org',      bemor:'G\'AYBULLAYEV DAVRON OKTAMOVICH',   gender:'male',   age:18, urgency:'past',    status:'yangi',      hasFile:true,  scanType:'KT',             shikoyat:'high', aiStatus:[0,0,0], ijroVaqti:'04.09.25'},
  { id:'A-0-0004-25', date:'02.09.25', arizachiType:'org',      bemor:'DAVRONOV SALIM TANGRIYIVICH',       gender:'male',   age:43, urgency:'past',    status:'jarayonda',  hasFile:true,  scanType:'KT',             shikoyat:'none', aiStatus:[0,2,0], ijroVaqti:'04.09.25'},
  { id:'A-0-0003-25', date:'02.09.25', arizachiType:'org',      bemor:'OLIMOV SALIX KARIMOVICH',           gender:'male',   age:56, urgency:'past',    status:'bajarildi',  hasFile:true,  scanType:'KT',             shikoyat:'high', aiStatus:[2,2,2], ijroVaqti:'05.09.25'},
  { id:'A-0-0002-25', date:'01.09.25', arizachiType:'org',      bemor:'ANONIM',                            gender:'female', age:33, urgency:'past',    status:'jarayonda',  hasFile:true,  scanType:'Kasallik tarixi', shikoyat:'high', aiStatus:[2,2,0], ijroVaqti:'04.09.25'},
  { id:'A-0-0001-25', date:'29.08.25', arizachiType:'org',      bemor:'YURKOV VALI XXX',                   gender:'female', age:62, urgency:'past',    status:'bekor',      hasFile:true,  scanType:'MRT',            shikoyat:'high', aiStatus:[0,0,0], ijroVaqti:'01.09.25'},
  { id:'A-0-0010-25', date:'04.09.25', arizachiType:'patient',  bemor:'NORMATOVA DILRABO HASANOVNA',       gender:'female', age:29, urgency:'yuqori',  status:'jarayonda',  hasFile:false, scanType:'USG',            shikoyat:'low',  aiStatus:[2,1,0], ijroVaqti:'06.09.25'},
  { id:'A-0-0011-25', date:'04.09.25', arizachiType:'doctor',   bemor:'TOSHMATOV JASUR RAHIMOVICH',        gender:'male',   age:44, urgency:'kritik',  status:'bajarildi',  hasFile:true,  scanType:'MRT',            shikoyat:'high', aiStatus:[2,2,2], ijroVaqti:'04.09.25'},
  { id:'A-0-0012-25', date:'04.09.25', arizachiType:'operator', bemor:'KARIMOV BOBUR ALIYEVICH',           gender:'male',   age:38, urgency:'orta',    status:'yangi',      hasFile:true,  scanType:'EKG',            shikoyat:'none', aiStatus:[1,0,0], ijroVaqti:'07.09.25'},
];

// ── Yordamchi komponentlar ───────────────────────────────────────────────────

function UrgencyBadge({ u }: { u: Urgency }) {
  const map: Record<Urgency, { label: string; cls: string }> = {
    kritik: { label: "Kritik",  cls: "bg-red-500/20 text-red-400 border border-red-500/30"    },
    yuqori: { label: "Yuqori",  cls: "bg-orange-500/20 text-orange-400 border border-orange-500/30" },
    orta:   { label: "O'rta",   cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
    past:   { label: "Past",    cls: "bg-slate-600/40 text-slate-400 border border-slate-600/40"    },
  };
  const { label, cls } = map[u];
  return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${cls}`}>{label}</span>;
}

function StatusBadge({ s }: { s: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    yangi:      { label: "Yangi",       cls: "text-slate-300"                },
    jarayonda:  { label: "Jarayonda",   cls: "text-blue-400"                 },
    bajarildi:  { label: "Bajarildi",   cls: "text-emerald-400"              },
    bekor:      { label: "Bekor qilindi", cls: "text-red-400 line-through"   },
  };
  const { label, cls } = map[s];
  return <span className={`text-xs font-medium ${cls}`}>{label}</span>;
}

function ArizachiIcon({ type }: { type: ArizachiType }) {
  const cls = "w-7 h-7 rounded-lg flex items-center justify-center shrink-0";
  if (type === 'doctor')   return <div className={`${cls} bg-blue-500/15`}><Stethoscope className="w-3.5 h-3.5 text-blue-400" /></div>;
  if (type === 'org')      return <div className={`${cls} bg-violet-500/15`}><Building2   className="w-3.5 h-3.5 text-violet-400" /></div>;
  if (type === 'patient')  return <div className={`${cls} bg-emerald-500/15`}><User       className="w-3.5 h-3.5 text-emerald-400" /></div>;
  return                          <div className={`${cls} bg-slate-600/30`}><UserPlus     className="w-3.5 h-3.5 text-slate-400" /></div>;
}

function ShikoyatDot({ level }: { level: 'none' | 'low' | 'high' }) {
  if (level === 'high') return <div className="w-4 h-4 rounded-full bg-sky-400/30 border-2 border-sky-400 mx-auto" />;
  if (level === 'low')  return <div className="w-4 h-4 rounded-full bg-slate-600/40 border border-slate-500 mx-auto" />;
  return                       <div className="w-4 h-4 rounded-full bg-slate-700 border border-slate-700 mx-auto" />;
}

// 0=gray, 1=blue, 2=green
function AIStatusBoxes({ boxes }: { boxes: [number,number,number] }) {
  const color = (v: number) =>
    v === 2 ? 'bg-emerald-500' : v === 1 ? 'bg-sky-500' : 'bg-slate-700';
  return (
    <div className="flex gap-1">
      {boxes.map((v, i) => (
        <div key={i} className={`w-5 h-5 rounded-sm ${color(v)}`} />
      ))}
    </div>
  );
}

// ── Modul-darajali konstantalar ──────────────────────────────────────────────

const URGENCY_OPTS  = ['Hammasi', 'Kritik', 'Yuqori', "O'rta", 'Past'];
const STATUS_OPTS   = ['Hammasi', 'Yangi', 'Jarayonda', 'Bajarildi', 'Bekor qilindi'];
const SCAN_OPTS     = ['Hammasi', 'MRT', 'MSKT', 'Rentgen', 'KT', 'USG', 'PAKET', 'EKG'];

// Render ichida qayta yaratilmaslik uchun modul darajasida e'lon qilingan
const STATUS_MAP: Record<string, Status> = {
  'Yangi': 'yangi', 'Jarayonda': 'jarayonda',
  'Bajarildi': 'bajarildi', 'Bekor qilindi': 'bekor',
};

const URGENCY_LABEL: Record<Urgency, string> = {
  kritik: 'Kritik', yuqori: 'Yuqori', orta: "O'rta", past: 'Past',
};

// SortIcon — komponent tashqarisida, har renderda qayta yaratilmaydi
function SortIcon({ field, sortField, sortDir }: {
  field: 'id' | 'ijro';
  sortField: 'id' | 'ijro' | null;
  sortDir: 'asc' | 'desc';
}) {
  if (sortField !== field) return <ChevronDown className="w-3 h-3 inline ml-0.5 opacity-30" />;
  return sortDir === 'asc'
    ? <ChevronUp   className="w-3 h-3 inline ml-0.5 text-indigo-400" />
    : <ChevronDown className="w-3 h-3 inline ml-0.5 text-indigo-400" />;
}

function DropFilter({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = value && value !== 'Hammasi';
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all
          ${active
            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
          }`}
      >
        {active ? value : label}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            onMouseLeave={() => setOpen(false)}
            className="absolute top-full mt-1 left-0 z-50 min-w-[140px] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
          >
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt === 'Hammasi' ? '' : opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors
                  ${value === opt || (!value && opt === 'Hammasi')
                    ? 'bg-indigo-600/20 text-indigo-300'
                    : 'text-slate-300 hover:bg-slate-800'
                  }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WebArizalarJadvali() {
  const [search, setSearch]         = useState('');
  const [urgency, setUrgency]       = useState('');
  const [scanType, setScanType]     = useState('');
  const [status, setStatus]         = useState('');
  const [sortField, setSortField]   = useState<'id'|'ijro'|null>(null);
  const [sortDir, setSortDir]       = useState<'asc'|'desc'>('asc');
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string|null>(null);
  const [page, setPage]             = useState(1);
  const [perPage, setPerPage]       = useState(10);
  const [bemorModal, setBemorModal] = useState(false);

  const filtered = useMemo(() => {
    let r = ROWS.filter(x => {
      if (search) {
        const q = search.toLowerCase();
        if (!x.bemor.toLowerCase().includes(q) && !x.id.toLowerCase().includes(q)) return false;
      }
      if (urgency  && URGENCY_LABEL[x.urgency] !== urgency)  return false;
      if (scanType && x.scanType !== scanType)                return false;
      if (status   && STATUS_MAP[status] !== x.status)        return false;
      return true;
    });
    if (sortField === 'id') {
      r = [...r].sort((a, b) => sortDir === 'asc'
        ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id));
    } else if (sortField === 'ijro') {
      r = [...r].sort((a, b) => sortDir === 'asc'
        ? a.ijroVaqti.localeCompare(b.ijroVaqti) : b.ijroVaqti.localeCompare(a.ijroVaqti));
    }
    return r;
  }, [search, urgency, scanType, status, sortField, sortDir]);

  const thCls = "text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3 whitespace-nowrap select-none cursor-pointer hover:text-slate-300 transition-colors";

  const toggleSort = (f: 'id'|'ijro') => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(f); setSortDir('asc'); }
  };

  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  };

  return (
    <>
    <AnimatePresence>
      {bemorModal && <WebBemorModal onClose={() => setBemorModal(false)} />}
    </AnimatePresence>
    <WebPlatformLayout title="Arizalar jadvali" subtitle="Barcha arizalar ro'yxati">
      <div className="p-4 space-y-3">

        {/* ── FILTER BAR ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="F.I.O / IDsi / TK orqali qidirish"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          {/* Refresh */}
          <button onClick={() => { setSearch(''); setUrgency(''); setScanType(''); setStatus(''); }}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>

          <DropFilter label="Shoshilinchligi" options={URGENCY_OPTS} value={urgency}  onChange={setUrgency}  />
          <DropFilter label="Tekshiruv turi"  options={SCAN_OPTS}    value={scanType} onChange={setScanType} />
          <DropFilter label="Arizasi holati"  options={STATUS_OPTS}  value={status}   onChange={setStatus}   />

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white text-sm transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Kengaytirilgan qidiruv
          </button>

          <button
            onClick={() => setBemorModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors ml-auto">
            <UserPlus className="w-3.5 h-3.5" />
            BEMOR
          </button>
        </div>

        {/* ── TABLE ── */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="rounded border-slate-600 bg-slate-800 accent-indigo-500"
                    />
                  </th>
                  <th className={thCls} onClick={() => toggleSort('id')}>
                    ID <SortIcon field="id" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className={thCls}>Arizachi</th>
                  <th className={thCls}>Bemor</th>
                  <th className={thCls}>Jinsi/<br/>Yoshi</th>
                  <th className={thCls}>Shoshilinchligi</th>
                  <th className={thCls}>Statusi</th>
                  <th className={thCls}>Ma'lumoti</th>
                  <th className={thCls}>Tekshiruv<br/>turi</th>
                  <th className={thCls}>Shikoyati</th>
                  <th className={thCls}>AI/Ariza<br/>holati</th>
                  <th className={thCls} onClick={() => toggleSort('ijro')}>
                    Ijro vaqti <SortIcon field="ijro" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className={thCls}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * perPage, page * perPage).map((row, idx) => {
                  const isSel = selected.has(row.id);
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`border-b border-slate-800/60 transition-colors ${
                        isSel ? 'bg-indigo-600/10' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => {
                            const s = new Set(selected);
                            isSel ? s.delete(row.id) : s.add(row.id);
                            setSelected(s);
                          }}
                          className="rounded border-slate-600 bg-slate-800 accent-indigo-500"
                        />
                      </td>

                      {/* ID */}
                      <td className="px-3 py-3">
                        <div className="text-indigo-400 text-xs font-semibold hover:text-indigo-300 cursor-pointer">
                          {row.id}
                        </div>
                        <div className="text-slate-600 text-xs mt-0.5">{row.date}</div>
                      </td>

                      {/* Arizachi */}
                      <td className="px-3 py-3">
                        <ArizachiIcon type={row.arizachiType} />
                      </td>

                      {/* Bemor */}
                      <td className="px-3 py-3">
                        <span className="text-slate-200 text-xs font-medium leading-tight">
                          {row.bemor}
                        </span>
                      </td>

                      {/* Jinsi/Yoshi */}
                      <td className="px-3 py-3 text-center">
                        <span className="text-slate-300 text-xs">
                          {row.gender === 'male' ? '♂' : '♀'} {row.age}
                        </span>
                      </td>

                      {/* Shoshilinchligi */}
                      <td className="px-3 py-3">
                        <UrgencyBadge u={row.urgency} />
                      </td>

                      {/* Statusi */}
                      <td className="px-3 py-3">
                        <StatusBadge s={row.status} />
                      </td>

                      {/* Ma'lumoti */}
                      <td className="px-3 py-3 text-center">
                        {row.hasFile ? (
                          <button className="text-emerald-500 hover:text-emerald-400 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-700 text-xs">—</span>
                        )}
                      </td>

                      {/* Tekshiruv turi */}
                      <td className="px-3 py-3">
                        <span className="text-slate-300 text-xs font-medium">{row.scanType}</span>
                      </td>

                      {/* Shikoyati */}
                      <td className="px-3 py-3 text-center">
                        <ShikoyatDot level={row.shikoyat} />
                      </td>

                      {/* AI holati */}
                      <td className="px-3 py-3">
                        <AIStatusBoxes boxes={row.aiStatus} />
                      </td>

                      {/* Ijro vaqti */}
                      <td className="px-3 py-3">
                        <span className="text-slate-300 text-xs">{row.ijroVaqti}</span>
                      </td>

                      {/* Amallar */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            <AnimatePresence>
                              {activeMenu === row.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.92, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.92, y: 4 }}
                                  transition={{ duration: 0.1 }}
                                  onMouseLeave={() => setActiveMenu(null)}
                                  className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
                                >
                                  {['Ko\'rish', 'Tahrirlash', 'Yuklab olish', 'Arxivlash', 'O\'chirish'].map((label, i) => (
                                    <button key={label}
                                      onClick={() => setActiveMenu(null)}
                                      className={`w-full text-left px-3 py-2 text-xs transition-colors
                                        ${i === 4
                                          ? 'text-red-400 hover:bg-red-500/10'
                                          : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center text-slate-600 text-sm">
                      Hech qanday ariza topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION ── */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Ko'rsatish</span>
              <select
                value={perPage}
                onChange={e => setPerPage(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-sm focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>— jami {filtered.length} ta</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span>
                {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} / {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, Math.ceil(filtered.length / perPage)) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                      ${page === p
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / perPage), p + 1))}
                  disabled={page >= Math.ceil(filtered.length / perPage)}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </WebPlatformLayout>
    </>
  );
}
