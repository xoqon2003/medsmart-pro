import type { User } from '../../app/types';
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
      { name: 'Yunusobod', clinics: ['MedLine Clinic'] },
      { name: 'Chilonzor', clinics: ['ProLab'] },
    ],
  },
  {
    region: 'Samarqand',
    districts: [{ name: 'Markaz', clinics: ['Samarqand Health Lab'] }],
  },
];

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
    const base = mockUsers.filter((u) => u.role === 'doctor' || u.role === 'specialist');
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
};
