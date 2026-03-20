import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Calendar as CalIcon, Clock3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../../store/appStore';
import { Calendar } from '../../ui/calendar';
import { authService, bookingService } from '../../../../services';
import type { User } from '../../../types';

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isWeekend(d: Date) {
  return d.getDay() === 0 || d.getDay() === 6;
}

function hashToBool(seed: string, mod: number, hit: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod === hit;
}

export function KonsultatsiyaCalendar() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation } = useApp();
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(() => {
    if (draftConsultation.selectedDate) return new Date(draftConsultation.selectedDate);
    return undefined;
  });
  const [doctor, setDoctor] = useState<User | null>(null);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, 'free' | 'busy'>>({});
  const slots = Object.keys(slotAvailability);

  useEffect(() => {
    const id = draftConsultation.selectedDoctorId;
    if (!id) return;
    authService.getUserById(id).then(setDoctor);
  }, [draftConsultation.selectedDoctorId]);

  const selectedYmd = selectedDay ? toYmd(selectedDay) : undefined;

  useEffect(() => {
    if (!selectedYmd || !doctor) { setSlotAvailability({}); return; }
    bookingService.getSlots(doctor.id, selectedYmd).then(setSlotAvailability);
  }, [doctor, selectedYmd]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();

  const disabledDays = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d < today) return true;
    if (isWeekend(d)) return true;
    const seed = `${doctor?.id || 0}-${toYmd(d)}`;
    if (hashToBool(seed, 9, 0)) return true;
    return false;
  };

  const slotDisabled = (s: string) => {
    if (!selectedDay) return true;
    if (slotAvailability[s] === 'busy') return true;
    const [hh, mm] = s.split(':').map((x) => Number(x));
    const dt = new Date(selectedDay);
    dt.setHours(hh, mm, 0, 0);
    return dt.getTime() < now.getTime();
  };

  const pickSlot = (s: string) => {
    if (!selectedYmd) return;
    updateDraftConsultation({ selectedDate: selectedYmd, selectedSlot: s });
  };

  const canNext = Boolean(draftConsultation.selectedDate && draftConsultation.selectedSlot);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center" aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-emerald-200 text-xs">4-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Sana va vaqt</h1>
            <p className="text-emerald-200/80 text-xs mt-0.5">{doctor ? `Dr. ${doctor.fullName}` : 'Shifokor tanlanmagan'}</p>
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
              updateDraftConsultation({ selectedDate: toYmd(d), selectedSlot: undefined });
            }}
            disabled={disabledDays}
            className="w-full"
          />
          <div className="px-4 pb-4 -mt-1 text-xs text-gray-500">
            Dam olish kunlari va bo'sh slot yo'q kunlar disabled (demo).
          </div>
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
                const selected = draftConsultation.selectedSlot === s && draftConsultation.selectedDate === selectedYmd;
                const disabled = slotDisabled(s);
                const free = slotAvailability[s] === 'free' && !disabled;
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
          onClick={() => navigate('patient_kons_anamnez')}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50"
        >
          <span>Tasdiqlashga o'tish</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

