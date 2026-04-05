import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { faqService } from '../../../../services/api/faqService';
import { doctorService } from '../../../../services/api/doctorService';
import type { MedicalService } from '../../../types';
import { ChevronLeft, Loader2, Stethoscope } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'Barchasi' },
  { value: 'INSTRUMENTAL', label: 'Instrumental', color: 'bg-blue-50 text-blue-700' },
  { value: 'LABORATORY', label: 'Laboratoriya', color: 'bg-green-50 text-green-700' },
  { value: 'OPERATION', label: 'Operatsiya', color: 'bg-red-50 text-red-700' },
  { value: 'CONSULTATION', label: 'Konsultatsiya', color: 'bg-purple-50 text-purple-700' },
  { value: 'DIAGNOSTICS', label: 'Diagnostika', color: 'bg-amber-50 text-amber-700' },
];

const getCategoryColor = (cat: string) =>
  CATEGORIES.find(c => c.value === cat)?.color ?? 'bg-gray-50 text-gray-700';

export function DoctorServicesView() {
  const { goBack } = useApp();
  const [services, setServices] = useState<MedicalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    doctorService.getMyProfile()
      .then(p => faqService.getPublicServices(p.id))
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = category ? services.filter(s => s.category === category) : services;

  const formatPrice = (svc: MedicalService) => {
    if (svc.price) return `${svc.price.toLocaleString('uz-UZ')} so'm`;
    if (svc.priceFrom && svc.priceTo) return `${svc.priceFrom.toLocaleString()} — ${svc.priceTo.toLocaleString()} so'm`;
    if (svc.priceFrom) return `${svc.priceFrom.toLocaleString()} so'm dan`;
    return "Narxi kelishiladi";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">Tibbiy xizmatlar</h1>
      </div>

      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${
              category === c.value ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Stethoscope size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Xizmatlar yo'q</p>
          </div>
        ) : filtered.map(svc => (
          <button
            key={svc.id}
            onClick={() => setExpanded(expanded === svc.id ? null : svc.id)}
            className="w-full bg-white rounded-2xl p-4 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${getCategoryColor(svc.category)}`}>
                  {CATEGORIES.find(c => c.value === svc.category)?.label ?? svc.category}
                </span>
              </div>
              <p className="text-sm font-bold text-blue-600 shrink-0">{formatPrice(svc)}</p>
            </div>
            {expanded === svc.id && svc.description && (
              <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                <p className="text-xs text-gray-600">{svc.description}</p>
                {svc.duration && <p className="text-xs text-gray-400">Davomiyligi: {svc.duration}</p>}
                {svc.preparation && <p className="text-xs text-gray-400">Tayyorlanish: {svc.preparation}</p>}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
