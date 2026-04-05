import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell, User, Clock, CheckCircle, ChevronRight,
  BarChart2, Star, Award, Target, Calendar
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useApp } from '../../../store/appStore';
import { getStatusLabel, getUrgencyLabel, formatDateTime } from '../../../utils/formatters';
import type { Application } from '../../../types';

const TABS = ['Yangi', 'Jarayonda', 'Bajarildi', 'Statistika'];

// Mocked weekly performance data
const weeklyData = [
  { day: 'Du', done: 4, urgent: 1 },
  { day: 'Se', done: 6, urgent: 2 },
  { day: 'Ch', done: 3, urgent: 0 },
  { day: 'Pa', done: 8, urgent: 3 },
  { day: 'Ju', done: 5, urgent: 1 },
  { day: 'Sh', done: 7, urgent: 2 },
  { day: 'Ya', done: 2, urgent: 0 },
];

const scanTypeData = [
  { name: 'MRT', count: 48, color: '#3b82f6' },
  { name: 'MSKT', count: 31, color: '#8b5cf6' },
  { name: 'Rentgen', count: 42, color: '#10b981' },
  { name: 'USG', count: 19, color: '#f59e0b' },
];

export function RadiologDashboard() {
  const { currentUser, applications, navigate, setSelectedApplication, unreadCount } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'emergency'>('all');

  const queue = applications.filter(a =>
    (activeTab === 0 && ['paid_pending', 'new'].includes(a.status)) ||
    (activeTab === 1 && ['accepted', 'conclusion_writing', 'extra_info_needed', 'with_specialist'].includes(a.status)) ||
    (activeTab === 2 && ['done', 'archived'].includes(a.status))
  );

  const filtered = filter === 'all' ? queue : queue.filter(a => a.urgency === filter);

  const sorted = [...filtered].sort((a, b) => {
    const urgencyOrder = { emergency: 0, urgent: 1, normal: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  const stats = {
    pending: applications.filter(a => ['paid_pending', 'new'].includes(a.status)).length,
    inProgress: applications.filter(a => ['accepted', 'conclusion_writing'].includes(a.status)).length,
    doneToday: applications.filter(a => a.status === 'done').length,
    emergency: applications.filter(a => a.urgency === 'emergency' && a.status !== 'done').length,
  };

  const handleView = (app: Application) => {
    setSelectedApplication(app);
    navigate('radiolog_view');
  };

  // ---- STATISTICS TAB ----
  const StatisticsTab = () => {
    const totalDone = currentUser?.totalConclusions || 1247;
    const avgTime = 14.5; // hours
    const completionRate = 98.2;
    const rating = currentUser?.rating || 4.9;

    return (
      <div className="space-y-4 pb-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Jami xulosalar",
              value: totalDone.toLocaleString(),
              icon: Award,
              color: 'bg-emerald-50',
              iconColor: 'text-emerald-600',
              textColor: 'text-emerald-700',
            },
            {
              label: "O'rtacha vaqt",
              value: `${avgTime}s`,
              icon: Clock,
              color: 'bg-blue-50',
              iconColor: 'text-blue-600',
              textColor: 'text-blue-700',
            },
            {
              label: "Bajarish darajasi",
              value: `${completionRate}%`,
              icon: Target,
              color: 'bg-violet-50',
              iconColor: 'text-violet-600',
              textColor: 'text-violet-700',
            },
            {
              label: "Reyting",
              value: `⭐ ${rating}`,
              icon: Star,
              color: 'bg-amber-50',
              iconColor: 'text-amber-600',
              textColor: 'text-amber-700',
            },
          ].map(kpi => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${kpi.color} rounded-2xl p-4`}
            >
              <kpi.icon className={`w-5 h-5 ${kpi.iconColor} mb-2`} />
              <p className={`text-2xl ${kpi.textColor}`}>{kpi.value}</p>
              <p className={`text-xs ${kpi.textColor} opacity-70 mt-0.5`}>{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-700 text-sm">Haftalik faollik</p>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-gray-500">Bajarildi</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="text-gray-500">Shoshilinch</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={weeklyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
                cursor={{ fill: 'rgba(16,185,129,0.04)' }}
              />
              <Bar dataKey="done" name="Bajarildi" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="urgent" name="Shoshilinch" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scan type breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">Tasvir turlari bo'yicha</p>
          <div className="space-y-2.5">
            {scanTypeData.map(d => {
              const pct = Math.round((d.count / scanTypeData.reduce((s, x) => s + x.count, 0)) * 100);
              return (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600 text-xs">{d.name}</span>
                    <span className="text-gray-700 text-xs">{d.count} ta ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white text-lg">
              {currentUser?.avatar}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">{currentUser?.fullName}</p>
              <p className="text-emerald-200 text-xs">{currentUser?.specialty}</p>
              <p className="text-emerald-300 text-xs">{currentUser?.license}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Tajriba', value: `${currentUser?.experience} yil` },
              { label: 'Xulosa', value: totalDone.toLocaleString() },
              { label: 'Baho', value: `${rating} ⭐` },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-white text-sm">{s.value}</p>
                <p className="text-emerald-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <p className="text-gray-700 text-sm">So'nggi xulosa berilgan arizalar</p>
          </div>
          {applications.filter(a => a.status === 'done').slice(0, 4).map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0"
            >
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-xs truncate">{app.patient?.fullName}</p>
                <p className="text-gray-400 text-xs">{app.scanType} • {app.organ}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-gray-400 text-xs">{app.arizaNumber.slice(-6)}</p>
                {app.rating && (
                  <div className="flex items-center gap-0.5 justify-end mt-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-2.5 h-2.5 ${s <= app.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {applications.filter(a => a.status === 'done').length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Hali bajarilgan arizalar yo'q</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 pt-12 pb-20 px-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-emerald-200 text-sm">Xush kelibsiz,</p>
            <h1 className="text-white text-xl">Dr. {currentUser?.fullName?.split(' ')[0]} 👨‍⚕️</h1>
            <p className="text-emerald-300 text-xs mt-0.5">{currentUser?.license}</p>
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

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Navbatda', value: stats.pending, color: 'bg-white/10', textColor: 'text-white' },
            { label: 'Jarayonda', value: stats.inProgress, color: 'bg-yellow-500/20', textColor: 'text-yellow-200' },
            { label: 'Bajarildi', value: stats.doneToday, color: 'bg-green-500/20', textColor: 'text-green-200' },
            { label: '🔴 Shoshilinch', value: stats.emergency, color: 'bg-red-500/20', textColor: 'text-red-200' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-2.5 text-center`}>
              <p className={`text-2xl ${s.textColor}`}>{s.value}</p>
              <p className="text-white/50 text-xs leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 -mt-10">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-4">
          {TABS.map((tab, i) => {
            const counts = [stats.pending, stats.inProgress, stats.doneToday, null];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 ${
                  activeTab === i ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500'
                }`}
              >
                {i === 3 ? <BarChart2 className="w-3 h-3" /> : null}
                {tab}
                {counts[i] !== null && counts[i]! > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === i ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
                    {counts[i]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Statistics Tab */}
        {activeTab === 3 ? (
          <StatisticsTab />
        ) : (
          <>
            {/* Filter */}
            <div className="flex gap-2 mb-4">
              {(['all', 'emergency', 'urgent'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    filter === f
                      ? f === 'emergency' ? 'bg-red-100 border-red-300 text-red-700'
                        : f === 'urgent' ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                        : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  {f === 'all' ? 'Barchasi' : f === 'emergency' ? '🔴 Shoshilinch' : '🟡 Tezkor'}
                </button>
              ))}
            </div>

            {/* Application cards */}
            <div className="space-y-3 pb-8">
              {sorted.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Bu bo'limda arizalar yo'q</p>
                </div>
              ) : (
                sorted.map((app, i) => {
                  const status = getStatusLabel(app.status);
                  const urgency = getUrgencyLabel(app.urgency);
                  const isEmergency = app.urgency === 'emergency';
                  return (
                    <motion.button
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleView(app)}
                      className={`w-full bg-white rounded-2xl shadow-sm p-4 text-left border-l-4 ${
                        isEmergency ? 'border-red-400' : app.urgency === 'urgent' ? 'border-yellow-400' : 'border-gray-100'
                      }`}
                    >
                      {isEmergency && (
                        <div className="flex items-center gap-1 mb-2 bg-red-50 rounded-lg px-2 py-1">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          <p className="text-red-600 text-xs">SHOSHILINCH</p>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-gray-900 text-sm">{app.patient?.fullName}</p>
                          <p className="text-gray-400 text-xs">{app.arizaNumber}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-700 text-sm">{app.scanType}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 text-sm">{app.organ}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">{urgency.icon} {urgency.label.split('(')[1]?.replace(')', '') || urgency.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{formatDateTime(app.createdAt)}</span>
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}