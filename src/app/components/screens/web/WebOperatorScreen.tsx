/**
 * WebOperatorScreen — Operator paneli (Web Platform)
 * Yangi arizalarni qabul qilish, radiolog tayinlash, holat kuzatuv
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, RefreshCw, ChevronDown, ChevronUp,
  Eye, MoreVertical, UserPlus, Clock, CheckCircle2,
  XCircle, AlertCircle, Filter, ArrowRight,
  Inbox, Activity, TrendingUp, Users,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

// ── Tiplar ───────────────────────────────────────────────────────────────────

type Status = 'yangi' | 'jarayonda' | 'tayinlangan' | 'bekor';
type Urgency = 'kritik' | 'yuqori' | 'orta' | 'past';
type ScanType = 'MRT' | 'KT' | 'Rentgen' | 'USG' | 'MSKT' | 'EKG';

interface ArizaItem {
  id: string;
  vaqt: string;
  bemor: string;
  tel: string;
  gender: 'male' | 'female';
  age: number;
  urgency: Urgency;
  status: Status;
  scanType: ScanType;
  shifokor: string;
  radiolog: string | null;
  izoh: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const ARIZALAR: ArizaItem[] = [
  { id:'OP-0041', vaqt:'09:15', bemor:'Hasanova Malika Yusupovna',      tel:'+998 90 123-45-67', gender:'female', age:34, urgency:'kritik',  status:'yangi',      scanType:'MRT',    shifokor:'Dr. Karimov',    radiolog:null,           izoh:'Bosh miya shikastlanishi shubhasi' },
  { id:'OP-0040', vaqt:'09:02', bemor:'Toshmatov Jasur Rahimovich',     tel:'+998 91 234-56-78', gender:'male',   age:47, urgency:'yuqori',  status:'yangi',      scanType:'KT',     shifokor:'Dr. Nazarov',    radiolog:null,           izoh:'Ko\'krak qafasi tekshiruvi' },
  { id:'OP-0039', vaqt:'08:58', bemor:'Yunusova Dilnoza Hamidovna',     tel:'+998 93 345-67-89', gender:'female', age:29, urgency:'orta',    status:'jarayonda',  scanType:'Rentgen',shifokor:'Dr. Mirzayev',   radiolog:'Rad. Sotvoldiyev', izoh:'O\'ng qo\'l sinigi' },
  { id:'OP-0038', vaqt:'08:44', bemor:'Raximov Botir Aliyevich',        tel:'+998 94 456-78-90', gender:'male',   age:61, urgency:'past',    status:'tayinlangan',scanType:'USG',    shifokor:'Dr. Usmonov',    radiolog:'Rad. Ergashev', izoh:'Qorin bo\'shlig\'i tekshiruvi' },
  { id:'OP-0037', vaqt:'08:31', bemor:'Normatova Sarvinoz Bekovna',     tel:'+998 95 567-89-01', gender:'female', age:22, urgency:'orta',    status:'tayinlangan',scanType:'MSKT',   shifokor:'Dr. Karimov',    radiolog:'Rad. Sotvoldiyev', izoh:'Umurtqa pog\'onasi' },
  { id:'OP-0036', vaqt:'08:20', bemor:'Qodirov Sherzod Mansurovich',    tel:'+998 97 678-90-12', gender:'male',   age:55, urgency:'yuqori',  status:'jarayonda',  scanType:'MRT',    shifokor:'Dr. Nazarov',    radiolog:'Rad. Tursunov', izoh:'Bel og\'rig\'i, 3 oy davom etgan' },
  { id:'OP-0035', vaqt:'08:05', bemor:'Abdullayeva Nozima Tohirovna',   tel:'+998 98 789-01-23', gender:'female', age:41, urgency:'past',    status:'bekor',      scanType:'EKG',    shifokor:'Dr. Mirzayev',   radiolog:null,           izoh:'Bemor kelmadi' },
  { id:'OP-0034', vaqt:'07:58', bemor:'Pulatov Kamol Yusufovich',       tel:'+998 99 890-12-34', gender:'male',   age:38, urgency:'orta',    status:'tayinlangan',scanType:'KT',     shifokor:'Dr. Usmonov',    radiolog:'Rad. Ergashev', izoh:'Appenditsit shubhasi' },
  { id:'OP-0033', vaqt:'07:45', bemor:'Ismoilova Feruza Baxtiyorovna',  tel:'+998 90 901-23-45', gender:'female', age:26, urgency:'past',    status:'tayinlangan',scanType:'USG',    shifokor:'Dr. Karimov',    radiolog:'Rad. Tursunov', izoh:'Homiladorlik kuzatuvi' },
  { id:'OP-0032', vaqt:'07:30', bemor:'Xolmatov Eldor Nurboyevich',     tel:'+998 91 012-34-56', gender:'male',   age:52, urgency:'kritik',  status:'tayinlangan',scanType:'MRT',    shifokor:'Dr. Nazarov',    radiolog:'Rad. Sotvoldiyev', izoh:'Infarkt shubhasi — SHOSHILINCH' },
];

const RADIOLOGLAR = ['Rad. Sotvoldiyev', 'Rad. Ergashev', 'Rad. Tursunov', 'Rad. Xoliqov'];

// ── Statistika kartochkasi ────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.FC<any>; label: string; value: number | string;
  sub: string; color: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
        <div className="p-2 rounded-xl bg-white/5">
          <Icon className="w-5 h-5 text-slate-300" />
        </div>
      </div>
    </div>
  );
}

// ── Urgency badge ────────────────────────────────────────────────────────────

function UrgencyBadge({ u }: { u: Urgency }) {
  const map: Record<Urgency, { label: string; cls: string }> = {
    kritik: { label: 'Kritik', cls: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    yuqori: { label: 'Yuqori', cls: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
    orta:   { label: "O'rta",  cls: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
    past:   { label: 'Past',   cls: 'bg-slate-600/40 text-slate-400 border border-slate-600/40' },
  };
  const { label, cls } = map[u];
  return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${cls}`}>{label}</span>;
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ s }: { s: Status }) {
  const map: Record<Status, { label: string; icon: React.FC<any>; cls: string }> = {
    yangi:       { label: 'Yangi',       icon: Inbox,         cls: 'text-sky-400' },
    jarayonda:   { label: 'Jarayonda',   icon: Activity,      cls: 'text-amber-400' },
    tayinlangan: { label: 'Tayinlangan', icon: CheckCircle2,  cls: 'text-emerald-400' },
    bekor:       { label: 'Bekor',       icon: XCircle,       cls: 'text-red-400' },
  };
  const { label, icon: Icon, cls } = map[s];
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Tayinlash modali ─────────────────────────────────────────────────────────

function TayinlashModal({ ariza, onClose, onSave }: {
  ariza: ArizaItem;
  onClose: () => void;
  onSave: (id: string, radiolog: string) => void;
}) {
  const [sel, setSel] = useState(ariza.radiolog || RADIOLOGLAR[0]);
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
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl"
      >
        <h3 className="text-white font-semibold text-lg mb-1">Radiolog tayinlash</h3>
        <p className="text-slate-400 text-sm mb-5">{ariza.bemor} — {ariza.scanType}</p>

        <div className="space-y-3 mb-6">
          {RADIOLOGLAR.map(r => (
            <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors
              ${sel === r ? 'border-indigo-500/50 bg-indigo-600/10' : 'border-slate-700 hover:border-slate-600'}`}>
              <input type="radio" name="radiolog" value={r}
                checked={sel === r} onChange={() => setSel(r)}
                className="accent-indigo-500" />
              <div>
                <p className="text-slate-200 text-sm font-medium">{r}</p>
                <p className="text-slate-500 text-xs">Band emas • 3 aktiv ariza</p>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
            Bekor qilish
          </button>
          <button onClick={() => { onSave(ariza.id, sel); onClose(); }}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            Tayinlash <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Asosiy komponent ─────────────────────────────────────────────────────────

export function WebOperatorScreen() {
  const [rows, setRows]             = useState<ArizaItem[]>(ARIZALAR);
  const [search, setSearch]         = useState('');
  const [urgFilter, setUrgFilter]   = useState('');
  const [statFilter, setStatFilter] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [modalAriza, setModalAriza] = useState<ArizaItem | null>(null);
  const [sortDir, setSortDir]       = useState<'asc'|'desc'>('asc');
  const [perPage, setPerPage]       = useState(10);
  const [page, setPage]             = useState(1);

  // Stats
  const yangi       = rows.filter(r => r.status === 'yangi').length;
  const jarayonda   = rows.filter(r => r.status === 'jarayonda').length;
  const tayinlangan = rows.filter(r => r.status === 'tayinlangan').length;
  const kritik      = rows.filter(r => r.urgency === 'kritik').length;

  const filtered = useMemo(() => {
    let r = [...rows];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x => x.bemor.toLowerCase().includes(q) || x.id.toLowerCase().includes(q));
    }
    const urgMap: Record<string, Urgency> = { Kritik:'kritik', Yuqori:'yuqori', "O'rta":'orta', Past:'past' };
    if (urgFilter)  r = r.filter(x => x.urgency  === urgMap[urgFilter]);
    const statMap: Record<string, Status> = { Yangi:'yangi', Jarayonda:'jarayonda', Tayinlangan:'tayinlangan', Bekor:'bekor' };
    if (statFilter) r = r.filter(x => x.status === statMap[statFilter]);
    r.sort((a, b) => sortDir === 'asc'
      ? a.vaqt.localeCompare(b.vaqt)
      : b.vaqt.localeCompare(a.vaqt));
    return r;
  }, [rows, search, urgFilter, statFilter, sortDir]);

  const paginated = filtered.slice((page-1)*perPage, page*perPage);

  const assignRadiolog = (id: string, radiolog: string) => {
    setRows(prev => prev.map(r =>
      r.id === id ? { ...r, radiolog, status: 'tayinlangan' } : r
    ));
  };

  return (
    <WebPlatformLayout title="Operator paneli" subtitle="Arizalar qabuli va radiolog tayinlash">
      <div className="p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Inbox}        label="Yangi arizalar"  value={yangi}       sub="Kutmoqda" color="bg-slate-800/60 border-slate-700/60" />
          <StatCard icon={Activity}     label="Jarayonda"       value={jarayonda}   sub="Ishlanmoqda" color="bg-slate-800/60 border-slate-700/60" />
          <StatCard icon={CheckCircle2} label="Tayinlangan"     value={tayinlangan} sub="Bugun" color="bg-slate-800/60 border-slate-700/60" />
          <StatCard icon={AlertCircle}  label="Shoshilinch"     value={kritik}      sub="Zudlik bilan" color="bg-red-900/20 border-red-800/40" />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Bemor yoki ariza ID qidirish…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <button onClick={() => { setSearch(''); setUrgFilter(''); setStatFilter(''); }}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Urgency filter */}
          <DropSel label="Shoshilinchligi" opts={["O'rta",'Yuqori','Kritik','Past']} value={urgFilter} onChange={setUrgFilter} />
          <DropSel label="Holati" opts={['Yangi','Jarayonda','Tayinlangan','Bekor']} value={statFilter} onChange={setStatFilter} />

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white text-sm transition-colors">
            <Filter className="w-3.5 h-3.5" /> Kengaytirilgan
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors ml-auto">
            <UserPlus className="w-3.5 h-3.5" /> YANGI ARIZA
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    { label: 'ID / Vaqt', onClick: () => setSortDir(d => d === 'asc' ? 'desc' : 'asc') },
                    { label: 'Bemor' },
                    { label: 'Jinsi/Yosh' },
                    { label: 'Shoshilinchligi' },
                    { label: 'Tekshiruv turi' },
                    { label: 'Holati' },
                    { label: 'Radiolog' },
                    { label: 'Izoh' },
                    { label: 'Amallar' },
                  ].map(({ label, onClick }) => (
                    <th key={label}
                      onClick={onClick}
                      className={`text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap
                        ${onClick ? 'cursor-pointer hover:text-slate-300 select-none' : ''}`}>
                      {label}
                      {label === 'ID / Vaqt' && (
                        sortDir === 'asc'
                          ? <ChevronUp   className="w-3 h-3 inline ml-0.5 text-indigo-400" />
                          : <ChevronDown className="w-3 h-3 inline ml-0.5 text-indigo-400" />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, idx) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors
                      ${row.urgency === 'kritik' && row.status === 'yangi' ? 'bg-red-900/10' : ''}`}
                  >
                    <td className="px-3 py-3">
                      <div className="text-indigo-400 text-xs font-semibold">{row.id}</div>
                      <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {row.vaqt}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-slate-200 text-xs font-medium">{row.bemor}</div>
                      <div className="text-slate-600 text-xs mt-0.5">{row.tel}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-xs">
                      {row.gender === 'male' ? '♂' : '♀'} {row.age}
                    </td>
                    <td className="px-3 py-3"><UrgencyBadge u={row.urgency} /></td>
                    <td className="px-3 py-3">
                      <span className="text-slate-300 text-xs font-medium">{row.scanType}</span>
                    </td>
                    <td className="px-3 py-3"><StatusBadge s={row.status} /></td>
                    <td className="px-3 py-3">
                      {row.radiolog
                        ? <span className="text-emerald-400 text-xs font-medium">{row.radiolog}</span>
                        : <button
                            onClick={() => setModalAriza(row)}
                            className="text-xs px-2 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 transition-colors">
                            + Tayinlash
                          </button>
                      }
                    </td>
                    <td className="px-3 py-3 max-w-[180px]">
                      <span className="text-slate-400 text-xs truncate block">{row.izoh}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
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
                                onMouseLeave={() => setActiveMenu(null)}
                                className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
                              >
                                {['Ko\'rish', 'Tahrirlash', 'Radiolog tayinlash', 'Bekor qilish'].map((lbl, i) => (
                                  <button key={lbl}
                                    onClick={() => {
                                      if (lbl === 'Radiolog tayinlash') setModalAriza(row);
                                      setActiveMenu(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs transition-colors
                                      ${i === 3 ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-slate-800'}`}>
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
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-600 text-sm">
                      Ariza topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Ko'rsatish:</span>
              <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-sm focus:outline-none">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>— jami {filtered.length} ta</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <button disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-40">
                ←
              </button>
              <span>Sahifa {page}</span>
              <button disabled={page * perPage >= filtered.length}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-40">
                →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalAriza && (
          <TayinlashModal
            ariza={modalAriza}
            onClose={() => setModalAriza(null)}
            onSave={assignRadiolog}
          />
        )}
      </AnimatePresence>
    </WebPlatformLayout>
  );
}

// ── DropSel helper ────────────────────────────────────────────────────────────

function DropSel({ label, opts, value, onChange }: {
  label: string; opts: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all
          ${value
            ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
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
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
              Hammasi
            </button>
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
