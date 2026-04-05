import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import type { GeoRegion } from '../../../services';

interface FilterValues {
  region: string;
  district: string;
  nearbyEnabled: boolean;
  minServices: string;
}

interface Props {
  isOpen: boolean;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: () => void;
  onReset: () => void;
  geo: GeoRegion[];
  isGeoLoading?: boolean;
  geoError?: string | null;
}

const MIN_SERVICES_OPTIONS = [
  { value: '0', label: 'Barchasi' },
  { value: '5', label: '5+ xizmat' },
  { value: '10', label: '10+ xizmat' },
  { value: '20', label: '20+ xizmat' },
];

export function ClinicAdvancedFilter({ isOpen, values, onChange, onApply, onReset, geo, isGeoLoading, geoError }: Props) {
  const districts = geo.find((r) => r.region === values.region)?.districts || [];

  const updateField = <K extends keyof FilterValues>(key: K, val: FilterValues[K]) => {
    const next = { ...values, [key]: val };
    // Viloyat o'zgarganda tumanni tozalash
    if (key === 'region') {
      next.district = '';
    }
    // Geolokatsiya yoqilganda viloyat/tumanni tozalash
    if (key === 'nearbyEnabled' && val === true) {
      next.region = '';
      next.district = '';
    }
    onChange(next);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            {/* Viloyat */}
            <div>
              <p className="text-gray-500 text-xs mb-1.5">Viloyat</p>
              <Select
                value={values.region || undefined}
                onValueChange={(v) => updateField('region', v)}
                disabled={values.nearbyEnabled}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Viloyatni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {geo.map((r) => (
                    <SelectItem key={r.region} value={r.region}>{r.region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tuman */}
            <div>
              <p className="text-gray-500 text-xs mb-1.5">Tuman / Shahar</p>
              <Select
                value={values.district || undefined}
                onValueChange={(v) => updateField('district', v)}
                disabled={!values.region || values.nearbyEnabled}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={values.region ? 'Tumanni tanlang' : 'Avval viloyatni tanlang'} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Yaqin klinikalar (Geolokatsiya) */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <span className="text-gray-700 text-sm font-medium">Yaqin klinikalar</span>
              </div>
              <button
                onClick={() => updateField('nearbyEnabled', !values.nearbyEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  values.nearbyEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    values.nearbyEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isGeoLoading && (
              <p className="text-emerald-600 text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 animate-pulse" />
                Joylashuvingiz aniqlanmoqda...
              </p>
            )}

            {geoError && (
              <p className="text-red-500 text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {geoError}
              </p>
            )}

            {/* Xizmatlar soni */}
            <div>
              <p className="text-gray-500 text-xs mb-1.5">Xizmatlar soni</p>
              <Select
                value={values.minServices}
                onValueChange={(v) => updateField('minServices', v)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Barchasi" />
                </SelectTrigger>
                <SelectContent>
                  {MIN_SERVICES_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={onApply}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                Qo'llash
              </button>
              <button
                onClick={onReset}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm transition-colors"
              >
                Tozalash
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
