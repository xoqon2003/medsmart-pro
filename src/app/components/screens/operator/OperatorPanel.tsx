import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, User, Search, MessageCircle, RotateCcw, CheckCircle,
  AlertCircle, Clock, ChevronRight, DollarSign, FileText, X, Send, Download, Eye
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { getStatusLabel, getUrgencyLabel, formatDateTime, formatPrice } from '../../../data/mockData';
import { downloadConclusionReport } from '../../../utils/pdfGenerator';
import type { Application } from '../../../types';

const TABS = ['Barcha', "Muammo", "To'lanmagan", 'Bajarildi'];

export function OperatorPanel() {
  const { currentUser, applications, navigate, updateApplicationStatus, updateApplication, addNotification, unreadCount } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [refunding, setRefunding] = useState<number | null>(null);
  const [refunded, setRefunded] = useState<number[]>([]);
  const [confirmRefund, setConfirmRefund] = useState<Application | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  const filtered = applications.filter(app => {
    const matchTab =
      activeTab === 0 ||
      (activeTab === 1 && (app.status === 'extra_info_needed' || app.status === 'new')) ||
      (activeTab === 2 && app.payment?.status === 'pending') ||
      (activeTab === 3 && app.status === 'done');

    const matchSearch = !search ||
      app.arizaNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.patient?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      app.patient?.phone?.includes(search);

    return matchTab && matchSearch;
  });

  const stats = {
    today: applications.length,
    problems: applications.filter(a => a.status === 'extra_info_needed' || a.status === 'new').length,
    unpaid: applications.filter(a => a.payment?.status === 'pending').length,
    done: applications.filter(a => a.status === 'done').length,
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedApp) return;
    updateApplicationStatus(selectedApp.id, 'extra_info_needed', message);
    addNotification({
      userId: selectedApp.patientId,
      title: "Operator xabari",
      message: `${selectedApp.arizaNumber}: ${message}`,
      type: 'warning',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: selectedApp.id,
    });
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setMessage('');
      setSelectedApp(null);
    }, 2000);
  };

  const handleRefundConfirm = async () => {
    if (!confirmRefund) return;
    const appId = confirmRefund.id;
    setRefunding(appId);
    await new Promise(r => setTimeout(r, 1800));
    updateApplicationStatus(appId, 'failed');
    updateApplication(appId, {
      payment: confirmRefund.payment
        ? { ...confirmRefund.payment, status: 'refunded' }
        : undefined,
    });
    addNotification({
      userId: confirmRefund.patientId,
      title: "To'lov qaytarildi",
      message: `${confirmRefund.arizaNumber} uchun ${formatPrice(confirmRefund.price)} to'lov 3-5 ish kunida qaytariladi.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: confirmRefund.id,
    });
    setRefunded(prev => [...prev, appId]);
    setRefunding(null);
    setConfirmRefund(null);
  };

  const handleAssign = (appId: number) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    const radiologUser = {
      id: 2, fullName: 'Yusupov Jasur Hamidovich', avatar: 'YJ',
      license: 'UZ-RAD-2023-0042', specialty: 'MRT, MSKT, Rentgenologiya',
      rating: 4.9, totalConclusions: 1247, role: 'radiolog' as const,
      telegramId: 987654321, username: 'dr_yusupov', phone: '+998901111111',
      birthDate: '1985-03-20', gender: 'male' as const, city: 'Toshkent',
      language: 'uz' as const, isActive: true, createdAt: '2023-06-01', experience: 20
    };
    updateApplication(appId, {
      status: 'accepted',
      radiologId: 2,
      radiolog: radiologUser,
      acceptedAt: new Date().toISOString(),
    });
    addNotification({
      userId: app.patientId,
      title: 'Radiolog biriktirildi ✅',
      message: `${app.arizaNumber} arizangiz Dr. Yusupov Jasur Hamidovichga biriktirildi.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: appId,
    });
    addNotification({
      userId: 2,
      title: 'Yangi ariza biriktirildi',
      message: `${app.arizaNumber}: ${app.scanType} ${app.organ} — operator tomonidan biriktirildi.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      applicationId: appId,
    });
  };

  const handleDownload = async (app: Application) => {
    if (!app.conclusions?.length) return;
    setDownloading(app.id);
    try {
      downloadConclusionReport(app);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Refund confirm modal */}
      <AnimatePresence>
        {confirmRefund && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-gray-900 text-center mb-1">To'lovni qaytarishni tasdiqlang</h3>
              <p className="text-gray-500 text-sm text-center mb-2">{confirmRefund.arizaNumber}</p>
              <p className="text-red-600 text-center mb-4">{formatPrice(confirmRefund.price)}</p>
              <p className="text-gray-500 text-xs text-center mb-4">
                Bu amalni ortga qaytarib bo'lmaydi. Ariza "Bekor qilindi" holatiga o'tadi va bemor to'lovi qaytariladi.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmRefund(null)}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleRefundConfirm}
                  disabled={refunding === confirmRefund.id}
                  className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {refunding === confirmRefund.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Tasdiqlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900 to-purple-800 pt-12 pb-20 px-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-violet-200 text-sm">Operator paneli</p>
            <h1 className="text-white text-xl">{currentUser?.fullName?.split(' ')[0]} 👨‍💼</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('notifications')} className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={() => navigate('profile')} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Jami', value: stats.today, color: 'bg-white/10' },
            { label: 'Muammo', value: stats.problems, color: 'bg-orange-500/20' },
            { label: "To'lanmagan", value: stats.unpaid, color: 'bg-yellow-500/20' },
            { label: 'Bajarildi', value: stats.done, color: 'bg-green-500/20' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-2.5 text-center`}>
              <p className="text-white text-xl">{s.value}</p>
              <p className="text-white/50 text-xs leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 -mt-10">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ariza raqami, bemor ismi, telefon..."
            className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-4">
          {TABS.map((tab, i) => {
            const counts = [applications.length, stats.problems, stats.unpaid, stats.done];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2 rounded-lg text-xs transition-all ${activeTab === i ? 'bg-violet-600 text-white' : 'text-gray-500'}`}
              >
                {tab}
                {counts[i] > 0 && <span className={`ml-1 text-xs ${activeTab === i ? 'opacity-70' : 'text-gray-400'}`}>({counts[i]})</span>}
              </button>
            );
          })}
        </div>

        {/* Message modal */}
        <AnimatePresence>
          {selectedApp && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-violet-100"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-700 text-sm">📩 {selectedApp.patient?.fullName}ga xabar</p>
                <button onClick={() => { setSelectedApp(null); setMessage(''); setMessageSent(false); }}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-gray-400 text-xs mb-2">{selectedApp.arizaNumber}</p>
              {messageSent ? (
                <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-green-700 text-sm">Xabar yuborildi! ✅</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {[
                      "Tasvir sifati past. Yangi tasvirlar yuboring.",
                      "DICOM format kerak. Boshqa formatlar qabul qilinmaydi.",
                      "To'liq bemor ma'lumotlari taqdim qiling.",
                      "Anamnez to'liq to'ldirilmagan.",
                    ].map(tmpl => (
                      <button
                        key={tmpl}
                        onClick={() => setMessage(tmpl)}
                        className="text-left text-xs bg-violet-50 rounded-lg px-2 py-1.5 text-gray-700 hover:bg-violet-100 line-clamp-2"
                      >
                        {tmpl}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Bemorga xabarni yozing..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-100 mb-2"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="w-full bg-violet-600 text-white rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>Yuborish</span>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Applications list */}
        <div className="space-y-3 pb-24">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Arizalar topilmadi</p>
            </div>
          ) : (
            filtered.map((app, i) => {
              const status = getStatusLabel(app.status);
              const urgency = getUrgencyLabel(app.urgency);
              const isRefunded = refunded.includes(app.id) || app.payment?.status === 'refunded';
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white rounded-2xl shadow-sm p-4 border-l-4 ${
                    app.urgency === 'emergency' ? 'border-red-400' :
                    app.status === 'extra_info_needed' ? 'border-orange-400' :
                    app.status === 'new' ? 'border-blue-400' :
                    app.status === 'done' ? 'border-green-400' : 'border-violet-200'
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
                    <span className="text-gray-600 text-sm">{app.scanType} • {app.organ}</span>
                    <span className="text-sm">{urgency.icon}</span>
                    <span className="ml-auto text-blue-600 text-sm">{formatPrice(app.price)}</span>
                  </div>

                  {/* Payment status */}
                  <div className={`flex items-center gap-1.5 text-xs mb-3 px-2 py-1.5 rounded-lg ${
                    isRefunded ? 'bg-gray-100 text-gray-600' :
                    app.payment?.status === 'paid' ? 'bg-green-50 text-green-700' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>
                    <DollarSign className="w-3 h-3" />
                    <span>
                      To'lov: {
                        isRefunded ? 'Qaytarildi' :
                        app.payment?.status === 'paid' ? "To'langan ✓" :
                        "To'lanmagan"
                      }
                    </span>
                    {app.payment?.provider && (
                      <span className="ml-auto text-gray-400 uppercase">{app.payment.provider}</span>
                    )}
                  </div>

                  {/* Extra info needed */}
                  {app.status === 'extra_info_needed' && app.notes && (
                    <div className="bg-orange-50 rounded-xl p-2.5 mb-3 border border-orange-100">
                      <p className="text-orange-600 text-xs">📋 {app.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => { setSelectedApp(app); setMessage(''); setMessageSent(false); }}
                      className="flex-1 py-2 bg-violet-50 text-violet-700 rounded-xl flex items-center justify-center gap-1 text-xs border border-violet-100"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Xabar</span>
                    </button>

                    {(app.status === 'paid_pending' || app.status === 'new') && !app.radiologId && (
                      <button
                        onClick={() => handleAssign(app.id)}
                        className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center gap-1 text-xs border border-blue-100"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Biriktirish</span>
                      </button>
                    )}

                    {app.payment?.status === 'paid' && !['done', 'failed'].includes(app.status) && !isRefunded && (
                      <button
                        onClick={() => setConfirmRefund(app)}
                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl flex items-center justify-center gap-1 text-xs border border-red-100"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Qaytarish</span>
                      </button>
                    )}

                    {app.status === 'done' && (app.conclusions?.length || 0) > 0 && (
                      <button
                        onClick={() => handleDownload(app)}
                        disabled={downloading === app.id}
                        className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center gap-1 text-xs border border-emerald-100"
                      >
                        {downloading === app.id ? (
                          <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>Xulosa</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}