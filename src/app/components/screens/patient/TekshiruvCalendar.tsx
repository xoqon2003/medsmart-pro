import React, { useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Calendar as CalIcon, Clock3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../../store/appStore';
import { Calendar } from '../../ui/calendar';

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isWeekend(d: Date) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function hashToBool(seed: string, mod: number, hit: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod === hit;
}

function makeSlots() {
  const slots: string[] = [];
  const pushRange = (startHour: number, endHour: number) => {
    for (let h = startHour; h < endHour; h += 1) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
  };
  pushRange(9, 13);
  pushRange(14, 18);
  return slots;
}

export function TekshiruvCalendar() {
  const { goBack, navigate, draftExamination, updateDraftExamination } = useApp();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(() => {
    if (draftExamination.selectedDate) return new Date(draftExamination.selectedDate);
    return undefined;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disabledDays = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d < today) return true;
    if (isWeekend(d)) return true;
    const seed = `${draftExamination.centerId || 0}-${toYmd(d)}`;
    if (hashToBool(seed, 10, 0)) return true;
    return false;
  };

  const slots = useMemo(() => makeSlots(), []);
  const selectedYmd = selectedDay ? toYmd(selectedDay) : undefined;
  const now = new Date();

  const slotStates = useMemo(() => {
    const map = new Map<string, 'free' | 'busy'>();
    if (!selectedYmd) return map;
    for (const s of slots) {
      const seed = `${draftExamination.centerId || 0}-${selectedYmd}-${s}`;
      map.set(s, hashToBool(seed, 7, 0) ? 'busy' : 'free');
    }
    return map;
  }, [draftExamination.centerId, selectedYmd, slots]);

  const slotDisabled = (s: string) => {
    if (!selectedDay) return true;
    if (slotStates.get(s) === 'busy') return true;
    const [hh, mm] = s.split(':').map((x) => Number(x));
    const dt = new Date(selectedDay);
    dt.setHours(hh, mm, 0, 0);
    return dt.getTime() < now.getTime();
  };

  const pickSlot = (s: string) => {
    if (!selectedYmd) return;
    updateDraftExamination({ selectedDate: selectedYmd, selectedSlot: s });
  };

  const canNext = Boolean(draftExamination.selectedDate && draftExamination.selectedSlot);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sky-900 to-blue-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center" aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-sky-200 text-xs">4-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Sana va vaqt</h1>
            <p className="text-sky-200/80 text-xs mt-0.5">{draftExamination.examinationName || '—'}</p>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <CalIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 -mt-4 pb-24 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={(d) => {
              setSelectedDay(d);
              if (!d) return;
              updateDraftExamination({ selectedDate: toYmd(d), selectedSlot: undefined });
            }}
            disabled={disabledDays}
            className="w-full"
          />
          <div className="px-4 pb-4 -mt-1 text-xs text-gray-500">Dam olish kunlari va ba’zi kunlar disabled (demo).</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock3 className="w-4 h-4 text-gray-500" />
            <p className="text-gray-700 text-sm">Vaqt slotlari (30 daqiqa)</p>
          </div>

          {!selectedYmd ? (
            <p className="text-gray-400 text-sm">Avval sanani tanlang</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => {
                const selected = draftExamination.selectedSlot === s && draftExamination.selectedDate === selectedYmd;
                const disabled = slotDisabled(s);
                const free = slotStates.get(s) === 'free' && !disabled;
                return (
                  <button
                    key={s}
                    onClick={() => pickSlot(s)}
                    disabled={disabled}
                    className={`px-3 py-2 rounded-xl text-xs border transition-colors ${
                      selected
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : disabled
                          ? 'bg-gray-50 border-gray-200 text-gray-300'
                          : free
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {disabled ? `✗ ${s}` : free ? `✓ ${s}` : s}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.99 }}
          disabled={!canNext}
          onClick={() => navigate('patient_tks_confirm')}
          className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-sky-200 disabled:opacity-50"
        >
          <span>Tasdiqlashga o‘tish</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

