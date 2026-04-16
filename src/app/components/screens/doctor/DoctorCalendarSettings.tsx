import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../store/navigationContext';
import { calendarService } from '../../../../services/api/calendarService';
import type { CalendarSetting } from '../../../types';
import { ChevronLeft, Save, Loader2, Clock, MapPin, DollarSign, Calendar } from 'lucide-react';

const DAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
const DURATIONS = [15, 20, 30, 45, 60];
const BREAKS = [0, 5, 10, 15, 20];
const CONSULT_TYPES = [
  { value: 'OFFLINE', label: 'Oflayn' },
  { value: 'ONLINE', label: 'Onlayn' },
  { value: 'PHONE', label: 'Telefon' },
  { value: 'VIDEO', label: 'Video' },
];

export function DoctorCalendarSettings() {
  const { goBack } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<CalendarSetting>>({
    workDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '18:00',
    slotDuration: 30,
    breakDuration: 10,
    consultTypes: ['OFFLINE', 'ONLINE'],
    onlinePrice: 0,
    offlinePrice: 0,
    maxPatientsDay: 20,
  });

  useEffect(() => {
    calendarService.getSettings()
      .then(s => { if (s) setForm(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day: number) => {
    const days = form.workDays ?? [];
    setForm(prev => ({
      ...prev,
      workDays: days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort(),
    }));
  };

  const toggleConsultType = (type: string) => {
    const types = form.consultTypes ?? [];
    setForm(prev => ({
      ...prev,
      consultTypes: types.includes(type) ? types.filter(t => t !== type) : [...types, type],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await calendarService.upsertSettings(form);
      goBack();
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
        <h1 className="text-base font-semibold text-gray-900">Kalendar sozlamalari</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Work Days */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock size={16} className="text-blue-500" /> Ish kunlari</h3>
          <div className="flex gap-1.5">
            {DAYS.map((label, i) => (
              <button key={i} onClick={() => toggleDay(i)}
                className={`w-10 h-10 rounded-xl text-xs font-medium transition-colors ${
                  form.workDays?.includes(i) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{label}</button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Ish vaqti</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500">Boshlanish</label>
              <input type="time" value={form.startTime ?? '09:00'} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500">Tugash</label>
              <input type="time" value={form.endTime ?? '18:00'} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
            </div>
          </div>
        </div>

        {/* Slot Duration */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Slot davomiyligi</h3>
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <button key={d} onClick={() => setForm(p => ({ ...p, slotDuration: d }))}
                className={`px-3 py-2 rounded-xl text-xs font-medium ${
                  form.slotDuration === d ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{d} min</button>
            ))}
          </div>
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Tanaffus</p>
            <div className="flex gap-2">
              {BREAKS.map(b => (
                <button key={b} onClick={() => setForm(p => ({ ...p, breakDuration: b }))}
                  className={`px-3 py-2 rounded-xl text-xs font-medium ${
                    form.breakDuration === b ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>{b} min</button>
              ))}
            </div>
          </div>
        </div>

        {/* Consult Types */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Konsultatsiya turlari</h3>
          <div className="grid grid-cols-2 gap-2">
            {CONSULT_TYPES.map(ct => (
              <button key={ct.value} onClick={() => toggleConsultType(ct.value)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium border ${
                  form.consultTypes?.includes(ct.value) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                }`}>{ct.label}</button>
            ))}
          </div>
        </div>

        {/* Prices */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><DollarSign size={16} className="text-green-500" /> Narxlar (so'm)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500">Oflayn</label>
              <input type="number" value={form.offlinePrice ?? 0} onChange={e => setForm(p => ({ ...p, offlinePrice: +e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500">Onlayn</label>
              <input type="number" value={form.onlinePrice ?? 0} onChange={e => setForm(p => ({ ...p, onlinePrice: +e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
            </div>
          </div>
        </div>

        {/* Office */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} className="text-red-500" /> Qabul manzili</h3>
          <div className="space-y-2">
            <input value={form.officeName ?? ''} onChange={e => setForm(p => ({ ...p, officeName: e.target.value }))}
              placeholder="Tashkilot nomi" className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
            <input value={form.officeAddress ?? ''} onChange={e => setForm(p => ({ ...p, officeAddress: e.target.value }))}
              placeholder="Manzil" className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={form.officeFloor ?? ''} onChange={e => setForm(p => ({ ...p, officeFloor: +e.target.value }))}
                placeholder="Qavat" className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
              <input value={form.officeCabinet ?? ''} onChange={e => setForm(p => ({ ...p, officeCabinet: e.target.value }))}
                placeholder="Kabinet" className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-4 space-y-2">
        <button onClick={handleSave} disabled={saving}
          className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
        <button onClick={async () => {
          const now = new Date();
          const start = now.toISOString().split('T')[0];
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          const res = await calendarService.generateSlots(start, end);
          alert(res.message);
        }}
          className="w-full border border-green-500 text-green-600 py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-green-50">
          <Calendar size={16} /> Oy uchun slotlar generatsiya qilish
        </button>
      </div>
    </div>
  );
}
