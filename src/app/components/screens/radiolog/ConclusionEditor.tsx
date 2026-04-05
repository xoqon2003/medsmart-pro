import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight, FileText, Eye, CheckCircle, ChevronDown,
  Zap, Send, Brain, AlertCircle, Upload, Check, Sparkles, Download, Printer
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { CONCLUSION_TEMPLATES, formatDateTime } from '../../../utils/formatters';
import { downloadConclusionReport, printConclusionReport } from '../../../utils/pdfGenerator';
import type { Conclusion } from '../../../types';

const TEMPLATES = [
  { label: 'Bosh MRT', key: 'MRT-Bosh' },
  { label: "Ko'krak MSKT", key: 'MSKT-Kokrak' },
  { label: 'Umurtqa rentgen', key: 'Rentgen-Umurtqa' },
  { label: "Bo'sh shablon", key: 'empty' },
];

const QUICK_PHRASES = [
  "Me'yorida",
  "Patologik o'zgarish aniqlanmadi",
  "Klinik ko'rsatmalar bilan taqqoslab baholash",
  "MRT tekshiruvi tavsiya etiladi",
  "Nevrolog ko'rigi tavsiya etiladi",
  "Davolash muolajasini davom ettirish",
];

const AI_SIMULATED_RESULTS = {
  anomalies: ["Chap yarim sharda gipodens zona T2/FLAIR", "Periventricular signal o'zgarishlari", 'Sulci kengayishi'],
  regions: ['Chap frontal lob', 'Periventrikulyar zona'],
  confidence: 87,
  notes: "AI modeli UNET-3D v3.1 asosida. Yakuniy xulosa radiolog tomonidan berilishi shart.",
  description: "Bosh miya MRT tekshiruvi T1, T2, FLAIR, DWI rejimlarida AI tomonidan avtomatik tahlil qilindi.",
  findings: "Chap yarim sharda gipodens zona T2/FLAIR da aniqlandi (12x8mm). Periventricular signal o'zgarishlari (3 ta o'choq). Sulci kengayishi mavjud. O'ng yarim sharda anormal zona kuzatilmadi.",
  impression: "AI tahlili: Demielinizatsiya yoki ishemik o'zgarishlar ehtimoli yuqori (ishonch: 87%). Radiolog ko'rigi va tasdiqlanishi majburiy.",
};

