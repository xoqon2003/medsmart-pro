/**
 * WebDoctorScreen — Shifokorning qabul ishchi oynasi
 * Reference UI asosida yaratilgan desktop versiya (v2)
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, RefreshCw, ChevronDown, Filter, Plus, Eye, MoreVertical,
  ChevronLeft, ChevronRight, ArrowUpDown,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

// ── Mock ma'lumotlar ──────────────────────────────────────────────────────────

const KLINIKA_ROWS = [
  { id: 'D2-0007', ariza: 'A-0-0008-25', arizachiAvatar: 'A', arizachi: 'Operator', bemor: 'ALIBOYEV SHUXRAT HAMDAMBOYEVICH', jins: 'male', yosh: 77, status: 'tolangan', invoys: '23-842356', shoshilinchligi: 'yuqori', tarif: 'premium', tayinlandi: { ism: 'Aliyev Alibek Zuhirov', mutaxassis: 'Neyroxirurg' }, shikoyat: 'teal', ijroVaqti: '06.09.25', ijrochi: 'yangi', sana: '03.09.25 09:23' },
  { id: 'D2-0012', ariza: 'A-0-0009-25', arizachiAvatar: 'B', arizachi: 'Shifokor', bemor: 'XUDOYQULOV SANJAR SHAHARBOYEVICH', jins: 'male', yosh: 41, status: 'bepul', invoys: '23-842356', shoshilinchligi: 'orta', tarif: 'xayriya', tayinlandi: null, shikoyat: 'gray', ijroVaqti: '05.09.25', ijrochi: 'yangi', sana: '03.09.25 09:15' },
  { id: 'AS-0012', ariza: 'A-0-0006-25', arizachiAvatar: 'C', arizachi: 'Bemor', bemor: 'AKBARALIYEV JAVHONGIR JAMSHIDOVICH', jins: 'male', yosh: 23, status: 'jarayonda', invoys: '23-842356', shoshilinchligi: 'past', tarif: 'standart', tayinlandi: null, shikoyat: 'gray', ijroVaqti: '05.09.25', ijrochi: 'jarayonda', sana: '03.09.25 09:08' },
  { id: 'D2-0015', ariza: 'A-0-0011-25', arizachiAvatar: 'D', arizachi: 'Operator', bemor: 'TOSHMATOVA DILNOZA YUSUPOVNA', jins: 'female', yosh: 35, status: 'tolangan', invoys: '23-842358', shoshilinchligi: 'yuqori', tarif: 'premium', tayinlandi: { ism: 'Karimov Bobur Aliyevich', mutaxassis: 'Kardiolog' }, shikoyat: 'teal', ijroVaqti: '07.09.25', ijrochi: 'yangi', sana: '03.09.25 10:15' },
  { id: 'D2-0018', ariza: 'A-0-0013-25', arizachiAvatar: 'E', arizachi: 'Bemor', bemor: 'RAZZAQOV MANSUR HAMIDOVICH', jins: 'male', yosh: 52, status: 'bepul', invoys: '23-842360', shoshilinchligi: 'orta', tarif: 'standart', tayinlandi: null, shikoyat: 'gray', ijroVaqti: '08.09.25', ijrochi: 'yangi', sana: '03.09.25 11:00' },
  { id: 'AS-0015', ariza: 'A-0-0014-25', arizachiAvatar: 'F', arizachi: 'Shifokor', bemor: 'MIRZAYEVA ZULFIYA BAXTIYOROVNA', jins: 'female', yosh: 44, status: 'jarayonda', invoys: '23-842361', shoshilinchligi: 'past', tarif: 'xayriya', tayinlandi: { ism: 'Holiqova Malika Rustamovna', mutaxassis: 'Neyrolog' }, shikoyat: 'teal', ijroVaqti: '05.09.25', ijrochi: 'jarayonda', sana: '03.09.25 11:30' },
];


// ── Yordamchi komponentlar ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    tolangan:  { label: "To'langan",  cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    bepul:     { label: 'Bepul',      cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    jarayonda: { label: 'Jarayonda',  cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
  };
  const b = map[status] ?? { label: status, cls: 'bg-slate-600/20 text-slate-400' };
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${b.cls}`}>{b.label}</span>;
}

function SBadge({ s }: { s: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    yuqori: { label: 'Yuqori', cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
    orta:   { label: "O'rta",  cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    past:   { label: 'Past',   cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  };
  const b = map[s] ?? { label: s, cls: '' };
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${b.cls}`}>{b.label}</span>;
}

function TarifBadge({ tarif }: { tarif: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    premium:  { label: 'Premium',  cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    xayriya:  { label: 'Xayriya',  cls: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
    standart: { label: 'Standart', cls: 'bg-slate-500/20 text-slate-400 border-slate-600/30' },
  };
  const b = map[tarif] ?? { label: tarif, cls: '' };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-medium border ${b.cls}`}>{b.label}</span>;
}

function IjrochiBadge({ holat }: { holat: string }) {
  if (holat === 'yangi')
    return <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-white">Yangi</span>;
  if (holat === 'jarayonda')
    return <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500 text-white">Jarayonda</span>;
  return <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-600 text-white">{holat}</span>;
}

function ShikoyatDot({ color }: { color: string }) {
  return (
    <div className={`w-6 h-6 rounded-full ${color === 'teal' ? 'bg-teal-400' : 'bg-slate-600'} mx-auto`} />
  );
}

// ── Dropdown ─────────────────────────────────────────────────────────────────

function DropFilter({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-slate-500 transition-colors"
      >
        <span>{value || label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 min-w-[160px] py-1"
          >
            <button onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-700 transition-colors">
              Hammasi
            </button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${value === opt ? 'text-indigo-400' : 'text-slate-300'}`}>
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Kontekst menu amallar ─────────────────────────────────────────────────────

const QABUL_ACTIONS = [
  "Qabulni boshlash",
  "Bekor qilish",
  "Ma'lumotlarni tahrirlash",
  "O'tkazishni boshqa sanaga ko'chirish",
  "Telefon raqami",
];

const ARIZA_HOLATI_MAP: Record<string, string> = {
  "To'langan": 'tolangan', 'Bepul': 'bepul', 'Jarayonda': 'jarayonda',
};

// ── Asosiy komponent ──────────────────────────────────────────────────────────

export function WebDoctorScreen() {
  const [search, setSearch] = useState('');
  const [shoshilinchligi, setShoshilinchligi] = useState('');
  const [tekshiruvTuri, setTekshiruvTuri] = useState('');
  const [arizaHolati, setArizaHolati] = useState('');
  const [tarif, setTarif] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filteredKlinika = useMemo(() => KLINIKA_ROWS.filter(r => {
    if (search && !r.bemor.toLowerCase().includes(search.toLowerCase()) && !r.id.includes(search) && !r.ariza.includes(search)) return false;
    if (shoshilinchligi && r.shoshilinchligi !== shoshilinchligi.toLowerCase()) return false;
    if (tarif && r.tarif !== tarif.toLowerCase()) return false;
    if (arizaHolati && r.status !== ARIZA_HOLATI_MAP[arizaHolati]) return false;
    return true;
  }), [search, shoshilinchligi, tarif, arizaHolati]);

  const thCls = "text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3 whitespace-nowrap select-none";
  const tdCls = "px-3 py-3 text-sm text-slate-300";

  return (
    <WebPlatformLayout title="Shifokorlar" subtitle="Shifokorning qabul ishchi oynasi">
      <div className="p-4 space-y-4">

        {/* ── FILTER BAR ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="F.I.O / IDsi / TK orqali qidirish"
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Refresh / Sort */}
          <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Dropdowns */}
          <DropFilter label="Shoshilinchligi" value={shoshilinchligi} onChange={setShoshilinchligi}
            options={['Yuqori', "O'rta", 'Past']} />
          <DropFilter label="Tekshiruv turi" value={tekshiruvTuri} onChange={setTekshiruvTuri}
            options={['MRT', 'MSKT', 'USG', 'Rentgen', 'EKG']} />
          <DropFilter label="Arizasi holati" value={arizaHolati} onChange={setArizaHolati}
            options={["To'langan", 'Bepul', 'Jarayonda']} />
          <DropFilter label="Tarif" value={tarif} onChange={setTarif}
            options={['Premium', 'Xayriya', 'Standart']} />

          <div className="flex-1" />

          {/* Kengaytirilgan qidiruv */}
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-indigo-500/50 text-indigo-400 rounded-lg text-sm hover:bg-indigo-600/10 transition-colors">
            <Filter className="w-4 h-4" />
            Kengaytirilgan qidiruv
          </button>

          {/* + BEMOR */}
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />
            BEMOR
          </button>
        </div>

        {/* ── KLINIKADA QABUL OYNASI ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h3 className="text-white font-semibold text-sm">Klinikada qabul ishchi oynasi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/40">
                  <th className="px-3 py-3">
                    <input type="checkbox" className="rounded border-slate-600 accent-indigo-500" />
                  </th>
                  <th className={thCls + " text-left cursor-pointer hover:text-slate-300"}>ID <ArrowUpDown className="w-3 h-3 inline ml-0.5" /></th>
                  <th className={thCls + " text-left"}>ID ariza</th>
                  <th className={thCls + " text-left"}>Arizachi</th>
                  <th className={thCls + " text-left"}>Bemor</th>
                  <th className={thCls + " text-center"}>Jinsi/<br/>Yoshi</th>
                  <th className={thCls + " text-center"}>Statusi</th>
                  <th className={thCls + " text-center"}>Invoys<br/>raqami</th>
                  <th className={thCls + " text-center cursor-pointer hover:text-slate-300"}>Shoshilinchligi <ArrowUpDown className="w-3 h-3 inline ml-0.5" /></th>
                  <th className={thCls + " text-center"}>Tarif</th>
                  <th className={thCls + " text-left"}>Tayinlandi</th>
                  <th className={thCls + " text-center"}>Shikoyati</th>
                  <th className={thCls + " text-center cursor-pointer hover:text-slate-300"}>Ijro vaqti <ArrowUpDown className="w-3 h-3 inline ml-0.5" /></th>
                  <th className={thCls + " text-center"}>Ijrochi</th>
                  <th className={thCls + " text-center"}>Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredKlinika.map((row, i) => (
                  <motion.tr key={row.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-3 py-3">
                      <input type="checkbox" className="rounded border-slate-600 accent-indigo-500" />
                    </td>
                    {/* ID */}
                    <td className={tdCls}>
                      <span className="text-indigo-400 font-medium text-xs">{row.id}</span>
                      <p className="text-slate-600 text-xs">{row.sana}</p>
                    </td>
                    {/* ID ariza */}
                    <td className={tdCls}>
                      <span className="text-indigo-400 text-xs font-medium">{row.ariza}</span>
                    </td>
                    {/* Arizachi */}
                    <td className={tdCls}>
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 font-medium">
                        {row.arizachiAvatar}
                      </div>
                    </td>
                    {/* Bemor */}
                    <td className={tdCls}>
                      <p className="font-medium text-white text-xs leading-tight max-w-[160px]">{row.bemor}</p>
                    </td>
                    {/* Jinsi/Yoshi */}
                    <td className={tdCls + " text-center"}>
                      <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                        <span>{row.jins === 'male' ? '♂' : '♀'}</span>
                        <span>{row.yosh}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className={tdCls + " text-center"}>
                      <StatusBadge status={row.status} />
                    </td>
                    {/* Invoys */}
                    <td className={tdCls + " text-center"}>
                      <span className="text-xs text-slate-400">{row.invoys}</span>
                    </td>
                    {/* Shoshilinchligi */}
                    <td className={tdCls + " text-center"}>
                      <SBadge s={row.shoshilinchligi} />
                    </td>
                    {/* Tarif */}
                    <td className={tdCls + " text-center"}>
                      <TarifBadge tarif={row.tarif} />
                    </td>
                    {/* Tayinlandi */}
                    <td className={tdCls}>
                      {row.tayinlandi ? (
                        <div>
                          <p className="text-xs text-indigo-400 font-medium">{row.tayinlandi.mutaxassis}</p>
                          <p className="text-xs text-slate-500">{row.tayinlandi.ism}</p>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    {/* Shikoyati */}
                    <td className={tdCls + " text-center"}>
                      <ShikoyatDot color={row.shikoyat} />
                    </td>
                    {/* Ijro vaqti */}
                    <td className={tdCls + " text-center"}>
                      <span className="text-xs text-slate-400">{row.ijroVaqti}</span>
                    </td>
                    {/* Ijrochi */}
                    <td className={tdCls + " text-center"}>
                      <IjrochiBadge holat={row.ijrochi} />
                    </td>
                    {/* Amallar */}
                    <td className={tdCls + " text-center"}>
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <div className="relative">
                          <button onClick={() => setActiveMenu(activeMenu === row.id + '_k' ? null : row.id + '_k')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          <AnimatePresence>
                            {activeMenu === row.id + '_k' && (
                              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 w-44 py-1"
                              >
                                {QABUL_ACTIONS.map(action => (
                                  <button key={action} onClick={() => setActiveMenu(null)}
                                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors">
                                    {action}
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
              </tbody>
            </table>
          </div>
          {/* Izoh */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-800/20">
            <p className="text-slate-600 text-xs">
              ℹ️ Shifokor o'zi ham oldiga kelgan bemorni ro'yxatdan o'tkazishi mumkin (va referal xizmatidan) taqdirlanishi mumkin (+summa), kalendarda (kunlik avtomatik yoziladi)
            </p>
          </div>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Ko'rsatish</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-sm focus:outline-none">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>ta / sahifa</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-400 px-2">{page}-sahifa</span>
            <button onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </WebPlatformLayout>
  );
}
