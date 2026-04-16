import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../store/navigationContext';
import { calendarService } from '../../../../services/api/calendarService';
import type { CalendarSlot, CalendarSetting } from '../../../types';
import { ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
const DAYS_SHORT = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

interface Props {
  doctorProfileId?: string;
}

export function PatientBookingCalendar({ doctorProfileId }: Props) {
  const { navigate, goBack } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<CalendarSetting | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySlots, setDaySlots] = useState<CalendarSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);

  useEffect(() => {
    if (!doctorProfileId) { setLoading(false); return; }
    calendarService.getCalendar(doctorProfileId, year, month)
      .then(data => { setSettings(data.settings); setSlots(data.slots); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [doctorProfileId, year, month]);

  useEffect(() => {
    if (!selectedDate || !doctorProfileId) return;
    calendarService.getSlots(doctorProfileId, selectedDate)
      .then(s => setDaySlots(s.filter(sl => sl.status === 'FREE')))
      .catch(() => {});
  }, [selectedDate, doctorProfileId]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const isWorkDay = (day: number) => {
    if (!settings) return true;
    const date = new Date(year, month - 1, day);
    return settings.workDays.includes(date.getDay());
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
        <h1 className="text-base font-semibold text-gray-900">Vaqt tanlang</h1>
      </div>

      {/* Month Nav */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={18} /></button>
        <span className="font-semibold text-gray-900">{MONTHS[month - 1]} {year}</span>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={18} /></button>
      </div>

      {/* Calendar */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS_SHORT.map(d => (
            <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isPast = dateStr < todayStr;
            const isSelected = dateStr === selectedDate;
            const workDay = isWorkDay(day);

            return (
              <button key={day} onClick={() => !isPast && workDay && setSelectedDate(dateStr)}
                disabled={isPast || !workDay}
                className={`aspect-square rounded-xl text-sm font-medium flex items-center justify-center ${
                  isSelected ? 'bg-blue-500 text-white'
                  : isPast || !workDay ? 'text-gray-300'
                  : 'text-gray-700 hover:bg-blue-50'
                }`}>{day}</button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="flex-1 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">Bo'sh vaqtlar</p>
          {daySlots.length === 0 ? (
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400">Bo'sh vaqt yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {daySlots.map(slot => (
                <button key={slot.id} onClick={() => setSelectedSlot(slot)}
                  className={`rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
                    selectedSlot?.id === slot.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'
                  }`}>
                  <Clock size={12} /> {slot.startTime}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Button */}
      {selectedSlot && (
        <div className="bg-white border-t border-gray-100 px-4 py-4">
          <button onClick={() => navigate('patient_booking_confirm')}
            className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm">
            {selectedSlot.startTime} ga yozilish
          </button>
        </div>
      )}
    </div>
  );
}
