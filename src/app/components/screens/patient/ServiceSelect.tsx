import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, CheckCircle, AlertTriangle, Bot, User, Users } from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { PRICING, formatPrice, calculatePrice } from '../../../data/mockData';
import type { ServiceType, Urgency } from '../../../types';

const STEP_LABELS = ['Tasvir', 'Shikoyat', 'Xizmat', 'Shartnoma', "To'lov"];

const SERVICES = [
  {
    id: 'ai_radiolog' as ServiceType,
    icon: Bot,
    title: 'AI + Radiolog xulosasi',
    description: 'AI dastlabki tahlil + tajribali radiolog xulosasi',
    tag: '⭐ Tavsiya',
    tagColor: 'bg-blue-100 text-blue-700',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'radiolog_only' as ServiceType,
    icon: User,
    title: 'Faqat Radiolog xulosasi',
    description: 'Tajribali radiolog shaxsan ko\'rib chiqadi',
    tag: null,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'radiolog_specialist' as ServiceType,
    icon: Users,
    title: 'Radiolog + Mutaxassis',
    description: 'Radiolog + tor mutaxassis konsultatsiyasi',
    tag: '👥 Kengaytirilgan',
    tagColor: 'bg-purple-100 text-purple-700',
    color: 'from-violet-500 to-purple-600',
  },
];

const URGENCIES = [
  {
    id: 'normal' as Urgency,
    icon: '🟢',
    title: 'Oddiy',
    subtitle: '48-72 soat ichida',
    extra: '',
  },
  {
    id: 'urgent' as Urgency,
    icon: '🟡',
    title: 'Tezkor',
    subtitle: '24 soat ichida',
    extra: '+50%',
  },
  {
    id: 'emergency' as Urgency,
    icon: '🔴',
    title: 'Shoshilinch',
    subtitle: '4-12 soat ichida',
    extra: '+100%',
    warning: true,
  },
];

export function ServiceSelect() {
  const { draftApplication, updateDraft, navigate, goBack } = useApp();
  const [serviceType, setServiceType] = useState<ServiceType>(draftApplication.serviceType || 'ai_radiolog');
  const [urgency, setUrgency] = useState<Urgency>(draftApplication.urgency || 'normal');
  const [showEmergencyNote, setShowEmergencyNote] = useState(false);

  const price = calculatePrice(serviceType, urgency);

  const handleUrgencySelect = (u: Urgency) => {
    setUrgency(u);
    if (u === 'emergency') setShowEmergencyNote(true);
    else setShowEmergencyNote(false);
  };

  const handleNext = () => {
    updateDraft({ serviceType, urgency });
    navigate('patient_contract');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white rotate-180" />
          </button>
          <div>
            <h1 className="text-white text-lg">Xizmat tanlash</h1>
            <p className="text-blue-200 text-xs">3-bosqich: Xizmat va muhimlik</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {STEP_LABELS.map((l, i) => (
            <div key={l} className={`h-1 flex-1 rounded-full ${i <= 2 ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 -mt-4 pb-8">
        {/* Service type */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">Xizmat turi</p>
          <div className="space-y-2.5">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              const isSelected = serviceType === s.id;
              const p = calculatePrice(s.id, urgency);
              return (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setServiceType(s.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-gray-900 text-sm">{s.title}</p>
                        {s.tag && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${s.tagColor}`}>{s.tag}</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">{s.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-blue-600 text-sm">{formatPrice(p)}</p>
                      {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 ml-auto mt-1" />}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Urgency */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-gray-700 text-sm mb-3">Muhimlik darajasi</p>
          <div className="grid grid-cols-3 gap-2">
            {URGENCIES.map(u => (
              <button
                key={u.id}
                onClick={() => handleUrgencySelect(u.id)}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  urgency === u.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <p className="text-2xl mb-1">{u.icon}</p>
                <p className="text-gray-800 text-xs mb-0.5">{u.title}</p>
                <p className="text-gray-500 text-xs">{u.subtitle}</p>
                {u.extra && (
                  <p className={`text-xs mt-1 ${u.id === 'emergency' ? 'text-red-500' : 'text-orange-500'}`}>
                    {u.extra}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Emergency warning */}
        {showEmergencyNote && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm">Favqulodda tibbiy holat uchun</p>
              <p className="text-red-600 text-xs mt-1">
                Hayot uchun xavfli bo'lsa — darhol <strong>103</strong> (tez yordam) ga qo'ng'iroq qiling.
                Bu xizmat kechiktirib bo'lmaydigan holatlarda radiologik maslahat uchun.
              </p>
            </div>
          </motion.div>
        )}

        {/* Price summary */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4">
          <p className="text-white/70 text-sm mb-1">Jami to'lov summasi</p>
          <p className="text-white text-3xl">{formatPrice(price)}</p>
          <p className="text-white/60 text-xs mt-1">
            {SERVICES.find(s => s.id === serviceType)?.title} •{' '}
            {URGENCIES.find(u => u.id === urgency)?.title}
          </p>
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          <span>Shartnomaga o'tish</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
