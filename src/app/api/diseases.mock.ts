import type {
  DiseaseListItem,
  DiseaseDetail,
  DiseaseListResponse,
  DiseaseSearchParams,
  DiseaseBlock,
  DiseaseScientist,
  DiseaseResearch,
  DiseaseGenetic,
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

// ── KB v2 metadata mocks (PR-14/15/16) ─────────────────────────────────────
//
// Server fixtures (server/prisma/seeds/diseases/fixtures.ts) ga mos
// namuna ma'lumotlar. Noma'lum slug uchun bo'sh ro'yxat qaytaradi.
//
// Storage'lar `let` bilan mutable — admin UI bular ustida CRUD qiladi (mock
// dev-env'da). Slug ↔ id ni har ikki tomonga rezolv qilamiz, shunda
// sahifa write'larda `disease.id` yoki `slug` yuborgan bo'lsa ham bir xil
// bucket'ga tushadi. Real backend `:id` (UUID) ni kutadi.

function resolveSlug(slugOrId: string): string {
  const d = MOCK_DISEASES.find((x) => x.slug === slugOrId || x.id === slugOrId);
  return d?.slug ?? slugOrId;
}

function nowIso(): string {
  return new Date().toISOString();
}

const SCIENTISTS_BY_SLUG: Record<string, DiseaseScientist[]> = {
  'gipertoniya-i10': [
    {
      id: 'sci-rr', diseaseId: 'd1',
      fullName: 'Scipione Riva-Rocci', role: 'DISCOVERER',
      country: 'Italiya', birthYear: 1863, deathYear: 1937,
      bioMd: 'Italyan pediatr-internisti; 1896-yilda **simfigmomanometr** ixtiro qildi va arterial bosimni noinvaziv o\'lchash uchun asos yaratdi.',
      contributionsMd: 'Bosimni manjet orqali o\'lchash uslubi; zamonaviy tonometr prototipi.',
      photoUrl: null, orderIndex: 0,
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
    {
      id: 'sci-nk', diseaseId: 'd1',
      fullName: 'Nikolay Korotkov', role: 'CONTRIBUTOR',
      country: 'Rossiya', birthYear: 1874, deathYear: 1920,
      bioMd: 'Rus harbiy shifokor-xirurgi; 1905-yilda **Korotkov tovushlarini** kashf qildi — diastolik va sistolik bosimni stetoskop orqali aniq aniqlash usuli.',
      contributionsMd: 'Auskultativ usul — hozirgacha oltin standart.',
      photoUrl: null, orderIndex: 1,
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
  ],
  'migren-g43': [
    {
      id: 'sci-arab', diseaseId: 'd7',
      fullName: 'Aretaeus Kappadokiyalik', role: 'CLASSIFIER',
      country: 'Qadimgi Yunoniston', birthYear: 30, deathYear: 90,
      bioMd: 'Eramizning I asrida yashagan yunon shifokori; migrenni **heterokraniya** deb atab, bir tomonlama bosh og\'rig\'ini alohida kasallik sifatida birinchi tavsifladi.',
      contributionsMd: 'Heterokraniya → migraena etimologik manbai.',
      photoUrl: null, orderIndex: 0,
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
  ],
  'qandli-diabet-2-tur-e11': [
    {
      id: 'sci-banting', diseaseId: 'd6',
      fullName: 'Frederick Banting', role: 'DISCOVERER',
      country: 'Kanada', birthYear: 1891, deathYear: 1941,
      bioMd: 'Kanada olimi; Charles Best bilan 1921-yilda **insulinni** ajratib oldi va diabetni davolashda inqilob qildi. 1923-yilda Nobel mukofoti.',
      contributionsMd: 'Insulin ekstraksiyasi; Toronto universitetida klinik sinovlar.',
      photoUrl: null, orderIndex: 0,
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
  ],
};

const RESEARCH_BY_SLUG: Record<string, DiseaseResearch[]> = {
  'gipertoniya-i10': [
    {
      id: 'res-sprint', diseaseId: 'd1',
      title: 'A Randomized Trial of Intensive versus Standard Blood-Pressure Control (SPRINT)',
      authors: 'The SPRINT Research Group', journal: 'New England Journal of Medicine',
      year: 2015, doi: '10.1056/NEJMoa1511939', pubmedId: '26551272', nctId: 'NCT01206062',
      type: 'RCT',
      summaryMd: 'Intensiv bosim nazorati (SBP <120) standart (SBP <140) ga nisbatan kardiovaskulyar voqealar va umumiy o\'limni **25%** ga kamaytirdi.',
      evidenceLevel: 'A', isLandmark: true,
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
    {
      id: 'res-esh', diseaseId: 'd1',
      title: '2023 ESH Guidelines for the management of arterial hypertension',
      authors: 'Mancia G et al. (ESH)', journal: 'Journal of Hypertension',
      year: 2023, doi: '10.1097/HJH.0000000000003480', pubmedId: null, nctId: null,
      type: 'GUIDELINE',
      summaryMd: 'European Society of Hypertension yangi 2023-yilgi tavsiyalari — ofis SBP ≥140/DBP ≥90 dan boshlab tashxis; ambulator monitoring ustuvor.',
      evidenceLevel: 'A', isLandmark: false,
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
  ],
  'qandli-diabet-2-tur-e11': [
    {
      id: 'res-ukpds', diseaseId: 'd6',
      title: 'Intensive blood-glucose control with sulphonylureas or insulin compared with conventional treatment (UKPDS 33)',
      authors: 'UK Prospective Diabetes Study Group', journal: 'The Lancet',
      year: 1998, doi: '10.1016/S0140-6736(98)07019-6', pubmedId: '9742976', nctId: null,
      type: 'RCT',
      summaryMd: 'Intensiv glikemik nazorat mikrovaskulyar asoratlarni **25%** ga kamaytiradi. 10 yillik kuzatuv.',
      evidenceLevel: 'A', isLandmark: true,
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
    {
      id: 'res-ada2024', diseaseId: 'd6',
      title: 'Standards of Care in Diabetes — 2024',
      authors: 'American Diabetes Association', journal: 'Diabetes Care',
      year: 2024, doi: '10.2337/dc24-Sint', pubmedId: null, nctId: null,
      type: 'GUIDELINE',
      summaryMd: 'ADA 2024 standartlari — HbA1c maqsadi <7.0%, GLP-1 va SGLT2 — kardiovaskulyar himoya bilan birinchi qator.',
      evidenceLevel: 'A', isLandmark: false,
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
  ],
  'migren-g43': [
    {
      id: 'res-cgrp', diseaseId: 'd7',
      title: 'Efficacy of erenumab for the prevention of episodic migraine',
      authors: 'Goadsby PJ et al.', journal: 'New England Journal of Medicine',
      year: 2017, doi: '10.1056/NEJMoa1705848', pubmedId: '29171821', nctId: 'NCT02456740',
      type: 'RCT',
      summaryMd: 'Anti-CGRP monoklonal antitana **erenumab** migrenli kunlar sonini oylik ≥50% ga kamaytirdi.',
      evidenceLevel: 'A', isLandmark: true,
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
  ],
};

const GENETICS_BY_SLUG: Record<string, DiseaseGenetic[]> = {
  'gipertoniya-i10': [
    {
      id: 'gen-htn-1', diseaseId: 'd1',
      geneSymbol: 'AGT', variantType: 'SNP (M235T)',
      inheritancePattern: 'COMPLEX',
      penetrance: '0.150',
      bloodGroupRisk: null,
      populationNoteMd: 'Angiotensinogen gen variant. Slavyan va O\'rta Osiyo populyatsiyalarida AA genotip gipertoniya xavfini **15%** ga oshiradi.',
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
  ],
  'qandli-diabet-2-tur-e11': [
    {
      id: 'gen-dm-1', diseaseId: 'd6',
      geneSymbol: 'TCF7L2', variantType: 'SNP (rs7903146)',
      inheritancePattern: 'COMPLEX',
      penetrance: '0.200',
      bloodGroupRisk: null,
      populationNoteMd: 'TCF7L2 — T2D uchun eng kuchli umumiy variant. CT/TT genotip odds ratio ~1.4.',
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
  ],
  'migren-g43': [
    {
      id: 'gen-mig-1', diseaseId: 'd7',
      geneSymbol: 'CACNA1A', variantType: 'Missense',
      inheritancePattern: 'AUTOSOMAL_DOMINANT',
      penetrance: '0.700',
      bloodGroupRisk: null,
      populationNoteMd: 'Familial hemiplegic migraine type 1 (FHM1) — kalsiy kanali mutatsiyasi.',
      createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-04-20T10:00:00Z',
    },
  ],
};

export async function mockGetDiseaseScientists(slug: string): Promise<DiseaseScientist[]> {
  await new Promise((r) => setTimeout(r, 200));
  return SCIENTISTS_BY_SLUG[resolveSlug(slug)] ?? [];
}

export async function mockGetDiseaseResearch(slug: string): Promise<DiseaseResearch[]> {
  await new Promise((r) => setTimeout(r, 200));
  return RESEARCH_BY_SLUG[resolveSlug(slug)] ?? [];
}

export async function mockGetDiseaseGenetics(slug: string): Promise<DiseaseGenetic[]> {
  await new Promise((r) => setTimeout(r, 200));
  return GENETICS_BY_SLUG[resolveSlug(slug)] ?? [];
}

// ── Mutations (dev-env fake CRUD) ──────────────────────────────────────────
//
// Admin UI mock rejimda to'liq CRUD oqimini sinab ko'rsatadi: yaratish,
// yangilash, o'chirish — list cache'ga qaytib ko'rinadi. Write'lar `slug`
// yoki `disease.id` qabul qiladi.

let mockIdCounter = 1000;
function newId(prefix: string): string {
  mockIdCounter += 1;
  return `${prefix}-${mockIdCounter}`;
}

export async function mockCreateScientist(
  diseaseIdOrSlug: string,
  input: Omit<DiseaseScientist, 'id' | 'diseaseId' | 'createdAt' | 'updatedAt' | 'orderIndex'> & {
    orderIndex?: number;
  },
): Promise<DiseaseScientist> {
  await new Promise((r) => setTimeout(r, 150));
  const slug = resolveSlug(diseaseIdOrSlug);
  const diseaseId = MOCK_DISEASES.find((x) => x.slug === slug)?.id ?? diseaseIdOrSlug;
  const bucket = SCIENTISTS_BY_SLUG[slug] ?? [];
  const created: DiseaseScientist = {
    id: newId('sci'),
    diseaseId,
    fullName: input.fullName,
    role: input.role,
    country: input.country ?? null,
    birthYear: input.birthYear ?? null,
    deathYear: input.deathYear ?? null,
    bioMd: input.bioMd ?? null,
    contributionsMd: input.contributionsMd ?? null,
    photoUrl: input.photoUrl ?? null,
    orderIndex: input.orderIndex ?? bucket.length,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  SCIENTISTS_BY_SLUG[slug] = [...bucket, created];
  return created;
}

export async function mockUpdateScientist(
  diseaseIdOrSlug: string,
  scientistId: string,
  input: Partial<Omit<DiseaseScientist, 'id' | 'diseaseId' | 'createdAt' | 'updatedAt'>>,
): Promise<DiseaseScientist> {
  await new Promise((r) => setTimeout(r, 150));
  const slug = resolveSlug(diseaseIdOrSlug);
  const bucket = SCIENTISTS_BY_SLUG[slug] ?? [];
  const idx = bucket.findIndex((s) => s.id === scientistId);
  if (idx === -1) throw new Error('Scientist not found');
  const updated: DiseaseScientist = { ...bucket[idx], ...input, updatedAt: nowIso() };
  SCIENTISTS_BY_SLUG[slug] = bucket.map((s, i) => (i === idx ? updated : s));
  return updated;
}

export async function mockDeleteScientist(
  diseaseIdOrSlug: string,
  scientistId: string,
): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 150));
  const slug = resolveSlug(diseaseIdOrSlug);
  const bucket = SCIENTISTS_BY_SLUG[slug] ?? [];
  SCIENTISTS_BY_SLUG[slug] = bucket.filter((s) => s.id !== scientistId);
  return { ok: true };
}

export async function mockCreateResearch(
  diseaseIdOrSlug: string,
  input: Omit<DiseaseResearch, 'id' | 'diseaseId' | 'createdAt' | 'updatedAt' | 'evidenceLevel' | 'isLandmark'> & {
    evidenceLevel?: 'A' | 'B' | 'C' | 'D';
    isLandmark?: boolean;
  },
): Promise<DiseaseResearch> {
  await new Promise((r) => setTimeout(r, 150));
  const slug = resolveSlug(diseaseIdOrSlug);
  const diseaseId = MOCK_DISEASES.find((x) => x.slug === slug)?.id ?? diseaseIdOrSlug;
  const bucket = RESEARCH_BY_SLUG[slug] ?? [];
  if (input.doi && bucket.some((r) => r.doi === input.doi)) {
    throw new Error('DOI already exists for this disease');
  }
  const created: DiseaseResearch = {
    id: newId('res'),
    diseaseId,
    title: input.title,
    authors: input.authors,
    journal: input.journal ?? null,
    year: input.year,
    doi: input.doi ?? null,
    pubmedId: input.pubmedId ?? null,
    nctId: input.nctId ?? null,
    type: input.type,
    summaryMd: input.summaryMd,
    evidenceLevel: input.evidenceLevel ?? 'C',
    isLandmark: input.isLandmark ?? false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  RESEARCH_BY_SLUG[slug] = [created, ...bucket];
  return created;
}

export async function mockUpdateResearch(
  diseaseIdOrSlug: string,
  researchId: string,
  input: Partial<Omit<DiseaseResearch, 'id' | 'diseaseId' | 'createdAt' | 'updatedAt'>>,
): Promise<DiseaseResearch> {
  await new Promise((r) => setTimeout(r, 150));
  const slug = resolveSlug(diseaseIdOrSlug);
  const bucket = RESEARCH_BY_SLUG[slug] ?? [];
  const idx = bucket.findIndex((r) => r.id === researchId);
  if (idx === -1) throw new Error('Research not found');
  const updated: DiseaseResearch = { ...bucket[idx], ...input, updatedAt: nowIso() };
  RESEARCH_BY_SLUG[slug] = bucket.map((r, i) => (i === idx ? updated : r));
  return updated;
}

export async function mockDeleteResearch(
  diseaseIdOrSlug: string,
  researchId: string,
): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 150));
  const slug = resolveSlug(diseaseIdOrSlug);
  const bucket = RESEARCH_BY_SLUG[slug] ?? [];
  RESEARCH_BY_SLUG[slug] = bucket.filter((r) => r.id !== researchId);
  return { ok: true };
}

export async function mockCreateGenetic(
  diseaseIdOrSlug: string,
  input: Partial<Omit<DiseaseGenetic, 'id' | 'diseaseId' | 'createdAt' | 'updatedAt'>>,
): Promise<DiseaseGenetic> {
  await new Promise((r) => setTimeout(r, 150));
  const slug = resolveSlug(diseaseIdOrSlug);
  const diseaseId = MOCK_DISEASES.find((x) => x.slug === slug)?.id ?? diseaseIdOrSlug;
  const bucket = GENETICS_BY_SLUG[slug] ?? [];
  const created: DiseaseGenetic = {
    id: newId('gen'),
    diseaseId,
    geneSymbol: input.geneSymbol ?? null,
    variantType: input.variantType ?? null,
    inheritancePattern: input.inheritancePattern ?? null,
    penetrance: input.penetrance ?? null,
    bloodGroupRisk: input.bloodGroupRisk ?? null,
    populationNoteMd: input.populationNoteMd ?? null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  GENETICS_BY_SLUG[slug] = [...bucket, created];
  return created;
}

export async function mockUpdateGenetic(
  diseaseIdOrSlug: string,
  geneticId: string,
  input: Partial<Omit<DiseaseGenetic, 'id' | 'diseaseId' | 'createdAt' | 'updatedAt'>>,
): Promise<DiseaseGenetic> {
  await new Promise((r) => setTimeout(r, 150));
  const slug = resolveSlug(diseaseIdOrSlug);
  const bucket = GENETICS_BY_SLUG[slug] ?? [];
  const idx = bucket.findIndex((g) => g.id === geneticId);
  if (idx === -1) throw new Error('Genetic not found');
  const updated: DiseaseGenetic = { ...bucket[idx], ...input, updatedAt: nowIso() };
  GENETICS_BY_SLUG[slug] = bucket.map((g, i) => (i === idx ? updated : g));
  return updated;
}

export async function mockDeleteGenetic(
  diseaseIdOrSlug: string,
  geneticId: string,
): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 150));
  const slug = resolveSlug(diseaseIdOrSlug);
  const bucket = GENETICS_BY_SLUG[slug] ?? [];
  GENETICS_BY_SLUG[slug] = bucket.filter((g) => g.id !== geneticId);
  return { ok: true };
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
