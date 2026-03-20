import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Video, Phone, MessageCircle, Hospital, Home, Bed, Trees } from 'lucide-react';
import { useApp } from '../../../store/appStore';

export function KonsultatsiyaSubType() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation } = useApp();
  const mode = draftConsultation.mode;

  const pickOnline = (t: 'video' | 'phone' | 'chat') => {
    updateDraftConsultation({ onlineType: t, offlineType: undefined });
    navigate('patient_kons_doctor');
  };
  const pickOffline = (t: 'clinic' | 'home' | 'inpatient' | 'sanatorium') => {
    updateDraftConsultation({ offlineType: t, onlineType: undefined });
    if (t === 'home') {
      navigate('home_visit_address');
    } else if (t === 'sanatorium') {
      navigate('patient_kons_sanatorium');
    } else {
      navigate('patient_kons_doctor');
    }
  };

  if (!mode) {
    navigate('patient_kons_type');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center" aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-emerald-200 text-xs">2-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Qabul kichik turi</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-3 -mt-4 pb-24">
        {mode === 'online' ? (
          <>
            {[
              { id: 'video' as const, title: "Video qo'ng'iroq", desc: 'Zoom/Teams yoki shifokor platformasi', icon: <Video className="w-5 h-5 text-emerald-700" /> },
              { id: 'phone' as const, title: "Telefon qo'ng'iroq", desc: 'Faqat ovozli aloqa', icon: <Phone className="w-5 h-5 text-emerald-700" /> },
              { id: 'chat' as const, title: 'Chat / Yozishma', desc: 'Matn, rasm va fayl yuborish mumkin', icon: <MessageCircle className="w-5 h-5 text-emerald-700" /> },
            ].map((x) => (
              <motion.button
                key={x.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => pickOnline(x.id)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
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
          </>
        ) : (
          <>
            {[
              { id: 'clinic' as const, title: 'Klinikaga borish', desc: 'Bemor klinikaga keladi', icon: <Hospital className="w-5 h-5 text-sky-700" /> },
              { id: 'home' as const, title: 'Uyga chaqirish', desc: 'Shifokor uyga boradi (manzil so‘raladi)', icon: <Home className="w-5 h-5 text-sky-700" /> },
              { id: 'inpatient' as const, title: 'Statsionar', desc: "Bo'lim/kafedra tanlanadi", icon: <Bed className="w-5 h-5 text-sky-700" /> },
              { id: 'sanatorium' as const, title: 'Sanatoriya / Reabilitatsiya', desc: 'Muddati (kunlar) tanlanadi', icon: <Trees className="w-5 h-5 text-sky-700" /> },
            ].map((x) => (
              <motion.button
                key={x.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => pickOffline(x.id)}
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
          </>
        )}
      </div>
    </div>
  );
}

