import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, MapPin, Navigation, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../store/appStore';

const REGIONS: Record<string, string[]> = {
  "Toshkent shahri": ["Bektemir", "Chilonzor", "Olmazor", "Mirobod", "Mirzo Ulug'bek", "Sergeli", "Shayxontohur", "Uchtepa", "Yakkasaroy", "Yunusobod", "Yashnobod"],
  "Toshkent viloyati": ["Angren sh.", "Bekobod sh.", "Bo'ka", "Bo'stonliq", "Chinoz", "Chirchiq sh.", "Qibray", "Ohangaron", "Oqqo'rg'on", "Parkent", "Piskent", "Toshkent tumani", "O'rtachirchiq", "Yuqorichirchiq", "Zangiota"],
  "Andijon viloyati": ["Andijon sh.", "Asaka", "Baliqchi", "Bo'z", "Buloqboshi", "Izboskan", "Jalolquduq", "Qo'rg'ontepa", "Marhamat", "Oltinko'l", "Paxtaobod", "Shahrixon", "Ulug'nor", "Xo'jaobod"],
  "Farg'ona viloyati": ["Farg'ona sh.", "Qo'qon sh.", "Marg'ilon sh.", "Oltiariq", "Bag'dod", "Beshariq", "Buvayda", "Dang'ara", "Furqat", "Qo'shtepa", "Quva", "Rishton", "So'x", "Toshloq", "Uchko'prik", "Yozyovon"],
  "Namangan viloyati": ["Namangan sh.", "Chortoq", "Chust", "Kosonsoy", "Mingbuloq", "Norin", "Pop", "To'raqo'rg'on", "Uychi", "Yangiqo'rg'on"],
  "Samarqand viloyati": ["Samarqand sh.", "Bulung'ur", "Ishtixon", "Jomboy", "Kattaqo'rg'on sh.", "Narpay", "Nurobod", "Oqdaryo", "Pastdarg'om", "Paxtachi", "Payariq", "Qo'shrabot", "Toyloq", "Urgut"],
  "Buxoro viloyati": ["Buxoro sh.", "G'ijduvon", "Jondor", "Kogon sh.", "Qorovulbozor", "Peshku", "Romitan", "Shofirkon", "Vobkent"],
  "Navoiy viloyati": ["Navoiy sh.", "Karmana", "Konimex", "Navbahor", "Nurota", "Qiziltepa", "Tomdi", "Uchquduq", "Xatirchi"],
  "Qashqadaryo viloyati": ["Qarshi sh.", "Chiroqchi", "Dehqonobod", "G'uzor", "Kasbi", "Kitob", "Koson", "Mirishkor", "Muborak", "Nishon", "Qamashi", "Shahrisabz sh.", "Yakkabog'"],
  "Surxondaryo viloyati": ["Termiz sh.", "Angor", "Bandixon", "Boysun", "Denov sh.", "Jarqo'rg'on", "Muzrabot", "Oltinsoy", "Qiziriq", "Qumqo'rg'on", "Sariosiyo", "Sherobod", "Sho'rchi", "Uzun"],
  "Jizzax viloyati": ["Jizzax sh.", "Arnasoy", "Baxmal", "Do'stlik sh.", "Forish", "G'allaorol", "Mirzacho'l", "Paxtakor", "Sharof Rashidov", "Yangiobod", "Zarbdor", "Zafarobod", "Zomin"],
  "Sirdaryo viloyati": ["Guliston sh.", "Boyovut", "Mirzaobod", "Oqoltin", "Sardoba", "Sayxunobod", "Sirdaryo sh.", "Xovos", "Yangiyer sh."],
  "Xorazm viloyati": ["Urganch sh.", "Bog'ot", "Gurlan", "Xiva sh.", "Xonqa", "Qo'shko'pir", "Shovot", "Tuproqqal'a", "Yangiariq", "Yangibozor"],
  "Qoraqalpog'iston": ["Nukus sh.", "Amudaryo", "Beruniy", "Chimboy", "Ellikkala", "Kegeyli", "Mo'ynoq", "Nukus tumani", "Qanliko'l", "Qo'ng'irot", "Qorao'zak", "Shumanay", "Taxtako'pir", "To'rtko'l", "Xo'jayli"],
};

