/**
 * Red-flag (shoshilinch holat) qoidalar bazasi.
 *
 * `evaluateRedFlags(symptomMarkers)` — foydalanuvchi "YES" deb
 * javob bergan simptom markerlarini qabul qilib, mos kelgan qoidalarni
 * urgency bo'yicha tartiblangan holda qaytaradi.
 *
 * Minimal mos kelish chegarasi: har bir qoida uchun `minMatchCount`
 * (default = 2). 1 ta marker bilan IMMEDIATE qoidalar ham mos kelishi
 * mumkin (masalan, ongsizlik yoki anafilaksiya).
 */

export type UrgencyLevel = 'IMMEDIATE' | 'URGENT' | 'SOON';

export interface RedFlagRule {
  /** Qoidaning noyob identifikatori */
  id: string;
  /** Mos kelishi kerak bo'lgan canonical marker IDlar */
  symptomMarkers: string[];
  /**
   * Mos kelish uchun zarur minimum markerlar soni.
   * Default: 2. 1 qo'yilsa — bitta marker topilsa ham qoida ishga tushadi.
   */
  minMatchCount: number;
  /** Holat nomi (o'zbek tilida) */
  conditionLabel: string;
  /** Holat nomi (rus tilida, ixtiyoriy) */
  conditionLabelRu?: string;
  /**
   * IMMEDIATE — darhol 103 chaqirilsin.
   * URGENT    — 1 soat ichida shifokorga ko'rsatilsin.
   * SOON      — bugun shifokorga murojaat qilinsin.
   */
  urgencyLevel: UrgencyLevel;
  /** `true` bo'lsa frontend "103 chaqiring" tugmasini ko'rsatadi */
  callEmergency: boolean;
  /** Foydalanuvchiga ko'rsatiladigan qisqa xabar (o'zbek tilida) */
  messageUz: string;
  /** Bog'liq ICD-10 kodlar (ma'lumot uchun) */
  icd10Hints?: string[];
}

// ─── Urgency tartib qiymatlari (sort uchun) ──────────────────────────────────

const URGENCY_ORDER: Record<UrgencyLevel, number> = {
  IMMEDIATE: 0,
  URGENT: 1,
  SOON: 2,
};

// ─── Qoidalar bazasi ─────────────────────────────────────────────────────────

