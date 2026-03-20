import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight, Download, Share2, FileText, CheckCircle, Star,
  AlertCircle, Brain, ChevronDown, ChevronUp, Printer, Copy, Check
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { formatDateTime, getConclusionTypeLabel } from '../../../data/mockData';
import { downloadConclusionReport, printConclusionReport, shareConclusion, downloadSingleConclusion } from '../../../utils/pdfGenerator';
import type { Conclusion } from '../../../types';

export function ConclusionView() {
  const { selectedApplication, applications, navigate, goBack } = useApp();
  const app = applications.find(a => a.id === selectedApplication?.id) || selectedApplication;
  const [expandedConclusion, setExpandedConclusion] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');

  const qrPattern = useMemo(() => {
    const seed = (app?.arizaNumber || 'RAD').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: 25 }, (_, i) => ((seed * (i + 1) * 1234567) % 7) > 3);
  }, [app?.arizaNumber]);

  const conclusions = app?.conclusions || [];
  const aiConclusion = conclusions.find(c => c.conclusionType === 'ai_analysis');
  const radiologConclusion = conclusions.find(c => c.conclusionType === 'radiolog');
  const specialistConclusions = conclusions.filter(c => c.conclusionType === 'specialist');
  const doctorConclusions = conclusions.filter(c => c.conclusionType === 'doctor');

  if (!app || conclusions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-3">
        <AlertCircle className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">Xulosa topilmadi</p>
        <p className="text-gray-400 text-sm">Xulosa hali tayyorlanmagan</p>
        <button onClick={goBack} className="text-blue-600 text-sm">Orqaga</button>
      </div>
    );
  }

  const getConclusionBg = (type: string) => {
    const map: Record<string, string> = {
      ai_analysis: 'border-violet-300 bg-violet-50',
      radiolog: 'border-emerald-300 bg-emerald-50',
      specialist: 'border-purple-300 bg-purple-50',
      doctor: 'border-blue-300 bg-blue-50',
    };
    return map[type] || 'border-gray-200 bg-gray-50';
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      downloadConclusionReport(app);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const handlePrint = () => {
    printConclusionReport(app);
  };

  const handleShare = async () => {
    const result = await shareConclusion(app);
    if (result === 'copied') {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } else if (result === 'shared') {
      setShareStatus('shared');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  const handleDownloadSingle = (c: Conclusion) => {
    downloadSingleConclusion(app, c);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-white text-lg">Radiologik xulosalar</h1>
            <p className="text-emerald-200 text-sm">{app.arizaNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
          <CheckCircle className="w-5 h-5 text-emerald-300" />
          <div>
            <p className="text-white text-sm">{conclusions.length} ta xulosa mavjud</p>
            <p className="text-emerald-200 text-xs">
              {radiologConclusion
                ? `Radiolog: ${formatDateTime(radiologConclusion.signedAt)}`
                : 'Radiolog xulosasi kutilmoqda'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-24">
        {/* Summary badges */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-500 text-xs mb-3">Xulosalar manbai</p>
          <div className="flex flex-wrap gap-2">
            {aiConclusion && (
              <div className="flex items-center gap-1.5 bg-violet-50 rounded-xl px-3 py-1.5">
                <Brain className="w-3.5 h-3.5 text-violet-500" />
                <span className="text-violet-700 text-xs">AI Tahlil</span>
                <span className="text-violet-500 text-xs">({aiConclusion.aiAnalysis?.confidence}%)</span>
              </div>
            )}
            {radiologConclusion && (
              <div className="flex items-center gap-1.5 bg-emerald-50 rounded-xl px-3 py-1.5">
                <span className="text-emerald-700 text-xs">🩻 Radiolog</span>
              </div>
            )}
            {specialistConclusions.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-purple-50 rounded-xl px-3 py-1.5">
                <span className="text-purple-700 text-xs">🔬 Mutaxassis</span>
              </div>
            ))}
            {doctorConclusions.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-blue-50 rounded-xl px-3 py-1.5">
                <span className="text-blue-700 text-xs">👨‍⚕️ Shifokor</span>
              </div>
            ))}
          </div>
        </div>

        {/* Examination info */}
        {(app.examinations?.length || 0) > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-3">Tekshiruv ma’lumotlari</p>
            <div className="space-y-3">
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

        {/* ALL CONCLUSIONS */}
        {conclusions.map((c: Conclusion, idx) => {
          const typeInfo = getConclusionTypeLabel(c.conclusionType);
          const isExpanded = expandedConclusion === c.id;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${getConclusionBg(c.conclusionType)}`}
            >
              {/* Conclusion header */}
              <button
                onClick={() => setExpandedConclusion(isExpanded ? null : c.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full bg-white ${typeInfo.color} border border-gray-100`}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">{new Date(c.signedAt).toLocaleDateString('uz-UZ')}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                <p className="text-gray-700 text-xs mb-1">
                  👤 <span className="text-gray-800">{c.authorName || "Noma'lum"}</span>
                </p>
                {c.conclusionType === 'ai_analysis' && c.aiAnalysis && (
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-violet-600 text-xs">Ishonch darajasi</span>
                      <span className="text-violet-600 text-xs">{c.aiAnalysis.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-violet-100 rounded-full">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${c.aiAnalysis.confidence}%` }} />
                    </div>
                  </div>
                )}
                <p className="text-gray-600 text-xs mt-2 line-clamp-2">{c.impression}</p>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3"
                >
                  {c.attachment?.url && (
                    <a
                      href={c.attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block bg-blue-50 text-blue-700 rounded-xl px-3 py-2 text-xs border border-blue-100"
                    >
                      📎 Yuklangan faylni ochish: {c.attachment.name}
                    </a>
                  )}
                  {c.conclusionType === 'ai_analysis' && c.aiAnalysis && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1.5">Aniqlangan anomaliyalar:</p>
                      {c.aiAnalysis.anomalies.map((a, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-1">
                          <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 text-xs">{a}</p>
                        </div>
                      ))}
                      <p className="text-gray-400 text-xs italic mt-1">⚠️ {c.aiAnalysis.notes}</p>
                    </div>
                  )}

                  {[
                    { title: '📋 Tasvir tavsifi', content: c.description },
                    { title: '🔍 Topilmalar', content: c.findings },
                    { title: '📝 Xulosa', content: c.impression },
                    ...(c.recommendations ? [{ title: '💊 Tavsiyalar', content: c.recommendations }] : []),
                  ].map(section => (
                    <div key={section.title}>
                      <p className="text-gray-500 text-xs mb-1">{section.title}</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{section.content}</p>
                    </div>
                  ))}

                  {/* Single conclusion download */}
                  <button
                    onClick={() => handleDownloadSingle(c)}
                    className="flex items-center gap-2 text-blue-600 text-xs bg-blue-50 rounded-xl px-3 py-2 mt-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Bu xulosani yuklash</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Radiologist info card */}
        {radiologConclusion && app.radiolog && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-3">Asosiy radiolog</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                {app.radiolog?.avatar || 'DR'}
              </div>
              <div>
                <p className="text-gray-900 text-sm">{app.radiolog?.fullName}</p>
                <p className="text-gray-500 text-xs">{app.radiolog?.license}</p>
                <p className="text-gray-400 text-xs">{app.radiolog?.specialty}</p>
              </div>
              <div className="ml-auto">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3 h-3 ${s <= (app.radiolog?.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-400 text-xs text-right mt-0.5">{app.radiolog?.totalConclusions} xulosa</p>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-amber-700 text-xs leading-relaxed">
            ⚠️ Ushbu xulosalar faqat maslahatlashuv maqsadida berilgan. Ular shifokor klinik ko'rigini almashtirmaydi.
            Davolash uchun shifokorga murojaat qiling.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {/* Download All */}
          <button
            onClick={handleDownloadAll}
            disabled={downloading}
            className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="text-sm">Tayyorlanmoqda...</span></>
            ) : (
              <><Download className="w-4 h-4" /><span className="text-sm">Barcha xulosalarni yuklab olish (HTML)</span></>
            )}
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="w-full bg-white border border-emerald-200 text-emerald-700 rounded-2xl py-3 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span className="text-sm">Chop etish / PDF saqlash</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3 flex items-center justify-center gap-2"
          >
            {shareStatus === 'copied' ? (
              <><Check className="w-4 h-4 text-green-600" /><span className="text-sm text-green-600">Nusxa olindi!</span></>
            ) : shareStatus === 'shared' ? (
              <><Check className="w-4 h-4 text-green-600" /><span className="text-sm text-green-600">Ulashildi!</span></>
            ) : (
              <><Share2 className="w-4 h-4" /><span className="text-sm">Ulashish / Nusxalash</span></>
            )}
          </button>

          <button
            onClick={() => navigate('patient_upload')}
            className="w-full bg-blue-50 text-blue-600 rounded-2xl py-3.5 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">Yangi ariza berish</span>
          </button>
        </div>

        {/* QR code */}
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <p className="text-gray-500 text-xs mb-2">Autentiklik tekshirish uchun QR kod</p>
          <div className="w-24 h-24 bg-gray-100 rounded-xl mx-auto flex items-center justify-center p-2">
            <div className="grid grid-cols-5 gap-0.5 w-full h-full">
              {qrPattern.map((filled, i) => (
                <div key={i} className={`rounded-sm ${filled ? 'bg-gray-800' : 'bg-gray-100'}`} />
              ))}
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-2">{app.arizaNumber}</p>
          <p className="text-gray-300 text-xs">radconsult.uz/verify/{app.arizaNumber}</p>
        </div>
      </div>
    </div>
  );
}