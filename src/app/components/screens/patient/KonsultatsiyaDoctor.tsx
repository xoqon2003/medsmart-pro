import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Search, Star, MapPin,
  Stethoscope, User as UserIcon, Building2, X,
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { bookingService } from '../../../../services';
import type { GeoRegion } from '../../../../services';
import type { User, ClinicSearchResult } from '../../../types';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';
import { ClinicSearchBar } from '../../patient/ClinicSearchBar';
import { ClinicAdvancedFilter } from '../../patient/ClinicAdvancedFilter';
import { TopClinicCarousel } from '../../patient/TopClinicCarousel';
import { ClinicCard } from '../../patient/ClinicCard';
import { DoctorList, getPrice } from '../../patient/DoctorList';

/* ── Tibbiy mutaxassisliklar (emoji bilan) ── */
const SPECIALTY_ICONS: Record<string, string> = {
  Kardiolog: '\u2764\uFE0F', Nevrolog: '\uD83E\uDDE0', Ortoped: '\uD83E\uDDB4', Travmatolog: '\uD83E\uDE79',
  Dermatolog: '\uD83E\uDEC0', Oftalmolog: '\uD83D\uDC41\uFE0F', Urolog: '\uD83D\uDD2C', Ginekolog: '\uD83C\uDF38',
  Pediatr: '\uD83D\uDC76', Psixiatr: '\uD83E\uDDEC', Terapevt: '\uD83E\uDE7A', Endokrinolog: '\u2697\uFE0F',
};

/* ── Qidiruv rejimlari ── */
type SearchMode = 'location' | 'specialty' | 'name';

const MODES: { key: SearchMode; icon: React.ReactNode; label: string }[] = [
  { key: 'location',  icon: <MapPin className="w-3.5 h-3.5" />,       label: 'Hudud'       },
  { key: 'specialty', icon: <Stethoscope className="w-3.5 h-3.5" />,  label: 'Mutaxassis'  },
  { key: 'name',      icon: <UserIcon className="w-3.5 h-3.5" />,     label: 'Shifokor'    },
];

