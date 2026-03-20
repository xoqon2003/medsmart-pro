import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Zap } from 'lucide-react';
import { useApp } from '../../store/appStore';

export function SplashScreen() {
  const { navigate, setUser } = useApp();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 600);
    const timer2 = setTimeout(() => setStep(2), 1200);
    // Mini App entry — har doim role_select ga
    const timer3 = setTimeout(() => navigate('role_select'), 2800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
          <Activity className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-white text-3xl mb-2">RadConsult</h1>
        <p className="text-blue-200 text-base">Masofaviy Radiologik Konsultatsiya</p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 30 }}
        transition={{ duration: 0.5 }}
        className="flex gap-6 mb-12"
      >
        {[
          { icon: Shield, label: 'Xavfsiz' },
          { icon: Zap, label: 'Tez' },
          { icon: Activity, label: 'Professional' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-200" />
            </div>
            <span className="text-blue-300 text-xs">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* Loading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: step >= 1 ? 1 : 0 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-blue-300 rounded-full"
            />
          ))}
        </div>
        <p className="text-blue-300 text-sm">Yuklanmoqda...</p>
      </motion.div>
    </div>
  );
}
