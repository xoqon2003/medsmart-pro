import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../store/navigationContext';
import { extrasService } from '../../../../services/api/extrasService';
import type { AnonymousNumber, CallSchedule } from '../../../types';
import { ChevronLeft, Phone, Clock, Shield, Loader2, Save } from 'lucide-react';

const DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

export function DoctorAnonymousNumber() {
  const { goBack } = useNavigation();
  const [anonNum, setAnonNum] = useState<AnonymousNumber | null>(null);
  const [schedule, setSchedule] = useState<CallSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      extrasService.getAnonymousNumber(),
      extrasService.getCallSchedule(),
    ]).then(([an, cs]) => {
      setAnonNum(an);
      setSchedule(cs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async () => {
    setSaving(true);
    try {
      const updated = await extrasService.upsertAnonymousNumber({ isActive: !anonNum?.isActive });
      setAnonNum(updated);
    } catch {} finally { setSaving(false); }
  };

  const handleSaveSchedule = async () => {
    if (!schedule) return;
    setSaving(true);
    try {
      const updated = await extrasService.upsertCallSchedule({
        workDays: schedule.workDays,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        lunchStart: schedule.lunchStart ?? undefined,
        lunchEnd: schedule.lunchEnd ?? undefined,
        isActive: schedule.isActive,
      });
      setSchedule(updated);
    } catch {} finally { setSaving(false); }
  };

  const toggleDay = (day: number) => {
    if (!schedule) return;
    const days = schedule.workDays.includes(day)
      ? schedule.workDays.filter(d => d !== day)
      : [...schedule.workDays, day].sort();
    setSchedule({ ...schedule, workDays: days });
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20} className="text-gray-600" /></button>
        <h1 className="text-base font-semibold text-gray-900">Anonim nomer</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Info */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Shield size={24} className="text-white" />
            <div>
              <p className="text-white font-semibold text-sm">Raqamingiz himoyalangan</p>
              <p className="text-blue-200 text-xs">Bemorlar faqat virtual raqamni ko'radi</p>
            </div>
          </div>
        </div>

        {/* Anonymous Number */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Phone size={16} className="text-blue-500" /> Virtual nomer
            </h3>
            <button
              onClick={handleToggleActive}
              disabled={saving}
              className={`w-12 h-6 rounded-full transition-colors ${anonNum?.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${anonNum?.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Virtual nomer</p>
            <p className="text-lg font-bold text-gray-900">{anonNum?.virtualNumber ?? 'Tayinlanmagan'}</p>
          </div>
          {!anonNum?.virtualNumber && (
            <p className="text-xs text-gray-400 mt-2">Premium tarifda avtomatik tayinlanadi</p>
          )}
        </div>

        {/* Call Schedule */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
            <Clock size={16} className="text-green-500" /> Qo'ng'iroq vaqti
          </h3>

          {/* Days */}
          <div className="flex gap-1.5 mb-3">
            {DAYS.map((label, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-medium transition-colors ${
                  schedule?.workDays?.includes(i + 1) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500">Boshlanish</label>
              <input
                type="time"
                value={schedule?.startTime ?? '09:00'}
                onChange={e => schedule && setSchedule({ ...schedule, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500">Tugash</label>
              <input
                type="time"
                value={schedule?.endTime ?? '18:00'}
                onChange={e => schedule && setSchedule({ ...schedule, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="mt-3 w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1"
          >
            <Save size={14} /> Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
