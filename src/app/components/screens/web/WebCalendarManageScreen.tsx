import React, { useState, useEffect } from 'react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { calendarService } from '../../../../services/api/calendarService';
import { doctorService } from '../../../../services/api/doctorService';
import type { CalendarSlot, CalendarSetting } from '../../../types';
import {
  Calendar, Clock, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle2, Lock, XCircle, Settings,
} from 'lucide-react';

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  FREE: { label: "Bo'sh", cls: 'bg-green-500/20 text-green-300 border-green-500/30' },
  BOOKED: { label: 'Band', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  BLOCKED: { label: 'Bloklangan', cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
  CANCELLED: { label: 'Bekor', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export function WebCalendarManageScreen() {
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState('');
  const [settings, setSettings] = useState<CalendarSetting | null>(null);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    doctorService.getMyProfile()
      .then(p => {
        setProfileId(p.id);
        return calendarService.getCalendar(p.id, year, month);
      })
      .then(data => { setSettings(data.settings); setSlots(data.slots); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Group slots by date
  const slotsByDate: Record<string, CalendarSlot[]> = {};
  slots.forEach(s => {
    const dateKey = s.date.split('T')[0];
    if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
    slotsByDate[dateKey].push(s);
  });

  const statCounts = {
    free: slots.filter(s => s.status === 'FREE').length,
    booked: slots.filter(s => s.status === 'BOOKED').length,
    blocked: slots.filter(s => s.status === 'BLOCKED').length,
  };

  return (
    <WebPlatformLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-100">Kalendar boshqaruvi</h1>
            <p className="text-sm text-gray-400">{MONTHS[month - 1]} {year}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronLeft size={16} className="text-gray-400" /></button>
            <button onClick={nextMonth} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><ChevronRight size={16} className="text-gray-400" /></button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-400">{statCounts.free}</p>
            <p className="text-xs text-green-400/60">Bo'sh slotlar</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-400">{statCounts.booked}</p>
            <p className="text-xs text-blue-400/60">Band slotlar</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-400">{statCounts.blocked}</p>
            <p className="text-xs text-red-400/60">Bloklangan</p>
          </div>
        </div>

        {/* Settings Summary */}
        {settings && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Settings size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Sozlamalar</span>
            </div>
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-400">
              <div>Ish vaqti: <span className="text-gray-200">{settings.startTime} — {settings.endTime}</span></div>
              <div>Slot: <span className="text-gray-200">{settings.slotDuration} daqiqa</span></div>
              <div>Tanaffus: <span className="text-gray-200">{settings.breakDuration} daqiqa</span></div>
              <div>Max/kun: <span className="text-gray-200">{settings.maxPatientsDay} bemor</span></div>
            </div>
          </div>
        )}

        {/* Slots Table */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Sana</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Vaqt</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Izoh</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">Yuklanmoqda...</td></tr>
              ) : slots.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">Bu oyda slotlar yo'q</td></tr>
              ) : slots.map(slot => {
                const st = STATUS_STYLES[slot.status] ?? STATUS_STYLES.FREE;
                return (
                  <tr key={slot.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2.5 text-sm text-gray-300">
                      {new Date(slot.date).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-200 font-mono">
                      {slot.startTime} — {slot.endTime}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{slot.blockReason ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
