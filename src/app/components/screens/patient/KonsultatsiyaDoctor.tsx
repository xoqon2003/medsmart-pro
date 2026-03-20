import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ChevronRight, Search, Star, MapPin,
  Stethoscope, User as UserIcon, Building2, Clock,
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { bookingService } from '../../../../services';
import type { GeoRegion } from '../../../../services';
import type { User } from '../../../types';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';

/* ── Tibbiy mutaxassisliklar (emoji bilan) ── */
const SPECIALTY_ICONS: Record<string, string> = {
  Kardiolog: '❤️', Nevrolog: '🧠', Ortoped: '🦴', Travmatolog: '🩹',
  Dermatolog: '🫀', Oftalmolog: '👁️', Urolog: '🔬', Ginekolog: '🌸',
  Pediatr: '👶', Psixiatr: '🧬', Terapevt: '🩺', Endokrinolog: '⚗️',
};

/* ── Qidiruv rejimlari ── */
type SearchMode = 'location' | 'specialty' | 'name';

const MODES: { key: SearchMode; icon: React.ReactNode; label: string }[] = [
  { key: 'location',  icon: <MapPin className="w-3.5 h-3.5" />,       label: 'Hudud'       },
  { key: 'specialty', icon: <Stethoscope className="w-3.5 h-3.5" />,  label: 'Mutaxassis'  },
  { key: 'name',      icon: <UserIcon className="w-3.5 h-3.5" />,     label: 'Shifokor'    },
];

/* ── Demo narxlar ── */
const DEMO_PRICES: Record<number, number> = {};
function getPrice(doctorId: number): number {
  if (!DEMO_PRICES[doctorId]) {
    DEMO_PRICES[doctorId] = [120000, 150000, 180000, 200000][doctorId % 4];
  }
  return DEMO_PRICES[doctorId];
}

function formatPrice(n: number) {
  return n.toLocaleString('uz-UZ') + " so'm";
}

/* ── Demo keyingi bo'sh vaqt ── */
const NEXT_SLOTS = ['Bugun 14:00', 'Bugun 16:00', 'Ertaga 09:00', 'Ertaga 11:00', 'Ertaga 14:00'];
function nextSlot(id: number) { return NEXT_SLOTS[id % NEXT_SLOTS.length]; }