function SelectField({ label, value, options, placeholder, onChange, error }: {
  label: string; value: string; options: string[]; placeholder: string;
  onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label className="text-gray-700 text-xs font-medium mb-1.5 block">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-gray-50 border rounded-xl px-3 py-3 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${error ? 'border-red-300 bg-red-50' : value ? 'border-orange-200 bg-white' : 'border-gray-200'}`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

function TextField({ label, value, placeholder, onChange, error, optional, hint }: {
  label: string; value: string; placeholder: string;
  onChange: (v: string) => void; error?: string; optional?: boolean; hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-gray-700 text-xs font-medium">{label}</label>
        {optional && <span className="text-gray-400 text-xs">ixtiyoriy</span>}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${error ? 'border-red-300 bg-red-50' : value ? 'border-orange-200 bg-white' : 'border-gray-200'}`}
      />
      {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

export function UygaChaqirishManzil() {
  const { goBack, navigate, draftConsultation, updateDraftConsultation } = useApp();

  const [region, setRegion] = useState(draftConsultation.hvRegion || '');
  const [district, setDistrict] = useState(draftConsultation.hvDistrict || '');
  const [street, setStreet] = useState(draftConsultation.hvStreet || '');
  const [houseNum, setHouseNum] = useState(draftConsultation.hvHouseNum || '');
  const [apartment, setApartment] = useState(draftConsultation.hvApartment || '');
  const [landmark, setLandmark] = useState(draftConsultation.hvLandmark || '');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [submitted, setSubmitted] = useState(false);

  const districts = region ? REGIONS[region] || [] : [];

  const errors = submitted ? {
    region: !region ? "Viloyatni tanlang" : '',
    district: !district ? "Tumanni tanlang" : '',
    street: !street.trim() ? "Ko'cha nomini kiriting" : '',
    houseNum: !houseNum.trim() ? "Uy raqamini kiriting" : '',
  } : { region: '', district: '', street: '', houseNum: '' };

  const isValid = region && district && street.trim() && houseNum.trim();

  const handleGeo = () => {
    setGeoStatus('loading');
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateDraftConsultation({ hvLat: pos.coords.latitude, hvLng: pos.coords.longitude });
        setGeoStatus('done');
      },
      () => setGeoStatus('error'),
      { timeout: 8000 }
    );
  };

  const handleNext = () => {
    setSubmitted(true);
    if (!isValid) return;
    updateDraftConsultation({ hvRegion: region, hvDistrict: district, hvStreet: street, hvHouseNum: houseNum, hvApartment: apartment, hvLandmark: landmark });
    navigate('home_visit_contact');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 pt-12 pb-8 px-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <p className="text-orange-100 text-xs">1-qadam / 5</p>
            <h1 className="text-white text-lg font-bold">Manzil ma'lumotlari</h1>
            <p className="text-orange-100/80 text-xs mt-0.5">Shifokor keladigan manzil</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-1 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 py-5 -mt-4 pb-28 space-y-3">
        {/* Viloyat + Tuman */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-gray-800 text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" /> Joylashuv
          </h3>
          <SelectField
            label="Viloyat *"
            value={region}
            options={Object.keys(REGIONS)}
            placeholder="Viloyatni tanlang..."
            onChange={(v) => { setRegion(v); setDistrict(''); }}
            error={errors.region}
          />
          <SelectField
            label="Tuman / Shahar *"
            value={district}
            options={districts}
            placeholder={region ? "Tumanni tanlang..." : "Avval viloyatni tanlang"}
            onChange={setDistrict}
            error={errors.district}
          />
        </div>

        {/* Manzil tafsilotlari */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="text-gray-800 text-sm font-semibold">Aniq manzil</h3>
          <TextField
            label="Ko'cha nomi *"
            value={street}
            placeholder="Masalan: Navruz ko'chasi"
            onChange={setStreet}
            error={errors.street}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Uy raqami *"
              value={houseNum}
              placeholder="12, 12A, 12/3"
              onChange={setHouseNum}
              error={errors.houseNum}
            />
            <TextField
              label="Kvartira"
              value={apartment}
              placeholder="45"
              onChange={setApartment}
              optional
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-700 text-xs font-medium">Qo'shimcha mo'ljal</label>
              <span className="text-gray-400 text-xs">ixtiyoriy</span>
            </div>
            <textarea
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder={"Masalan: Sariq darvoza, 2-qavat, chap eshik"}
              maxLength={200}
              rows={2}
              className={`w-full bg-gray-50 border rounded-xl px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all ${landmark ? 'border-orange-200 bg-white' : 'border-gray-200'}`}
            />
            <p className="text-gray-400 text-xs mt-1 text-right">{landmark.length}/200</p>
          </div>
        </div>

        {/* Geolokatsiya */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-gray-800 text-sm font-semibold mb-3">Joylashuvni aniqlash</h3>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGeo}
            disabled={geoStatus === 'loading'}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-all ${
              geoStatus === 'done' ? 'border-green-400 bg-green-50' :
              geoStatus === 'error' ? 'border-red-300 bg-red-50' :
              'border-orange-300 bg-orange-50 hover:bg-orange-100'
            }`}
          >
            {geoStatus === 'loading' ? (
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : geoStatus === 'done' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Navigation className="w-5 h-5 text-orange-500" />
            )}
            <div className="text-left">
              <p className={`text-sm font-medium ${geoStatus === 'done' ? 'text-green-700' : geoStatus === 'error' ? 'text-red-600' : 'text-orange-700'}`}>
                {geoStatus === 'done' ? 'Joylashuv aniqlandi!' :
                 geoStatus === 'error' ? 'Aniqlab bo\'lmadi' :
                 geoStatus === 'loading' ? 'Aniqlanmoqda...' :
                 'Joylashuvimni avtomatik aniqlash'}
              </p>
              <p className="text-gray-500 text-xs">
                {geoStatus === 'done'
                  ? `${draftConsultation.hvLat?.toFixed(4)}, ${draftConsultation.hvLng?.toFixed(4)}`
                  : geoStatus === 'error' ? "GPS ruxsat berilmagan bo'lishi mumkin"
                  : 'GPS orqali aniq koordinatalar (ixtiyoriy)'}
              </p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-6 pt-3 bg-gray-50/90 backdrop-blur-sm border-t border-gray-100">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-lg ${
            isValid ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-200' : 'bg-gray-200 text-gray-400'
          }`}
        >
          <span>Keyingi qadam</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
