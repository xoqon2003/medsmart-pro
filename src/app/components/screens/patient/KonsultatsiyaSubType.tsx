import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ChevronRight, Video, Phone, MessageCircle,
  Hospital, Home, Bed, Trees, MapPin, Stethoscope,
  User as UserIcon, Search, Star, Clock, Building2,
} from 'lucide-react';
import { useApp } from '../../../store/appStore';
import { bookingService } from '../../../../services';
import type { GeoRegion } from '../../../../services';
import type { User, ClinicSearchResult } from '../../../types';
import { ClinicSearchBar } from '../../patient/ClinicSearchBar';
import { ClinicAdvancedFilter } from '../../patient/ClinicAdvancedFilter';
import { TopClinicCarousel } from '../../patient/TopClinicCarousel';
import { ClinicCard } from '../../patient/ClinicCard';

/* ── Tibbiy mutaxassisliklar (emoji bilan) ── */
const SPECIALTY_ICONS: Record<string, string> = {
  Kardiolog: '\u2764\uFE0F', Nevrolog: '\uD83E\uDDE0', Ortoped: '\uD83E\uDDB4', Travmatolog: '\uD83E\uDE79',
  Dermatolog: '\uD83E\uDEC0', Oftalmolog: '\uD83D\uDC41\uFE0F', Urolog: '\uD83D\uDD2C', Ginekolog: '\uD83C\uDF38',
  Pediatr: '\uD83D\uDC76', Psixiatr: '\uD83E\uDDEC', Terapevt: '\uD83E\uDE7A', Endokrinolog: '\u2697\uFE0F',
};

/* ── Qidiruv rejimlari ── */
type SearchMode = 'types' | 'specialty' | 'name';

const MODES: { key: SearchMode; icon: React.ReactNode; label: string }[] = [
  { key: 'types',     icon: <MapPin className="w-3.5 h-3.5" />,       label: 'Hudud'       },
  { key: 'specialty', icon: <Stethoscope className="w-3.5 h-3.5" />,  label: 'Mutaxassis'  },
  { key: 'name',      icon: <UserIcon className="w-3.5 h-3.5" />,     label: 'Shifokor'    },
];

/* ── Demo narxlar ── */
const DEMO_PRICES: Record<number, number> = {};
function getPrice(doctorId: number): number {
  if (!DEMO_PRICES[doctorId]) DEMO_PRICES[doctorId] = [120000, 150000, 180000, 200000][doctorId % 4];
  return DEMO_PRICES[doctorId];
}
function formatPrice(n: number) { return n.toLocaleString('uz-UZ') + " so'm"; }
const NEXT_SLOTS = ['Bugun 14:00', 'Bugun 16:00', 'Ertaga 09:00', 'Ertaga 11:00', 'Ertaga 14:00'];
function nextSlot(id: number) { return NEXT_SLOTS[id % NEXT_SLOTS.length]; }

