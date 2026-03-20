import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, User, ChevronRight, FileText, Clock, CheckCircle,
  AlertCircle, Star, Send, Eye, X, Brain, Download, Stethoscope, ChevronDown, ChevronUp
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { getStatusLabel, getUrgencyLabel, formatDateTime, formatPrice, getConclusionTypeLabel } from '../../../data/mockData';
import { downloadConclusionReport, downloadSingleConclusion } from '../../../utils/pdfGenerator';
import type { Application, Conclusion } from '../../../types';

const CONSULT_TEMPLATES = [
  "MRT tasvirida multipl giperintens zona aniqlanib, demielinizatsiya kasalligiga xos ko'rinish mavjud.",
  "Patologik topilma klinik ko'rgulik bilan mos keladi. Nevrolog konsultatsiyasi tavsiya etiladi.",
  "Tasvirda neoplastik jarayon belgilari yo'q. Dinamik kuzatuv tavsiya etiladi.",
  "MRT topilmalari asosida MR-angiografiya o'tkazish tavsiya etiladi.",
  "O'choqli o'zgarishlar vaskulyar etiologiyaga xos. Nevropatolog kuzatuvi zarur.",
];

const TABS = ["Yangi so'rovlar", 'Jarayonda', 'Bajarildi'];

export function SpecialistDashboard() {
  const { currentUser, applications, navigate, updateApplication, addConclusionToApp, addNotification, unreadCount } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [consultNote, setConsultNote] = useState('');
  const [consultFindings, setConsultFindings] = useState('');
  const [consultRecommendations, setConsultRecommendations] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<number[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExistingConclusions, setShowExistingConclusions] = useState<Record<number, boolean>>({});
  const [downloading, setDownloading] = useState<number | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handlePickFile = (file: File | null) => {
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) return;
    setUploadedFile(file);
  };

  const referredApps = useMemo(() => applications.filter(a =>
    a.status === 'with_specialist' || a.serviceType === 'radiolog_specialist'
  ), [applications]);

  const tabApps = useMemo(() => {
    if (activeTab === 0) return referredApps.filter(a => a.status === 'with_specialist');
    if (activeTab === 1) return referredApps.filter(a => ['accepted', 'conclusion_writing'].includes(a.status));
    return referredApps.filter(a => ['done', 'archived'].includes(a.status));
  }, [activeTab, referredApps]);

  const stats = {
    pending: referredApps.filter(a => a.status === 'with_specialist').length,
    inProgress: referredApps.filter(a => ['accepted', 'conclusion_writing'].includes(a.status)).length,
    done: referredApps.filter(a => a.status === 'done').length,
    urgent: referredApps.filter(a => a.urgency !== 'normal' && a.status === 'with_specialist').length,
  };

  const handleSubmitConsult = async (app: Application) => {
    if (uploadMode) {
      if (!uploadedFile) return;
    } else {
      if (!consultNote.trim() || consultNote.length < 30) return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));

    const now = new Date().toISOString();
    const attachment = uploadedFile
      ? { name: uploadedFile.name, mimeType: uploadedFile.type, url: URL.createObjectURL(uploadedFile) }
      : undefined;

    const specialistConclusion: Conclusion = {
      id: Date.now(),
      applicationId: app.id,
      authorId: currentUser?.id || 0,
      authorName: currentUser?.fullName,
      conclusionType: 'specialist',
      description: uploadMode
        ? `Yuklangan xulosa fayli: ${uploadedFile?.name || ''}`
        : `Mutaxassis konsultatsiyasi — ${currentUser?.specialty}`,
      findings: uploadMode ? 'Tayyor xulosa fayl ko‘rinishida taqdim etildi.' : (consultFindings || consultNote),
      impression: uploadMode ? 'Tayyor xulosa yuklandi va tasdiqlandi.' : consultNote,
      recommendations: consultRecommendations || undefined,
      source: uploadMode ? 'upload' : 'editor',
      attachment,
      signedAt: now,
      pdfUrl: `/conclusions/${app.arizaNumber}-specialist.pdf`,
    };

    addConclusionToApp(app.id, specialistConclusion);
    updateApplication(app.id, {
      status: 'conclusion_writing',
      specialistId: currentUser?.id,
      specialist: currentUser || undefined,
    });

    addNotification({
      userId: app.radiologId || 2,
      title: 'Mutaxassis xulosasi tayyor',
      message: `${app.arizaNumber} uchun Dr. ${currentUser?.fullName} konsultatsiya xulosasini yubordi.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: app.id,
    });
    addNotification({
      userId: app.patientId,
      title: "Mutaxassis ko'rib chiqdi",
      message: `${app.arizaNumber} arizangiz mutaxassis tomonidan ko'rib chiqildi. Radiolog yakuniy xulosani tayyorlaydi.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: app.id,
    });
    if (app.doctorId) {
      addNotification({
        userId: app.doctorId,
        title: 'Mutaxassis xulosasi',
        message: `${app.arizaNumber}: Dr. ${currentUser?.fullName} (${currentUser?.specialty}) konsultatsiya xulosasini yubordi.`,
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString(),
        applicationId: app.id,
      });
    }

    setSubmitted(prev => [...prev, app.id]);
    setSubmitting(false);
    setSelectedApp(null);
    setConsultNote('');
    setConsultFindings('');
    setConsultRecommendations('');
    setUploadMode(false);
    setUploadedFile(null);
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

  const insertTemplate = (tmpl: string) => {
    setConsultNote(prev => prev ? prev + ' ' + tmpl : tmpl);
    setShowTemplates(false);
  };

  const toggleConclusions = (appId: number) => {
    setShowExistingConclusions(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-violet-800 pt-12 pb-20 px-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-purple-200 text-sm">Mutaxassis paneli</p>
            <h1 className="text-white text-xl">Dr. {currentUser?.fullName?.split(' ')[0]} 🩺</h1>
            <p className="text-purple-300 text-xs mt-0.5">{currentUser?.specialty}</p>
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
            { label: 'Kutilmoqda', value: stats.pending, color: 'bg-white/10' },
            { label: 'Jarayonda', value: stats.inProgress, color: 'bg-indigo-500/20' },
            { label: 'Bajarildi', value: stats.done, color: 'bg-green-500/20' },
            { label: 'Tezkor', value: stats.urgent, color: 'bg-yellow-500/20' },
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
            const counts = [stats.pending, stats.inProgress, stats.done];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${
                  activeTab === i ? 'bg-purple-600 text-white' : 'text-gray-500'
                }`}
              >
                {tab}
                {counts[i] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === i ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {counts[i]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Consultation modal / form */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-purple-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-gray-800 text-sm">{selectedApp.arizaNumber}</p>
                  <p className="text-gray-500 text-xs">{selectedApp.patient?.fullName} • {selectedApp.scanType} {selectedApp.organ}</p>
                </div>
                <button onClick={() => setSelectedApp(null)}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Radiolog notes */}
              {selectedApp.notes && (
                <div className="bg-purple-50 rounded-xl p-3 mb-3">
                  <p className="text-purple-600 text-xs mb-1 flex items-center gap-1">
                    <Brain className="w-3 h-3" /> Radiolog izohi
                  </p>
                  <p className="text-gray-700 text-xs">{selectedApp.notes}</p>
                </div>
              )}

              {/* Existing conclusions */}
              {(selectedApp.conclusions?.length || 0) > 0 && (
                <div className="mb-3">
                  <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Mavjud xulosalar ({selectedApp.conclusions?.length})
                  </p>
                  <div className="space-y-2">
                    {selectedApp.conclusions?.map(c => {
                      const typeInfo = getConclusionTypeLabel(c.conclusionType);
                      return (
                        <div key={c.id} className={`rounded-xl p-2.5 border-l-4 ${
                          c.conclusionType === 'ai_analysis' ? 'border-violet-400 bg-violet-50' :
                          c.conclusionType === 'radiolog' ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <p className="text-xs mb-0.5">
                            <span className={typeInfo.color}>{typeInfo.icon} {typeInfo.label}</span>
                            <span className="text-gray-400 ml-1">— {c.authorName}</span>
                          </p>
                          <p className="text-gray-700 text-xs line-clamp-2">{c.impression}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Anamnez */}
              {selectedApp.anamnez && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-gray-500 text-xs mb-1">Shikoyat</p>
                  <p className="text-gray-700 text-xs">{selectedApp.anamnez.complaint}</p>
                  {selectedApp.anamnez.hasPain && (
                    <p className="text-red-500 text-xs mt-1">
                      Og'riq: {selectedApp.anamnez.painLevel}/10
                    </p>
                  )}
                </div>
              )}

              {/* Specialist form */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-gray-700 text-xs">
                    <input
                      type="checkbox"
                      checked={uploadMode}
                      onChange={(e) => { setUploadMode(e.target.checked); setUploadedFile(null); }}
                      className="accent-purple-600"
                    />
                    Tayyor xulosani yuklayman
                  </label>
                  <span className="text-gray-400 text-xs">PDF/JPG/PNG/DOCX</span>
                </div>

                {uploadMode ? (
                  <label className="w-full border border-dashed border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-500 text-sm cursor-pointer">
                    <Download className="w-4 h-4 rotate-180" />
                    <span>{uploadedFile ? uploadedFile.name : 'Xulosa faylini tanlash'}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={(e) => handlePickFile(e.target.files?.[0] || null)}
                    />
                  </label>
                ) : (
                  <>
                    <div>
                      <label className="text-gray-600 text-xs mb-1 block">Topilmalar *</label>
                      <textarea
                        value={consultFindings}
                        onChange={e => setConsultFindings(e.target.value)}
                        placeholder="Radiologik topilmalar bo'yicha izohlash..."
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs mb-1 block">Xulosa (Impression) * (kamida 30 belgi)</label>
                      <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="text-purple-600 text-xs flex items-center gap-1 mb-1"
                      >
                        <Stethoscope className="w-3 h-3" />
                        Tez iboralar
                      </button>
                      {showTemplates && (
                        <div className="grid grid-cols-1 gap-1 mb-2">
                          {CONSULT_TEMPLATES.map((tmpl, i) => (
                            <button
                              key={i}
                              onClick={() => insertTemplate(tmpl)}
                              className="text-left text-xs bg-purple-50 rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-100"
                            >
                              {tmpl}
                            </button>
                          ))}
                        </div>
                      )}
                      <textarea
                        value={consultNote}
                        onChange={e => setConsultNote(e.target.value)}
                        placeholder="Konsultatsiya xulosasini yozing..."
                        rows={3}
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-100 ${
                          consultNote.length > 0 && consultNote.length < 30 ? 'border-red-200' : 'border-gray-200'
                        }`}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {consultNote.length > 0 && consultNote.length < 30 && (
                          <p className="text-red-500 text-xs">Kamida 30 ta belgi kiriting</p>
                        )}
                        <p className="text-gray-400 text-xs ml-auto">{consultNote.length} belgi</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-600 text-xs mb-1 block">Tavsiyalar</label>
                      <textarea
                        value={consultRecommendations}
                        onChange={e => setConsultRecommendations(e.target.value)}
                        placeholder="Qo'shimcha tekshiruvlar, muolajalar..."
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => handleSubmitConsult(selectedApp)}
                disabled={(uploadMode ? !uploadedFile : consultNote.length < 30) || submitting}
                className="w-full bg-purple-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Yuborilmoqda...</span></>
                ) : (
                  <><Send className="w-4 h-4" /><span>Mutaxassis Xulosasini Yuborish</span></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Application list */}
        <div className="space-y-3 pb-24">
          {tabApps.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Bu bo'limda so'rovlar yo'q</p>
            </div>
          ) : (
            tabApps.map((app, i) => {
              const status = getStatusLabel(app.status);
              const urgency = getUrgencyLabel(app.urgency);
              const isSubmitted = submitted.includes(app.id);
              const hasConclusions = (app.conclusions?.length || 0) > 0;
              const myConclusion = app.conclusions?.find(c => c.authorId === currentUser?.id && c.conclusionType === 'specialist');
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${
                    app.urgency === 'emergency' ? 'border-red-400' :
                    app.urgency === 'urgent' ? 'border-yellow-400' : 'border-purple-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-gray-900 text-sm">{app.patient?.fullName}</p>
                      <p className="text-gray-400 text-xs">{app.arizaNumber} • {formatDateTime(app.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-700 text-sm">{app.scanType}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 text-sm">{app.organ}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm">{urgency.icon} {urgency.label.split('(')[0]}</span>
                  </div>

                  {app.notes && activeTab === 0 && (
                    <div className="bg-purple-50 rounded-xl p-2.5 mb-3">
                      <p className="text-purple-600 text-xs">Radiolog izohi:</p>
                      <p className="text-gray-700 text-xs mt-0.5 line-clamp-2">{app.notes}</p>
                    </div>
                  )}

                  {/* Radiolog info */}
                  {app.radiolog && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs">
                        {app.radiolog.avatar}
                      </div>
                      <div>
                        <p className="text-gray-700 text-xs">Dr. {app.radiolog.fullName}</p>
                        <p className="text-gray-400 text-xs">{app.radiolog.specialty}</p>
                      </div>
                    </div>
                  )}

                  {/* Existing conclusions accordion */}
                  {hasConclusions && (
                    <div className="mb-3">
                      <button
                        onClick={() => toggleConclusions(app.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 mb-1"
                      >
                        <FileText className="w-3 h-3" />
                        {app.conclusions?.length} ta xulosa
                        {showExistingConclusions[app.id]
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {showExistingConclusions[app.id] && (
                        <div className="space-y-1.5">
                          {app.conclusions?.map(c => {
                            const typeInfo = getConclusionTypeLabel(c.conclusionType);
                            return (
                              <div key={c.id} className={`rounded-lg px-2.5 py-2 border-l-2 ${
                                c.conclusionType === 'ai_analysis' ? 'border-violet-400 bg-violet-50' :
                                c.conclusionType === 'radiolog' ? 'border-emerald-400 bg-emerald-50' :
                                c.conclusionType === 'specialist' ? 'border-purple-400 bg-purple-50' :
                                'border-blue-400 bg-blue-50'
                              }`}>
                                <p className="text-xs mb-0.5">
                                  <span className={typeInfo.color}>{typeInfo.icon} {typeInfo.label}</span>
                                  <span className="text-gray-400 ml-1 text-xs">— {c.authorName}</span>
                                </p>
                                <p className="text-gray-700 text-xs line-clamp-2">{c.impression}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* My existing conclusion */}
                  {myConclusion && (
                    <div className="bg-purple-50 rounded-xl p-2.5 mb-2 border border-purple-100">
                      <p className="text-purple-600 text-xs mb-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Mening xulosamni yubordim
                      </p>
                      <p className="text-gray-700 text-xs line-clamp-2">{myConclusion.impression}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {activeTab === 0 && (
                    <div className="flex gap-2">
                      {isSubmitted || myConclusion ? (
                        <div className="flex-1 flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-green-700 text-xs">Xulosa yuborildi</p>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => { setSelectedApp(app); setConsultNote(''); setConsultFindings(''); setConsultRecommendations(''); }}
                            className="flex-1 bg-purple-600 text-white rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Xulosa yozish</span>
                          </button>
                          <button
                            onClick={() => handleDownloadApp(app)}
                            disabled={!(app.conclusions?.length) || downloading === app.id}
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-xs disabled:opacity-40"
                          >
                            {downloading === app.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>Yuklab olish</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 2 && app.status === 'done' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-green-700 text-xs">Yakunlandi</p>
                      {app.rating && (
                        <div className="ml-auto flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= app.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      )}
                      {(app.conclusions?.length || 0) > 0 && (
                        <button
                          onClick={() => handleDownloadApp(app)}
                          className="ml-auto text-xs text-gray-500 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Yuklab olish
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Specialist info card */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-4 mb-24">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
              {currentUser?.avatar}
            </div>
            <div>
              <p className="text-white text-sm">{currentUser?.fullName}</p>
              <p className="text-purple-200 text-xs">{currentUser?.specialty}</p>
              <p className="text-purple-300 text-xs">{currentUser?.license}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Xulosa', value: currentUser?.totalConclusions || 0 },
              { label: 'Tajriba', value: `${currentUser?.experience} yil` },
              { label: 'Baho', value: `⭐ ${currentUser?.rating}` },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-white text-sm">{s.value}</p>
                <p className="text-purple-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}