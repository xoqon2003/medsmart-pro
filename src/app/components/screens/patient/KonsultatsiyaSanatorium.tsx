import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ChevronRight, Search, MapPin, Mountain,
  Heart, Check, Star, X,
} from 'lucide-react';
import { useApp } from '../../../store/appStore';

/* ── Tiplar ── */
interface SanatoriumRoom {
  type: 'single' | 'double' | 'family';
  label: string;
  capacity: number;
  pricePerDay: number;
  childPricePerDay: number;
  description: string;
  isHouse?: boolean;
}

interface Sanatorium {
  id: number;
  name: string;
  region: string;
  district: string;
  relief: 'mountain' | 'water' | 'plain' | 'sea';
  rating: number;
  totalRooms: number;
  conditions: string[];
  services: string[];
  recommendations: string[];
  treatments: string[];
  rooms: SanatoriumRoom[];
  description: string;
  highlight: string;
}

function fmt(n: number) {
  return n.toLocaleString('uz-UZ') + " so'm";
}

/* ── Mock ma'lumotlar ── */
const SANATORIUMS: Sanatorium[] = [
  {
    id: 1,
    name: "Chimyon Sog'lomlashtirish Markazi",
    region: 'Toshkent viloyati',
    district: 'Bostanliq tumani',
    relief: 'mountain',
    rating: 4.7,
    totalRooms: 48,
    highlight: "1500 m balandlikdagi toza tog' havosi",
    description: "Toshkentdan 90 km masofada, Chimyon tog' etaklarida. Sof havo, toza suv va noyob o'simliklar dunyosi.",
    conditions: ['Asab tizimi', "Nafas yo'llari", 'Yurak-qon tomir', 'Ovqat hazm'],
    services: ['Fizioterapiya', 'Massaj', 'Tuz xona', 'Davolovchi vannalar', 'LFK zali', 'Psixolog', "Shifokor maslahati", 'Wi-Fi', 'Ovqatlanish (3 mahal)'],
    recommendations: ['Insultdan keyin \u{1F9E0}', 'Operatsiyadan keyin \u{1F3E5}', "Nafas kasalliklari \u{1FAC1}", 'Asab charchashi \u{1F613}', 'Bolalar reabilitatsiyasi \u{1F476}'],
    treatments: ['Fizioterapiya', 'LFK (davolovchi mashqlar)', 'Massaj (klassik, point)', 'Haloterapiya (tuz xona)', 'Magnetoterapiya', 'Psixologik yordam'],
    rooms: [
      { type: 'single', label: '1-kishilik xona', capacity: 1, pricePerDay: 280000, childPricePerDay: 180000, description: "Alohida hammom, balkon, tog' manzarasi", isHouse: false },
      { type: 'double', label: '2-kishilik xona', capacity: 2, pricePerDay: 220000, childPricePerDay: 140000, description: 'Keng xona, ikkita yotoq, umumiy hammom', isHouse: false },
      { type: 'family', label: 'Oilaviy kotedj', capacity: 4, pricePerDay: 450000, childPricePerDay: 250000, description: '2 xona, oshxona, hovli', isHouse: true },
    ],
  },
  {
    id: 2,
    name: 'Oq Suv Balneologik Markazi',
    region: 'Toshkent viloyati',
    district: 'Ohangaron tumani',
    relief: 'water',
    rating: 4.5,
    totalRooms: 62,
    highlight: 'Shifobaxsh mineral suvlar va loy muolajalar',
    description: "Tabiiy mineral buloqlar asosida qurilgan. Mineral suvlar ichish va muolajalar uchun Markaziy Osiyoda mashhur.",
    conditions: ['Yurak-qon tomir', 'Ovqat hazm', "Buyrak va siydik yo'llari", 'Tayanch-harakat tizimi', 'Teri kasalliklari'],
    services: ['Mineral suv muolajasi', 'Loy terapiyasi', 'Gidromasaj', 'Sauna', 'Basseyn', "Shifokor ko'rigi", 'Dietolog', 'Fitnes', 'Ovqatlanish (3 mahal)'],
    recommendations: ["Artrit va bo'g'im kasalliklari \u{1F9B5}", 'Ovqat hazm muammolari \u{1F37D}', 'Buyrak kasalliklari \u{1F48A}', 'Teri muammolari \u{1FA7A}', 'Operatsiyadan keyin \u{1F3E5}'],
    treatments: ['Balneoterapiya (mineral vannalar)', 'Peloidterapiya (loy)', 'Gidromasaj', 'Ichimlik mineral suv kursi', 'Ultratovush terapiya', 'Elektroforez'],
    rooms: [
      { type: 'single', label: '1-kishilik standart', capacity: 1, pricePerDay: 240000, childPricePerDay: 150000, description: 'Alohida hammom, konditsioner, TV', isHouse: false },
      { type: 'double', label: '2-kishilik standart', capacity: 2, pricePerDay: 200000, childPricePerDay: 130000, description: 'Ikki yotoq, umumiy hammom', isHouse: false },
      { type: 'family', label: 'Oilaviy (alohida uy)', capacity: 5, pricePerDay: 520000, childPricePerDay: 280000, description: '2 xonali uy, shaxsiy hovli va BBQ', isHouse: true },
    ],
  },
  {
    id: 3,
    name: 'Zarafshon Reabilitatsiya Markazi',
    region: 'Samarqand viloyati',
    district: 'Urgut tumani',
    relief: 'plain',
    rating: 4.6,
    totalRooms: 80,
    highlight: 'Zarafshon vodiysi \u2014 tabiiy shifobaxsh iqlim',
    description: "Samarqand atrofidagi yashil vodiyda joylashgan zamonaviy reabilitatsiya markazi. Qulay ob-havo.",
    conditions: ['Asab tizimi', 'Yurak-qon tomir', 'Tayanch-harakat tizimi', 'Bolalar reabilitatsiyasi'],
    services: ['Logoped', 'Neyropsixolog', 'Fizioterapiya', 'Basseyn', 'LFK zali', 'Nutq tiklash', 'Wi-Fi', 'Ovqatlanish (3 mahal)'],
    recommendations: ['Insultdan keyin \u{1F9E0}', 'Nogironlik holatlarida \u267F', "Bolalar rivojlanish muammolari \u{1F476}", 'Travma (sinish, jarohat) \u{1F9B4}', 'Miya falaji \u{1F3E5}'],
    treatments: ['Nutq tiklash (logopediya)', 'LFK', 'Neyrostimulyatsiya', 'Ergoterapiya', 'Psixologik yordam', 'Massaj (reabilitatsion)', 'Gidroterapiya'],
    rooms: [
      { type: 'single', label: '1-kishilik (moslashgan)', capacity: 1, pricePerDay: 260000, childPricePerDay: 170000, description: 'Nogironlik aravachasi uchun moslashtirilgan', isHouse: false },
      { type: 'double', label: '2-kishilik', capacity: 2, pricePerDay: 210000, childPricePerDay: 140000, description: 'Keng eshik, qo\'llab-quvvatlash dastagi', isHouse: false },
      { type: 'family', label: 'Oilaviy kotedj', capacity: 4, pricePerDay: 480000, childPricePerDay: 260000, description: "Alohida uy, bog' va barbekyu", isHouse: true },
    ],
  },
  {
    id: 4,
    name: 'Nurota Tog\u02bc Sanatoriyasi',
    region: 'Navoiy viloyati',
    district: 'Nurota tumani',
    relief: 'mountain',
    rating: 4.4,
    totalRooms: 35,
    highlight: 'Qadimiy Nurota buloqlari va ekologik tur',
    description: "Nurotaning muqaddas buloqlari yonida, 900 m balandlikda. Tabiiy tozalik va dam olish uchun ideal joy.",
    conditions: ["Nafas yo'llari", 'Asab charchashi', 'Yurak-qon tomir', "Umumiy sog'lomlashtirish"],
    services: ['Aromaterapiya', 'Tuz xona', 'Fitoterapiya', 'Meditatsiya xonasi', 'Terapevtik massaj', 'Shifokor', 'Ovqatlanish (3 mahal)'],
    recommendations: ['Stress va burnout \u{1F630}', "Nafas kasalliklari \u{1FAC1}", 'Bosim muammolari \u{1F48A}', "Organizmni tozalash \u{1F33F}"],
    treatments: ['Fitoterapiya', 'Aromaterapiya', 'Haloterapiya', 'Meditatsiya va relaksatsiya', 'Terapevtik massaj', 'Harakatli mashqlar'],
    rooms: [
      { type: 'single', label: '1-kishilik bungalo', capacity: 1, pricePerDay: 200000, childPricePerDay: 120000, description: "Alohida bungalo, tog' manzarasi", isHouse: true },
      { type: 'double', label: '2-kishilik xona', capacity: 2, pricePerDay: 170000, childPricePerDay: 100000, description: 'Ikki yotoq, umumiy hammom', isHouse: false },
      { type: 'family', label: 'Oilaviy uy', capacity: 6, pricePerDay: 400000, childPricePerDay: 220000, description: "Katta uy, 3 xona, oshxona, bog'", isHouse: true },
    ],
  },
];

