import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Star, Clock, X } from 'lucide-react';
import type { User } from '../../types';
import { useApp } from '../../store/appStore';

/* ── Demo narxlar ── */
const DEMO_PRICES: Record<number, number> = {};
export function getPrice(doctorId: number): number {
  if (!DEMO_PRICES[doctorId]) {
    DEMO_PRICES[doctorId] = [120000, 150000, 180000, 200000][doctorId % 4];
  }
  return DEMO_PRICES[doctorId];
}

export function formatPrice(n: number) {
  return n.toLocaleString('uz-UZ') + " so'm";
}

/* ── Demo keyingi bo'sh vaqt ── */
const NEXT_SLOTS = ['Bugun 14:00', 'Bugun 16:00', 'Ertaga 09:00', 'Ertaga 11:00', 'Ertaga 14:00'];
export function nextSlot(id: number) { return NEXT_SLOTS[id % NEXT_SLOTS.length]; }

const isTopDoctor = (d: User) => (d.rating || 0) >= 4.9;

/* ════════════════════════════════════════════ */
/* Shifokor kartochkalar ro'yxati               */
/* ════════════════════════════════════════════ */
export function DoctorList({ doctors, onPick }: { doctors: User[]; onPick: (d: User) => void }) {
  const { navigate, setViewingDoctorId } = useApp();
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [searchQ, setSearchQ]     = useState('');
  const [minRating, setMinRating] = useState(0);
  const [minExp, setMinExp]       = useState(0);

  /* ── Client-side filtr + saralash ── */
  const filtered = useMemo(() => {
    let list = [...doctors];
    if (searchQ.length >= 2) {
      const q = searchQ.toLowerCase();
      list = list.filter(d =>
        d.fullName.toLowerCase().includes(q) ||
        (d.specialty || '').toLowerCase().includes(q)
      );
    }
    if (minRating > 0) list = list.filter(d => (d.rating || 0) >= minRating);
    if (minExp > 0) list = list.filter(d => (d.experience || 0) >= minExp);
    list.sort((a, b) => {
      const aT = isTopDoctor(a) ? 1 : 0;
      const bT = isTopDoctor(b) ? 1 : 0;
      if (aT !== bT) return bT - aT;
      return (b.rating || 0) - (a.rating || 0);
    });
    return list;
  }, [doctors, searchQ, minRating, minExp]);

  const previewDoc = previewId ? filtered.find(d => d.id === previewId) || null : null;

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">{'🏥'}</p>
        <p className="text-gray-500 text-sm font-medium">Shifokor topilmadi</p>
        <p className="text-gray-400 text-xs mt-1">Boshqa filtr yoki hudud tanlang</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">

      {/* ── Qidiruv ── */}
      {doctors.length >= 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Shifokor qidirish..."
            className="w-full py-2.5 text-sm outline-none text-gray-800 placeholder:text-gray-400"
          />
          {searchQ && (
            <button onClick={() => setSearchQ('')} className="text-gray-400 text-lg leading-none">×</button>
          )}
        </div>
      )}

      {/* ── Filtr pill'lar ── */}
      {doctors.length >= 4 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {([
            { label: '⭐ 4.5+', val: 4.5, grp: 'r' },
            { label: '⭐ 4.8+', val: 4.8, grp: 'r' },
            { label: '10+ yil', val: 10,  grp: 'e' },
            { label: '15+ yil', val: 15,  grp: 'e' },
          ] as const).map(f => {
            const active = f.grp === 'r' ? minRating === f.val : minExp === f.val;
            return (
              <button
                key={f.label}
                onClick={() => {
                  if (f.grp === 'r') setMinRating(active ? 0 : f.val);
                  else setMinExp(active ? 0 : f.val);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                  active
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Son ── */}
      <p className="text-gray-500 text-xs px-1">{filtered.length} ta shifokor topildi</p>

      {/* ── Preview rejim ── */}
      {previewDoc ? (
        <div className="space-y-3">
          {/* Kengaytirilgan kartochka */}
          <motion.div
            key={`preview-${previewDoc.id}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-md border border-emerald-100 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingDoctorId(previewDoc.id);
                    navigate('doctor_public_profile');
                  }}
                  title="Shifokor portfoliosiga kirish"
                  className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all flex-shrink-0 cursor-pointer group"
                >
                  <img
                    src={previewDoc.gender === 'female' ? '/doctors/female doctor.png' : '/doctors/doctor-male.png'}
                    alt="Shifokor portfoliosi"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </button>
                <div>
                  {isTopDoctor(previewDoc) && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-1">
                      🏆 Top mutaxassis
                    </span>
                  )}
                  <p className="text-gray-900 font-semibold">Dr. {previewDoc.fullName}</p>
                  <p className="text-emerald-700 text-sm font-medium">{previewDoc.specialty || 'Mutaxassis'}</p>
                </div>
              </div>
              <button onClick={() => setPreviewId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-gray-500 text-[10px]">Reyting</p>
                <p className="text-gray-800 text-sm font-semibold flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  {previewDoc.rating?.toFixed(2) ?? '4.50'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-gray-500 text-[10px]">Tajriba</p>
                <p className="text-gray-800 text-sm font-semibold">{previewDoc.experience || 0} yil</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center">
                <p className="text-gray-500 text-[10px]">Xulosalar</p>
                <p className="text-gray-800 text-sm font-semibold">{previewDoc.totalConclusions || 0}</p>
              </div>
            </div>

            {previewDoc.license && (
              <p className="text-gray-400 text-[11px] mb-2">📋 {previewDoc.license}</p>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-700">Bo'sh: {nextSlot(previewDoc.id)}</span>
              </div>
              <span className="text-blue-700 text-sm font-bold">{formatPrice(getPrice(previewDoc.id))}</span>
            </div>

            <button
              onClick={() => onPick(previewDoc)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl py-3 text-sm font-medium shadow-lg shadow-emerald-200"
            >
              ✅ Tanlash
            </button>
          </motion.div>

          {/* Boshqa shifokorlar (mini ikonkalar) */}
          {filtered.length > 1 && (
            <div>
              <p className="text-gray-400 text-xs mb-2">Boshqa shifokorlar</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {filtered.filter(d => d.id !== previewId).map(d => (
                  <button
                    key={d.id}
                    onClick={() => setPreviewId(d.id)}
                    className="flex flex-col items-center gap-1 flex-shrink-0"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isTopDoctor(d)
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    }`}>
                      {(d.avatar || d.fullName.slice(0, 2)).slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] text-gray-500 max-w-[48px] truncate">
                      {d.fullName.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Oddiy ro'yxat ── */
        filtered.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setPreviewId(d.id)}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 text-sm font-bold flex-shrink-0">
                  {(d.avatar || d.fullName.slice(0, 2)).slice(0, 2).toUpperCase()}
                </div>
                {isTopDoctor(d) && (
                  <span className="absolute -top-1 -right-1 text-[10px]">🏆</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 text-sm font-semibold leading-snug">Dr. {d.fullName}</p>
                  {isTopDoctor(d) && (
                    <span className="text-[9px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Top</span>
                  )}
                </div>
                <p className="text-emerald-700 text-xs mt-0.5 font-medium">{d.specialty || 'Mutaxassis'}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-700">{d.rating?.toFixed(1) ?? '4.5'}</span>
                  </span>
                  {d.experience && (
                    <span className="text-xs text-gray-500">{d.experience} yil tajriba</span>
                  )}
                  <span className="text-xs font-semibold text-blue-700">{formatPrice(getPrice(d.id))}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-emerald-700">Bo'sh vaqt: {nextSlot(d.id)}</span>
                </div>
              </div>
            </div>
          </motion.button>
        ))
      )}

      {/* ── Bo'sh filtr natijasi ── */}
      {filtered.length === 0 && doctors.length > 0 && (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">{'🔍'}</p>
          <p className="text-gray-500 text-sm">Filtr bo'yicha natija topilmadi</p>
          <button
            onClick={() => { setSearchQ(''); setMinRating(0); setMinExp(0); }}
            className="text-emerald-600 text-xs mt-2 underline"
          >
            Filtrlarni tozalash
          </button>
        </div>
      )}
    </div>
  );
}
