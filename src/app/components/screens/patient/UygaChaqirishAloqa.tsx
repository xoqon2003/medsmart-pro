import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Phone, User, Calendar, AtSign, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../../../store/appStore';

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  let out = '';
  if (digits.length > 0) out += digits.slice(0, 2);
  if (digits.length > 2) out += ' ' + digits.slice(2, 5);
  if (digits.length > 5) out += '-' + digits.slice(5, 7);
  if (digits.length > 7) out += '-' + digits.slice(7, 9);
  return out;
}

export function UygaChaqirishAloqa() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation, currentUser } = useApp();

  // Pre-fill from current user
  const [phone, setPhone] = useState(draftConsultation.hvPhone || currentUser?.phone?.replace('+998', '').trim() || '');
  const [firstName, setFirstName] = useState(draftConsultation.hvFirstName || currentUser?.fullName?.split(' ')[1] || '');
  const [lastName, setLastName] = useState(draftConsultation.hvLastName || currentUser?.fullName?.split(' ')[0] || '');
  const [birthDate, setBirthDate] = useState(draftConsultation.hvBirthDate || '');
  const [extraPhone, setExtraPhone] = useState(draftConsultation.hvExtraPhone || '');
  const [telegram, setTelegram] = useState(draftConsultation.hvTelegram || '');

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length === 9;
  const isValid = phoneValid && otpVerified && firstName.trim() && lastName.trim() && birthDate;

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const sendOtp = () => {
    if (!phoneValid) return;
    setOtpSent(true);
    setOtpVerified(false);
    setOtp(['', '', '', '']);
    setOtpError('');
    startCountdown();
    setTimeout(() => otpRefs[0].current?.focus(), 100);
  };

  const handleOtpChange = (idx: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = d;
    setOtp(next);
    setOtpError('');
    if (d && idx < 3) otpRefs[idx + 1].current?.focus();
    if (next.every((v) => v !== '') && next.join('') === '1234') {
      setOtpVerified(true);
    } else if (next.every((v) => v !== '')) {
      setOtpError("Kod noto'g'ri. Demo uchun: 1234");
    }
  };

  const handleNext = () => {
    setSubmitted(true);
    if (!isValid) return;
    updateDraftConsultation({
      hvPhone: '+998 ' + formatPhone(phone),
      hvFirstName: firstName,
      hvLastName: lastName,
      hvBirthDate: birthDate,
      hvExtraPhone: extraPhone,
      hvTelegram: telegram,
    });
    navigate('home_visit_time');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-orange-100 text-xs">2-qadam / 5</p>
            <h1 className="text-white text-lg font-bold">Aloqa ma'lumotlari</h1>
            <p className="text-orange-100/80 text-xs mt-0.5">Bemor haqida ma'lumot</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex gap-1 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-5 -mt-4 pb-28 space-y-3">
        {/* Telefon + OTP */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-gray-800 text-sm font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4 text-orange-500" /> Telefon raqami
          </h3>

          <div>
            <label className="text-gray-700 text-xs font-medium mb-1.5 block">Asosiy telefon *</label>
            <div className="flex gap-2">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-500 font-medium whitespace-nowrap">
                +998
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(formatPhone(e.target.value)); setOtpVerified(false); setOtpSent(false); }}
                placeholder="90 123-45-67"
                maxLength={12}
                className={`flex-1 bg-gray-50 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${
                  otpVerified ? 'border-green-400 bg-green-50' : submitted && !phoneValid ? 'border-red-300 bg-red-50' : phone ? 'border-orange-200 bg-white' : 'border-gray-200'
                }`}
              />
              {!otpVerified && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={sendOtp}
                  disabled={!phoneValid || countdown > 0}
                  className="bg-orange-500 disabled:bg-gray-300 text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap transition-all"
                >
                  {countdown > 0 ? `${countdown}s` : otpSent ? <RefreshCw className="w-4 h-4" /> : 'SMS'}
                </motion.button>
              )}
              {otpVerified && <CheckCircle2 className="w-6 h-6 text-green-500 self-center flex-shrink-0" />}
            </div>
            {submitted && !phoneValid && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Telefon raqamini kiriting</p>}
          </div>

          {/* OTP input */}
          {otpSent && !otpVerified && (
            <div>
              <p className="text-gray-600 text-xs mb-2">+998 {phone} raqamiga 4 xonali kod yuborildi <span className="text-orange-500 font-medium">(demo: 1234)</span></p>
              <div className="flex gap-2 justify-center">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current?.focus(); }}
                    className={`w-12 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${
                      otpError ? 'border-red-400 bg-red-50' : v ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                ))}
              </div>
              {otpError && <p className="text-red-500 text-xs mt-2 text-center flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" />{otpError}</p>}
            </div>
          )}
          {otpVerified && <p className="text-green-600 text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Telefon raqami tasdiqlandi</p>}
        </div>

        {/* Shaxsiy ma'lumotlar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-gray-800 text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" /> Shaxsiy ma'lumotlar
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-700 text-xs font-medium mb-1.5 block">Familiya *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Karimov"
                className={`w-full bg-gray-50 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${submitted && !lastName.trim() ? 'border-red-300 bg-red-50' : lastName ? 'border-orange-200 bg-white' : 'border-gray-200'}`}
              />
              {submitted && !lastName.trim() && <p className="text-red-500 text-xs mt-1">Familiyani kiriting</p>}
            </div>
            <div>
              <label className="text-gray-700 text-xs font-medium mb-1.5 block">Ism *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jasur"
                className={`w-full bg-gray-50 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${submitted && !firstName.trim() ? 'border-red-300 bg-red-50' : firstName ? 'border-orange-200 bg-white' : 'border-gray-200'}`}
              />
              {submitted && !firstName.trim() && <p className="text-red-500 text-xs mt-1">Ismni kiriting</p>}
            </div>
          </div>
          <div>
            <label className="text-gray-700 text-xs font-medium mb-1.5 block">Tug'ilgan sana *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full bg-gray-50 border rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${submitted && !birthDate ? 'border-red-300 bg-red-50' : birthDate ? 'border-orange-200 bg-white' : 'border-gray-200'}`}
              />
            </div>
            {submitted && !birthDate && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Tug'ilgan sanani kiriting</p>}
          </div>
        </div>

        {/* Qo'shimcha */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-gray-800 text-sm font-semibold flex items-center gap-2">
            <AtSign className="w-4 h-4 text-orange-500" />
            <span>Qo'shimcha aloqa</span>
            <span className="text-gray-400 text-xs font-normal ml-auto">ixtiyoriy</span>
          </h3>
          <div>
            <label className="text-gray-700 text-xs font-medium mb-1.5 block">Qo'shimcha telefon (qarindosh)</label>
            <div className="flex gap-2">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-500 whitespace-nowrap">+998</div>
              <input
                type="tel"
                value={extraPhone}
                onChange={(e) => setExtraPhone(formatPhone(e.target.value))}
                placeholder="91 234-56-78"
                maxLength={12}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
          <div>
            <label className="text-gray-700 text-xs font-medium mb-1.5 block">Telegram username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value.replace('@', ''))}
                placeholder="username"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-7 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-6 pt-3 bg-gray-50/90 backdrop-blur-sm border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-lg ${
            isValid ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200' : 'bg-gray-200 text-gray-400'
          }`}
        >
          <span>Keyingi qadam</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
        {submitted && !otpVerified && <p className="text-red-500 text-xs text-center mt-2">Telefon raqamini SMS orqali tasdiqlang</p>}
      </div>
    </div>
  );
}
