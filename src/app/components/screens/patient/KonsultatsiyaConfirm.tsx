import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ChevronRight, Shield, CheckSquare, AlertCircle,
  Clock, CheckCircle2, XCircle, Loader2, CalendarCheck,
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { authService } from '../../../../services';
import { formatPrice } from '../../../data/mockData';
import type { User } from '../../../types';

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function formatCountdown(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

type Stage = 'idle' | 'booking' | 'booked' | 'cancelling';

export function KonsultatsiyaConfirm() {
  const {
    currentUser, goBack, navigate,
    draftConsultation, addApplication, updateApplicationStatus,
  } = useApp();

  const [checks, setChecks]   = useState({ contract: false, pdpl: false, disclaimer: false });
  const [doctor, setDoctor]   = useState<User | null>(null);
  const [stage, setStage]     = useState<Stage>('idle');
  const [bookedId, setBookedId] = useState<number | null>(null);
  const [holdRemaining, setHoldRemaining] = useState(15 * 60); // 15 min
  const [holdStarted, setHoldStarted]     = useState(false);

  useEffect(() => {
    const id = draftConsultation.selectedDoctorId;
    if (!id) return;
    authService.getUserById(id).then(setDoctor);
  }, [draftConsultation.selectedDoctorId]);

  /* ── HOLD countdown ── */
  useEffect(() => {
    if (!holdStarted) return;
    if (holdRemaining <= 0) return;
    const t = setInterval(() => setHoldRemaining((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [holdStarted, holdRemaining]);

  /* ── Hold tugaganda avtomatik bekor ── */
  useEffect(() => {
    if (!holdStarted || holdRemaining > 0) return;
    if (bookedId !== null) {
      updateApplicationStatus(bookedId, 'failed', "HOLD muddati tugadi (15 daqiqa)");
    }
    goBack();
  }, [holdStarted, holdRemaining, bookedId, updateApplicationStatus, goBack]);

  const allChecked = checks.contract && checks.pdpl && checks.disclaimer;
  const price = draftConsultation.price || 150000;

  const toggle = (key: keyof typeof checks) =>
    setChecks((p) => ({ ...p, [key]: !p[key] }));

  const isSanatorium = draftConsultation.offlineType === 'sanatorium';

  const typeLabel = (() => {
    if (draftConsultation.mode === 'online') {
      if (draftConsultation.onlineType === 'video')  return "Onlayn — Video qo'ng'iroq";
      if (draftConsultation.onlineType === 'phone')  return "Onlayn — Telefon qo'ng'iroq";
      if (draftConsultation.onlineType === 'chat')   return 'Onlayn — Chat';
      return 'Onlayn';
    }
    if (draftConsultation.mode === 'offline') {
      if (draftConsultation.offlineType === 'clinic')    return 'Oflayn — Klinikaga borish';
      if (draftConsultation.offlineType === 'home')      return 'Oflayn — Uyga chaqirish';
      if (draftConsultation.offlineType === 'inpatient') return 'Oflayn — Statsionar';
      if (draftConsultation.offlineType === 'sanatorium')return 'Sanatoriya / Reabilitatsiya';
      return 'Oflayn';
    }
    return '—';
  })();

  /* ── Band qilish ── */
  const handleBook = async () => {
    if (!allChecked) return;
    setStage('booking');
    await new Promise((r) => setTimeout(r, 900));

    const id = Date.now();
    const arizaNumber = `KNS-2026-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    const lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    addApplication({
      id,
      arizaNumber,
      patientId:   currentUser?.id || 1,
      patient:     currentUser || undefined,
      doctorId:    doctor?.id,
      doctor:      doctor || undefined,
      status:      'new' as const,
      scanType:    'Konsultatsiya',
      organ:       doctor?.specialty || 'Mutaxassis',
      serviceType: 'consultation' as const,
      urgency:     'normal' as const,
      scanDate:    draftConsultation.selectedDate || now.split('T')[0],
      scanFacility: draftConsultation.clinicName ||
        (draftConsultation.mode === 'offline' ? 'Oflayn qabul' : 'Onlayn qabul'),
      price,
      notes: `${typeLabel} • ${draftConsultation.selectedDate || ''} ${draftConsultation.selectedSlot || ''}`,
      slotLockExpiresAt: lockExpiresAt,
      createdAt: now,
      updatedAt: now,
      files: [],
    } as any);

    setBookedId(id);
    setHoldRemaining(15 * 60);
    setHoldStarted(true);
    setStage('booked');
  };

  /* ── Bekor qilish ── */
  const handleCancel = useCallback(() => {
    setStage('cancelling');
  }, []);

  const confirmCancel = useCallback(() => {
    if (bookedId !== null) {
      updateApplicationStatus(bookedId, 'failed', 'Bemor tomonidan bekor qilindi');
    }
    setHoldStarted(false);
    setStage('idle');
    goBack();
  }, [bookedId, updateApplicationStatus, goBack]);

  /* ── To'lovga o'tish ── */
  const handlePayment = () => navigate('patient_payment');

  /* ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={goBack}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            aria-label="Orqaga"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-emerald-200 text-xs">6-bosqich (yakuniy)</p>
            <h1 className="text-white text-lg font-semibold">Tasdiqlash</h1>
          </div>

          {/* HOLD badge */}
          {stage === 'booked' && (
            <div className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/30 rounded-xl px-3 py-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className={`text-xs font-mono font-bold ${holdRemaining < 60 ? 'text-red-300' : 'text-amber-200'}`}>
                {formatCountdown(holdRemaining)}
              </span>
            </div>
          )}
        </div>
        <p className="text-emerald-200/80 text-xs">
          {doctor ? `Dr. ${doctor.fullName}` : 'Shifokor tanlanmagan'} • {typeLabel}
        </p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">

        {/* ── HOLD eslatmasi (booked holatida) ── */}
        <AnimatePresence>
          {stage === 'booked' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-xl p-3 flex items-center gap-2 border ${
                holdRemaining < 60
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <Clock className={`w-4 h-4 flex-shrink-0 ${holdRemaining < 60 ? 'text-red-500' : 'text-amber-600'}`} />
              <p className={`text-xs ${holdRemaining < 60 ? 'text-red-700' : 'text-amber-700'}`}>
                Slot HOLD — <span className="font-bold font-mono">{formatCountdown(holdRemaining)}</span> ichida to'lov qilmasa, slot bo'shatiladi
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Ma'lumotlar kartochkasi ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-700 text-sm font-medium mb-3">Ma'lumotlar</p>
          <div className="space-y-2">
            {[
              ...(isSanatorium ? [
              { label: 'Sanatoriya', value: draftConsultation.sanatoriumName || '—' },
              { label: 'Manzil',     value: draftConsultation.clinicAddress || '—' },
              { label: 'Xona turi',  value: draftConsultation.sanatoriumRoomType === 'single' ? '1-kishilik' : draftConsultation.sanatoriumRoomType === 'double' ? '2-kishilik' : 'Oilaviy kotedj' },
              { label: 'Muddat',     value: draftConsultation.sanatoriumDuration ? `${draftConsultation.sanatoriumDuration} kun` : '—' },
              { label: 'Kunlik narx', value: draftConsultation.sanatoriumPricePerDay ? formatPrice(draftConsultation.sanatoriumPricePerDay) : '—' },
              { label: "Jami to'lov", value: formatPrice(price) },
            ] : [
              { label: 'Shifokor',    value: doctor ? `Dr. ${doctor.fullName}` : '—' },
              { label: 'Mutaxassislik', value: doctor?.specialty || '—' },
              ...(draftConsultation.clinicName
                ? [{ label: 'Klinika', value: draftConsultation.clinicName }] : []),
              ...(draftConsultation.clinicAddress
                ? [{ label: 'Manzil', value: draftConsultation.clinicAddress }] : []),
              { label: 'Murojaat uchun telefon', value: doctor?.phone || '—' },
              { label: 'Qabul turi',  value: typeLabel },
              { label: 'Sana',        value: draftConsultation.selectedDate || '—' },
              {
                label: 'Vaqt',
                value: draftConsultation.selectedSlot
                  ? `${draftConsultation.selectedSlot}–${addMinutes(draftConsultation.selectedSlot, 30)}`
                  : '—',
              },
              { label: "To'lov summasi", value: formatPrice(price) },
            ]),
            ].map((x) => (
              <div key={x.label} className="flex justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-500 text-sm">{x.label}</span>
                <span className="text-gray-800 text-sm text-right font-medium">{x.value}</span>
              </div>
            ))}
          </div>

          {draftConsultation.complaint && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-gray-400 text-xs mb-1.5">Murojaat sababi</p>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl px-3 py-2">
                {draftConsultation.complaint}
              </p>
            </div>
          )}
        </div>

        {/* ── Roziliklar ── */}
        <div className={`bg-white rounded-2xl shadow-sm border p-4 space-y-3 transition-all ${
          stage === 'booked' ? 'border-emerald-100 opacity-70' : 'border-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-gray-700 text-sm font-medium">
              Rozilik{' '}
              <span className="text-gray-400 font-normal">(barcha 3 ta majburiy)</span>
            </p>
            {stage === 'idle' && (
              <button
                onClick={() =>
                  setChecks(
                    allChecked
                      ? { contract: false, pdpl: false, disclaimer: false }
                      : { contract: true, pdpl: true, disclaimer: true }
                  )
                }
                className="flex items-center gap-1.5 group"
              >
                <div className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  allChecked
                    ? 'bg-emerald-600 border-emerald-600'
                    : checks.contract || checks.pdpl || checks.disclaimer
                      ? 'bg-white border-emerald-400'
                      : 'bg-white border-gray-300 group-hover:border-emerald-300'
                }`}>
                  {allChecked && <CheckSquare className="w-3 h-3 text-white" strokeWidth={3} />}
                  {!allChecked && (checks.contract || checks.pdpl || checks.disclaimer) && (
                    <div className="w-2 h-0.5 bg-emerald-500 rounded-full" />
                  )}
                </div>
                <span className={`text-xs font-medium ${allChecked ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`}>
                  Barchasini belgilash
                </span>
              </button>
            )}
            {stage === 'booked' && (
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tasdiqlandi
              </span>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          {[
            { key: 'contract'    as const, label: "Konsultatsiya shartlarini o'qidim va qabul qilaman" },
            { key: 'pdpl'        as const, label: "Shaxsiy ma'lumotlarimni qayta ishlashga roziman (PDPL 2019)" },
            { key: 'disclaimer'  as const, label: "Konsultatsiya klinik ko'rik o'rnini bosa olmasligini tushunaman" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => stage === 'idle' && toggle(item.key)}
              className="flex items-start gap-3 w-full text-left group"
              disabled={stage !== 'idle'}
            >
              <div className={`w-[18px] h-[18px] mt-0.5 rounded-[5px] border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                checks[item.key] || stage === 'booked'
                  ? 'bg-emerald-600 border-emerald-600'
                  : 'bg-white border-gray-300 group-hover:border-emerald-300'
              }`}>
                {(checks[item.key] || stage === 'booked') && (
                  <CheckSquare className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>
              <span className={`text-sm leading-snug transition-colors ${
                checks[item.key] || stage === 'booked' ? 'text-gray-800 font-medium' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Elektron imzo eslatmasi ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700 text-xs">
            Tasdiqlash bosilganda elektron imzo qayd etiladi: Telegram ID, timestamp va IP (demo).
          </p>
        </div>

        {/* ── Amal tugmalari ── */}
        <AnimatePresence mode="wait">

          {/* IDLE: "Band qilish" */}
          {stage === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {!allChecked && (
                <div className="flex items-center gap-2 text-gray-400">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-xs">Barcha 3 ta roziliklarni belgilang</p>
                </div>
              )}
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={handleBook}
                disabled={!allChecked}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-40 disabled:shadow-none transition-all"
              >
                <CalendarCheck className="w-5 h-5" />
                <span className="font-medium">Band qilish</span>
              </motion.button>
            </motion.div>
          )}

          {/* BOOKING: loading */}
          {stage === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full bg-emerald-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Slot band qilinmoqda...</span>
            </motion.div>
          )}

          {/* BOOKED: "Band qilingan" + "Bekor qilish" + "To'lovga o'tish" */}
          {stage === 'booked' && (
            <motion.div
              key="booked"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Row: Band qilingan | Bekor qilish */}
              <div className="flex gap-2">
                <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-2xl py-3.5 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700 text-sm font-semibold">Band qilingan</span>
                </div>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-red-50 border border-red-200 rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 text-sm font-medium">Bekor qilish</span>
                </button>
              </div>

              {/* To'lovga o'tish */}
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={handlePayment}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                <span className="font-medium">Tasdiqlash va To'lovga o'tish</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bekor qilish tasdiq modali ── */}
      <AnimatePresence>
        {stage === 'cancelling' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={() => setStage('booked')}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-gray-900 text-base font-semibold">Bron bekor qilinsinmi?</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Band qilingan slot bo'shatiladi. Bu amalni qaytarib bo'lmaydi.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStage('booked')}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-3.5 text-sm font-medium"
                >
                  Qaytish
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 bg-red-500 text-white rounded-2xl py-3.5 text-sm font-semibold"
                >
                  Ha, bekor qilish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
