import type { User, ClinicSearchResult, ClinicFilters } from '../../app/types';
import { mockUsers } from '../../app/data/mockData';

export interface GeoDistrict {
  name: string;
  clinics: string[];
}

export interface GeoRegion {
  region: string;
  districts: GeoDistrict[];
}

export interface DoctorFilter {
  query?: string;
  specialities?: string[];
}

export interface IBookingService {
  getDoctors(filters?: DoctorFilter): Promise<User[]>;
  getSlots(doctorId: number, date: string): Promise<Record<string, 'free' | 'busy'>>;
  getGeo(): Promise<GeoRegion[]>;
  getSpecialties(): Promise<string[]>;
  searchClinics(filters: ClinicFilters): Promise<{ data: ClinicSearchResult[]; total: number }>;
  getNearbyClinics(lat: number, lng: number, radius?: number): Promise<ClinicSearchResult[]>;
  getTopClinics(limit?: number): Promise<ClinicSearchResult[]>;
}

const SPECIALTIES = [
  'Kardiolog',
  'Nevrolog',
  'Ortoped',
  'Travmatolog',
  'Dermatolog',
  'Oftalmolog',
  'Urolog',
  'Ginekolog',
  'Pediatr',
  'Psixiatr',
];

const GEO: GeoRegion[] = [
  {
    region: 'Toshkent',
    districts: [
      { name: "M. Ulug\u02BCbek", clinics: ['Toshkent Diagnostika Markazi', 'MedLine Clinic'] },
      { name: 'Yunusobod', clinics: ['MedLine Clinic', 'Premium Clinic', 'Yunusobod Med'] },
      { name: 'Chilonzor', clinics: ['ProLab', 'MedLine Chilonzor', 'City Med Plus'] },
      { name: 'Sergeli', clinics: ['Sergeli Tibbiyot', 'Hayot Med'] },
      { name: 'Yakkasaroy', clinics: ['Central Hospital', 'Elite Med'] },
      { name: 'Shayxontohur', clinics: ['Shayxontohur klinikasi'] },
    ],
  },
  {
    region: 'Samarqand',
    districts: [
      { name: 'Samarqand shahar', clinics: ['Samarqand Health Lab', 'Samarqand Med Center'] },
      { name: 'Urgut', clinics: ['Urgut tibbiyot markazi'] },
    ],
  },
  {
    region: 'Buxoro',
    districts: [
      { name: 'Buxoro shahar', clinics: ['Buxoro Diagnostika', 'Ibn Sino klinikasi'] },
    ],
  },
  {
    region: 'Farg\'ona',
    districts: [
      { name: 'Farg\'ona shahar', clinics: ['Farg\'ona Med Plus', 'Sog\'lom oila'] },
      { name: 'Marg\'ilon', clinics: ['Marg\'ilon tibbiyot'] },
    ],
  },
  {
    region: 'Andijon',
    districts: [
      { name: 'Andijon shahar', clinics: ['Andijon Med Center', 'Shifobaxsh klinika'] },
    ],
  },
  {
    region: 'Namangan',
    districts: [
      { name: 'Namangan shahar', clinics: ['Namangan Shifoxonasi', 'Sog\'liq Med'] },
    ],
  },
];

