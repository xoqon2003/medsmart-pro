/**
 * WebSozlamalarScreen — Tizim va profil sozlamalari
 * Tablar: Profil · Xavfsizlik · Klinika · Bildirishnomalar · Ko'rinish · Integratsiyalar
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Shield, Building2, Bell, Palette, Plug,
  Camera, Phone, Mail, MapPin, Lock, Key, Smartphone,
  Monitor, Globe, Check, ChevronRight, Eye, EyeOff,
  Save, RefreshCw, LogOut, Trash2, Plus, ExternalLink,
  Sun, Moon, Languages, Clock, CreditCard, AlertTriangle,
  CheckCircle2, Toggle, Info, Copy, RotateCcw, Zap,
} from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useApp } from '../../../store/appStore';

// ── Types ─────────────────────────────────────────────────────────────────────

type SozlamalarTab = 'profil' | 'xavfsizlik' | 'klinika' | 'bildirishnomalar' | 'korinish' | 'integratsiyalar';

// ── Shared UI ─────────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children, icon }: {
  title: string; subtitle?: string; children: React.ReactNode; icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-500">{icon}</div>}
          <div>
            <h3 className="text-sm font-bold text-gray-800">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldRow({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <label className="text-sm font-medium text-gray-600">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";

function Toggle2({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-emerald-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function SaveBtn({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
        ${saved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'}`}
    >
      {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saved ? 'Saqlandi!' : 'Saqlash'}
    </button>
  );
}

// ── TAB: Profil ───────────────────────────────────────────────────────────────

function TabProfil() {
  const { currentUser } = useApp();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    lastName: 'Raximov', firstName: 'Aziz', middleName: 'Karimovich',
    phone: '+998 90 123 45 67', email: 'aziz.rahimov@mednexpert.uz',
    birthDate: '1985-06-12', gender: 'male',
    city: 'Buxoro', specialty: 'Tizim administratori', bio: '',
    language: 'uz',
  });

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <SectionCard title="Profil rasmi" icon={<Camera className="w-4 h-4" />}>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {form.lastName[0]}{form.firstName[0]}
            </div>
            <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors">
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{form.lastName} {form.firstName} {form.middleName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{form.specialty || 'Admin'} · {form.city}</p>
            <div className="flex gap-2 mt-2">
              <button className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                Rasm yuklash
              </button>
              <button className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors">
                O'chirish
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Shaxsiy */}
      <SectionCard title="Shaxsiy ma'lumotlar" icon={<User className="w-4 h-4" />}>
        <div className="space-y-4">
          <FieldRow label="Familiya" required>
            <input className={inp} value={form.lastName} onChange={e => f('lastName', e.target.value)} />
          </FieldRow>
          <FieldRow label="Ism" required>
            <input className={inp} value={form.firstName} onChange={e => f('firstName', e.target.value)} />
          </FieldRow>
          <FieldRow label="Sharif">
            <input className={inp} value={form.middleName} onChange={e => f('middleName', e.target.value)} />
          </FieldRow>
          <FieldRow label="Tug'ilgan sana">
            <input type="date" className={inp} value={form.birthDate} onChange={e => f('birthDate', e.target.value)} />
          </FieldRow>
          <FieldRow label="Jinsi">
            <div className="flex gap-3">
              {[{ v: 'male', l: 'Erkak' }, { v: 'female', l: 'Ayol' }].map(({ v, l }) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => f('gender', v)}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                      ${form.gender === v ? 'border-blue-500' : 'border-gray-300'}`}
                  >
                    {form.gender === v && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <span className="text-sm text-gray-700">{l}</span>
                </label>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Shahar">
            <input className={inp} value={form.city} onChange={e => f('city', e.target.value)} placeholder="Buxoro" />
          </FieldRow>
          <FieldRow label="Mutaxassislik">
            <input className={inp} value={form.specialty} onChange={e => f('specialty', e.target.value)} placeholder="Tizim administratori" />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Aloqa */}
      <SectionCard title="Aloqa ma'lumotlari" icon={<Phone className="w-4 h-4" />}>
        <div className="space-y-4">
          <FieldRow label="Telefon" required>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-gray-500">
                <span>🇺🇿</span>
                <span>+998</span>
              </div>
              <input className={`${inp} pl-20`} value={form.phone.replace('+998 ', '')} onChange={e => f('phone', '+998 ' + e.target.value)} />
            </div>
          </FieldRow>
          <FieldRow label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" className={`${inp} pl-9`} value={form.email} onChange={e => f('email', e.target.value)} />
            </div>
          </FieldRow>
          <FieldRow label="Til">
            <div className="flex gap-2">
              {[{ v: 'uz', l: "O'zbek" }, { v: 'ru', l: 'Русский' }].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => f('language', v)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border
                    ${form.language === v ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex justify-end">
        <SaveBtn onClick={handleSave} saved={saved} />
      </div>
    </div>
  );
}

// ── TAB: Xavfsizlik ───────────────────────────────────────────────────────────

function TabXavfsizlik() {
  const [show, setShow] = useState({ cur: false, new1: false, new2: false });
  const [pass, setPass] = useState({ cur: '', new1: '', new2: '' });
  const [tfa, setTfa] = useState(false);
  const [saved, setSaved] = useState(false);

  const strength = (() => {
    const p = pass.new1;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const sessions = [
    { id: 1, device: 'Chrome · Windows 11', ip: '192.168.1.45', location: 'Buxoro', time: '5 daqiqa oldin', current: true },
    { id: 2, device: 'Firefox · MacOS', ip: '10.0.0.12', location: 'Toshkent', time: '2 soat oldin', current: false },
  ];

  return (
    <div className="space-y-5">
      {/* Parol */}
      <SectionCard title="Parolni o'zgartirish" icon={<Lock className="w-4 h-4" />}>
        <div className="space-y-4">
          <FieldRow label="Joriy parol" required>
            <div className="relative">
              <input type={show.cur ? 'text' : 'password'} className={`${inp} pr-10`}
                value={pass.cur} onChange={e => setPass(p => ({ ...p, cur: e.target.value }))}
                placeholder="••••••••" />
              <button onClick={() => setShow(p => ({ ...p, cur: !p.cur }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show.cur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FieldRow>
          <FieldRow label="Yangi parol" required>
            <div className="space-y-2">
              <div className="relative">
                <input type={show.new1 ? 'text' : 'password'} className={`${inp} pr-10`}
                  value={pass.new1} onChange={e => setPass(p => ({ ...p, new1: e.target.value }))}
                  placeholder="Kamida 8 ta belgi" />
                <button onClick={() => setShow(p => ({ ...p, new1: !p.new1 }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.new1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength */}
              {pass.new1 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors
                        ${i <= strength ? (strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-amber-400' : strength <= 3 ? 'bg-blue-400' : 'bg-emerald-400') : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-[10px] font-medium ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-amber-500' : strength <= 3 ? 'text-blue-500' : 'text-emerald-500'}`}>
                    {strength <= 1 ? 'Zaif' : strength <= 2 ? "O'rtacha" : strength <= 3 ? 'Yaxshi' : 'Juda kuchli'}
                  </p>
                </div>
              )}
            </div>
          </FieldRow>
          <FieldRow label="Tasdiqlash" required>
            <div className="relative">
              <input type={show.new2 ? 'text' : 'password'} className={`${inp} pr-10`}
                value={pass.new2} onChange={e => setPass(p => ({ ...p, new2: e.target.value }))}
                placeholder="Yangi parolni qayta kiriting" />
              <button onClick={() => setShow(p => ({ ...p, new2: !p.new2 }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show.new2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pass.new2 && pass.new1 !== pass.new2 && (
              <p className="text-xs text-red-500 mt-1">Parollar mos kelmadi</p>
            )}
          </FieldRow>
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
              <Key className="w-4 h-4" />
              Parolni yangilash
            </button>
          </div>
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard title="Ikki faktorli autentifikatsiya" subtitle="Kirish xavfsizligini oshirish" icon={<Shield className="w-4 h-4" />}>
        <Toggle2
          checked={tfa}
          onChange={setTfa}
          label="Google Authenticator / SMS orqali 2FA"
          description="Har safar kirishda qo'shimcha tasdiqlash kodi talab etiladi"
        />
        {tfa && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Google Authenticator ilovasini yuklab, QR kodni skanerlang.
                So'ng tasdiqlash kodini kiriting.
              </p>
            </div>
            <button className="mt-3 text-xs text-amber-700 font-semibold underline">
              QR kodni ko'rish →
            </button>
          </motion.div>
        )}
      </SectionCard>

      {/* Active sessions */}
      <SectionCard title="Faol seanslar" subtitle="Barcha kirish qurilmalari" icon={<Monitor className="w-4 h-4" />}>
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors
              ${s.current ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
              <Monitor className={`w-5 h-5 shrink-0 ${s.current ? 'text-emerald-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-800">{s.device}</p>
                  {s.current && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Joriy</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{s.ip} · {s.location} · {s.time}</p>
              </div>
              {!s.current && (
                <button className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded-lg transition-colors">
                  Tugatish
                </button>
              )}
            </div>
          ))}
          <button className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5 mt-2">
            <LogOut className="w-3.5 h-3.5" />
            Barcha qurilmalardan chiqish
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ── TAB: Klinika ──────────────────────────────────────────────────────────────

function TabKlinika() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: 'SNS MED CLINIC', legalName: 'SNS Med Clinic MCHJ',
    inn: '123456789', licenseNum: 'LIC-2024-00456',
    phone: '+998 65 221 00 11', email: 'info@snsmed.uz',
    website: 'www.snsmed.uz', address: "Buxoro sh., Mustaqillik ko'chasi, 45",
    region: 'Buxoro', workStart: '08:00', workEnd: '20:00',
    lunchStart: '13:00', lunchEnd: '14:00',
    description: '',
  });

  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const daysOpen = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const [openDays, setOpenDays] = useState(new Set(daysOpen.slice(0, 5)));

  return (
    <div className="space-y-5">
      {/* Asosiy */}
      <SectionCard title="Klinika asosiy ma'lumotlari" icon={<Building2 className="w-4 h-4" />}>
        <div className="space-y-4">
          <FieldRow label="Klinika nomi" required>
            <input className={inp} value={form.name} onChange={e => f('name', e.target.value)} />
          </FieldRow>
          <FieldRow label="Yuridik nomi">
            <input className={inp} value={form.legalName} onChange={e => f('legalName', e.target.value)} />
          </FieldRow>
          <div className="grid grid-cols-2 gap-4 col-span-1">
            <FieldRow label="INN">
              <input className={inp} value={form.inn} onChange={e => f('inn', e.target.value)} />
            </FieldRow>
          </div>
          <FieldRow label="Litsenziya raqami">
            <input className={inp} value={form.licenseNum} onChange={e => f('licenseNum', e.target.value)} />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Aloqa */}
      <SectionCard title="Aloqa va manzil" icon={<MapPin className="w-4 h-4" />}>
        <div className="space-y-4">
          <FieldRow label="Telefon" required>
            <input className={inp} value={form.phone} onChange={e => f('phone', e.target.value)} />
          </FieldRow>
          <FieldRow label="Email">
            <input type="email" className={inp} value={form.email} onChange={e => f('email', e.target.value)} />
          </FieldRow>
          <FieldRow label="Veb-sayt">
            <input className={inp} value={form.website} onChange={e => f('website', e.target.value)} placeholder="www.klinika.uz" />
          </FieldRow>
          <FieldRow label="Viloyat">
            <select className={`${inp} appearance-none cursor-pointer`} value={form.region} onChange={e => f('region', e.target.value)}>
              {['Toshkent', 'Buxoro', 'Samarqand', "Farg'ona", 'Namangan', 'Andijon', 'Xorazm', 'Qashqadaryo', 'Surxondaryo', 'Sirdaryo', 'Jizzax', 'Navoiy', "Qoraqalpog'iston"].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Manzil" required>
            <textarea className={`${inp} resize-none`} rows={2} value={form.address} onChange={e => f('address', e.target.value)} />
          </FieldRow>
        </div>
      </SectionCard>

      {/* Ish vaqti */}
      <SectionCard title="Ish vaqti va grafigi" icon={<Clock className="w-4 h-4" />}>
        <div className="space-y-4">
          <FieldRow label="Ish soati">
            <div className="flex items-center gap-3">
              <input type="time" className={`${inp} w-32`} value={form.workStart} onChange={e => f('workStart', e.target.value)} />
              <span className="text-gray-500 text-sm">—</span>
              <input type="time" className={`${inp} w-32`} value={form.workEnd} onChange={e => f('workEnd', e.target.value)} />
            </div>
          </FieldRow>
          <FieldRow label="Tushlik">
            <div className="flex items-center gap-3">
              <input type="time" className={`${inp} w-32`} value={form.lunchStart} onChange={e => f('lunchStart', e.target.value)} />
              <span className="text-gray-500 text-sm">—</span>
              <input type="time" className={`${inp} w-32`} value={form.lunchEnd} onChange={e => f('lunchEnd', e.target.value)} />
            </div>
          </FieldRow>
          <FieldRow label="Ish kunlari">
            <div className="flex flex-wrap gap-2">
              {[...daysOpen, 'Yakshanba'].map(day => {
                const isOpen = openDays.has(day);
                return (
                  <button
                    key={day}
                    onClick={() => {
                      const s = new Set(openDays);
                      isOpen ? s.delete(day) : s.add(day);
                      setOpenDays(s);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border
                      ${isOpen ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} saved={saved} />
      </div>
    </div>
  );
}

// ── TAB: Bildirishnomalar ─────────────────────────────────────────────────────

function TabBildirishnomalar() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    newAriza: { app: true, sms: true, telegram: true, email: false },
    tolov: { app: true, sms: false, telegram: true, email: true },
    xulosa: { app: true, sms: true, telegram: true, email: false },
    shoshilinch: { app: true, sms: true, telegram: true, email: true },
    tizim: { app: true, sms: false, telegram: false, email: true },
    sound: true,
    quietStart: '22:00',
    quietEnd: '08:00',
  });

  const channels = [
    { key: 'app',      icon: <Monitor className="w-3.5 h-3.5" />,  label: 'Ilova' },
    { key: 'sms',      icon: <Phone className="w-3.5 h-3.5" />,    label: 'SMS' },
    { key: 'telegram', icon: <Zap className="w-3.5 h-3.5" />,      label: 'Telegram' },
    { key: 'email',    icon: <Mail className="w-3.5 h-3.5" />,     label: 'Email' },
  ];

  const events = [
    { key: 'newAriza',    label: 'Yangi ariza', desc: 'Yangi ariza qabul qilinganda', color: 'text-blue-500' },
    { key: 'tolov',       label: "To'lov", desc: "To'lov qabul qilinganda / muddati o'tganda", color: 'text-emerald-500' },
    { key: 'xulosa',      label: 'Xulosa', desc: 'Xulosa tayyorlanganda', color: 'text-violet-500' },
    { key: 'shoshilinch', label: 'Shoshilinch', desc: 'Favqulodda yoki tezkor ariza', color: 'text-red-500' },
    { key: 'tizim',       label: 'Tizim', desc: 'Yangilanishlar va texnik xabarlar', color: 'text-gray-500' },
  ] as const;

  type EventKey = typeof events[number]['key'];
  type ChannelKey = 'app' | 'sms' | 'telegram' | 'email';

  const toggle = (event: EventKey, channel: ChannelKey) => {
    setSettings(p => ({
      ...p,
      [event]: { ...(p[event] as Record<ChannelKey, boolean>), [channel]: !(p[event] as Record<ChannelKey, boolean>)[channel] },
    }));
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Bildirishnoma kanallari" subtitle="Har bir hodisa uchun qaysi kanaldan xabar olishni belgilang" icon={<Bell className="w-4 h-4" />}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 pb-3 w-48">Hodisa</th>
                {channels.map(ch => (
                  <th key={ch.key} className="text-center text-xs font-semibold text-gray-500 pb-3 w-24">
                    <div className="flex flex-col items-center gap-1">
                      {ch.icon}{ch.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.key} className="border-t border-gray-100">
                  <td className="py-3.5 pr-4">
                    <p className={`text-sm font-semibold ${ev.color}`}>{ev.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{ev.desc}</p>
                  </td>
                  {channels.map(ch => {
                    const checked = (settings[ev.key] as Record<ChannelKey, boolean>)[ch.key as ChannelKey];
                    return (
                      <td key={ch.key} className="py-3.5 text-center">
                        <button
                          onClick={() => toggle(ev.key, ch.key as ChannelKey)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all
                            ${checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white hover:border-blue-300'}`}
                        >
                          {checked && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Ovoz va rejim" icon={<Bell className="w-4 h-4" />}>
        <div className="space-y-1">
          <Toggle2
            checked={settings.sound}
            onChange={v => setSettings(p => ({ ...p, sound: v }))}
            label="Bildirishnoma ovozi"
            description="Yangi xabar kelganda ovozli signal"
          />
          <FieldRow label="Jim rejim (Dan)">
            <div className="flex items-center gap-3">
              <input type="time" className={`${inp} w-32`} value={settings.quietStart}
                onChange={e => setSettings(p => ({ ...p, quietStart: e.target.value }))} />
              <span className="text-gray-500 text-sm">—</span>
              <input type="time" className={`${inp} w-32`} value={settings.quietEnd}
                onChange={e => setSettings(p => ({ ...p, quietEnd: e.target.value }))} />
              <span className="text-xs text-gray-500">Shoshilinchlar bundan mustasno</span>
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} saved={saved} />
      </div>
    </div>
  );
}

