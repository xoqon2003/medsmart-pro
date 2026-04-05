import React from 'react';
import { Star, MapPin, Building2 } from 'lucide-react';
import type { ClinicSearchResult } from '../../types';

interface Props {
  clinic: ClinicSearchResult;
  onSelect: (clinic: ClinicSearchResult) => void;
}

export function TopClinicCard({ clinic, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(clinic)}
      className="flex-shrink-0 w-[200px] bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-left active:scale-[0.98] transition-transform"
    >
      {/* Top badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-emerald-600" />
        </div>
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
          TOP
        </span>
      </div>

      {/* Nomi */}
      <p className="text-gray-900 text-sm font-semibold leading-tight line-clamp-1">{clinic.name}</p>

      {/* Manzil */}
      <div className="flex items-center gap-1 mt-1">
        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <p className="text-gray-500 text-xs line-clamp-1">{clinic.city || clinic.address}</p>
      </div>

      {/* Rating + xizmatlar */}
      <div className="flex items-center gap-2 mt-2">
        <span className="flex items-center gap-0.5 text-xs text-gray-600">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="font-medium">{clinic.rating.toFixed(1)}</span>
        </span>
        <span className="text-gray-400 text-[10px]">{clinic.servicesCount} xizmat</span>
      </div>
    </button>
  );
}
