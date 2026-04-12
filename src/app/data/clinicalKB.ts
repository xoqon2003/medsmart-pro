/**
 * Klinik Bilim Bazasi (Mock) — 8 ta kasallik
 * Har bir kasallik: simptomlar, adaptiv savollar, mutaxassis, tahlillar, manba
 */
import type { ClinicalKBEntry, AdaptiveQuestion } from '../types';

// ── Umumiy adaptiv savollar (ko'p kasallikda qayta ishlatiladi) ──────────────

const Q_DURATION: AdaptiveQuestion = {
  id: 'q_duration',
  question: "Shikoyat qancha vaqtdan beri davom etmoqda?",
  type: 'radio',
  options: ['1 soatdan kam', '1-24 soat', '1-7 kun', '1-4 hafta', '1 oydan ortiq'],
};

const Q_PAIN_LEVEL: AdaptiveQuestion = {
  id: 'q_pain_level',
  question: "Og'riq darajasini baholang (1 — yengil, 10 — chidab bo'lmaydigan)",
  type: 'slider',
  sliderMin: 1,
  sliderMax: 10,
};

const Q_FEVER: AdaptiveQuestion = {
  id: 'q_fever',
  question: "Isitma (harorat ko'tarilishi) bormi?",
  type: 'radio',
  options: ["Yo'q", "37-38°C", "38-39°C", "39°C dan yuqori"],
};

const Q_PREVIOUS: AdaptiveQuestion = {
  id: 'q_previous',
  question: "Avval ham shunday holat bo'lganmi?",
  type: 'radio',
  options: ['Birinchi marta', 'Vaqti-vaqti bilan', 'Doimiy'],
};

// ── Bilim Bazasi ─────────────────────────────────────────────────────────────

