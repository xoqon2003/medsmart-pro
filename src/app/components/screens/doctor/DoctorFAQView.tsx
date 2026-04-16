import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../../store/navigationContext';
import { faqService } from '../../../../services/api/faqService';
import { doctorService } from '../../../../services/api/doctorService';
import type { FAQ } from '../../../types';
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'Barchasi' },
  { value: 'OPERATION', label: 'Operatsiya' },
  { value: 'RECOVERY', label: 'Tiklanish' },
  { value: 'COSTS', label: 'Xarajatlar' },
  { value: 'CONSULTATION', label: 'Konsultatsiya' },
  { value: 'DIAGNOSTICS', label: 'Diagnostika' },
];

export function DoctorFAQView() {
  const { goBack } = useNavigation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [profileId, setProfileId] = useState('');

  useEffect(() => {
    doctorService.getMyProfile()
      .then(p => {
        setProfileId(p.id);
        return faqService.getPublicFaq(p.id);
      })
      .then(setFaqs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!profileId) return;
    faqService.getPublicFaq(profileId, category || undefined)
      .then(setFaqs)
      .catch(() => {});
  }, [category, profileId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">Ko'p beriladigan savollar</h1>
      </div>

      {/* Category Tabs */}
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

      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <HelpCircle size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Savollar yo'q</p>
          </div>
        ) : (
          faqs.map(faq => (
            <div key={faq.id} className="bg-white rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <p className="text-sm font-medium text-gray-900 flex-1 pr-2">{faq.question}</p>
                {expanded === faq.id
                  ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                  : <ChevronDown size={16} className="text-gray-400 shrink-0" />
                }
              </button>
              {expanded === faq.id && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
