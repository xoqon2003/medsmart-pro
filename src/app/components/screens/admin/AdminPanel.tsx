import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart2, Users, DollarSign, Settings, Bell, TrendingUp, Shield,
  User, ChevronRight, Activity, Database, Server, Clock, Star, AlertCircle, CheckCircle,
  ToggleLeft, ToggleRight, Search
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useApp } from '../../../store/appStore';
import { authService } from '../../../../services';
import { formatPrice } from '../../../data/mockData';
import type { User as UserType } from '../../../types';

const ADMIN_TABS = ['Ko\'rsatkichlar', 'Foydalanuvchilar', 'Moliya', 'Tizim'];

const revenueData = [
  { day: 'Du', amount: 450000 },
  { day: 'Se', amount: 680000 },
  { day: 'Ch', amount: 520000 },
  { day: 'Pa', amount: 890000 },
  { day: 'Ju', amount: 1200000 },
  { day: 'Sh', amount: 750000 },
  { day: 'Ya', amount: 430000 },
];

const serviceData = [
  { name: 'AI+Radiolog', value: 45, color: '#3b82f6' },
  { name: 'Radiolog', value: 35, color: '#10b981' },
  { name: 'Mutaxassis', value: 20, color: '#8b5cf6' },
];

const scanData = [
  { name: 'MRT', count: 42 },
  { name: 'MSKT', count: 28 },
  { name: 'Rentgen', count: 35 },
  { name: 'USG', count: 18 },
];

const PRICES = {
  ai_radiolog: 150000,
  radiolog_only: 200000,
  radiolog_specialist: 350000,
};

