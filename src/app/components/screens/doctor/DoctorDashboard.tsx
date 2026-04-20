import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, User, FileText, CheckCircle, AlertCircle, ChevronRight,
  Brain, Star, Send, Download, Eye, Stethoscope, ChevronDown, ChevronUp,
  Plus, Clock, Printer, Share2, Check, X, Upload, MessageCircle, Inbox
} from 'lucide-react';
import { useDoctorInbox } from '../../../hooks/useDoctorInbox';
import { DISEASE_KB_ENABLED } from '../../../lib/featureFlags';
import { useApp } from '../../../store/appStore';
import { ChatWindow } from '../../chat/ChatWindow';
import {
  getStatusLabel, getUrgencyLabel, formatDateTime, formatPrice, getConclusionTypeLabel
} from '../../../utils/formatters';
import {
  downloadConclusionReport, downloadSingleConclusion, printConclusionReport, shareConclusion
} from '../../../utils/pdfGenerator';
import type { Application, Conclusion } from '../../../types';

const DOCTOR_TEMPLATES = [
  "Klinik ko'rgulik radiolog xulosasi bilan mos keladi.",
  "Bemorni kasalxonaga yotqizish tavsiya etiladi.",
  "Qo'shimcha laboratoriya tekshiruvlari buyurildi.",
  "Dori-darmon tuzatildi, dinamik kuzatuv belgilandi.",
  "Nevrolog yoki boshqa mutaxassisga yo'llash tavsiya etiladi.",
  "Davolash rejasi tuzatildi, keyingi tekshiruv muddati belgilandi.",
  "Surunkali kasallik boshqaruvi rejasi tuzildi.",
  "Ambulatoriya davolash ko'rsatilgan, kasalxonaga yotqizish shart emas.",
];

const TABS = ['Barcha arizalar', 'Faol', 'Bajarildi', 'Keluvchi murojaatlar'];

