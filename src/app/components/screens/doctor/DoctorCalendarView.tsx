import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../store/navigationContext';
import { calendarService } from '../../../../services/api/calendarService';
import { doctorService } from '../../../../services/api/doctorService';
import type { CalendarSlot } from '../../../types';
import {
  ChevronLeft, ChevronRight, Settings, Loader2, Clock, Lock, CheckCircle2,
} from 'lucide-react';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
const DAYS_SHORT = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

const STATUS_COLORS: Record<string, string> = {
  FREE: 'bg-green-100 text-green-700',
  BOOKED: 'bg-blue-100 text-blue-700',
  BLOCKED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

export function DoctorCalendarView() {
  const { navigate, goBack } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [profileId, setProfileId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySlots, setDaySlots] = useState<CalendarSlot[]>([]);

  useEffect(() => {
    doctorService.getMyProfile()
      .then(p => {
        setProfileId(p.id);
        return calendarService.getCalendar(p.id, year, month);
      })
      .then(data => setSlots(data.slots))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => {
    if (!selectedDate || !profileId) return;
    calendarService.getSlots(profileId, selectedDate)
      .then(setDaySlots)
      .catch(() => {});
  }, [selectedDate, profileId]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getDaySlotCount = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return slots.filter(s => s.date.startsWith(dateStr)).length;
  };

  const hasBookedSlots = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return slots.some(s => s.date.startsWith(dateStr) && s.status === 'BOOKED');
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
          <h1 className="text-base font-semibold text-gray-900">Kalendar</h1>
        </div>
        <button onClick={() => navigate('doctor_calendar_settings')} className="p-2 rounded-xl bg-gray-100">
          <Settings size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Month Navigation */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={18} /></button>
        <span className="font-semibold text-gray-900">{MONTHS[month - 1]} {year}</span>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={18} /></button>
      </div>

      {/* Calendar Grid */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_SHORT.map(d => (
            <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isPast = new Date(dateStr) < new Date(todayStr);
            const booked = hasBookedSlots(day);
            const slotCount = getDaySlotCount(day);

            return (
              <button
                key={day}
                onClick={() => !isPast && setSelectedDate(dateStr)}
                disabled={isPast}
                className={`aspect-square rounded-xl text-sm font-medium flex flex-col items-center justify-center relative transition-colors ${
                  isSelected ? 'bg-blue-500 text-white'
                  : isToday ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                  : isPast ? 'text-gray-300'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
                {slotCount > 0 && !isPast && (
                  <div className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    booked ? 'bg-orange-400' : isSelected ? 'bg-white' : 'bg-green-400'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Slots */}
      {selectedDate && (
        <div className="px-4 py-3 space-y-2">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {new Date(selectedDate).toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {daySlots.length === 0 ? (
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400">Bu kunda slotlar yo'q</p>
            </div>
          ) : daySlots.map(slot => (
            <div key={slot.id} className={`rounded-xl px-3 py-2.5 flex items-center justify-between ${STATUS_COLORS[slot.status]}`}>
              <div className="flex items-center gap-2">
                {slot.status === 'BOOKED' ? <CheckCircle2 size={14} />
                  : slot.status === 'BLOCKED' ? <Lock size={14} />
                  : <Clock size={14} />}
                <span className="text-sm font-medium">{slot.startTime} — {slot.endTime}</span>
              </div>
              <span className="text-xs font-medium">
                {slot.status === 'FREE' ? "Bo'sh" : slot.status === 'BOOKED' ? 'Band' : slot.status === 'BLOCKED' ? 'Bloklangan' : 'Bekor'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
