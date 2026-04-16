import React from 'react';
import { ArrowLeft, Microscope } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigation } from '../../../store/navigationContext';

export function TekshiruvHome() {
  const { goBack } = useNavigation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sky-900 to-blue-900 pt-12 pb-6 px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            aria-label="Orqaga"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-sky-200 text-xs">Yangi ariza</p>
            <h1 className="text-white text-lg font-semibold">Tekshiruv / tahlilga yozilish</h1>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Microscope className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-gray-900 text-sm font-medium">Ishlab chiqilmoqda</p>
          <p className="text-gray-500 text-xs mt-1">
            Bu sahifa §3 (tekshiruv turi → klinika → kalendar → tasdiqlash → to‘lov) oqimi uchun tayyorlangan “placeholder”.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