/* ════════════════════════════════════════════ */
export function KonsultatsiyaDoctor() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation } = useApp();
  const isOffline = draftConsultation.mode === 'offline';

  /* ── Holat ── */
  const [mode, setMode] = useState<SearchMode>('location');
  const [query, setQuery]         = useState(draftConsultation.query || '');
  const [activeSpecs, setActiveSpecs] = useState<string[]>(draftConsultation.specialityFilters || []);
  const [region, setRegion]       = useState(draftConsultation.region || '');
  const [district, setDistrict]   = useState(draftConsultation.district || '');
  const [clinic, setClinic]       = useState(draftConsultation.clinic || '');
  const [doctors, setDoctors]     = useState<User[]>([]);
  const [geo, setGeo]             = useState<GeoRegion[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    bookingService.getGeo().then(setGeo);
    bookingService.getSpecialties().then(setSpecialties);
  }, []);

  const districts = useMemo(() => geo.find((x) => x.region === region)?.districts || [], [geo, region]);
  const clinics   = useMemo(() => districts.find((x) => x.name === district)?.clinics || [], [district, districts]);

  /* ── Shifokorlarni yuklash (mode ga qarab) ── */
  useEffect(() => {
    if (mode === 'location') {
      if (!isOffline) {
        bookingService.getDoctors({ query: '', specialities: [] }).then(setDoctors);
        return;
      }
      if (!region || !district || !clinic) { setDoctors([]); return; }
      bookingService.getDoctors({ query: '', specialities: [] }).then(setDoctors);
    } else if (mode === 'specialty') {
      if (activeSpecs.length === 0) { setDoctors([]); return; }
      bookingService.getDoctors({ query: '', specialities: activeSpecs }).then(setDoctors);
    } else {
      // name mode
      if (query.length < 2) { setDoctors([]); return; }
      bookingService.getDoctors({ query, specialities: [] }).then(setDoctors);
    }
  }, [mode, query, activeSpecs, region, district, clinic, isOffline]);

  /* ── Shifokor tanlash ── */
  const pickDoctor = (d: User) => {
    updateDraftConsultation({
      query,
      specialityFilters: activeSpecs,
      region:      isOffline ? region   : undefined,
      district:    isOffline ? district : undefined,
      clinic:      isOffline ? clinic   : undefined,
      clinicName:  isOffline ? clinic   : undefined,
      clinicAddress: isOffline && region && district ? `${district}, ${region}` : undefined,
      selectedDoctorId: d.id,
      price: getPrice(d.id),
    });
    navigate('patient_kons_calendar');
  };

  /* ── Tab o'zgarganda holatni tozalash ── */
  const switchMode = (m: SearchMode) => {
    setMode(m);
    setDoctors([]);
    if (m !== 'specialty') setActiveSpecs([]);
    if (m !== 'name') setQuery('');
  };

  const locationReady = !isOffline || (!!region && !!district && !!clinic);
  const showDoctors = doctors.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 pt-12 pb-6 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={goBack}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"
            aria-label="Orqaga"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-emerald-200 text-xs">3-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Shifokor tanlash</h1>
            <p className="text-emerald-200/80 text-xs mt-0.5">
              {draftConsultation.mode === 'offline' ? 'Oflayn — Klinikaga borish' : 'Onlayn konsultatsiya'}
            </p>
          </div>
        </div>

        {/* ── Qidiruv rejimlari (tabs) ── */}
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => switchMode(m.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                mode === m.key
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'bg-white/15 text-white/80 hover:bg-white/20'
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 -mt-2 pb-24 space-y-3">

        {/* ══════════ HUDUD REJIMI ══════════ */}
        <AnimatePresence mode="wait">
          {mode === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {isOffline && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <p className="text-gray-700 text-sm font-medium">Klinika manzilini tanlang</p>
                  </div>

                  {/* Viloyat */}
                  <div>
                    <p className="text-gray-500 text-xs mb-1.5">Viloyat</p>
                    <Select
                      value={region || undefined}
                      onValueChange={(v) => {
                        setRegion(v); setDistrict(''); setClinic('');
                        updateDraftConsultation({ region: v, district: undefined, clinic: undefined });
                      }}
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
                      value={district || undefined}
                      onValueChange={(v) => {
                        setDistrict(v); setClinic('');
                        updateDraftConsultation({ district: v, clinic: undefined });
                      }}
                      disabled={!region}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={region ? 'Tumanni tanlang' : 'Avval viloyatni tanlang'} />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Klinika */}
                  <div>
                    <p className="text-gray-500 text-xs mb-1.5">Klinika</p>
                    <Select
                      value={clinic || undefined}
                      onValueChange={(v) => {
                        setClinic(v);
                        updateDraftConsultation({ clinic: v });
                      }}
                      disabled={!district}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder={district ? 'Klinikani tanlang' : 'Avval tumanni tanlang'} />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Klinika tanlangandan keyin info */}
                  {clinic && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-emerald-800 text-xs font-medium">{clinic}</p>
                        <p className="text-emerald-600 text-xs mt-0.5">{district}, {region}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-emerald-700 text-[11px]">⭐ 4.7 (demo)</span>
                          <span className="text-emerald-600 text-[11px]">• Du–Sh 08:00–20:00</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!locationReady && (
                    <p className="text-amber-600 text-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Shifokorlarni ko'rish uchun viloyat, tuman va klinikani tanlang
                    </p>
                  )}
                </div>
              )}

              {/* Doctor list */}
              {locationReady && <DoctorList doctors={doctors} onPick={pickDoctor} />}
            </motion.div>
          )}

          {/* ══════════ MUTAXASSIS REJIMI ══════════ */}
          {mode === 'specialty' && (
            <motion.div
              key="specialty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-gray-700 text-sm font-medium mb-3">Mutaxassislikni tanlang</p>
                <div className="grid grid-cols-3 gap-2">
                  {specialties.map((s) => {
                    const active = activeSpecs.includes(s);
                    const icon = SPECIALTY_ICONS[s] || '🏥';
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          setActiveSpecs((prev) =>
                            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                          );
                        }}
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs transition-all ${
                          active
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        <span className="text-lg">{icon}</span>
                        <span className="font-medium leading-tight text-center">{s}</span>
                      </button>
                    );
                  })}
                </div>
                {activeSpecs.length === 0 && (
                  <p className="text-gray-400 text-xs mt-3 text-center">
                    Kamida 1 ta mutaxassislikni tanlang
                  </p>
                )}
                {activeSpecs.length > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-emerald-700 text-xs font-medium">
                      {activeSpecs.length} ta tanlangan
                    </p>
                    <button
                      onClick={() => setActiveSpecs([])}
                      className="text-gray-400 text-xs underline"
                    >
                      Tozalash
                    </button>
                  </div>
                )}
              </div>

              {activeSpecs.length > 0 && <DoctorList doctors={doctors} onPick={pickDoctor} />}
            </motion.div>
          )}

          {/* ══════════ SHIFOKOR NOMI REJIMI ══════════ */}
          {mode === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                <div className="flex items-center gap-2 px-2">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Shifokor F.I.O. ni kiriting..."
                    className="w-full py-2.5 text-sm outline-none text-gray-800 placeholder:text-gray-400"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="text-gray-400 text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
                {query.length > 0 && query.length < 2 && (
                  <p className="text-gray-400 text-xs px-2 pb-1">Kamida 2 ta harf kiriting</p>
                )}
              </div>

              {query.length >= 2 && <DoctorList doctors={doctors} onPick={pickDoctor} />}

              {query.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-gray-500 text-sm">Shifokor ismini kiriting</p>
                  <p className="text-gray-400 text-xs mt-1">Masalan: "Umarov" yoki "Yusupov"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════ */
/* Shifokor kartochkalar ro'yxati               */
/* ════════════════════════════════════════════ */
function DoctorList({ doctors, onPick }: { doctors: User[]; onPick: (d: User) => void }) {
  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">🏥</p>
        <p className="text-gray-500 text-sm font-medium">Shifokor topilmadi</p>
        <p className="text-gray-400 text-xs mt-1">Boshqa filtr yoki hudud tanlang</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-gray-500 text-xs px-1">{doctors.length} ta shifokor topildi</p>
      {doctors.map((d, i) => (
        <motion.button
          key={d.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onPick(d)}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left active:scale-[0.99] transition-transform"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 text-sm font-bold flex-shrink-0">
              {(d.avatar || d.fullName.slice(0, 2)).slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm font-semibold leading-snug">
                Dr. {d.fullName}
              </p>
              <p className="text-emerald-700 text-xs mt-0.5 font-medium">
                {d.specialty || 'Mutaxassis'}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                {/* Rating */}
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium text-gray-700">{d.rating?.toFixed(1) ?? '4.5'}</span>
                </span>

                {/* Experience */}
                {d.experience && (
                  <span className="text-xs text-gray-500">
                    {d.experience} yil tajriba
                  </span>
                )}

                {/* Price */}
                <span className="text-xs font-semibold text-blue-700">
                  {formatPrice(getPrice(d.id))}
                </span>
              </div>

              {/* Next slot */}
              <div className="flex items-center gap-1 mt-1.5">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-700">
                  Bo'sh vaqt: {nextSlot(d.id)}
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-300 mt-1 flex-shrink-0" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
