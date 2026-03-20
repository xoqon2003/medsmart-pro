import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Clock, CalendarDays, MessageSquare, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { useApp } from '../../../store/appStore';

const TIME_SLOTS = [
  { id: '08:00-10:00', label: '08:00 – 10:00', desc: 'Ertalab' },
  { id: '10:00-12:00', label: '10:00 – 12:00', desc: 'Oldingi tush' },
  { id: '12:00-14:00', label: '12:00 – 14:00', desc: 'Tush atrofi' },
  { id: '14:00-16:00', label: '14:00 – 16:00', desc: 'Kunduzi' },
  { id: '16:00-18:00', label: '16:00 – 18:00', desc: 'Kechqurun' },
];

function getDayOptions() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const todayAvailable = now.getHours() < 14; // 14:00 gacha ariza berish

  const fmt = (d: Date) => d.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' });

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  return [
    { id: 'today' as const, label: 'Bugun', sublabel: fmt(today), disabled: !todayAvailable, note: !todayAvailable ? 'Soat 14:00 dan keyin' : undefined },
    { id: 'tomorrow' as const, label: 'Ertaga', sublabel: fmt(tomorrow), disabled: false },
    { id: 'day-after' as const, label: '2 kun keyin', sublabel: fmt(dayAfter), disabled: false },
  ];
}

export function UygaChaqirishVaqt() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation } = useApp();

  const [visitDay, setVisitDay] = useState<'today' | 'tomorrow' | 'day-after' | ''>(draftConsultation.hvVisitDay || '');
  const [timeSlot, setTimeSlot] = useState(draftConsultation.hvTimeSlot || '');
  const [presence, setPresence] = useState(draftConsultation.hvPresenceConfirmed || false);
  const [note, setNote] = useState(draftConsultation.hvVisitNote || '');
  const [submitted, setSubmitted] = useState(false);

  const dayOptions = getDayOptions();
  const isValid = visitDay && timeSlot && presence;

  const handleNext = () => {
    setSubmitted(true);
    if (!isValid) return;
    updateDraftConsultation({
      hvVisitDay: visitDay as 'today' | 'tomorrow' | 'day-after',
      hvTimeSlot: timeSlot,
      hvPresenceConfirmed: presence,
      hvVisitNote: note,
    });
    navigate('home_visit_specialist');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-orange-100 text-xs">3-qadam / 5</p>
            <h1 className="text-white text-lg font-bold">Qulay tashrif vaqti</h1>
            <p className="text-orange-100/80 text-xs mt-0.5">Shifokor kelishi uchun vaqt belgilang</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex gap-1 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-5 -mt-4 pb-28 space-y-3">
        {/* Sana tanlash */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-gray-800 text-sm font-semibold flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-orange-500" /> Tashrif sanasi *
          </h3>
          <div className="space-y-2">
            {dayOptions.map((day) => (
              <button
                key={day.id}
                onClick={() => !day.disabled && setVisitDay(day.id)}
                disabled={day.disabled}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  visitDay === day.id
                    ? 'border-orange-400 bg-orange-50'
                    : day.disabled
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-gray-50 hover:border-orange-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  visitDay === day.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {visitDay === day.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${visitDay === day.id ? 'text-orange-700' : 'text-gray-700'}`}>{day.label}</p>
                  <p className="text-gray-500 text-xs">{day.sublabel}</p>
                </div>
                {day.note && <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded-lg">{day.note}</span>}
              </button>
            ))}
          </div>
          {submitted && !visitDay && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Sanani tanlang</p>}
        </div>

        {/* Vaqt oralig'i */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-gray-800 text-sm font-semibold flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-500" /> Vaqt oralig'i *
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {TIME_SLOTS.map((slot) => (
              <motion.button
                key={slot.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTimeSlot(slot.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  timeSlot === slot.id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-200 bg-gray-50 hover:border-orange-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  timeSlot === slot.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {timeSlot === slot.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${timeSlot === slot.id ? 'text-orange-700' : 'text-gray-700'}`}>{slot.label}</span>
                </div>
                <span className="text-gray-400 text-xs">{slot.desc}</span>
              </motion.button>
            ))}
          </div>
          {submitted && !timeSlot && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Vaqt oralig'ini tanlang</p>}
        </div>

        {/* Kafolat + izoh */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          {/* Presence confirmation */}
          <button
            onClick={() => setPresence(!presence)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
              presence ? 'border-green-400 bg-green-50' : submitted ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {presence
              ? <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              : <Square className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className={`text-sm font-medium ${presence ? 'text-green-700' : 'text-gray-700'}`}>
                Belgilangan vaqtda uyda bo'laman — tasdiqlayman *
              </p>
              <p className="text-gray-500 text-xs mt-0.5">Shifokor kelganda uyda bo'lish kafolati</p>
            </div>
          </button>
          {submitted && !presence && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />Uyda bo'lishingizni tasdiqlang</p>}

          {/* Note */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-700 text-xs font-medium flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" /> Izoh
              </label>
              <span className="text-gray-400 text-xs">ixtiyoriy</span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={"Masalan: Nonushta vaqtida bo'lmayman, 10:30 dan keyin keling"}
              rows={2}
              maxLength={300}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <p className="text-gray-400 text-xs text-right mt-1">{note.length}/300</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-6 pt-3 bg-gray-50/90 backdrop-blur-sm border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-lg ${
            isValid ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200' : 'bg-gray-200 text-gray-400'
          }`}
        >
          <span>Keyingi qadam</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
