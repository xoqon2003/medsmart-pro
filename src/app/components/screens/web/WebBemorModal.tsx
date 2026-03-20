/**
 * WebBemorModal — Operator uchun bemor ro'yxatga olish modali
 * 3 bosqichli forma: 1) Ro'yxatga olish → 2) Tibbiy ma'lumot → 3) Shartnoma va to'lov
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Plus, Calendar, ChevronDown, ChevronUp, Mic, Trash2,
  Phone, Mail, Send, Search, Check, Activity,
  Eye, MoreVertical,
} from 'lucide-react';

// ── Umumiy UI komponentlar ────────────────────────────────────────────────────

const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all";

function FI({ placeholder, required, icon, className = '' }: {
  placeholder: string; required?: boolean; icon?: React.ReactNode; className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>}
      <input
        type="text"
        placeholder={required ? `${placeholder} *` : placeholder}
        className={`${inp} ${icon ? 'pl-9' : ''} ${required ? 'pr-6' : ''}`}
      />
      {required && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-xs font-bold">*</span>}
    </div>
  );
}

function SF({ placeholder, options = [] }: { placeholder: string; options?: string[] }) {
  return (
    <div className="relative">
      <select className={`${inp} appearance-none pr-9 cursor-pointer`}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

function DF({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <input type="text" placeholder={placeholder} className={`${inp} pr-9`} />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3.5">
      <span className="text-base leading-none">{icon}</span>
      <h3 className="font-semibold text-gray-800 text-sm tracking-tight">{title}</h3>
    </div>
  );
}

function PlusBtn() {
  return (
    <button className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center shrink-0 hover:bg-emerald-50 transition-colors">
      <Plus className="w-3 h-3 text-emerald-500" />
    </button>
  );
}

// ── Qadam 1 — Ro'yxatga olish ─────────────────────────────────────────────────

function Step1({ onNext, onClose }: { onNext: () => void; onClose: () => void }) {
  const [arizachi, setArizachi] = useState<'bemor'|'oila'|'shifokor'|'klinika'>('bemor');
  const [docType,  setDocType]  = useState<'pasport'|'metirka'>('pasport');
  const [anonim,   setAnonim]   = useState(false);
  const [jinsi,    setJinsi]    = useState<'erkak'|'ayol'|null>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-7 px-8 py-6">

          {/* ── 1-USTUN ── */}
          <div className="space-y-4">

            {/* Ariza qoldiruvchi */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">Ariza qoldiruvchi</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-gray-500">Anonim</span>
                  <div onClick={() => setAnonim(v => !v)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${anonim ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${anonim ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </label>
              </div>
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {(['bemor','oila','shifokor','klinika'] as const).map(t => (
                  <button key={t} onClick={() => setArizachi(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
                      ${arizachi === t ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}>
                    {t === 'bemor' ? 'Bemor' : t === 'oila' ? "Oila a'zosi" : t === 'shifokor' ? 'Shifokor' : 'Klinika'}
                  </button>
                ))}
              </div>
            </Card>

            {/* Qidiruv */}
            <Card>
              <FI placeholder="Tibbiy kartalardan qidirish" icon={<Search className="w-4 h-4" />} />
            </Card>

            {/* MIP */}
            <Card>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">MIP dan olish</p>
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-3">
                {(['pasport','metirka'] as const).map(t => (
                  <button key={t} onClick={() => setDocType(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
                      ${docType === t ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-white/50'}`}>
                    {t === 'pasport' ? 'Pasport' : 'Metirka'}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <FI placeholder="Passport/ID karta raqamlari seriyasi / Metirka seriyasi" />
                <FI placeholder="JSHSHIR / Metirka nomeri" />
              </div>
            </Card>

            {/* Bemor ma'lumotlari */}
            <Card>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bemorning ma'lumotlari</p>
              <div className="space-y-2">
                <FI placeholder="Bemorning Ismi" required />
                <FI placeholder="Bemorning Familyasi" required />
                <FI placeholder="Bemorning Sharifi" />
              </div>
            </Card>

            {/* Tug'ilgan sana + Jinsi */}
            <Card>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tug'ilgan sana & Jinsi</p>
              <div className="flex gap-2 mb-3">
                <div className="relative w-20">
                  <input type="text" placeholder="Kun *"
                    className="w-full border border-gray-200 rounded-xl px-2.5 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white text-center" />
                </div>
                <input type="text" placeholder="Oy *"
                  className="flex-1 border border-gray-200 rounded-xl px-2.5 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white text-center" />
                <input type="text" placeholder="Yil *"
                  className="flex-1 border border-gray-200 rounded-xl px-2.5 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white text-center" />
              </div>
              <div className="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                <span className="text-xs font-medium text-gray-600">Jinsi *</span>
                {(['erkak','ayol'] as const).map(j => (
                  <label key={j} className="flex items-center gap-2 cursor-pointer" onClick={() => setJinsi(j)}>
                    <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors
                      ${jinsi === j ? 'border-emerald-500' : 'border-gray-300'}`}>
                      {jinsi === j && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <span className="text-sm text-gray-700">{j === 'erkak' ? 'Erkak' : 'Ayol'}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Aloqa */}
            <Card>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Aloqa</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <PlusBtn />
                  <FI placeholder="Telfon raqami" required icon={<Phone className="w-3.5 h-3.5" />} className="flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <PlusBtn />
                  <FI placeholder="Email manzili" icon={<Mail className="w-3.5 h-3.5" />} className="flex-1" />
                </div>
              </div>
            </Card>
          </div>

          {/* ── 2-USTUN ── */}
          <div className="space-y-4">

            {/* Hujjat */}
            <Card>
              <CardTitle icon="📋" title="Hujjat" />
              <div className="space-y-2">
                <FI placeholder="Hujjat turi" />
                <FI placeholder="Hujjat raqami" />
                <div className="grid grid-cols-2 gap-2">
                  <DF placeholder="Berilgan" />
                  <DF placeholder="Muddat" />
                </div>
                <FI placeholder="Kim tomonidan berilgan" />
              </div>
            </Card>

            {/* Sug'urta */}
            <Card>
              <CardTitle icon="🏥" title="Sug'urta ma'lumotlari" />
              <div className="space-y-2">
                <FI placeholder="Sug'urta kompaniyasi nomi / Sug'urta polisi" />
                <FI placeholder="Sug'urta polisi seriyasi" />
                <FI placeholder="Sug'urta polisi raqami" />
                <div className="grid grid-cols-2 gap-2">
                  <DF placeholder="Sanadan" />
                  <DF placeholder="Sanagacha" />
                </div>
              </div>
            </Card>

            {/* Yashash manzili */}
            <Card>
              <CardTitle icon="📍" title="Yashash manzili" />
              <div className="space-y-2">
                <SF placeholder="Mamlakati: O'ZBEKISTON" options={["O'ZBEKISTON", "Qozogʻiston", "Rossiya"]} />
                <SF placeholder="Viloyati" options={['Toshkent', 'Samarqand', 'Buxoro', "Farg'ona", 'Namangan', 'Andijon']} />
                <SF placeholder="Shahar/Tumani" />
                <FI placeholder="Yashash joyi (ko'cha, uy)" />
              </div>
            </Card>
          </div>

          {/* ── 3-USTUN ── */}
          <div className="space-y-4">

            {/* Qo'shimcha */}
            <Card>
              <CardTitle icon="➕" title="Qo'shimcha ma'lumotlari" />
              <div className="grid grid-cols-2 gap-2">
                <SF placeholder="Qon guruhi" options={['I(O)+', 'I(O)−', 'II(A)+', 'II(A)−', 'III(B)+', 'III(B)−', 'IV(AB)+', 'IV(AB)−']} />
                <SF placeholder="Rezus faktor" options={['Musbat (+)', 'Manfiy (−)']} />
              </div>
            </Card>

            {/* Yaqin qarindoshi */}
            <Card>
              <CardTitle icon="👥" title="Yaqin qarindoshi" />
              <div className="space-y-2">
                <FI placeholder="Qarindoshi Ismi" />
                <FI placeholder="Qarindoshi Familyasi" />
                <FI placeholder="Qarindoshi Sharifi" />
                <div className="flex items-center gap-2">
                  <PlusBtn />
                  <FI placeholder="Telfon raqami" icon={<Phone className="w-3.5 h-3.5" />} className="flex-1" />
                </div>
                <FI placeholder="Manzili" />
              </div>
            </Card>

            {/* Boshqa ma'lumotlari */}
            <Card className="p-0 overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span className="text-sm font-semibold text-gray-700">Boshqa ma'lumotlari</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-7 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3 shrink-0">
        <button onClick={onClose}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">
          Yopish
        </button>
        <button onClick={onNext}
          className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
          Kengisi →
        </button>
      </div>
    </div>
  );
}

// ── Qadam 2 — Tibbiy ma'lumot ─────────────────────────────────────────────────

interface ServiceRow {
  id: number;
  xizmat: string; soni: string; chegirmaturi: string;
  chegirma: string; summa: string; tashkilot: string;
  ijrochi: string; sana: string;
}

const DOCS_LIST = [
  { key: 'invoys',    label: 'Invoys raqami' },
  { key: 'chek',      label: 'Chek' },
  { key: 'hisob',     label: 'Hisob fakturasi' },
  { key: 'shartnoma', label: 'Shartnoma' },
  { key: 'kelishuv',  label: "Qo'shimcha kelishuv" },
] as const;

function Step2({ onClose, onNext }: { onClose: () => void; onNext: () => void }) {
  const [rows, setRows] = useState<ServiceRow[]>([
    { id: 1, xizmat: 'Radiolog', soni: '1', chegirmaturi: 'PromoKod', chegirma: '10 %', summa: '300 000', tashkilot: 'SNS MED CLINIC', ijrochi: "Juraxonov Ulug'bek Karimovich", sana: '21.03.26 11:00' },
    { id: 2, xizmat: '', soni: '', chegirmaturi: '', chegirma: '', summa: '', tashkilot: '', ijrochi: '', sana: '' },
    { id: 3, xizmat: '', soni: '', chegirmaturi: '', chegirma: '', summa: '', tashkilot: '', ijrochi: '', sana: '' },
    { id: 4, xizmat: '', soni: '', chegirmaturi: '', chegirma: '', summa: '', tashkilot: '', ijrochi: '', sana: '' },
  ]);
  const [docs, setDocs]         = useState({ invoys: true, chek: false, hisob: false, shartnoma: false, kelishuv: false });
  const [docsOpen, setDocsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const cellInp = "w-full border-0 border-b border-gray-200 px-1.5 py-1.5 text-xs text-gray-700 bg-transparent focus:outline-none focus:border-emerald-400 transition-colors";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex gap-6 overflow-hidden px-8 py-6">

        {/* ── CHAP: Tibbiy ma'lumot ── */}
        <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto pr-2">

          {/* Tibbiy anamnez */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Tibbiy anamnez</p>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { label: "Avval o'tkazilgan operatsiyalar", placeholder: "Operatsiya nomi, yili..." },
                { label: "Allergiya",                       placeholder: "Dori, oziq-ovqat allergiyalari..." },
                { label: "Doimiy dorilar",                  placeholder: "Dori nomi, miqdori..." },
                { label: "Xronik kasalliklar",              placeholder: "Kasallik nomi..." },
                { label: "Oilaviy anamnez",                 placeholder: "Qarindoshlardagi kasalliklar..." },
              ].map(item => (
                <div key={item.label} className="group">
                  <p className="text-[10px] font-medium text-gray-400 mb-0.5 px-1">{item.label}</p>
                  <div className="flex items-center gap-1.5">
                    <button className="w-5 h-5 rounded-full border-2 border-dashed border-emerald-300 text-emerald-400 hover:bg-emerald-50 hover:border-emerald-400 flex items-center justify-center shrink-0 transition-colors">
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <input type="text" placeholder={item.placeholder}
                      className="flex-1 border border-gray-100 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 focus:bg-white focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 transition-all placeholder-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Antropometrik ko'rsatkichlar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-base">📏</span>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Antropometrik</p>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Vazni',   unit: 'kg',  placeholder: '0' },
                  { label: "Bo'yi",   unit: 'sm',  placeholder: '0' },
                  { label: "Ko'krak", unit: 'sm',  placeholder: '0' },
                ].map(f => (
                  <div key={f.label} className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-gray-400 font-medium px-0.5">{f.label}</p>
                    <div className="border border-gray-200 rounded-xl bg-white focus-within:border-emerald-300 focus-within:ring-1 focus-within:ring-emerald-100 transition-all overflow-hidden">
                      <input type="number" placeholder={f.placeholder} min={0}
                        className="w-full px-2.5 pt-1.5 pb-0.5 text-sm font-semibold text-gray-700 bg-transparent focus:outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      <div className="flex justify-center pb-1">
                        <span className="text-[10px] text-gray-400 font-medium">{f.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shikoyatlar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-base">💬</span>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Shikoyatlar</p>
            </div>
            <div className="p-3 space-y-2">
              <div className="relative">
                <textarea
                  placeholder="Asosiy shikoyat — nima uchun tekshiruv qildirilgan..."
                  rows={3}
                  className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-600 bg-gray-50 resize-none focus:bg-white focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 transition-all pr-8 placeholder-gray-300" />
                <Mic className="absolute right-2.5 bottom-2.5 w-3.5 h-3.5 text-gray-300 hover:text-emerald-400 cursor-pointer transition-colors" />
              </div>

              <div className="border-t border-gray-100 pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Bazadan tanlash</p>
                  <button className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
                <input type="text" placeholder="Shikoyatlar / Belgilar"
                  className="w-full border border-gray-100 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 bg-gray-50 focus:bg-white focus:outline-none focus:border-emerald-300 transition-all mb-1.5 placeholder-gray-300" />
                <div className="relative">
                  <input type="text" placeholder="Kasallik boshlanish sanasi"
                    className="w-full border border-gray-100 rounded-lg px-2.5 py-1.5 pr-8 text-xs text-gray-600 bg-gray-50 focus:bg-white focus:outline-none focus:border-emerald-300 transition-all placeholder-gray-300" />
                  <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Natijalar yuborish */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-base">📤</span>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Natijalar yuboriladi</p>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { icon: <Phone className="w-3 h-3" />,  val: '+998 88 888 88 88', color: 'text-blue-400',   bg: 'bg-blue-50'   },
                { icon: <Mail className="w-3 h-3" />,   val: 'bukharagold1@gmail.com', color: 'text-violet-400', bg: 'bg-violet-50' },
                { icon: <Send className="w-3 h-3" />,   val: '@bukharagold1',     color: 'text-sky-400',    bg: 'bg-sky-50'    },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors group">
                  <div className={`w-6 h-6 rounded-lg ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <span className="text-xs text-gray-500 flex-1 truncate">{item.val}</span>
                  <button className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center transition-opacity">
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── O'RTA: Tibbiy xizmatlar ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Tibbiy xizmatlar</p>
            </div>

            {/* Table header */}
            <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-3 py-2">
              <PlusBtn />
              {[
                { label: 'Xizmat', cls: 'flex-1' },
                { label: 'Soni', cls: 'w-12 text-center' },
                { label: 'Chegirma turi', cls: 'w-24' },
                { label: 'Chegirma %', cls: 'w-20 text-center' },
                { label: 'Summa', cls: 'w-24 text-right' },
                { label: 'Tashkilot', cls: 'w-28' },
                { label: 'Ijrochi/Mutaxassis', cls: 'w-32' },
              ].map(h => (
                <div key={h.label} className={`text-xs font-semibold text-gray-500 ${h.cls}`}>{h.label}</div>
              ))}
              <div className="flex gap-1 shrink-0 relative">
                <button className="text-gray-400 hover:text-gray-600"><ChevronDown className="w-4 h-4" /></button>
                <button className="text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></button>
                <button
                  onClick={() => setDocsOpen(v => !v)}
                  className="text-gray-400 hover:text-gray-600 relative"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {docsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 4 }}
                      transition={{ duration: 0.12 }}
                      onMouseLeave={() => setDocsOpen(false)}
                      className="absolute right-0 top-full mt-1 z-50 w-48 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hujjatlar</p>
                      </div>
                      <div className="px-3 py-2.5 space-y-2.5">
                        {DOCS_LIST.map(item => (
                          <label key={item.key} className="flex items-center gap-2.5 cursor-pointer group">
                            <div
                              onClick={() => setDocs(d => ({ ...d, [item.key]: !d[item.key] }))}
                              className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 transition-all
                                ${docs[item.key] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white group-hover:border-emerald-300'}`}
                            >
                              {docs[item.key] && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="text-xs text-gray-700">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
              {rows.map(row => (
                <div key={row.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors">
                  <input type="text" defaultValue={row.xizmat} placeholder="Xizmat"
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-400 bg-white" />
                  <input type="text" defaultValue={row.soni}
                    className="w-12 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-emerald-400 bg-white" />
                  <input type="text" defaultValue={row.chegirmaturi}
                    className="w-24 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-400 bg-white" />
                  <input type="text" defaultValue={row.chegirma}
                    className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-emerald-400 bg-white" />
                  <input type="text" defaultValue={row.summa}
                    className="w-24 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-right focus:outline-none focus:border-emerald-400 bg-white" />
                  <input type="text" defaultValue={row.tashkilot}
                    className="w-28 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-400 bg-white" />
                  <div className="relative w-32">
                    <input type="text" defaultValue={row.ijrochi}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-400 bg-white" />
                  </div>
                  <div className="relative shrink-0">
                    <input type="text" defaultValue={row.sana} placeholder="Sana"
                      className="w-28 text-xs border border-gray-200 rounded-lg px-2 py-1.5 pr-7 focus:outline-none focus:border-emerald-400 bg-white" />
                    <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                  </div>
                  <button onClick={() => setRows(r => r.filter(x => x.id !== row.id))}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Jami */}
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-t border-gray-200">
              <span className="flex-1 text-xs font-bold text-gray-700">Jami:</span>
              <span className="w-12 text-xs text-center text-gray-400">—</span>
              <span className="w-24 text-xs text-center text-gray-400">—</span>
              <span className="w-20 text-xs text-center text-gray-400">—</span>
              <span className="w-2 text-gray-300 text-xs">|</span>
              <span className="w-24 text-xs font-bold text-emerald-700 text-right">300 000</span>
              <span className="w-2 text-gray-300 text-xs">|</span>
              <span className="w-28 text-xs text-center text-gray-400">—</span>
              <div className="w-32">
                {submitted ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Yuborildi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Yangi
                  </span>
                )}
              </div>
              <div className="w-3.5" />
            </div>

            {/* Xizmat paketi */}
            <div className="px-3 py-2.5 border-t border-gray-100">
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Xizmat paketi
              </button>
            </div>
          </Card>
        </div>

      </div>

      {/* Footer */}
      <div className="px-7 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3 shrink-0">
        <button onClick={onClose}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">
          Yopish
        </button>
        <button onClick={onNext} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
          Ro'yxatdan o'tkazish va to'lov →
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2
            ${submitted
              ? 'bg-blue-100 text-blue-700 border border-blue-200 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
        >
          {submitted && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
          {submitted ? 'Tasdiqlandi' : 'Tasdiqlash va yuborish'}
        </button>
      </div>
    </div>
  );
}

// ── Qadam 3 — Shartnoma va to'lov ────────────────────────────────────────────

const PAYMENT_METHODS = [
  { key: 'payme',    label: 'Payme',     icon: '💳', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { key: 'click',    label: 'Click',     icon: '🔵', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { key: 'uzum',     label: 'Uzum',      icon: '🟣', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { key: 'uzcard',   label: 'UzCard',    icon: '💴', color: 'bg-green-50 border-green-200 text-green-700' },
  { key: 'humo',     label: 'Humo',      icon: '💵', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { key: 'naqd',     label: 'Naqd pul',  icon: '💰', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { key: 'terminal', label: 'Terminal',  icon: '🖥️', color: 'bg-gray-50 border-gray-200 text-gray-700' },
] as const;

const CONTRACT_TERMS = [
  "Klinika tomonidan ko'rsatiladigan tibbiy xizmatlar ushbu shartnoma asosida amalga oshiriladi.",
  "Bemor to'liq va to'g'ri ma'lumot taqdim etishni majburiyatiga oladi.",
  "Xizmat narxi shartnoma imzolangandan so'ng o'zgartirilmaydi.",
  "Bemor shaxsiy ma'lumotlarini qayta ishlashga rozilik beradi.",
  "To'lov qilingandan so'ng xizmat ko'rsatish 24 soat ichida boshlanadi.",
  "Xulosa tayyor bo'lgach, bemor Telegram/SMS orqali xabardor qilinadi.",
];

function Step3({ onClose }: { onClose: () => void }) {
  const [payMethod, setPayMethod] = useState<string>('payme');
  const [agreed,    setAgreed]    = useState(false);
  const [paid,      setPaid]      = useState(false);
  const [cardNum,   setCardNum]   = useState('');
  const [amount,    setAmount]    = useState('');

  const SERVICE_SUM = 300_000;
  const DISCOUNT    = 30_000;
  const FINAL_SUM   = SERVICE_SUM - DISCOUNT;

  function handlePay() {
    if (!agreed) return;
    setPaid(true);
  }

  const selectedMethod = PAYMENT_METHODS.find(m => m.key === payMethod);

  if (paid) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8 px-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">To'lov muvaffaqiyatli!</h3>
          <p className="text-gray-500 mt-1.5 text-sm">Ariza ro'yxatga olindi va ko'rib chiqishga yuborildi</p>
        </div>
        <div className="w-full max-w-sm bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
          {[
            { label: 'Ariza raqami', value: 'RAD-2026-000052' },
            { label: 'Summa',       value: `${(FINAL_SUM/1000).toFixed(0)} 000 so'm` },
            { label: "To'lov usuli", value: selectedMethod?.label || '' },
            { label: 'Holat',       value: "Ko'rib chiqilmoqda" },
          ].map(r => (
            <div key={r.label} className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{r.label}</span>
              <span className="text-sm font-semibold text-gray-800">{r.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center">
          Natija tayyor bo'lgach Telegram va SMS orqali xabar keladi
        </p>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Chek yuklash
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex gap-6 overflow-hidden px-8 py-5">

        {/* ── CHAP: Shartnoma ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-base">📋</span>
              <p className="text-sm font-bold text-gray-700">Xizmat ko'rsatish shartnomasi</p>
              <span className="ml-auto text-xs text-gray-400">№ SH-2026-0052</span>
            </div>
            <div className="p-5">
              {/* Parties */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5">Xizmat ko'rsatuvchi</p>
                  <p className="text-sm font-semibold text-gray-800">SNS MED CLINIC</p>
                  <p className="text-xs text-gray-500 mt-0.5">Litsenziya: LIC-2024-00456</p>
                  <p className="text-xs text-gray-500">Buxoro sh., Mustaqillik k. 45</p>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Bemor</p>
                  <p className="text-sm font-semibold text-gray-800">Karimov Aziz Baxtiyorovich</p>
                  <p className="text-xs text-gray-500 mt-0.5">JSHSHIR: 12345678901234</p>
                  <p className="text-xs text-gray-500">Pasport: AB1234567</p>
                </div>
              </div>

              {/* Service table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
                  <div className="col-span-2">Xizmat</div>
                  <div className="text-right">Narx</div>
                  <div className="text-right">Chegirma</div>
                  <div className="text-right">Jami</div>
                </div>
                <div className="px-4 py-3">
                  <div className="grid grid-cols-5 gap-2 items-center">
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-800">Radiologiya xizmati</p>
                      <p className="text-xs text-gray-500">MRT · Bosh · 🟡 Tezkor</p>
                    </div>
                    <p className="text-sm text-gray-700 text-right">300 000</p>
                    <p className="text-sm text-emerald-600 font-medium text-right">−30 000</p>
                    <p className="text-sm font-bold text-gray-900 text-right">270 000</p>
                  </div>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-700">Jami to'lanishi kerak:</span>
                  <span className="text-lg font-bold text-emerald-700">270 000 so'm</span>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 max-h-44 overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Shartnoma shartlari</p>
                <ol className="space-y-2">
                  {CONTRACT_TERMS.map((term, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="text-xs font-bold text-gray-400 shrink-0">{i + 1}.</span>
                      <p className="text-xs text-gray-600 leading-relaxed">{term}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Agree */}
              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <div
                  onClick={() => setAgreed(v => !v)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                    ${agreed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-emerald-400'}`}
                >
                  {agreed && <Check className="w-3 h-3 text-white" />}
                </div>
                <p className="text-sm text-gray-600">
                  Shartnoma shartlari bilan tanishib chiqdim va <span className="font-semibold text-gray-800">roziman</span>.
                  Shaxsiy ma'lumotlarni qayta ishlashga rozilik beraman.
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* ── O'RTA: To'lov ── */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-base">💰</span>
              <p className="text-sm font-bold text-gray-700">To'lov</p>
            </div>
            <div className="p-4 space-y-3">
              {/* Amount breakdown */}
              <div className="space-y-1.5">
                {[
                  { label: 'Xizmat narxi', value: `${(SERVICE_SUM/1000).toFixed(0)} 000 so'm`, muted: true },
                  { label: 'Chegirma (10%)', value: `−${(DISCOUNT/1000).toFixed(0)} 000 so'm`, green: true },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{r.label}</span>
                    <span className={r.green ? 'text-emerald-600 font-medium' : 'text-gray-700'}>{r.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-700">To'lanadi:</span>
                  <span className="text-xl font-bold text-gray-900">{(FINAL_SUM/1000).toFixed(0)} 000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">To'lov usuli</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-1.5">
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setPayMethod(m.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all
                    ${payMethod === m.key ? m.color + ' ring-1 ring-current' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <span>{m.icon}</span>{m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card input (for card methods) */}
          {['payme', 'click', 'uzum', 'uzcard', 'humo'].includes(payMethod) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Karta ma'lumotlari</p>
              </div>
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNum}
                  onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  maxLength={19}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 tracking-widest"
                />
                <input
                  type="text" placeholder="MM/YY"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
            </motion.div>
          )}

          {/* Naqd amount */}
          {payMethod === 'naqd' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Naqd to'lov</p>
              </div>
              <div className="p-3 space-y-2">
                <input type="number" placeholder="Qabul qilingan summa (so'm)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={amount} onChange={e => setAmount(e.target.value)} />
                {amount && Number(amount) >= FINAL_SUM && (
                  <p className="text-xs text-emerald-600 font-medium">
                    Qaytim: {(Number(amount) - FINAL_SUM).toLocaleString()} so'm
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-7 py-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>SSL · Xavfsiz to'lov</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">
            Yopish
          </button>
          <button
            onClick={handlePay}
            disabled={!agreed}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2
              ${agreed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <span>{selectedMethod?.icon}</span>
            {(FINAL_SUM / 1000).toFixed(0)} 000 so'm to'lash
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Asosiy Modal ──────────────────────────────────────────────────────────────

const STEPS = ["Ro'yxatga olish", "Tibbiy ma'lumotlari", "Shartnoma va to'lov"];

export function WebBemorModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2"
      style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full bg-gray-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth: '1560px', maxHeight: '97vh', minHeight: '800px' }}
      >
        {/* ── HEADER ── */}
        <div className="px-7 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-base tracking-tight">
              RO'YXATGA OLISH –{' '}
              <span className="text-emerald-600">Operator uchun</span>
            </h2>
            <button onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center">
            {STEPS.map((label, i) => {
              const active = i === step;
              const done   = i < step;
              const isLast = i === STEPS.length - 1;
              return (
                <React.Fragment key={i}>
                  <button
                    onClick={() => i <= step && setStep(i)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border
                      ${active
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                        : done
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer hover:bg-emerald-100'
                          : 'bg-white text-gray-400 border-gray-200 cursor-default'
                      }`}
                  >
                    {done && <Check className="w-3.5 h-3.5" />}
                    {label}
                  </button>
                  {!isLast && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {step === 0 && <Step1 onNext={() => setStep(1)} onClose={onClose} />}
            {step === 1 && <Step2 onClose={onClose} onNext={() => setStep(2)} />}
            {step === 2 && <Step3 onClose={onClose} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
