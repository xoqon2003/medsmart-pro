import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, FileText, Clock, Pill, Info } from 'lucide-react';
import { useApp } from '../../../store/appStore';

const DURATIONS = [
  { value: 'today', label: 'Bugun boshlandi' },
  { value: '1-3days', label: '1–3 kun' },
  { value: '1week', label: '1 hafta' },
  { value: '2-4weeks', label: '2–4 hafta' },
  { value: '1month+', label: "1 oydan ko'p" },
];

export function KonsultatsiyaAnamnez() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation } = useApp();

  const [complaint, setComplaint] = useState(draftConsultation.complaint || '');
  const [duration, setDuration] = useState(draftConsultation.complaintDuration || '');
  const [takingMed, setTakingMed] = useState(draftConsultation.takingMedication ?? false);
  const [medName, setMedName] = useState(draftConsultation.medicationName || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!complaint || complaint.trim().length < 20)
      e.complaint = 'Kamida 20 ta belgi kiriting';
    if (!duration) e.duration = "Belgilarning davomiyligini tanlang";
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    updateDraftConsultation({
      complaint: complaint.trim(),
      complaintDuration: duration,
      takingMedication: takingMed,
      medicationName: takingMed ? medName.trim() : '',
    });
    navigate('patient_kons_confirm');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            aria-label="Orqaga"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-emerald-200 text-xs">5-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Murojaat sababi</h1>
            <p className="text-emerald-200/80 text-xs mt-0.5">
              Shifokor bu ma'lumotni oldindan o'qib keladi
            </p>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 -mt-4 pb-28 space-y-4">

        {/* Complaint */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-emerald-600" />
            <p className="text-gray-700 text-sm font-medium">
              Murojaat sababi <span className="text-red-500">*</span>
            </p>
          </div>
          <textarea
            value={complaint}
            onChange={(e) => {
              setComplaint(e.target.value);
              setErrors((p) => ({ ...p, complaint: '' }));
            }}
            placeholder="Masalan: 2 haftadan beri chap tizzam og'riydi, ayniqsa zinapoyadan tushganda kuchayadi. Tunda ham og'riq bo'ladi..."
            rows={4}
            maxLength={500}
            className={`w-full text-sm outline-none resize-none text-gray-800 placeholder:text-gray-400 border rounded-xl px-3 py-2.5 transition-colors ${
              errors.complaint
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-gray-50 focus:border-emerald-400 focus:bg-white'
            }`}
          />
          <div className="flex items-center justify-between mt-1.5">
            {errors.complaint ? (
              <p className="text-red-500 text-xs">{errors.complaint}</p>
            ) : (
              <p className="text-gray-400 text-xs">Kamida 20, maksimal 500 belgi</p>
            )}
            <p className={`text-xs font-medium ${complaint.length < 20 ? 'text-gray-400' : 'text-emerald-600'}`}>
              {complaint.length}/500
            </p>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-emerald-600" />
            <p className="text-gray-700 text-sm font-medium">
              Belgilarning davomiyligi <span className="text-red-500">*</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => { setDuration(d.value); setErrors((p) => ({ ...p, duration: '' })); }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all text-left ${
                  duration === d.value
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {errors.duration && (
            <p className="text-red-500 text-xs mt-2">{errors.duration}</p>
          )}
        </div>

        {/* Medication */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <p className="text-gray-700 text-sm font-medium">Hozir dori ichasizmi?</p>
            </div>
            <span className="text-gray-400 text-xs">Ixtiyoriy</span>
          </div>
          <div className="flex gap-2 mb-3">
            {[
              { val: false, label: "Yo'q" },
              { val: true, label: 'Ha' },
            ].map((opt) => (
              <button
                key={String(opt.val)}
                onClick={() => setTakingMed(opt.val)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  takingMed === opt.val
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {takingMed && (
            <input
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="Dori nomi (masalan: Paracetamol 500mg)"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors"
            />
          )}
        </div>

        {/* Info note */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2.5 items-start">
          <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-emerald-700 text-xs leading-relaxed">
            Tahlil natijalari, rentgen yoki avvalgi xulosalarni keyingi qadamda yuklashingiz mumkin. Bu qadamda faqat shikoyatingizni yozing.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
        >
          <span>Davom etish</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