export const clinicalKB: ClinicalKBEntry[] = [
  // 1. MIGREN
  {
    id: 'migraine',
    nameUz: 'Migren',
    nameLat: 'Migraine',
    icd10: 'G43.9',
    description: "Bosh og'rig'ining keng tarqalgan turi. Ko'pincha bir tomonlama, pulsatsiyali og'riq bilan namoyon bo'ladi. Ko'ngil aynash, yorug'lik va tovushdan bezovtalanish kuzatiladi.",
    symptoms: ["bosh og'rig'i", "ko'ngil aynash", "yorug'likdan qo'rqish", "tovushdan bezovtalanish", "qusish", "ko'rish buzilishi"],
    requiredSymptoms: ["bosh og'rig'i"],
    supportingSymptoms: ["pulsatsiyali og'riq", "bir tomonlama", "ko'ngil aynash", "yorug'likdan qo'rqish"],
    excludingSymptoms: ["isitma", "bo'yin qattiqligi"],
    specialist: 'Nevropatolog',
    tests: ["Qon bosimi monitoringi", "Nevrologik tekshiruv", "Bosh MRT (zarur bo'lsa)"],
    source: "Bosh og'rig'i klinik protokoli (WHO, 2022)",
    ageRange: [12, 65],
    genderBias: 'F',
    bodyZones: ['head'],
    adaptiveQuestions: [
      Q_DURATION,
      {
        id: 'q_headache_location',
        question: "Og'riq boshning qaysi qismida?",
        type: 'radio',
        options: ['Peshona', 'Chakka (bir tomonda)', 'Ensa', 'Butun bosh', 'Ko\'z atrofida'],
      },
      {
        id: 'q_headache_character',
        question: "Og'riqning xarakteri qanday?",
        type: 'radio',
        options: ['Pulsatsiyali (urib-urib)', 'Bosuvchi / siquvchi', "O'tkir / sanchuvchi", 'Zerikarli / doimiy'],
      },
      Q_PAIN_LEVEL,
      {
        id: 'q_headache_accompany',
        question: "Quyidagi hamroh belgilardan qaysilari bor?",
        type: 'checkbox',
        options: ["Ko'ngil aynash", "Qusish", "Yorug'likdan qo'rqish", "Tovushdan bezovtalanish", "Ko'rish buzilishi", "Bosh aylanishi"],
      },
      Q_PREVIOUS,
    ],
  },

  // 2. GASTRIT
  {
    id: 'gastritis',
    nameUz: 'Gastrit',
    nameLat: 'Gastritis',
    icd10: 'K29.7',
    description: "Oshqozon shilliq qavatining yallig'lanishi. Qorin og'rig'i, ko'ngil aynash, ovqatdan keyin og'irlik bilan namoyon bo'ladi.",
    symptoms: ["qorin og'rig'i", "ko'ngil aynash", "oshqozon og'rig'i", "ich dam bo'lishi", "ovqat hazm qilish qiyinligi", "qusish", "ishtaha yo'qolishi"],
    requiredSymptoms: ["qorin og'rig'i"],
    supportingSymptoms: ["ovqatdan keyin og'riq", "ko'ngil aynash", "ich dam bo'lishi", "oshqozon achchiq"],
    excludingSymptoms: ["qon qusish", "qora najas"],
    specialist: 'Gastroenterolog',
    tests: ["FEGDS (gastroskopiya)", "Helicobacter pylori testi", "Umumiy qon tahlili", "Qorin UZI"],
    source: "Gastrit klinik protokoli (O'zR SSV, 2023)",
    ageRange: [15, 80],
    genderBias: null,
    bodyZones: ['abdomen'],
    adaptiveQuestions: [
      Q_DURATION,
      {
        id: 'q_stomach_when',
        question: "Og'riq qachon kuchayadi?",
        type: 'checkbox',
        options: ['Ovqat oldidan (och qoringa)', 'Ovqatdan keyin', 'Kechasi', 'Doimo'],
      },
      {
        id: 'q_stomach_character',
        question: "Og'riq xarakteri qanday?",
        type: 'radio',
        options: ['Achishish / kuydirish', 'Bosuvchi / siquvchi', "O'tkir sanchuvchi", 'Zerikarli'],
      },
      Q_PAIN_LEVEL,
      {
        id: 'q_stomach_accompany',
        question: "Quyidagi belgilardan qaysilari bor?",
        type: 'checkbox',
        options: ["Ko'ngil aynash", "Qusish", "Ich dam bo'lishi", "Oshqozon achchiq", "Ishtaha yo'qolishi", "Kekirish"],
      },
      Q_PREVIOUS,
    ],
  },

  // 3. GIPERTONIYA
  {
    id: 'hypertension',
    nameUz: 'Gipertoniya (Qon bosimi ko\'tarilishi)',
    nameLat: 'Hypertension',
    icd10: 'I10',
    description: "Arterial qon bosimining surunkali ko'tarilishi. Bosh og'rig'i, bosh aylanishi, yuz qizarishi bilan namoyon bo'lishi mumkin.",
    symptoms: ["bosh og'rig'i", "bosh aylanishi", "yuz qizarishi", "quloqda shovqin", "yurak tez urishi", "hansirash", "ko'rish xiralashishi"],
    requiredSymptoms: ["bosh og'rig'i"],
    supportingSymptoms: ["bosh aylanishi", "yuz qizarishi", "yurak tez urishi", "quloqda shovqin"],
    excludingSymptoms: [],
    specialist: 'Kardiolog',
    tests: ["Qon bosimi monitoringi (SMAD)", "EKG", "Umumiy qon tahlili", "Biokimyoviy qon tahlili", "Buyrak UZI"],
    source: "Arterial gipertoniya klinik protokoli (ESC/ESH, 2023)",
    ageRange: [30, 90],
    genderBias: null,
    bodyZones: ['head', 'chest'],
    adaptiveQuestions: [
      Q_DURATION,
      {
        id: 'q_bp_measured',
        question: "Qon bosimingizni o'lchagansizmi? Natijalari qanday?",
        type: 'radio',
        options: ["O'lchamadim", "140/90 dan past", "140/90 — 160/100", "160/100 dan yuqori"],
      },
      {
        id: 'q_bp_symptoms',
        question: "Quyidagi belgilardan qaysilari bor?",
        type: 'checkbox',
        options: ['Bosh aylanishi', 'Yuz qizarishi', 'Quloqda shovqin', 'Yurak tez urishi', 'Hansirash', "Ko'rish xiralashishi"],
      },
      Q_PAIN_LEVEL,
      Q_PREVIOUS,
    ],
  },

  // 4. BRONXIT
  {
    id: 'bronchitis',
    nameUz: 'Bronxit (Bronxlar yallig\'lanishi)',
    nameLat: 'Bronchitis',
    icd10: 'J20.9',
    description: "Bronxlarning yallig'lanishi. Yo'tal, balg'am, hansirash va isitma bilan namoyon bo'ladi.",
    symptoms: ["yo'tal", "balg'am", "hansirash", "isitma", "ko'krak og'rig'i", "holsizlik", "tomoq og'rig'i"],
    requiredSymptoms: ["yo'tal"],
    supportingSymptoms: ["balg'am", "isitma", "hansirash"],
    excludingSymptoms: ["qon tupurish"],
    specialist: 'Pulmonolog (o\'pka shifokori)',
    tests: ["Ko'krak qafasi rentgeni", "Umumiy qon tahlili", "Balg'am tahlili", "Spirometriya"],
    source: "O'tkir bronxit klinik protokoli (O'zR SSV, 2023)",
    ageRange: [3, 90],
    genderBias: null,
    bodyZones: ['chest'],
    adaptiveQuestions: [
      Q_DURATION,
      {
        id: 'q_cough_type',
        question: "Yo'tal xarakteri qanday?",
        type: 'radio',
        options: ["Quruq (balg'amsiz)", "Ho'l (balg'amli)", "Har xil — gohida quruq, gohida ho'l"],
      },
      Q_FEVER,
      {
        id: 'q_cough_accompany',
        question: "Quyidagi belgilardan qaysilari bor?",
        type: 'checkbox',
        options: ["Hansirash", "Ko'krak og'rig'i", "Tomoq og'rig'i", "Holsizlik", "Terlash (ayniqsa kechasi)"],
      },
      Q_PREVIOUS,
    ],
  },

  // 5. SISTIT (Siydik qopi yallig'lanishi)
  {
    id: 'cystitis',
    nameUz: 'Sistit (Siydik qopi yallig\'lanishi)',
    nameLat: 'Cystitis',
    icd10: 'N30.0',
    description: "Siydik qopining yallig'lanishi. Tez-tez siydik ajratish, kuydirish va qorin pastida og'riq bilan namoyon bo'ladi.",
    symptoms: ["tez-tez siydik ajratish", "siydik ajratishda kuydirish", "qorin pastida og'riq", "siydik loyqaligi", "isitma"],
    requiredSymptoms: ["tez-tez siydik ajratish"],
    supportingSymptoms: ["siydik ajratishda kuydirish", "qorin pastida og'riq"],
    excludingSymptoms: [],
    specialist: 'Urolog',
    tests: ["Umumiy siydik tahlili", "Siydik ekishi (bakposev)", "Buyrak va siydik qopi UZI", "Umumiy qon tahlili"],
    source: "Siydik yo'llari infeksiyalari klinik protokoli (EAU, 2023)",
    ageRange: [15, 80],
    genderBias: 'F',
    bodyZones: ['pelvis'],
    adaptiveQuestions: [
      Q_DURATION,
      {
        id: 'q_urine_frequency',
        question: "Kuniga necha marta siydik ajratmoqdasiz?",
        type: 'radio',
        options: ['5-8 marta (norma)', '8-12 marta', '12 martadan ko\'p', 'Har soatda'],
      },
      Q_FEVER,
      {
        id: 'q_urine_symptoms',
        question: "Quyidagi belgilardan qaysilari bor?",
        type: 'checkbox',
        options: ["Siydik ajratishda kuydirish", "Siydik loyqa", "Qorin pastida og'riq", "Bel og'rig'i", "Siydikda qon"],
      },
      Q_PREVIOUS,
    ],
  },

  // 6. ALLERGIK RINIT
  {
    id: 'allergic_rhinitis',
    nameUz: 'Allergik rinit (Burun yallig\'lanishi)',
    nameLat: 'Allergic Rhinitis',
    icd10: 'J30.4',
    description: "Burunning allergik yallig'lanishi. Burun bitishi, aksirish, burun oqishi va ko'z qichishi bilan namoyon bo'ladi.",
    symptoms: ["burun bitishi", "aksirish", "burun oqishi", "ko'z qichishi", "ko'z yoshlanishi", "tomoq qichishi"],
    requiredSymptoms: ["burun bitishi", "aksirish"],
    supportingSymptoms: ["burun oqishi", "ko'z qichishi"],
    excludingSymptoms: ["isitma", "balg'am"],
    specialist: 'Allergolog (yoki LOR)',
    tests: ["Allergik testlar (skarifik test)", "IgE umumiy", "Qon eozinofillar", "Burun tamponi"],
    source: "Allergik rinit klinik protokoli (ARIA, 2023)",
    ageRange: [5, 70],
    genderBias: null,
    bodyZones: ['head'],
    adaptiveQuestions: [
      Q_DURATION,
      {
        id: 'q_allergy_season',
        question: "Belgilar qaysi vaqtda kuchayadi?",
        type: 'radio',
        options: ['Bahorda', 'Yozda', 'Kuzda', "Barcha mavsumlarda", "Mavsum bilan bog'liq emas"],
      },
      {
        id: 'q_allergy_trigger',
        question: "Nimadan keyin kuchayadi?",
        type: 'checkbox',
        options: ["Chang-to'zon", "Hayvonlar", "Gul changi", "Sovuq havo", "Oziq-ovqat", "Bilmayman"],
      },
      {
        id: 'q_allergy_symptoms',
        question: "Quyidagi belgilardan qaysilari bor?",
        type: 'checkbox',
        options: ["Burun oqishi (suv kabi)", "Ko'z qichishi", "Ko'z yoshlanishi", "Tomoq qichishi", "Quloq bitishi"],
      },
      Q_PREVIOUS,
    ],
  },

  // 7. OSTEOXONDROZ (Umurtqa pog'onasi)
  {
    id: 'osteochondrosis',
    nameUz: 'Osteoxondroz (Umurtqa pog\'onasi kasalligi)',
    nameLat: 'Osteochondrosis',
    icd10: 'M42.9',
    description: "Umurtqa pog'onasi disk va bo'g'imlarining degenerativ kasalligi. Bo'yin yoki bel og'rig'i, qo'l-oyoqqa beriluvchi og'riq bilan namoyon bo'ladi.",
    symptoms: ["bel og'rig'i", "bo'yin og'rig'i", "orqa og'rig'i", "qo'lga beriluvchi og'riq", "oyoqqa beriluvchi og'riq", "uvishish", "bosh aylanishi"],
    requiredSymptoms: ["bel og'rig'i"],
    supportingSymptoms: ["harakatda kuchayish", "oyoqqa berilish", "uvishish"],
    excludingSymptoms: ["isitma", "qorin og'rig'i"],
    specialist: 'Nevropatolog (yoki Ortoped)',
    tests: ["Umurtqa pog'onasi MRT", "Umurtqa pog'onasi rentgeni", "Nevrologik tekshiruv"],
    source: "Osteoxondroz klinik protokoli (O'zR SSV, 2023)",
    ageRange: [25, 80],
    genderBias: null,
    bodyZones: ['back', 'neck'],
    adaptiveQuestions: [
      Q_DURATION,
      {
        id: 'q_back_location',
        question: "Og'riq qayerda?",
        type: 'radio',
        options: ["Bo'yin", "Ko'krak qismi (kurak orasida)", "Bel", "Dumg'aza"],
      },
      {
        id: 'q_back_radiation',
        question: "Og'riq boshqa joylarga berilmoqdami?",
        type: 'checkbox',
        options: ["Qo'lga", "Oyoqqa", "Yelkaga", "Boshqa joyga", "Berilmaydi"],
      },
      Q_PAIN_LEVEL,
      {
        id: 'q_back_worse',
        question: "Og'riq qachon kuchayadi?",
        type: 'checkbox',
        options: ["Uzoq o'tirganda", "Harakat qilganda", "Og'irlik ko'targanda", "Ertalab", "Kechasi"],
      },
      Q_PREVIOUS,
    ],
  },

  // 8. DIABET (2-tur)
  {
    id: 'diabetes_type2',
    nameUz: 'Qandli diabet (2-tur)',
    nameLat: 'Diabetes Mellitus Type 2',
    icd10: 'E11',
    description: "Qondagi qand miqdorining surunkali ko'tarilishi. Tashnalik, tez-tez siydik ajratish, vazn yo'qotish, holsizlik bilan namoyon bo'ladi.",
    symptoms: ["tashnalik", "tez-tez siydik ajratish", "holsizlik", "vazn yo'qotish", "ko'rish xiralashishi", "yaralaring sekin bitishi", "teri qichishi"],
    requiredSymptoms: ["tashnalik", "holsizlik"],
    supportingSymptoms: ["tez-tez siydik ajratish", "vazn yo'qotish"],
    excludingSymptoms: [],
    specialist: 'Endokrinolog',
    tests: ["Qondagi glukoza (och qoringa)", "HbA1c (glikozilangan gemoglobin)", "Umumiy qon tahlili", "Lipid profili", "Buyrak funksiya testlari"],
    source: "Qandli diabet klinik protokoli (ADA, 2024)",
    ageRange: [30, 90],
    genderBias: null,
    bodyZones: ['whole_body'],
    adaptiveQuestions: [
      Q_DURATION,
      {
        id: 'q_diabetes_thirst',
        question: "Kuniga qancha suv ichmoqdasiz?",
        type: 'radio',
        options: ['1-2 litr (norma)', '2-3 litr', '3-4 litr', '4 litrdan ko\'p'],
      },
      {
        id: 'q_diabetes_symptoms',
        question: "Quyidagi belgilardan qaysilari bor?",
        type: 'checkbox',
        options: ["Tez-tez siydik ajratish", "Vazn yo'qotish", "Ko'rish xiralashishi", "Yaralaning sekin bitishi", "Teri qichishi", "Oyoq uvishishi"],
      },
      {
        id: 'q_diabetes_family',
        question: "Oilangizda qandli diabet kasalligi bormi?",
        type: 'radio',
        options: ["Yo'q", "Ha, ota-onamda", "Ha, aka-ukamda", "Ha, bobo-buvimda"],
      },
      Q_PREVIOUS,
    ],
  },
];

