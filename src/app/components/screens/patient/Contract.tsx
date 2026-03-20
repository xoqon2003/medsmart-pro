import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, FileText, CheckSquare, Square, AlertCircle, Shield } from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { calculatePrice, formatPrice, getServiceLabel, getUrgencyLabel } from '../../../data/mockData';

const STEP_LABELS = ['Tasvir', 'Shikoyat', 'Xizmat', 'Shartnoma', "To'lov"];

const CONTRACT_TEXT = `MASOFAVIY RADIOLOGIK KONSULTATSIYA XIZMAT KO'RSATISH SHARTNOMASI

1. SHARTNOMA MAQSADI
Ushbu shartnoma Radiolog mutaxassis (Ijrochi) bilan Bemor (Mijoz) o'rtasida tuzilgan bo'lib, masofaviy radiologik konsultatsiya xizmatini ko'rsatishni tartibga soladi.

2. XIZMAT MAZMUNI
2.1. Ijrochi Mijozning yuklagan tibbiy tasvirlarini (MRT, MSKT, Rentgen, USG va boshqalar) professional ko'rib chiqib, yozma xulosa tayyorlaydi.
2.2. Xulosa kelishilgan muddatda Mijozga Telegram orqali yetkaziladi.

3. MUHIM CHEKLOVLAR
3.1. Radiologik xulosa faqat maslahatlashuv maqsadida beriladi.
3.2. Bu xulosa shifokor klinik ko'rigini yoki shaxsan ko'ruvini ALMASHTIRMAYDI.
3.3. Favqulodda tibbiy holatlarda darhol 103 (Tez Yordam) ga murojaat qilish zarur.

4. TO'LOV SHARTLARI
4.1. To'lov xizmat ko'rsatilishidan avval amalga oshiriladi.
4.2. To'lov qaytarilishi: texnik sabab yoki xizmat ko'rsatilmagan holda.

5. MA'LUMOTLAR MAXFIYLIGI
5.1. Barcha tibbiy ma'lumotlar O'zbekiston Respublikasining PDPL 2019 qonuniga muvofiq muhofaza qilinadi.
5.2. Ma'lumotlar uchinchi shaxslarga berilmaydi (qonun talabi bundan mustasno).
5.3. Tibbiy fayllar 5 yil davomida shifrlangan holda saqlanadi.

6. TOMONLAR MAJBURIYATLARI
6.1. Mijoz: to'g'ri va to'liq ma'lumot berish, to'lovni o'z vaqtida amalga oshirish.
6.2. Ijrochi: kelishilgan muddatda sifatli xulosa berish, maxfiylikni saqlash.

7. NIZOLAR
Nizolar muzokaralar yo'li bilan hal etiladi. Kelishuv bo'lmasa — O'zbekiston qonunchiligiga asosan.

Ariza raqami va Telegram foydalanuvchi ID bu shartnomaga elektron imzo sifatida xizmat qiladi.
Sana va vaqt avtomatik qayd etiladi.`;

