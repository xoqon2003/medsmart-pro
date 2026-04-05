import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { ClinicSearchResult } from '../../types';
import { TopClinicCard } from './TopClinicCard';

interface Props {
  clinics: ClinicSearchResult[];
  onSelect: (clinic: ClinicSearchResult) => void;
}

export function TopClinicCarousel({ clinics, onSelect }: Props) {
  if (clinics.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-1.5 mb-2.5 px-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <p className="text-gray-700 text-xs font-semibold">Top klinikalar</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {clinics.map((c) => (
          <TopClinicCard key={c.id} clinic={c} onSelect={onSelect} />
        ))}
      </div>
    </motion.div>
  );
}