export const RED_FLAG_RULES: RedFlagRule[] = [
  // 1. Miokard infarkti (yurak xurujи)
  {
    id: 'RF-001',
    symptomMarkers: ['CHEST_PAIN', 'SHORTNESS_OF_BREATH', 'LEFT_ARM_PAIN'],
    minMatchCount: 2,
    conditionLabel: 'Miokard infarkti shubhasi',
    conditionLabelRu: 'Подозрение на инфаркт миокарда',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Ko\'krak og\'rig\'i va nafas qisilishi jiddiy belgi. Darhol 103 ga qo\'ng\'iroq qiling!',
    icd10Hints: ['I21', 'I22'],
  },

  // 2. Insult (miya qon aylanishining buzilishi)
  {
    id: 'RF-002',
    symptomMarkers: ['SEVERE_HEADACHE', 'VISION_DISTURBANCE', 'FACIAL_DROOPING', 'ARM_WEAKNESS', 'SPEECH_DIFFICULTY'],
    minMatchCount: 2,
    conditionLabel: 'Insult shubhasi',
    conditionLabelRu: 'Подозрение на инсульт',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Insult belgilari aniqlandi. Har daqiqa muhim — darhol 103 ga qo\'ng\'iroq qiling!',
    icd10Hints: ['I63', 'I64'],
  },

  // 3. O'tkir qorin (appenditsit / perforatsiya)
  {
    id: 'RF-003',
    symptomMarkers: ['ABDOMINAL_PAIN', 'RIGID_ABDOMEN', 'HIGH_FEVER'],
    minMatchCount: 2,
    conditionLabel: 'O\'tkir qorin (appenditsit / perforatsiya shubhasi)',
    conditionLabelRu: 'Острый живот (аппендицит / перфорация)',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Qorin og\'rig\'i va qattiq qorin jiddiy belgi. Tezkor jarrohlik yordami kerak!',
    icd10Hints: ['K35', 'K25.1', 'K63.1'],
  },

  // 4. O'tkir nafas yetishmovchiligi
  {
    id: 'RF-004',
    symptomMarkers: ['SHORTNESS_OF_BREATH', 'CYANOSIS', 'INABILITY_TO_SPEAK'],
    minMatchCount: 1,
    conditionLabel: 'O\'tkir nafas yetishmovchiligi',
    conditionLabelRu: 'Острая дыхательная недостаточность',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Ko\'karish (sianoz) yoki nafas olish qiyinlashgan. Darhol 103 chaqiring!',
    icd10Hints: ['J96.0'],
  },

  // 5. Bosh miya jarohati / koma
  {
    id: 'RF-005',
    symptomMarkers: ['LOSS_OF_CONSCIOUSNESS', 'DILATED_PUPILS', 'HEAD_INJURY'],
    minMatchCount: 1,
    conditionLabel: 'Bosh miya jarohati / koma',
    conditionLabelRu: 'Черепно-мозговая травма / кома',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Ongni yo\'qotish kuzatildi. Darhol 103 chaqiring va bemorni qimirlatmang!',
    icd10Hints: ['S06', 'R55'],
  },

  // 6. Gemorragik shok (og'ir qon ketish)
  {
    id: 'RF-006',
    symptomMarkers: ['HEAVY_BLEEDING', 'PALLOR', 'RAPID_WEAK_PULSE', 'LOSS_OF_CONSCIOUSNESS'],
    minMatchCount: 2,
    conditionLabel: 'Gemorragik shok',
    conditionLabelRu: 'Геморрагический шок',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Og\'ir qon ketish va shok belgilari. Bosim punktini bosing va darhol 103 chaqiring!',
    icd10Hints: ['R57.1', 'T79.4'],
  },

  // 7. Anafilaksiya (og'ir allergik reaksiya)
  {
    id: 'RF-007',
    symptomMarkers: ['THROAT_SWELLING', 'SHORTNESS_OF_BREATH', 'SKIN_HIVES', 'DIZZINESS', 'RAPID_PULSE'],
    minMatchCount: 2,
    conditionLabel: 'Anafilaksiya shubhasi',
    conditionLabelRu: 'Подозрение на анафилаксию',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Og\'ir allergik reaksiya (anafilaksiya) belgilari. Epinefrin va 103 zudlik bilan!',
    icd10Hints: ['T78.2'],
  },

  // 8. O'tkir pankreatit
  {
    id: 'RF-008',
    symptomMarkers: ['UPPER_ABDOMINAL_PAIN', 'ABDOMINAL_DISTENSION', 'NAUSEA_VOMITING', 'HIGH_FEVER'],
    minMatchCount: 2,
    conditionLabel: 'O\'tkir pankreatit shubhasi',
    conditionLabelRu: 'Подозрение на острый панкреатит',
    urgencyLevel: 'URGENT',
    callEmergency: false,
    messageUz:
      'Qorin og\'rig\'i va ko\'ngil aynishi kuzatildi. 1 soat ichida shifokorga murojaat qiling.',
    icd10Hints: ['K85'],
  },

  // 9. Taxikardiya / yurak aritmiyasi
  {
    id: 'RF-009',
    symptomMarkers: ['HEART_RATE_OVER_150', 'PALPITATIONS', 'DIZZINESS', 'SYNCOPE'],
    minMatchCount: 2,
    conditionLabel: 'Og\'ir taxikardiya / aritmiya',
    conditionLabelRu: 'Тяжёлая тахикардия / аритмия',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Yurak urishi 150+ va hushsizlik — darhol 103 chaqiring!',
    icd10Hints: ['I47.1', 'I49'],
  },

  // 10. GI qon ketish (qon qusish / qora najaslik)
  {
    id: 'RF-010',
    symptomMarkers: ['BLOODY_VOMIT', 'BLACK_TARRY_STOOL', 'PALLOR', 'RAPID_WEAK_PULSE'],
    minMatchCount: 1,
    conditionLabel: 'Oshqozon-ichak qon ketishi',
    conditionLabelRu: 'Желудочно-кишечное кровотечение',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Qon qusish yoki qora najaslik jiddiy belgi. Darhol 103 chaqiring!',
    icd10Hints: ['K92.0', 'K92.1'],
  },

  // 11. Meningit / ensefalit
  {
    id: 'RF-011',
    symptomMarkers: ['SEVERE_HEADACHE', 'NECK_STIFFNESS', 'HIGH_FEVER', 'PHOTOPHOBIA'],
    minMatchCount: 2,
    conditionLabel: 'Meningit / ensefalit shubhasi',
    conditionLabelRu: 'Подозрение на менингит / энцефалит',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Kuchli bosh og\'rig\'i + bo\'yin qotishi + isitma — meningit belgisi. Darhol 103!',
    icd10Hints: ['G00', 'G03', 'G04'],
  },

  // 12. Pulmonar emboliya (o'pka tomirlari tiqilishi)
  {
    id: 'RF-012',
    symptomMarkers: ['SHORTNESS_OF_BREATH', 'CHEST_PAIN', 'COUGHING_BLOOD', 'LEG_SWELLING'],
    minMatchCount: 2,
    conditionLabel: 'O\'pka emboliyasi shubhasi',
    conditionLabelRu: 'Подозрение на лёгочную эмболию',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Nafas qisilishi va ko\'krak og\'rig\'i + qon yo\'talligi — o\'pka emboliyasi shubhasi. 103!',
    icd10Hints: ['I26'],
  },

  // 13. Eklampsiya / og'ir preeklampsiya (homilador)
  {
    id: 'RF-013',
    symptomMarkers: ['PREGNANCY_FLAG', 'SEVERE_HEADACHE', 'VISION_DISTURBANCE', 'UPPER_ABDOMINAL_PAIN', 'SEIZURE'],
    minMatchCount: 2,
    conditionLabel: 'Eklampsiya / og\'ir preeklampsiya',
    conditionLabelRu: 'Эклампсия / тяжёлая преэклампсия',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Homiladorlikda tutqanoq va kuchli bosh og\'rig\'i eklampsiya belgisi. Darhol 103!',
    icd10Hints: ['O14', 'O15'],
  },

  // 14. Gipoglikemiya (qon qandining keskin tushishi)
  {
    id: 'RF-014',
    symptomMarkers: ['TREMBLING', 'CONFUSION', 'PROFUSE_SWEATING', 'LOSS_OF_CONSCIOUSNESS', 'DIABETES_FLAG'],
    minMatchCount: 2,
    conditionLabel: 'Og\'ir gipoglikemiya',
    conditionLabelRu: 'Тяжёлая гипогликемия',
    urgencyLevel: 'URGENT',
    callEmergency: false,
    messageUz:
      'Qand kasalligi bilan birga qaltirashu va hushni yo\'qotish — darhol shikar yoki shifokor!',
    icd10Hints: ['E16.0', 'E11.649'],
  },

  // 15. Aortik disseksiya
  {
    id: 'RF-015',
    symptomMarkers: ['TEARING_CHEST_BACK_PAIN', 'UNEQUAL_BLOOD_PRESSURE', 'LOSS_OF_CONSCIOUSNESS'],
    minMatchCount: 1,
    conditionLabel: 'Aorta disseksiyasi shubhasi',
    conditionLabelRu: 'Подозрение на расслоение аорты',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Ko\'krakdan orqaga o\'tadigan yirtiluvchi og\'riq — aorta disseksiyasi belgiси. Darhol 103!',
    icd10Hints: ['I71.0'],
  },

  // 16. Sepsis
  {
    id: 'RF-016',
    symptomMarkers: ['HIGH_FEVER', 'RAPID_PULSE', 'CONFUSION', 'RAPID_BREATHING', 'KNOWN_INFECTION'],
    minMatchCount: 3,
    conditionLabel: 'Sepsis shubhasi',
    conditionLabelRu: 'Подозрение на сепсис',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Yuqori isitma + tez yurak urishi + chalkashlik — sepsis belgisi. Darhol 103!',
    icd10Hints: ['A41'],
  },

  // 17. Testikular / ovarian torsiya (keskin qorin og'rig'i)
  {
    id: 'RF-017',
    symptomMarkers: ['SUDDEN_GROIN_PAIN', 'NAUSEA_VOMITING', 'SCROTAL_SWELLING'],
    minMatchCount: 2,
    conditionLabel: 'Testikular torsiya shubhasi',
    conditionLabelRu: 'Подозрение на перекрут яичка',
    urgencyLevel: 'URGENT',
    callEmergency: false,
    messageUz:
      'Keskin chov og\'rig\'i + ko\'ngil aynishi — tezkor jarroh ko\'rigiga muhtoj!',
    icd10Hints: ['N44.0'],
  },

  // 18. Elektr urishi / suyanchoq yiqilishi
  {
    id: 'RF-018',
    symptomMarkers: ['ELECTRIC_SHOCK_HISTORY', 'BURNS', 'LOSS_OF_CONSCIOUSNESS', 'IRREGULAR_HEARTBEAT'],
    minMatchCount: 1,
    conditionLabel: 'Elektr urishi / og\'ir kuyish',
    conditionLabelRu: 'Поражение электрическим током / тяжёлый ожог',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Elektr urishi yoki og\'ir kuyish kuzatildi. Darhol 103 chaqiring!',
    icd10Hints: ['T75.4', 'T31'],
  },

  // 19. Epiglottit (bolalarda bo'g'ilish xavfi)
  {
    id: 'RF-019',
    symptomMarkers: ['STRIDOR', 'DROOLING', 'MUFFLED_VOICE', 'HIGH_FEVER'],
    minMatchCount: 2,
    conditionLabel: 'Epiglottit shubhasi (bo\'g\'ilish xavfi)',
    conditionLabelRu: 'Подозрение на эпиглоттит',
    urgencyLevel: 'IMMEDIATE',
    callEmergency: true,
    messageUz:
      'Xirillagan nafas + so\'lak oqishi + isitma — epiglottit belgisi. Darhol 103!',
    icd10Hints: ['J05.1'],
  },

  // 20. Keskin ko'rish yoki eshitish yo'qolishi (insult markeri)
  {
    id: 'RF-020',
    symptomMarkers: ['SUDDEN_VISION_LOSS', 'SUDDEN_HEARING_LOSS', 'DIZZINESS', 'SEVERE_HEADACHE'],
    minMatchCount: 2,
    conditionLabel: 'O\'tkir nevrоlogik hodisa shubhasi',
    conditionLabelRu: 'Подозрение на острое неврологическое событие',
    urgencyLevel: 'URGENT',
    callEmergency: true,
    messageUz:
      'Ko\'rish yoki eshitishning keskin yo\'qolishi — insult/TIA belgisi. Darhol shifokorga!',
    icd10Hints: ['G45', 'I63'],
  },
];

// ─── Baholash funksiyasi ──────────────────────────────────────────────────────

/**
 * Foydalanuvchi "YES" deb javob bergan simptom markerlarini qabul qilib,
 * mos kelgan red-flag qoidalarini urgency bo'yicha tartiblangan holda qaytaradi.
 *
 * @param symptomMarkers - foydalanuvchi tasdiqlagan canonical marker IDlar massivi
 * @returns Mos kelgan `RedFlagRule[]` (IMMEDIATE → URGENT → SOON tartibida)
 */
export function evaluateRedFlags(symptomMarkers: string[]): RedFlagRule[] {
  const markerSet = new Set(symptomMarkers);

  const matched = RED_FLAG_RULES.filter((rule) => {
    const hits = rule.symptomMarkers.filter((m) => markerSet.has(m)).length;
    return hits >= rule.minMatchCount;
  });

  // IMMEDIATE → URGENT → SOON tartibida sort
  matched.sort(
    (a, b) => URGENCY_ORDER[a.urgencyLevel] - URGENCY_ORDER[b.urgencyLevel],
  );

  return matched;
}
