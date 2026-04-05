import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Shield, CheckSquare, AlertCircle,
  Loader2, CalendarCheck,
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { authService } from '../../../../services';
import { formatPrice } from '../../../utils/formatters';
import type { User } from '../../../types';

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

type Stage = 'idle' | 'booking';

export function KonsultatsiyaConfirm() {
  const {
    currentUser, goBack, navigate,
    draftConsultation, addApplication,
  } = useApp();

  const [checks, setChecks]   = useState({ contract: false, pdpl: false, disclaimer: false });
  const [doctor, setDoctor]   = useState<User | null>(null);
  const [stage, setStage]     = useState<Stage>('idle');

  useEffect(() => {
    const id = draftConsultation.selectedDoctorId;
    if (!id) return;
    authService.getUserById(id).then(setDoctor);
  }, [draftConsultation.selectedDoctorId]);

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
      status:      'booked' as const,
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

    navigate('patient_home');
  };

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

        </div>
        <p className="text-emerald-200/80 text-xs">
          {doctor ? `Dr. ${doctor.fullName}` : 'Shifokor tanlanmagan'} • {typeLabel}
        </p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">

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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 text-sm font-medium">
              Rozilik{' '}
              <span className="text-gray-400 font-normal">(barcha 3 ta majburiy)</span>
            </p>
            <button
              onClick={() =>
                setChecks(
                  allChecked
                    ? { contract: false, pdpl: false, disclaimer: false }
                    : { contract: true, pdpl: true, disclaimer: true }
                )
              }
              disabled={stage === 'booking'}
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
                checks[item.key]
                  ? 'bg-emerald-600 border-emerald-600'
                  : 'bg-white border-gray-300 group-hover:border-emerald-300'
              }`}>
                {checks[item.key] && (
                  <CheckSquare className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </div>
              <span className={`text-sm leading-snug transition-colors ${
                checks[item.key] ? 'text-gray-800 font-medium' : 'text-gray-500'
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

        </AnimatePresence>
      </div>
    </div>
  );
}
