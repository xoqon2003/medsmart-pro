import type {
  DiseaseListItem,
  DiseaseDetail,
  DiseaseListResponse,
  DiseaseSearchParams,
  DiseaseBlock,
} from '../types/api/disease';
import type { DiseaseSymptomWithWeight } from '../types/api/symptom';

/**
 * MOCK ma'lumotlar — backend ishlamayotganda yoki demo uchun.
 * `VITE_USE_REAL_API !== 'true'` bo'lganda ishlatiladi.
 */

const MOCK_DISEASES: DiseaseListItem[] = [
  {
    id: 'd1', slug: 'gipertoniya-i10', icd10: 'I10',
    nameUz: 'Gipertoniya', nameLat: 'Hypertensio arterialis', nameRu: 'Гипертония',
    category: 'yurak-qon-tomir', status: 'PUBLISHED',
    audienceLevels: ['L1'], updatedAt: '2026-04-15T10:00:00Z',
  },
  {
    id: 'd2', slug: 'stenokardiya-i20', icd10: 'I20',
    nameUz: 'Stenokardiya', nameLat: 'Angina pectoris',
    category: 'yurak-qon-tomir', status: 'PUBLISHED',
    audienceLevels: ['L1'], updatedAt: '2026-04-14T10:00:00Z',
  },
  {
    id: 'd3', slug: 'miokard-infarkti-i21', icd10: 'I21',
    nameUz: 'Miokard infarkti', nameLat: 'Infarctus myocardii',
    category: 'yurak-qon-tomir', status: 'PUBLISHED',
    audienceLevels: ['L1'], updatedAt: '2026-04-13T10:00:00Z',
  },
  {
    id: 'd4', slug: 'orvi-j06', icd10: 'J06',
    nameUz: 'ORVI (Yuqori nafas yo\'llari infeksiyasi)', nameLat: 'Infectio viralis acuta',
    category: 'nafas-yollari', status: 'PUBLISHED',
    audienceLevels: ['L1'], updatedAt: '2026-04-12T10:00:00Z',
  },
  {
    id: 'd5', slug: 'bronxial-astma-j45', icd10: 'J45',
    nameUz: 'Bronxial astma', nameLat: 'Asthma bronchiale',
    category: 'nafas-yollari', status: 'PUBLISHED',
    audienceLevels: ['L1'], updatedAt: '2026-04-11T10:00:00Z',
  },
  {
    id: 'd6', slug: 'qandli-diabet-2-tur-e11', icd10: 'E11',
    nameUz: 'Qandli diabet 2-tur', nameLat: 'Diabetes mellitus typus 2',
    category: 'endokrin', status: 'PUBLISHED',
    audienceLevels: ['L1'], updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'd7', slug: 'migren-g43', icd10: 'G43',
    nameUz: 'Migren', nameLat: 'Migraena',
    category: 'nerv-tizimi', status: 'PUBLISHED',
    audienceLevels: ['L1'], updatedAt: '2026-04-09T10:00:00Z',
  },
  {
    id: 'd8', slug: 'gastrit-k29', icd10: 'K29',
    nameUz: 'Gastrit', nameLat: 'Gastritis',
    category: 'hazm', status: 'PUBLISHED',
    audienceLevels: ['L1'], updatedAt: '2026-04-08T10:00:00Z',
  },
  {
    // Atrial fibrillatsiya — CHA₂DS₂-VASc + HAS-BLED kalkulyatorlari
    // UI da ko'rsatilishi uchun ICD prefix I48 bilan qo'shilgan (GAP-05b).
    id: 'd9', slug: 'atrial-fibrillatsiya-i48', icd10: 'I48',
    nameUz: 'Atrial fibrillatsiya', nameLat: 'Fibrillatio atriorum',
    nameRu: 'Фибрилляция предсердий',
    category: 'yurak-qon-tomir', status: 'PUBLISHED',
    audienceLevels: ['L1'], updatedAt: '2026-04-17T10:00:00Z',
  },
];

