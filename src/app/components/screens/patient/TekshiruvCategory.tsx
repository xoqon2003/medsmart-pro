import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Microscope, Activity, Waves, FlaskConical, Camera, Stethoscope, Search, X, SearchX } from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { EXAMS_BY_CATEGORY } from '../../../../services';

type Category = 'visual' | 'ultrasound' | 'laboratory' | 'functional' | 'endoscopy';

const CATEGORIES: { id: Category; title: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'visual', title: 'Vizual diagnostika', desc: 'MRT, KT, Rentgen, Flyurografiya', icon: <Camera className="w-5 h-5 text-sky-700" /> },
  { id: 'ultrasound', title: 'Ultratovush', desc: 'UZI / USG', icon: <Waves className="w-5 h-5 text-sky-700" /> },
  { id: 'laboratory', title: 'Laboratoriya', desc: 'Qon, siydik, biologik tahlillar', icon: <FlaskConical className="w-5 h-5 text-sky-700" /> },
  { id: 'functional', title: 'Funksional', desc: 'EKG, EEG, Spirometriya', icon: <Activity className="w-5 h-5 text-sky-700" /> },
  { id: 'endoscopy', title: 'Endoskopiya', desc: 'FGDS, Kolonoskopiya', icon: <Stethoscope className="w-5 h-5 text-sky-700" /> },
];

export function TekshiruvCategory() {
  const { goBack, navigate, clearDraftExamination, updateDraftExamination } = useApp();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filtered = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return CATEGORIES.map(c => ({ ...c, matchedExams: [] as string[] }));

    return CATEGORIES.map(cat => {
      const exams = EXAMS_BY_CATEGORY[cat.id] || [];
      const matchedExams = exams.filter(e => e.toLowerCase().includes(debouncedQuery));
      const titleMatch = cat.title.toLowerCase().includes(debouncedQuery) || cat.desc.toLowerCase().includes(debouncedQuery);
      return { ...cat, matchedExams, visible: titleMatch || matchedExams.length > 0 };
    }).filter(c => c.visible !== false);
  }, [debouncedQuery]);

  const pick = (category: Category) => {
    clearDraftExamination();
    updateDraftExamination({ category });
    navigate('patient_tks_exam');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sky-900 to-blue-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center" aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-sky-200 text-xs">1-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Tekshiruv kategoriyasi</h1>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Microscope className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-3 -mt-4 pb-24">
        {/* Qidiruv filtri */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tekshiruv nomini qidiring..."
            className="w-full pl-10 pr-10 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Kategoriyalar ro'yxati */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <SearchX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Natija topilmadi</p>
            <p className="text-gray-400 text-xs mt-1">Boshqa so'z bilan qidirib ko'ring</p>
          </div>
        ) : (
          filtered.map((x, i) => (
            <motion.button
              key={x.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => pick(x.id)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                  {x.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-medium">{x.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{x.desc}</p>
                  {x.matchedExams.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {x.matchedExams.map(exam => (
                        <span key={exam} className="inline-block px-2 py-0.5 bg-sky-50 text-sky-700 text-[11px] rounded-lg border border-sky-100">
                          {exam}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 mt-1 flex-shrink-0" />
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}

