/**
 * WebOnlaynQabulScreen — Onlayn qabul ishchi oynasi
 * Shifokor/Mutaxassis uchun masofaviy qabul boshqaruvi
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, RefreshCw, ArrowUpDown, Eye, MoreVertical,
  Video, Phone, Info, Plus, Filter,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

// ── Ma'lumotlar ───────────────────────────────────────────────────────────────

const ROWS = [
  { id: 'D2-0007',  ariza: 'A-0-0008-25', bemor: 'ALIBOYEV SHUXRAT HAMDAMBOYEVICH',   jins: 'male',   yosh: 77, invoys: '23-842356', turi: ['Telfon', 'Videokonferensiya', "Ma'lumot (tizim)"], status: 'Kutmoqda',    platforma: 'gmeet',    shoshilinchligi: 'yuqori', shikoyat: 'teal', ijroVaqti: 'Bugun 02:21',  ijrochi: 'yangi',     sana: '03.09.25 09:23' },
  { id: 'AS-0019', ariza: 'A-0-0015-25', bemor: "NORQO'LOV ELDOR BAXROMOVICH",        jins: 'male',   yosh: 29, invoys: '23-842362', turi: ['Telfon'],                                           status: 'Tasdiqlandi', platforma: 'telegram', shoshilinchligi: 'orta',   shikoyat: 'gray', ijroVaqti: 'Bugun 14:00', ijrochi: 'jarayonda', sana: '03.09.25 09:45' },
  { id: 'D2-0021',  ariza: 'A-0-0016-25', bemor: 'QODIROV HAMZA NISHONOVICH',          jins: 'male',   yosh: 63, invoys: '23-842363', turi: ['Videokonferensiya'],                               status: 'Kutmoqda',    platforma: 'zoom',     shoshilinchligi: 'past',   shikoyat: 'teal', ijroVaqti: 'Ertaga 10:00', ijrochi: 'yangi',    sana: '03.09.25 10:20' },
  { id: 'AS-0022', ariza: 'A-0-0017-25', bemor: 'YUSUPOVA NODIRA HAMIDOVNA',          jins: 'female', yosh: 38, invoys: '23-842364', turi: ['Videokonferensiya', 'Telfon'],                      status: 'Bajarildi',   platforma: 'gmeet',    shoshilinchligi: 'yuqori', shikoyat: 'teal', ijroVaqti: 'Kecha 16:30', ijrochi: 'jarayonda', sana: '02.09.25 14:10' },
  { id: 'D2-0025',  ariza: 'A-0-0018-25', bemor: 'TURSUNOV JAHONGIR ALIYEVICH',        jins: 'male',   yosh: 54, invoys: '23-842365', turi: ['Telfon'],                                           status: 'Bekor qilindi', platforma: 'telegram', shoshilinchligi: 'past',  shikoyat: 'gray', ijroVaqti: '01.09.25',    ijrochi: 'yangi',    sana: '01.09.25 11:05' },
  { id: 'AS-0027', ariza: 'A-0-0019-25', bemor: "XOLIQOVA MALIKA RO'ZIYEVNA",        jins: 'female', yosh: 45, invoys: '23-842366', turi: ["Ma'lumot (tizim)"],                                status: 'Bajarildi',   platforma: 'zoom',     shoshilinchligi: 'orta',   shikoyat: 'teal', ijroVaqti: 'Kecha 10:00', ijrochi: 'jarayonda', sana: '02.09.25 09:00' },
  { id: 'D2-0030',  ariza: 'A-0-0020-25', bemor: 'RAHIMOV SHERZOD BEKOVICH',           jins: 'male',   yosh: 33, invoys: '23-842370', turi: ['Videokonferensiya'],                               status: 'Tasdiqlandi', platforma: 'zoom',     shoshilinchligi: 'yuqori', shikoyat: 'teal', ijroVaqti: 'Bugun 16:00', ijrochi: 'yangi',    sana: '03.09.25 08:00' },
  { id: 'AS-0031', ariza: 'A-0-0021-25', bemor: 'NAZAROVA DILNOZA HAMIDOVNA',         jins: 'female', yosh: 28, invoys: '23-842371', turi: ['Telfon'],                                           status: 'Kutmoqda',    platforma: 'telegram', shoshilinchligi: 'orta',   shikoyat: 'gray', ijroVaqti: 'Ertaga 09:00', ijrochi: 'yangi',   sana: '03.09.25 07:45' },
];

// ── Yordamchi komponentlar ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; dot: string }> = {
    'Kutmoqda':      { cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',       dot: 'bg-amber-400'   },
    'Bajarildi':     { cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
    'Tasdiqlandi':   { cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30',         dot: 'bg-blue-400'    },
    'Bekor qilindi': { cls: 'bg-red-500/15 text-red-300 border-red-500/30',             dot: 'bg-red-400'     },
  };
  const b = map[status] ?? { cls: 'bg-slate-600/20 text-slate-400 border-slate-600/30', dot: 'bg-slate-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${b.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
      {status === 'Bekor qilindi' ? 'Bekor' : status}
    </span>
  );
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

function IjrochiBadge({ holat }: { holat: string }) {
  if (holat === 'yangi')
    return <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-white">Yangi</span>;
  if (holat === 'jarayonda')
    return <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500 text-white">Jarayonda</span>;
  return <span className="inline-flex px-3 py-1 rounded-lg text-xs font-semibold bg-slate-600 text-white">{holat}</span>;
}

function PlatformaIcon({ p }: { p: string }) {
  const icons: Record<string, { bg: string; letter: string }> = {
    gmeet:    { bg: 'bg-blue-500',  letter: 'G' },
    telegram: { bg: 'bg-sky-500',   letter: 'T' },
    zoom:     { bg: 'bg-blue-700',  letter: 'Z' },
  };
  const icon = icons[p] ?? { bg: 'bg-slate-600', letter: '?' };
  return (
    <div className={`w-7 h-7 rounded-lg ${icon.bg} flex items-center justify-center text-white text-xs font-bold`}>
      {icon.letter}
    </div>
  );
}

function ShikoyatDot({ color }: { color: string }) {
  return <div className={`w-5 h-5 rounded-full ${color === 'teal' ? 'bg-teal-400' : 'bg-slate-600'} mx-auto`} />;
}

const MENU_ACTIONS = [
  'Qo\'l boshlash',
  'Seans boshlash',
  'Bekor qilish',
  'Ma\'lumotlarni tahrirlash',
  'Boshqa sana ko\'chirish',
];

// ── Asosiy komponent ──────────────────────────────────────────────────────────

export function WebOnlaynQabulScreen() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [platforma, setPlatforma] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filtered = ROWS.filter(r => {
    if (search && !r.bemor.toLowerCase().includes(search.toLowerCase()) && !r.id.includes(search)) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (platforma && r.platforma !== platforma) return false;
    return true;
  });

  const thCls = "text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3 whitespace-nowrap select-none";
  const tdCls = "px-3 py-3 text-sm";

  return (
    <WebPlatformLayout title="Onlayn qabul" subtitle="Onlayn qabul ishchi oynasi">
      <div className="p-4 space-y-4">

        {/* ── FILTER BAR ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="F.I.O / IDsi / TK orqali qidirish"
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button onClick={() => { setSearch(''); setStatus(''); setPlatforma(''); }}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Status filter */}
          {(['Kutmoqda', 'Tasdiqlandi', 'Bajarildi', 'Bekor qilindi']).map(s => (
            <button key={s} onClick={() => setStatus(statusFilter === s ? '' : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                ${statusFilter === s
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                }`}>
              {s}
            </button>
          ))}

          {/* Platforma filter */}
          <div className="flex items-center gap-1 ml-2">
            {[
              { key: 'gmeet', label: 'G', bg: 'bg-blue-500' },
              { key: 'telegram', label: 'T', bg: 'bg-sky-500' },
              { key: 'zoom', label: 'Z', bg: 'bg-blue-700' },
            ].map(p => (
              <button key={p.key} onClick={() => setPlatforma(platforma === p.key ? '' : p.key)}
                className={`w-7 h-7 rounded-lg text-white text-xs font-bold transition-all
                  ${platforma === p.key ? `${p.bg} ring-2 ring-white/30` : `${p.bg} opacity-40 hover:opacity-80`}`}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-indigo-500/50 text-indigo-400 rounded-lg text-sm hover:bg-indigo-600/10 transition-colors">
            <Filter className="w-4 h-4" />
            Kengaytirilgan
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />
            YANGI QABUL
          </button>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Onlayn qabul ishchi oynasi</h3>
              <p className="text-slate-500 text-xs mt-0.5">{filtered.length} ta qabul</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Jonli</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/40">
                  <th className="px-3 py-3 w-10">
                    <input type="checkbox" className="rounded border-slate-600 accent-indigo-500" />
                  </th>
                  <th className={`${thCls} text-left cursor-pointer hover:text-slate-300`}>
                    ID <ArrowUpDown className="w-3 h-3 inline ml-0.5 opacity-50" />
                  </th>
                  <th className={`${thCls} text-left`}>ID ariza</th>
                  <th className={`${thCls} text-left`}>Bemor</th>
                  <th className={`${thCls} text-center`}>Jinsi/<br/>Yoshi</th>
                  <th className={`${thCls} text-center`}>Invoys</th>
                  <th className={`${thCls} text-left`}>Turi</th>
                  <th className={`${thCls} text-left`}>Status</th>
                  <th className={`${thCls} text-center`}>Platforma</th>
                  <th className={`${thCls} text-center cursor-pointer hover:text-slate-300`}>
                    Shoshilinchligi <ArrowUpDown className="w-3 h-3 inline ml-0.5 opacity-50" />
                  </th>
                  <th className={`${thCls} text-center`}>Shikoyati</th>
                  <th className={`${thCls} text-center cursor-pointer hover:text-slate-300`}>
                    Ijro vaqti <ArrowUpDown className="w-3 h-3 inline ml-0.5 opacity-50" />
                  </th>
                  <th className={`${thCls} text-center`}>Ijrochi</th>
                  <th className={`${thCls} text-center`}>Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center text-slate-600 text-sm">
                      Hech qanday onlayn qabul topilmadi
                    </td>
                  </tr>
                ) : filtered.map((row, i) => (
                  <motion.tr key={row.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-3 py-3">
                      <input type="checkbox" className="rounded border-slate-600 accent-indigo-500" />
                    </td>

                    {/* ID */}
                    <td className={tdCls}>
                      <span className="text-indigo-400 font-medium text-xs">{row.id}</span>
                      <p className="text-slate-600 text-xs mt-0.5">{row.sana}</p>
                    </td>

                    {/* Ariza */}
                    <td className={tdCls}>
                      <span className="text-indigo-400 text-xs font-medium">{row.ariza}</span>
                    </td>

                    {/* Bemor */}
                    <td className={tdCls}>
                      <p className="font-medium text-white text-xs max-w-[160px] leading-tight">{row.bemor}</p>
                    </td>

                    {/* Jinsi/Yoshi */}
                    <td className={`${tdCls} text-center`}>
                      <span className="text-xs text-slate-400">
                        {row.jins === 'male' ? '♂' : '♀'} {row.yosh}
                      </span>
                    </td>

                    {/* Invoys */}
                    <td className={`${tdCls} text-center`}>
                      <span className="text-xs text-slate-500">{row.invoys}</span>
                    </td>

                    {/* Turi */}
                    <td className={tdCls}>
                      <div className="flex flex-col gap-0.5">
                        {row.turi.map(t => (
                          <div key={t} className="flex items-center gap-1">
                            {t.includes('Video')    && <Video className="w-3 h-3 text-slate-500 shrink-0" />}
                            {t.includes('Telf')     && <Phone className="w-3 h-3 text-slate-500 shrink-0" />}
                            {t.includes("Ma'lumot") && <Info  className="w-3 h-3 text-slate-500 shrink-0" />}
                            <span className="text-xs text-slate-400">{t}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className={tdCls}>
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Platforma */}
                    <td className={`${tdCls} text-center`}>
                      <div className="flex justify-center">
                        <PlatformaIcon p={row.platforma} />
                      </div>
                    </td>

                    {/* Shoshilinchligi */}
                    <td className={`${tdCls} text-center`}>
                      <SBadge s={row.shoshilinchligi} />
                    </td>

                    {/* Shikoyati */}
                    <td className={`${tdCls} text-center`}>
                      <ShikoyatDot color={row.shikoyat} />
                    </td>

                    {/* Ijro vaqti */}
                    <td className={`${tdCls} text-center`}>
                      <span className="text-xs text-slate-400">{row.ijroVaqti}</span>
                    </td>

                    {/* Ijrochi */}
                    <td className={`${tdCls} text-center`}>
                      <IjrochiBadge holat={row.ijrochi} />
                    </td>

                    {/* Amallar */}
                    <td className={`${tdCls} text-center`}>
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100">
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
                                className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 w-48 py-1"
                              >
                                {MENU_ACTIONS.map((action, ai) => (
                                  <button key={action} onClick={() => setActiveMenu(null)}
                                    className={`w-full text-left px-4 py-2 text-xs transition-colors
                                      ${ai === 2 ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-slate-700'}`}>
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
          <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-800/20">
            <p className="text-slate-600 text-xs">
              ℹ️ Telefon va Videokonferensiya — bemor, shifokor yoki operator tomonidan yozilishi mumkin. «Ma'lumot (tizim)» — paket orqali avtomatik keladiganlar.
            </p>
          </div>
        </div>

      </div>
    </WebPlatformLayout>
  );
}
