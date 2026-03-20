/**
 * WebXabarlarScreen — Real-time bildirishnomalar markazi
 * Kategoriyalar: Arizalar · To'lovlar · Xulosalar · Tizim · Shoshilinch
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, BellOff, Search, Filter, Check, CheckCheck,
  FileText, CreditCard, ClipboardCheck, AlertTriangle,
  Settings, ChevronRight, MoreHorizontal, Trash2,
  Clock, User, ArrowRight, RefreshCw, Volume2, VolumeX,
  MessageSquare, Activity, Eye, Send, X, Zap,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';

// ── Types ────────────────────────────────────────────────────────────────────

type NotifCategory = 'all' | 'ariza' | 'tolov' | 'xulosa' | 'tizim' | 'shoshilinch';
type NotifPriority = 'low' | 'medium' | 'high' | 'urgent';

interface NotifItem {
  id: number;
  category: Exclude<NotifCategory, 'all'>;
  priority: NotifPriority;
  title: string;
  body: string;
  meta?: string;           // ariza raqami, summa, etc.
  actor?: string;          // kim amalga oshirdi
  actorRole?: string;
  time: string;            // ISO
  isRead: boolean;
  isArchived: boolean;
  actionLabel?: string;
  actionScreen?: string;
  relatedId?: number;
  tags?: string[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const NOW = new Date('2026-03-20T10:30:00');

function minsAgo(m: number) {
  return new Date(NOW.getTime() - m * 60000).toISOString();
}
function hoursAgo(h: number) {
  return new Date(NOW.getTime() - h * 3600000).toISOString();
}
function daysAgo(d: number) {
  return new Date(NOW.getTime() - d * 86400000).toISOString();
}

const MOCK_NOTIFS: NotifItem[] = [
  // SHOSHILINCH
  {
    id: 1, category: 'shoshilinch', priority: 'urgent',
    title: 'Shoshilinch ariza tushdi!',
    body: "Karimov Aziz Baxtiyorovich — MRT · Bosh · 🔴 Favqulodda. Darhol ko'rib chiqish talab etiladi.",
    meta: 'RAD-2026-000051',
    actor: 'Operator: Nazarova G.', actorRole: 'operator',
    time: minsAgo(3), isRead: false, isArchived: false,
    actionLabel: "Ko'rish", tags: ['MRT', 'Favqulodda'],
  },
  {
    id: 2, category: 'shoshilinch', priority: 'urgent',
    title: "To'lov muddati o'tdi",
    body: "Hasanov Sardor — RAD-2026-000049 — 450 000 so'm to'lov 24 soatdan ortiq kutilmoqda.",
    meta: '450 000 so\'m',
    actor: 'Tizim', actorRole: 'system',
    time: minsAgo(18), isRead: false, isArchived: false,
    actionLabel: 'Eslatma yuborish', tags: ['To\'lov'],
  },

  // ARIZALAR (bugun)
  {
    id: 3, category: 'ariza', priority: 'high',
    title: "Yangi ariza qabul qilindi",
    body: "Toshmatova Dilnoza Yusupovna — MSKT · Ko'krak qafasi · 🟡 Tezkor.",
    meta: 'RAD-2026-000050',
    actor: 'Operator: Karimov A.', actorRole: 'operator',
    time: minsAgo(12), isRead: false, isArchived: false,
    actionLabel: 'Tayinlash', tags: ['MSKT', 'Tezkor'],
  },
  {
    id: 4, category: 'ariza', priority: 'medium',
    title: "Ariza holati o'zgardi",
    body: "RAD-2026-000048 — Xulosa yozilmoqda holatiga o'tkazildi.",
    meta: 'RAD-2026-000048',
    actor: 'Dr. Yusupov O.', actorRole: 'radiolog',
    time: minsAgo(35), isRead: false, isArchived: false,
    actionLabel: 'Kuzatish', tags: ['Holat'],
  },
  {
    id: 5, category: 'ariza', priority: 'low',
    title: "Qo'shimcha ma'lumot kerak",
    body: "RAD-2026-000045 — Bemor eski tasvir fayllarini yuklashi kerak. Xabar yuborildi.",
    meta: 'RAD-2026-000045',
    actor: 'Dr. Mirzayev B.', actorRole: 'radiolog',
    time: hoursAgo(2), isRead: true, isArchived: false,
    actionLabel: 'Ariza', tags: ['Fayl', 'Ma\'lumot'],
  },
  {
    id: 6, category: 'ariza', priority: 'medium',
    title: "Mutaxassisga yo'llanma",
    body: "RAD-2026-000044 radiolog xulosasidan keyin kardiolog konsultatsiyasi tavsiya etildi.",
    meta: 'RAD-2026-000044',
    actor: 'Dr. Raximov N.', actorRole: 'radiolog',
    time: hoursAgo(4), isRead: true, isArchived: false,
    actionLabel: 'Tayinlash', tags: ['Konsultatsiya'],
  },

  // TO'LOVLAR
  {
    id: 7, category: 'tolov', priority: 'medium',
    title: "To'lov qabul qilindi — Payme",
    body: "Nazarova Nigora Shamsiyevna — 200 000 so'm — RAD-2026-000041 — Payme orqali.",
    meta: '200 000 so\'m',
    actor: 'Payme Gateway', actorRole: 'system',
    time: minsAgo(45), isRead: false, isArchived: false,
    actionLabel: 'Chek', tags: ['Payme', 'To\'liq'],
  },
  {
    id: 8, category: 'tolov', priority: 'medium',
    title: "To'lov qabul qilindi — Naqd",
    body: "Karimov Aziz — 225 000 so'm — RAD-2026-000042 — Kassada naqd to'landi.",
    meta: '225 000 so\'m',
    actor: 'Kassir: Ismoilova S.', actorRole: 'kassir',
    time: hoursAgo(1), isRead: true, isArchived: false,
    actionLabel: 'Chek', tags: ['Naqd'],
  },
  {
    id: 9, category: 'tolov', priority: 'low',
    title: "Qaytim amalga oshirildi",
    body: "Sobirov Jasur — 150 000 so'm qaytim — Bekor qilingan ariza RAD-2026-000039.",
    meta: '150 000 so\'m qaytim',
    actor: 'Admin: Rahimov K.', actorRole: 'admin',
    time: hoursAgo(6), isRead: true, isArchived: false,
    actionLabel: 'Chek', tags: ['Qaytim'],
  },

  // XULOSALAR
  {
    id: 10, category: 'xulosa', priority: 'high',
    title: "Xulosa tayyorlandi",
    body: "RAD-2026-000042 — MRT Bosh — Karimov Aziz. Dr. Mirzayev B. tomonidan imzolandi.",
    meta: 'RAD-2026-000042',
    actor: 'Dr. Mirzayev B.', actorRole: 'radiolog',
    time: minsAgo(28), isRead: false, isArchived: false,
    actionLabel: "Ko'rish", tags: ['MRT', 'Imzolandi'],
  },
  {
    id: 11, category: 'xulosa', priority: 'medium',
    title: 'Mutaxassis xulosasi yuborildi',
    body: "RAD-2026-000038 — USG Qorin — Hasanov Sardor. Kardiolog xulosasi qo'shildi.",
    meta: 'RAD-2026-000038',
    actor: 'Dr. Toshqo\'ziyev A.', actorRole: 'specialist',
    time: hoursAgo(3), isRead: true, isArchived: false,
    actionLabel: "Ko'rish", tags: ['USG', 'Mutaxassis'],
  },
  {
    id: 12, category: 'xulosa', priority: 'low',
    title: 'Xulosa PDF yuborildi',
    body: "RAD-2026-000041 — Nazarova Nigora. PDF bemor Telegram manziliga yuborildi.",
    meta: 'RAD-2026-000041',
    actor: 'Bot: @MedExpertBot', actorRole: 'system',
    time: hoursAgo(3.5), isRead: true, isArchived: false,
    actionLabel: 'PDF', tags: ['PDF', 'Yuborildi'],
  },

  // TIZIM
  {
    id: 13, category: 'tizim', priority: 'medium',
    title: 'Yangi foydalanuvchi qo\'shildi',
    body: "Shifokor: Rустамов Отабек Фарруховч лаундед бўлди. Rол: Radiolog. Aktivatsiya kutilmoqda.",
    meta: 'ID-0024',
    actor: 'Superadmin', actorRole: 'admin',
    time: hoursAgo(2), isRead: true, isArchived: false,
    actionLabel: 'Profil', tags: ['Foydalanuvchi'],
  },
  {
    id: 14, category: 'tizim', priority: 'low',
    title: "Zaxira nusxa yaratildi",
    body: "Tizimning avtomatik zaxira nusxasi muvaffaqiyatli yaratildi. Hajm: 2.4 GB.",
    meta: '2.4 GB',
    actor: 'Tizim', actorRole: 'system',
    time: daysAgo(1), isRead: true, isArchived: false,
    tags: ['Zaxira', 'Auto'],
  },
  {
    id: 15, category: 'tizim', priority: 'medium',
    title: "Tizim yangilandi",
    body: "MedExpert v2.1.0 muvaffaqiyatli o'rnatildi. Yangi: AI xulosa tahlili, Payme v3.",
    meta: 'v2.1.0',
    actor: 'DevOps', actorRole: 'system',
    time: daysAgo(2), isRead: true, isArchived: false,
    tags: ['Yangilanish'],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<Exclude<NotifCategory, 'all'>, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  shoshilinch: { label: 'Shoshilinch', color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    icon: <AlertTriangle className="w-4 h-4" /> },
  ariza:       { label: 'Arizalar',   color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: <FileText className="w-4 h-4" />      },
  tolov:       { label: "To'lovlar",  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CreditCard className="w-4 h-4" />  },
  xulosa:      { label: 'Xulosalar',  color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', icon: <ClipboardCheck className="w-4 h-4" />},
  tizim:       { label: 'Tizim',      color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200',  icon: <Settings className="w-4 h-4" />      },
};

const PRIORITY_DOT: Record<NotifPriority, string> = {
  urgent: 'bg-red-500 animate-pulse',
  high:   'bg-amber-500',
  medium: 'bg-blue-400',
  low:    'bg-gray-300',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Math.floor((NOW.getTime() - d.getTime()) / 1000);
  if (diff < 60)    return `${diff}s oldin`;
  if (diff < 3600)  return `${Math.floor(diff/60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff/3600)} soat oldin`;
  return `${Math.floor(diff/86400)} kun oldin`;
}

function groupByDate(notifs: NotifItem[]): Record<string, NotifItem[]> {
  const groups: Record<string, NotifItem[]> = {};
  notifs.forEach(n => {
    const d = new Date(n.time);
    const diff = Math.floor((NOW.getTime() - d.getTime()) / 86400000);
    const key = diff === 0 ? 'Bugun' : diff === 1 ? 'Kecha' : `${diff} kun oldin`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return groups;
}

// ── Components ────────────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: Exclude<NotifCategory, 'all'> }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}>
      {cfg.icon}
    </div>
  );
}

function NotifCard({
  notif,
  selected,
  onClick,
}: {
  notif: NotifItem;
  selected: boolean;
  onClick: () => void;
}) {
  const cfg = CATEGORY_CONFIG[notif.category];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onClick}
      className={`group relative flex gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-gray-100 last:border-0
        ${selected ? 'bg-blue-50 border-l-2 border-l-blue-400' : 'hover:bg-gray-50'}
        ${!notif.isRead && !selected ? 'bg-white' : ''}`}
    >
      {/* Unread dot */}
      {!notif.isRead && (
        <span className={`absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[notif.priority]}`} />
      )}

      <CategoryIcon category={notif.category} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${notif.isRead ? 'text-gray-600 font-normal' : 'text-gray-900 font-semibold'}`}>
            {notif.title}
          </p>
          <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{formatTime(notif.time)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {notif.meta && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
              {notif.meta}
            </span>
          )}
          {notif.tags?.map(tag => (
            <span key={tag} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function DetailPanel({ notif, onClose, onMarkRead }: { notif: NotifItem; onClose: () => void; onMarkRead: (id: number) => void }) {
  const cfg = CATEGORY_CONFIG[notif.category];
  const roleColors: Record<string, string> = {
    operator: 'bg-blue-100 text-blue-700',
    radiolog: 'bg-violet-100 text-violet-700',
    admin: 'bg-slate-100 text-slate-700',
    kassir: 'bg-emerald-100 text-emerald-700',
    specialist: 'bg-amber-100 text-amber-700',
    system: 'bg-gray-100 text-gray-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="w-80 shrink-0 flex flex-col bg-white border-l border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <CategoryIcon category={notif.category} />
          <div>
            <p className="text-xs font-semibold text-gray-700 capitalize">{cfg.label}</p>
            <p className="text-[10px] text-gray-400">{formatTime(notif.time)}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Priority badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
            ${notif.priority === 'urgent' ? 'bg-red-100 text-red-700' :
              notif.priority === 'high'   ? 'bg-amber-100 text-amber-700' :
              notif.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[notif.priority]}`} />
            {notif.priority === 'urgent' ? 'Favqulodda' :
             notif.priority === 'high'   ? 'Muhim' :
             notif.priority === 'medium' ? "O'rtacha" : 'Past'}
          </span>
          {!notif.isRead && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Yangi</span>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-snug">{notif.title}</h3>
        </div>

        {/* Body */}
        <div className={`p-4 rounded-xl ${cfg.bg} ${cfg.border} border`}>
          <p className="text-sm text-gray-700 leading-relaxed">{notif.body}</p>
        </div>

        {/* Meta info */}
        {notif.meta && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Identifikator:</span>
            <code className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.color}`}>
              {notif.meta}
            </code>
          </div>
        )}

        {/* Actor */}
        {notif.actor && (
          <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">{notif.actor}</p>
              {notif.actorRole && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${roleColors[notif.actorRole] || 'bg-gray-100 text-gray-600'}`}>
                  {notif.actorRole}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {notif.tags && notif.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {notif.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(notif.time).toLocaleString('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {notif.actionLabel && (
          <button className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${cfg.bg} ${cfg.color} ${cfg.border} border hover:opacity-90`}>
            {notif.actionLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {!notif.isRead && (
          <button
            onClick={() => onMarkRead(notif.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all border border-gray-200"
          >
            <Check className="w-4 h-4" />
            O'qildi deb belgilash
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function WebXabarlarScreen() {
  const [notifs, setNotifs]         = useState<NotifItem[]>(MOCK_NOTIFS);
  const [activeCategory, setActiveCategory] = useState<NotifCategory>('all');
  const [search, setSearch]         = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selected, setSelected]     = useState<NotifItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Counts
  const counts = useMemo(() => {
    const cats: Record<NotifCategory, number> = { all: 0, ariza: 0, tolov: 0, xulosa: 0, tizim: 0, shoshilinch: 0 };
    notifs.filter(n => !n.isRead && !n.isArchived).forEach(n => {
      cats[n.category]++;
      cats.all++;
    });
    return cats;
  }, [notifs]);

  // Filtered
  const filtered = useMemo(() => {
    return notifs.filter(n => {
      if (n.isArchived) return false;
      if (activeCategory !== 'all' && n.category !== activeCategory) return false;
      if (showUnreadOnly && n.isRead) return false;
      if (search) {
        const q = search.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || n.meta?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifs, activeCategory, showUnreadOnly, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  function markRead(id: number) {
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  function markAllRead() {
    setNotifs(ns => ns.map(n =>
      (activeCategory === 'all' || n.category === activeCategory) ? { ...n, isRead: true } : n
    ));
  }

  function archiveNotif(id: number) {
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, isArchived: true } : n));
    if (selected?.id === id) setSelected(null);
  }

  const categories: { key: NotifCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'all',        label: 'Hammasi',     icon: <Bell className="w-4 h-4" /> },
    { key: 'shoshilinch', label: 'Shoshilinch', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'ariza',      label: 'Arizalar',    icon: <FileText className="w-4 h-4" /> },
    { key: 'tolov',      label: "To'lovlar",   icon: <CreditCard className="w-4 h-4" /> },
    { key: 'xulosa',     label: 'Xulosalar',   icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: 'tizim',      label: 'Tizim',       icon: <Settings className="w-4 h-4" /> },
  ];

  const catColors: Record<NotifCategory, string> = {
    all:         'text-gray-700 bg-gray-100',
    shoshilinch: 'text-red-700 bg-red-100',
    ariza:       'text-blue-700 bg-blue-100',
    tolov:       'text-emerald-700 bg-emerald-100',
    xulosa:      'text-violet-700 bg-violet-100',
    tizim:       'text-slate-700 bg-slate-100',
  };

  return (
    <WebPlatformLayout title="Xabarlar">
      <div className="flex h-full overflow-hidden">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-56 shrink-0 flex flex-col border-r border-gray-200 bg-white">
          {/* Stats */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Kategoriyalar</span>
              <button
                onClick={() => setSoundEnabled(v => !v)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title={soundEnabled ? 'Ovozni o\'chirish' : 'Ovozni yoqish'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Total unread banner */}
            {counts.all > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100 mb-1">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-blue-700 font-semibold">{counts.all} ta o'qilmagan</span>
              </div>
            )}
          </div>

          {/* Category list */}
          <nav className="flex-1 overflow-y-auto py-2">
            {categories.map(cat => {
              const active = activeCategory === cat.key;
              const count = counts[cat.key];
              return (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setSelected(null); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all text-left
                    ${active ? `${catColors[cat.key]} font-semibold` : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className={active ? '' : 'opacity-60'}>{cat.icon}</span>
                  <span className="flex-1">{cat.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full
                      ${cat.key === 'shoshilinch' ? 'bg-red-500 text-white animate-pulse' :
                        active ? 'bg-white/60 text-current' : 'bg-gray-200 text-gray-600'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={markAllRead}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Barchasini o'qildi
            </button>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-white shrink-0">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Xabarlarni qidirish..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowUnreadOnly(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border
                ${showUnreadOnly ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              O'qilmaganlar
            </button>

            {/* Refresh */}
            <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Result count */}
            <span className="text-xs text-gray-400 ml-auto">{filtered.length} ta</span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
                <BellOff className="w-10 h-10" />
                <p className="text-sm font-medium">Xabar topilmadi</p>
                {search && <p className="text-xs">"{search}" bo'yicha natija yo'q</p>}
              </div>
            ) : (
              Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  {/* Date label */}
                  <div className="sticky top-0 px-5 py-2 bg-gray-50 border-b border-gray-100 z-10">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{date}</span>
                    <span className="ml-2 text-xs text-gray-400">{items.length} ta</span>
                  </div>

                  <AnimatePresence>
                    {items.map(n => (
                      <NotifCard
                        key={n.id}
                        notif={n}
                        selected={selected?.id === n.id}
                        onClick={() => {
                          setSelected(selected?.id === n.id ? null : n);
                          if (!n.isRead) markRead(n.id);
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── DETAIL PANEL ── */}
        <AnimatePresence>
          {selected && (
            <DetailPanel
              notif={selected}
              onClose={() => setSelected(null)}
              onMarkRead={markRead}
            />
          )}
        </AnimatePresence>

      </div>
    </WebPlatformLayout>
  );
}
