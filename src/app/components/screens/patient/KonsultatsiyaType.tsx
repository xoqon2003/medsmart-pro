import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Video, Phone, MessageCircle, MapPin } from 'lucide-react';
import { useApp } from '../../../store/appStore';

export function KonsultatsiyaType() {
  const { goBack, navigate, updateDraftConsultation, clearDraftConsultation } = useApp();

  const pick = (mode: 'online' | 'offline') => {
    clearDraftConsultation();
    updateDraftConsultation({ mode });
    navigate('patient_kons_subtype');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center" aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-emerald-200 text-xs">1-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Qabul turi</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-3 -mt-4 pb-24">
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => pick('online')}
          className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Video className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 text-sm font-medium">Onlayn</p>
              <p className="text-gray-500 text-xs mt-1">Video / Telefon / Chat orqali masofadan maslahat</p>
              <div className="flex items-center gap-2 text-gray-400 text-xs mt-2">
                <Video className="w-3.5 h-3.5" />
                <Phone className="w-3.5 h-3.5" />
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 mt-1" />
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => pick('offline')}
          className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 text-sm font-medium">Oflayn</p>
              <p className="text-gray-500 text-xs mt-1">Klinika / Uy / Statsionar / Sanatoriya</p>
              <p className="text-gray-400 text-xs mt-2">Hudud filtri faollashadi</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 mt-1" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}

