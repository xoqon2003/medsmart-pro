import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, ListChecks } from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { examinationService } from '../../../../services';

export function TekshiruvExam() {
  const { goBack, navigate, draftExamination, updateDraftExamination } = useApp();
  const category = draftExamination.category;
  const [exams, setExams] = useState<string[]>([]);

  useEffect(() => {
    if (!category) return;
    examinationService.getExamsByCategory(category).then(setExams);
  }, [category]);

  if (!category) {
    navigate('patient_tks_category');
    return null;
  }

  const pick = (name: string) => {
    updateDraftExamination({ examinationName: name });
    navigate('patient_tks_center');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sky-900 to-blue-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center" aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-sky-200 text-xs">2-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Tekshiruv nomi</h1>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-3 -mt-4 pb-24">
        {exams.map((x, i) => (
          <motion.button
            key={x}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => pick(x)}
            className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 text-sm font-semibold">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm font-medium">{x}</p>
                <p className="text-gray-500 text-xs mt-1">Tayyorgarlik ko'rsatmalari keyingi bosqichda</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 mt-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