function blocksFor(disease: DiseaseListItem): DiseaseBlock[] {
  return [
    {
      id: `${disease.id}-b1`, marker: 'DEFINITION', label: 'Ta\'rif',
      level: 'L1', orderIndex: 1,
      contentMd: `## Ta'rif\n\n**${disease.nameUz}** — bu ${disease.category} sohasiga oid kasallik bo'lib, keng tarqalgan va davolashga javob beradi. ICD-10 kodi: **${disease.icd10}**.`,
      evidenceLevel: 'A', status: 'PUBLISHED',
      publishedAt: disease.updatedAt,
    },
    {
      id: `${disease.id}-b2`, marker: 'SYMPTOMS_LIST', label: 'Asosiy belgilar',
      level: 'L1', orderIndex: 2,
      contentMd: `## Asosiy belgilar\n\n- Bosh og'rig'i\n- Holsizlik\n- Yurak urishining tezlashishi\n- Bosim ko'tarilishi\n- Ko'z oldi qorong'ilashishi`,
      evidenceLevel: 'B', status: 'PUBLISHED',
      publishedAt: disease.updatedAt,
    },
    {
      id: `${disease.id}-b3`, marker: 'CAUSES', label: 'Sabablari',
      level: 'L1', orderIndex: 3,
      contentMd: `## Sabablari\n\n- Irsiy moyillik\n- Noto'g'ri ovqatlanish\n- Stress va hissiy zo'riqish\n- Harakatsiz hayot tarzi\n- Chekish va alkogol`,
      evidenceLevel: 'B', status: 'PUBLISHED',
      publishedAt: disease.updatedAt,
    },
    {
      id: `${disease.id}-b4`, marker: 'TREATMENT_OVERVIEW', label: 'Davolash',
      level: 'L1', orderIndex: 4,
      contentMd: `## Davolash\n\nDavolash individual holatga bog'liq. Shifokor ko'rsatmalariga amal qiling. Dori-darmonlar faqat retsept orqali olinadi.`,
      evidenceLevel: 'A', status: 'PUBLISHED',
      publishedAt: disease.updatedAt,
    },
    {
      id: `${disease.id}-b5`, marker: 'WHEN_TO_SEEK_CARE', label: 'Qachon shifokorga',
      level: 'L1', orderIndex: 5,
      contentMd: `## Qachon shifokorga murojaat qilish kerak\n\n- Belgilar 3 kundan ortiq saqlansa\n- Holat yomonlashsa\n- Keskin og'riq yoki nafas qisilishi bo'lsa — **103 ga qo'ng'iroq qiling**`,
      evidenceLevel: 'A', status: 'PUBLISHED',
      publishedAt: disease.updatedAt,
    },
  ];
}

function detailFor(d: DiseaseListItem): DiseaseDetail {
  return {
    ...d,
    synonyms: d.slug === 'gipertoniya-i10'
      ? ['Qon bosimining ko\'tarilishi', 'Arterial gipertenziya']
      : [],
    severityLevels: ['MODERATE'],
    protocolSources: ['O\'zDSt 2024'],
    blocks: blocksFor(d),
  };
}

// ── Mock API functions ──────────────────────────────────────────

export async function mockListDiseases(params: DiseaseSearchParams): Promise<DiseaseListResponse> {
  await new Promise((r) => setTimeout(r, 200));
  const { q = '', category = '', page = 1, limit = 20 } = params;
  let filtered = MOCK_DISEASES;
  if (q) {
    const ql = q.toLowerCase();
    filtered = filtered.filter(
      (d) => d.nameUz.toLowerCase().includes(ql) ||
             d.icd10.toLowerCase().includes(ql) ||
             (d.nameLat?.toLowerCase().includes(ql) ?? false),
    );
  }
  if (category) filtered = filtered.filter((d) => d.category === category);
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);
  return { items, total: filtered.length, page, limit };
}

