import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Building2, Users, Stethoscope } from 'lucide-react';
import type { ClinicSearchResult } from '../../types';

interface Props {
  clinic: ClinicSearchResult;
  index: number;
  onSelect: (clinic: ClinicSearchResult) => void;
}

export function ClinicCard({ clinic, index, onSelect }: Props) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onSelect(clinic)}
      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Sarlavha */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-gray-900 text-sm font-semibold leading-snug">{clinic.name}</p>
            {clinic.isTop && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex-shrink-0">
                TOP
              </span>
            )}
          </div>

          {/* Manzil */}
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <p className="text-gray-500 text-xs">{clinic.address}</p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            <span className="flex items-center gap-0.5 text-xs text-gray-600">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{clinic.rating.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Stethoscope className="w-3 h-3" />
              {clinic.servicesCount} xizmat
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              {clinic.doctorsCount} shifokor
            </span>
            {clinic.distance !== undefined && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <MapPin className="w-3 h-3" />
                {clinic.distance} km
              </span>
            )}
          </div>

          {/* Tavsif */}
          {clinic.description && (
            <p className="text-gray-400 text-xs mt-1.5 line-clamp-1">{clinic.description}</p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
