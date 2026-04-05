import type { PricingConfig } from '../types';

// ── Narxlar va Hisoblash ────────────────────────────────────────────────────

export const PRICING: PricingConfig = {
  ai_radiolog: 150000,
  radiolog_only: 200000,
  radiolog_specialist: 350000,
  urgencyMultiplier: {
    normal: 1.0,
    urgent: 1.5,
    emergency: 2.0,
  },
};

export const SCAN_TYPES = ['MRT', 'MSKT', 'Rentgen', 'USG', 'Boshqa'];
export const ORGANS = ['Bosh', "Bo'yin", "Ko'krak qafasi", "Qorin bo'shlig'i", "Umurtqa pog'onasi", "Oyoq-qo'l", 'Boshqa'];

export const CONCLUSION_TEMPLATES: Record<string, { description: string; findings: string; impression: string }> = {
  'MRT-Bosh': {
    description: "Bosh miya MRT tekshiruvi T1, T2, FLAIR, DWI rejimlarida o'tkazildi.",
    findings: "Bosh miya strukturalari simmetriya saqlab joylashgan. Korteks va subkorteks hududlari o'zgarishsiz. Ventrikullar tizimi kengaymagan.",
    impression: "Klinik-radiologik taqqoslab baholash kerak. Patologik signal o'zgarishlari aniqlanmadi.",
  },
  'MSKT-Kokrak': {
    description: "Ko'krak qafasi MSKT tekshiruvi o'tkazildi (kesimlar: 1mm).",
    findings: "O'pka to'qimasi o'zgarishsiz. Bronxlar o'tkazuvchanligi saqlangan. Ko'ks orasitopning limfa tugunlari kattalashmagan.",
    impression: "Ko'krak qafasida patologik o'zgarishlar aniqlanmadi.",
  },
  'Rentgen-Umurtqa': {
    description: "Bel umurtqa pog'onasi rentgen tekshiruvi 2 proeksiyada bajarildi.",
    findings: "Umurtqa jismlari balandligi saqlangan. Disk bo'shliqlari torayishi aniqlanmadi.",
    impression: "Osteoxondroz I-II daraja belgilari mavjud.",
  },
};

// ── Label va Format funksiyalar ─────────────────────────────────────────────

export const getConclusionTypeLabel = (type: string): { label: string; color: string; bg: string; icon: string } => {
  const map: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    ai_analysis: { label: 'AI Tahlil', color: 'text-violet-700', bg: 'bg-violet-50', icon: '🤖' },
    radiolog: { label: 'Radiolog xulosasi', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: '🩻' },
    specialist: { label: 'Mutaxassis xulosasi', color: 'text-purple-700', bg: 'bg-purple-50', icon: '🔬' },
    doctor: { label: 'Shifokor xulosasi', color: 'text-blue-700', bg: 'bg-blue-50', icon: '👨‍⚕️' },
  };
  return map[type] || { label: type, color: 'text-gray-600', bg: 'bg-gray-100', icon: '📄' };
};

export const formatPrice = (price: number): string => {
  return Number(price || 0).toLocaleString('en-US') + " so'm";
};

export const getStatusLabel = (status: string): { label: string; color: string; bg: string } => {
  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: 'Yangi', color: 'text-blue-700', bg: 'bg-blue-50' },
    booked: { label: 'Band qilingan', color: 'text-teal-700', bg: 'bg-teal-50' },
    paid_pending: { label: "To'lov tasdiqlandi", color: 'text-green-700', bg: 'bg-green-50' },
    accepted: { label: 'Qabul qilindi', color: 'text-cyan-700', bg: 'bg-cyan-50' },
    extra_info_needed: { label: "Qo'shimcha kerak", color: 'text-orange-700', bg: 'bg-orange-50' },
    with_specialist: { label: 'Mutaxassisda', color: 'text-purple-700', bg: 'bg-purple-50' },
    conclusion_writing: { label: 'Xulosa yozilmoqda', color: 'text-indigo-700', bg: 'bg-indigo-50' },
    done: { label: 'Bajarildi', color: 'text-green-700', bg: 'bg-green-50' },
    failed: { label: 'Bekor qilindi', color: 'text-red-700', bg: 'bg-red-50' },
    archived: { label: 'Arxiv', color: 'text-gray-600', bg: 'bg-gray-100' },
    hv_onway: { label: "Yo'lga chiqdi", color: 'text-orange-700', bg: 'bg-orange-50' },
    hv_arrived: { label: 'Yetib keldi', color: 'text-teal-700', bg: 'bg-teal-50' },
  };
  return statusMap[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-100' };
};

export const getUrgencyLabel = (urgency: string): { label: string; color: string; icon: string } => {
  const map: Record<string, { label: string; color: string; icon: string }> = {
    normal: { label: 'Oddiy (48-72 soat)', color: 'text-green-700', icon: '🟢' },
    urgent: { label: 'Tezkor (24 soat)', color: 'text-yellow-700', icon: '🟡' },
    emergency: { label: 'Shoshilinch (4-12 soat)', color: 'text-red-700', icon: '🔴' },
  };
  return map[urgency] || { label: urgency, color: 'text-gray-600', icon: '⚪' };
};

export const getServiceLabel = (type: string): { label: string; icon: string; description: string } => {
  const map: Record<string, { label: string; icon: string; description: string }> = {
    ai_radiolog: { label: 'AI + Radiolog', icon: '🤖', description: 'AI tahlili + radiolog xulosasi (Tavsiya)' },
    radiolog_only: { label: 'Faqat Radiolog', icon: '👨‍⚕️', description: 'Tajribali radiolog xulosasi' },
    radiolog_specialist: { label: 'Radiolog + Mutaxassis', icon: '👥', description: 'Radiolog + tor mutaxassis konsultatsiyasi' },
    consultation: { label: 'Konsultatsiya', icon: '🩺', description: 'Shifokor bilan onlayn yoki oflayn konsultatsiya' },
    home_visit: { label: 'Uyga chaqirish', icon: '🏠', description: 'Shifokor uyga keladi' },
  };
  return map[type] || { label: type, icon: '🏥', description: '' };
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculatePrice = (serviceType: string, urgency: string): number => {
  const base: Record<string, number> = {
    ai_radiolog: 150000,
    radiolog_only: 200000,
    radiolog_specialist: 350000,
    consultation: 120000,
    home_visit: 150000,
  };
  const multipliers: Record<string, number> = {
    normal: 1.0,
    urgent: 1.5,
    emergency: 2.0,
  };
  const basePrice = base[serviceType] || 150000;
  const multiplier = multipliers[urgency] || 1.0;
  return Math.round(basePrice * multiplier);
};