// ── Tana xaritasi zonalari ──────────────────────────────────────────────────

export const BODY_ZONES = [
  { id: 'head',      label: 'Bosh',               region: 'head' },
  { id: 'neck',      label: "Bo'yin",              region: 'neck' },
  { id: 'chest',     label: "Ko'krak",             region: 'chest' },
  { id: 'abdomen',   label: 'Qorin',               region: 'abdomen' },
  { id: 'back',      label: 'Orqa / Bel',          region: 'back' },
  { id: 'pelvis',    label: "Qorin pasti / Chanoq", region: 'pelvis' },
  { id: 'left_arm',  label: "Chap qo'l",           region: 'left_arm' },
  { id: 'right_arm', label: "O'ng qo'l",           region: 'right_arm' },
  { id: 'left_leg',  label: 'Chap oyoq',           region: 'left_leg' },
  { id: 'right_leg', label: "O'ng oyoq",           region: 'right_leg' },
  { id: 'whole_body', label: 'Butun tana',          region: 'whole_body' },
] as const;

// ── Ko'p uchraydigan shikoyatlar ro'yxati (Tayyor ro'yxat uchun) ────────────

export const COMMON_SYMPTOMS = [
  "Bosh og'rig'i",
  "Qorin og'rig'i",
  "Bel og'rig'i",
  "Bo'yin og'rig'i",
  "Ko'krak og'rig'i",
  "Yo'tal",
  "Isitma",
  "Holsizlik",
  "Bosh aylanishi",
  "Ko'ngil aynash",
  "Qusish",
  "Tashnalik",
  "Hansirash",
  "Burun bitishi",
  "Aksirish",
  "Tomoq og'rig'i",
  "Ko'z og'rig'i",
  "Quloq og'rig'i",
  "Teri toshmalari",
  "Teri qichishi",
  "Tez-tez siydik ajratish",
  "Ich ketishi",
  "Ich qotishi",
  "Uyqu buzilishi",
  "Ishtaha yo'qolishi",
  "Vazn yo'qotish",
  "Bo'g'im og'rig'i",
  "Mushak og'rig'i",
  "Terlash",
  "Uvishish",
];

