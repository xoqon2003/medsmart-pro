/**
 * MedSmartPro — Web Platform Entry (Login)
 * Desktop-first | Professional | Multi-auth
 * Arxitektura: Single API → Multi-platform
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope, Shield, Zap, BarChart3, Users, FileText,
  Phone, Mail, ChevronRight, Eye, EyeOff, Loader2,
  ArrowLeft, CheckCircle2, AlertCircle, Lock, Fingerprint,
  Building2, Globe, Smartphone, Send,
  Activity, Clock, TrendingUp, Star,
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { authService } from '../../../../services';
import type { UserRole } from '../../../types';

// ── Demo kirish ma'lumotlari ───────────────────────────────────────────────
const DEMO_CREDENTIALS: Record<string, { phone: string; pin: string; role: UserRole; userId: number }> = {
  admin:      { phone: '+998903333333', pin: '000000', role: 'admin',     userId: 4 },
  operator:   { phone: '+998902222222', pin: '654321', role: 'operator',  userId: 3 },
  kassir:     { phone: '+998908888888', pin: '222222', role: 'kassir',    userId: 9 },
  radiolog:   { phone: '+998901111111', pin: '123456', role: 'radiolog',  userId: 2 },
  specialist: { phone: '+998906666666', pin: '111111', role: 'specialist',userId: 7 },
  doctor:     { phone: '+998907777777', pin: '777777', role: 'doctor',    userId: 8 },
  patient:    { phone: '+998901234567', pin: '0000',   role: 'patient',   userId: 1 },
};

type AuthStep = 'entry' | 'phone_otp' | 'email' | 'verify_otp' | 'success';
type AuthMethod = 'phone' | 'email' | 'telegram' | 'myid';

// ── Statistikalar (ko'rsatma uchun) ───────────────────────────────────────
const STATS = [
  { value: '12,400+', label: 'Bemorlar',       icon: Users },
  { value: '340+',    label: 'Shifokorlar',     icon: Stethoscope },
  { value: '99.8%',   label: 'Ishonchlilik',    icon: Shield },
  { value: '4.9★',    label: 'Reyting',         icon: Star },
];

const FEATURES = [
  { icon: Activity,    title: 'Real-time monitoring',   desc: 'Barcha jarayonlar jonli kuzatuv' },
  { icon: FileText,    title: 'Raqamli hujjatlar',      desc: 'Shartnoma, xulosa, chek — PDF' },
  { icon: BarChart3,   title: 'Analitika va hisobot',   desc: 'KPI, daromad, grafik' },
  { icon: Shield,      title: 'Ma\'lumot xavfsizligi',  desc: 'HIPAA, SSL, shifrlash' },
];

const PLATFORMS = [
  { icon: Globe,       label: 'Web platforma',    active: true  },
  { icon: Smartphone,  label: 'Telegram Mini App', active: true  },
  { icon: Building2,   label: 'Mobile ilova',     active: false },
];

// ── Asosiy komponent ───────────────────────────────────────────────────────

export function WebPlatformLogin() {
  const { setUser, navigate } = useApp();
  const [step, setStep]         = useState<AuthStep>('entry');
  const [method, setMethod]     = useState<AuthMethod>('phone');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [remember, setRemember] = useState(false);
  const [users, setUsers]       = useState<Awaited<ReturnType<typeof authService.getUsers>>>([]);

  // Foydalanuvchilar yuklanadi
  React.useEffect(() => {
    authService.getUsers().then(setUsers);
  }, []);

  // ── OTP input boshqaruv ───
  const otpRefs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null));
  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus();
  };

  // ── Telefon bilan kirish ───
  const handlePhoneSend = async () => {
    if (phone.replace(/\D/g, '').length < 9) { setError("Telefon raqam to'liq emas"); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('verify_otp');
  };

  // ── OTP tasdiqlash ───
  const handleOtpVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('6 xonali kodni kiriting'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    // Demo: raqam bo'yicha foydalanuvchi topish
    const cleanPhone = phone.replace(/\D/g, '');
    const entry = Object.values(DEMO_CREDENTIALS).find(
      c => c.phone.replace(/\D/g, '') === cleanPhone || c.pin === code
    );
    const user = entry ? users.find(u => u.id === entry.userId) : users[0];
    if (user) {
      setUser(user);
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        const role = user.role;
        if (role === 'patient') navigate('patient_home');
        else navigate('web_dashboard');
      }, 1500);
    } else {
      setError("Kod noto'g'ri yoki foydalanuvchi topilmadi");
      setLoading(false);
    }
  };

  // ── Email + parol bilan kirish ───
  const handleEmailLogin = async () => {
    if (!email || !password) { setError("Email va parolni kiriting"); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const entry = Object.values(DEMO_CREDENTIALS).find(c => c.pin === password);
    const user = entry ? users.find(u => u.id === entry.userId) : users[3];
    if (user) {
      setUser(user);
      setLoading(false);
      setStep('success');
      setTimeout(() => navigate('web_dashboard'), 1500);
    } else {
      setError("Email yoki parol noto'g'ri");
      setLoading(false);
    }
  };

  // ── Demo tezkor kirish ───
  const handleQuickDemo = async (key: string) => {
    const cred = DEMO_CREDENTIALS[key];
    if (!cred) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const user = users.find(u => u.id === cred.userId);
    if (user) {
      setUser(user);
      setStep('success');
      setTimeout(() => {
        if (cred.role === 'patient') navigate('patient_home');
        else navigate('web_dashboard');
      }, 1200);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex overflow-hidden" style={{ maxWidth: '100vw' }}>

      {/* ══════════════ CHAP PANEL — Branding ══════════════ */}
      <div className="hidden lg:flex flex-col w-[46%] xl:w-[42%] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)' }}
      >
        {/* Fon dekor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}
          />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
        </div>

        <div className="relative flex flex-col h-full p-8 xl:p-10 z-10">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">MedSmartPro</p>
              <p className="text-indigo-400 text-xs">Tibbiy SaaS Platformasi</p>
            </div>
          </motion.div>

          {/* Asosiy matn */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-10">
            <h1 className="text-white text-3xl xl:text-4xl font-bold leading-tight mb-4">
              Zamonaviy tibbiyot
              <span className="block" style={{ background: 'linear-gradient(90deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                raqamli tizimda
              </span>
            </h1>
            <p className="text-slate-400 text-sm xl:text-base leading-relaxed">
              Barcha tibbiy jarayonlar — buyurtmalar, to'lovlar, xulosalar, hisobotlar —
              bitta kuchli platformada.
            </p>
          </motion.div>

          {/* Statistika */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-3 mb-10"
          >
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="rounded-xl p-3 border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-400 text-xs">{s.label}</span>
                  </div>
                  <p className="text-white font-bold text-lg">{s.value}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Xususiyatlar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-3 mb-10">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(99,102,241,0.2)' }}>
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{f.title}</p>
                    <p className="text-slate-500 text-xs">{f.desc}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Platformalar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <p className="text-slate-500 text-xs mb-2 uppercase tracking-widest">Ishlash platformalari</p>
            <div className="flex gap-2">
              {PLATFORMS.map(p => {
                const Icon = p.icon;
                return (
                  <div key={p.label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${
                      p.active
                        ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10'
                        : 'text-slate-600 border border-slate-700/30 bg-slate-800/30'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{p.label}</span>
                    {!p.active && <span className="text-slate-700 text-xs">(tez orada)</span>}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <p className="text-slate-600 text-xs">
              © 2025–2026 MedSmartPro · Tajriba va Innovatsiya MCHJ · Buxoro, O'zbekiston
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════ O'NG PANEL — Auth ══════════════ */}
      <div className="flex-1 flex flex-col overflow-y-auto"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1a1a2e 100%)' }}>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 px-6 pt-8 pb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold">MedSmartPro</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-[420px]">

            <AnimatePresence mode="wait">

              {/* ── ENTRY: Kirish usuli ── */}
              {step === 'entry' && (
                <motion.div key="entry" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
                  <div className="mb-8">
                    <h2 className="text-white text-2xl font-bold mb-2">Xush kelibsiz</h2>
                    <p className="text-slate-400 text-sm">MedSmartPro Web Platforma</p>
                  </div>

                  {/* Auth method tablar */}
                  <div className="grid grid-cols-4 gap-1 bg-slate-800/60 rounded-xl p-1 mb-6">
                    {(['phone', 'email', 'telegram', 'myid'] as AuthMethod[]).map(m => (
                      <button key={m} onClick={() => { setMethod(m); setError(''); }}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          method === m
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m === 'phone' ? '📱 Telefon' : m === 'email' ? '✉️ Email' : m === 'telegram' ? '✈️ Telegram' : '🪪 MyID'}
                      </button>
                    ))}
                  </div>

                  {/* Telefon */}
                  {method === 'phone' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-slate-400 text-xs mb-1.5 block">Telefon raqam</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-slate-600 pr-2">
                            <span className="text-base">🇺🇿</span>
                            <span className="text-slate-400 text-sm">+998</span>
                          </div>
                          <input
                            type="tel" value={phone}
                            onChange={e => { setPhone(e.target.value); setError(''); }}
                            placeholder="90 123 45 67"
                            className="w-full pl-24 pr-4 py-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
                            onKeyDown={e => e.key === 'Enter' && handlePhoneSend()}
                          />
                        </div>
                      </div>
                      {error && <ErrorMsg text={error} />}
                      <AuthButton onClick={handlePhoneSend} loading={loading} icon={<Send className="w-4 h-4" />}>
                        SMS kod yuborish
                      </AuthButton>
                    </div>
                  )}

                  {/* Email */}
                  {method === 'email' && (
                    <div className="space-y-4">
                      <InputField label="Email manzil" type="email" value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        placeholder="admin@medsmart.uz" icon={<Mail className="w-4 h-4" />}
                      />
                      <div>
                        <label className="text-slate-400 text-xs mb-1.5 block">Parol</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type={showPass ? 'text' : 'password'} value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-12 py-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
                            onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                          />
                          <button onClick={() => setShowPass(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 accent-indigo-500" />
                          <span className="text-slate-400 text-xs">Eslab qolish</span>
                        </label>
                        <button className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors">
                          Parolni unutdim?
                        </button>
                      </div>
                      {error && <ErrorMsg text={error} />}
                      <AuthButton onClick={handleEmailLogin} loading={loading} icon={<ChevronRight className="w-4 h-4" />}>
                        Kirish
                      </AuthButton>
                    </div>
                  )}

                  {/* Telegram */}
                  {method === 'telegram' && (
                    <div className="space-y-4">
                      <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5 text-center">
                        <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #0088cc, #00aaff)' }}>
                          <span className="text-2xl">✈️</span>
                        </div>
                        <p className="text-white font-medium mb-1">Telegram orqali kirish</p>
                        <p className="text-slate-500 text-xs mb-4">
                          @MedSmartPro_bot orqali tezkor autentifikatsiya
                        </p>
                        <button
                          onClick={() => alert('Telegram OAuth → @MedSmartPro_bot (F-5 fazada ulangach)')}
                          className="w-full py-3 rounded-xl font-medium text-white text-sm transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #0088cc, #00aaff)' }}
                        >
                          ✈️ Telegram bilan kirish
                        </button>
                      </div>
                      <p className="text-slate-600 text-xs text-center">
                        F-5 fazada to'liq ishga tushiriladi · Grammy.js + TWA SDK
                      </p>
                    </div>
                  )}

                  {/* MyID */}
                  {method === 'myid' && (
                    <div className="space-y-4">
                      <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-5 text-center">
                        <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                          <Fingerprint className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-white font-medium mb-1">MyID biometrik kirish</p>
                        <p className="text-slate-500 text-xs mb-4">
                          O'zbekiston raqamli guvohnoma orqali xavfsiz autentifikatsiya
                        </p>
                        <button
                          onClick={() => alert('MyID OAuth → sandbox.myid.dev (F-4 fazada ulangach)')}
                          className="w-full py-3 rounded-xl font-medium text-white text-sm transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                        >
                          🪪 MyID bilan kirish
                        </button>
                      </div>
                      <p className="text-slate-600 text-xs text-center">
                        F-4 fazada to'liq ishga tushiriladi · Passport.js custom strategy
                      </p>
                    </div>
                  )}

                  {/* Ajratuvchi */}
                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-slate-700/60" />
                    <span className="text-slate-600 text-xs">yoki tezkor kirish (demo)</span>
                    <div className="flex-1 h-px bg-slate-700/60" />
                  </div>

                  {/* Demo tezkor kirish */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(DEMO_CREDENTIALS).map(([key, cred]) => (
                      <button key={key} onClick={() => handleQuickDemo(key)} disabled={loading}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-600 transition-all group disabled:opacity-50"
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${getRoleColor(cred.role)}`}>
                          {getRoleEmoji(cred.role)}
                        </div>
                        <div className="text-left">
                          <p className="text-slate-300 text-xs font-medium capitalize group-hover:text-white transition-colors">
                            {key === 'patient' ? 'Bemor' : key === 'radiolog' ? 'Radiolog' : key === 'specialist' ? 'Mutaxassis' : key === 'doctor' ? 'Shifokor' : key === 'operator' ? 'Operator' : key === 'kassir' ? 'Kassir' : 'Admin'}
                          </p>
                          <p className="text-slate-600 text-xs">{cred.pin}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Telegram mini-ilovaga o'tish — tashqi link */}
                  <div className="mt-6 p-3 rounded-xl border border-slate-700/40 bg-slate-800/30 flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-xs font-medium">Telegram mini-ilova</p>
                      <p className="text-slate-600 text-xs">Telegram'da ochish</p>
                    </div>
                    <a
                      href={import.meta.env.VITE_TELEGRAM_BOT_URL ?? 'https://t.me/MedSmartProBot'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition-colors"
                    >
                      Ochish <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              )}

              {/* ── OTP Tasdiqlash ── */}
              {step === 'verify_otp' && (
                <motion.div key="otp" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
                  <button onClick={() => { setStep('entry'); setOtp(['','','','','','']); setError(''); }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
                    <ArrowLeft className="w-4 h-4" /> Orqaga
                  </button>

                  <div className="mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                      <Phone className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-white text-2xl font-bold mb-2">SMS tasdiqlash</h2>
                    <p className="text-slate-400 text-sm">
                      <span className="text-white">+998 {phone}</span> raqamiga 6 xonali kod yuborildi
                    </p>
                  </div>

                  {/* OTP input */}
                  <div className="flex gap-2 mb-6">
                    {otp.map((digit, i) => (
                      <input
                        key={i} ref={otpRefs[i]}
                        type="text" value={digit} maxLength={1}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                        className="flex-1 aspect-square text-center text-white text-xl font-bold rounded-xl border transition-all focus:outline-none"
                        style={{
                          background: digit ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.8)',
                          borderColor: digit ? '#6366f1' : 'rgba(71,85,105,0.6)',
                          boxShadow: digit ? '0 0 0 2px rgba(99,102,241,0.2)' : 'none',
                        }}
                      />
                    ))}
                  </div>

                  {/* Demo hint */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5">
                    <p className="text-amber-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Demo rejim: Istalgan 6 xonali kod yoki rolning PIN kodini kiriting
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(DEMO_CREDENTIALS).map(([k, c]) => (
                        <button key={k} onClick={() => { setOtp(c.pin.padEnd(6,'0').split('').slice(0,6)); }}
                          className="text-xs text-amber-500 hover:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {k}: {c.pin}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <ErrorMsg text={error} />}

                  <AuthButton onClick={handleOtpVerify} loading={loading} icon={<CheckCircle2 className="w-4 h-4" />}>
                    Tasdiqlash
                  </AuthButton>

                  <div className="flex items-center justify-center gap-1 mt-4">
                    <span className="text-slate-500 text-xs">Kod kelmadimi?</span>
                    <button className="text-indigo-400 text-xs hover:text-indigo-300 transition-colors">
                      Qayta yuborish (60s)
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Muvaffaqiyat ── */}
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-white text-2xl font-bold mb-2">Muvaffaqiyatli kirildi!</h2>
                  <p className="text-slate-400 text-sm mb-6">Dashboard ga yo'naltirilmoqda...</p>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div key={i} animate={{ scale: [1, 1.4, 1] }}
                        transition={{ delay: i * 0.2, repeat: Infinity, duration: 0.8 }}
                        className="w-2 h-2 rounded-full bg-indigo-500"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <p className="text-slate-700 text-xs text-center mt-8">
              Kirish orqali{' '}
              <button className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors">
                Foydalanish shartlari
              </button>
              {' '}va{' '}
              <button className="text-slate-500 hover:text-slate-400 underline underline-offset-2 transition-colors">
                Maxfiylik siyosati
              </button>
              {' '}ga rozisiz
            </p>
          </div>
        </div>

        {/* Quyi info bar */}
        <div className="px-6 py-4 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-slate-600 text-xs">Tizim ishlayapti</span>
            </div>
            <span className="text-slate-700 text-xs">SSL · HIPAA · GDPR</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700 text-xs">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 24/7</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> v2.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Yordamchi komponentlar ─────────────────────────────────────────────────

function AuthButton({ onClick, loading, icon, children }: {
  onClick: () => void; loading: boolean; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', boxShadow: '0 4px 24px rgba(99,102,241,0.3)' }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

function InputField({ label, type, value, onChange, placeholder, icon }: {
  label: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
        />
      </div>
    </div>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {text}
    </motion.div>
  );
}

function getRoleColor(role: UserRole): string {
  const map: Record<string, string> = {
    admin: 'bg-rose-500/20 text-rose-400', operator: 'bg-violet-500/20 text-violet-400',
    kassir: 'bg-sky-500/20 text-sky-400', radiolog: 'bg-emerald-500/20 text-emerald-400',
    specialist: 'bg-purple-500/20 text-purple-400', doctor: 'bg-blue-500/20 text-blue-400',
    patient: 'bg-indigo-500/20 text-indigo-400',
  };
  return map[role] ?? 'bg-slate-500/20 text-slate-400';
}

function getRoleEmoji(role: UserRole): string {
  const map: Record<string, string> = {
    admin: '🛡️', operator: '⚙️', kassir: '💳',
    radiolog: '🔬', specialist: '🩺', doctor: '👨‍⚕️', patient: '👤',
  };
  return map[role] ?? '👤';
}