/* ── Kengaytirilgan klinika mock data (TT-001) ── */
const MOCK_CLINICS: ClinicSearchResult[] = [
  { id: 'c1', name: 'MedLine Chilonzor', address: 'Chilonzor, 5-kvartal, 12-uy', region: 'Toshkent', city: 'Chilonzor', servicesCount: 24, rating: 4.8, isTop: true, doctorsCount: 15, description: 'Zamonaviy diagnostika va davolash markazi', logoUrl: undefined },
  { id: 'c2', name: 'Premium Clinic', address: 'Yunusobod, Amir Temur 45', region: 'Toshkent', city: 'Yunusobod', servicesCount: 18, rating: 4.7, isTop: true, doctorsCount: 12, description: 'Premium xizmat va yuqori sifatli tibbiyot', logoUrl: undefined },
  { id: 'c3', name: 'City Med Plus', address: 'Chilonzor, Bunyodkor 22', region: 'Toshkent', city: 'Chilonzor', servicesCount: 15, rating: 4.5, isTop: true, doctorsCount: 10, description: 'Oilaviy tibbiyot markazi', logoUrl: undefined },
  { id: 'c4', name: 'Central Hospital', address: 'Yakkasaroy, Shota Rustaveli 15', region: 'Toshkent', city: 'Yakkasaroy', servicesCount: 32, rating: 4.9, isTop: true, doctorsCount: 25, description: 'Katta ko\'p tarmoqli shifoxona', logoUrl: undefined },
  { id: 'c5', name: 'Yunusobod Med', address: 'Yunusobod, Ahmad Donish 7', region: 'Toshkent', city: 'Yunusobod', servicesCount: 12, rating: 4.3, isTop: false, doctorsCount: 8, description: 'Umumiy amaliyot va diagnostika', logoUrl: undefined },
  { id: 'c6', name: 'Toshkent Diagnostika Markazi', address: 'M. Ulug\'bek, Universitet 3', region: 'Toshkent', city: "M. Ulug\u02BCbek", servicesCount: 28, rating: 4.6, isTop: true, doctorsCount: 20, description: 'Keng diagnostika xizmatlari', logoUrl: undefined },
  { id: 'c7', name: 'MedLine Clinic', address: 'Yunusobod, Oybek 33', region: 'Toshkent', city: 'Yunusobod', servicesCount: 20, rating: 4.4, isTop: false, doctorsCount: 11, description: 'Zamonaviy tibbiyot xizmatlari', logoUrl: undefined },
  { id: 'c8', name: 'ProLab', address: 'Chilonzor, Qatortol 8', region: 'Toshkent', city: 'Chilonzor', servicesCount: 8, rating: 4.2, isTop: false, doctorsCount: 5, description: 'Laboratoriya va tahlillar', logoUrl: undefined },
  { id: 'c9', name: 'Elite Med', address: 'Yakkasaroy, Nukus 28', region: 'Toshkent', city: 'Yakkasaroy', servicesCount: 22, rating: 4.7, isTop: false, doctorsCount: 14, description: 'Yuqori sifatli davolash markazi', logoUrl: undefined },
  { id: 'c10', name: 'Sergeli Tibbiyot', address: 'Sergeli, Yangi Sergeli 5', region: 'Toshkent', city: 'Sergeli', servicesCount: 10, rating: 4.1, isTop: false, doctorsCount: 6, description: 'Hudud tibbiyot xizmati', logoUrl: undefined },
  { id: 'c11', name: 'Hayot Med', address: 'Sergeli, Mustaqillik 12', region: 'Toshkent', city: 'Sergeli', servicesCount: 7, rating: 4.0, isTop: false, doctorsCount: 4, description: 'Oilaviy klinika', logoUrl: undefined },
  { id: 'c12', name: 'Samarqand Med Center', address: 'Samarqand shahar, Registon 5', region: 'Samarqand', city: 'Samarqand shahar', servicesCount: 20, rating: 4.5, isTop: true, doctorsCount: 12, description: 'Samarqandning eng yirik klinikasi', logoUrl: undefined },
  { id: 'c13', name: 'Samarqand Health Lab', address: 'Samarqand shahar, Gagarin 10', region: 'Samarqand', city: 'Samarqand shahar', servicesCount: 14, rating: 4.3, isTop: false, doctorsCount: 7, description: 'Sog\'liq diagnostika', logoUrl: undefined },
  { id: 'c14', name: 'Buxoro Diagnostika', address: 'Buxoro shahar, Ibn Sino 18', region: 'Buxoro', city: 'Buxoro shahar', servicesCount: 16, rating: 4.4, isTop: true, doctorsCount: 9, description: 'Buxoro diagnostika markazi', logoUrl: undefined },
  { id: 'c15', name: 'Ibn Sino klinikasi', address: 'Buxoro shahar, Navoiy 3', region: 'Buxoro', city: 'Buxoro shahar', servicesCount: 11, rating: 4.2, isTop: false, doctorsCount: 6, description: 'An\'anaviy va zamonaviy davolash', logoUrl: undefined },
  { id: 'c16', name: 'Farg\'ona Med Plus', address: 'Farg\'ona shahar, Mustaqillik 25', region: "Farg'ona", city: "Farg'ona shahar", servicesCount: 19, rating: 4.5, isTop: true, doctorsCount: 11, description: 'Farg\'ona yetakchi klinikasi', logoUrl: undefined },
  { id: 'c17', name: 'Andijon Med Center', address: 'Andijon shahar, Bobur 14', region: 'Andijon', city: 'Andijon shahar', servicesCount: 17, rating: 4.4, isTop: false, doctorsCount: 10, description: 'Ko\'p tarmoqli tibbiyot markazi', logoUrl: undefined },
  { id: 'c18', name: 'Namangan Shifoxonasi', address: 'Namangan shahar, A. Navoiy 6', region: 'Namangan', city: 'Namangan shahar', servicesCount: 13, rating: 4.3, isTop: false, doctorsCount: 8, description: 'Namangan tibbiyot markazi', logoUrl: undefined },
  { id: 'c19', name: 'Shayxontohur klinikasi', address: 'Shayxontohur, Navoi 55', region: 'Toshkent', city: 'Shayxontohur', servicesCount: 9, rating: 4.1, isTop: false, doctorsCount: 5, description: 'Mahalliy klinika', logoUrl: undefined },
  { id: 'c20', name: 'Urgut tibbiyot markazi', address: 'Urgut, Markaziy 1', region: 'Samarqand', city: 'Urgut', servicesCount: 6, rating: 3.9, isTop: false, doctorsCount: 3, description: 'Tuman tibbiyot markazi', logoUrl: undefined },
];