// ── Diagnostika dvigateli ───────────────────────────────────────────────────

// Scoring konstantalari
const SCORE_REQUIRED = 30;
const SCORE_SUPPORTING = 15;
const SCORE_GENERAL = 5;
const SCORE_BODY_ZONE = 10;
const SCORE_EXCLUDING = -50;
const SCORE_ANSWER_MATCH = 8;
const SCORE_DURATION_CHRONIC = 5;

/**
 * Ikki simptom so'zini solishtiradi — biri ikkinchisining so'zlarini o'z ichiga olsa true.
 * "bosh og'rig'i" vs "bosh" → true (bosh "bosh og'rig'i" so'zlari ichida)
 * "og'riq" vs "bosh og'rig'i" → false (og'riq aniq bir so'z emas, qisman mos kelmaydi)
 */
function matchSymptom(userSymptom: string, kbSymptom: string): boolean {
  const userWords = userSymptom.toLowerCase().split(/\s+/);
  const kbWords = kbSymptom.toLowerCase().split(/\s+/);
  // KB simptom so'zlarining barchasi foydalanuvchi matnida bormi?
  const kbInUser = kbWords.every(w => userWords.some(uw => uw.includes(w) || w.includes(uw)));
  // Yoki foydalanuvchi simptom so'zlari KB da bormi?
  const userInKb = userWords.every(w => kbWords.some(kw => kw.includes(w) || w.includes(kw)));
  return kbInUser || userInKb;
}

