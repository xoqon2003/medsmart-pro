import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight, CheckCircle, Clock, AlertCircle, FileText,
  Download, Star, RefreshCcw, Printer, Upload, Receipt,
  MapPin, Phone, Stethoscope, Car, Home, CreditCard, ClipboardCheck,
  XCircle, ChevronDown, ChevronUp, CalendarDays, User2
} from 'lucide-react';
import type { Payment } from '../../../types';
import { useApp } from '../../../store/appStore';
import { getStatusLabel, getUrgencyLabel, formatDateTime, formatPrice } from '../../../utils/formatters';
import { downloadConclusionReport, printConclusionReport, downloadPaymentReceipt, printPaymentReceipt } from '../../../utils/pdfGenerator';

type StepState = 'completed' | 'current' | 'pending' | 'error';
type StepId = 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6';
type AppKind = 'RAD' | 'KNS' | 'TKS' | 'HV' | 'OTHER';

const getKind = (arizaNumber: string): AppKind => {
  if ((arizaNumber || '').startsWith('RAD-')) return 'RAD';
  if ((arizaNumber || '').startsWith('KNS-')) return 'KNS';
  if ((arizaNumber || '').startsWith('TKS-')) return 'TKS';
  if ((arizaNumber || '').startsWith('HV-'))  return 'HV';
  return 'OTHER';
};

// ── RAD steps ──────────────────────────────────────────────────────────────
const BASE_STEPS: Array<{ id: StepId; label: string; icon: any; desc: string; conditional?: 'specialist' }> = [
  { id: 'step1', label: 'Ariza qabul qilindi', icon: FileText, desc: "Tizimda ro'yxatga olindi" },
  { id: 'step2', label: "To'lov tasdiqlandi", icon: CheckCircle, desc: "To'lov muvaffaqiyatli" },
  { id: 'step3', label: 'Radiolog qabul qildi', icon: CheckCircle, desc: 'Tekshiruv boshlandi' },
  { id: 'step4', label: "Mutaxassis ko'rib chiqmoqda", icon: Clock, desc: 'Tor mutaxassis konsultatsiyasi', conditional: 'specialist' },
  { id: 'step5', label: 'Xulosa tayyorlanmoqda', icon: Clock, desc: 'Xulosa yozilmoqda / yuklanmoqda' },
  { id: 'step6', label: 'Xulosa tayyor ✅', icon: CheckCircle, desc: 'Barcha xulosalar tasdiqlandi' },
];

// ── KNS/TKS steps ─────────────────────────────────────────────────────────
const KNS_STEPS: Array<{ id: StepId; label: string; icon: any; desc: string }> = [
  { id: 'step1', label: 'Ariza yaratildi', icon: FileText, desc: "Tizimda ro'yxatga olindi" },
  { id: 'step2', label: "To'lov kutilmoqda", icon: Clock, desc: "15 daqiqa ichida to'lov qiling" },
  { id: 'step3', label: "To'lov tasdiqlandi", icon: CheckCircle, desc: 'Qabul tasdiqlandi' },
  { id: 'step5', label: 'Qabul vaqti band', icon: CheckCircle, desc: 'Tanlangan vaqt sloti band qilindi' },
];

const TKS_STEPS: Array<{ id: StepId; label: string; icon: any; desc: string }> = [
  { id: 'step1', label: 'Ariza yaratildi', icon: FileText, desc: "Tizimda ro'yxatga olindi" },
  { id: 'step2', label: "To'lov kutilmoqda", icon: Clock, desc: "15 daqiqa ichida to'lov qiling" },
  { id: 'step3', label: "To'lov tasdiqlandi", icon: CheckCircle, desc: 'Tekshiruv tasdiqlandi' },
  { id: 'step5', label: 'Tekshiruv vaqti band', icon: CheckCircle, desc: 'Tanlangan vaqt sloti band qilindi' },
];