export async function mockGetDisease(slug: string): Promise<DiseaseDetail> {
  await new Promise((r) => setTimeout(r, 200));
  const d = MOCK_DISEASES.find((x) => x.slug === slug);
  if (!d) throw new Error('Disease not found');
  return detailFor(d);
}

/**
 * Mock symptom list per disease slug. Codes are chosen to align with
 * red-flag engine rule codes so AF-specific and diabetes-specific alerts
 * can be smoke-tested end-to-end.
 */
const SYMPTOMS_BY_SLUG: Record<string, DiseaseSymptomWithWeight[]> = {
  'gipertoniya-i10': [
    { id: 'h1', code: 'headache', nameUz: 'Bosh og\'rig\'i', category: 'umumiy', weight: 0.8, isRequired: false, isExcluding: false, isRedFlag: false },
    { id: 'h2', code: 'fatigue', nameUz: 'Holsizlik', category: 'umumiy', weight: 0.6, isRequired: false, isExcluding: false, isRedFlag: false },
    { id: 'h3', code: 'palpitations', nameUz: 'Yurak tez urishi', category: 'yurak', weight: 0.9, isRequired: true, isExcluding: false, isRedFlag: false },
    { id: 'h4', code: 'high-bp', nameUz: 'Yuqori bosim', category: 'yurak', weight: 1.0, isRequired: true, isExcluding: false, isRedFlag: false },
    { id: 'h5', code: 'chest-pain', nameUz: 'Ko\'krak og\'rig\'i', category: 'yurak', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'h6', code: 'bp-sbp-180', nameUz: 'SBP ≥ 180 mmHg (o\'lchagan)', category: 'yurak', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'h7', code: 'dyspnea', nameUz: 'Nafas qisilishi', category: 'yurak', weight: 0.8, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'h8', code: 'headache-severe', nameUz: 'Kuchli bosh og\'rig\'i', category: 'nerv', weight: 0.9, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'h9', code: 'vomiting', nameUz: 'Qayt qilish', category: 'umumiy', weight: 0.6, isRequired: false, isExcluding: false, isRedFlag: true },
  ],
  'atrial-fibrillatsiya-i48': [
    { id: 'a1', code: 'palpitations', nameUz: 'Yurak tez urishi', category: 'yurak', weight: 0.9, isRequired: true, isExcluding: false, isRedFlag: false },
    { id: 'a2', code: 'fatigue', nameUz: 'Holsizlik', category: 'umumiy', weight: 0.5, isRequired: false, isExcluding: false, isRedFlag: false },
    { id: 'a3', code: 'dyspnea', nameUz: 'Nafas qisilishi', category: 'yurak', weight: 0.8, isRequired: false, isExcluding: false, isRedFlag: true },
    // Red-flag codes targeting AF_RULES.
    { id: 'a4', code: 'palpitations-rapid', nameUz: 'Juda tez yurak urishi (>120)', category: 'yurak', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'a5', code: 'syncope', nameUz: 'Hushdan ketish', category: 'yurak', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'a6', code: 'hypotension', nameUz: 'Past bosim (SBP < 90)', category: 'yurak', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'a7', code: 'chest-pain', nameUz: 'Ko\'krak og\'rig\'i', category: 'yurak', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'a8', code: 'on-anticoagulant', nameUz: 'Antikoagulyant qabul qilmoqda', category: 'umumiy', weight: 0.3, isRequired: false, isExcluding: false, isRedFlag: false },
    { id: 'a9', code: 'gi-bleed', nameUz: 'Oshqozon-ichak qon ketishi', category: 'umumiy', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'a10', code: 'hematuria', nameUz: 'Siydikda qon', category: 'umumiy', weight: 0.9, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'a11', code: 'headache-severe', nameUz: 'Kuchli bosh og\'rig\'i', category: 'nerv', weight: 0.9, isRequired: false, isExcluding: false, isRedFlag: true },
  ],
  'qandli-diabet-2-tur-e11': [
    { id: 'dm1', code: 'polyuria', nameUz: 'Tez-tez siyish', category: 'endokrin', weight: 0.9, isRequired: true, isExcluding: false, isRedFlag: false },
    { id: 'dm2', code: 'polydipsia', nameUz: 'Chanqoqlik', category: 'endokrin', weight: 0.9, isRequired: true, isExcluding: false, isRedFlag: false },
    { id: 'dm3', code: 'fatigue', nameUz: 'Holsizlik', category: 'umumiy', weight: 0.6, isRequired: false, isExcluding: false, isRedFlag: false },
    { id: 'dm4', code: 'weight-loss', nameUz: 'Vaznni yo\'qotish', category: 'umumiy', weight: 0.7, isRequired: false, isExcluding: false, isRedFlag: false },
    // DKA rule codes
    { id: 'dm5', code: 'hyperglycemia', nameUz: 'Giperglikemiya (qon shakari >14)', category: 'endokrin', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'dm6', code: 'kussmaul', nameUz: 'Kussmaul nafasi (chuqur, tez)', category: 'endokrin', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'dm7', code: 'acetone-breath', nameUz: 'Asetonli nafas hidi', category: 'endokrin', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'dm8', code: 'vomiting', nameUz: 'Qayt qilish', category: 'umumiy', weight: 0.6, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'dm9', code: 'abdominal-pain', nameUz: 'Qorin og\'rig\'i', category: 'hazm', weight: 0.7, isRequired: false, isExcluding: false, isRedFlag: true },
    // Severe hypoglycemia rule codes
    { id: 'dm10', code: 'hypoglycemia', nameUz: 'Gipoglikemiya (qon shakari <3.5)', category: 'endokrin', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'dm11', code: 'altered-mental-status', nameUz: 'Ong o\'zgarishi/cho\'kkanlik', category: 'nerv', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
    { id: 'dm12', code: 'seizure', nameUz: 'Tutqanoq', category: 'nerv', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
  ],
};

const DEFAULT_SYMPTOMS: DiseaseSymptomWithWeight[] = [
  { id: 'g1', code: 'headache', nameUz: 'Bosh og\'rig\'i', category: 'umumiy', weight: 0.8, isRequired: false, isExcluding: false, isRedFlag: false },
  { id: 'g2', code: 'fatigue', nameUz: 'Holsizlik', category: 'umumiy', weight: 0.6, isRequired: false, isExcluding: false, isRedFlag: false },
];

export async function mockGetDiseaseSymptoms(slug: string): Promise<DiseaseSymptomWithWeight[]> {
  await new Promise((r) => setTimeout(r, 200));
  return SYMPTOMS_BY_SLUG[slug] ?? DEFAULT_SYMPTOMS;
}

export async function mockLookupByIcd(code: string): Promise<{ slug: string; id: string; icd10: string }> {
  await new Promise((r) => setTimeout(r, 200));
  const d = MOCK_DISEASES.find((x) => x.icd10.toLowerCase() === code.toLowerCase());
  if (!d) throw new Error('Not found');
  return { slug: d.slug, id: d.id, icd10: d.icd10 };
}

export async function mockSemanticSearch(q: string, limit: number): Promise<DiseaseListItem[]> {
  await new Promise((r) => setTimeout(r, 300));
  if (!q) return [];
  // Simple fuzzy: return first N diseases, marking the "closest" by name
  const ql = q.toLowerCase();
  const scored = MOCK_DISEASES.map((d) => ({
    d,
    score: d.nameUz.toLowerCase().includes(ql) ? 1
         : d.nameLat?.toLowerCase().includes(ql) ? 0.8
         : 0.3,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.d);
}