/* ── Generated doctors (demo) ── */
const EXTRA_DOCTORS: User[] = ([
  [100,'Abdullayev Aziz Komilovich',     'Kardiolog',     'male',  4.95,18,423],
  [101,'Rahimova Nilufar Bakhodirovna',  'Nevrolog',      'female',4.92,20,567],
  [102,'Xolmatov Sardor Rustamovich',    'Ortoped',       'male',  4.88,14,289],
  [103,'Ergasheva Shahlo Anvarovna',     'Dermatolog',    'female',4.85,12,341],
  [104,'Toshmatov Nodir Baxtiyor o\'g\'li','Oftalmolog',  'male',  4.78,10,198],
  [105,'Nazarov Otabek Shuhratovich',    'Urolog',        'male',  4.82,16,256],
  [106,'Sultonova Gulnora Ilhomovna',    'Ginekolog',     'female',4.91,19,478],
  [107,'Mirzayev Bekzod Alisher o\'g\'li','Pediatr',      'male',  4.87,11,312],
  [108,'Hamidova Dildora Karimovna',     'Psixiatr',      'female',4.75, 9,167],
  [109,'Saidov Rustam Davlatovich',      'Terapevt',      'male',  4.80,15,534],
  [110,'Ismoilova Kamola Bahodirovna',   'Endokrinolog',  'female',4.93,17,389],
  [111,'Karimov Farrux Ulug\'bekovich',  'Nevrolog',      'male',  4.70, 8,145],
  [112,'Aliyeva Mohira Toxirovna',       'Kardiolog',     'female',4.65, 6, 98],
  [113,'Davronov Mansur Erkinovich',     'Travmatolog',   'male',  4.83,13,267],
  [114,'Ergashev Dilshod Nosirovich',    'Nevrolog',      'male',  4.90,21,612],
] as [number,string,string,string,number,number,number][]).map(
  ([id,fullName,specialty,gender,rating,experience,totalConclusions]) => ({
    id, fullName, specialty, gender: gender as 'male'|'female', rating, experience, totalConclusions,
    telegramId: 900000000 + id,
    username: `dr_${fullName.split(' ')[0].toLowerCase()}_${id}`,
    role: 'doctor' as const,
    phone: `+99890${String(1000000 + id).slice(-7)}`,
    city: 'Toshkent',
    language: 'uz',
    isActive: true,
    createdAt: '2024-01-15',
    license: `UZ-MED-${2020 + (id % 5)}-${String(id).padStart(4, '0')}`,
    avatar: fullName.split(' ').map(n => n[0]).slice(0, 2).join(''),
  })
);

