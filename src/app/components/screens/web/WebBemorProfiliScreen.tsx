/**
 * WebBemorProfiliScreen — Bemor to'liq profili va Elektron Tibbiy Karta (EMK)
 * Tablar: Shaxsiy · Tibbiy anamnez · Arizalar · Xulosalar · To'lovlar · Hujjatlar
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Heart, FileText, ClipboardCheck, CreditCard, Folder,
  Phone, Mail, MapPin, Calendar, ChevronLeft, Edit3,
  AlertTriangle, Pill, Activity, Stethoscope, Download,
  Eye, Plus, Clock, CheckCircle, XCircle, ArrowUpRight,
  Printer, Send, MoreVertical, Badge, Shield, Droplets,
  Ruler, Weight, Thermometer, HeartPulse, MessageSquare,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useNavigation } from '../../../store/navigationContext';

// ── Types ─────────────────────────────────────────────────────────────────────

type EMKTab = 'shaxsiy' | 'tibbiy' | 'arizalar' | 'xulosalar' | 'tolovlar' | 'hujjatlar';

// ── Mock data ─────────────────────────────────────────────────────────────────

const PATIENT = {
  id: 1,
  fullName: 'Karimov Aziz Baxtiyorovich',
  birthDate: '1985-06-12',
  age: 40,
  gender: 'male' as const,
  jshshir: '12345678901234',
  passport: 'AB1234567',
  phone: '+998 90 123 45 67',
  phone2: '+998 91 987 65 43',
  email: 'aziz.karimov@gmail.com',
  telegram: '@aziz_karimov',
  city: 'Toshkent',
  address: "Yakkasaroy tumani, Mustaqillik ko'chasi, 45-uy, 12-xonadon",
  bloodType: 'II(A)+',
  rhFactor: 'Musbat (+)',
  registeredAt: '2024-03-15',
  lastVisit: '2026-03-08',
  totalVisits: 7,
  activeApps: 2,
  totalPaid: 1_775_000,
};

const ANAMNEZ = {
  surgeries: ['2019 — Appendektomiya', '2022 — Tizza menisk operatsiyasi'],
  allergies: ['Amoksisilin (antibiotik)', 'Yong\'oq'],
  medications: ['Lisinopril 10mg (kuniga 1 marta)', 'Aspirin 100mg (kuniga 1 marta)'],
  chronicDiseases: ['Gipertoniya I daraja', 'Surunkali gastrit'],
  familyHistory: ["Ota: yurak-qon tomir kasalligi", 'Ona: Qandli diabet II tur'],
  // Antropometrik
  weight: 82,
  height: 178,
  bmi: 25.9,
  chest: 96,
  bloodPressure: '135/88',
  pulse: 76,
  temperature: 36.6,
  glucose: 5.8,
  updatedAt: '2026-03-08',
};

const APPLICATIONS = [
  { id: 42, num: 'RAD-2026-000042', date: '2026-03-08', type: 'MRT', organ: 'Bosh', status: 'conclusion_writing', urgency: 'urgent', sum: 225_000, radiolog: 'Dr. Mirzayev B.' },
  { id: 38, num: 'RAD-2026-000038', date: '2026-03-09', type: 'USG', organ: "Qorin bo'shlig'i", status: 'new', urgency: 'emergency', sum: 400_000, radiolog: null },
  { id: 35, num: 'RAD-2026-000035', date: '2026-02-14', type: 'MSKT', organ: "Ko'krak qafasi", status: 'done', urgency: 'normal', sum: 300_000, radiolog: 'Dr. Yusupov O.' },
  { id: 28, num: 'RAD-2026-000028', date: '2026-01-22', type: 'Rentgen', organ: "Qo'l", status: 'done', urgency: 'normal', sum: 120_000, radiolog: 'Dr. Raximov N.' },
  { id: 19, num: 'RAD-2025-000019', date: '2025-11-10', type: 'MRT', organ: 'Bel umurtqa', status: 'done', urgency: 'urgent', sum: 350_000, radiolog: 'Dr. Mirzayev B.' },
];

const XULOSALAR = [
  { id: 1, appNum: 'RAD-2026-000035', date: '2026-02-15', type: "MSKT · Ko'krak qafasi", doctor: 'Dr. Yusupov O.', role: 'Radiolog', conclusion: "O'pka o'tkinchi holat. Katta kasallik aniqlanmadi. Monitoring tavsiya etiladi." },
  { id: 2, appNum: 'RAD-2026-000028', date: '2026-01-23', type: "Rentgen · Qo'l", doctor: 'Dr. Raximov N.', role: 'Radiolog', conclusion: "Suyak siniqlarining belgilari yo'q. Yumshoq to'qimalarda shishlik." },
  { id: 3, appNum: 'RAD-2025-000019', date: '2025-11-11', type: 'MRT · Bel umurtqa', doctor: 'Dr. Mirzayev B.', role: 'Radiolog', conclusion: "L4-L5 darajasida disk chiqishi aniqlandi. Neyropatolog konsultatsiyasi tavsiya." },
];

const TOLOVLAR = [
  { id: 1, appNum: 'RAD-2026-000042', date: '2026-03-08', sum: 225_000, method: 'Payme', status: 'paid', invoice: 'INV-2026-00142' },
  { id: 2, appNum: 'RAD-2026-000038', date: '2026-03-09', sum: 400_000, method: '—', status: 'pending', invoice: 'INV-2026-00148' },
  { id: 3, appNum: 'RAD-2026-000035', date: '2026-02-14', sum: 300_000, method: 'Click', status: 'paid', invoice: 'INV-2026-00091' },
  { id: 4, appNum: 'RAD-2026-000028', date: '2026-01-22', sum: 120_000, method: 'Naqd', status: 'paid', invoice: 'INV-2026-00054' },
  { id: 5, appNum: 'RAD-2025-000019', date: '2025-11-10', sum: 350_000, method: 'Payme', status: 'paid', invoice: 'INV-2025-01230' },
];

const HUJJATLAR = [
  { id: 1, name: 'Pasport nusxasi', type: 'pdf', size: '1.2 MB', date: '2024-03-15', category: 'Shaxsiy' },
  { id: 2, name: 'Sug\'urta polisi 2026', type: 'pdf', size: '0.8 MB', date: '2026-01-05', category: "Sug'urta" },
  { id: 3, name: 'Xulosa-RAD-2025-000019.pdf', type: 'pdf', size: '2.4 MB', date: '2025-11-11', category: 'Xulosa' },
  { id: 4, name: 'MRT-tasvir-20260308.dcm', type: 'dicom', size: '48.3 MB', date: '2026-03-08', category: 'DICOM' },
  { id: 5, name: 'Rentgen-tasvir-20260122.jpg', type: 'image', size: '3.1 MB', date: '2026-01-22', category: 'Rasm' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  new:                { label: 'Yangi',            color: 'text-gray-600',   bg: 'bg-gray-100',    icon: <Clock className="w-3 h-3" /> },
  paid_pending:       { label: "To'lov kutilmoqda", color: 'text-amber-700', bg: 'bg-amber-100', icon: <CreditCard className="w-3 h-3" /> },
  accepted:           { label: 'Qabul qilindi',    color: 'text-blue-700',   bg: 'bg-blue-100',    icon: <CheckCircle className="w-3 h-3" /> },
  conclusion_writing: { label: 'Xulosa yozilmoqda', color: 'text-violet-700', bg: 'bg-violet-100', icon: <Edit3 className="w-3 h-3" /> },
  done:               { label: 'Bajarildi',         color: 'text-emerald-700', bg: 'bg-emerald-100', icon: <CheckCircle className="w-3 h-3" /> },
  failed:             { label: 'Bekor qilindi',     color: 'text-red-700',    bg: 'bg-red-100',     icon: <XCircle className="w-3 h-3" /> },
};

const URGENCY_MAP: Record<string, string> = {
  normal: '🟢 Oddiy', urgent: '🟡 Tezkor', emergency: '🔴 Favqulodda',
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.bg} ${s.color}`}>
      {s.icon}{s.label}
    </span>
  );
}

// ── Tab Components ─────────────────────────────────────────────────────────────

function TabShaxsiy() {
  const fields = [
    { icon: <User className="w-4 h-4" />,        label: 'F.I.O.',         value: PATIENT.fullName },
    { icon: <Calendar className="w-4 h-4" />,    label: 'Tug\'ilgan sana', value: `${PATIENT.birthDate} (${PATIENT.age} yosh)` },
    { icon: <Shield className="w-4 h-4" />,      label: 'JSHSHIR',         value: PATIENT.jshshir },
    { icon: <Badge className="w-4 h-4" />,       label: 'Pasport',         value: PATIENT.passport },
    { icon: <Phone className="w-4 h-4" />,       label: 'Tel (asosiy)',    value: PATIENT.phone },
    { icon: <Phone className="w-4 h-4" />,       label: 'Tel (qo\'shimcha)', value: PATIENT.phone2 },
    { icon: <Mail className="w-4 h-4" />,        label: 'Email',           value: PATIENT.email },
    { icon: <Send className="w-4 h-4" />,        label: 'Telegram',        value: PATIENT.telegram },
    { icon: <MapPin className="w-4 h-4" />,      label: 'Manzil',          value: PATIENT.address },
    { icon: <Droplets className="w-4 h-4" />,    label: 'Qon guruhi',      value: PATIENT.bloodType },
    { icon: <Activity className="w-4 h-4" />,    label: 'Rezus faktor',    value: PATIENT.rhFactor },
    { icon: <Calendar className="w-4 h-4" />,    label: 'Ro\'yxatga olingan', value: PATIENT.registeredAt },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.label} className="flex gap-3 p-3.5 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              {f.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{f.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{f.value || '—'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabTibbiy() {
  const vitals = [
    { icon: <Weight className="w-4 h-4" />,      label: 'Vazni',           value: `${ANAMNEZ.weight} kg`, color: 'text-blue-500 bg-blue-50' },
    { icon: <Ruler className="w-4 h-4" />,       label: "Bo'yi",           value: `${ANAMNEZ.height} sm`, color: 'text-emerald-500 bg-emerald-50' },
    { icon: <Activity className="w-4 h-4" />,    label: 'BMI',             value: `${ANAMNEZ.bmi}`,       color: 'text-amber-500 bg-amber-50' },
    { icon: <HeartPulse className="w-4 h-4" />,  label: 'Qon bosimi',      value: ANAMNEZ.bloodPressure,  color: 'text-red-500 bg-red-50' },
    { icon: <Heart className="w-4 h-4" />,       label: 'Puls',            value: `${ANAMNEZ.pulse}/min`, color: 'text-rose-500 bg-rose-50' },
    { icon: <Thermometer className="w-4 h-4" />, label: 'Harorat',         value: `${ANAMNEZ.temperature}°C`, color: 'text-orange-500 bg-orange-50' },
    { icon: <Droplets className="w-4 h-4" />,    label: 'Qand darajasi',   value: `${ANAMNEZ.glucose} mmol/L`, color: 'text-violet-500 bg-violet-50' },
    { icon: <Ruler className="w-4 h-4" />,       label: "Ko'krak o'lchami", value: `${ANAMNEZ.chest} sm`, color: 'text-sky-500 bg-sky-50' },
  ];

  function ListCard({ icon, title, items, color }: { icon: React.ReactNode; title: string; items: string[]; color: string }) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 ${color}`}>
          {icon}
          <p className="text-xs font-bold uppercase tracking-wider">{title}</p>
        </div>
        <div className="p-3 space-y-1">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 italic px-1">Malumot kiritilmagan</p>
          ) : items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
              <p className="text-sm text-gray-700 leading-snug">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Vitals grid */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" /> Antropometrik ko'rsatkichlar
          <span className="font-normal text-gray-400 ml-auto">Yangilangan: {ANAMNEZ.updatedAt}</span>
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          {vitals.map(v => (
            <div key={v.label} className={`p-3 rounded-xl border border-gray-100 ${v.color.split(' ')[1]}`}>
              <div className={`w-7 h-7 rounded-lg ${v.color.split(' ')[1]} ${v.color.split(' ')[0]} flex items-center justify-center mb-2`}>
                {v.icon}
              </div>
              <p className="text-xs text-gray-500">{v.label}</p>
              <p className="text-base font-bold text-gray-800 mt-0.5">{v.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Anamnez cards */}
      <div className="grid grid-cols-2 gap-3">
        <ListCard
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          title="Allergiyalar"
          items={ANAMNEZ.allergies}
          color="text-red-600"
        />
        <ListCard
          icon={<Pill className="w-3.5 h-3.5" />}
          title="Doimiy dorilar"
          items={ANAMNEZ.medications}
          color="text-amber-600"
        />
        <ListCard
          icon={<Stethoscope className="w-3.5 h-3.5" />}
          title="Xronik kasalliklar"
          items={ANAMNEZ.chronicDiseases}
          color="text-blue-600"
        />
        <ListCard
          icon={<Activity className="w-3.5 h-3.5" />}
          title="Operatsiyalar"
          items={ANAMNEZ.surgeries}
          color="text-violet-600"
        />
        <ListCard
          icon={<User className="w-3.5 h-3.5" />}
          title="Oilaviy anamnez"
          items={ANAMNEZ.familyHistory}
          color="text-emerald-600"
        />
      </div>
    </div>
  );
}

function TabArizalar() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-800">Arizalar tarixi ({APPLICATIONS.length} ta)</p>
        <button className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700">
          <Plus className="w-3.5 h-3.5" /> Yangi ariza
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {APPLICATIONS.map(app => (
          <div key={app.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{app.num}</code>
                <span className="text-xs text-blue-600 font-semibold">{app.type} · {app.organ}</span>
                <span className="text-xs text-gray-400">{URGENCY_MAP[app.urgency]}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400">{app.date}</span>
                {app.radiolog && <span className="text-xs text-gray-500">{app.radiolog}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-gray-700">{(app.sum / 1000).toFixed(0)}K</span>
              <StatusBadge status={app.status} />
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabXulosalar() {
  return (
    <div className="space-y-3">
      {XULOSALAR.map(x => (
        <div key={x.id} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-violet-500" />
              <code className="text-xs font-bold text-gray-600">{x.appNum}</code>
              <span className="text-xs text-violet-700 font-semibold">{x.type}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{x.date}</span>
              <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-medium">{x.role}</span>
              <button className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700">
                <Download className="w-3 h-3" /> PDF
              </button>
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-gray-500 mb-1 font-medium">{x.doctor}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{x.conclusion}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabTolovlar() {
  const total = TOLOVLAR.filter(t => t.status === 'paid').reduce((s, t) => s + t.sum, 0);
  const pending = TOLOVLAR.filter(t => t.status === 'pending').reduce((s, t) => s + t.sum, 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Jami to'langan", value: `${(total/1000).toFixed(0)}K so'm`, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Kutilmoqda', value: `${(pending/1000).toFixed(0)}K so'm`, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Jami arizalar', value: `${TOLOVLAR.length} ta`, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.bg}`}>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-6 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
          <div className="col-span-2">Ariza / Sana</div>
          <div>Summa</div>
          <div>Usul</div>
          <div>Holat</div>
          <div>Amallar</div>
        </div>
        <div className="divide-y divide-gray-100">
          {TOLOVLAR.map(t => (
            <div key={t.id} className="grid grid-cols-6 gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
              <div className="col-span-2">
                <code className="text-xs font-bold text-gray-700">{t.appNum}</code>
                <p className="text-xs text-gray-400 mt-0.5">{t.date}</p>
              </div>
              <div className="text-sm font-bold text-gray-800">{(t.sum/1000).toFixed(0)}K</div>
              <div className="text-xs text-gray-600">{t.method}</div>
              <div>
                {t.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                    <CheckCircle className="w-3 h-3" /> To'langan
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                    <Clock className="w-3 h-3" /> Kutilmoqda
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Chek">
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Ko'rish">
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabHujjatlar() {
  const typeIcon: Record<string, string> = {
    pdf: '📄', dicom: '🔬', image: '🖼️', other: '📎',
  };
  const categories = [...new Set(HUJJATLAR.map(h => h.category))];
  const [filter, setFilter] = useState('Hammasi');

  const filtered = filter === 'Hammasi' ? HUJJATLAR : HUJJATLAR.filter(h => h.category === filter);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {['Hammasi', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border
              ${filter === cat ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {cat}
          </button>
        ))}
        <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Hujjat yuklash
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map(h => (
          <div key={h.id} className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
              {typeIcon[h.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{h.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-400">{h.date}</span>
                <span className="text-[10px] text-gray-400">·</span>
                <span className="text-[10px] text-gray-400">{h.size}</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 rounded">{h.category}</span>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function WebBemorProfiliScreen() {
  const [activeTab, setActiveTab] = useState<EMKTab>('shaxsiy');
  const { navigate } = useNavigation();

  const tabs: { key: EMKTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'shaxsiy',   label: 'Shaxsiy',      icon: <User className="w-4 h-4" /> },
    { key: 'tibbiy',    label: 'Tibbiy anamnez', icon: <Heart className="w-4 h-4" /> },
    { key: 'arizalar',  label: 'Arizalar',      icon: <FileText className="w-4 h-4" />, count: APPLICATIONS.length },
    { key: 'xulosalar', label: 'Xulosalar',     icon: <ClipboardCheck className="w-4 h-4" />, count: XULOSALAR.length },
    { key: 'tolovlar',  label: "To'lovlar",     icon: <CreditCard className="w-4 h-4" />, count: TOLOVLAR.length },
    { key: 'hujjatlar', label: 'Hujjatlar',     icon: <Folder className="w-4 h-4" />, count: HUJJATLAR.length },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'shaxsiy':   return <TabShaxsiy />;
      case 'tibbiy':    return <TabTibbiy />;
      case 'arizalar':  return <TabArizalar />;
      case 'xulosalar': return <TabXulosalar />;
      case 'tolovlar':  return <TabTolovlar />;
      case 'hujjatlar': return <TabHujjatlar />;
    }
  };

  return (
    <WebPlatformLayout title="Bemor profili">
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── PATIENT HEADER ── */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
          <div className="flex items-center gap-4">
            {/* Back */}
            <button
              onClick={() => navigate('web_arizalar')}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
              KA
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900">{PATIENT.fullName}</h2>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
                  Bemor
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PATIENT.activeApps > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-500'}`}>
                  {PATIENT.activeApps} ta faol ariza
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 flex-wrap text-xs text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{PATIENT.birthDate} · {PATIENT.age} yosh</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{PATIENT.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{PATIENT.city}</span>
                <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{PATIENT.bloodType}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <MessageSquare className="w-4 h-4" />
                Xabar
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                Yangi ariza
              </button>
              <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 mt-4 pl-[4.5rem]">
            {[
              { label: 'Jami tashriflar', value: PATIENT.totalVisits },
              { label: "To'langan", value: `${(PATIENT.totalPaid/1_000_000).toFixed(2)} mln` },
              { label: "So'ngi tashrif", value: PATIENT.lastVisit },
              { label: "Ro'yxatdan o'tgan", value: PATIENT.registeredAt },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-base font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-1 px-6 py-2 bg-white border-b border-gray-200 shrink-0 overflow-x-auto">
          {tabs.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0
                  ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                    ${active ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 py-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </WebPlatformLayout>
  );
}
