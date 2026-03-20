/**
 * WebSpecialistScreen — Mutaxassis konsultatsiya oynasi (Web Platform)
 * Yo'llanma arizalar, konsultatsiya yozish, jadval boshqaruvi
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, RefreshCw, ChevronDown,
  Eye, MoreVertical, Clock, CheckCircle2,
  XCircle, Video, FileText, Calendar,
  UserCheck, Activity, Pencil, Send, X,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

// ── Tiplar ───────────────────────────────────────────────────────────────────

type ConsStatus = 'yangi' | 'kutmoqda' | 'jarayonda' | 'yakunlandi' | 'bekor';
type ConsType   = 'klinika' | 'online';
type Urgency    = 'kritik' | 'yuqori' | 'orta' | 'past';

interface ConsRow {
  id: string;
  vaqt: string;
  sana: string;
  bemor: string;
  gender: 'male' | 'female';
  age: number;
  urgency: Urgency;
  mutaxassis: string;
  sohasi: string;
  type: ConsType;
  status: ConsStatus;
  shifokor: string;
  xulosaBor: boolean;
  izoh: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const ROWS: ConsRow[] = [
  { id:'CN-0055', vaqt:'10:00', sana:'19.03.25', bemor:'Hasanova Malika Yusupovna',    gender:'female', age:34, urgency:'kritik', mutaxassis:'Dr. Tursunov',   sohasi:'Neyrolog',      type:'klinika', status:'yangi',     shifokor:'Dr. Karimov',  xulosaBor:false, izoh:'Bosh og\'rig\'i, qayta-qayta hushdan ketish' },
  { id:'CN-0054', vaqt:'10:30', sana:'19.03.25', bemor:'Toshmatov Jasur Rahimovich',  gender:'male',   age:47, urgency:'yuqori', mutaxassis:'Dr. Ergashev',   sohasi:'Kardiolog',     type:'klinika', status:'kutmoqda',  shifokor:'Dr. Nazarov',  xulosaBor:false, izoh:'Yurak aritmiyasi shikoyati' },
  { id:'CN-0053', vaqt:'11:00', sana:'19.03.25', bemor:'Yunusova Dilnoza Hamidovna',  gender:'female', age:29, urgency:'orta',   mutaxassis:'Dr. Xoliqov',    sohasi:'Ortoped',       type:'online',  status:'jarayonda', shifokor:'Dr. Mirzayev', xulosaBor:false, izoh:'Tizza bo\'g\'imi og\'rig\'i' },
  { id:'CN-0052', vaqt:'09:00', sana:'19.03.25', bemor:'Raximov Botir Aliyevich',     gender:'male',   age:61, urgency:'past',   mutaxassis:'Dr. Tursunov',   sohasi:'Neyrolog',      type:'klinika', status:'yakunlandi', shifokor:'Dr. Usmonov',  xulosaBor:true,  izoh:'Yuqori bosim, bosh aylanishi' },
  { id:'CN-0051', vaqt:'14:00', sana:'19.03.25', bemor:'Normatova Sarvinoz Bekovna',  gender:'female', age:22, urgency:'orta',   mutaxassis:'Dr. Sotvoldiyev',sohasi:'Gastroenterolog',type:'online', status:'yangi',     shifokor:'Dr. Karimov',  xulosaBor:false, izoh:'Qorin og\'rig\'i, hazm muammosi' },
  { id:'CN-0050', vaqt:'15:30', sana:'19.03.25', bemor:'Qodirov Sherzod Mansurovich', gender:'male',  age:55, urgency:'yuqori', mutaxassis:'Dr. Ergashev',   sohasi:'Kardiolog',     type:'klinika', status:'kutmoqda',  shifokor:'Dr. Nazarov',  xulosaBor:false, izoh:'Ko\'krak og\'rig\'i, nafas qisishi' },
  { id:'CN-0049', vaqt:'09:30', sana:'18.03.25', bemor:'Abdullayeva Nozima Tohirovna',gender:'female', age:41, urgency:'past',  mutaxassis:'Dr. Xoliqov',    sohasi:'Ortoped',       type:'klinika', status:'yakunlandi', shifokor:'Dr. Mirzayev', xulosaBor:true,  izoh:'Bel og\'rig\'i, surunkali' },
  { id:'CN-0048', vaqt:'11:30', sana:'18.03.25', bemor:'Pulatov Kamol Yusufovich',    gender:'male',   age:38, urgency:'orta',  mutaxassis:'Dr. Sotvoldiyev',sohasi:'Gastroenterolog',type:'online', status:'yakunlandi', shifokor:'Dr. Usmonov',  xulosaBor:true,  izoh:'Oshqozon yara shubhasi' },
  { id:'CN-0047', vaqt:'13:00', sana:'18.03.25', bemor:'Xolmatov Eldor Nurboyevich',  gender:'male',   age:52, urgency:'kritik',mutaxassis:'Dr. Tursunov',   sohasi:'Neyrolog',      type:'klinika', status:'bekor',     shifokor:'Dr. Nazarov',  xulosaBor:false, izoh:'Bemor kelmadi' },
  { id:'CN-0046', vaqt:'16:00', sana:'18.03.25', bemor:'Mirzayeva Lobar Erkinovna',   gender:'female', age:45, urgency:'past',  mutaxassis:'Dr. Ergashev',   sohasi:'Kardiolog',     type:'online',  status:'yakunlandi', shifokor:'Dr. Karimov',  xulosaBor:true,  izoh:'Profilaktik tekshiruv' },
];

const MUTAXASSISLAR = ['Dr. Tursunov', 'Dr. Ergashev', 'Dr. Xoliqov', 'Dr. Sotvoldiyev'];

// ── Yordamchi komponentlar ────────────────────────────────────────────────────

function StatusBadge({ s }: { s: ConsStatus }) {
  const cfg: Record<ConsStatus, { label: string; cls: string; icon: React.FC<any> }> = {
    yangi:      { label: 'Yangi',      cls: 'text-sky-400',     icon: Clock        },
    kutmoqda:   { label: 'Kutmoqda',   cls: 'text-amber-400',   icon: Clock        },
    jarayonda:  { label: 'Jarayonda',  cls: 'text-indigo-400',  icon: Activity     },
    yakunlandi: { label: 'Yakunlandi', cls: 'text-emerald-400', icon: CheckCircle2 },
    bekor:      { label: 'Bekor',      cls: 'text-red-400',     icon: XCircle      },
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

function TypeBadge({ t }: { t: ConsType }) {
  return t === 'online'
    ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30">
        <Video className="w-3 h-3" /> Online
      </span>
    : <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-600/40 text-slate-300 border border-slate-600/40">
        <UserCheck className="w-3 h-3" /> Klinika
      </span>;
}

// ── Xulosa modali ─────────────────────────────────────────────────────────────

function XulosamModal({ row, onClose }: { row: ConsRow; onClose: () => void }) {
  const [text, setText] = useState(
    row.xulosaBor
      ? `Bemor: ${row.bemor}\nKonsultatsiya: ${row.sohasi}\n\nShikoyat: ${row.izoh}\n\nKo'rik natijasi:\nBemorni ko'rib chiqdim. Klinik ko'rsatkichlar normal chegarada.\n\nTavsiya:\n1. Dori-darmon buyurtmasi\n2. 2 haftadan so'ng nazorat tekshiruvi\n\nMutaxassis: ${row.mutaxassis}`
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
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">{row.bemor}</h3>
            <p className="text-slate-400 text-sm mt-0.5">{row.id} • {row.sohasi} • {row.sana}, {row.vaqt}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex gap-2 mb-4">
            <TypeBadge t={row.type} />
            <UrgencyBadge u={row.urgency} />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 mb-4 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Shifokor izohi</p>
            <p className="text-slate-300 text-sm">{row.izoh}</p>
          </div>
          <label className="text-slate-400 text-xs font-medium mb-2 block">Konsultatsiya xulosasi</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={7}
            placeholder="Xulosa matnini yozing…"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 text-sm resize-none outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
            Yopish
          </button>
          <button className="flex-1 py-2.5 rounded-xl border border-indigo-500/40 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-sm transition-colors flex items-center justify-center gap-2">
            <Pencil className="w-3.5 h-3.5" /> Saqlash
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Send className="w-3.5 h-3.5" /> Yakunlash
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Asosiy komponent ─────────────────────────────────────────────────────────

export function WebSpecialistScreen() {
  const [search, setSearch]     = useState('');
  const [urgFilter, setUrg]     = useState('');
  const [statFilter, setStat]   = useState('');
  const [typeFilter, setType]   = useState('');
  const [activeMenu, setMenu]   = useState<string | null>(null);
  const [modalRow, setModal]    = useState<ConsRow | null>(null);
  const [page, setPage]         = useState(1);
  const [perPage, setPerPage]   = useState(10);

  const yangi      = ROWS.filter(r => r.status === 'yangi').length;
  const kutmoqda   = ROWS.filter(r => r.status === 'kutmoqda').length;
  const yakunlandi = ROWS.filter(r => r.status === 'yakunlandi').length;
  const online     = ROWS.filter(r => r.type === 'online').length;

  const filtered = useMemo(() => {
    let r = [...ROWS];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(x => x.bemor.toLowerCase().includes(q) || x.id.toLowerCase().includes(q));
    }
    const uMap: Record<string,Urgency> = { Kritik:'kritik', Yuqori:'yuqori', "O'rta":'orta', Past:'past' };
    if (urgFilter) r = r.filter(x => x.urgency === uMap[urgFilter]);
    const sMap: Record<string,ConsStatus> = {
      Yangi:'yangi', Kutmoqda:'kutmoqda', Jarayonda:'jarayonda', Yakunlandi:'yakunlandi', Bekor:'bekor'
    };
    if (statFilter) r = r.filter(x => x.status === sMap[statFilter]);
    if (typeFilter === 'Online')  r = r.filter(x => x.type === 'online');
    if (typeFilter === 'Klinika') r = r.filter(x => x.type === 'klinika');
    return r;
  }, [search, urgFilter, statFilter, typeFilter]);

  return (
    <WebPlatformLayout title="Mutaxassislar konsultatsiyasi" subtitle="Yo'llanma arizalar va xulosa yozish">
      <div className="p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Yangi so\'rovlar',  value: yangi,      icon: FileText,   color: 'bg-slate-800/60 border-slate-700/60' },
            { label: 'Kutmoqda',          value: kutmoqda,   icon: Clock,      color: 'bg-slate-800/60 border-slate-700/60' },
            { label: 'Yakunlangan',       value: yakunlandi, icon: CheckCircle2,color:'bg-slate-800/60 border-slate-700/60' },
            { label: 'Online sessiyalar', value: online,     icon: Video,      color: 'bg-violet-900/20 border-violet-800/40' },
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

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Bemor yoki konsultatsiya ID…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors" />
          </div>
          <button onClick={() => { setSearch(''); setUrg(''); setStat(''); setType(''); }}
            className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <DropSel label="Shoshilinchligi" opts={['Kritik','Yuqori',"O'rta",'Past']} value={urgFilter} onChange={setUrg} />
          <DropSel label="Holati" opts={['Yangi','Kutmoqda','Jarayonda','Yakunlandi','Bekor']} value={statFilter} onChange={setStat} />
          <DropSel label="Tur" opts={['Klinika','Online']} value={typeFilter} onChange={setType} />
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors ml-auto">
            <Calendar className="w-3.5 h-3.5" /> JADVAL
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800">
                  {['ID / Vaqt','Bemor','Jinsi/Yosh','Shoshilinchligi','Mutaxassis','Soha','Tur','Holati','Xulosa','Amallar'].map(h => (
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
                      <div className="text-slate-500 text-xs mt-0.5">{row.sana}, {row.vaqt}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-slate-200 text-xs font-medium">{row.bemor}</div>
                      <div className="text-slate-600 text-xs mt-0.5">{row.shifokor}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 text-xs">
                      {row.gender === 'male' ? '♂' : '♀'} {row.age}
                    </td>
                    <td className="px-3 py-3"><UrgencyBadge u={row.urgency} /></td>
                    <td className="px-3 py-3 text-slate-300 text-xs font-medium">{row.mutaxassis}</td>
                    <td className="px-3 py-3">
                      <span className="text-slate-400 text-xs">{row.sohasi}</span>
                    </td>
                    <td className="px-3 py-3"><TypeBadge t={row.type} /></td>
                    <td className="px-3 py-3"><StatusBadge s={row.status} /></td>
                    <td className="px-3 py-3">
                      {row.xulosaBor
                        ? <span className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Bor</span>
                        : <span className="text-slate-600 text-xs">—</span>
                      }
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal(row)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 text-xs transition-colors">
                          {row.xulosaBor ? <Eye className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                          {row.xulosaBor ? "Ko'r" : 'Yoz'}
                        </button>
                        {row.type === 'online' && (
                          <button className="p-1.5 rounded-lg text-violet-400 hover:text-violet-300 hover:bg-violet-900/20 transition-colors">
                            <Video className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                                {["Ko'rish","Xulosa yozish","Video qo'ng'iroq","Bekor qilish"].map((lbl,i) => (
                                  <button key={lbl} onClick={() => setMenu(null)}
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
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-600 text-sm">Ma'lumot topilmadi</td></tr>
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
        {modalRow && <XulosamModal row={modalRow} onClose={() => setModal(null)} />}
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
