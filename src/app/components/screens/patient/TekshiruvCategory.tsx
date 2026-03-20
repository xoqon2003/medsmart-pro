import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Microscope, Activity, Waves, FlaskConical, Camera, Stethoscope } from 'lucide-react';
import { useApp } from '../../../store/appStore';

type Category = 'visual' | 'ultrasound' | 'laboratory' | 'functional' | 'endoscopy';

export function TekshiruvCategory() {
  const { goBack, navigate, clearDraftExamination, updateDraftExamination } = useApp();

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
        {[
          { id: 'visual' as const, title: 'Vizual diagnostika', desc: 'MRT, KT, Rentgen, Flyurografiya', icon: <Camera className="w-5 h-5 text-sky-700" /> },
          { id: 'ultrasound' as const, title: 'Ultratovush', desc: 'UZI / USG', icon: <Waves className="w-5 h-5 text-sky-700" /> },
          { id: 'laboratory' as const, title: 'Laboratoriya', desc: 'Qon, siydik, biologik tahlillar', icon: <FlaskConical className="w-5 h-5 text-sky-700" /> },
          { id: 'functional' as const, title: 'Funksional', desc: 'EKG, EEG, Spirometriya', icon: <Activity className="w-5 h-5 text-sky-700" /> },
          { id: 'endoscopy' as const, title: 'Endoskopiya', desc: 'FGDS, Kolonoskopiya', icon: <Stethoscope className="w-5 h-5 text-sky-700" /> },
        ].map((x, i) => (
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
              <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                {x.icon}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 text-sm font-medium">{x.title}</p>
                <p className="text-gray-500 text-xs mt-1">{x.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 mt-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