// ── HV steps ───────────────────────────────────────────────────────────────
const HV_STEPS: Array<{ id: StepId; label: string; icon: any; desc: string; hvKey?: string }> = [
  { id: 'step1', label: 'Ariza yuborildi', icon: FileText, desc: "Ariza tizimga qabul qilindi", hvKey: 'created' },
  { id: 'step2', label: 'Ariza qabul qilindi', icon: ClipboardCheck, desc: "Klinika va mutaxassis tayinlandi", hvKey: 'accepted' },
  { id: 'step3', label: "Yo'lga chiqdi", icon: Car, desc: "Shifokor sizning manzilingizga yo'l oldi", hvKey: 'onway' },
  { id: 'step4', label: 'Yetib keldi (Bajarildi)', icon: Home, desc: 'Shifokor tashrif buyurdi', hvKey: 'arrived' },
  { id: 'step5', label: "To'lov amalga oshirildi", icon: CreditCard, desc: "Xizmat haqini to'lash", hvKey: 'paid' },
  { id: 'step6', label: 'Xulosa tayyor ✅', icon: CheckCircle, desc: 'Tibbiy xulosa va tavsiyalar tayyorlandi', hvKey: 'done' },
];

// ── HV step state calculator ────────────────────────────────────────────────
function calcHvStepState(status: string, payment?: { status: string }): Record<StepId, StepState> {
  const st: Record<StepId, StepState> = {
    step1: 'pending', step2: 'pending', step3: 'pending',
    step4: 'pending', step5: 'pending', step6: 'pending',
  };

  const ord: Record<string, number> = {
    new: 1, accepted: 2, hv_onway: 3, hv_arrived: 4, done: 5,
  };
  const cur = ord[status] ?? 1;

  // step1 always completed when app exists
  st.step1 = 'completed';

  // step2 accepted
  if (cur >= 2) st.step2 = 'completed';
  else st.step2 = 'current';

  // step3 onway
  if (cur >= 3) st.step3 = 'completed';
  else if (cur === 2) st.step3 = 'pending';
  else if (cur === 1) st.step3 = 'pending';

  // step4 arrived
  if (cur >= 4) st.step4 = 'completed';
  else if (cur === 3) st.step4 = 'current';
  else st.step4 = 'pending';

  // step5 payment
  const paid = payment?.status === 'paid';
  if (cur >= 4 && paid) st.step5 = 'completed';
  else if (cur >= 4 && !paid) st.step5 = 'current';
  else st.step5 = 'pending';

  // step6 done
  if (cur >= 5 || status === 'done') st.step6 = 'completed';
  else if (cur >= 4 && paid) st.step6 = 'current';
  else st.step6 = 'pending';

  // current marker for step 2 (when cur === 2 but not yet further)
  if (cur === 2) { st.step2 = 'current'; }
  if (cur === 3) { st.step3 = 'current'; }

  // Recalculate to set current correctly
  const transitions: [StepId, number][] = [
    ['step1', 0], ['step2', 2], ['step3', 3], ['step4', 4], ['step5', 4], ['step6', 5],
  ];
  // Reset and recompute clean
  const s2: Record<StepId, StepState> = {
    step1: 'completed',
    step2: cur >= 2 ? 'completed' : 'current',
    step3: cur >= 3 ? 'completed' : cur === 2 ? 'pending' : 'pending',
    step4: cur >= 4 ? 'completed' : cur === 3 ? 'current' : 'pending',
    step5: (cur >= 4 && paid) ? 'completed' : cur >= 4 ? 'current' : 'pending',
    step6: (cur >= 5 || (status === 'done')) ? 'completed' : (cur >= 4 && paid) ? 'current' : 'pending',
  };
  if (cur === 2) s2.step2 = 'current';
  if (cur === 3) { s2.step2 = 'completed'; s2.step3 = 'current'; }

  // Correct step5 current to show after step4 done
  if (s2.step4 === 'completed' && s2.step5 !== 'completed') s2.step5 = 'current';

  return s2;
}