/* ════════════════════════════════════════════ */
export function KonsultatsiyaSubType() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation } = useApp();
  const mode = draftConsultation.mode;

  /* ── Tab rejimi ── */
  const [searchMode, setSearchMode] = useState<SearchMode>('types');

  /* ── Mutaxassis / Shifokor qidiruv holatlari ── */
  const [query, setQuery] = useState('');
  const [activeSpecs, setActiveSpecs] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [geo, setGeo] = useState<GeoRegion[]>([]);

  /* ── Klinika filtr holatlari (Hudud tabida) ── */
  const [clinicSearch, setClinicSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({ region: '', district: '', nearbyEnabled: false, minServices: '0' });
  const [clinicResults, setClinicResults] = useState<ClinicSearchResult[]>([]);
  const [topClinics, setTopClinics] = useState<ClinicSearchResult[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const isOffline = mode === 'offline';

  /* ── Ma'lumotlarni sahifa ochilganda yuklash ── */
  useEffect(() => {
    if (isOffline) {
      bookingService.getGeo().then(setGeo);
      bookingService.getSpecialties().then(setSpecialties);
      bookingService.getTopClinics(10).then(setTopClinics);
      bookingService.searchClinics({}).then(res => setClinicResults(res.data));
    }
  }, [isOffline]);

  /* ── Online bo'lsa faqat mutaxassis yuklash ── */
  useEffect(() => {
    if (!isOffline) {
      bookingService.getSpecialties().then(setSpecialties);
    }
  }, [isOffline]);

  /* ── Klinika qidiruv (debounce 300ms) ── */
  const searchClinics = useCallback((searchQuery: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (filterValues.nearbyEnabled) return;
        const res = await bookingService.searchClinics({
          query: searchQuery.length >= 2 ? searchQuery : undefined,
          region: filterValues.region || undefined,
          district: filterValues.district || undefined,
          minServices: filterValues.minServices !== '0' ? parseInt(filterValues.minServices) : undefined,
        });
        setClinicResults(res.data);
      } catch (e) { console.error(e); }
      finally { setIsSearching(false); }
    }, 300);
  }, [filterValues]);

  useEffect(() => {
    if (isOffline && searchMode === 'types') { searchClinics(clinicSearch); }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [clinicSearch, isOffline, searchMode, searchClinics]);

  /* ── Geolokatsiya ── */
  const handleGeoToggle = useCallback((newValues: typeof filterValues) => {
    setFilterValues(newValues);
    if (newValues.nearbyEnabled) {
      setIsGeoLoading(true); setGeoError(null);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setIsGeoLoading(false);
          try { const nearby = await bookingService.getNearbyClinics(pos.coords.latitude, pos.coords.longitude, 10); setClinicResults(nearby); } catch (e) { console.error(e); }
        },
        () => { setIsGeoLoading(false); setGeoError('Geolokatsiyaga ruxsat bering'); setFilterValues(prev => ({ ...prev, nearbyEnabled: false })); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const applyFilters = useCallback(async () => {
    setIsFilterOpen(false); setIsSearching(true);
    try {
      if (filterValues.nearbyEnabled) return;
      const res = await bookingService.searchClinics({
        query: clinicSearch.length >= 2 ? clinicSearch : undefined,
        region: filterValues.region || undefined, district: filterValues.district || undefined,
        minServices: filterValues.minServices !== '0' ? parseInt(filterValues.minServices) : undefined,
      });
      setClinicResults(res.data);
    } catch (e) { console.error(e); } finally { setIsSearching(false); }
  }, [filterValues, clinicSearch]);

  const resetFilters = useCallback(async () => {
    setFilterValues({ region: '', district: '', nearbyEnabled: false, minServices: '0' });
    setClinicSearch(''); setIsFilterOpen(false);
    try { const res = await bookingService.searchClinics({}); setClinicResults(res.data); } catch (e) { console.error(e); }
  }, []);

  const hasActiveFilters = filterValues.region !== '' || filterValues.district !== '' || filterValues.nearbyEnabled || filterValues.minServices !== '0';

  /* ── Klinika tanlash ── */
  const selectClinic = useCallback((c: ClinicSearchResult) => {
    setSelectedClinic(c);
    updateDraftConsultation({ offlineType: 'clinic', onlineType: undefined, clinic: c.id, clinicName: c.name, clinicAddress: c.address });
  }, [updateDraftConsultation]);

  /* ── Shifokorlarni yuklash (Mutaxassis/Shifokor tablari uchun) ── */
  useEffect(() => {
    if (searchMode === 'specialty') {
      if (activeSpecs.length === 0) { setDoctors([]); return; }
      bookingService.getDoctors({ query: '', specialities: activeSpecs }).then(setDoctors);
    } else if (searchMode === 'name') {
      if (query.length < 2) { setDoctors([]); return; }
      bookingService.getDoctors({ query, specialities: [] }).then(setDoctors);
    }
    // Hudud tabida klinika tanlanganda
    if (searchMode === 'types' && selectedClinic) {
      bookingService.getDoctors({ query: '', specialities: [] }).then(setDoctors);
    }
  }, [searchMode, query, activeSpecs, selectedClinic]);

  /* ── Shifokor tanlash → kalendarga o'tish ── */
  const pickDoctor = (d: User) => {
    updateDraftConsultation({
      offlineType: isOffline ? 'clinic' : undefined,
      onlineType: !isOffline ? (draftConsultation.onlineType || 'video') : undefined,
      query, specialityFilters: activeSpecs,
      region: selectedClinic?.region, district: selectedClinic?.city,
      clinic: selectedClinic?.id, clinicName: selectedClinic?.name,
      clinicAddress: selectedClinic?.address,
      selectedDoctorId: d.id, price: getPrice(d.id),
    });
    navigate('patient_kons_calendar');
  };

  /* ── Qabul turi tanlash (Hudud tabida) ── */
  const pickOnline = (t: 'video' | 'phone' | 'chat') => {
    updateDraftConsultation({ onlineType: t, offlineType: undefined });
    navigate('patient_kons_doctor');
  };

  const pickOffline = (t: 'clinic' | 'home' | 'inpatient' | 'sanatorium') => {
    updateDraftConsultation({ offlineType: t, onlineType: undefined });
    if (t === 'home') navigate('home_visit_address');
    else if (t === 'sanatorium') navigate('patient_kons_sanatorium');
    else navigate('patient_kons_doctor');
  };

  const switchSearchMode = (m: SearchMode) => {
    setSearchMode(m);
    if (m !== 'specialty') setActiveSpecs([]);
    if (m !== 'name') setQuery('');
    if (m === 'types') setDoctors([]);
  };

  if (!mode) { navigate('patient_kons_type'); return null; }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 pt-12 pb-6 px-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center" aria-label="Orqaga">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-emerald-200 text-xs">2-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Qabul kichik turi</h1>
            <p className="text-emerald-200/80 text-xs mt-0.5">
              {isOffline ? 'Oflayn — Tur tanlang yoki shifokor qidiring' : 'Onlayn konsultatsiya'}
            </p>
          </div>
        </div>

        {/* ── Tablar — DOIM ko'rinadi (offline rejimda) ── */}
        {isOffline && (
          <div className="flex gap-2 mt-3">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => switchSearchMode(m.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  searchMode === m.key
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'bg-white/15 text-white/80 hover:bg-white/20'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4 -mt-2 pb-24 space-y-3">
        <AnimatePresence mode="wait">
          {/* ══════════ HUDUD TABI — Turlar + Klinika qidiruv ══════════ */}
          {(searchMode === 'types' || !isOffline) && (
            <motion.div key="types" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-3">

              {/* Onlayn turlar */}
              {mode === 'online' && (
                <>
                  {[
                    { id: 'video' as const, title: "Video qo'ng'iroq", desc: 'Zoom/Teams yoki shifokor platformasi', icon: <Video className="w-5 h-5 text-emerald-700" /> },
                    { id: 'phone' as const, title: "Telefon qo'ng'iroq", desc: 'Faqat ovozli aloqa', icon: <Phone className="w-5 h-5 text-emerald-700" /> },
                    { id: 'chat' as const, title: 'Chat / Yozishma', desc: 'Matn, rasm va fayl yuborish mumkin', icon: <MessageCircle className="w-5 h-5 text-emerald-700" /> },
                  ].map((x) => (
                    <motion.button key={x.id} whileTap={{ scale: 0.99 }} onClick={() => pickOnline(x.id)}
                      className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">{x.icon}</div>
                        <div className="flex-1"><p className="text-gray-900 text-sm font-medium">{x.title}</p><p className="text-gray-500 text-xs mt-1">{x.desc}</p></div>
                        <ChevronRight className="w-5 h-5 text-gray-300 mt-1" />
                      </div>
                    </motion.button>
                  ))}
                </>
              )}

              {/* Oflayn turlar + klinika qidiruv */}
              {isOffline && (
                <>
                  {/* Qabul turlari */}
                  <div className="space-y-2">
                    <p className="text-gray-500 text-xs font-medium px-1">Qabul turini tanlang</p>
                    {[
                      { id: 'clinic' as const, title: 'Klinikaga borish', desc: 'Bemor klinikaga keladi', icon: <Hospital className="w-5 h-5 text-sky-700" /> },
                      { id: 'home' as const, title: 'Uyga chaqirish', desc: "Shifokor uyga boradi", icon: <Home className="w-5 h-5 text-sky-700" /> },
                      { id: 'inpatient' as const, title: 'Statsionar', desc: "Bo'lim/kafedra tanlanadi", icon: <Bed className="w-5 h-5 text-sky-700" /> },
                      { id: 'sanatorium' as const, title: 'Sanatoriya / Reabilitatsiya', desc: 'Muddati (kunlar) tanlanadi', icon: <Trees className="w-5 h-5 text-sky-700" /> },
                    ].map((x) => (
                      <motion.button key={x.id} whileTap={{ scale: 0.99 }} onClick={() => pickOffline(x.id)}
                        className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">{x.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-medium">{x.title}</p>
                            <p className="text-gray-500 text-xs">{x.desc}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Ajratgich */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-xs font-medium">yoki klinika qidiring</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Klinika qidiruv */}
                  <ClinicSearchBar
                    value={clinicSearch} onChange={setClinicSearch}
                    isFilterOpen={isFilterOpen} hasActiveFilters={hasActiveFilters}
                    onToggleFilter={() => setIsFilterOpen(!isFilterOpen)} isLoading={isSearching}
                  />

                  <ClinicAdvancedFilter
                    isOpen={isFilterOpen} values={filterValues}
                    onChange={(vals) => vals.nearbyEnabled !== filterValues.nearbyEnabled ? handleGeoToggle(vals) : setFilterValues(vals)}
                    onApply={applyFilters} onReset={resetFilters}
                    geo={geo} isGeoLoading={isGeoLoading} geoError={geoError}
                  />

                  {/* Tanlangan klinika */}
                  {selectedClinic && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-emerald-800 text-sm font-semibold">{selectedClinic.name}</p>
                            <button onClick={() => setSelectedClinic(null)} className="text-emerald-600 text-xs underline">O'zgartirish</button>
                          </div>
                          <p className="text-emerald-600 text-xs mt-0.5">{selectedClinic.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-0.5 text-xs text-emerald-700"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{selectedClinic.rating.toFixed(1)}</span>
                            <span className="text-emerald-600 text-[11px]">{selectedClinic.servicesCount} xizmat</span>
                            <span className="text-emerald-600 text-[11px]">{selectedClinic.doctorsCount} shifokor</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Shifokorlar — klinika tanlanganda */}
                  {selectedClinic && <DoctorList doctors={doctors} onPick={pickDoctor} />}

                  {/* Top klinikalar */}
                  {!selectedClinic && !clinicSearch && !hasActiveFilters && topClinics.length > 0 && (
                    <TopClinicCarousel clinics={topClinics} onSelect={selectClinic} />
                  )}

                  {/* Klinikalar ro'yxati */}
                  {!selectedClinic && (clinicSearch || hasActiveFilters) && (
                    <div className="space-y-2">
                      {clinicResults.length > 0 && <p className="text-gray-500 text-xs px-1">{clinicResults.length} ta klinika topildi</p>}
                      {clinicResults.map((c, i) => <ClinicCard key={c.id} clinic={c} index={i} onSelect={selectClinic} />)}
                      {clinicResults.length === 0 && !isSearching && (
                        <div className="text-center py-8">
                          <p className="text-3xl mb-2">{'\uD83C\uDFE5'}</p>
                          <p className="text-gray-500 text-sm font-medium">Klinika topilmadi</p>
                          <p className="text-gray-400 text-xs mt-1">Filtrlarni o'zgartiring</p>
                        </div>
                      )}
                      {isSearching && [1,2,3].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                          <div className="flex items-start gap-3"><div className="w-12 h-12 rounded-2xl bg-gray-200" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div></div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ══════════ MUTAXASSIS TABI ══════════ */}
          {searchMode === 'specialty' && isOffline && (
            <motion.div key="spec" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-gray-700 text-sm font-medium mb-1">Mutaxassislikni tanlang</p>
                <p className="text-gray-400 text-xs mb-3">Shifokorni yo'nalishi bo'yicha toping</p>
                <div className="grid grid-cols-3 gap-2">
                  {specialties.map((s) => {
                    const active = activeSpecs.includes(s);
                    const icon = SPECIALTY_ICONS[s] || '\uD83C\uDFE5';
                    return (
                      <button key={s}
                        onClick={() => setActiveSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs transition-all ${active ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50'}`}
                      >
                        <span className="text-lg">{icon}</span>
                        <span className="font-medium leading-tight text-center">{s}</span>
                      </button>
                    );
                  })}
                </div>
                {activeSpecs.length === 0 && <p className="text-gray-400 text-xs mt-3 text-center">Kamida 1 ta mutaxassislikni tanlang</p>}
                {activeSpecs.length > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-emerald-700 text-xs font-medium">{activeSpecs.length} ta tanlangan</p>
                    <button onClick={() => setActiveSpecs([])} className="text-gray-400 text-xs underline">Tozalash</button>
                  </div>
                )}
              </div>
              {activeSpecs.length > 0 && <DoctorList doctors={doctors} onPick={pickDoctor} />}
            </motion.div>
          )}

          {/* ══════════ SHIFOKOR NOMI TABI ══════════ */}
          {searchMode === 'name' && isOffline && (
            <motion.div key="name" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-3">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                <p className="text-gray-500 text-xs px-2 mb-1">Shifokor ismi bo'yicha barcha tizimdan qidiring</p>
                <div className="flex items-center gap-2 px-2">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Shifokor F.I.O. ni kiriting..."
                    className="w-full py-2.5 text-sm outline-none text-gray-800 placeholder:text-gray-400" />
                  {query && <button onClick={() => setQuery('')} className="text-gray-400 text-lg leading-none">×</button>}
                </div>
                {query.length > 0 && query.length < 2 && <p className="text-gray-400 text-xs px-2 pb-1">Kamida 2 ta harf kiriting</p>}
              </div>
              {query.length >= 2 && <DoctorList doctors={doctors} onPick={pickDoctor} />}
              {query.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">{'\uD83D\uDD0D'}</p>
                  <p className="text-gray-500 text-sm">Shifokor ismini kiriting</p>
                  <p className="text-gray-400 text-xs mt-1">Masalan: "Umarov" yoki "Yusupov"</p>
                  <p className="text-gray-400 text-xs mt-0.5">Barcha klinikalardan topiladi</p>
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
function DoctorList({ doctors, onPick }: { doctors: User[]; onPick: (d: User) => void }) {
  if (doctors.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-3">{'\uD83C\uDFE5'}</p>
        <p className="text-gray-500 text-sm font-medium">Shifokor topilmadi</p>
        <p className="text-gray-400 text-xs mt-1">Boshqa filtr yoki hudud tanlang</p>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <p className="text-gray-500 text-xs px-1">{doctors.length} ta shifokor topildi</p>
      {doctors.map((d, i) => (
        <motion.button key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }} onClick={() => onPick(d)}
          className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left active:scale-[0.99] transition-transform">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 text-sm font-bold flex-shrink-0">
              {(d.avatar || d.fullName.slice(0, 2)).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm font-semibold leading-snug">Dr. {d.fullName}</p>
              <p className="text-emerald-700 text-xs mt-0.5 font-medium">{d.specialty || 'Mutaxassis'}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-500"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><span className="font-medium text-gray-700">{d.rating?.toFixed(1) ?? '4.5'}</span></span>
                {d.experience && <span className="text-xs text-gray-500">{d.experience} yil tajriba</span>}
                <span className="text-xs font-semibold text-blue-700">{formatPrice(getPrice(d.id))}</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-700">Bo'sh vaqt: {nextSlot(d.id)}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 mt-1 flex-shrink-0" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
