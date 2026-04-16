import React from 'react';
import { motion } from 'motion/react';
import { Construction, ArrowLeft } from 'lucide-react';
import { WebPlatformLayout } from './WebPlatformLayout';
import { useNavigation } from '../../../store/navigationContext';

interface WebComingSoonProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  features?: string[];
}

export function WebComingSoon({ title, subtitle, icon: Icon = Construction, features = [] }: WebComingSoonProps) {
  const { navigate } = useNavigation();

  return (
    <WebPlatformLayout title={title} subtitle={subtitle ?? "Ishlab chiqilmoqda"}>
      <div className="flex items-center justify-center min-h-[70vh] p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', boxShadow: '0 0 40px rgba(99,102,241,0.25)' }}
          >
            <Icon className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-white text-2xl font-bold mb-3">{title}</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Bu bo'lim hozirda ishlab chiqilmoqda.<br />
            Tez orada desktop uchun optimallashtirilgan interfeys tayyorlanadi.
          </p>

          {/* Progress bar */}
          <div className="bg-slate-800 rounded-full h-2 mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
              className="h-2 rounded-full"
              style={{ background: 'linear-gradient(90deg, #4f46e5, #06b6d4)' }}
            />
          </div>
          <p className="text-slate-600 text-xs mb-8">Tayyor: 65%</p>

          {/* Planned features */}
          {features.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 mb-6 text-left">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Rejalashtirilgan imkoniyatlar</p>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="flex items-center gap-2 text-slate-300 text-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    {f}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => navigate('web_dashboard')}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard ga qaytish
          </button>
        </motion.div>
      </div>
    </WebPlatformLayout>
  );
}