// ── Status dot colors ───────────────────────────────────────────────────────
const HV_STATUS_BADGE: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new:         { label: 'Yangi',         color: 'text-blue-700',   bg: 'bg-blue-50',   dot: 'bg-blue-500' },
  accepted:    { label: 'Qabul qilindi', color: 'text-cyan-700',   bg: 'bg-cyan-50',   dot: 'bg-cyan-500' },
  hv_onway:    { label: "Yo'lda",        color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  hv_arrived:  { label: 'Yetib keldi',   color: 'text-teal-700',   bg: 'bg-teal-50',   dot: 'bg-teal-500' },
  done:        { label: 'Yakunlandi',    color: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-500' },
  failed:      { label: 'Bekor',         color: 'text-red-700',    bg: 'bg-red-50',    dot: 'bg-red-500' },
};

// ── HV specific card ────────────────────────────────────────────────────────
function HvInfoCard({ app }: { app: any }) {
  const DAY_LABELS: Record<string, string> = {
    today: 'Bugun', tomorrow: 'Ertaga', 'day-after': '2 kun keyin',
  };

  const isAccepted = ['accepted', 'hv_onway', 'hv_arrived', 'done'].includes(app.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-gray-50">
        <p className="text-gray-700 text-sm font-semibold flex items-center gap-2">
          <Home className="w-4 h-4 text-orange-500" /> Uyga chaqirish ma'lumotlari
        </p>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {/* Manzil */}
        {app.scanFacility && (
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-xs">Manzil</p>
              <p className="text-gray-800 text-sm font-medium">{app.scanFacility}</p>
            </div>
          </div>
        )}
        {/* Vaqt */}
        {app.hvVisitDay && (
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-xs">Tashrif vaqti</p>
              <p className="text-gray-800 text-sm font-medium">
                {DAY_LABELS[app.hvVisitDay] || app.hvVisitDay} {app.hvTimeSlot && `• ${app.hvTimeSlot}`}
              </p>
            </div>
          </div>
        )}
        {/* Mutaxassis */}
        <div className="flex items-start gap-2.5">
          <Stethoscope className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-gray-500 text-xs">Mutaxassis</p>
            <p className="text-gray-800 text-sm font-medium">{app.organ || 'Aniqlanmoqda...'}</p>
          </div>
        </div>

        {/* Tayinlangan shifokor — faqat qabul qilinganida */}
        {isAccepted ? (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-100 rounded-xl space-y-2">
            <p className="text-orange-700 text-xs font-semibold">Tayinlangan shifokor</p>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                {app.hvDoctorName ? app.hvDoctorName[0] : '👨‍⚕️'}
              </div>
              <div>
                <p className="text-gray-800 text-sm font-medium">
                  {app.hvDoctorName || 'Dr. Ahmadov Sherzod'}
                </p>
                <p className="text-gray-500 text-xs">
                  {app.hvDoctorSpeciality || app.organ || 'Umumiy amaliyot shifokori'}
                </p>
                {app.hvClinicName && (
                  <p className="text-orange-600 text-xs mt-0.5">🏥 {app.hvClinicName}</p>
                )}
              </div>
            </div>
            {app.status === 'hv_onway' && (
              <div className="flex items-center gap-2 bg-orange-100 rounded-xl px-3 py-2">
                <Car className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-orange-700 text-xs font-medium">Shifokor yo'lda — tez yetib keladi!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-400 text-xs text-center">
              Shifokor tez orada tayinlanadi va SMS xabar olasiz
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Payment Info Card ──────────────────────────────────────────────────────
const PROVIDER_LABELS: Record<string, string> = {
  personal_card: 'Shaxsiy karta',
  payme: 'Payme',
  click: 'Click',
  uzcard: 'Uzcard',
  humo: 'Humo',
  uzum: 'Uzum Bank',
  cash: 'Naqd pul',
};

function PaymentInfoCard({ payment, arizaNumber, patientName }: { payment: Payment; arizaNumber: string; patientName?: string }) {
  const [dlLoading, setDlLoading] = useState(false);

  const handleDownload = () => {
    setDlLoading(true);
    try { downloadPaymentReceipt(payment, arizaNumber, patientName); }
    finally { setTimeout(() => setDlLoading(false), 1000); }
  };
  const handlePrint = () => printPaymentReceipt(payment, arizaNumber, patientName);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-gray-50 flex items-center gap-2">
        <Receipt className="w-4 h-4 text-green-600" />
        <p className="text-gray-700 text-sm font-semibold">To'lov ma'lumotlari</p>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">Holati</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">✅ To'langan</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-xs">Summa</span>
          <span className="text-gray-900 text-sm font-semibold">{formatPrice(payment.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-xs">To'lov usuli</span>
          <span className="text-gray-800 text-xs font-medium">{PROVIDER_LABELS[payment.provider] || payment.provider}</span>
        </div>
        {payment.paidAt && (
          <div className="flex justify-between">
            <span className="text-gray-500 text-xs">Sana</span>
            <span className="text-gray-700 text-xs">{formatDateTime(payment.paidAt)}</span>
          </div>
        )}
        {payment.providerTransactionId && (
          <div className="flex justify-between">
            <span className="text-gray-500 text-xs">Tranzaksiya ID</span>
            <span className="text-gray-600 text-xs font-mono">{payment.providerTransactionId}</span>
          </div>
        )}
      </div>
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={handleDownload}
          disabled={dlLoading}
          className="flex-1 bg-green-50 border border-green-200 text-green-700 rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-green-100 transition-colors"
        >
          {dlLoading
            ? <div className="w-3.5 h-3.5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
            : <Download className="w-3.5 h-3.5" />}
          <span>Chek yuklab olish</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs font-medium hover:bg-gray-100 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Chop etish</span>
        </button>
      </div>
    </div>
  );
}

// ── Main StatusTracker ──────────────────────────────────────────────────────
export function StatusTracker() {
  const { selectedApplication, applications, navigate, goBack, updateApplicationStatus, updateApplication } = useApp();
  const [rating, setRating] = useState(selectedApplication?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [rated, setRated] = useState(!!selectedApplication?.rating);
  const [extraInfo, setExtraInfo] = useState('');
  const [infoSent, setInfoSent] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const app = applications.find(a => a.id === selectedApplication?.id) || selectedApplication;

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Ariza topilmadi</p>
      </div>
    );
  }

  const kind = getKind(app.arizaNumber);
  const isHV = kind === 'HV';

  // ── HV-specific rendering ─────────────────────────────────────────────────
  if (isHV) {
    return <HVStatusTracker app={app} navigate={navigate} goBack={goBack} updateApplication={updateApplication} />;
  }

  // ── Standard RAD/KNS/TKS rendering ────────────────────────────────────────
  const derivedTopStatus = useMemo(() => {
    if (app.status === 'booked') return getStatusLabel('booked');
    if (app.status === 'failed') return getStatusLabel('failed');
    if (app.payment?.status !== 'paid') return getStatusLabel('new');
    if (app.status === 'done') return getStatusLabel('done');
    return { label: 'Jarayonda', color: 'text-indigo-700', bg: 'bg-indigo-50' };
  }, [app.payment?.status, app.status]);
  const urgency = getUrgencyLabel(app.urgency);

  const conclusions = app.conclusions || [];
  const hasRadiolog = conclusions.some(c => c.conclusionType === 'radiolog');
  const hasSpecialist = conclusions.some(c => c.conclusionType === 'specialist');
  const hasAI = conclusions.some(c => c.conclusionType === 'ai_analysis');

  const requiresSpecialist = app.serviceType === 'radiolog_specialist';
  const requiresAI = app.serviceType === 'ai_radiolog';

  const requiredDone = useMemo(() => {
    const okAI = !requiresAI || hasAI;
    const okSpecialist = !requiresSpecialist || hasSpecialist;
    return okAI && hasRadiolog && okSpecialist;
  }, [hasAI, hasRadiolog, hasSpecialist, requiresAI, requiresSpecialist]);

  const steps = useMemo(() => {
    if (kind === 'KNS') return KNS_STEPS;
    if (kind === 'TKS') return TKS_STEPS;
    return BASE_STEPS.filter(s => (s.conditional === 'specialist' ? requiresSpecialist : true));
  }, [kind, requiresSpecialist]);

  const stepState = useMemo((): Record<StepId, StepState> => {
    const st: Record<StepId, StepState> = {
      step1: 'completed', step2: 'pending', step3: 'pending',
      step4: 'pending', step5: 'pending', step6: 'pending',
    };
    if (app.payment?.status === 'paid') st.step2 = 'completed';
    else if (app.payment?.status === 'cancelled' || app.status === 'failed') st.step2 = 'error';
    else st.step2 = 'current';
    if (st.step2 !== 'completed') return st;

    if (kind === 'KNS' || kind === 'TKS') { st.step3 = 'completed'; st.step5 = 'current'; return st; }

    if (['accepted', 'with_specialist', 'conclusion_writing', 'done'].includes(app.status)) st.step3 = 'completed';
    else st.step3 = 'current';

    if (requiresSpecialist) {
      if (hasSpecialist) st.step4 = 'completed';
      else if (app.status === 'with_specialist') st.step4 = 'current';
      else st.step4 = 'pending';
    }

    const writingNow = app.status === 'conclusion_writing' || (requiresSpecialist && app.status === 'with_specialist');
    if (requiredDone) st.step5 = 'completed';
    else if (writingNow) st.step5 = 'current';
    else st.step5 = 'pending';

    if (requiredDone && app.status === 'done') st.step6 = 'completed';
    else if (requiredDone && app.status !== 'done') st.step6 = 'current';
    else st.step6 = 'pending';
    return st;
  }, [app.payment?.status, app.status, hasSpecialist, kind, requiredDone, requiresSpecialist]);

  const getDeadlineText = () => {
    if (!app.deadlineAt) return null;
    const deadline = new Date(app.deadlineAt);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return "Muddat o'tdi";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}s ${mins}d qoldi`;
  };

  const handleRate = (r: number) => {
    if (!app || rated) return;
    setRating(r); setRated(true); updateApplication(app.id, { rating: r });
  };
  const handleSendInfo = () => {
    if (!extraInfo.trim()) return;
    setInfoSent(true); updateApplicationStatus(app.id, 'accepted');
  };
  const handleDownload = async () => {
    if (!app.conclusions?.length) return;
    setDownloading(true);
    try { downloadConclusionReport(app); } finally { setTimeout(() => setDownloading(false), 1000); }
  };
  const handlePrint = () => { if (app.conclusions?.length) printConclusionReport(app); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg">Ariza holati</h1>
            <p className="text-blue-200 text-sm">{app.arizaNumber}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full ${derivedTopStatus.bg} ${derivedTopStatus.color}`}>
            {derivedTopStatus.label}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Tasvir', value: app.scanType },
            { label: 'Organ', value: app.organ },
            { label: 'Narx', value: formatPrice(app.price) },
          ].map(item => (
            <div key={item.label} className="bg-white/10 rounded-xl p-2.5">
              <p className="text-white/60 text-xs mb-0.5">{item.label}</p>
              <p className="text-white text-xs">{item.value}</p>
            </div>
          ))}
        </div>
        {/* KNS/TKS: Sana va Shifokor qo'shimcha info */}
        {(kind === 'KNS' || kind === 'TKS') && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-white/50 flex-shrink-0" />
              <div>
                <p className="text-white/60 text-xs">Sana va vaqt</p>
                <p className="text-white text-xs">{app.scanDate || '—'} {app.notes?.split('•').pop()?.trim() || ''}</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <User2 className="w-4 h-4 text-white/50 flex-shrink-0" />
              <div>
                <p className="text-white/60 text-xs">Shifokor</p>
                <p className="text-white text-xs">{app.doctor?.fullName ? `Dr. ${app.doctor.fullName}` : '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-24">
        {app.status === 'extra_info_needed' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-orange-700 text-sm mb-1">Qo'shimcha ma'lumot kerak</p>
                <p className="text-orange-600 text-sm">{app.notes || "Tasvir sifati past. Iltimos, yangi, aniqroq tasvirlar yuboring."}</p>
              </div>
            </div>
            {!infoSent ? (
              <>
                <textarea value={extraInfo} onChange={e => setExtraInfo(e.target.value)} placeholder="Javobingizni yozing..." rows={3} className="w-full border border-orange-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 mb-2" />
                <div className="flex gap-2">
                  <button onClick={handleSendInfo} disabled={!extraInfo.trim()} className="flex-1 bg-orange-500 text-white rounded-xl py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />Javob yuborish
                  </button>
                  <button onClick={() => navigate('patient_upload')} className="flex-1 border border-orange-200 text-orange-600 rounded-xl py-2.5 text-sm flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />Fayl yuklash
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-green-700 text-sm">Javob yuborildi. Operator ko'rib chiqadi.</p>
              </div>
            )}
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-4">Ariza jarayoni</p>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
            <div className="space-y-5">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const state = stepState[step.id];
                const isCompleted = state === 'completed';
                const isCurrent = state === 'current';
                const isError = state === 'error';
                return (
                  <motion.div key={step.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${isError ? 'bg-red-100' : isCompleted ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-4 h-4 ${isError ? 'text-red-600' : isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm ${isError ? 'text-red-600' : isCompleted ? 'text-gray-800' : isCurrent ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</p>
                      {isCurrent && <p className="text-blue-500 text-xs flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />Hozirgi holat — {step.desc}</p>}
                      {isError && <p className="text-red-500 text-xs mt-0.5">Xato — to'lov bekor qilingan</p>}
                      {isCompleted && <p className="text-green-500 text-xs mt-0.5">✓ Yakunlandi</p>}
                      {!isCompleted && !isCurrent && !isError && <p className="text-gray-400 text-xs mt-0.5">{step.desc}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {app.payment?.status === 'paid' && (
          <PaymentInfoCard payment={app.payment} arizaNumber={app.arizaNumber} patientName={app.patient?.fullName} />
        )}

        {app.deadlineAt && app.status !== 'done' && (
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" /><p className="text-gray-700 text-sm">Taxminiy muddat</p></div>
            <div className="text-right">
              <p className="text-gray-800 text-sm">{urgency.icon} {getDeadlineText()}</p>
              <p className="text-gray-400 text-xs">{formatDateTime(app.deadlineAt)}</p>
            </div>
          </div>
        )}

        {app.radiolog && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-700 text-sm mb-3">Tayinlangan radiolog</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-sm">{app.radiolog.avatar}</div>
              <div>
                <p className="text-gray-800 text-sm">{app.radiolog.fullName}</p>
                <p className="text-gray-500 text-xs">{app.radiolog.license}</p>
                <p className="text-gray-400 text-xs">{app.radiolog.specialty}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-yellow-500 text-sm">⭐ {app.radiolog.rating}</p>
                <p className="text-gray-400 text-xs">{app.radiolog.totalConclusions} xulosa</p>
              </div>
            </div>
          </div>
        )}

        {app.status === 'done' && (app.conclusions?.length || 0) > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-700 text-sm">Xulosa tayyor! ({app.conclusions?.length} ta)</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => navigate('patient_conclusion')} className="w-full bg-green-600 text-white rounded-xl py-3 flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" /><span className="text-sm">Xulosalarni ko'rish</span>
              </button>
              <div className="flex gap-2">
                <button onClick={handleDownload} disabled={downloading} className="flex-1 bg-white border border-green-200 text-green-700 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm">
                  {downloading ? <div className="w-3.5 h-3.5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Yuklab olish</span>
                </button>
                <button onClick={handlePrint} className="flex-1 bg-white border border-green-200 text-green-700 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm">
                  <Printer className="w-3.5 h-3.5" /><span>Chop etish</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {app.status === 'done' && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-700 text-sm mb-3">Xizmatni baholang</p>
            {!rated ? (
              <div className="flex justify-center gap-3">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => handleRate(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className="transition-transform hover:scale-125">
                    <Star className={`w-8 h-8 ${s <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-6 h-6 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
                </div>
                <p className="text-gray-500 text-sm">Bahoingiz uchun rahmat!</p>
              </div>
            )}
          </div>
        )}

        {/* KNS/TKS: Kengaytiladigan tafsilotlar */}
        {(kind === 'KNS' || kind === 'TKS') && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowDetails(d => !d)}
              className="w-full px-4 py-3 flex items-center justify-between"
            >
              <span className="text-gray-700 text-sm font-medium">Batafsil ma'lumot</span>
              {showDetails
                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showDetails && (
              <div className="px-4 pb-4 space-y-2.5 border-t border-gray-50 pt-3">
                {app.scanFacility && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Qayerga</p>
                      <p className="text-gray-800 text-sm">{app.scanFacility}</p>
                    </div>
                  </div>
                )}
                {app.doctor?.phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Telefon</p>
                      <p className="text-gray-800 text-sm">{app.doctor.phone}</p>
                    </div>
                  </div>
                )}
                {app.notes && (
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-500 text-xs">Izoh</p>
                      <p className="text-gray-800 text-sm">{app.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* KNS/TKS: To'lovga o'tish tugmasi (booked holat) */}
        {(kind === 'KNS' || kind === 'TKS') && app.status === 'booked' && (
          <button
            onClick={() => navigate('patient_payment')}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">To'lovga o'tish</span>
          </button>
        )}

        {/* KNS/TKS: Bekor qilish tugmasi (booked yoki new holat) */}
        {(kind === 'KNS' || kind === 'TKS') && ['booked', 'new'].includes(app.status) && (
          <button
            onClick={() => setCancelModal(true)}
            className="w-full bg-white border border-red-200 text-red-600 rounded-2xl py-3 flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Bekor qilish</span>
          </button>
        )}

        <button onClick={() => navigate('patient_home')} className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5 flex items-center justify-center gap-2">
          <RefreshCcw className="w-4 h-4" /><span className="text-sm">Asosiy sahifaga qaytish</span>
        </button>
      </div>

      {/* Bekor qilish modali */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setCancelModal(false)}>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-8"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-gray-900 text-base font-semibold mb-1">Arizani bekor qilish</h3>
            <p className="text-gray-500 text-sm mb-4">Bekor qilish sababini kiriting</p>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Sabab..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 text-sm font-medium"
              >
                Ortga
              </button>
              <button
                onClick={() => {
                  updateApplicationStatus(app.id, 'failed');
                  setCancelModal(false);
                  navigate('patient_home');
                }}
                disabled={!cancelReason.trim()}
                className="flex-1 bg-red-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40"
              >
                Bekor qilish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── HV specific full tracker ────────────────────────────────────────────────
function HVStatusTracker({ app, navigate, goBack, updateApplication }: {
  app: any;
  navigate: (s: any) => void;
  goBack: () => void;
  updateApplication: (id: number, updates: any) => void;
}) {
  const [rating, setRating] = useState(app.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [rated, setRated] = useState(!!app.rating);

  const badge = HV_STATUS_BADGE[app.status] || HV_STATUS_BADGE['new'];
  const stepState = calcHvStepState(app.status, app.payment);

  const handleRate = (r: number) => {
    if (rated) return;
    setRating(r); setRated(true); updateApplication(app.id, { rating: r });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header — orange gradient for HV */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-base font-semibold">Ariza holati</h1>
            <p className="text-orange-100 text-sm">{app.arizaNumber}</p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${badge.bg} ${badge.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${app.status !== 'done' ? 'animate-pulse' : ''}`} />
            {badge.label}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Xizmat turi', value: 'Uyga chaqirish' },
            { label: 'Mutaxassis', value: app.organ || '—' },
            { label: 'Narx', value: formatPrice(app.price) },
          ].map(item => (
            <div key={item.label} className="bg-white/15 rounded-xl p-2.5">
              <p className="text-orange-100/70 text-xs mb-0.5">{item.label}</p>
              <p className="text-white text-xs font-medium leading-tight">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-24">
        {/* HV Info Card */}
        <HvInfoCard app={app} />

        {/* HV Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm font-semibold mb-4">Ariza jarayoni</p>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
            <div className="space-y-1">
              {HV_STEPS.map((step, i) => {
                const Icon = step.icon;
                const state = stepState[step.id];
                const isCompleted = state === 'completed';
                const isCurrent = state === 'current';

                const iconBg = isCompleted ? 'bg-green-100' : isCurrent ? 'bg-orange-100' : 'bg-gray-100';
                const iconColor = isCompleted ? 'text-green-600' : isCurrent ? 'text-orange-600' : 'text-gray-300';
                const textColor = isCompleted ? 'text-gray-800 font-medium' : isCurrent ? 'text-orange-700 font-semibold' : 'text-gray-400';

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-4 relative py-2"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-all ${iconBg}`}>
                      {isCompleted
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <Icon className={`w-4 h-4 ${iconColor}`} />
                      }
                    </div>
                    <div className="pt-1 flex-1">
                      <p className={`text-sm ${textColor}`}>{step.label}</p>
                      {isCurrent && (
                        <p className="text-orange-500 text-xs flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse flex-shrink-0" />
                          Hozirgi holat — {step.desc}
                        </p>
                      )}
                      {isCompleted && (
                        <p className="text-green-500 text-xs mt-0.5 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Yakunlandi
                        </p>
                      )}
                      {!isCompleted && !isCurrent && (
                        <p className="text-gray-400 text-xs mt-0.5">{step.desc}</p>
                      )}

                      {/* Accepted step — shifokor ma'lumotlari */}
                      {step.hvKey === 'accepted' && isCompleted && (
                        <div className="mt-2 p-2.5 bg-gray-50 rounded-xl space-y-1 text-xs text-gray-600">
                          <p><span className="font-medium">Shifokor:</span> {app.hvDoctorName || 'Dr. Ahmadov Sherzod'}</p>
                          <p><span className="font-medium">Mutaxassis:</span> {app.hvDoctorSpeciality || app.organ}</p>
                          <p><span className="font-medium">Klinika:</span> {app.hvClinicName || 'MedLine Klinikasi'}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment info */}
        {app.payment?.status === 'paid' && (
          <PaymentInfoCard payment={app.payment} arizaNumber={app.arizaNumber} patientName={app.patient?.fullName} />
        )}

        {/* Done — rating */}
        {app.status === 'done' && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-700 text-sm mb-3 font-medium">Xizmatni baholang</p>
            {!rated ? (
              <div className="flex justify-center gap-3">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => handleRate(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className="transition-transform hover:scale-125">
                    <Star className={`w-9 h-9 ${s <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-6 h-6 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
                </div>
                <p className="text-gray-500 text-sm">Bahoingiz uchun rahmat!</p>
              </div>
            )}
          </div>
        )}

        <button onClick={() => navigate('patient_home')} className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5 flex items-center justify-center gap-2">
          <RefreshCcw className="w-4 h-4" /><span className="text-sm">Asosiy sahifaga qaytish</span>
        </button>
      </div>
    </div>
  );
}
