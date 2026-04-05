import React, { useState } from 'react';
import { useApp } from '../../../store/appStore';
import { doctorService } from '../../../../services/api/doctorService';
import { ChevronLeft, Check, Star, Zap, Crown, Gift } from 'lucide-react';
import type { TariffCode } from '../../../types';

interface TariffPlan {
  code: TariffCode;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  features: string[];
  limits: string[];
  recommended?: boolean;
}

const PLANS: TariffPlan[] = [
  {
    code: 'FREE',
    name: "Bepul",
    price: 0,
    description: "Boshlash uchun",
    icon: <Gift size={22} />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    features: [
      "Shaxsiy oyna (oddiy)",
      "3 tagacha bemor",
      "Asosiy profil",
    ],
    limits: [
      "Reklama ko'rsatiladi",
      "Portfolio yo'q",
      "Kalendar yo'q",
      "Xabar yuborish yo'q",
    ],
  },
  {
    code: 'START',
    name: "Start",
    price: 99000,
    description: "Kichik amaliyot uchun",
    icon: <Zap size={22} />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: [
      "50 tagacha bemor",
      "Asosiy portfolio",
      "Kalendar va booking",
      "3 ta FAQ",
      "5 ta tibbiy xizmat",
      "Xabar yuborish",
      "Profil URL",
    ],
    limits: [
      "Reklama (kamaytrilgan)",
      "Anonim nomer yo'q",
    ],
  },
  {
    code: 'LITE',
    name: "Lite",
    price: 199000,
    description: "Faol amaliyot uchun",
    icon: <Star size={22} />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: [
      "200 tagacha bemor",
      "To'liq portfolio",
      "Cheksiz FAQ",
      "20 ta tibbiy xizmat",
      "Telegram bot",
      "Profil URL",
      "Qo'ng'iroq vaqt cheklovi",
    ],
    limits: ["Minimal reklama", "Anonim nomer yo'q"],
    recommended: true,
  },
  {
    code: 'PREMIUM',
    name: "Premium",
    price: 399000,
    description: "Professional amaliyot",
    icon: <Crown size={22} />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    features: [
      "Cheksiz bemorlar",
      "To'liq portfolio",
      "Cheksiz FAQ va xizmatlar",
      "Anonim telefon raqam",
      "Telegram bot",
      "Reklama yo'q",
      "Maxsus profil URL",
      "Cheksiz sozlamalar",
    ],
    limits: [],
  },
];

export function TariffSelection() {
  const { navigate, goBack } = useApp();
  const [selected, setSelected] = useState<TariffCode>('LITE');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await doctorService.subscribeTariff(selected);
      navigate('doctor_private_panel');
    } catch (err: any) {
      setError(err.message || 'Tarif tanlashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    price === 0 ? "Bepul" : `${price.toLocaleString('uz-UZ')} so'm/oy`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Tarif tanlash</h1>
          <p className="text-xs text-gray-500">O'zingizga mos tarifni tanlang</p>
        </div>
      </div>

      {/* Plans */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {PLANS.map((plan) => (
          <button
            key={plan.code}
            onClick={() => setSelected(plan.code)}
            className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
              selected === plan.code
                ? 'border-blue-500 bg-white shadow-md'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${plan.bgColor} ${plan.color} flex items-center justify-center`}>
                  {plan.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{plan.name}</span>
                    {plan.recommended && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        Tavsiya
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{plan.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 text-sm">
                  {formatPrice(plan.price)}
                </p>
                {selected === plan.code && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-auto mt-1">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mt-3 space-y-1">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-gray-700">
                  <Check size={12} className="text-green-500 shrink-0" />
                  {f}
                </div>
              ))}
              {plan.limits.map((l) => (
                <div key={l} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-3 h-3 text-center leading-3 shrink-0">—</span>
                  {l}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        {error && (
          <p className="text-red-500 text-xs text-center mb-2">{error}</p>
        )}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
        >
          {loading ? "Saqlanmoqda..." : `${PLANS.find(p => p.code === selected)?.name} tarifini tanlash`}
        </button>
        <p className="text-center text-xs text-gray-400 mt-2">
          Istalgan vaqt o'zgartirish mumkin
        </p>
      </div>
    </div>
  );
}