export function AdminPanel() {
  const { currentUser, applications, navigate, unreadCount } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [prices, setPrices] = useState(PRICES);
  const [userSearch, setUserSearch] = useState('');
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [userActiveMap, setUserActiveMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    authService.getUsers().then((users) => {
      setAllUsers(users);
      setUserActiveMap(Object.fromEntries(users.map((u) => [u.id, u.isActive])));
    });
  }, []);

  const toggleUserActive = (userId: number) => {
    setUserActiveMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const totalRevenue = applications.reduce((sum, a) => sum + (a.payment?.status === 'paid' ? a.price : 0), 0);
  const radiologList = allUsers.filter(u => u.role === 'radiolog');

  const systemHealth = [
    { name: 'Server', status: 'ishlaydi', color: 'bg-green-500', detail: 'Railway.app • 99.9%' },
    { name: "Ma'lumotlar bazasi", status: 'ishlaydi', color: 'bg-green-500', detail: 'PostgreSQL • 23ms' },
    { name: 'Fayl saqlash', status: 'ishlaydi', color: 'bg-green-500', detail: 'Backblaze B2' },
    { name: 'Payme', status: 'ishlaydi', color: 'bg-green-500', detail: 'API v2 • OK' },
    { name: 'Bot', status: 'ishlaydi', color: 'bg-green-500', detail: '@radconsult_bot' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 to-pink-800 pt-12 pb-8 px-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-rose-200 text-sm">Admin Panel</p>
            <h1 className="text-white text-xl">{currentUser?.fullName?.split(' ')[0]} ⚙️</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('notifications')} className="relative w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full text-gray-900 text-xs flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={() => navigate('profile')} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Bugungi daromad', value: formatPrice(totalRevenue), icon: DollarSign },
            { label: 'Jami arizalar', value: applications.length, icon: BarChart2 },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-3">
              <s.icon className="w-4 h-4 text-rose-300 mb-1" />
              <p className="text-white text-lg">{s.value}</p>
              <p className="text-rose-200 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 -mt-2">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-4">
          {ADMIN_TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-2 rounded-lg text-xs transition-all ${activeTab === i ? 'bg-rose-600 text-white' : 'text-gray-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 0: Dashboard */}
        {activeTab === 0 && (
          <div className="space-y-4 pb-24">
            {/* Revenue chart */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-700 text-sm mb-4">Haftalik daromad</p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v/1000)}k`} />
                  <Tooltip formatter={(v: any) => [formatPrice(v), 'Daromad']} />
                  <Area type="monotone" dataKey="amount" stroke="#f43f5e" fill="url(#revGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Service distribution */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-700 text-sm mb-4">Xizmat turlari</p>
              <div className="flex items-center gap-4">
                <PieChart width={120} height={120}>
                  <Pie data={serviceData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={2}>
                    {serviceData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="flex-1 space-y-2">
                  {serviceData.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-gray-600 text-xs">{s.name}</span>
                      </div>
                      <span className="text-gray-800 text-xs">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scan types */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-700 text-sm mb-4">Tasvir turlari bo'yicha</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={scanData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Arizalar" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "O'rtacha bajarilish vaqti", value: '18 soat', icon: Clock, color: 'bg-blue-50 text-blue-600' },
                { label: 'Radiolog o\'rtacha bahosi', value: '4.85 ⭐', icon: Star, color: 'bg-yellow-50 text-yellow-600' },
                { label: 'Qayta murojaatlar', value: '38%', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
                { label: 'Muammoli arizalar', value: applications.filter(a => a.status === 'extra_info_needed').length + '', icon: AlertCircle, color: 'bg-orange-50 text-orange-600' },
              ].map(kpi => (
                <div key={kpi.label} className={`${kpi.color} rounded-2xl p-3`}>
                  <kpi.icon className="w-4 h-4 mb-2 opacity-70" />
                  <p className="text-xl">{kpi.value}</p>
                  <p className="text-xs opacity-70 mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: Users */}
        {activeTab === 1 && (
          <div className="space-y-3 pb-24">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Foydalanuvchi qidirish..."
                className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm border border-gray-200 shadow-sm focus:outline-none"
              />
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Jami', value: allUsers.length, color: 'bg-gray-100 text-gray-700' },
                { label: 'Bemor', value: allUsers.filter(u => u.role === 'patient').length, color: 'bg-blue-100 text-blue-700' },
                { label: 'Radiolog', value: allUsers.filter(u => u.role === 'radiolog').length, color: 'bg-emerald-100 text-emerald-700' },
                { label: 'Faol', value: Object.values(userActiveMap).filter(Boolean).length, color: 'bg-green-100 text-green-700' },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-xl p-2 text-center`}>
                  <p className="text-lg">{s.value}</p>
                  <p className="text-xs opacity-70">{s.label}</p>
                </div>
              ))}
            </div>

            {allUsers
              .filter(u => !userSearch ||
                u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.phone.includes(userSearch) ||
                u.role.includes(userSearch.toLowerCase())
              )
              .map((user, i) => {
              const roleMap: Record<string, { label: string; bg: string; text: string }> = {
                admin: { label: 'Admin', bg: 'bg-rose-100', text: 'text-rose-700' },
                radiolog: { label: 'Radiolog', bg: 'bg-emerald-100', text: 'text-emerald-700' },
                operator: { label: 'Operator', bg: 'bg-violet-100', text: 'text-violet-700' },
                specialist: { label: 'Mutaxassis', bg: 'bg-purple-100', text: 'text-purple-700' },
                doctor: { label: 'Shifokor', bg: 'bg-sky-100', text: 'text-sky-700' },
                patient: { label: 'Bemor', bg: 'bg-blue-100', text: 'text-blue-700' },
              };
              const roleStyle = roleMap[user.role] || { label: user.role, bg: 'bg-gray-100', text: 'text-gray-700' };
              const isActive = userActiveMap[user.id] ?? user.isActive;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white rounded-2xl shadow-sm p-4 ${!isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm ${roleStyle.bg} ${roleStyle.text}`}>
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">{user.fullName}</p>
                      <p className="text-gray-400 text-xs">{user.phone} • {user.city}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${roleStyle.bg} ${roleStyle.text}`}>
                        {roleStyle.label}
                      </span>
                      {user.rating && <p className="text-yellow-500 text-xs">⭐ {user.rating}</p>}
                    </div>
                  </div>

                  {(user.role === 'radiolog' || user.role === 'specialist' || user.role === 'doctor') && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[
                        { label: 'Xulosa', value: user.totalConclusions || 0 },
                        { label: 'Tajriba', value: `${user.experience || 0} yil` },
                        { label: 'Litsenziya', value: user.license?.slice(-8) || '—' },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-lg p-1.5 text-center">
                          <p className="text-gray-800 text-xs">{s.value}</p>
                          <p className="text-gray-400 text-xs">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* User actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                    <p className="text-gray-400 text-xs">
                      {isActive ? '🟢 Faol' : '🔴 Bloklangan'}
                    </p>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleUserActive(user.id)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                          isActive
                            ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                            : 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {isActive ? 'Bloklash' : 'Aktivlashtirish'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Finance */}
        {activeTab === 2 && (
          <div className="space-y-4 pb-24">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4">
              <p className="text-white/70 text-sm">Jami daromad (bu oy)</p>
              <p className="text-white text-3xl mt-1">{formatPrice(totalRevenue * 7)}</p>
              <p className="text-white/60 text-xs mt-1">+18% o'tgan oyga nisbatan</p>
            </div>

            {/* Price settings */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-700 text-sm mb-3">Narxlar boshqarish</p>
              <div className="space-y-3">
                {[
                  { key: 'ai_radiolog', label: 'AI + Radiolog' },
                  { key: 'radiolog_only', label: 'Faqat Radiolog' },
                  { key: 'radiolog_specialist', label: 'Radiolog + Mutaxassis' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <p className="text-gray-600 text-sm">{item.label}</p>
                    <div className="flex items-center gap-2">
                      {editingPrice === item.key ? (
                        <input
                          type="number"
                          value={prices[item.key as keyof typeof prices]}
                          onChange={e => setPrices(prev => ({ ...prev, [item.key]: Number(e.target.value) }))}
                          className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm text-right"
                          onBlur={() => setEditingPrice(null)}
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-800 text-sm">{formatPrice(prices[item.key as keyof typeof prices])}</span>
                      )}
                      <button
                        onClick={() => setEditingPrice(editingPrice === item.key ? null : item.key)}
                        className="text-xs text-blue-600 border border-blue-100 rounded-lg px-2 py-1"
                      >
                        {editingPrice === item.key ? 'Saqlash' : 'O\'zgartirish'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment log */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-700 text-sm mb-3">So'nggi to'lovlar</p>
              <div className="space-y-2.5">
                {applications.filter(a => a.payment).slice(0, 5).map(app => (
                  <div key={app.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 text-xs">{app.arizaNumber}</p>
                      <p className="text-gray-400 text-xs">{app.patient?.fullName} • {app.payment?.provider?.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 text-sm">{formatPrice(app.price)}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${app.payment?.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {app.payment?.status === 'paid' ? "To'langan" : 'Kutilmoqda'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: System */}
        {activeTab === 3 && (
          <div className="space-y-4 pb-24">
            {/* Health check */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-700 text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                Tizim holati
              </p>
              <div className="space-y-2.5">
                {systemHealth.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${item.color} rounded-full animate-pulse`} />
                      <p className="text-gray-700 text-sm">{item.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400 text-xs">{item.detail}</p>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-gray-700 text-sm mb-3">Tizim sozlamalari</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Xabar shablonlari', desc: 'Bildirishnoma matnlarini tahrirlash', icon: Bell },
                  { label: 'Muddatlar', desc: 'Bajarish muddatlarini o\'rnatish', icon: Clock },
                  { label: 'Audit jurnali', desc: 'Barcha amallar tarixi', icon: Shield },
                  { label: "Zaxira nusxa", desc: "Ma'lumotlar bazasi backupi", icon: Database },
                ].map(item => (
                  <button key={item.label} className="w-full flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-gray-800 text-sm">{item.label}</p>
                        <p className="text-gray-400 text-xs">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}