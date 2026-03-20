import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'year' | 'month' | 'day';

const MONTHS = [
  'Yanvar','Fevral','Mart','Aprel',
  'May','Iyun','Iyul','Avgust',
  'Sentabr','Oktabr','Noyabr','Dekabr',
];
const MONTHS_SHORT = ['Yan','Fev','Mar','Apr','May','Iyu','Iyu','Avg','Sen','Okt','Noy','Dek'];
const DAYS = ['Du','Se','Ch','Pa','Ju','Sh','Ya'];

interface Props {
  selected?: Date;
  onSelect: (d: Date) => void;
  maxDate?: Date;
}

const slide = {
  year:  { enter: -30, exit: 30  },
  month: { enter:  0,  exit:  0  },
  day:   { enter:  30, exit: -30 },
};

export function ExamDatePicker({ selected, onSelect, maxDate }: Props) {
  const cap = new Date(maxDate ?? new Date());
  cap.setHours(23, 59, 59, 999);

  const sy = selected?.getFullYear() ?? cap.getFullYear();
  const sm = selected?.getMonth()    ?? cap.getMonth();

  const [view, setView]         = useState<View>('month');
  const [prevView, setPrevView] = useState<View>('month');
  const [year,  setYear]        = useState(sy);
  const [month, setMonth]       = useState(sm);
  const [yearBase, setYearBase] = useState(Math.floor(sy / 20) * 20);

  const go = (next: View) => { setPrevView(view); setView(next); };

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();

  const direction = slide[view].enter - slide[prevView as keyof typeof slide]?.enter ?? 0;

  /* ══════ YEAR VIEW ══════ */
  const YearView = () => {
    const years = Array.from({ length: 20 }, (_, i) => yearBase + i);
    return (
      <div className="p-4">
        {/* nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setYearBase(b => b - 20)}
            className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-bold text-gray-500 tracking-wide">
            {yearBase} — {yearBase + 19}
          </span>
          <button
            onClick={() => setYearBase(b => b + 20)}
            disabled={yearBase + 20 > cap.getFullYear()}
            className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-25"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* grid 4×5 */}
        <div className="grid grid-cols-4 gap-2">
          {years.map(y => {
            const isSel  = selected?.getFullYear() === y;
            const isCurr = cap.getFullYear() === y;
            const dis    = y > cap.getFullYear();
            return (
              <button
                key={y}
                disabled={dis}
                onClick={() => { setYear(y); go('month'); }}
                className={`h-11 rounded-2xl text-sm font-semibold transition-all active:scale-95
                  ${isSel
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : isCurr
                      ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-300'
                      : dis
                        ? 'text-gray-200 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ══════ MONTH VIEW ══════ */
  const MonthView = () => (
    <div className="p-4">
      {/* nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setYear(y => y - 1)}
          className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => { setYearBase(Math.floor(year / 20) * 20); go('year'); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-50 active:bg-blue-100 transition-colors"
        >
          <span className="text-base font-bold text-blue-700">{year}</span>
          <ChevronRight className="w-3.5 h-3.5 text-blue-500 rotate-90" />
        </button>
        <button
          onClick={() => setYear(y => y + 1)}
          disabled={year >= cap.getFullYear()}
          className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-25"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* 4 × 3 grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {MONTHS.map((name, i) => {
          const isSel  = selected?.getFullYear() === year && selected?.getMonth() === i;
          const isCurr = cap.getFullYear() === year && cap.getMonth() === i;
          const dis    = year > cap.getFullYear() || (year === cap.getFullYear() && i > cap.getMonth());
          return (
            <button
              key={name}
              disabled={dis}
              onClick={() => { setMonth(i); go('day'); }}
              className={`h-12 rounded-2xl text-sm font-semibold transition-all active:scale-95
                ${isSel
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : isCurr
                    ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-300'
                    : dis
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );

  /* ══════ DAY VIEW ══════ */
  const DayView = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const raw1st = new Date(year, month, 1).getDay();
    const off    = raw1st === 0 ? 6 : raw1st - 1;
    const cells: (number | null)[] = [
      ...Array(off).fill(null),
      ...Array.from({ length: daysInMonth }, (_, k) => k + 1),
    ];
    while (cells.length % 7) cells.push(null);

    const prevM = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextM = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    return (
      <div className="px-3 pb-4 pt-3">
        {/* nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevM} className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => go('month')}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-blue-50 active:scale-95 transition-all"
            >
              <span className="text-sm font-bold text-gray-700">{MONTHS_SHORT[month]}</span>
            </button>
            <button
              onClick={() => { setYearBase(Math.floor(year / 20) * 20); go('year'); }}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-blue-50 active:scale-95 transition-all"
            >
              <span className="text-sm font-bold text-gray-700">{year}</span>
            </button>
          </div>

          <button onClick={nextM} className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* weekday header */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* day cells */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const date   = new Date(year, month, day);
            const isSel  = !!selected && sameDay(selected, date);
            const isTod  = sameDay(cap, date);
            const dis    = date > cap;
            return (
              <button
                key={i}
                disabled={dis}
                onClick={() => onSelect(date)}
                className={`mx-auto flex items-center justify-center w-9 h-9 rounded-full text-sm transition-all active:scale-90
                  ${isSel
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-300'
                    : isTod
                      ? 'bg-indigo-50 text-indigo-600 font-bold ring-2 ring-indigo-300'
                      : dis
                        ? 'text-gray-200 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ══════ BREADCRUMB ══════ */
  const Breadcrumb = () => (
    <div className="flex items-center gap-1 px-4 pt-3 pb-1">
      {view !== 'year' && (
        <button
          onClick={() => { setYearBase(Math.floor(year / 20) * 20); go('year'); }}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
        >
          {year}
        </button>
      )}
      {view === 'day' && (
        <>
          <span className="text-gray-300 text-xs">/</span>
          <button onClick={() => go('month')} className="text-xs text-blue-500 hover:text-blue-700 font-medium">
            {MONTHS[month]}
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden select-none">
      <Breadcrumb />
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {view === 'year'  && <YearView />}
            {view === 'month' && <MonthView />}
            {view === 'day'   && <DayView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* reset */}
      {selected && (
        <div className="border-t border-gray-100 px-4 py-2.5 flex justify-end">
          <button
            onClick={() => { setYear(cap.getFullYear()); setMonth(cap.getMonth()); setView('month'); }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Qayta tanlash
          </button>
        </div>
      )}
    </div>
  );
}