/* ════════════════════════════════════════════ */
export function KonsultatsiyaDoctor() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation } = useApp();
  const isOffline = draftConsultation.mode === 'offline';

  /* ── Holat ── */
  // Agar specialityFilters oldindan qo'yilgan bo'lsa (AI Tavsiya dan), avtomatik specialty mode ga o'tish
  const hasPresetSpecialty = (draftConsultation.specialityFilters?.length ?? 0) > 0;
  const [mode, setMode] = useState<SearchMode>(hasPresetSpecialty ? 'specialty' : 'location');
  const [query, setQuery]         = useState(draftConsultation.query || '');
  const [activeSpecs, setActiveSpecs] = useState<string[]>(draftConsultation.specialityFilters || []);
  const [region, setRegion]       = useState(draftConsultation.region || '');
  const [district, setDistrict]   = useState(draftConsultation.district || '');
  const [clinic, setClinic]       = useState(draftConsultation.clinic || '');
  const [doctors, setDoctors]     = useState<User[]>([]);
  const [geo, setGeo]             = useState<GeoRegion[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  /* ── TT-001: Klinika filtr holatlari ── */
  const [clinicSearch, setClinicSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    region: '',
    district: '',
    nearbyEnabled: false,
    minServices: '0',
  });
  const [clinicResults, setClinicResults] = useState<ClinicSearchResult[]>([]);
  const [topClinics, setTopClinics] = useState<ClinicSearchResult[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    bookingService.getGeo().then(setGeo);
    bookingService.getSpecialties().then(setSpecialties);

    // Top klinikalarni yuklash
    if (isOffline) {
      bookingService.getTopClinics(10).then(setTopClinics);
      // Dastlabki barcha klinikalarni yuklash
      bookingService.searchClinics({}).then(res => setClinicResults(res.data));
    }
  }, [isOffline]);

  const districts = useMemo(() => geo.find((x) => x.region === region)?.districts || [], [geo, region]);
  const clinics   = useMemo(() => districts.find((x) => x.name === district)?.clinics || [], [district, districts]);

  /* ── TT-001: Klinika qidiruv (debounce 300ms) ── */
  const searchClinics = useCallback((searchQuery: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (filterValues.nearbyEnabled) {
          // Geolokatsiya rejimida
          // Faqat yangi search query bilan filtrlaymiz
          return;
        }
        const res = await bookingService.searchClinics({
          query: searchQuery.length >= 2 ? searchQuery : undefined,
          region: filterValues.region || undefined,
          district: filterValues.district || undefined,
          minServices: filterValues.minServices !== '0' ? parseInt(filterValues.minServices) : undefined,
        });
        setClinicResults(res.data);
      } catch (e) {
        console.error('Clinic search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [filterValues]);

  /* Clinic search debounce */
  useEffect(() => {
    if (isOffline && mode === 'location') {
      searchClinics(clinicSearch);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [clinicSearch, isOffline, mode, searchClinics]);

  /* ── TT-001: Geolokatsiya ── */
  const handleGeoToggle = useCallback((newValues: typeof filterValues) => {
    setFilterValues(newValues);

    if (newValues.nearbyEnabled) {
      setIsGeoLoading(true);
      setGeoError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setIsGeoLoading(false);
          try {
            const nearby = await bookingService.getNearbyClinics(latitude, longitude, 10);
            setClinicResults(nearby);
          } catch (e) {
            console.error('Nearby clinics error:', e);
          }
        },
        (error) => {
          setIsGeoLoading(false);
          setGeoError('Geolokatsiyaga ruxsat bering');
          // Toggle ni o'chirish
          setFilterValues(prev => ({ ...prev, nearbyEnabled: false }));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  /* ── TT-001: Filtrlarni qo'llash ── */
  const applyFilters = useCallback(async () => {
    setIsFilterOpen(false);
    setIsSearching(true);
    try {
      if (filterValues.nearbyEnabled) {
        // Geolokatsiya allaqachon ma'lumotlarni yuklagan
        return;
      }
      const res = await bookingService.searchClinics({
        query: clinicSearch.length >= 2 ? clinicSearch : undefined,
        region: filterValues.region || undefined,
        district: filterValues.district || undefined,
        minServices: filterValues.minServices !== '0' ? parseInt(filterValues.minServices) : undefined,
      });
      setClinicResults(res.data);
    } catch (e) {
      console.error('Filter apply error:', e);
    } finally {
      setIsSearching(false);
    }
  }, [filterValues, clinicSearch]);

  /* ── TT-001: Filtrlarni tozalash ── */
  const resetFilters = useCallback(async () => {
    const resetValues = { region: '', district: '', nearbyEnabled: false, minServices: '0' };
    setFilterValues(resetValues);
    setClinicSearch('');
    setIsFilterOpen(false);
    try {
      const res = await bookingService.searchClinics({});
      setClinicResults(res.data);
    } catch (e) {
      console.error('Reset error:', e);
    }
  }, []);

  /* ── TT-001: Klinika tanlash ── */
  const selectClinic = useCallback((c: ClinicSearchResult) => {
    setSelectedClinic(c);
    setClinic(c.name);
    updateDraftConsultation({
      clinic: c.id,
      clinicName: c.name,
      clinicAddress: c.address,
    });
  }, [updateDraftConsultation]);

  const hasActiveFilters = filterValues.region !== '' || filterValues.district !== '' || filterValues.nearbyEnabled || filterValues.minServices !== '0';

  /* ── Shifokorlarni yuklash (mode ga qarab) ── */
  useEffect(() => {
    if (mode === 'location') {
      if (!isOffline) {
        bookingService.getDoctors({ query: '', specialities: [] }).then(setDoctors);
        return;
      }
      // TT-001: Klinika tanlanganda shifokorlarni yuklash
      if (!selectedClinic) { setDoctors([]); return; }
      bookingService.getDoctors({ query: '', specialities: [] }).then(setDoctors);
    } else if (mode === 'specialty') {
      if (activeSpecs.length === 0) { setDoctors([]); return; }
      bookingService.getDoctors({ query: '', specialities: activeSpecs }).then(setDoctors);
    } else {
      // name mode
      if (query.length < 2) { setDoctors([]); return; }
      bookingService.getDoctors({ query, specialities: [] }).then(setDoctors);
    }
  }, [mode, query, activeSpecs, selectedClinic, isOffline]);

  /* ── Shifokor tanlash ── */
  const pickDoctor = (d: User) => {
    updateDraftConsultation({
      query,
      specialityFilters: activeSpecs,
      region:      isOffline && selectedClinic ? selectedClinic.region : undefined,
      district:    isOffline && selectedClinic ? selectedClinic.city : undefined,
      clinic:      isOffline && selectedClinic ? selectedClinic.id : undefined,
      clinicName:  isOffline && selectedClinic ? selectedClinic.name : undefined,
      clinicAddress: isOffline && selectedClinic ? selectedClinic.address : undefined,
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

  const locationReady = !isOffline || !!selectedClinic;
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
              {isOffline ? (
                <>
                  {/* ── TT-001: Yangi klinika qidiruv tizimi ── */}

                  {/* Qidiruv bar */}
                  <ClinicSearchBar
                    value={clinicSearch}
                    onChange={setClinicSearch}
                    isFilterOpen={isFilterOpen}
                    hasActiveFilters={hasActiveFilters}
                    onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
                    isLoading={isSearching}
                  />

                  {/* Kengaytirilgan filtr paneli */}
                  <ClinicAdvancedFilter
                    isOpen={isFilterOpen}
                    values={filterValues}
                    onChange={(vals) => {
                      if (vals.nearbyEnabled !== filterValues.nearbyEnabled) {
                        handleGeoToggle(vals);
                      } else {
                        setFilterValues(vals);
                      }
                    }}
                    onApply={applyFilters}
                    onReset={resetFilters}
                    geo={geo}
                    isGeoLoading={isGeoLoading}
                    geoError={geoError}
                  />

                  {/* Tanlangan klinika info */}
                  {selectedClinic && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-emerald-800 text-sm font-semibold">{selectedClinic.name}</p>
                            <button
                              onClick={() => { setSelectedClinic(null); setClinic(''); }}
                              className="text-emerald-600 text-xs underline"
                            >
                              O'zgartirish
                            </button>
                          </div>
                          <p className="text-emerald-600 text-xs mt-0.5">{selectedClinic.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-0.5 text-xs text-emerald-700">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {selectedClinic.rating.toFixed(1)}
                            </span>
                            <span className="text-emerald-600 text-[11px]">{selectedClinic.servicesCount} xizmat</span>
                            <span className="text-emerald-600 text-[11px]">{selectedClinic.doctorsCount} shifokor</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Top klinikalar carousel */}
                  {!selectedClinic && !clinicSearch && !hasActiveFilters && topClinics.length > 0 && (
                    <TopClinicCarousel clinics={topClinics} onSelect={selectClinic} />
                  )}

                  {/* Klinikalar ro'yxati */}
                  {!selectedClinic && (
                    <div className="space-y-2">
                      {clinicResults.length > 0 && (
                        <p className="text-gray-500 text-xs px-1">
                          {clinicResults.length} ta klinika topildi
                        </p>
                      )}
                      {clinicResults.map((c, i) => (
                        <ClinicCard key={c.id} clinic={c} index={i} onSelect={selectClinic} />
                      ))}
                      {clinicResults.length === 0 && !isSearching && (
                        <div className="text-center py-10">
                          <p className="text-4xl mb-3">{'\uD83C\uDFE5'}</p>
                          <p className="text-gray-500 text-sm font-medium">Klinika topilmadi</p>
                          <p className="text-gray-400 text-xs mt-1">Filtrlarni o'zgartiring</p>
                        </div>
                      )}
                      {isSearching && (
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : null}

              {/* Doctor list — onlayn yoki klinika tanlangan */}
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
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-700 text-sm font-medium">Mutaxassislikni tanlang</p>
                  {activeSpecs.length > 0 && (
                    <button
                      onClick={() => setActiveSpecs([])}
                      className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors"
                      aria-label="Tozalash"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {activeSpecs.length === 0 ? (
                    /* ── Grid: hech narsa tanlanmagan ── */
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {specialties.map((s) => {
                          const icon = SPECIALTY_ICONS[s] || '\uD83C\uDFE5';
                          return (
                            <button
                              key={s}
                              onClick={() => setActiveSpecs([s])}
                              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 text-xs transition-all"
                            >
                              <span className="text-lg">{icon}</span>
                              <span className="font-medium leading-tight text-center">{s}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-gray-400 text-xs mt-3 text-center">
                        Kamida 1 ta mutaxassislikni tanlang
                      </p>
                    </motion.div>
                  ) : (
                    /* ── Tanlangan: katta karta + mini ikonkalar ── */
                    <motion.div
                      key={`selected-${activeSpecs[0]}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                    >
                      {/* Katta tanlangan mutaxassislik */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveSpecs([])}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 flex flex-col items-center mb-3"
                      >
                        <span className="text-4xl mb-1">{SPECIALTY_ICONS[activeSpecs[0]] || '\uD83C\uDFE5'}</span>
                        <span className="text-white text-base font-semibold">{activeSpecs[0]}</span>
                      </motion.button>

                      {/* Boshqa mutaxassisliklar — mini ikonkalar */}
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {specialties.filter(s => s !== activeSpecs[0]).map(s => (
                          <button
                            key={s}
                            onClick={() => setActiveSpecs([s])}
                            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-lg flex-shrink-0 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                            title={s}
                          >
                            {SPECIALTY_ICONS[s] || '\uD83C\uDFE5'}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  <p className="text-4xl mb-3">{'\uD83D\uDD0D'}</p>
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