export function ConclusionEditor() {
  const { currentUser, selectedApplication, applications, navigate, goBack, updateApplication, addConclusionToApp, addNotification } = useApp();
  const app = applications.find(a => a.id === selectedApplication?.id) || selectedApplication;

  // Stage: 'ai_step' | 'radiolog_step' | 'preview' | 'done'
  const isAIService = app?.serviceType === 'ai_radiolog';
  const existingAI = app?.conclusions?.find(c => c.conclusionType === 'ai_analysis');

  const [stage, setStage] = useState<'ai_step' | 'radiolog_step' | 'preview' | 'done'>(
    isAIService && !existingAI ? 'ai_step' : 'radiolog_step'
  );
  const [aiRunning, setAiRunning] = useState(false);
  const [aiDone, setAiDone] = useState(!!existingAI);
  const [aiResult, setAiResult] = useState(existingAI || null);
  const [aiConfirmed, setAiConfirmed] = useState(!!existingAI);

  const [form, setForm] = useState({
    description: '',
    findings: '',
    impression: '',
    recommendations: '',
  });
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeField, setActiveField] = useState<keyof typeof form | null>(null);
  const [submittedApp, setSubmittedApp] = useState<typeof app | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const loadTemplate = (key: string) => {
    const tmpl = CONCLUSION_TEMPLATES[key];
    if (tmpl) {
      setForm({ description: tmpl.description, findings: tmpl.findings, impression: tmpl.impression, recommendations: '' });
    }
    setShowTemplates(false);
  };

  const insertPhrase = (phrase: string) => {
    if (!activeField) return;
    setForm(prev => ({
      ...prev,
      [activeField]: prev[activeField] ? prev[activeField] + '. ' + phrase : phrase,
    }));
  };

  const isValidText = form.description.length >= 20 && form.findings.length >= 20 && form.impression.length >= 20;
  const isValidUpload = !!uploadedFile;
  const isValid = uploadMode ? isValidUpload : isValidText;

  const handlePickFile = (file: File | null) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) return;
    setUploadedFile(file);
  };

  // ---- AI Step handlers ----
  const handleRunAI = async () => {
    setAiRunning(true);
    await new Promise(r => setTimeout(r, 3000));
    const aiConclusion: Conclusion = {
      id: Date.now(),
      applicationId: app!.id,
      authorId: 0,
      authorName: 'AI RadiBot v3.1',
      conclusionType: 'ai_analysis',
      description: AI_SIMULATED_RESULTS.description,
      findings: AI_SIMULATED_RESULTS.findings,
      impression: AI_SIMULATED_RESULTS.impression,
      aiAnalysis: {
        anomalies: AI_SIMULATED_RESULTS.anomalies,
        regions: AI_SIMULATED_RESULTS.regions,
        confidence: AI_SIMULATED_RESULTS.confidence,
        notes: AI_SIMULATED_RESULTS.notes,
      },
      signedAt: new Date().toISOString(),
    };
    setAiResult(aiConclusion);
    setAiRunning(false);
    setAiDone(true);
  };

  const handleConfirmAI = () => {
    if (!aiResult || !app) return;
    addConclusionToApp(app.id, aiResult);
    setAiConfirmed(true);
    addNotification({
      userId: app.patientId,
      title: 'AI tahlil tugadi 🤖',
      message: `${app.arizaNumber}: AI radiologik tahlil yakunlandi. Radiolog xulosasi tayyorlanmoqda.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: app.id,
    });
    setTimeout(() => setStage('radiolog_step'), 600);
  };

  // ---- Radiolog conclusion submit ----
  const handleSubmit = async () => {
    if (!isValid || !app) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));

    const now = new Date().toISOString();
    const attachment = uploadedFile
      ? {
          name: uploadedFile.name,
          mimeType: uploadedFile.type,
          url: URL.createObjectURL(uploadedFile),
        }
      : undefined;

    const radiologConclusion: Conclusion = {
      id: Date.now(),
      applicationId: app.id,
      authorId: currentUser?.id || 0,
      authorName: currentUser?.fullName,
      conclusionType: 'radiolog',
      description: uploadMode ? `Yuklangan xulosa fayli: ${uploadedFile?.name || ''}` : form.description,
      findings: uploadMode ? 'Tayyor xulosa fayl ko‘rinishida taqdim etildi.' : form.findings,
      impression: uploadMode ? 'Tayyor xulosa yuklandi va tasdiqlandi.' : form.impression,
      recommendations: form.recommendations || undefined,
      source: uploadMode ? 'upload' : 'editor',
      attachment,
      signedAt: now,
      pdfUrl: `/conclusions/${app.arizaNumber}-radiolog.pdf`,
    };

    addConclusionToApp(app.id, radiologConclusion);

    const hasSpecialist = (app.conclusions || []).some(c => c.conclusionType === 'specialist');
    const needsSpecialist = app.serviceType === 'radiolog_specialist';
    const nextStatus = needsSpecialist && !hasSpecialist ? 'with_specialist' : 'done';

    updateApplication(app.id, {
      status: nextStatus,
      ...(nextStatus === 'done' ? { completedAt: now } : {}),
      radiologId: currentUser?.id,
      radiolog: currentUser || undefined,
    });

    addNotification({
      userId: app.patientId,
      title: nextStatus === 'done' ? 'Xulosa tayyor! ✅' : 'Radiolog xulosasi tayyor ✅',
      message: nextStatus === 'done'
        ? `${app.arizaNumber} arizangiz uchun radiologik xulosa tayyorlandi. Ko'rish uchun bosing.`
        : `${app.arizaNumber}: radiolog xulosasi tayyor. Mutaxassis xulosasi kutilmoqda.`,
      type: nextStatus === 'done' ? 'success' : 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: app.id,
    });

    if (app.doctorId) {
      addNotification({
        userId: app.doctorId,
        title: 'Radiolog xulosasi tayyor',
        message: `${app.arizaNumber}: Dr. ${currentUser?.fullName} radiologik xulosani yubordi.`,
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString(),
        applicationId: app.id,
      });
    }

    // Store app reference for download on done screen
    const updatedApp = {
      ...app,
      conclusions: [...(app.conclusions || []), radiologConclusion],
      status: nextStatus as any,
    };
    setSubmittedApp(updatedApp);
    setSubmitting(false);
    setStage('done');
    setTimeout(() => navigate('radiolog_dashboard'), 4000);
  };

  if (stage === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <div className="text-center">
          <h2 className="text-gray-900 text-xl mb-2">Xulosa yuborildi! ✅</h2>
          <p className="text-gray-500 text-sm">Bemor Telegram orqali xabardor qilindi</p>
          <p className="text-gray-400 text-sm mt-1">{app?.arizaNumber}</p>
        </div>

        {/* Download and print options */}
        {submittedApp && (
          <div className="w-full space-y-2 mt-2">
            <button
              onClick={() => downloadConclusionReport(submittedApp)}
              className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Xulosani yuklab olish</span>
            </button>
            <button
              onClick={() => printConclusionReport(submittedApp)}
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span className="text-sm">Chop etish / PDF saqlash</span>
            </button>
          </div>
        )}

        <p className="text-gray-400 text-xs text-center mt-2">
          4 soniyadan so'ng asosiy sahifaga qaytiladi...
        </p>
      </div>
    );
  }

  // ---- Preview mode ----
  if (preview) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-800 pt-12 pb-6 px-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setPreview(false)} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white rotate-180" />
            </button>
            <h1 className="text-white text-lg">PDF Ko'rinishi</h1>
          </div>
        </div>
        <div className="flex-1 px-4 py-5">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-gray-900 text-base">RADIOLOGIK XULOSA</h2>
                  <p className="text-gray-500 text-xs">Masofaviy Radiologik Konsultatsiya</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-600 text-sm">{app?.arizaNumber}</p>
                  <p className="text-gray-400 text-xs">{formatDateTime(new Date().toISOString())}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-gray-500 text-xs mb-1">Bemor</p>
              <p className="text-gray-800 text-sm">{app?.patient?.fullName}</p>
              <p className="text-gray-500 text-xs">{app?.scanType} • {app?.organ}</p>
            </div>
            {aiResult && (
              <div className="bg-violet-50 rounded-xl p-3 mb-4 border border-violet-100">
                <p className="text-violet-600 text-xs mb-2 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> AI TAHLILI (87% ishonch)
                </p>
                <p className="text-gray-600 text-xs">{aiResult.impression}</p>
              </div>
            )}
            {[
              { title: '1. TASVIR TAVSIFI', content: form.description },
              { title: '2. TOPILMALAR', content: form.findings },
              { title: '3. XULOSA', content: form.impression },
              ...(form.recommendations ? [{ title: '4. TAVSIYALAR', content: form.recommendations }] : []),
            ].map(s => (
              <div key={s.title} className="mb-4">
                <p className="text-gray-700 text-xs mb-1">{s.title}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-gray-500 text-xs mb-1">Xulosa bergan</p>
              <p className="text-gray-800 text-sm">{currentUser?.fullName}</p>
              <p className="text-gray-500 text-xs">{currentUser?.license}</p>
              <p className="text-gray-400 text-xs mt-1">⚠️ Bu xulosa klinik ko'rik o'rnini bosa olmaydi</p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-emerald-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Yuborilmoqda...</span></>
            ) : (
              <><Send className="w-4 h-4" /><span>Tasdiqlash va Yuborish</span></>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ---- AI STEP ----
  if (stage === 'ai_step') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-violet-900 to-purple-800 pt-12 pb-8 px-5">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white rotate-180" />
            </button>
            <div className="flex-1">
              <h1 className="text-white text-lg">1-bosqich: AI Tahlil</h1>
              <p className="text-purple-200 text-xs">{app?.arizaNumber} • {app?.patient?.fullName}</p>
            </div>
          </div>
          {/* Steps indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-violet-700 text-xs">1</span>
              </div>
              <span className="text-white text-xs">AI Tahlil</span>
            </div>
            <div className="flex-1 h-px bg-white/30" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white/70 text-xs">2</span>
              </div>
              <span className="text-white/60 text-xs">Radiolog xulosasi</span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
          {/* Info card */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-gray-800 text-sm">AI Radiologiya Tahlili</p>
                <p className="text-gray-500 text-xs">UNET-3D v3.1 modeli</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              AI dasturi tasvir fayllarini avtomatik tahlil qiladi va dastlabki topilmalarni aniqlaydi.
              Siz bu natijani ko'rib chiqib, tasdiqlaysiz va keyin o'z xulosangizni yozasiz.
            </p>
          </div>

          {/* AI Run / Result */}
          {!aiDone ? (
            <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
              {aiRunning ? (
                <div className="py-6">
                  <div className="w-16 h-16 bg-violet-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    >
                      <Brain className="w-8 h-8 text-violet-600" />
                    </motion.div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">AI tahlil qilmoqda...</p>
                  <p className="text-gray-400 text-xs">Tasvir fayllar skanlanmoqda</p>
                  <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-violet-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '90%' }}
                      transition={{ duration: 2.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="w-16 h-16 bg-violet-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-gray-700 text-sm mb-1">AI tahlilini boshlash</p>
                  <p className="text-gray-400 text-xs mb-4">Tasvirlar yuklanganligini tekshiring</p>
                  <button
                    onClick={handleRunAI}
                    className="w-full bg-violet-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span className="text-sm">AI Tahlilini Boshlash</span>
                  </button>
                  <p className="text-gray-400 text-xs mt-3">yoki</p>
                  <button
                    onClick={() => setStage('radiolog_step')}
                    className="text-gray-500 text-xs mt-2 underline"
                  >
                    AI tahlilsiz davom etish
                  </button>
                </div>
              )}
            </div>
          ) : aiResult ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* AI Result card */}
                <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-violet-700 text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4" /> AI Tahlil Natijasi
                    </p>
                    <span className="text-violet-600 text-xs bg-violet-100 px-2 py-0.5 rounded-full">
                      {aiResult.aiAnalysis?.confidence}% ishonch
                    </span>
                  </div>
                  <div className="h-2 bg-violet-100 rounded-full mb-3">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${aiResult.aiAnalysis?.confidence}%` }} />
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-gray-600 text-xs">Aniqlangan anomaliyalar:</p>
                    {aiResult.aiAnalysis?.anomalies.map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-xs">{a}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl p-3 mb-2">
                    <p className="text-gray-500 text-xs mb-1">AI Xulosa:</p>
                    <p className="text-gray-700 text-xs">{aiResult.impression}</p>
                  </div>

                  <p className="text-violet-500 text-xs italic">⚠️ Bu faqat yordamchi ma'lumot. Yakuniy xulosa siz tomonidan beriladi.</p>
                </div>

                {/* Confirm AI button */}
                {!aiConfirmed ? (
                  <button
                    onClick={handleConfirmAI}
                    className="w-full bg-violet-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>AI xulosasini Tasdiqlash va Saqlash</span>
                  </button>
                ) : (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-green-700 text-sm">AI xulosasi saqlandi ✅</p>
                      <p className="text-green-600 text-xs">Endi o'z xulosangizni yozing</p>
                    </div>
                  </motion.div>
                )}

                {aiConfirmed && (
                  <button
                    onClick={() => setStage('radiolog_step')}
                    className="w-full bg-emerald-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>2-bosqich: O'z Xulosangizni Yozing</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setStage('radiolog_step')}
                  className="w-full text-gray-500 text-sm py-2"
                >
                  Tasdiqlashsiz davom etish →
                </button>
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </div>
    );
  }

  // ---- RADIOLOG STEP ----
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={isAIService ? () => setStage('ai_step') : goBack}
            className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg">
              {isAIService ? '2-bosqich: Radiolog Xulosasi' : 'Xulosa yozish'}
            </h1>
            <p className="text-emerald-200 text-xs">{app?.arizaNumber} • {app?.patient?.fullName}</p>
          </div>
        </div>
        {isAIService && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-white/70 text-xs">AI Tahlil</span>
            </div>
            <div className="flex-1 h-px bg-white/30" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-emerald-700 text-xs">2</span>
              </div>
              <span className="text-white text-xs">Radiolog xulosasi</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
        {/* Examination info */}
        {(app?.examinations?.length || 0) > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-3">Tekshiruv ma’lumotlari (bemor kiritgan)</p>
            <div className="space-y-2">
              {app!.examinations!.map((ex) => (
                <div key={ex.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-gray-900 text-sm font-medium">
                        {ex.category === 'instrumental' ? '🔬 Instrumental' : '🧪 Laboratoriya'}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {ex.category === 'instrumental'
                          ? (ex.instrumentalType || '—')
                          : (ex.labTypes?.join(', ') || '—')}
                        {ex.organ ? ` • ${ex.organ}` : ''}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Sana:{' '}
                        {ex.dateStatus === 'known'
                          ? (ex.dateYmd || '—')
                          : ex.dateStatus === 'unknown'
                            ? (ex.approxYear || "Esimda yo'q")
                            : 'Aniqlanadi'}
                      </p>
                      {ex.facility && (
                        <p className="text-gray-500 text-xs mt-1">Muassasa: {ex.facility}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>Fayl: {ex.attachments?.length || 0} ta</p>
                      <p>DICOM: {ex.attachments?.filter((a) => a.isDicom).length || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI summary if confirmed */}
        {(aiConfirmed || existingAI) && (
          <div className="bg-violet-50 rounded-2xl p-3 border border-violet-100 flex items-start gap-2">
            <Brain className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-violet-600 text-xs mb-0.5">AI tahlil saqlandi</p>
              <p className="text-gray-600 text-xs line-clamp-2">
                {aiResult?.impression || existingAI?.impression}
              </p>
            </div>
          </div>
        )}

        {/* Template selector */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-gray-700 text-sm">
              <input
                type="checkbox"
                checked={uploadMode}
                onChange={(e) => { setUploadMode(e.target.checked); setUploadedFile(null); }}
                className="accent-emerald-600"
              />
              Tayyor xulosani yuklayman
            </label>
            <span className="text-gray-400 text-xs">
              PDF/JPG/PNG/DOCX
            </span>
          </div>

          {uploadMode ? (
            <div className="mt-2">
              <label className="w-full border border-dashed border-gray-200 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-500 text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{uploadedFile ? uploadedFile.name : 'Xulosa faylini tanlash'}</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => handlePickFile(e.target.files?.[0] || null)}
                />
              </label>
              {!uploadedFile && (
                <p className="text-gray-400 text-xs mt-2">
                  Galochka yoqilganda matn muharriri yashiriladi va yuklash rejimi ishlaydi.
                </p>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <p className="text-gray-700 text-sm">Shablon tanlash</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
              </button>

              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 grid grid-cols-2 gap-2"
                >
                  {TEMPLATES.map(t => (
                    <button
                      key={t.key}
                      onClick={() => loadTemplate(t.key)}
                      className="p-2.5 bg-gray-50 rounded-xl text-left border border-gray-100 hover:border-blue-200"
                    >
                      <p className="text-gray-700 text-xs">{t.label}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Editor fields */}
        {!uploadMode && [
          { key: 'description' as const, label: '1. Tasvir tavsifi *', placeholder: 'Qaysi tasvir, qanday rejimda olindi...', required: true },
          { key: 'findings' as const, label: '2. Topilmalar / Patologiyalar *', placeholder: "Aniqlangan o'zgarishlar, strukturalar...", required: true },
          { key: 'impression' as const, label: '3. Xulosa (Impression) *', placeholder: 'Asosiy xulosa...', required: true },
          { key: 'recommendations' as const, label: '4. Tavsiyalar', placeholder: "Qo'shimcha ko'riklar, muolajalar...", required: false },
        ].map(field => (
          <div key={field.key} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-700 text-sm">{field.label}</label>
              <span className="text-gray-400 text-xs">{form[field.key].length} belgi</span>
            </div>
            <textarea
              value={form[field.key]}
              onFocus={() => setActiveField(field.key)}
              onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              rows={3}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none ${
                field.required && form[field.key].length > 0 && form[field.key].length < 20
                  ? 'border-red-200'
                  : 'border-gray-200'
              }`}
            />
            {field.required && form[field.key].length > 0 && form[field.key].length < 20 && (
              <p className="text-red-500 text-xs mt-1">Kamida 20 ta belgi</p>
            )}
          </div>
        ))}

        {/* Quick phrases */}
        {!uploadMode && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Tez iboralar (faol maydon: {activeField || 'tanlang'})
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PHRASES.map(phrase => (
              <button
                key={phrase}
                onClick={() => insertPhrase(phrase)}
                disabled={!activeField}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-700 disabled:opacity-40 hover:border-emerald-300 hover:bg-emerald-50"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Upload AI conclusion from external system */}
        {isAIService && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-gray-400" />
              <p className="text-gray-600 text-sm">Tashqi AI tizimidan xulosa yuklash</p>
            </div>
            <p className="text-gray-400 text-xs mb-3">
              Agar siz boshqa AI radiologiya dasturidan (Aidoc, Nuance, Qure.ai) xulosa faylini olgan bo'lsangiz
            </p>
            <button className="w-full border border-dashed border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-400 text-sm">
              <Upload className="w-4 h-4" />
              <span>AI xulosa PDF yuklash</span>
            </button>
          </div>
        )}

        {/* Validation */}
        {!isValid && (
          <div className="flex items-center gap-2 text-gray-400 bg-white rounded-xl p-3">
            <FileText className="w-4 h-4" />
            <p className="text-xs">
              {uploadMode
                ? 'Davom etish uchun xulosa faylini yuklang (PDF/JPG/PNG/DOCX)'
                : "Barcha majburiy maydonlar (*) kamida 20 ta belgi bo'lishi kerak"}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={() => setPreview(true)}
            disabled={!isValid}
            className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Ko'rish</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="flex-1 bg-emerald-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="text-sm">Yuborish</span>
          </button>
        </div>
      </div>
    </div>
  );
}