const SLOT_HOURS = [9, 10, 11, 12, 14, 15, 16, 17];
const ALL_SLOTS: string[] = SLOT_HOURS.flatMap((h) => [
  `${String(h).padStart(2, '0')}:00`,
  `${String(h).padStart(2, '0')}:30`,
]);

function hashToBool(seed: string, mod: number, hit: number): boolean {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod === hit;
}

function normalize(s: string) {
  return (s || '').toLowerCase().trim();
}

export const bookingService: IBookingService = {
  getDoctors: (filters) => {
    const base = [...mockUsers.filter((u) => u.role === 'doctor' || u.role === 'specialist'), ...EXTRA_DOCTORS];
    const q = normalize(filters?.query || '');
    const filtered = base.filter((d) => {
      const spec = d.specialty || '';
      const specOk =
        !filters?.specialities?.length ||
        filters.specialities.some((x) => normalize(spec).includes(normalize(x)));
      const qOk =
        q.length < 3 || normalize(d.fullName).includes(q) || normalize(spec).includes(q);
      return specOk && qOk;
    });
    return Promise.resolve(filtered);
  },

  getSlots: (doctorId, date) => {
    const map: Record<string, 'free' | 'busy'> = {};
    for (const s of ALL_SLOTS) {
      const seed = `${doctorId}-${date}-${s}`;
      map[s] = hashToBool(seed, 7, 0) ? 'busy' : 'free';
    }
    return Promise.resolve(map);
  },

  getGeo: () => Promise.resolve(GEO),
  getSpecialties: () => Promise.resolve([...SPECIALTIES]),

  /* ── TT-001: Klinika qidiruv metodlari ── */

  searchClinics: (filters: ClinicFilters) => {
    let results = [...MOCK_CLINICS];

    // Qidiruv (name va address bo'yicha)
    if (filters.query && filters.query.length >= 2) {
      const q = normalize(filters.query);
      results = results.filter(c =>
        normalize(c.name).includes(q) || normalize(c.address).includes(q)
      );
    }

    // Viloyat filtr
    if (filters.region) {
      results = results.filter(c => c.region === filters.region);
    }

    // Tuman filtr
    if (filters.district) {
      results = results.filter(c => c.city === filters.district);
    }

    // Xizmatlar soni bo'yicha
    if (filters.minServices) {
      results = results.filter(c => c.servicesCount >= (filters.minServices || 0));
    }

    // Reyting bo'yicha tartiblash
    results.sort((a, b) => b.rating - a.rating);

    return Promise.resolve({ data: results, total: results.length });
  },

  getNearbyClinics: (lat: number, lng: number, radius: number = 10) => {
    // Mock: Toshkent klinikalarini "yaqin" deb qaytaramiz, distance qo'shamiz
    const tashkentClinics = MOCK_CLINICS
      .filter(c => c.region === 'Toshkent')
      .map((c, i) => ({
        ...c,
        distance: parseFloat((0.5 + i * 1.2).toFixed(1)),
      }))
      .filter(c => c.distance <= radius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return Promise.resolve(tashkentClinics);
  },

  getTopClinics: (limit: number = 10) => {
    const topClinics = MOCK_CLINICS
      .filter(c => c.isTop)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);

    return Promise.resolve(topClinics);
  },
};
