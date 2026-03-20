import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Stethoscope, Microscope, ChevronRight, X } from 'lucide-react';

type ServiceKey = 'radiology' | 'konsultatsiya' | 'tekshiruv';

const items: Array<{
  key: ServiceKey;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}> = [
  {
    key: 'radiology',
    title: "Tibbiy ma'lumotlarim asosida konsultatsiya",
    description: 'MRT, MSKT, Rentgen, USG tasvir yuklash va radiolog/AI xulosasi',
    icon: <Brain className="w-5 h-5 text-indigo-600" />,
    iconBg: 'bg-indigo-50 border-indigo-100',
  },
  {
    key: 'konsultatsiya',
    title: 'Konsultatsiyaga yozilish',
    description: 'Mutaxassis shifokor bilan onlayn yoki oflayn qabulga yozilish',
    icon: <Stethoscope className="w-5 h-5 text-emerald-600" />,
    iconBg: 'bg-emerald-50 border-emerald-100',
  },
  {
    key: 'tekshiruv',
    title: 'Tekshiruv / tahlil analiziga yozilish',
    description: 'Laboratoriya, diagnostik tekshiruvlarga (MRT/KT/UZI) yozilish',
    icon: <Microscope className="w-5 h-5 text-sky-600" />,
    iconBg: 'bg-sky-50 border-sky-100',
  },
];

export function ServiceSelectionBottomSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (key: ServiceKey) => void;
}) {
  const { open, onOpenChange, onSelect } = props;
  const sheetRef = useRef<HTMLDivElement>(null);

  // Swipe down to close
  const startY = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches[0].clientY - startY.current > 60) onOpenChange(false);
  };

  // Lock scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay — butun ekranni qoplaydi */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Sheet — fixed, max-w-md markazda, BottomNav ustida */}
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <motion.div
              key="sheet"
              ref={sheetRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl pointer-events-auto"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              <div className="px-5 pt-2 pb-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-gray-900 text-base font-bold">Qabul turini tanlang</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Quyidagi 3 yo'nalishdan birini tanlang</p>
                  </div>
                  <button
                    onClick={() => onOpenChange(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Service items */}
                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <motion.button
                      key={item.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.18 }}
                      onClick={() => { onSelect(item.key); onOpenChange(false); }}
                      className="w-full flex items-center gap-3.5 bg-gray-50 active:bg-gray-100 border border-gray-100 rounded-2xl px-4 py-4 text-left transition-colors"
                    >
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm font-semibold leading-snug">{item.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5 leading-snug">{item.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>

                {/* Cancel */}
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-full mt-3 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-500 active:bg-gray-100 transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
