import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, FileText, Clock, CheckCircle, AlertCircle, ChevronRight, Bell, User, Star, Download, LayoutGrid, List } from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { getStatusLabel, getUrgencyLabel, formatDateTime, formatPrice } from '../../../utils/formatters';
import { downloadConclusionReport } from '../../../utils/pdfGenerator';
import { PatientApplicationsTable } from './PatientApplicationsTable';
import type { ViewMode } from '../../../types';

export function PatientHome() {
  const { currentUser, applications, navigate, setSelectedApplication, unreadCount, openServiceSheet } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'done'>('active');
  const [downloading, setDownloading] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    (localStorage.getItem('patientViewMode') as ViewMode) || 'card'
  );

  useEffect(() => {
    localStorage.setItem('patientViewMode', viewMode);
  }, [viewMode]);

  const myApps = applications.filter(a => a.patientId === currentUser?.id);
  const activeApps = myApps
    .filter(a => !['done', 'archived', 'failed'].includes(a.status))
    .sort((a, b) => (a.status === 'booked' ? -1 : b.status === 'booked' ? 1 : 0));
  const doneApps = myApps.filter(a => ['done', 'archived', 'failed'].includes(a.status));

  const displayApps = activeTab === 'active' ? activeApps : doneApps;

  const stats = {
    total: myApps.length,
    active: activeApps.length,
    done: doneApps.filter(a => a.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-20 px-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-200 text-sm">Salom,</p>
            <h1 className="text-white text-xl">{currentUser?.fullName?.split(' ')[0]} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
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
            <button
              onClick={() => navigate('profile')}
              className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            >
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Jami', value: stats.total, icon: FileText, color: 'bg-white/10' },
            { label: 'Faol', value: stats.active, icon: Clock, color: 'bg-yellow-500/20' },
            { label: 'Bajarildi', value: stats.done, icon: CheckCircle, color: 'bg-green-500/20' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-3`}>
              <s.icon className="w-4 h-4 text-white/70 mb-1" />
              <p className="text-white text-xl">{s.value}</p>
              <p className="text-white/60 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 -mt-10">
        {/* New application button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (!currentUser) { navigate('role_select'); return; }
            openServiceSheet();
          }}
          className="w-full bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4 mb-5"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-gray-900 text-sm">Yangi ariza berish</p>
            <p className="text-gray-400 text-xs">MRT, MSKT, Rentgen, USG tahlillari</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </motion.button>

        {/* Tabs + View Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm flex-1">
            {[
              { id: 'active', label: 'Faol arizalar', count: activeApps.length },
              { id: 'done', label: 'Tarix', count: doneApps.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex bg-white rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'card' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Card ko'rinishi"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Jadval ko'rinishi"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Applications list */}
        <div className="space-y-3 pb-24">
          {displayApps.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                {activeTab === 'active' ? 'Faol arizalar yo\'q' : 'Tugallangan arizalar yo\'q'}
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <PatientApplicationsTable
              applications={displayApps}
              onSelect={(app) => { setSelectedApplication(app); navigate('patient_status'); }}
              onDownload={(app) => {
                setDownloading(app.id);
                downloadConclusionReport(app);
                setTimeout(() => setDownloading(null), 1000);
              }}
              downloadingId={downloading}
            />
          ) : (
            displayApps.map((app, i) => {
              const status = getStatusLabel(app.status);
              const urgency = getUrgencyLabel(app.urgency);
              const hasConcluison = (app.conclusions?.length || 0) > 0 && app.status === 'done';
              return (
                <div key={app.id} className="relative">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => { setSelectedApplication(app); navigate('patient_status'); }}
                    className="w-full bg-white rounded-2xl shadow-sm p-4 text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-900 text-sm">{app.arizaNumber}</p>
                        <p className="text-gray-400 text-xs">{formatDateTime(app.createdAt)}</p>
                      </div>
                      {app.status === 'booked' ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-teal-600 text-white font-medium flex items-center gap-1">
                          Davom etish <ChevronRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-700 text-sm">{app.scanType}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500 text-sm">{app.organ}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm">{urgency.icon} {urgency.label.split('(')[0]}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 text-sm">{formatPrice(app.price)}</span>
                      <div className="flex items-center gap-2">
                        {app.status === 'done' && app.rating && (
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= app.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        )}
                        {app.status === 'extra_info_needed' && (
                          <div className="flex items-center gap-1 text-orange-500">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-xs">Javob kerak</span>
                          </div>
                        )}
                        {hasConcluison && (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {app.conclusions?.length} xulosa
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>

                    {/* Quick download for done apps */}
                    {hasConcluison && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setDownloading(app.id);
                          downloadConclusionReport(app);
                          setTimeout(() => setDownloading(null), 1000);
                        }}
                        disabled={downloading === app.id}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-xl py-2 text-xs border border-emerald-100"
                      >
                        {downloading === app.id ? (
                          <div className="w-3 h-3 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>Xulosani yuklab olish</span>
                      </button>
                    )}
                  </motion.button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}