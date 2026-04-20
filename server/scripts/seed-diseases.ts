/**
 * Kasalliklar bazasi seed scripti — 50 kasallik × L1 darajada × uz tilida.
 * Ishlatish: pnpm --dir server seed:diseases
 *
 * Idempotent: qayta ishlatilsa xato bermaydi (upsert asosida).
 */

import { PrismaClient, ApprovalStatus, EvidenceLevel, ContentLevel, AudienceMode } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ── Tip ta'riflar ──────────────────────────────────────────────────────────────

interface SeedDisease {
  icd10: string;
  nameUz: string;
  nameLat: string;
  nameRu: string;
  synonyms: string[];
  slug: string;
  categorySlug: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
}

interface BlockDef {
  marker: string;
  label: string;
  orderIndex: number;
  content: (d: SeedDisease) => string;
}

// ── Kasallikka xos alomatlar ───────────────────────────────────────────────────

interface SymptomTemplate {
  code: string;
  nameUz: string;
  nameRu: string;
  category: string;
  bodyZone?: string;
  isRedFlag: boolean;
}

// Har bir kasallik uchun 3-5 ta simptomlari
const DISEASE_SYMPTOMS: Record<string, SymptomTemplate[]> = {
  'arterial-gipertoniya-i10': [
    { code: 'SYM-HTN-001', nameUz: 'Bosh og\'rig\'i', nameRu: 'Головная боль', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-HTN-002', nameUz: 'Ko\'z oldida qorachiq', nameRu: 'Мушки перед глазами', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-HTN-003', nameUz: 'Yurak urishi tezlashishi', nameRu: 'Учащённое сердцебиение', category: 'kardial', bodyZone: 'ko\'krak', isRedFlag: false },
    { code: 'SYM-HTN-004', nameUz: 'Qon bosimi 140/90 mmHg dan yuqori', nameRu: 'АД >140/90 мм рт.ст.', category: 'kardial', bodyZone: 'ko\'krak', isRedFlag: true },
    { code: 'SYM-HTN-005', nameUz: 'Quloq shang\'ilashi', nameRu: 'Шум в ушах', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: false },
  ],
  'stenokardiya-i20': [
    { code: 'SYM-ANG-001', nameUz: 'Ko\'krak qisishi', nameRu: 'Давящая боль в груди', category: 'kardial', bodyZone: 'ko\'krak', isRedFlag: true },
    { code: 'SYM-ANG-002', nameUz: 'Chap qo\'lga tarqaluvchi og\'riq', nameRu: 'Иррадиация боли в левую руку', category: 'kardial', bodyZone: 'qo\'l', isRedFlag: true },
    { code: 'SYM-ANG-003', nameUz: 'Nafas qisilishi', nameRu: 'Одышка', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
    { code: 'SYM-ANG-004', nameUz: 'Jismoniy zo\'riqishda og\'riq', nameRu: 'Боль при физической нагрузке', category: 'kardial', bodyZone: 'ko\'krak', isRedFlag: false },
  ],
  'miokard-infarkti-i21': [
    { code: 'SYM-MI-001', nameUz: 'O\'tkir ko\'krak og\'rig\'i', nameRu: 'Острая боль в груди', category: 'kardial', bodyZone: 'ko\'krak', isRedFlag: true },
    { code: 'SYM-MI-002', nameUz: 'Sovuq ter', nameRu: 'Холодный пот', category: 'umumiy', bodyZone: 'teri', isRedFlag: true },
    { code: 'SYM-MI-003', nameUz: 'Nafas olish qiyinligi', nameRu: 'Затруднённое дыхание', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: true },
    { code: 'SYM-MI-004', nameUz: 'Huddi o\'lim oldidagidek qo\'rquv', nameRu: 'Страх смерти', category: 'psixik', bodyZone: 'bosh', isRedFlag: true },
    { code: 'SYM-MI-005', nameUz: 'Ko\'ngil aynashi', nameRu: 'Тошнота', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
  ],
  'yurak-yetishmovchiligi-i50': [
    { code: 'SYM-HF-001', nameUz: 'Nafas qisilishi (uyqudan turganda)', nameRu: 'Одышка в покое', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: true },
    { code: 'SYM-HF-002', nameUz: 'Oyoq-qo\'l shishi', nameRu: 'Отёки конечностей', category: 'umumiy', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-HF-003', nameUz: 'Tezda charchash', nameRu: 'Быстрая утомляемость', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-HF-004', nameUz: 'Kechasi yo\'tal', nameRu: 'Ночной кашель', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
  ],
  'ishemik-insult-i63': [
    { code: 'SYM-IS-001', nameUz: 'Bir tomonlama yuz, qo\'l yoki oyoq falaji', nameRu: 'Гемиплегия', category: 'nevrologik', bodyZone: 'qo\'l', isRedFlag: true },
    { code: 'SYM-IS-002', nameUz: 'Nutq buzilishi', nameRu: 'Нарушение речи', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: true },
    { code: 'SYM-IS-003', nameUz: 'Ko\'rish buzilishi', nameRu: 'Нарушение зрения', category: 'nevrologik', bodyZone: 'ko\'z', isRedFlag: true },
    { code: 'SYM-IS-004', nameUz: 'Muvozanat yo\'qotish', nameRu: 'Нарушение равновесия', category: 'nevrologik', bodyZone: undefined, isRedFlag: true },
  ],
  'periferik-arteriya-kasalligi-i739': [
    { code: 'SYM-PAD-001', nameUz: 'Yurganda oyoq og\'rig\'i', nameRu: 'Боль в ногах при ходьбе', category: 'tomir', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-PAD-002', nameUz: 'Oyoqlarda sovuqlik', nameRu: 'Холодность нижних конечностей', category: 'tomir', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-PAD-003', nameUz: 'Dam olganda og\'riq kamaymaydi', nameRu: 'Боль в покое', category: 'tomir', bodyZone: 'oyoq', isRedFlag: true },
  ],
  'utir-rinit-j00': [
    { code: 'SYM-RHN-001', nameUz: 'Burundan suv oqishi', nameRu: 'Ринорея', category: 'nafas', bodyZone: 'burun', isRedFlag: false },
    { code: 'SYM-RHN-002', nameUz: 'Burun bitishi', nameRu: 'Заложенность носа', category: 'nafas', bodyZone: 'burun', isRedFlag: false },
    { code: 'SYM-RHN-003', nameUz: 'Aksirish', nameRu: 'Чихание', category: 'nafas', bodyZone: 'burun', isRedFlag: false },
    { code: 'SYM-RHN-004', nameUz: 'Burun atrofida og\'riq', nameRu: 'Боль в носовых пазухах', category: 'nafas', bodyZone: 'burun', isRedFlag: false },
  ],
  'orvi-j06': [
    { code: 'SYM-ARVI-001', nameUz: 'Harorat ko\'tarilishi', nameRu: 'Повышение температуры', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-ARVI-002', nameUz: 'Tomoq og\'rig\'i', nameRu: 'Боль в горле', category: 'nafas', bodyZone: 'tomoq', isRedFlag: false },
    { code: 'SYM-ARVI-003', nameUz: 'Burun oqishi', nameRu: 'Насморк', category: 'nafas', bodyZone: 'burun', isRedFlag: false },
    { code: 'SYM-ARVI-004', nameUz: 'Umumiy holsizlik', nameRu: 'Общая слабость', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-ARVI-005', nameUz: 'Yo\'tal', nameRu: 'Кашель', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
  ],
  'pnevmoniya-j18': [
    { code: 'SYM-PNE-001', nameUz: 'Yuqori harorat (38-39°C)', nameRu: 'Высокая температура', category: 'umumiy', bodyZone: undefined, isRedFlag: true },
    { code: 'SYM-PNE-002', nameUz: 'Sarg\'ish yoki qizil balg\'amli yo\'tal', nameRu: 'Продуктивный кашель', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
    { code: 'SYM-PNE-003', nameUz: 'Ko\'krak og\'rig\'i', nameRu: 'Боль в грудной клетке', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
    { code: 'SYM-PNE-004', nameUz: 'Nafas qisilishi', nameRu: 'Одышка', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: true },
    { code: 'SYM-PNE-005', nameUz: 'Titroq va sovuq ter', nameRu: 'Озноб', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
  ],
  'bronxial-astma-j45': [
    { code: 'SYM-AST-001', nameUz: 'Hushtak ovozi bilan nafas olish', nameRu: 'Свистящее дыхание', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
    { code: 'SYM-AST-002', nameUz: 'Nafas qisilishi (xuruj)', nameRu: 'Приступ одышки', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: true },
    { code: 'SYM-AST-003', nameUz: 'Kechasi yo\'tal kuchayishi', nameRu: 'Ночной кашель', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
    { code: 'SYM-AST-004', nameUz: 'Ko\'krak siqilishi', nameRu: 'Сжатие в груди', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
  ],
  'bronxit-j40': [
    { code: 'SYM-BRX-001', nameUz: 'Yo\'tal (quruq yoki balg\'amli)', nameRu: 'Кашель', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
    { code: 'SYM-BRX-002', nameUz: 'Past harorat', nameRu: 'Субфебрилитет', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-BRX-003', nameUz: 'Ko\'krak orqasida og\'riq', nameRu: 'Боль за грудиной', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
  ],
  'tonzillit-j35': [
    { code: 'SYM-TNZ-001', nameUz: 'Tomoq og\'rig\'i', nameRu: 'Боль в горле', category: 'nafas', bodyZone: 'tomoq', isRedFlag: false },
    { code: 'SYM-TNZ-002', nameUz: 'Yutishda qiyinchilik', nameRu: 'Затруднение при глотании', category: 'nafas', bodyZone: 'tomoq', isRedFlag: false },
    { code: 'SYM-TNZ-003', nameUz: 'Bodomchalarning kattalashishi', nameRu: 'Увеличение миндалин', category: 'nafas', bodyZone: 'tomoq', isRedFlag: false },
    { code: 'SYM-TNZ-004', nameUz: 'Harorat ko\'tarilishi', nameRu: 'Повышение температуры', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
  ],
  'oshqozon-yarasi-k25': [
    { code: 'SYM-GUL-001', nameUz: 'Epigastral og\'riq (ovqatdan 1-2 soat o\'tib)', nameRu: 'Боль в эпигастрии после еды', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-GUL-002', nameUz: 'Ko\'ngil aynashi', nameRu: 'Тошнота', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-GUL-003', nameUz: 'Qorin og\'rig\'i', nameRu: 'Боль в животе', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-GUL-004', nameUz: 'Qorin kuyishi', nameRu: 'Изжога', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-GUL-005', nameUz: 'Qora rangli axlat (qon ketish belgisi)', nameRu: 'Мелена', category: 'hazm', bodyZone: 'qorin', isRedFlag: true },
  ],
  'peptik-yara-k27': [
    { code: 'SYM-PUL-001', nameUz: 'Kechasi qorin og\'rig\'i', nameRu: 'Ночные боли в животе', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-PUL-002', nameUz: 'Ovqatdan keyin og\'riq kamayishi', nameRu: 'Уменьшение боли после еды', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-PUL-003', nameUz: 'Ishtaha yo\'qolishi', nameRu: 'Снижение аппетита', category: 'hazm', bodyZone: undefined, isRedFlag: false },
  ],
  'gastrit-k29': [
    { code: 'SYM-GST-001', nameUz: 'Ovqatdan so\'ng qorin og\'rig\'i', nameRu: 'Боль после еды', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-GST-002', nameUz: 'Og\'izda achimsiq ta\'m', nameRu: 'Горький привкус во рту', category: 'hazm', bodyZone: 'og\'iz', isRedFlag: false },
    { code: 'SYM-GST-003', nameUz: 'Shishish (meteorizm)', nameRu: 'Вздутие живота', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-GST-004', nameUz: 'Ko\'ngil aynashi', nameRu: 'Тошнота', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
  ],
  'ot-tosh-kasalligi-k80': [
    { code: 'SYM-KLT-001', nameUz: 'O\'ng qovurg\'a ostida og\'riq', nameRu: 'Боль под правым ребром', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-KLT-002', nameUz: 'Og\'riqli o\'t pufagi xurujlari', nameRu: 'Желчная колика', category: 'hazm', bodyZone: 'qorin', isRedFlag: true },
    { code: 'SYM-KLT-003', nameUz: 'Sariqlik', nameRu: 'Желтуха', category: 'hazm', bodyZone: 'teri', isRedFlag: true },
    { code: 'SYM-KLT-004', nameUz: 'Ko\'ngil aynashi, qayd qilish', nameRu: 'Тошнота, рвота', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
  ],
  'gi-qon-ketish-k92': [
    { code: 'SYM-GIB-001', nameUz: 'Qonga qo\'shilgan qayt', nameRu: 'Рвота с кровью', category: 'hazm', bodyZone: 'qorin', isRedFlag: true },
    { code: 'SYM-GIB-002', nameUz: 'Qora rangli axlat', nameRu: 'Чёрный кал (мелена)', category: 'hazm', bodyZone: 'qorin', isRedFlag: true },
    { code: 'SYM-GIB-003', nameUz: 'Qorin og\'rig\'i', nameRu: 'Боль в животе', category: 'hazm', bodyZone: 'qorin', isRedFlag: true },
    { code: 'SYM-GIB-004', nameUz: 'Zaiflik va bosim tushishi', nameRu: 'Слабость, снижение АД', category: 'umumiy', bodyZone: undefined, isRedFlag: true },
  ],
  'tassirlanuvchan-ichak-sindromi-k58': [
    { code: 'SYM-IBS-001', nameUz: 'Axlat rejimi o\'zgarishi', nameRu: 'Нарушение стула', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-IBS-002', nameUz: 'Qorin og\'rig\'i (axlatdan keyin kamayadi)', nameRu: 'Боль, уменьшающаяся после дефекации', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-IBS-003', nameUz: 'Shish va gaz', nameRu: 'Вздутие и газы', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
  ],
  'qandli-diabet-2-tur-e11': [
    { code: 'SYM-DM2-001', nameUz: 'Ko\'p siydik', nameRu: 'Учащённое мочеиспускание', category: 'siydik', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-DM2-002', nameUz: 'Chanqoqlik', nameRu: 'Жажда', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-DM2-003', nameUz: 'Charchash', nameRu: 'Усталость', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-DM2-004', nameUz: 'Ko\'rish xiralashishi', nameRu: 'Размытое зрение', category: 'ko\'z', bodyZone: 'ko\'z', isRedFlag: false },
    { code: 'SYM-DM2-005', nameUz: 'Yaralarga sekin bitish', nameRu: 'Медленное заживление ран', category: 'teri', bodyZone: 'teri', isRedFlag: false },
  ],
  'qandli-diabet-1-tur-e10': [
    { code: 'SYM-DM1-001', nameUz: 'Ko\'p siydik', nameRu: 'Полиурия', category: 'siydik', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-DM1-002', nameUz: 'Kuchli chanqoq', nameRu: 'Полидипсия', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-DM1-003', nameUz: 'Ko\'p ovqat yeyish', nameRu: 'Полифагия', category: 'hazm', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-DM1-004', nameUz: 'Tez vazn yo\'qotish', nameRu: 'Резкое похудание', category: 'umumiy', bodyZone: undefined, isRedFlag: true },
  ],
  'tirotoksikoz-e05': [
    { code: 'SYM-TTX-001', nameUz: 'Yurak urishi tezlashishi', nameRu: 'Тахикардия', category: 'kardial', bodyZone: 'ko\'krak', isRedFlag: false },
    { code: 'SYM-TTX-002', nameUz: 'Qo\'l qaltirashi', nameRu: 'Тремор рук', category: 'nevrologik', bodyZone: 'qo\'l', isRedFlag: false },
    { code: 'SYM-TTX-003', nameUz: 'Vazn yo\'qotish', nameRu: 'Потеря веса', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-TTX-004', nameUz: 'Issiqlik sezish', nameRu: 'Непереносимость жары', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
  ],
  'gipotireoz-e03': [
    { code: 'SYM-HYP-001', nameUz: 'Charchash va uyquchilik', nameRu: 'Усталость и сонливость', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-HYP-002', nameUz: 'Sovuqqa sezgirlik', nameRu: 'Непереносимость холода', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-HYP-003', nameUz: 'Teri quruqligi', nameRu: 'Сухость кожи', category: 'teri', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-HYP-004', nameUz: 'Vazn ortishi', nameRu: 'Прибавка веса', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
  ],
  'semizlik-e66': [
    { code: 'SYM-OBS-001', nameUz: 'Tana vazni ko\'p bo\'lishi (BMI ≥30)', nameRu: 'ИМТ ≥30', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-OBS-002', nameUz: 'Nafas qisilishi', nameRu: 'Одышка при нагрузке', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: false },
    { code: 'SYM-OBS-003', nameUz: 'Bo\'g\'imlarda og\'riq', nameRu: 'Боль в суставах', category: 'tayanch', bodyZone: 'oyoq', isRedFlag: false },
  ],
  'dislipidemiya-e78': [
    { code: 'SYM-DLP-001', nameUz: 'Ko\'pincha belgilarsiz', nameRu: 'Бессимптомное течение', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-DLP-002', nameUz: 'Ateroskleroz belgilari', nameRu: 'Признаки атеросклероза', category: 'tomir', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-DLP-003', nameUz: 'Ksantomalar (teri osti yog\' yig\'ilishi)', nameRu: 'Ксантомы', category: 'teri', bodyZone: 'teri', isRedFlag: false },
  ],
  'migren-g43': [
    { code: 'SYM-MGR-001', nameUz: 'Bir tomonlama kuchli bosh og\'rig\'i', nameRu: 'Односторонняя интенсивная головная боль', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-MGR-002', nameUz: 'Yorug\'lik va ovozga sezgirlik', nameRu: 'Фото- и фонофобия', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-MGR-003', nameUz: 'Ko\'ngil aynashi, qayd qilish', nameRu: 'Тошнота, рвота', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-MGR-004', nameUz: 'Aura (ko\'rish buzilishi)', nameRu: 'Зрительная аура', category: 'nevrologik', bodyZone: 'ko\'z', isRedFlag: false },
  ],
  'epilepsiya-g40': [
    { code: 'SYM-EPI-001', nameUz: 'Tonik-klonik tutqanoq', nameRu: 'Тонико-клонические судороги', category: 'nevrologik', bodyZone: undefined, isRedFlag: true },
    { code: 'SYM-EPI-002', nameUz: 'Hushning yo\'qolishi', nameRu: 'Потеря сознания', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: true },
    { code: 'SYM-EPI-003', nameUz: 'Tutqanoqdan keyin chalkashlik', nameRu: 'Постиктальная спутанность', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-EPI-004', nameUz: 'Tilni tishlab olish', nameRu: 'Прикусывание языка', category: 'nevrologik', bodyZone: 'og\'iz', isRedFlag: false },
  ],
  'kop-skleroz-g35': [
    { code: 'SYM-MS-001', nameUz: 'Oyoqda kuchsizlik', nameRu: 'Слабость в ногах', category: 'nevrologik', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-MS-002', nameUz: 'Ko\'rish buzilishi (nevrit)', nameRu: 'Нарушение зрения (неврит)', category: 'nevrologik', bodyZone: 'ko\'z', isRedFlag: true },
    { code: 'SYM-MS-003', nameUz: 'Sezuvchanlik buzilishi', nameRu: 'Нарушение чувствительности', category: 'nevrologik', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-MS-004', nameUz: 'Muvozanat muammolari', nameRu: 'Нарушение координации', category: 'nevrologik', bodyZone: undefined, isRedFlag: false },
  ],
  'parkinson-kasalligi-g20': [
    { code: 'SYM-PRK-001', nameUz: 'Dam olishda qaltirash', nameRu: 'Тремор покоя', category: 'nevrologik', bodyZone: 'qo\'l', isRedFlag: false },
    { code: 'SYM-PRK-002', nameUz: 'Mushaklar qotilib qolishi', nameRu: 'Мышечная ригидность', category: 'nevrologik', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-PRK-003', nameUz: 'Harakatlar sekinlashishi', nameRu: 'Брадикинезия', category: 'nevrologik', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-PRK-004', nameUz: 'Muvozanat buzilishi', nameRu: 'Постуральная нестабильность', category: 'nevrologik', bodyZone: undefined, isRedFlag: false },
  ],
  'altsgeymer-kasalligi-g30': [
    { code: 'SYM-ALZ-001', nameUz: 'So\'nggi voqealar xotirasining yo\'qolishi', nameRu: 'Нарушение краткосрочной памяти', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-ALZ-002', nameUz: 'Yo\'lini topa olmaslik', nameRu: 'Дезориентация в пространстве', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: true },
    { code: 'SYM-ALZ-003', nameUz: 'Shaxsiyat o\'zgarishi', nameRu: 'Изменения личности', category: 'psixik', bodyZone: 'bosh', isRedFlag: false },
  ],
  'depressiya-f32': [
    { code: 'SYM-DEP-001', nameUz: 'Kayfiyatning doimiy tushkunligi', nameRu: 'Стойкое снижение настроения', category: 'psixik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-DEP-002', nameUz: 'Qiziqish yo\'qolishi', nameRu: 'Потеря интереса', category: 'psixik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-DEP-003', nameUz: 'Uyqu buzilishi', nameRu: 'Нарушение сна', category: 'psixik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-DEP-004', nameUz: 'O\'z-o\'ziga zarar yetkazish fikrlari', nameRu: 'Суицидальные мысли', category: 'psixik', bodyZone: 'bosh', isRedFlag: true },
  ],
  'revmatoid-artrit-m05': [
    { code: 'SYM-RA-001', nameUz: 'Bo\'g\'imlarning simmetrik yallig\'lanishi', nameRu: 'Симметричное воспаление суставов', category: 'tayanch', bodyZone: 'qo\'l', isRedFlag: false },
    { code: 'SYM-RA-002', nameUz: 'Ertalabki qotish (30 daqiqadan ortiq)', nameRu: 'Утренняя скованность', category: 'tayanch', bodyZone: 'qo\'l', isRedFlag: false },
    { code: 'SYM-RA-003', nameUz: 'Barmoqlar bo\'g\'imida shish', nameRu: 'Отёк мелких суставов кистей', category: 'tayanch', bodyZone: 'qo\'l', isRedFlag: false },
    { code: 'SYM-RA-004', nameUz: 'Kuchli charchash', nameRu: 'Выраженная усталость', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
  ],
  'koksartroz-m16': [
    { code: 'SYM-COX-001', nameUz: 'Son-chanoq bo\'g\'imida og\'riq', nameRu: 'Боль в тазобедренном суставе', category: 'tayanch', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-COX-002', nameUz: 'Harakat chegaralanishi', nameRu: 'Ограничение движений', category: 'tayanch', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-COX-003', nameUz: 'Oqsash', nameRu: 'Хромота', category: 'tayanch', bodyZone: 'oyoq', isRedFlag: false },
  ],
  'bel-oghrigi-m54': [
    { code: 'SYM-LBP-001', nameUz: 'Bel sohasida og\'riq', nameRu: 'Боль в пояснице', category: 'tayanch', bodyZone: 'bel', isRedFlag: false },
    { code: 'SYM-LBP-002', nameUz: 'Oyoqqa tarqaluvchi og\'riq (isk. nerv)', nameRu: 'Иррадиация боли в ногу', category: 'nevrologik', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-LBP-003', nameUz: 'Egilishda qiyinchilik', nameRu: 'Затруднение при наклоне', category: 'tayanch', bodyZone: 'bel', isRedFlag: false },
    { code: 'SYM-LBP-004', nameUz: 'Oyoq uchida sezuvchanlik kamayishi', nameRu: 'Онемение стоп', category: 'nevrologik', bodyZone: 'oyoq', isRedFlag: true },
  ],
  'podagra-m10': [
    { code: 'SYM-GOU-001', nameUz: 'Bosh barmoq bo\'g\'imida o\'tkir og\'riq', nameRu: 'Острая боль в суставе большого пальца', category: 'tayanch', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-GOU-002', nameUz: 'Bo\'g\'im qizarishi va shishi', nameRu: 'Покраснение и отёк сустава', category: 'tayanch', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-GOU-003', nameUz: 'Kechasi kuchayuvchi og\'riq', nameRu: 'Ночное усиление боли', category: 'tayanch', bodyZone: 'oyoq', isRedFlag: false },
  ],
  'osteoporoz-m81': [
    { code: 'SYM-OST-001', nameUz: 'Umurtqa suyaklari sinishi', nameRu: 'Переломы позвонков', category: 'tayanch', bodyZone: 'bel', isRedFlag: true },
    { code: 'SYM-OST-002', nameUz: 'Bo\'y qisqarishi', nameRu: 'Снижение роста', category: 'tayanch', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-OST-003', nameUz: 'Orqa va bel og\'rig\'i', nameRu: 'Боль в спине и пояснице', category: 'tayanch', bodyZone: 'bel', isRedFlag: false },
  ],
  'surunkali-buyrak-kasalligi-n18': [
    { code: 'SYM-CKD-001', nameUz: 'Shish (ayniqsa ko\'z va oyoq)', nameRu: 'Отёки (лицо, ноги)', category: 'siydik', bodyZone: 'oyoq', isRedFlag: false },
    { code: 'SYM-CKD-002', nameUz: 'Siydik miqdorining kamayishi', nameRu: 'Снижение диуреза', category: 'siydik', bodyZone: undefined, isRedFlag: true },
    { code: 'SYM-CKD-003', nameUz: 'Charchash va zaiflik', nameRu: 'Усталость и слабость', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-CKD-004', nameUz: 'Qon bosimi ko\'tarilishi', nameRu: 'Повышение АД', category: 'kardial', bodyZone: undefined, isRedFlag: false },
  ],
  'siydik-yoli-infeksiyasi-n39': [
    { code: 'SYM-UTI-001', nameUz: 'Siydik chiqarishda achishish', nameRu: 'Жжение при мочеиспускании', category: 'siydik', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-UTI-002', nameUz: 'Tez-tez siydik chiqarish', nameRu: 'Учащённое мочеиспускание', category: 'siydik', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-UTI-003', nameUz: 'Qorin pastida og\'riq', nameRu: 'Боль внизу живота', category: 'siydik', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-UTI-004', nameUz: 'Loyqa siydik', nameRu: 'Мутная моча', category: 'siydik', bodyZone: undefined, isRedFlag: false },
  ],
  'buyrak-toshi-n20': [
    { code: 'SYM-KLS-001', nameUz: 'Bel sohasida o\'tkir og\'riq (buyrak sancha)', nameRu: 'Острая боль в пояснице (почечная колика)', category: 'siydik', bodyZone: 'bel', isRedFlag: true },
    { code: 'SYM-KLS-002', nameUz: 'Siydikda qon', nameRu: 'Кровь в моче (гематурия)', category: 'siydik', bodyZone: undefined, isRedFlag: true },
    { code: 'SYM-KLS-003', nameUz: 'Og\'riq siydik yo\'li bo\'ylab tarqalishi', nameRu: 'Иррадиация боли по ходу мочеточника', category: 'siydik', bodyZone: 'qorin', isRedFlag: false },
  ],
  'nefrotik-sindrom-n04': [
    { code: 'SYM-NFT-001', nameUz: 'Kuchli shish', nameRu: 'Выраженные отёки', category: 'siydik', bodyZone: 'oyoq', isRedFlag: true },
    { code: 'SYM-NFT-002', nameUz: 'Ko\'pikli siydik (oqsilsizlanish)', nameRu: 'Пенистая моча', category: 'siydik', bodyZone: undefined, isRedFlag: true },
    { code: 'SYM-NFT-003', nameUz: 'Qorin bo\'shlig\'ida suv to\'planishi', nameRu: 'Асцит', category: 'siydik', bodyZone: 'qorin', isRedFlag: true },
  ],
  'temir-tanqisligi-anemiya-d50': [
    { code: 'SYM-IDA-001', nameUz: 'Havorang rangparlik', nameRu: 'Бледность кожных покровов', category: 'umumiy', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-IDA-002', nameUz: 'Charchash va holsizlik', nameRu: 'Слабость и утомляемость', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-IDA-003', nameUz: 'Bosh aylanishi', nameRu: 'Головокружение', category: 'nevrologik', bodyZone: 'bosh', isRedFlag: false },
    { code: 'SYM-IDA-004', nameUz: 'Soch to\'kilishi', nameRu: 'Выпадение волос', category: 'teri', bodyZone: 'teri', isRedFlag: false },
  ],
  'qon-ivishi-buzilishi-d68': [
    { code: 'SYM-COP-001', nameUz: 'Uzun davom etuvchi qon ketish', nameRu: 'Длительное кровотечение', category: 'qon', bodyZone: undefined, isRedFlag: true },
    { code: 'SYM-COP-002', nameUz: 'Teri ostida ko\'k dog\'lar', nameRu: 'Гематомы на коже', category: 'teri', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-COP-003', nameUz: 'Bo\'g\'imlarda qon yig\'ilishi', nameRu: 'Гемартроз', category: 'tayanch', bodyZone: undefined, isRedFlag: true },
  ],
  'atopik-dermatit-l20': [
    { code: 'SYM-ATD-001', nameUz: 'Qichishish (ayniqsa kechasi)', nameRu: 'Зуд (особенно ночью)', category: 'teri', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-ATD-002', nameUz: 'Teri quruqligi va qizarishi', nameRu: 'Сухость и покраснение кожи', category: 'teri', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-ATD-003', nameUz: 'Teri yorilishi', nameRu: 'Трещины кожи', category: 'teri', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-ATD-004', nameUz: 'Pufakchalar hosil bo\'lishi', nameRu: 'Везикулы на коже', category: 'teri', bodyZone: 'teri', isRedFlag: false },
  ],
  'psoriaz-l40': [
    { code: 'SYM-PSR-001', nameUz: 'Kumush rangli tangachali qizil dog\'lar', nameRu: 'Красные бляшки с серебристыми чешуйками', category: 'teri', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-PSR-002', nameUz: 'Tirsak va tizza sohasida toshmalar', nameRu: 'Сыпь на локтях и коленях', category: 'teri', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-PSR-003', nameUz: 'Qichishish va achishish', nameRu: 'Зуд и жжение', category: 'teri', bodyZone: 'teri', isRedFlag: false },
  ],
  'eshakemi-l50': [
    { code: 'SYM-URT-001', nameUz: 'Qizil, ko\'tarinki toshmalar', nameRu: 'Красные припухшие высыпания', category: 'teri', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-URT-002', nameUz: 'Kuchli qichishish', nameRu: 'Интенсивный зуд', category: 'teri', bodyZone: 'teri', isRedFlag: false },
    { code: 'SYM-URT-003', nameUz: 'Angioedema (og\'iz, ko\'z atrofi shishi)', nameRu: 'Отёк Квинке', category: 'teri', bodyZone: 'yuz', isRedFlag: true },
  ],
  'katarakta-h25': [
    { code: 'SYM-CAT-001', nameUz: 'Ko\'rish xiralashishi', nameRu: 'Помутнение зрения', category: 'ko\'z', bodyZone: 'ko\'z', isRedFlag: false },
    { code: 'SYM-CAT-002', nameUz: 'Yorug\'likda ko\'rish yomonlashishi', nameRu: 'Ухудшение зрения на свету', category: 'ko\'z', bodyZone: 'ko\'z', isRedFlag: false },
    { code: 'SYM-CAT-003', nameUz: 'Ikki ko\'rinish', nameRu: 'Двоение в глазах', category: 'ko\'z', bodyZone: 'ko\'z', isRedFlag: false },
  ],
  'glaukoma-h40': [
    { code: 'SYM-GLC-001', nameUz: 'Ko\'rish maydoni torayishi', nameRu: 'Сужение поля зрения', category: 'ko\'z', bodyZone: 'ko\'z', isRedFlag: true },
    { code: 'SYM-GLC-002', nameUz: 'Ko\'z og\'rig\'i (o\'tkir tuturuqlashda)', nameRu: 'Боль в глазу при остром приступе', category: 'ko\'z', bodyZone: 'ko\'z', isRedFlag: true },
    { code: 'SYM-GLC-003', nameUz: 'Nur atrofida rang doiralari ko\'rish', nameRu: 'Радужные круги вокруг источников света', category: 'ko\'z', bodyZone: 'ko\'z', isRedFlag: false },
  ],
  'sil-kasalligi-a15': [
    { code: 'SYM-TBC-001', nameUz: '3 haftadan ortiq yo\'tal', nameRu: 'Кашель более 3 недель', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: true },
    { code: 'SYM-TBC-002', nameUz: 'Kechasi ter bosishi', nameRu: 'Ночная потливость', category: 'umumiy', bodyZone: undefined, isRedFlag: true },
    { code: 'SYM-TBC-003', nameUz: 'Vazn yo\'qotish', nameRu: 'Потеря веса', category: 'umumiy', bodyZone: undefined, isRedFlag: true },
    { code: 'SYM-TBC-004', nameUz: 'Past harorat (subfebrilitet)', nameRu: 'Субфебрилитет', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-TBC-005', nameUz: 'Qon aralash yo\'tal', nameRu: 'Кровохарканье', category: 'nafas', bodyZone: 'ko\'krak', isRedFlag: true },
  ],
  'viral-gepatit-b19': [
    { code: 'SYM-HEP-001', nameUz: 'Sariqlik (teri, ko\'z skleri)', nameRu: 'Желтуха (кожа, склеры)', category: 'hazm', bodyZone: 'teri', isRedFlag: true },
    { code: 'SYM-HEP-002', nameUz: 'O\'ng qovurg\'a osti og\'rig\'i', nameRu: 'Боль в правом подреберье', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-HEP-003', nameUz: 'Jigar kattalashishi', nameRu: 'Увеличение печени', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-HEP-004', nameUz: 'Jiringli siydik', nameRu: 'Тёмная моча', category: 'siydik', bodyZone: undefined, isRedFlag: true },
  ],
  'vabo-a00': [
    { code: 'SYM-CHL-001', nameUz: 'Juda kuchli ich ketishi (suv ko\'rinishida)', nameRu: 'Профузная водянистая диарея', category: 'hazm', bodyZone: 'qorin', isRedFlag: true },
    { code: 'SYM-CHL-002', nameUz: 'Qayt qilish', nameRu: 'Рвота', category: 'hazm', bodyZone: 'qorin', isRedFlag: true },
    { code: 'SYM-CHL-003', nameUz: 'Tez degidratsiya', nameRu: 'Быстрое обезвоживание', category: 'umumiy', bodyZone: undefined, isRedFlag: true },
    { code: 'SYM-CHL-004', nameUz: 'Mushaklarda qoqshol', nameRu: 'Судороги мышц', category: 'nevrologik', bodyZone: undefined, isRedFlag: true },
  ],
  'ich-ketish-kasalligi-a09': [
    { code: 'SYM-DRH-001', nameUz: 'Ich ketishi', nameRu: 'Диарея', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-DRH-002', nameUz: 'Qorin og\'rig\'i va ko\'ngil aynashi', nameRu: 'Боль в животе и тошнота', category: 'hazm', bodyZone: 'qorin', isRedFlag: false },
    { code: 'SYM-DRH-003', nameUz: 'Harorat ko\'tarilishi', nameRu: 'Повышение температуры', category: 'umumiy', bodyZone: undefined, isRedFlag: false },
    { code: 'SYM-DRH-004', nameUz: 'Susayish (degidratsiya)', nameRu: 'Обезвоживание', category: 'umumiy', bodyZone: undefined, isRedFlag: true },
  ],
};

// ── L1 blok shablonlari ────────────────────────────────────────────────────────

const BLOCKS: BlockDef[] = [
  {
    marker: 'definition',
    label: 'Ta\'rif',
    orderIndex: 0,
    content: (d) => `## Ta'rif\n\n**${d.nameUz}** (lot. *${d.nameLat}*, ICD-10: **${d.icd10}**) — surunkali yoki o'tkir kechadigan kasallik bo'lib, O'zbekistonda keng tarqalgan tibbiy muammolardan biri hisoblanadi. Kasallik o'z vaqtida aniqlanib, to'g'ri davolansa, yuqori hayot sifatini ta'minlash mumkin.`,
  },
  {
    marker: 'symptoms',
    label: 'Belgilar',
    orderIndex: 1,
    content: (d) => `## Asosiy belgilar\n\n${d.nameUz} kasalligida quyidagi belgilar kuzatilishi mumkin:\n\n- **Dastlabki belgilar**: kasallik boshida odatda yengil va e'tiborsiz alomatlar namoyon bo'ladi\n- **Asosiy shikoyatlar**: bemorlar aksariyat holda o'ziga xos diskomfort va funksiya buzilishini qayd etadi\n- **Og'ir holatlarda**: kasallik avj olgan bosqichda a'zo yoki tizim ishlashi keskin yomonlashishi mumkin\n\nBelgilar intensivligi kasallik bosqichi, bemorning yoshi va qo'shimcha kasalliklarga bog'liq holda farqlanadi.`,
  },
  {
    marker: 'etiology',
    label: 'Sabablari',
    orderIndex: 2,
    content: (d) => `## Sabablari\n\n${d.nameUz} kasalligining rivojlanishiga bir qancha omillar sabab bo'ladi:\n\n- **Irsiy moyillik**: oilaviy anamnezda kasallik mavjudligi xavfni oshiradi\n- **Hayot tarzi**: noto'g'ri ovqatlanish, harakat yetishmasligi va stres muhim rol o'ynaydi\n- **Atrof-muhit omillari**: iflos havo, kimyoviy ta'sir va biologik agentlar kasallikni qo'zg'atishi mumkin\n- **Yosh va jins**: ayrim kasalliklar ma'lum yosh guruhi yoki jinsda ko'proq uchraydi`,
  },
  {
    marker: 'treatment',
    label: 'Davolash',
    orderIndex: 3,
    content: (d) => `## Davolash\n\n${d.nameUz} kasalligini davolash kompleks yondashuvni talab etadi:\n\n- **Dori-darmon**: shifokor tomonidan belgilangan dorilar qat'iy tartibda qabul qilinishi lozim\n- **Hayot tarzini o'zgartirish**: to'g'ri ovqatlanish, muntazam jismoniy faollik va stressni kamaytirish\n- **Nazorat**: muntazam shifokor ko'rigidan o'tish va tahlillar topshirish davolash samaradorligini oshiradi\n- **Asoratlarni oldini olish**: erta bosqichda boshlangan davolash og'ir asoratlarning rivojlanishini oldini oladi`,
  },
  {
    marker: 'red_flags',
    label: 'Qachon tezda shifokorga murojaat qilish kerak',
    orderIndex: 4,
    content: (d) => `## Qachon tezda shifokorga murojaat qilish kerak\n\n${d.nameUz} kasalligida quyidagi holatlarda **darhol** tibbiy yordam so'rash kerak:\n\n- Belgilar to'satdan kuchaysa yoki yangi, notanish alomatlar paydo bo'lsa\n- Nafas olish qiyinlashsa yoki ko'krakda og'riq bo'lsa\n- Hush yo'qotilsa yoki kuchli bosh aylanishi kuzatilsa\n- Dori qabul qilib, holat yaxshilanmasa\n\n**Eslatma**: O'z vaqtida murojaat qilish hayotingizni saqlab qolishi mumkin.`,
  },
];

// ── Yordamchi funksiya: mavjud bo'lmagan simptomlarnigina upsert qilish ─────

async function upsertSymptom(s: SymptomTemplate): Promise<string> {
  const record = await prisma.symptom.upsert({
    where: { code: s.code },
    update: {},
    create: {
      code: s.code,
      nameUz: s.nameUz,
      nameRu: s.nameRu,
      category: s.category,
      bodyZone: s.bodyZone ?? null,
      isRedFlag: s.isRedFlag,
      severity: 'MILD',
    },
  });
  return record.id;
}

// ── Asosiy seed funksiyasi ────────────────────────────────────────────────────

async function seedDiseases(): Promise<void> {
  const dataPath = path.join(__dirname, '..', 'prisma', 'seeds', 'icd10-top50.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const diseases: SeedDisease[] = JSON.parse(raw) as SeedDisease[];

  console.log(`Seed boshlanmoqda: ${diseases.length} ta kasallik...`);

  let created = 0;
  let skipped = 0;

  for (const d of diseases) {
    // 1. Disease upsert
    const disease = await prisma.disease.upsert({
      where: { slug: d.slug },
      update: {
        nameUz: d.nameUz,
        nameRu: d.nameRu,
        nameLat: d.nameLat,
        synonyms: d.synonyms,
      },
      create: {
        slug: d.slug,
        icd10: d.icd10,
        nameUz: d.nameUz,
        nameRu: d.nameRu,
        nameLat: d.nameLat,
        synonyms: d.synonyms,
        category: d.categorySlug,
        audienceLevels: [AudienceMode.PATIENT],
        severityLevels: [],
        status: ApprovalStatus.PUBLISHED,
      },
    });

    // 2. DiseaseBlock upsert (5 ta blok)
    for (const blk of BLOCKS) {
      await prisma.diseaseBlock.upsert({
        where: {
          diseaseId_marker: {
            diseaseId: disease.id,
            marker: blk.marker,
          },
        },
        update: {
          contentMd: blk.content(d),
          label: blk.label,
        },
        create: {
          diseaseId: disease.id,
          marker: blk.marker,
          label: blk.label,
          orderIndex: blk.orderIndex,
          level: ContentLevel.L1,
          contentMd: blk.content(d),
          evidenceLevel: EvidenceLevel.C,
          status: ApprovalStatus.PUBLISHED,
          publishedAt: new Date(),
          audiencePriority: { patient: 1 },
          translationStatusUz: 'VERIFIED',
          translationStatusRu: 'PENDING',
          translationStatusEn: 'PENDING',
        },
      });
    }

    // 3. Symptom va DiseaseSymptom upsert
    const symTemplates = DISEASE_SYMPTOMS[d.slug] ?? [];
    for (const st of symTemplates) {
      const symptomId = await upsertSymptom(st);
      await prisma.diseaseSymptom.upsert({
        where: {
          diseaseId_symptomId: {
            diseaseId: disease.id,
            symptomId,
          },
        },
        update: {},
        create: {
          diseaseId: disease.id,
          symptomId,
          weight: st.isRedFlag ? 1.5 : 1.0,
          isRequired: false,
          isExcluding: false,
        },
      });
    }

    const isNew = !disease.createdAt || (new Date().getTime() - new Date(disease.createdAt).getTime() < 5000);
    if (isNew) {
      created++;
    } else {
      skipped++;
    }

    process.stdout.write(`  [OK] ${d.icd10.padEnd(8)} ${d.nameUz}\n`);
  }

  console.log(`\nSeed yakunlandi:`);
  console.log(`  Kasalliklar: ${diseases.length}`);
  console.log(`  Bloklar (max): ${diseases.length * BLOCKS.length}`);
  console.log(`  Simptomlar: ${Object.values(DISEASE_SYMPTOMS).flat().length}`);
}

// ── Ishga tushirish ────────────────────────────────────────────────────────────

seedDiseases()
  .catch((e) => {
    console.error('Seed xatosi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