export function Contract() {
  const { currentUser, draftApplication, navigate, goBack, addApplication } = useApp();
  const [checks, setChecks] = useState({ contract: false, pdpl: false, disclaimer: false });
  const [loading, setLoading] = useState(false);

  const price = calculatePrice(draftApplication.serviceType || 'ai_radiolog', draftApplication.urgency || 'normal');
  const serviceInfo = getServiceLabel(draftApplication.serviceType || 'ai_radiolog');
  const urgencyInfo = getUrgencyLabel(draftApplication.urgency || 'normal');

  const allChecked = checks.contract && checks.pdpl && checks.disclaimer;

  const toggle = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirm = async () => {
    if (!allChecked) return;
    setLoading(true);

    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));

    const examinations = (() => {
      const category = draftApplication.examCategory;
      if (!category) return [];

      const attachments = (draftApplication.files || []).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        isDicom: f.isDicom,
      }));

      return [
        {
          id: Date.now(),
          category,
          instrumentalType:
            category === 'instrumental'
              ? (draftApplication.instrumentalType === 'Boshqa'
                ? (draftApplication.instrumentalOtherName || 'Boshqa')
                : (draftApplication.instrumentalType || ''))
              : undefined,
          labTypes: category === 'laboratory' ? (draftApplication.labTypes || []) : undefined,
          organ: draftApplication.organ,
          dateStatus: draftApplication.examDateStatus || 'to_clarify',
          dateYmd: draftApplication.examDateStatus === 'known' ? (draftApplication.examDateYmd || undefined) : undefined,
          approxYear: draftApplication.examDateStatus === 'unknown' ? (draftApplication.examDateApproxYear || undefined) : undefined,
          facility: draftApplication.scanFacility,
          attachments,
          createdAt: new Date().toISOString(),
        },
      ];
    })();

    const newApp = {
      id: Date.now(),
      arizaNumber: `RAD-2026-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      patientId: currentUser?.id || 1,
      patient: currentUser || undefined,
      status: 'new' as const,
      scanType: draftApplication.scanType || 'MRT',
      organ: draftApplication.organ || 'Bosh',
      serviceType: draftApplication.serviceType || 'ai_radiolog',
      urgency: draftApplication.urgency || 'normal',
      scanDate: draftApplication.scanDate || new Date().toISOString().split('T')[0],
      scanFacility: draftApplication.scanFacility,
      price,
      examinations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [],
      anamnez: {
        id: Date.now(),
        applicationId: Date.now(),
        complaint: draftApplication.complaint || '',
        duration: draftApplication.duration || '',
        hasPain: draftApplication.hasPain || false,
        painLevel: draftApplication.painLevel,
        previousTreatment: draftApplication.previousTreatment,
        medications: draftApplication.medications,
        allergies: draftApplication.allergies,
        additionalInfo: draftApplication.additionalInfo,
      },
    };

    addApplication(newApp as any);
    setLoading(false);
    navigate('patient_payment');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-white text-lg">Shartnoma</h1>
            <p className="text-blue-200 text-xs">4-bosqich: Verifikatsiya va rozilik</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {STEP_LABELS.map((l, i) => (
            <div key={l} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">Ma'lumotlar xulosasi</p>
          <div className="space-y-2">
            {[
              { label: "Foydalanuvchi", value: currentUser?.fullName || '' },
              { label: "Tasvir turi", value: draftApplication.scanType || '' },
              { label: "Organ/Soha", value: draftApplication.organ || '' },
              { label: "Xizmat", value: `${serviceInfo.icon} ${serviceInfo.label}` },
              { label: "Muhimlik", value: `${urgencyInfo.icon} ${urgencyInfo.label.split('(')[0]}` },
              { label: "To'lov", value: formatPrice(price) },
            ].map(item => (
              <div key={item.label} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                <span className="text-gray-500 text-sm">{item.label}</span>
                <span className="text-gray-800 text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contract text */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-500" />
            <p className="text-gray-700 text-sm">Shartnoma matni</p>
          </div>
          <div className="h-48 overflow-y-auto bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
            {CONTRACT_TEXT}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <p className="text-gray-700 text-sm mb-2">Rozilik (barcha 3 ta majburiy)</p>

          {[
            {
              key: 'contract' as const,
              label: 'Shartnoma shartlarini o\'qidim va qabul qilaman',
            },
            {
              key: 'pdpl' as const,
              label: 'Shaxsiy ma\'lumotlarimni qayta ishlashga roziman (PDPL 2019)',
            },
            {
              key: 'disclaimer' as const,
              label: 'Xulosa klinik ko\'rik o\'rnini bosa olmasligini tushunaman',
            },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              className="flex items-start gap-3 w-full text-left"
            >
              {checks[item.key] ? (
                <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
              )}
              <span className={`text-sm ${checks[item.key] ? 'text-gray-800' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Legal note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-700 text-xs">
            Tasdiqlash bosilganda elektron imzo qayd etiladi: Telegram ID, timestamp va IP manzil.
          </p>
        </div>

        {!allChecked && (
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs">Davom etish uchun barcha 3 ta roziliklarni belgilang</p>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!allChecked || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Ariza yaratilmoqda...</span>
            </>
          ) : (
            <>
              <span>Tasdiqlash va To'lovga o'tish</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