// ── TAB: Ko'rinish ────────────────────────────────────────────────────────────

function TabKorinish() {
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [density, setDensity] = useState<'comfortable' | 'compact' | 'spacious'>('comfortable');
  const [fontSize, setFontSize] = useState(14);
  const [lang, setLang] = useState<'uz' | 'ru'>('uz');

  return (
    <div className="space-y-5">
      <SectionCard title="Rang mavzusi" icon={<Palette className="w-4 h-4" />}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: 'light', icon: <Sun className="w-5 h-5" />, label: "Yorug'", bg: 'bg-gray-50 border-gray-300' },
            { v: 'dark',  icon: <Moon className="w-5 h-5" />, label: "Qorang'i", bg: 'bg-slate-800 border-slate-600' },
            { v: 'auto',  icon: <Monitor className="w-5 h-5" />, label: 'Tizim', bg: 'bg-gradient-to-br from-gray-100 to-slate-200 border-gray-300' },
          ].map(({ v, icon, label, bg }) => (
            <button
              key={v}
              onClick={() => setTheme(v as typeof theme)}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all
                ${theme === v ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className={`w-full h-16 rounded-xl flex items-center justify-center text-2xl border ${bg}`}>
                {icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
              {theme === v && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Interfeys sozlamalari" icon={<Monitor className="w-4 h-4" />}>
        <div className="space-y-4">
          <FieldRow label="Zichlik">
            <div className="flex gap-2">
              {[
                { v: 'compact', l: 'Ixcham' },
                { v: 'comfortable', l: 'Qulay' },
                { v: 'spacious', l: 'Keng' },
              ].map(({ v, l }) => (
                <button key={v} onClick={() => setDensity(v as typeof density)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
                    ${density === v ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  {l}
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label="Shrift o'lchami">
            <div className="flex items-center gap-3">
              <button onClick={() => setFontSize(p => Math.max(12, p - 1))} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold">−</button>
              <span className="w-12 text-center text-sm font-semibold text-gray-700">{fontSize}px</span>
              <button onClick={() => setFontSize(p => Math.min(18, p + 1))} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold">+</button>
              <button onClick={() => setFontSize(14)} className="text-xs text-gray-400 hover:text-gray-600 ml-2">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </FieldRow>
          <FieldRow label="Tizim tili">
            <div className="flex gap-2">
              {[{ v: 'uz', l: "🇺🇿 O'zbek" }, { v: 'ru', l: '🇷🇺 Русский' }].map(({ v, l }) => (
                <button key={v} onClick={() => setLang(v as 'uz' | 'ru')}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
                    ${lang === v ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  {l}
                </button>
              ))}
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveBtn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} saved={saved} />
      </div>
    </div>
  );
}

// ── TAB: Integratsiyalar ──────────────────────────────────────────────────────

function TabIntegratsiyalar() {
  const [keys, setKeys] = useState({
    paymeKey: 'pk_live_••••••••••••••••••••••••',
    clickKey: '',
    uzumKey: '',
    eskizKey: 'ek_••••••••••••••',
    telegramToken: '7123456789:AAH••••••••••••••',
    myidClientId: '',
  });

  function KeyField({ label, keyK, desc, badge, connected }: {
    label: string; keyK: keyof typeof keys; desc: string; badge: string; connected: boolean;
  }) {
    const [show, setShow] = useState(false);
    return (
      <div className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border
              ${connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
              {connected ? 'Ulangan' : 'Ulanmagan'}
            </span>
          </div>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{badge}</span>
        </div>
        <p className="text-xs text-gray-500">{desc}</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={show ? 'text' : 'password'}
              value={keys[keyK]}
              onChange={e => setKeys(p => ({ ...p, [keyK]: e.target.value }))}
              placeholder={`${label} API kaliti`}
              className={`${inp} pr-9 font-mono text-xs`}
            />
            <button onClick={() => setShow(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {keys[keyK] && (
            <button className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          <button className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors border
            ${connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {connected ? 'Test' : 'Ulash'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionCard title="To'lov tizimlari" subtitle="Mijozlardan onlayn to'lov qabul qilish" icon={<CreditCard className="w-4 h-4" />}>
        <div className="space-y-3">
          <KeyField label="Payme" keyK="paymeKey" desc="O'zbekistoning eng ommabop to'lov tizimi" badge="payme.uz" connected={!!keys.paymeKey} />
          <KeyField label="Click" keyK="clickKey" desc="Click.uz orqali to'lov qabul qilish" badge="click.uz" connected={!!keys.clickKey} />
          <KeyField label="Uzum Bank" keyK="uzumKey" desc="Uzum Bank to'lov tizimi" badge="uzumbank.uz" connected={!!keys.uzumKey} />
        </div>
      </SectionCard>

      <SectionCard title="Xabar yuborish" subtitle="SMS va Telegram xabarlari" icon={<MessageSquare className="w-4 h-4" />}>
        <div className="space-y-3">
          <KeyField label="Eskiz.uz SMS" keyK="eskizKey" desc="SMS xabarlar yuborish uchun (ariza holati, to'lov)" badge="eskiz.uz" connected={!!keys.eskizKey} />
          <KeyField label="Telegram Bot" keyK="telegramToken" desc="Bemor va xodimlar uchun Telegram bot" badge="@BotFather" connected={!!keys.telegramToken} />
        </div>
      </SectionCard>

      <SectionCard title="Identifikatsiya" subtitle="MyID — O'zbekiston raqamli shaxsiy guvohnoma" icon={<Shield className="w-4 h-4" />}>
        <div className="space-y-3">
          <KeyField label="MyID" keyK="myidClientId" desc="Pasport va biometrik ma'lumotlarni tekshirish uchun" badge="myid.uz" connected={!!keys.myidClientId} />
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">MyID integratsiyasi uchun E-government portali orqali ariza berishingiz kerak. <a href="#" className="font-semibold underline">Ko'proq ma'lumot →</a></p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function WebSozlamalarScreen() {
  const [activeTab, setActiveTab] = useState<SozlamalarTab>('profil');

  const tabs: { key: SozlamalarTab; label: string; icon: React.ReactNode }[] = [
    { key: 'profil',            label: 'Profil',             icon: <User className="w-4 h-4" /> },
    { key: 'xavfsizlik',        label: 'Xavfsizlik',         icon: <Shield className="w-4 h-4" /> },
    { key: 'klinika',           label: 'Klinika',            icon: <Building2 className="w-4 h-4" /> },
    { key: 'bildirishnomalar',  label: 'Bildirishnomalar',   icon: <Bell className="w-4 h-4" /> },
    { key: 'korinish',          label: "Ko'rinish",          icon: <Palette className="w-4 h-4" /> },
    { key: 'integratsiyalar',   label: 'Integratsiyalar',    icon: <Plug className="w-4 h-4" /> },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'profil':           return <TabProfil />;
      case 'xavfsizlik':       return <TabXavfsizlik />;
      case 'klinika':          return <TabKlinika />;
      case 'bildirishnomalar': return <TabBildirishnomalar />;
      case 'korinish':         return <TabKorinish />;
      case 'integratsiyalar':  return <TabIntegratsiyalar />;
    }
  };

  return (
    <WebPlatformLayout title="Sozlamalar">
      <div className="flex h-full overflow-hidden">

        {/* ── LEFT TABS ── */}
        <aside className="w-52 shrink-0 flex flex-col border-r border-gray-200 bg-white py-4">
          {tabs.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-5 py-3 text-sm transition-all text-left border-r-2
                  ${active
                    ? 'bg-blue-50 text-blue-700 font-semibold border-blue-400'
                    : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-800'}`}
              >
                <span className={active ? 'text-blue-600' : 'text-gray-400'}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-2xl mx-auto px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
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