export function DoctorDashboard() {
  const {
    currentUser, applications, navigate,
    addConclusionToApp, addNotification, unreadCount
  } = useApp();
  const routerNavigate = useNavigate();
  const { data: inboxData } = useDoctorInbox(
    DISEASE_KB_ENABLED ? { status: 'SENT_TO_DOCTOR', limit: 1 } : { limit: 0 },
  );

  const [activeTab, setActiveTab] = useState(0);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'upload'>('list');
  const [doctorNote, setDoctorNote] = useState('');
  const [doctorFindings, setDoctorFindings] = useState('');
  const [doctorRecommendations, setDoctorRecommendations] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<number[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedConclusions, setExpandedConclusions] = useState<Record<number, boolean>>({});
  const [downloading, setDownloading] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handlePickFile = (file: File | null) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) return;
    setUploadedFile(file);
  };

  const myApps = useMemo(() => {
    return applications.filter(a =>
      a.doctorId === currentUser?.id ||
      a.status === 'done'
    );
  }, [applications, currentUser?.id]);

  const tabApps = useMemo(() => {
    if (activeTab === 1) return myApps.filter(a => !['done', 'archived', 'failed'].includes(a.status));
    if (activeTab === 2) return myApps.filter(a => ['done', 'archived'].includes(a.status));
    return myApps;
  }, [activeTab, myApps]);

  const stats = {
    total: myApps.length,
    active: myApps.filter(a => !['done', 'archived', 'failed'].includes(a.status)).length,
    done: myApps.filter(a => a.status === 'done').length,
    withConclusions: myApps.filter(a => (a.conclusions?.length || 0) > 0).length,
  };

  const handleViewApp = (app: Application) => {
    setSelectedApp(app);
    setViewMode('detail');
  };

  const handleOpenUpload = (app: Application) => {
    setSelectedApp(app);
    setDoctorNote('');
    setDoctorFindings('');
    setDoctorRecommendations('');
    setShowTemplates(false);
    setUploadMode(false);
    setUploadedFile(null);
    setViewMode('upload');
  };

  const handleSubmitConclusion = async () => {
    if (uploadMode) {
      if (!uploadedFile || !selectedApp) return;
    } else {
      if (!doctorNote.trim() || doctorNote.length < 20 || !selectedApp) return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));

    const now = new Date().toISOString();
    const attachment = uploadedFile
      ? { name: uploadedFile.name, mimeType: uploadedFile.type, url: URL.createObjectURL(uploadedFile) }
      : undefined;

    const doctorConclusion: Conclusion = {
      id: Date.now(),
      applicationId: selectedApp.id,
      authorId: currentUser?.id || 0,
      authorName: currentUser?.fullName,
      conclusionType: 'doctor',
      description: uploadMode
        ? `Yuklangan xulosa fayli: ${uploadedFile?.name || ''}`
        : `Shifokor klinik xulosasi — ${currentUser?.specialty}`,
      findings: uploadMode ? (doctorFindings || 'Tayyor xulosa fayl ko‘rinishida taqdim etildi.') : (doctorFindings || 'Klinik ko\'rik asosida baholandi.'),
      impression: uploadMode ? 'Tayyor xulosa yuklandi va tasdiqlandi.' : doctorNote,
      recommendations: doctorRecommendations || undefined,
      source: uploadMode ? 'upload' : 'editor',
      attachment,
      signedAt: now,
      pdfUrl: `/conclusions/${selectedApp.arizaNumber}-doctor.pdf`,
    };

    addConclusionToApp(selectedApp.id, doctorConclusion);

    addNotification({
      userId: selectedApp.patientId,
      title: "Shifokor xulosasi qo'shildi",
      message: `${selectedApp.arizaNumber}: Dr. ${currentUser?.fullName} o'z xulosasini qo'shdi.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: selectedApp.id,
    });

    if (selectedApp.radiologId) {
      addNotification({
        userId: selectedApp.radiologId,
        title: 'Shifokor xulosasi',
        message: `${selectedApp.arizaNumber}: Yo'llagan shifokor Dr. ${currentUser?.fullName} o'z klinik xulosasini qo'shdi.`,
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        applicationId: selectedApp.id,
      });
    }

    setSubmitted(prev => [...prev, selectedApp.id]);
    setSubmitting(false);
    setUploadMode(false);
    setUploadedFile(null);
    setViewMode('detail');
  };

  const handleDownloadApp = async (app: Application) => {
    if (!(app.conclusions?.length)) return;
    setDownloading(app.id);
    try {
      downloadConclusionReport(app);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  const handlePrintApp = (app: Application) => {
    if (!(app.conclusions?.length)) return;
    printConclusionReport(app);
  };

  const handleShareApp = async (app: Application) => {
    const result = await shareConclusion(app);
    if (result === 'copied') {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  const toggleExpanded = (appId: number) => {
    setExpandedConclusions(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  // ===================== DETAIL VIEW =====================
  if (viewMode === 'detail' && selectedApp) {
    // Refresh from store
    const freshApp = applications.find(a => a.id === selectedApp.id) || selectedApp;
    const conclusions = freshApp.conclusions || [];
    const status = getStatusLabel(freshApp.status);
    const urgency = getUrgencyLabel(freshApp.urgency);
    const myConclusion = conclusions.find(c => c.conclusionType === 'doctor' && c.authorId === currentUser?.id);

    const getConclusionBg = (type: string) => ({
      ai_analysis: 'border-violet-400 bg-violet-50',
      radiolog:    'border-emerald-400 bg-emerald-50',
      specialist:  'border-purple-400 bg-purple-50',
      doctor:      'border-blue-400 bg-blue-50',
    }[type] || 'border-gray-200 bg-gray-50');

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-sky-800 to-blue-800 pt-12 pb-8 px-5">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setViewMode('list')} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white rotate-180" />
            </button>
            <div className="flex-1">
              <h1 className="text-white text-lg">Bemor ma'lumotlari</h1>
              <p className="text-sky-200 text-xs">{freshApp.arizaNumber}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 -mt-4 space-y-4 pb-8">
          {/* Patient info */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Bemor ma'lumotlari
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                {freshApp.patient?.avatar || 'B'}
              </div>
              <div>
                <p className="text-gray-900 text-sm">{freshApp.patient?.fullName}</p>
                <p className="text-gray-500 text-xs">
                  {freshApp.patient?.gender === 'male' ? 'Erkak' : 'Ayol'} •{' '}
                  {freshApp.patient?.birthDate ? new Date().getFullYear() - new Date(freshApp.patient.birthDate).getFullYear() : ''} yosh
                </p>
                <p className="text-gray-400 text-xs">{freshApp.patient?.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Tasvir turi', value: freshApp.scanType },
                { label: 'Organ', value: freshApp.organ },
                { label: 'Sana', value: freshApp.scanDate },
                { label: 'Muhimlik', value: `${urgency.icon} ${urgency.label.split('(')[0]}` },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-gray-400 text-xs">{item.label}</p>
                  <p className="text-gray-800 text-xs mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            {freshApp.patient?.chronicDiseases && (
              <div className="mt-2 bg-red-50 rounded-xl p-2.5">
                <p className="text-red-500 text-xs">⚠️ Surunkali kasalliklar: {freshApp.patient.chronicDiseases}</p>
              </div>
            )}
          </div>

          {/* Anamnez */}
          {freshApp.anamnez && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Shikoyat va anamnez
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-500 text-xs">Asosiy shikoyat</p>
                  <p className="text-gray-800 text-sm mt-0.5">{freshApp.anamnez.complaint}</p>
                </div>
                {freshApp.anamnez.hasPain && (
                  <div>
                    <p className="text-gray-500 text-xs">Og'riq darajasi</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${(freshApp.anamnez.painLevel || 5) * 10}%` }} />
                      </div>
                      <span className="text-gray-700 text-xs">{freshApp.anamnez.painLevel}/10</span>
                    </div>
                  </div>
                )}
                {freshApp.anamnez.medications && (
                  <div>
                    <p className="text-gray-500 text-xs">Dorilar</p>
                    <p className="text-gray-700 text-sm">{freshApp.anamnez.medications}</p>
                  </div>
                )}
                {freshApp.anamnez.allergies && (
                  <div className="bg-yellow-50 rounded-lg p-2">
                    <p className="text-yellow-600 text-xs">⚠️ Allergiya: {freshApp.anamnez.allergies}</p>
                  </div>
                )}
                {freshApp.anamnez.additionalInfo && (
                  <div>
                    <p className="text-gray-500 text-xs">Qo'shimcha</p>
                    <p className="text-gray-700 text-sm">{freshApp.anamnez.additionalInfo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ALL CONCLUSIONS */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-violet-500" />
              <p className="text-gray-700 text-sm">Barcha xulosalar</p>
              <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {conclusions.length} ta
              </span>
            </div>

            {conclusions.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Hali xulosa yuklanmagan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conclusions.map((c: Conclusion) => {
                  const typeInfo = getConclusionTypeLabel(c.conclusionType);
                  return (
                    <div key={c.id} className={`rounded-2xl border-l-4 ${getConclusionBg(c.conclusionType)} p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full bg-white ${typeInfo.color}`}>
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{formatDateTime(c.signedAt)}</span>
                          <button
                            onClick={() => downloadSingleConclusion(freshApp, c)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Yuklab olish"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-xs mb-1">
                        👤 <span className="text-gray-800">{c.authorName || "Noma'lum"}</span>
                      </p>

                      {c.conclusionType === 'ai_analysis' && c.aiAnalysis && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-violet-600 text-xs">Ishonch</span>
                            <span className="text-violet-600 text-xs">{c.aiAnalysis.confidence}%</span>
                          </div>
                          <div className="h-1.5 bg-violet-100 rounded-full">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${c.aiAnalysis.confidence}%` }} />
                          </div>
                          <div className="mt-2 space-y-1">
                            {c.aiAnalysis.anomalies.map((a, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-700 text-xs">{a}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {c.attachment?.url && (
                        <a
                          href={c.attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sky-600 text-xs bg-sky-50 rounded-lg px-3 py-2 border border-sky-100 mb-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Yuklangan faylni ochish: {c.attachment.name}
                        </a>
                      )}
                      <div className="space-y-1.5 mt-2">
                        <div>
                          <p className="text-gray-500 text-xs">Topilmalar:</p>
                          <p className="text-gray-700 text-xs leading-relaxed">{c.findings}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Xulosa:</p>
                          <p className="text-gray-800 text-xs leading-relaxed">{c.impression}</p>
                        </div>
                        {c.recommendations && (
                          <div className="bg-white rounded-lg p-2 border border-amber-100">
                            <p className="text-amber-600 text-xs">💊 {c.recommendations}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Download / Print actions (only if conclusions exist) */}
          {conclusions.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadApp(freshApp)}
                disabled={downloading === freshApp.id}
                className="flex-1 bg-white border border-emerald-200 text-emerald-700 rounded-2xl py-3 flex items-center justify-center gap-1.5 text-sm"
              >
                {downloading === freshApp.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Yuklab olish</span>
              </button>
              <button
                onClick={() => handlePrintApp(freshApp)}
                className="flex-1 bg-white border border-blue-200 text-blue-700 rounded-2xl py-3 flex items-center justify-center gap-1.5 text-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chop etish</span>
              </button>
              <button
                onClick={() => handleShareApp(freshApp)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-2xl py-3 flex items-center justify-center gap-1.5 text-sm"
              >
                {shareStatus === 'copied' ? (
                  <><Check className="w-3.5 h-3.5 text-green-600" /><span className="text-green-600 text-xs">Nusxa!</span></>
                ) : (
                  <><Share2 className="w-3.5 h-3.5" /><span>Ulash</span></>
                )}
              </button>
            </div>
          )}

          {/* My conclusion or upload button */}
          {myConclusion ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-blue-700 text-sm flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4" />
                Mening xulosamni yubordim ✅
              </p>
              <p className="text-gray-700 text-xs mb-3 leading-relaxed">{myConclusion.impression}</p>
              <button
                onClick={() => downloadSingleConclusion(freshApp, myConclusion)}
                className="text-blue-600 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3 h-3" />
                Xulosamni yuklab olish
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleOpenUpload(freshApp)}
              className="w-full bg-sky-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>O'z xulosangizni yuklash</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ===================== UPLOAD VIEW =====================
  if (viewMode === 'upload' && selectedApp) {
    const isValid = uploadMode ? !!uploadedFile : doctorNote.length >= 20;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-sky-800 to-blue-800 pt-12 pb-8 px-5">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setViewMode('detail')} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white rotate-180" />
            </button>
            <div className="flex-1">
              <h1 className="text-white text-lg">Klinik Xulosa Yozish</h1>
              <p className="text-sky-200 text-xs">{selectedApp.arizaNumber} • {selectedApp.patient?.fullName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 -mt-4 space-y-4 pb-8">
          {/* Existing conclusions summary */}
          {selectedApp.conclusions && selectedApp.conclusions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-violet-500" />
                Mavjud xulosalar xulasasi:
              </p>
              {selectedApp.conclusions.slice(0, 2).map(c => {
                const typeInfo = getConclusionTypeLabel(c.conclusionType);
                return (
                  <div key={c.id} className="bg-gray-50 rounded-xl p-2.5 mb-2">
                    <p className="text-xs mb-1">
                      <span className={typeInfo.color}>{typeInfo.icon} {typeInfo.label}</span>
                      <span className="text-gray-400 ml-1">— {c.authorName}</span>
                    </p>
                    <p className="text-gray-700 text-xs line-clamp-2">{c.impression}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            <p className="text-gray-700 text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-sky-500" />
              Klinik xulosa yozish
            </p>

            {/* Tayyor xulosani yuklayman + format hint */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadMode}
                  onChange={(e) => { setUploadMode(e.target.checked); setUploadedFile(null); }}
                  className="accent-sky-600"
                />
                Tayyor xulosani yuklayman
              </label>
              <span className="text-gray-400 text-xs">PDF/JPG/PNG/DOCX</span>
            </div>

            {uploadMode ? (
              <div>
                <label className="w-full border border-dashed border-gray-200 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-500 text-sm cursor-pointer hover:border-sky-300 hover:bg-sky-50/50 transition-colors">
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
                    Galochka yoqilganda matn maydonlari yashiriladi va yuklash rejimi ishlaydi.
                  </p>
                )}
                {/* Topilmalar * (optional when upload) */}
                <div className="mt-4">
                  <label className="text-gray-600 text-xs mb-1.5 block">Topilmalar * (ixtiyoriy)</label>
                  <textarea
                    value={doctorFindings}
                    onChange={e => setDoctorFindings(e.target.value)}
                    placeholder="Yuklangan xulosaga qisqa izoh..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Topilmalar * */}
                <div>
                  <label className="text-gray-600 text-xs mb-1.5 block">Topilmalar *</label>
                  <textarea
                    value={doctorFindings}
                    onChange={e => setDoctorFindings(e.target.value)}
                    placeholder="Klinik ko'rik, palpatsiya, reflekslar, bemor holati..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                {/* Impression (required) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-gray-600 text-xs">Klinik xulosa * (kamida 20 belgi)</label>
                    <span className={`text-xs ${doctorNote.length >= 20 ? 'text-green-500' : 'text-gray-400'}`}>
                      {doctorNote.length} belgi
                    </span>
                  </div>

                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-sky-600 text-xs flex items-center gap-1 mb-2"
                  >
                    <Plus className="w-3 h-3" />
                    Tez iboralar {showTemplates ? '▲' : '▼'}
                  </button>
                  <AnimatePresence>
                    {showTemplates && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 gap-1 mb-2"
                      >
                        {DOCTOR_TEMPLATES.map((tmpl, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setDoctorNote(prev => prev ? prev + ' ' + tmpl : tmpl);
                              setShowTemplates(false);
                            }}
                            className="text-left text-xs bg-sky-50 rounded-lg px-3 py-2 text-gray-700 hover:bg-sky-100 border border-sky-100"
                          >
                            {tmpl}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    value={doctorNote}
                    onChange={e => setDoctorNote(e.target.value)}
                    placeholder="Klinik xulosangizni kiriting..."
                    rows={4}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-100 ${
                      doctorNote.length > 0 && doctorNote.length < 20 ? 'border-red-200' : 'border-gray-200'
                    }`}
                  />
                  {doctorNote.length > 0 && doctorNote.length < 20 && (
                    <p className="text-red-500 text-xs mt-1">Kamida 20 ta belgi kiriting</p>
                  )}
                </div>

                {/* Recommendations */}
                <div>
                  <label className="text-gray-600 text-xs mb-1.5 block">Tavsiyalar va keyingi qadamlar</label>
                  <textarea
                    value={doctorRecommendations}
                    onChange={e => setDoctorRecommendations(e.target.value)}
                    placeholder="Dori-darmon, muolajalar, keyingi ko'rik muddati..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </>
            )}
          </div>

          {/* Doctor info */}
          <div className="bg-sky-50 rounded-2xl p-3 border border-sky-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-200 rounded-full flex items-center justify-center text-sky-700 text-sm">
                {currentUser?.avatar}
              </div>
              <div>
                <p className="text-gray-800 text-xs">{currentUser?.fullName}</p>
                <p className="text-gray-500 text-xs">{currentUser?.specialty} • {currentUser?.license}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitConclusion}
            disabled={!isValid || submitting}
            className="w-full bg-sky-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Yuborilmoqda...</span></>
            ) : (
              <><Send className="w-4 h-4" /><span>Xulosani Yuborish va Saqlash</span></>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ===================== LIST VIEW =====================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-800 to-blue-800 pt-12 pb-20 px-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sky-200 text-sm">Shifokor paneli</p>
            <h1 className="text-white text-xl">Dr. {currentUser?.fullName?.split(' ')[0]} 👨‍⚕️</h1>
            <p className="text-sky-300 text-xs mt-0.5">{currentUser?.specialty}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('notifications')}
              className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => navigate('profile')} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Jami', value: stats.total, color: 'bg-white/10' },
            { label: 'Faol', value: stats.active, color: 'bg-yellow-500/20' },
            { label: 'Bajarildi', value: stats.done, color: 'bg-green-500/20' },
            { label: 'Xulosali', value: stats.withConclusions, color: 'bg-blue-500/20' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-2.5 text-center`}>
              <p className="text-white text-2xl">{s.value}</p>
              <p className="text-white/50 text-xs leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 -mt-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-4">
          {TABS.map((tab, i) => {
            const counts = [stats.total, stats.active, stats.done, 0];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${
                  activeTab === i ? 'bg-sky-600 text-white' : 'text-gray-500'
                }`}
              >
                {tab}
                {counts[i] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === i ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
                    {counts[i]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Keluvchi murojaatlar (triage) tab */}
        {activeTab === TABS.length - 1 && (
          <div className="space-y-4 pb-24">
            {/* Demo chat */}
            <div className="bg-white rounded-2xl shadow-sm p-3">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-sky-600" />
                <p className="text-gray-700 text-sm font-medium">Bemor bilan suhbat</p>
                <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full ml-auto">Demo</span>
              </div>
              <ChatWindow
                roomId="consultation_demo"
                currentUserId={currentUser?.id ?? 0}
                className="h-[420px]"
              />
            </div>

            {/* Inbox CTA — faqat flag yoqilganda ko'rinadi */}
            {DISEASE_KB_ENABLED && <button
              type="button"
              onClick={() => routerNavigate('/shifokor/inbox')}
              className="w-full bg-white rounded-2xl border border-primary/20 shadow-sm p-4 flex items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Inbox className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">Triage natijalari</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bemorlar yuborgan simptom sessiyalarini ko'rish
                </p>
              </div>
              {(inboxData?.total ?? 0) > 0 && (
                <span className="shrink-0 min-w-[24px] h-6 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {inboxData!.total}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>}
          </div>
        )}

        {/* Application cards */}
        {activeTab < TABS.length - 1 && (
        <div className="space-y-3 pb-24">
          {tabApps.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Bu bo'limda arizalar yo'q</p>
            </div>
          ) : (
            tabApps.map((app, i) => {
              const status = getStatusLabel(app.status);
              const urgency = getUrgencyLabel(app.urgency);
              const conclusions = app.conclusions || [];
              const aiConclusion = conclusions.find(c => c.conclusionType === 'ai_analysis');
              const radiologConclusion = conclusions.find(c => c.conclusionType === 'radiolog');
              const specialistConclusions = conclusions.filter(c => c.conclusionType === 'specialist');
              const myDoctorConclusion = conclusions.find(c => c.conclusionType === 'doctor' && c.authorId === currentUser?.id);
              const isExpanded = expandedConclusions[app.id];

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${
                    app.urgency === 'emergency' ? 'border-red-400' :
                    app.urgency === 'urgent' ? 'border-yellow-400' : 'border-sky-200'
                  }`}
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-900 text-sm">{app.patient?.fullName}</p>
                        <p className="text-gray-400 text-xs">{app.arizaNumber} • {formatDateTime(app.createdAt)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-700 text-sm">{app.scanType}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500 text-sm">{app.organ}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm">{urgency.icon}</span>
                    </div>

                    {/* Conclusion badges */}
                    {conclusions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {aiConclusion && <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">🤖 AI</span>}
                        {radiologConclusion && <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">🩻 Radiolog</span>}
                        {specialistConclusions.length > 0 && (
                          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                            🔬 Mutaxassis ({specialistConclusions.length})
                          </span>
                        )}
                        {myDoctorConclusion && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">✅ Mening xulosam</span>
                        )}
                      </div>
                    )}

                    {/* Expand conclusions preview */}
                    {conclusions.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(app.id)}
                        className="w-full flex items-center justify-between text-xs text-gray-500 mb-2 bg-gray-50 rounded-xl px-3 py-2"
                      >
                        <span className="flex items-center gap-1">
                          <Brain className="w-3 h-3 text-violet-500" />
                          {conclusions.length} ta xulosa
                        </span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}

                    {/* Expanded conclusions preview */}
                    {isExpanded && conclusions.length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        {conclusions.slice(0, 3).map(c => {
                          const typeInfo = getConclusionTypeLabel(c.conclusionType);
                          return (
                            <div key={c.id} className={`rounded-xl p-2.5 border-l-2 ${
                              c.conclusionType === 'ai_analysis' ? 'border-violet-400 bg-violet-50' :
                              c.conclusionType === 'radiolog' ? 'border-emerald-400 bg-emerald-50' :
                              c.conclusionType === 'specialist' ? 'border-purple-400 bg-purple-50' :
                              'border-blue-400 bg-blue-50'
                            }`}>
                              <p className="text-xs mb-0.5">
                                <span className={typeInfo.color}>{typeInfo.icon} {typeInfo.label}</span>
                                <span className="text-gray-400 ml-1">— {c.authorName}</span>
                              </p>
                              <p className="text-gray-700 text-xs line-clamp-2">{c.impression}</p>
                            </div>
                          );
                        })}
                        {conclusions.length > 3 && (
                          <p className="text-gray-400 text-xs text-center">+{conclusions.length - 3} ta ko'proq...</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewApp(app)}
                        className="flex-1 bg-sky-50 border border-sky-200 text-sky-700 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ko'rish</span>
                      </button>

                      {conclusions.length > 0 && (
                        <button
                          onClick={() => handleDownloadApp(app)}
                          disabled={downloading === app.id}
                          className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-xs"
                        >
                          {downloading === app.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>Yuklab olish</span>
                        </button>
                      )}

                      {!myDoctorConclusion && (
                        <button
                          onClick={() => handleOpenUpload(app)}
                          className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Xulosa</span>
                        </button>
                      )}
                    </div>

                    {/* Rating if done */}
                    {app.status === 'done' && app.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= app.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                        {app.ratingComment && (
                          <p className="text-gray-400 text-xs ml-1 truncate">{app.ratingComment}</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
        )}
      </div>
    </div>
  );
}