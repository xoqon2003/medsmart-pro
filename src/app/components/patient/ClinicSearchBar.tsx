import React from 'react';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  isFilterOpen: boolean;
  hasActiveFilters: boolean;
  onToggleFilter: () => void;
  isLoading?: boolean;
}

export function ClinicSearchBar({ value, onChange, isFilterOpen, hasActiveFilters, onToggleFilter, isLoading }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Klinika qidiring..."
            className="w-full py-2 text-sm outline-none text-gray-800 placeholder:text-gray-400"
          />
          {value && (
            <button onClick={() => onChange('')} className="text-gray-400 hover:text-gray-600 p-0.5">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={onToggleFilter}
          className={`relative p-2.5 rounded-xl transition-colors ${
            isFilterOpen
              ? 'bg-emerald-100 text-emerald-700'
              : hasActiveFilters
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {isFilterOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <SlidersHorizontal className="w-4 h-4" />
          )}
          {/* Faol filtr indikatori */}
          {hasActiveFilters && !isFilterOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>
    </div>
  );
}
