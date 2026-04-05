import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, MapPin, Star, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { examinationService } from '../../../../services';
import type { Center } from '../../../../services';
import { formatPrice } from '../../../utils/formatters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

export function TekshiruvCenter() {
  const { goBack, navigate, draftExamination, updateDraftExamination } = useApp();
  const [sort, setSort] = useState<'price' | 'rating' | 'distance'>('rating');
  const [region, setRegion] = useState(draftExamination.region || '');
  const [district, setDistrict] = useState(draftExamination.district || '');
  const [allCenters, setAllCenters] = useState<Center[]>([]);

  useEffect(() => {
    examinationService.getCenters().then(setAllCenters);
  }, []);

  if (!draftExamination.examinationName) {
    navigate('patient_tks_exam');
    return null;
  }

  const regions = useMemo(() => Array.from(new Set(allCenters.map((c) => c.region))), [allCenters]);
  const districts = useMemo(() => {
    if (!region) return [];
    return Array.from(new Set(allCenters.filter((c) => c.region === region).map((c) => c.district)));
  }, [allCenters, region]);

  const filtered = useMemo(() => {
    let list = [...allCenters];
    if (region) list = list.filter((c) => c.region === region);
    if (district) list = list.filter((c) => c.district === district);
    list.sort((a, b) => {
      if (sort === 'price') return a.price - b.price;
      if (sort === 'distance') return a.distanceKm - b.distanceKm;
      return b.rating - a.rating;
    });
    return list;
  }, [allCenters, district, region, sort]);

  const pick = (c: Center) => {
    updateDraftExamination({
      centerId: c.id,
      region: c.region,
      district: c.district,
      price: c.price,
    });
    navigate('patient_tks_calendar');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-sky-900 to-blue-900 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center" aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-sky-200 text-xs">3-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Klinika tanlash</h1>
            <p className="text-sky-200/80 text-xs mt-0.5">{draftExamination.examinationName}</p>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 -mt-4 pb-24 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <p className="text-gray-700 text-sm">Hudud</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <p className="text-gray-600 text-xs mb-1.5">Viloyat</p>
              <Select
                value={region || undefined}
                onValueChange={(v) => {
                  setRegion(v);
                  setDistrict('');
                  updateDraftExamination({ region: v, district: undefined, centerId: undefined });
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Viloyatni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-gray-600 text-xs mb-1.5">Tuman</p>
              <Select
                value={district || undefined}
                onValueChange={(v) => {
                  setDistrict(v);
                  updateDraftExamination({ district: v, centerId: undefined });
                }}
                disabled={!region}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={region ? "Tumanni tanlang" : "Avval viloyatni tanlang"} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-gray-700 text-sm mb-2">Saralash</p>
          <div className="flex gap-2">
            {[
              { id: 'rating' as const, label: 'Reyting' },
              { id: 'price' as const, label: 'Narx' },
              { id: 'distance' as const, label: 'Masofa' },
            ].map((x) => (
              <button
                key={x.id}
                onClick={() => setSort(x.id)}
                className={`px-3 py-2 rounded-xl text-xs border ${
                  sort === x.id ? 'bg-sky-50 border-sky-200 text-sky-800' : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-10">Klinika topilmadi</div>
          ) : filtered.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => pick(c)}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-sky-700" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-medium">{c.name}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {c.region}, {c.district} • {c.distanceKm.toFixed(1)} km
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {c.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sky-700 font-medium">{formatPrice(c.price)}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 mt-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

