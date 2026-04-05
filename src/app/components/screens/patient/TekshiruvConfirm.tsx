import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Shield, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { formatPrice } from '../../../utils/formatters';

export function TekshiruvConfirm() {
  const { currentUser, goBack, navigate, draftExamination, addApplication } = useApp();
  const [checks, setChecks] = useState({ contract: false, pdpl: false, disclaimer: false });
  const [loading, setLoading] = useState(false);

  const allChecked = checks.contract && checks.pdpl && checks.disclaimer;
  const price = draftExamination.price || 120000;

  const toggle = (key: keyof typeof checks) => setChecks((p) => ({ ...p, [key]: !p[key] }));

  const handleConfirm = async () => {
    if (!allChecked) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const id = Date.now();
    const arizaNumber = `TKS-2026-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    const lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const newApp = {
      id,
      arizaNumber,
      patientId: currentUser?.id || 1,
      patient: currentUser || undefined,
      status: 'new' as const,
      scanType: 'Tekshiruv',
      organ: draftExamination.examinationName || 'Tekshiruv',
      serviceType: 'radiolog_only' as const,
      urgency: 'normal' as const,
      scanDate: draftExamination.selectedDate || new Date().toISOString().split('T')[0],
      scanFacility: draftExamination.region ? `${draftExamination.region}${draftExamination.district ? `, ${draftExamination.district}` : ''}` : 'Klinika',
      price,
      notes: `${draftExamination.examinationName || ''} • ${draftExamination.selectedDate || ''} ${draftExamination.selectedSlot || ''}`,
      slotLockExpiresAt: lockExpiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [],
    };

    addApplication(newApp as any);
    setLoading(false);
    navigate('patient_payment');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-sky-900 to-blue-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center" aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-sky-200 text-xs">6-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Tasdiqlash</h1>
          </div>
        </div>
        <p className="text-sky-200/80 text-xs">
          {draftExamination.examinationName || '—'} • {draftExamination.selectedDate || '—'} {draftExamination.selectedSlot || ''}
        </p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-700 text-sm mb-3">Ma’lumotlar</p>
          <div className="space-y-2">
            {[
              { label: 'Tekshiruv', value: draftExamination.examinationName || '—' },
              { label: 'Hudud', value: draftExamination.region ? `${draftExamination.region}${draftExamination.district ? `, ${draftExamination.district}` : ''}` : '—' },
              { label: 'Sana', value: draftExamination.selectedDate || '—' },
              { label: 'Vaqt', value: draftExamination.selectedSlot || '—' },
              { label: "To'lov summasi", value: formatPrice(price) },
            ].map((x) => (
              <div key={x.label} className="flex justify-between gap-4 py-1 border-b border-gray-50 last:border-0">
                <span className="text-gray-500 text-sm">{x.label}</span>
                <span className="text-gray-800 text-sm text-right">{x.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <p className="text-gray-700 text-sm">Rozilik (barcha 3 ta majburiy)</p>

          {[
            { key: 'contract' as const, label: "Tekshiruv shartlarini o‘qidim va qabul qilaman" },
            { key: 'pdpl' as const, label: "Shaxsiy ma'lumotlarimni qayta ishlashga roziman (PDPL 2019)" },
            { key: 'disclaimer' as const, label: "Tekshiruv natijasi klinik ko‘rik o‘rnini bosa olmasligini tushunaman" },
          ].map((item) => (
            <button key={item.key} onClick={() => toggle(item.key)} className="flex items-start gap-3 w-full text-left">
              {checks[item.key] ? (
                <CheckSquare className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${checks[item.key] ? 'text-gray-800' : 'text-gray-500'}`}>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-700 text-xs">
            Tasdiqlash bosilganda elektron imzo qayd etiladi: Telegram ID, timestamp va IP (demo).
          </p>
        </div>

        {!allChecked && (
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs">Davom etish uchun barcha 3 ta roziliklarni belgilang</p>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={handleConfirm}
          disabled={!allChecked || loading}
          className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-sky-200 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Ariza yaratilmoqda...</span>
            </>
          ) : (
            <>
              <span>Tasdiqlash va To‘lovga o‘tish</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