const REGIONS = ['Barchasi', 'Toshkent viloyati', 'Samarqand viloyati', 'Navoiy viloyati', "Farg'ona viloyati"];
const DURATIONS = [7, 10, 14, 21, 28];

const RELIEF_OPTIONS = [
  { id: 'mountain' as const, label: "Tog'li",      icon: '\u{1F3D4}' },
  { id: 'water'    as const, label: 'Suv bo\'yida', icon: '\u{1F4A7}' },
  { id: 'plain'    as const, label: 'Tekislik',    icon: '\u{1F33E}' },
  { id: 'sea'      as const, label: 'Dengiz',      icon: '\u{1F30A}' },
];

const CONDITION_FILTERS = [
  'Asab tizimi', 'Yurak-qon tomir', "Nafas yo'llari",
  'Ovqat hazm', 'Tayanch-harakat tizimi', 'Bolalar reabilitatsiyasi',
];

function ReliefBadge({ relief }: { relief: Sanatorium['relief'] }) {
  const map: Record<string, string> = {
    mountain: "Tog'li",
    water: "Suv bo'yida",
    plain: 'Tekislik',
    sea: 'Dengiz',
  };
  const icons: Record<string, string> = { mountain: '\u{1F3D4}', water: '\u{1F4A7}', plain: '\u{1F33E}', sea: '\u{1F30A}' };
  const color: Record<string, string> = {
    mountain: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    water:    'bg-blue-50 text-blue-700 border-blue-200',
    plain:    'bg-lime-50 text-lime-700 border-lime-200',
    sea:      'bg-cyan-50 text-cyan-700 border-cyan-200',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${color[relief]}`}>
      {icons[relief]} {map[relief]}
    </span>
  );
}

export function KonsultatsiyaSanatorium() {
  const { goBack, navigate, updateDraftConsultation } = useApp();

  const [searchQ, setSearchQ]           = useState('');
  const [regionFilter, setRegionFilter] = useState('Barchasi');
  const [reliefFilter, setReliefFilter] = useState<Sanatorium['relief'] | null>(null);
  const [condFilter, setCondFilter]     = useState<string | null>(null);
  const [expandedId, setExpandedId]     = useState<number | null>(null);

  const [selectedSanatorium, setSelected] = useState<Sanatorium | null>(null);
  const [roomType, setRoomType]           = useState<SanatoriumRoom['type']>('single');
  const [duration, setDuration]           = useState<number>(7);
  const [isChild, setIsChild]             = useState(false);

  const filtered = useMemo(() => {
    return SANATORIUMS.filter((s) => {
      if (searchQ && !s.name.toLowerCase().includes(searchQ.toLowerCase()) &&
          !s.region.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (regionFilter !== 'Barchasi' && s.region !== regionFilter) return false;
      if (reliefFilter && s.relief !== reliefFilter) return false;
      if (condFilter && !s.conditions.includes(condFilter)) return false;
      return true;
    });
  }, [searchQ, regionFilter, reliefFilter, condFilter]);

  const selectedRoom = selectedSanatorium?.rooms.find((r) => r.type === roomType);
  const pricePerDay  = isChild ? (selectedRoom?.childPricePerDay || 0) : (selectedRoom?.pricePerDay || 0);
  const totalPrice   = pricePerDay * duration;

  const handleContinue = () => {
    if (!selectedSanatorium || !selectedRoom) return;
    updateDraftConsultation({
      sanatoriumId:         selectedSanatorium.id,
      sanatoriumName:       selectedSanatorium.name,
      sanatoriumRelief:     selectedSanatorium.relief,
      sanatoriumRegion:     selectedSanatorium.region,
      sanatoriumDistrict:   selectedSanatorium.district,
      sanatoriumConditions: selectedSanatorium.conditions,
      sanatoriumServices:   selectedSanatorium.services,
      sanatoriumRoomType:   roomType,
      sanatoriumDuration:   duration,
      sanatoriumPricePerDay: pricePerDay,
      sanatoriumChildPrice:  isChild,
      price:       totalPrice,
      clinicName:  selectedSanatorium.name,
      clinicAddress: `${selectedSanatorium.region}, ${selectedSanatorium.district}`,
    });
    setSelected(null);
    navigate('patient_kons_confirm');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-800 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-emerald-200 text-xs">3-bosqich</p>
            <h1 className="text-white text-lg font-semibold">Sanatoriya tanlash</h1>
            <p className="text-emerald-200/70 text-xs mt-0.5">Reabilitatsiya va sog'lomlashtirish</p>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">{'\u{1F33F}'}</div>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-10 space-y-3">

        {/* Qidiruv */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Sanatoriya nomi yoki hudud..."
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          {searchQ && (
            <button onClick={() => setSearchQ('')}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filtrlar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          {/* Viloyat */}
          <div>
            <p className="text-gray-500 text-xs font-medium mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Viloyat
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegionFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    regionFilter === r
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Relyef */}
          <div>
            <p className="text-gray-500 text-xs font-medium mb-2 flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5" /> Relyef turi
            </p>
            <div className="flex gap-2">
              {RELIEF_OPTIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setReliefFilter(reliefFilter === r.id ? null : r.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all flex flex-col items-center gap-0.5 ${
                    reliefFilter === r.id
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-base">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kasallik yo'nalishi */}
          <div>
            <p className="text-gray-500 text-xs font-medium mb-2 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Kasallik yo'nalishi
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CONDITION_FILTERS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCondFilter(condFilter === c ? null : c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    condFilter === c
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Natija soni */}
        <p className="text-gray-500 text-xs px-1">{filtered.length} ta sanatoriya topildi</p>

        {/* Kartochkalar */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-3xl mb-2">{'\u{1F33F}'}</p>
            <p className="text-gray-500 text-sm">Filtrga mos sanatoriya topilmadi</p>
            <button
              onClick={() => { setReliefFilter(null); setCondFilter(null); setRegionFilter('Barchasi'); setSearchQ(''); }}
              className="mt-3 text-teal-600 text-sm underline"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : filtered.map((san) => {
          const isExpanded = expandedId === san.id;
          const cheapest   = san.rooms.reduce((a, b) => a.pricePerDay < b.pricePerDay ? a : b);
          return (
            <motion.div key={san.id} layout className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Karta */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="text-gray-900 text-sm font-semibold leading-tight">{san.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-500 text-xs">{san.district}, {san.region}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-100">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-amber-700 text-xs font-semibold">{san.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <ReliefBadge relief={san.relief} />
                  <span className="text-gray-500 text-xs">{san.highlight}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {san.conditions.slice(0, 3).map((c) => (
                    <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{c}</span>
                  ))}
                  {san.conditions.length > 3 && (
                    <span className="text-xs text-gray-400">+{san.conditions.length - 3} ta</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-xs">dan </span>
                    <span className="text-teal-700 text-sm font-bold">{fmt(cheapest.pricePerDay)}</span>
                    <span className="text-gray-400 text-xs">/kun</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : san.id)}
                      className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600"
                    >
                      {isExpanded ? 'Yopish' : 'Batafsil'}
                    </button>
                    <button
                      onClick={() => { setSelected(san); setRoomType('single'); setDuration(7); setIsChild(false); }}
                      className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-medium flex items-center gap-1"
                    >
                      Tanlash <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Kengaytirilgan tafsilot */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <div className="p-4 space-y-4">
                      <p className="text-gray-600 text-xs leading-relaxed">{san.description}</p>

                      <div>
                        <p className="text-gray-700 text-xs font-semibold mb-2">✨ Xizmatlar</p>
                        <div className="flex flex-wrap gap-1.5">
                          {san.services.map((s) => (
                            <span key={s} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-700 text-xs font-semibold mb-2">{'\u{1F465}'} Kimlarga tavsiya etiladi</p>
                        <div className="space-y-1">
                          {san.recommendations.map((r) => (
                            <div key={r} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-teal-500 flex-shrink-0" />
                              <span className="text-gray-600 text-xs">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-700 text-xs font-semibold mb-2">{'\u{1F48A}'} Davolash usullari</p>
                        <div className="flex flex-wrap gap-1.5">
                          {san.treatments.map((t) => (
                            <span key={t} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg border border-purple-100">{t}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-700 text-xs font-semibold mb-2">{'\u{1F6CF}'} Xona turlari</p>
                        <div className="space-y-2">
                          {san.rooms.map((room) => (
                            <div key={room.type} className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-gray-800 text-xs font-medium">{room.label}</span>
                                  {room.isHouse && (
                                    <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full border border-orange-100">Alohida uy</span>
                                  )}
                                </div>
                                <p className="text-gray-500 text-xs mt-0.5">{room.description}</p>
                                <p className="text-gray-400 text-xs mt-0.5">Bolalar: {fmt(room.childPricePerDay)}/kun</p>
                              </div>
                              <div className="text-right">
                                <p className="text-teal-700 text-sm font-bold">{fmt(room.pricePerDay)}</p>
                                <p className="text-gray-400 text-xs">/kun</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => { setSelected(san); setRoomType('single'); setDuration(7); setIsChild(false); }}
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl py-3.5 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        Bu sanatoriyani tanlash <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Bottom Sheet: Xona + muddat tanlash ─── */}
      <AnimatePresence>
        {selectedSanatorium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              className="bg-white w-full max-w-md rounded-t-3xl overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              <div className="px-5 pb-10 space-y-5">
                {/* Sanatoriya nomi */}
                <div>
                  <h3 className="text-gray-900 text-base font-semibold">{selectedSanatorium.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <ReliefBadge relief={selectedSanatorium.relief} />
                    <span className="text-gray-500 text-xs">{selectedSanatorium.region}</span>
                  </div>
                </div>

                {/* Xona turi */}
                <div>
                  <p className="text-gray-700 text-sm font-medium mb-2">{'\u{1F6CF}'} Xona turi</p>
                  <div className="space-y-2">
                    {selectedSanatorium.rooms.map((room) => (
                      <button
                        key={room.type}
                        onClick={() => setRoomType(room.type)}
                        className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                          roomType === room.type ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                          roomType === room.type ? 'bg-teal-100' : 'bg-white border border-gray-200'
                        }`}>
                          {room.type === 'single' ? '\u{1F6CF}' : room.type === 'double' ? '\u{1F6CF}\u{1F6CF}' : '\u{1F3E1}'}
                        </div>
                        <div className="flex-1 text-left">
                          <p className={`text-sm font-medium ${roomType === room.type ? 'text-teal-800' : 'text-gray-800'}`}>
                            {room.label}
                            {room.isHouse && (
                              <span className="ml-1.5 text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100">Alohida uy</span>
                            )}
                          </p>
                          <p className="text-gray-500 text-xs">{room.description}</p>
                          <p className="text-gray-400 text-xs">Bolalar: {fmt(room.childPricePerDay)}/kun</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${roomType === room.type ? 'text-teal-700' : 'text-gray-700'}`}>
                            {fmt(isChild ? room.childPricePerDay : room.pricePerDay)}
                          </p>
                          <p className="text-gray-400 text-xs">/kun</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bola toggle */}
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{'\u{1F476}'}</span>
                    <div>
                      <p className="text-gray-700 text-sm font-medium">Bola uchun</p>
                      <p className="text-gray-500 text-xs">18 yoshgacha chegirma narxi</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChild(!isChild)}
                    className={`w-12 h-6 rounded-full transition-all relative ${isChild ? 'bg-teal-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isChild ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Muddat */}
                <div>
                  <p className="text-gray-700 text-sm font-medium mb-2">{'\u{1F4C5}'} Muddati (kunlar)</p>
                  <div className="flex gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          duration === d ? 'bg-teal-600 border-teal-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs mt-1 text-center">{duration} kun</p>
                </div>

                {/* Jami */}
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Kunlik narx</span>
                    <span>{fmt(pricePerDay)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Muddat</span>
                    <span>{duration} kun</span>
                  </div>
                  <div className="border-t border-teal-200 mt-2 pt-2 flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Jami to'lov</span>
                    <span className="text-teal-700 text-lg font-bold">{fmt(totalPrice)}</span>
                  </div>
                  <p className="text-teal-600 text-xs mt-1 text-center">
                    3 mahal ovqat va barcha muolajalar narxga kiritilgan
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.99 }}
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
                >
                  <span className="font-medium">Davom etish</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