/**
 * Bemorning simptomlarini KB bilan taqqoslab, top-3 natija qaytaradi.
 * Scoring: requiredSymptoms + supportingSymptoms + answers + bodyZones.
 */
export function runDiagnosis(
  symptoms: string[],
  bodyZones: string[],
  answers: Array<{ questionId: string; answer: string | string[] | number }>,
  kbData?: ClinicalKBEntry[],
): Array<{
  entry: ClinicalKBEntry;
  score: number;
  matchingSymptoms: string[];
}> {
  if (symptoms.length === 0 && bodyZones.length === 0) return [];
  const kb = kbData && kbData.length > 0 ? kbData : clinicalKB;

  const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim()).filter(Boolean);

  const scored = kb.map(entry => {
    let score = 0;
    const matching: string[] = [];

    // 1. Required symptoms mos kelishi
    const requiredMatch = entry.requiredSymptoms.filter(rs =>
      normalizedSymptoms.some(s => matchSymptom(s, rs))
    );
    if (requiredMatch.length === 0) return { entry, score: 0, matchingSymptoms: [] };
    score += requiredMatch.length * SCORE_REQUIRED;
    matching.push(...requiredMatch);

    // 2. Supporting symptoms
    const supportMatch = entry.supportingSymptoms.filter(ss =>
      normalizedSymptoms.some(s => matchSymptom(s, ss))
    );
    score += supportMatch.length * SCORE_SUPPORTING;
    matching.push(...supportMatch);

    // 3. Umumiy simptomlar
    const generalMatch = entry.symptoms.filter(gs =>
      normalizedSymptoms.some(s => matchSymptom(s, gs))
    ).filter(g => !matching.includes(g));
    score += generalMatch.length * SCORE_GENERAL;
    matching.push(...generalMatch);

    // 4. Tana zonasi
    if (bodyZones.length > 0) {
      const zoneMatch = entry.bodyZones.some(bz => bodyZones.includes(bz));
      if (zoneMatch) score += SCORE_BODY_ZONE;
    }

    // 5. Excluding symptoms
    const excludeMatch = entry.excludingSymptoms.filter(es =>
      normalizedSymptoms.some(s => matchSymptom(s, es))
    );
    if (excludeMatch.length > 0) score += SCORE_EXCLUDING;

    // 6. Adaptiv savollar javoblaridan qo'shimcha ball
    if (answers.length > 0) {
      // Davomiylik savoli — surunkali kasalliklarga qo'shimcha ball
      const durationAnswer = answers.find(a => a.questionId === 'q_duration' || a.questionId === 'gen_duration');
      if (durationAnswer && typeof durationAnswer.answer === 'string') {
        if (durationAnswer.answer.includes('oydan ortiq') || durationAnswer.answer.includes('hafta')) {
          // Surunkali — migren, gipertoniya, diabet kabi kasalliklarga mos
          if (['migraine', 'hypertension', 'osteochondrosis', 'diabetes_type2', 'allergic_rhinitis'].includes(entry.id)) {
            score += SCORE_DURATION_CHRONIC;
          }
        }
      }

      // Isitma savoli — infeksion kasalliklarga ball
      const feverAnswer = answers.find(a => a.questionId === 'q_fever' || a.questionId === 'gen_fever');
      if (feverAnswer && typeof feverAnswer.answer === 'string' && !feverAnswer.answer.includes("Yo'q")) {
        if (['bronchitis', 'cystitis'].includes(entry.id)) {
          score += SCORE_ANSWER_MATCH;
        }
      }

      // Kasallikka xos savollar — entry ning adaptiveQuestions idlari bilan mos kelganlar
      for (const answer of answers) {
        const matchingQ = entry.adaptiveQuestions.find(q => q.id === answer.questionId);
        if (matchingQ) {
          score += SCORE_ANSWER_MATCH;
        }
      }
    }

    return { entry, score, matchingSymptoms: [...new Set(matching)] };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
