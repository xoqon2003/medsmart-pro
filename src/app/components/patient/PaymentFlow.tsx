import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, ChevronRight, Clock, CreditCard, X, XCircle } from 'lucide-react';
import type { PaymentProvider } from '../../types';
import { formatPrice } from '../data/mockData';

const PROVIDERS = [
  { id: 'personal_card' as PaymentProvider, name: 'Shaxsiy karta', logo: '💳', color: 'from-gray-800 to-gray-900', bg: 'bg-gray-50 border-gray-200' },
  { id: 'payme' as PaymentProvider, name: 'Payme', logo: '💳', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { id: 'click' as PaymentProvider, name: 'Click', logo: '🔵', color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
  { id: 'uzum' as PaymentProvider, name: 'Uzum', logo: '🟣', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 border-purple-200' },
];

const onlyDigits = (v: string) => v.replace(/\D/g, '');
const formatCardNumber = (digits: string) => onlyDigits(digits).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
const formatExpiry = (digits: string) => {
  const d = onlyDigits(digits).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

export function PaymentFlow(props: {
  title?: string;
  subtitle?: string;
  amount: number;
  arizaNumber: string;
  onBack: () => void;
  onCancelTimeout?: () => void;
  onCancelByUser?: () => void;
  onPaid: (provider: PaymentProvider) => Promise<void> | void;
  onTrackStatus: () => void;
  note?: string;
}) {
  const {
    title = "To'lov",
    subtitle = "To'lovni amalga oshirish",
    amount,
    arizaNumber,
    onBack,
    onCancelTimeout,
    onCancelByUser,
    onPaid,
    onTrackStatus,
    note,
  } = props;

  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('personal_card');
  const [paymentState, setPaymentState] = useState<'select' | 'processing' | 'success' | 'failed'>('select');
  const [isMethodSheetOpen, setIsMethodSheetOpen] = useState(true);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardCountdown, setCardCountdown] = useState(15 * 60);
  const [cardNumberDigits, setCardNumberDigits] = useState('');
  const [expiryDigits, setExpiryDigits] = useState('');

  useEffect(() => {
    if (!isCardModalOpen) return;
    const timer = setInterval(() => {
      setCardCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCardModalOpen]);

  useEffect(() => {
    if (!isCardModalOpen) return;
    if (cardCountdown > 0) return;
    onCancelTimeout?.();
    setIsCardModalOpen(false);
    onBack();
  }, [cardCountdown, isCardModalOpen, onBack, onCancelTimeout]);

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handlePay = async () => {
    setPaymentState('processing');
    await new Promise((r) => setTimeout(r, 1400));
    const success = Math.random() > 0.1;
    if (success) await onPaid(selectedProvider);
    setPaymentState(success ? 'success' : 'failed');
  };

  const openCardModal = () => {
    setIsMethodSheetOpen(false);
    setSelectedProvider('personal_card');
    setCardCountdown(15 * 60);
    setCardNumberDigits('');
    setExpiryDigits('');
    setIsCardModalOpen(true);
  };

  if (paymentState === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
          <CreditCard className="absolute inset-0 m-auto w-10 h-10 text-blue-600" />
        </div>
        <div className="text-center">
          <p className="text-gray-800 text-lg mb-1">To'lov amalga oshirilmoqda</p>
          <p className="text-gray-500 text-sm">{PROVIDERS.find(p => p.id === selectedProvider)?.name} orqali...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (paymentState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>
        <div className="text-center">
          <h2 className="text-gray-900 text-xl mb-2">To'lov muvaffaqiyatli!</h2>
          <p className="text-gray-500 text-sm mb-1">Ariza raqami: <span className="text-blue-600">{arizaNumber}</span></p>
          <p className="text-gray-500 text-sm mb-1">To'langan summa: <span className="text-gray-800">{formatPrice(amount)}</span></p>
          <p className="text-gray-500 text-sm">Chek PDF Telegram ga yuborildi</p>
        </div>

        <button
          onClick={onTrackStatus}
          className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2"
        >
          <span>Ariza holatini kuzatish</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (paymentState === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center"
        >
          <XCircle className="w-12 h-12 text-red-500" />
        </motion.div>
        <div className="text-center">
          <h2 className="text-gray-900 text-xl mb-2">To'lov amalga oshmadi</h2>
          <p className="text-gray-500 text-sm">Ulanish xatosi yoki mablag' yetarli emas</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button onClick={() => setPaymentState('select')} className="w-full bg-blue-600 text-white rounded-2xl py-3.5">
            Qayta urinish
          </button>
          <button onClick={onBack} className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5">
            Keyinroq
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AnimatePresence>
        {isMethodSheetOpen && paymentState === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
            onClick={() => setIsMethodSheetOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-7 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-900 text-base">To'lov usuli</p>
                  <p className="text-gray-400 text-xs mt-0.5">Davom etish uchun usulni tanlang</p>
                </div>
                <button onClick={() => setIsMethodSheetOpen(false)} className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-2.5">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (p.id === 'personal_card') return openCardModal();
                      setSelectedProvider(p.id);
                      setIsMethodSheetOpen(false);
                    }}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                      selectedProvider === p.id ? `${p.bg}` : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-xl flex-shrink-0`}>
                      {p.logo}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-gray-900 text-sm">{p.name}</p>
                      <p className="text-gray-500 text-xs">
                        {p.id === 'personal_card' ? 'Kartangizni kiritib to‘lang' : 'Karta va internet-bank orqali'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCardModalOpen && paymentState === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
            onClick={() => setIsCardModalOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-7 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-900 text-base">To'lov usuli</p>
                  <p className="text-gray-400 text-xs mt-0.5">Shaxsiy karta</p>
                </div>
                <button onClick={() => setIsCardModalOpen(false)} className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <p className="text-amber-700 text-sm">buyurtma bekor bo'lgunicha</p>
                </div>
                <span className={`text-sm ${cardCountdown < 60 ? 'text-red-600' : 'text-amber-700'}`}>
                  {formatCountdown(cardCountdown)}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 text-sm">Xizmat narxi</span>
                  <span className="text-gray-800 text-sm">{formatPrice(amount)}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-gray-200/60 mt-2 pt-2">
                  <span className="text-gray-700 text-sm">Ja'mi to'lov</span>
                  <span className="text-gray-900 text-sm">{formatPrice(amount)}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-gray-700 text-sm mb-1.5">Karta raqami</p>
                  <input
                    value={formatCardNumber(cardNumberDigits)}
                    onChange={(e) => setCardNumberDigits(onlyDigits(e.target.value).slice(0, 16))}
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <p className="text-gray-700 text-sm mb-1.5">Amal qilish muddati</p>
                  <input
                    value={formatExpiry(expiryDigits)}
                    onChange={(e) => setExpiryDigits(onlyDigits(e.target.value).slice(0, 4))}
                    inputMode="numeric"
                    placeholder="MM/YY"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handlePay}
                  disabled={cardNumberDigits.length !== 16 || expiryDigits.length !== 4}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>To'lov ({formatPrice(amount)})</span>
                </button>

                <button
                  onClick={() => {
                    onCancelByUser?.();
                    setIsCardModalOpen(false);
                    onBack();
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-700 rounded-2xl py-3.5"
                >
                  Buyurtmani bekor qilish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-white text-lg">{title}</h1>
            <p className="text-blue-200 text-xs">{subtitle}</p>
          </div>
        </div>
        <div className="h-1 w-full rounded-full bg-white/20" />
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-center">
          <p className="text-white/70 text-sm mb-1">To'lov summasi</p>
          <p className="text-white text-4xl mb-2">{formatPrice(amount)}</p>
          <p className="text-white/60 text-sm">Ariza: {arizaNumber}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">To'lov usuli</p>
          <button
            onClick={() => setIsMethodSheetOpen(true)}
            className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200">
              <span className="text-lg">{PROVIDERS.find(p => p.id === selectedProvider)?.logo || '💳'}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-gray-900 text-sm">{PROVIDERS.find(p => p.id === selectedProvider)?.name || "To'lov usuli"}</p>
              <p className="text-gray-500 text-xs">O'zgartirish uchun bosing</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {note && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-500 text-xs">{note}</p>
          </div>
        )}

        <button
          onClick={() => (selectedProvider === 'personal_card' ? openCardModal() : handlePay())}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <CreditCard className="w-5 h-5" />
          <span>To'lovni amalga oshirish ({formatPrice(amount)})</span>
        </button>
      </div>
    </div>
  );
}

