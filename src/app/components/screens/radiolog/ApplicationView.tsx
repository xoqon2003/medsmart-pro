import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight, User, FileText, Image, Brain, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, Clock, Stethoscope
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { getStatusLabel, getUrgencyLabel, formatDateTime, formatPrice, getConclusionTypeLabel } from '../../../data/mockData';
import type { Conclusion } from '../../../types';

export function ApplicationView() {
  const { currentUser, selectedApplication, applications, navigate, goBack, updateApplicationStatus, updateApplication, addNotification } = useApp();
  const app = applications.find(a => a.id === selectedApplication?.id) || selectedApplication;
  const [showAI, setShowAI] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [extraInfoNote, setExtraInfoNote] = useState('');
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [showConclusions, setShowConclusions] = useState(true);

  if (!app) return null;

  const status = getStatusLabel(app.status);
  const urgency = getUrgencyLabel(app.urgency);
  const conclusions = app.conclusions || [];
  const aiConclusion = conclusions.find(c => c.conclusionType === 'ai_analysis');
  const radiologConclusion = conclusions.find(c => c.conclusionType === 'radiolog');
  const specialistConclusions = conclusions.filter(c => c.conclusionType === 'specialist');
  const doctorConclusions = conclusions.filter(c => c.conclusionType === 'doctor');

  const handleAccept = async () => {
    setAccepting(true);
    await new Promise(r => setTimeout(r, 1000));
    updateApplicationStatus(app.id, 'accepted');
    updateApplication(app.id, {
      radiologId: currentUser?.id,
      radiolog: currentUser || undefined,
      acceptedAt: new Date().toISOString(),
    });
    addNotification({
      userId: app.patientId,
      title: 'Ariza qabul qilindi ✅',
      message: `${app.arizaNumber} raqamli arizangiz Dr. ${currentUser?.fullName} tomonidan qabul qilindi. Taxminiy muddat: ${app.urgency === 'emergency' ? '4-12 soat' : app.urgency === 'urgent' ? '24 soat' : '48-72 soat'}.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: app.id,
    });
    setAccepting(false);
  };

  const handleRequestInfo = () => {
    if (!extraInfoNote.trim()) return;
    updateApplicationStatus(app.id, 'extra_info_needed', extraInfoNote);
    addNotification({
      userId: app.patientId,
      title: "Qo'shimcha ma'lumot kerak",
      message: `${app.arizaNumber}: ${extraInfoNote}`,
      type: 'warning',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: app.id,
    });
    setShowExtraForm(false);
    navigate('radiolog_dashboard');
  };

  const handleWriteConclusion = () => {
    updateApplicationStatus(app.id, 'conclusion_writing');
    navigate('radiolog_conclude');
  };

  const canAccept = app.status === 'new' && app.payment?.status === 'paid';
  const canWriteConclusion = ['accepted', 'conclusion_writing', 'with_specialist'].includes(app.status || '');

  const getConclusionBorderColor = (type: string) => {
    const colors: Record<string, string> = {
      ai_analysis: 'border-violet-300',
      radiolog: 'border-emerald-300',
      specialist: 'border-purple-300',
      doctor: 'border-blue-300',
    };
    return colors[type] || 'border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg">{app.arizaNumber}</h1>
            <p className="text-emerald-200 text-xs">{formatDateTime(app.createdAt)}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>

        {app.urgency === 'emergency' && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-2.5 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <p className="text-red-200 text-sm">SHOSHILINCH — 4-12 soat ichida bajarilishi kerak</p>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
        {/* Examination info */}
        {(app.examinations?.length || 0) > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Tekshiruv ma’lumotlari
            </p>
            <div className="space-y-2">
              {app.examinations!.map((ex) => (
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

        {/* Patient info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-500 text-xs mb-3 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Bemor ma'lumotlari</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
              {app.patient?.avatar || 'B'}
            </div>
            <div>
              <p className="text-gray-900 text-sm">{app.patient?.fullName}</p>
              <p className="text-gray-500 text-xs">{app.patient?.gender === 'male' ? 'Erkak' : 'Ayol'} • {app.patient?.birthDate ? new Date().getFullYear() - new Date(app.patient.birthDate).getFullYear() : ''} yosh</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Telefon', value: app.patient?.phone || '' },
              { label: 'Shahar', value: app.patient?.city || '' },
              { label: 'Tasvir turi', value: app.scanType },
              { label: 'Organ', value: app.organ },
              { label: 'Xizmat', value: app.serviceType === 'ai_radiolog' ? 'AI + Radiolog' : app.serviceType === 'radiolog_only' ? 'Radiolog' : 'Radiolog + Mutaxassis' },
              { label: 'Muhimlik', value: `${urgency.icon} ${urgency.label.split('(')[0]}` },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-2.5">
                <p className="text-gray-400 text-xs">{item.label}</p>
                <p className="text-gray-800 text-xs mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          {app.patient?.chronicDiseases && (
            <div className="mt-2 bg-red-50 rounded-xl p-2.5">
              <p className="text-red-500 text-xs mb-0.5">Surunkali kasalliklar</p>
              <p className="text-gray-700 text-xs">{app.patient.chronicDiseases}</p>
            </div>
          )}
          {app.doctor && (
            <div className="mt-2 bg-sky-50 rounded-xl p-2.5 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-sky-500" />
              <div>
                <p className="text-sky-600 text-xs">Yo'llagan shifokor</p>
                <p className="text-gray-700 text-xs">{app.doctor.fullName} • {app.doctor.specialty}</p>
              </div>
            </div>
          )}
        </div>

        {/* Anamnez */}
        {app.anamnez && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-3 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Shikoyat va anamnez</p>
            <div className="space-y-2">
              <div>
                <p className="text-gray-500 text-xs">Asosiy shikoyat</p>
                <p className="text-gray-800 text-sm mt-0.5">{app.anamnez.complaint}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500 text-xs">Muddat</p>
                  <p className="text-gray-800 text-sm">{app.anamnez.duration}</p>
                </div>
                {app.anamnez.hasPain && (
                  <div>
                    <p className="text-gray-500 text-xs">Og'riq darajasi</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400 rounded-full"
                          style={{ width: `${(app.anamnez.painLevel || 5) * 10}%` }}
                        />
                      </div>
                      <span className="text-gray-700 text-xs">{app.anamnez.painLevel}/10</span>
                    </div>
                  </div>
                )}
              </div>
              {app.anamnez.medications && (
                <div>
                  <p className="text-gray-500 text-xs">Dorilar</p>
                  <p className="text-gray-700 text-sm">{app.anamnez.medications}</p>
                </div>
              )}
              {app.anamnez.allergies && (
                <div className="bg-yellow-50 rounded-lg p-2">
                  <p className="text-yellow-600 text-xs">⚠️ Allergiya: {app.anamnez.allergies}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Files */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-500 text-xs mb-3 flex items-center gap-1"><Image className="w-3.5 h-3.5" /> Tasvirlar</p>
          {app.files && app.files.length > 0 ? (
            <div className="space-y-2">
              {app.files.map(file => (
                <div key={file.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Image className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-xs">{file.originalName}</p>
                    <p className="text-gray-400 text-xs">{(file.sizeBytes / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button className="text-blue-600 text-xs border border-blue-200 rounded-lg px-2 py-1">Ko'rish</button>
                </div>
              ))}
              <div className="bg-gray-900 rounded-2xl h-40 flex flex-col items-center justify-center gap-2">
                <div className="grid grid-cols-3 gap-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className={`w-6 h-6 rounded ${i === 4 ? 'bg-blue-400' : 'bg-gray-700'}`} />
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-1">DICOM Viewer (Cornerstone.js)</p>
                <p className="text-gray-500 text-xs">Slice 12/48 | W:400 L:40</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">Fayllar yuklanmagan</p>
            </div>
          )}
        </div>

        {/* ===== ALL CONCLUSIONS SECTION ===== */}
        {conclusions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm">
            <button
              onClick={() => setShowConclusions(!showConclusions)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-gray-700 text-sm text-left">Barcha Xulosalar</p>
                  <p className="text-gray-400 text-xs text-left">{conclusions.length} ta xulosa mavjud</p>
                </div>
              </div>
              {showConclusions
                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {showConclusions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3"
              >
                {conclusions.map((c: Conclusion) => {
                  const typeInfo = getConclusionTypeLabel(c.conclusionType);
                  return (
                    <div key={c.id} className={`rounded-xl border-l-4 ${getConclusionBorderColor(c.conclusionType)} bg-gray-50 p-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        <span className="text-gray-400 text-xs">{new Date(c.signedAt).toLocaleDateString('uz-UZ')}</span>
                      </div>
                      <p className="text-gray-600 text-xs mb-1">
                        <span className="text-gray-800">Dr. {c.authorName || 'Noma\'lum'}</span>
                      </p>
                      {c.conclusionType === 'ai_analysis' && c.aiAnalysis && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-violet-600 text-xs">Ishonch darajasi</span>
                            <span className="text-violet-600 text-xs">{c.aiAnalysis.confidence}%</span>
                          </div>
                          <div className="h-1.5 bg-violet-100 rounded-full">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${c.aiAnalysis.confidence}%` }} />
                          </div>
                        </div>
                      )}
                      <p className="text-gray-700 text-xs leading-relaxed">{c.impression}</p>
                      {c.recommendations && (
                        <p className="text-emerald-600 text-xs mt-1">💊 {c.recommendations}</p>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* AI Analysis panel (for service display) */}
        {app.serviceType === 'ai_radiolog' && !aiConclusion && (
          <div className="bg-white rounded-2xl shadow-sm">
            <button
              onClick={() => setShowAI(!showAI)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-violet-600" />
                </div>
                <p className="text-gray-700 text-sm">🤖 AI dastlabki tahlili (demo)</p>
              </div>
              {showAI ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showAI && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-4 pb-4 border-t border-gray-50"
              >
                <div className="bg-violet-50 rounded-xl p-3 mt-3 space-y-2">
                  <div className="flex justify-between">
                    <p className="text-violet-700 text-xs">Ishonch darajasi</p>
                    <p className="text-violet-600 text-xs">87%</p>
                  </div>
                  <div className="h-2 bg-violet-100 rounded-full">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: '87%' }} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Aniqlangan anomaliyalar:</p>
                    {["Chap yarim sharda gipodens zona T2/FLAIR", "Periventricular signal o'zgarishlari", 'Sulci kengayishi'].map(a => (
                      <div key={a} className="flex items-start gap-1.5 mb-1">
                        <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-xs">{a}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs italic">⚠️ Bu faqat yordamchi ma'lumot.</p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Extra info request */}
        {showExtraForm && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-700 text-sm mb-2">Bemordan qo'shimcha ma'lumot so'rash</p>
            <textarea
              value={extraInfoNote}
              onChange={e => setExtraInfoNote(e.target.value)}
              placeholder="Nima kerakligini yozing..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 mb-2"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowExtraForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Bekor</button>
              <button onClick={handleRequestInfo} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm">Yuborish</button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5">
          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full bg-emerald-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2"
            >
              {accepting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Qabul qilinmoqda...</span></>
              ) : (
                <><CheckCircle className="w-4 h-4" /><span>Arizani qabul qilish</span></>
              )}
            </button>
          )}

          {canWriteConclusion && (
            <button
              onClick={handleWriteConclusion}
              className="w-full bg-blue-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{radiologConclusion ? "Xulosani tahrirlash / yangilash" : "Xulosa yozish"}</span>
            </button>
          )}

          {app.status === 'done' && radiologConclusion && (
            <div className="flex items-center gap-2 bg-green-50 rounded-2xl p-3.5 border border-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-700 text-sm">Xulosa yakunlangan</p>
                <p className="text-green-600 text-xs">{radiologConclusion.authorName}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowExtraForm(!showExtraForm)}
              className="flex-1 bg-white border border-orange-200 text-orange-600 rounded-2xl py-3 flex items-center justify-center gap-1.5 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Ma'lumot so'rash</span>
            </button>
            <button
              onClick={() => navigate('radiolog_specialist')}
              className="flex-1 bg-white border border-purple-200 text-purple-600 rounded-2xl py-3 flex items-center justify-center gap-1.5 text-sm"
            >
              <User className="w-4 h-4" />
              <span>Mutaxassis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
