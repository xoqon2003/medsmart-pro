/**
 * Disease KB — Seed fixtures
 * 5 to'liq kasallik (L1 + L2 bloklar) + 20 metadata stub
 *
 * Har kasallik uchun quyidagi L1 bloklar MAJBURIY:
 *   generalInfo · clinicalSigns · whenToSeeDoctor
 *   doNot · recommended · prevention
 */

// ── Tip ta'riflari ────────────────────────────────────────────────────────────

export interface BlockFixture {
  marker: string;
  label: string;
  level: 'L1' | 'L2' | 'L3';
  orderIndex: number;
  contentMd: string;
  evidenceLevel: 'A' | 'B' | 'C';
}

export interface SymptomFixture {
  code: string;
  nameUz: string;
  category: string;
  bodyZone?: string;
  isRedFlag: boolean;
  weight: number;
  isRequired: boolean;
  isExcluding: boolean;
}

export interface DiseaseFixture {
  slug: string;
  icd10: string;
  nameUz: string;
  nameRu?: string;
  nameEn?: string;
  nameLat?: string;
  synonyms: string[];
  category: string;
  protocolSources: string[];
  blocks: BlockFixture[];
  symptoms: SymptomFixture[];
}

export interface StubFixture {
  slug: string;
  icd10: string;
  nameUz: string;
  nameRu?: string;
  category: string;
}

// ── 1. MIGREN ─────────────────────────────────────────────────────────────────

export const migren: DiseaseFixture = {
  slug: 'migren',
  icd10: 'G43.9',
  nameUz: 'Migren',
  nameRu: 'Мигрень',
  nameEn: 'Migraine',
  nameLat: 'Migraena',
  synonyms: ['Bosh og\'riq', 'Gemikraniya'],
  category: 'nevrologiya',
  protocolSources: ['WHO ICD-10', 'IHS Classification ICHD-3 (2018)'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Migren nima?

Migren — tomir kelib chiqishli **neyrologik kasallik** bo'lib, odatda boshning bir tomonida kuchli, pulsatsiyali og'riq bilan namoyon bo'ladi. Og'riq 4 soatdan 72 soatgacha davom etishi mumkin va ko'ngil aynashi, yorug'lik hamda shovqinga sezgirlik bilan birga keladi.

Jahon aholisining taxminan **12–15%** migrendan aziyat chekadi. Ayollarda erkaklaiga nisbatan 3 barobar ko'p uchraydi.

> 💡 **Buni biling**: Migren — oddiy bosh og'riqdan farqli, alohida kasallik. U davolanishi va oldini olish mumkin.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Migren belgilari

**Asosiy belgilar:**
- 🔴 Boshning **bir tomonida** kuchli, pulsatsiyali og'riq
- 🤢 Ko'ngil aynashi yoki qusish
- 👁️ Yorug'likdan bezovtalanish (fotofobiya)
- 👂 Shovqindan bezovtalanish (sonofobiya)
- Jismoniy faoliyat og'riqni kuchaytiradi

**Aura belgilari (har 3 ta bemordan 1 tasida):**
- Ko'rish buzilishi (yaltiroq nuqtalar, chiziqlar)
- Qo'l yoki yuzda uvishish
- Gapirishda qiyinchilik

**Migren fazalari:**
1. **Prodrom** (1–2 kun oldin): charchash, kayfiyat o'zgarishi, ovqatga ishtaha
2. **Aura** (30 daqiqa): ko'rish/his qilish o'zgarishi
3. **Og'riq** (4–72 soat): asosiy hujum
4. **Postdrom**: charchash, miyaning "tutqazib qolish" hissi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon shifokorga borish kerak?

### ⚠️ DARHOL tez yordam chaqiring:
- "Hayotimdagi eng kuchli bosh og'riq" (momaqaldiroq bosh og'riq)
- Bosh og'riq birinchi marta paydo bo'ldi va juda kuchli
- Bosh og'riq isitma, bo'yin tarangligi bilan birga
- Nutq buzilishi, yuz asimmetriyasi, qo'l-oyoq zaif bo'lsa
- Ko'rish keskin yo'qolsa

### 📅 Tez murojaat qiling (1–2 kun ichida):
- Oy davomida 4 dan ortiq migren hujumi
- Dori 2 kundan ortiq yordam bermasa
- Og'riq intensivligi ortib borsa
- Yangi turdagi bosh og'riq paydo bo'lsa`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Migrenda nima qilmaslik kerak

- ❌ **Og'riq qoldiruvchi dorilarni kunora ichish** — "dori bosh og'rig'i" rivojlanadi
- ❌ Hujum paytida **yorug' va shovqinli joyda qolish**
- ❌ **Ko'p kofe ichish** — boshlanganda yordam bersa ham, keyinchalik hujumni keltirib chiqaradi
- ❌ **Nazorat qilmasdan aspartam, MSG** (ta'am kuchaytiruvchi) iste'mol qilish
- ❌ Uyqu rejimini **buzish** (kam uxlash ham, ko'p uxlash ham hujumni qo'zg'atadi)
- ❌ Shifokorning ruxsatisiz **hormonal kontratseptiv** qabul qilish (aurasiz migrenga)`,
      evidenceLevel: 'B',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Migrenda nima qilish kerak

- ✅ **Hujum daftarini yuritish**: vaqti, davomiyligi, qo'zg'atuvchi omillar, dorining samarasi
- ✅ Hujum boshlanishida **tinch, qorong'i xonaga kirish** va dam olish
- ✅ **Sovuq yoki issiq kompress** — qaysi biri yordam berishini sinab ko'ring
- ✅ Shifokor tayinlagan **triptanlarni** hujum boshlanishida darhol qabul qilish
- ✅ **Doimiy uyqu rejimi** — ish kunlari va dam olish kunlarida bir xil uxlash vaqti
- ✅ **Suv ichish** — kuniga kamida 1.5–2 litr
- ✅ Uzoq vaqt **ovqat yemamaslik**dan qoching`,
      evidenceLevel: 'B',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Migren hujumlarini oldini olish

**Trigerlarni aniqlash va oldini olish:**
- 🍷 Qizil vino, pishloq, shokolad, qaynoq go'sht mahsulotlari
- ☀️ Yorqin va miltillovchi yorug'lik
- 😰 Stress va stress'dan keyin dam olish
- ☕ Kofe miqdorini keskin kamaytirish/ko'paytirish
- 🌡️ Ob-havo o'zgarishi

**Profilaktik dorilar (shifokor tayinlaydi):**
- Beta-blokatorlar (propranolol, metoprolol)
- Valproat kislota
- Topimat
- Amitriptillin

**Hayot tarzi:**
- Muntazam jismoniy faoliyat (haftada 3 marta 30 daqiqa)
- Stressni boshqarish: meditatsiya, nafas mashqlari
- Uyqu gigiena`,
      evidenceLevel: 'A',
    },
    {
      marker: 'etiology', label: 'Sabablar', level: 'L2', orderIndex: 6,
      contentMd: `## Migren sabablari

**Patofiziolojik mexanizm:**
Migren patogenezining zamonaviy nazariyasi — **kortikal yoyiluvchi depressiya (CSD)** va **trigemino-vaskular aktivatsiya**. Neyrogen yallig'lanish va miya qon tomirlarining kengayishi og'riqni keltirib chiqaradi.

**Genetik omillar:**
- Birinchi darajali qarindoshlarida migren bo'lganlar uchun risk 3–4 barobar yuqori
- FHM (familial hemiplegic migraine) — CACNA1A, ATP1A2, SCN1A genlari mutatsiyasi

**Qo'zg'atuvchi omillar (trigger):**
| Guruh | Misollar |
|---|---|
| Ovqat-ichimlik | Qizil vino, pishloq, shokolad, kofe (keskin kamaytirish) |
| Gormonal | Menstruatsiya, kontratseptivlar, homiladorlik |
| Ekologik | Yorqin yorug', kuchli hid, havo bosimi o'zgarishi |
| Psixologik | Stress, tashvish, depressiya |
| Fiziologik | Kam uyqu, ovqat o'tkazib yuborish, dehidratatsiya |`,
      evidenceLevel: 'A',
    },
    {
      marker: 'treatment', label: 'Davolash', level: 'L2', orderIndex: 7,
      contentMd: `## Migrenda davolash

**Hujumni to'xtatish (abortiv terapiya):**

*Engil-o'rta hujum:*
- Ibuprofen 400–600 mg yoki Aspirin 1000 mg (og'riq boshlanishida)
- Paracetamol 1000 mg (ibuprofen ko'tarmasa)
- Antiemetik (metoklopramid) — ko'ngil aynashiga

*Kuchli hujum:*
- **Triptanlar**: Sumatriptan 50–100 mg per os / 6 mg s.c., Rizatriptan 10 mg
- Ergotaminlar (triptanlar ishlamasa)

**Profilaktik terapiya indikatsiyalari:**
- Oyiga ≥ 4 hujum
- Hujum ≥ 12 soat davom etsa
- Abortiv dorilar samarasiz
- Aura bilan migren (stroke riski)

*Profilaktik dorilar:* Propranolol 40–120 mg/kun, Valproat 500–1500 mg/kun, Topimat 25–100 mg/kun`,
      evidenceLevel: 'A',
    },
  ],
  symptoms: [
    { code: 'UNILATERAL_HEADACHE', nameUz: 'Bir tomonlama bosh og\'riq', category: 'nevrologik', bodyZone: 'head', isRedFlag: false, weight: 0.9, isRequired: true, isExcluding: false },
    { code: 'PULSATING_PAIN', nameUz: 'Pulsatsiyali og\'riq', category: 'nevrologik', bodyZone: 'head', isRedFlag: false, weight: 0.85, isRequired: false, isExcluding: false },
    { code: 'NAUSEA', nameUz: 'Ko\'ngil aynashi', category: 'umumiy', isRedFlag: false, weight: 0.7, isRequired: false, isExcluding: false },
    { code: 'PHOTOPHOBIA', nameUz: 'Yorug\'likdan bezovtalanish', category: 'nevrologik', bodyZone: 'head', isRedFlag: false, weight: 0.75, isRequired: false, isExcluding: false },
    { code: 'PHONOPHOBIA', nameUz: 'Shovqindan bezovtalanish', category: 'nevrologik', isRedFlag: false, weight: 0.7, isRequired: false, isExcluding: false },
    { code: 'AURA_VISUAL', nameUz: 'Ko\'rish aurasi (yaltiroq nuqtalar)', category: 'nevrologik', bodyZone: 'head', isRedFlag: false, weight: 0.6, isRequired: false, isExcluding: false },
    { code: 'VOMITING', nameUz: 'Qayt qilish', category: 'umumiy', isRedFlag: false, weight: 0.5, isRequired: false, isExcluding: false },
    { code: 'THUNDERCLAP_HEADACHE', nameUz: 'Momaqaldiroq bosh og\'riq', category: 'nevrologik', bodyZone: 'head', isRedFlag: true, weight: 0.3, isRequired: false, isExcluding: false },
  ],
};

// ── 2. GIPERTONIYA ────────────────────────────────────────────────────────────

export const gipertoniya: DiseaseFixture = {
  slug: 'gipertoniya',
  icd10: 'I10',
  nameUz: 'Arterial gipertoniya',
  nameRu: 'Артериальная гипертензия',
  nameEn: 'Essential Hypertension',
  nameLat: 'Hypertonia arterialis',
  synonyms: ['Qon bosimi balandligi', 'Gipertenziya', 'Qon bosimi'],
  category: 'kardiologiya',
  protocolSources: ['ESC/ESH Guidelines 2023', 'WHO Global Status Report'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Arterial gipertoniya nima?

Arterial gipertoniya — qon bosimining **sistematik ravishda yuqori bo'lishi** (≥140/90 mm Hg). "Jim qotil" nomi bilan mashhur — ko'p yillар hech qanday belgi bermay rivojlanadi.

**Jahon statistikasi:** 30 yoshdan katta aholining 30–45% gipertoniyadan aziyat chekadi.

**Qon bosimi meyorlari:**
| Daraja | Sistolik | Diastolik |
|---|---|---|
| Optimal | < 120 | < 80 |
| Normal | 120–129 | 80–84 |
| Yuqori normal | 130–139 | 85–89 |
| 1-daraja gipertoniya | 140–159 | 90–99 |
| 2-daraja gipertoniya | 160–179 | 100–109 |
| 3-daraja gipertoniya | ≥ 180 | ≥ 110 |`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Gipertoniya belgilari

**Ko'pincha hech qanday belgi bo'lmaydi!** Shuning uchun muntazam qon bosimini o'lchash zarur.

**Ba'zan uchraydigan belgilar:**
- 🤕 Ensa sohasida og'riq yoki bosim hissi
- 😵 Bosh aylanishi
- 👁️ Ko'z oldida "moshak" ko'rinishi
- 🔴 Yuz qizarishi
- 💓 Yurak urishi tezlashishi
- 😴 Charchoq, uyquchanlik
- 👃 Burundan qon ketishi

**Gipertenziv kriz belgilari (XAVFLI):**
- Keskin bosim oshishi (≥180/120)
- Kuchli bosh og'riq
- Ko'rish buzilishi
- Ko'krak og'rig'i, nafas qisilishi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon shifokorga borish kerak?

### 🚨 DARHOL tez yordam (103):
- Qon bosimi ≥ 180/120 va ko'krak og'rig'i, nafas qisilishi
- Qon bosimi ≥ 180/120 va nutq buzilishi, yuz/qo'l falajligi
- Qon bosimi ≥ 180/120 va ko'rish keskin yomonlashdi
- Kuchli bosh og'riq, qayt qilish birga

### 📅 Shifokorga murojaat:
- Birinchi marta qon bosimi 140/90 dan yuqori o'lchansa
- Dori iste'mol qilsangiz ham bosim yuqori bo'lsa
- Oyiga 2–3 martadan ortiq belgilar bo'lsa

### 📊 Profilaktik tekshiruv:
- 40 yoshdan keyin **yiliga kamida 1 marta** qon bosimini o'lchang`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Gipertoniyada nima qilmaslik kerak

- ❌ **Dorilarni o'z-o'zidan to'xtatish** — bosim keskin oshib, infarkt/insult bo'lishi mumkin
- ❌ **Ko'p tuz iste'mol qilish** — kuniga 5 g dan oshirmaslik kerak
- ❌ **Ko'p kofe va kuchli choy** ichish
- ❌ **Spirt ichimliklarini** iste'mol qilish
- ❌ **Qattiq jismoniy zo'riqish** (og'ir yuk ko'tarish, izometrik mashqlar)
- ❌ **Uzoq vaqt sovuqda** turish
- ❌ Qon bosimi o'lchamasdan **dori dozasini o'zgartirish**`,
      evidenceLevel: 'A',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Gipertoniyada nima qilish kerak

- ✅ **Qon bosimini kuniga 2 marta o'lchash** — ertalab va kechqurun, natijalarni yozib borish
- ✅ **Dorilarni vaqtida qabul qilish** — hatto yaxshi his qilsangiz ham
- ✅ **Tuz miqdorini kamaytirish** — tayyor ovqatlarga, konservlarga tuz ko'p qo'shilgan
- ✅ **Sabzavot va mevalar** — kuniga 5 porsiya (kaliyli: banan, kartoshka, tarvuz)
- ✅ **Muntazam yurish** — kuniga 30 daqiqa tez yurish
- ✅ **Normal vazn saqlash** — BMI 18.5–24.9 orasida
- ✅ **Stress boshqaruvi** — nafas mashqlari, meditatsiya`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Gipertoniya oldini olish

**Modifikatsiya qilish mumkin bo'lgan risk omillari:**
- 🧂 Tuz iste'molini kamaytirish (< 5 g/kun)
- 🍺 Spirt ichimliklaridan voz kechish
- 🚬 Chekishni to'xtatish
- ⚖️ Ortiqcha vazn — har 10 kg yo'qotish bosimni 5–10 mm Hg kamaytiradi
- 🏃 Jismoniy faollik — haftada ≥150 daqiqa o'rtacha intensivlik

**DASH dietasi:**
Ko'p: meva, sabzavot, to'liq donli mahsulotlar, past yog'li sut
Kam: tuz, qizil go'sht, shirinliklar, to'yingan yog'lar

**Muntazam monitoring:**
- 40 yoshdan keyin yillik qon bosimi tekshiruvi
- Diabetik bemorlar — har 6 oyda`,
      evidenceLevel: 'A',
    },
  ],
  symptoms: [
    { code: 'HIGH_BLOOD_PRESSURE', nameUz: 'Qon bosimi balandligi', category: 'kardiovaskular', isRedFlag: false, weight: 1.0, isRequired: true, isExcluding: false },
    { code: 'OCCIPITAL_HEADACHE', nameUz: 'Ensa sohasida og\'riq', category: 'nevrologik', bodyZone: 'head', isRedFlag: false, weight: 0.5, isRequired: false, isExcluding: false },
    { code: 'DIZZINESS', nameUz: 'Bosh aylanishi', category: 'nevrologik', bodyZone: 'head', isRedFlag: false, weight: 0.45, isRequired: false, isExcluding: false },
    { code: 'PALPITATIONS', nameUz: 'Yurak urishi tezlashishi', category: 'kardiovaskular', bodyZone: 'chest', isRedFlag: false, weight: 0.4, isRequired: false, isExcluding: false },
    { code: 'HYPERTENSIVE_CRISIS', nameUz: 'Gipertenziv kriz (BP ≥180/120)', category: 'kardiovaskular', isRedFlag: true, weight: 0.8, isRequired: false, isExcluding: false },
    { code: 'CHEST_PAIN', nameUz: 'Ko\'krak og\'rig\'i', category: 'kardiovaskular', bodyZone: 'chest', isRedFlag: true, weight: 0.3, isRequired: false, isExcluding: false },
  ],
};

// ── 3. GASTRIT ────────────────────────────────────────────────────────────────

export const gastrit: DiseaseFixture = {
  slug: 'gastrit',
  icd10: 'K29.7',
  nameUz: 'Gastrit',
  nameRu: 'Гастрит',
  nameEn: 'Gastritis',
  nameLat: 'Gastritis',
  synonyms: ['Oshqozon yallig\'lanishi', 'Qorin og\'rig\'i'],
  category: 'gastroenterologiya',
  protocolSources: ['ACG Clinical Guidelines 2022', 'WHO H. pylori management'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Gastrit nima?

Gastrit — oshqozon shilliq qavatining **yallig'lanishi**. O'tkir (to'satdan) yoki surunkali (uzoq davomli) bo'lishi mumkin.

**Asosiy sabab:** Helicobacter pylori bakteriyasi (gastrit holatlarining 70–80%).

**O'zbekistonda:** Aholining taxminan 40–60% H. pylori infektsiyasiga duchor bo'lgan.

**Xavfli omil:** Davolanmagan gastrit **yarani va oshqozon saratoniga** olib kelishi mumkin.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Gastrit belgilari

**Asosiy belgilar:**
- 🤕 Qorinning yuqori qismida og'riq yoki yoqimsiz his (ko'pincha ovqatdan keyin)
- 🤢 Ko'ngil aynashi
- 😮‍💨 Kerish (ko'p havo yutish)
- 😔 Tez to'yish
- 🔥 Qorin to'q bo'lganda ham achishish hissi

**Xavfli belgilar (DARHOL shifokorga):**
- ⚫ Qora, qatronsimon axlat (oshqozon qon ketishi!)
- 🩸 Qayt qilishda qon yoki "kofe quyqusi" ko'rinish
- ⚖️ Sabobsiz vazn yo'qotish
- 😰 Kuchli, to'xtovsiz qorin og'rig'i`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon shifokorga borish kerak?

### 🚨 DARHOL (tez yordam):
- Axlatda qon yoki qora rang
- Qayt qilishda qon
- Kuchli, to'xtovsiz qorin og'rig'i
- Hushdan ketish, juda qattiq zaiflik

### 📅 Shifokorga murojaat:
- Belgilar 2 haftadan ortiq davom etsa
- Og'riq qoldiruvchi dorilor yordam bermasa
- Vazn yo'qotib borayotgan bo'lsangiz
- 45 yoshdan oshgan va birinchi marta bu belgilar bo'lsa`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Gastritda nima qilmaslik kerak

- ❌ **Och qoringa Aspirin, Ibuprofen (NSAID)** qabul qilish
- ❌ **Spirtli ichimliklar** — shilliq qavatni bevosita shikastlaydi
- ❌ **Chekish** — H. pylori infektsiyasini kuchaytiradi
- ❌ **Juda achchiq, kislotali, qovurilgan** taomlar
- ❌ **Kechasi kech ovqatlanish** (uxlashdan 3 soat oldin ovqat yemang)
- ❌ **Shifokor tayinlamasdan antatsid dorilor**ni uzoq vaqt qabul qilish`,
      evidenceLevel: 'B',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Gastritda nima qilish kerak

- ✅ **Kichik porsiyalarda, kuniga 5–6 marta ovqatlanish**
- ✅ **Iliq ovqat** — juda issiq yoki juda sovuq ovqat shilliq qavatni shikastlaydi
- ✅ **Bug'da pishirilgan, qaynatilgan** taomlar
- ✅ **Sabzavot sho'rvalar, bo'tqalar, yogurt**
- ✅ **H. pylori aniqlansa** — shifokor belgilagan antibiotik kursini oxirigacha ichish
- ✅ **Ovqat jadvalini** muntazam saqlash — bir xil vaqtda ovqatlanish`,
      evidenceLevel: 'B',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Gastrit oldini olish

- 🧼 **Qo'l gigiena** — H. pylori fekal-og'iz yo'li bilan tarqaladi
- 🥗 **Sog'lom ovqatlanish**: yangi sabzavot, meva, to'liq donli mahsulotlar
- 💊 **Og'riq qoldiruvchi dorilarni** faqat talab bo'lganda, ovqat bilan qabul qilish
- 🚭 Chekishni to'xtatish
- 🍺 Spirtli ichimliklardan voz kechish
- 😌 **Stress boshqaruvi** — stress oshqozon kislota ishlab chiqarishini oshiradi`,
      evidenceLevel: 'B',
    },
  ],
  symptoms: [
    { code: 'EPIGASTRIC_PAIN', nameUz: 'Qorin yuqori qismida og\'riq', category: 'gastroenterologik', bodyZone: 'abdomen', isRedFlag: false, weight: 0.9, isRequired: true, isExcluding: false },
    { code: 'NAUSEA', nameUz: 'Ko\'ngil aynashi', category: 'umumiy', isRedFlag: false, weight: 0.6, isRequired: false, isExcluding: false },
    { code: 'BLOATING', nameUz: 'Qorin dam bo\'lishi', category: 'gastroenterologik', bodyZone: 'abdomen', isRedFlag: false, weight: 0.55, isRequired: false, isExcluding: false },
    { code: 'BELCHING', nameUz: 'Kerish', category: 'gastroenterologik', bodyZone: 'abdomen', isRedFlag: false, weight: 0.45, isRequired: false, isExcluding: false },
    { code: 'LOSS_OF_APPETITE', nameUz: 'Ishtaha pasayishi', category: 'umumiy', isRedFlag: false, weight: 0.4, isRequired: false, isExcluding: false },
    { code: 'MELENA', nameUz: 'Qora axlat (qon ketish)', category: 'gastroenterologik', isRedFlag: true, weight: 0.3, isRequired: false, isExcluding: false },
  ],
};

// ── 4. PNEVMONIYA ─────────────────────────────────────────────────────────────

export const pnevmoniya: DiseaseFixture = {
  slug: 'pnevmoniya',
  icd10: 'J18.9',
  nameUz: 'Pnevmoniya (o\'pka yallig\'lanishi)',
  nameRu: 'Пневмония',
  nameEn: 'Pneumonia',
  nameLat: 'Pneumonia',
  synonyms: ["O'pka yallig'lanishi", 'Zotiljam'],
  category: 'pulmonologiya',
  protocolSources: ['BTS Guidelines 2023', 'IDSA/ATS Consensus Guidelines'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Pnevmoniya nima?

Pnevmoniya — o'pkaning alveolalari (havo xaltachalari) **infektsion yallig'lanishi**. Bakteriya, virus yoki zamburug' sabab bo'lishi mumkin.

**Og'irligi bo'yicha:** yengil, o'rta og'ir va og'ir shakllar mavjud.

**Yuqori risk guruhlari:** 5 yoshgacha bolalar, 65 yoshdan katta, surunkali kasalliklari bor, immunitet zaif shaxslar.

> ⚠️ Jahon sog'liqni saqlash tashkiloti ma'lumotiga ko'ra, pnevmoniya **bolalar o'limining asosiy sababi** hisoblanadi.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Pnevmoniya belgilari

**Asosiy belgilar:**
- 🌡️ **Isitma** (38°C dan yuqori) — ko'pincha tez ko'tariladi
- 😤 **Nafas qisilishi**, tez-tez nafas olish
- 😮 **Yo'tal** — quruq yoki shilimshiq/qonli balg'am
- 💥 **Ko'krak og'rig'i** — nafas olishda kuchayadi
- 😓 Charchash, kuchsizlik
- 🥵 Terlash, titroq

**Og'ir pnevmoniya belgilari (XAVFLI):**
- Nafas olish ≥ 30/min (tez)
- O'pkada kislorod ≥ 93% bo'lmasa
- Qon bosimi tushishi
- Hushni yo'qotish, chalkashish`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon shifokorga borish kerak?

### 🚨 DARHOL (tez yordam 103):
- Nafas olish juda qiyinlashsa, lablar ko'karsa
- Hushingizni yo'qotsa yoki chalkashsangiz
- Qon bosimi keskin tushsa
- Bolada nafas olish juda tezlashsa (< 2 yosh: > 50/min)

### 📅 Bugun shifokorga boring:
- Isitma 38.5°C dan yuqori va yo'tal bor
- Nafas olishda ko'krak og'riydi
- Balg'amda qon bor
- Kasallik 3–4 kundan ortiq davom etsa

### 💊 Muhim:
Uyda davolanish FAQAT yengil pnevmoniya va shifokor nazoratida mumkin`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Pnevmoniyada nima qilmaslik kerak

- ❌ **Antibiotik sifatini** o'z-o'zidan belgilash (virusli pnevmoniyada antibiotik yordam bermaydi)
- ❌ **Antibiotikni kursni yarimida to'xtatish** — rezistentlik rivojlanadi
- ❌ **Yotmaydigan va dam olmaydigan** bo'lish — to'la dam olish zarur
- ❌ **Chekish** — nafas yo'llarini qo'shimcha shikastlaydi
- ❌ **Tibbiy yordam olmasdan uyda qolish** — og'ir pnevmoniyada kasalxonaga yotish kerak
- ❌ **Suv ichishni kamaytirish** — balg'amni suyultirish uchun ko'p suyuqlik kerak`,
      evidenceLevel: 'B',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Pnevmoniyada nima qilish kerak

- ✅ **To'la dam olish** — faol harakat salomatlikni yomonlashtiradi
- ✅ **Ko'p suyuqlik** — kuniga ≥ 2–3 litr (suv, choy, meva suvlari)
- ✅ **Antibiotikni vaqtida va to'liq** qabul qilish (shifokor tayinlasa)
- ✅ **Isitma tushiruvchi** (Paracetamol/Ibuprofen) faqat 38.5°C dan yuqorida
- ✅ **Xona havolanishi** — toza havo muhim, lekin sovuqqa chiqmaslik
- ✅ Shifokor nazoratida **rentgen tekshiruvi** 4–6 haftadan keyin`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Pnevmoniya oldini olish

- 💉 **Emlash** — Pnevmokok va Gripp vaksinasi (ayniqsa 65+, surunkali kasallar, bolalar)
- 🚭 **Chekishni to'xtatish** — o'pka himoya mexanizmlarini tiklaydi
- 🧼 **Qo'l yuvish** — ARVI va grippning oldini olish pnevmoniyaga yo'l bermaydi
- 💪 **Immunitetni mustahkamlash**: uyqu, ovqatlanish, jismoniy faollik
- 🏥 **Surunkali kasalliklarni nazorat qilish**: qand kasalligi, yurak kasalliği
- 🏠 **Uy havosi** — changga va kimyoviy moddalar bug'iga uzoq muddatli ta'sirdan saqlaning`,
      evidenceLevel: 'A',
    },
  ],
  symptoms: [
    { code: 'HIGH_FEVER', nameUz: 'Isitma (38°C+)', category: 'umumiy', isRedFlag: false, weight: 0.8, isRequired: true, isExcluding: false },
    { code: 'PRODUCTIVE_COUGH', nameUz: 'Balg\'amli yo\'tal', category: 'pulmonologik', bodyZone: 'chest', isRedFlag: false, weight: 0.85, isRequired: true, isExcluding: false },
    { code: 'DYSPNEA', nameUz: 'Nafas qisilishi', category: 'pulmonologik', bodyZone: 'chest', isRedFlag: false, weight: 0.75, isRequired: false, isExcluding: false },
    { code: 'PLEURITIC_CHEST_PAIN', nameUz: 'Nafas olishda ko\'krak og\'rig\'i', category: 'pulmonologik', bodyZone: 'chest', isRedFlag: false, weight: 0.65, isRequired: false, isExcluding: false },
    { code: 'CHILLS', nameUz: 'Qaltirashlash', category: 'umumiy', isRedFlag: false, weight: 0.55, isRequired: false, isExcluding: false },
    { code: 'CYANOSIS', nameUz: 'Lab va barmoqlar ko\'karishi', category: 'pulmonologik', isRedFlag: true, weight: 0.3, isRequired: false, isExcluding: false },
    { code: 'HEMOPTYSIS', nameUz: 'Balg\'amda qon', category: 'pulmonologik', isRedFlag: true, weight: 0.2, isRequired: false, isExcluding: false },
  ],
};

// ── 5. BEXTEREV KASALLIGI ─────────────────────────────────────────────────────

export const bexterev: DiseaseFixture = {
  slug: 'bexterev',
  icd10: 'M45.9',
  nameUz: 'Bexterev kasalligi (Ankilozlashtiruvchi spondilit)',
  nameRu: 'Болезнь Бехтерева (анкилозирующий спондилит)',
  nameEn: 'Ankylosing Spondylitis',
  nameLat: 'Spondylitis ankylosans',
  synonyms: ['Ankilozlashtiruvchi spondilit', 'AS', 'Bexterev'],
  category: 'revmatologiya',
  protocolSources: ['ASAS/EULAR Recommendations 2022', 'ACR Guidelines 2019'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Bexterev kasalligi nima?

Bexterev kasalligi — umurtqa pog'onasi va qovurg'a-umurtqa bo'g'imlarini **sistemali yallig'lantiruvchi surunkali kasallik**. Davolanmasa, umurtqa pog'onasi "tasbeh"ga o'xshab birikib qotib qolishi (ankiloz) mumkin.

**Epidemiologiya:**
- Aholining 0.1–0.5% kasallanadi
- Erkaklar ayollarga nisbatan 2–3 barobar ko'p
- Ko'pincha **20–30 yoshda** boshlanadi
- **HLA-B27** genetik markeri bilan bog'liq (kasallarning 90%+)

> Kasallikni birinchi bo'lib 1893 yilda rus nevropatoloji **Vladimir Bexterev** tasvirlab bergan.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Bexterev kasalligi belgilari

**Asosiy belgilar — "yallig'lanish xarakteridagi bel og'rig'i":**
- 🌅 Ertalab **qattiqlik** — 30 daqiqadan ortiq
- 🌙 Tun ikkinchi yarmida uyqudan uyg'otadigan og'riq
- ✅ Harakat va jismoniy faoliyatdan keyin **yaxshilanish** (dam olishdan yomonlashish — bu farqi muhim!)
- 📉 Belning egiluvchanligi kamayishi (oldinga, orqaga, yonga)

**Qo'shimcha belgilar:**
- 👁️ Ko'z yallig'lanishi (uveit) — juda og'riqli, qizil ko'z
- 🦵 Son-chanoq bo'g'imi og'rig'i (sakraileit)
- 🦶 Oyoq tovoni og'rig'i (enthesit)
- 😰 Charchash, umumiy holsizlik
- Nafas chuqurligining cheklanishi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon shifokorga borish kerak?

### 📅 Revmatologa murojaat qiling, agar:
- Bel og'rig'i **3 oydan ortiq** davom etsa va 45 yoshgacha bo'lsa
- Ertalabki **qattiqlik 30 daqiqadan ortiq** bo'lsa
- Og'riq tunda uyg'otsa
- Harakat qilganda og'riq **kamaysa** (tinch holatda kuchaysa)
- Ko'z yallig'lanishi takrorlanib tursa
- Ota-onangizda Bexterev kasalligi bo'lsa

### ⚠️ Darhol murojaat:
- Ko'z keskin qizarib, ko'rishni yo'qotsa (uveit)
- Oyoq-qo'llarda qo'satda zaiflik paydo bo'lsa`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Bexterev kasalligida nima qilmaslik kerak

- ❌ **Harakatsiz turmush tarzida yashash** — qotish tezlashadi
- ❌ **Shifokor ruxsatisiz dori to'xtatish** — biologik dorilar to'satdan to'xtatilmaydi
- ❌ **Og'ir vazn ko'tarish** — umurtqaga yuklanish
- ❌ **Noto'g'ri holat** (bukchayish, qiyshiq o'tirish) — deformatsiyani tezlashtiradi
- ❌ **Yumshoq, botiq to'shakda uxlash** — qattiq tekis to'shak kerak
- ❌ **Fizioterapiyani o'z-o'zidan belgilash** — iliq protseduralar yallig'lanishni kuchaytirishi mumkin`,
      evidenceLevel: 'B',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Bexterev kasalligida nima qilish kerak

- ✅ **Kunlik maxsus mashqlar** — egiluvchanglikni saqlash uchun revmatolог/fizioterapevt bilan
- ✅ **Suzish** — umurtqaga yuklanmasdan mushaklar mustahkamlanadi
- ✅ **To'g'ri holat**: uxlashda qattiq to'shak, yumaloq yostiq yo'q
- ✅ **NSAID dorilarni** vaqtida qabul qilish (shifokor tayinlasa)
- ✅ **Chekishni to'xtatish** — nafas sistemi shikastlanishini kamaytiradi
- ✅ **Biologik terapiyaga** murojaat — og'ir holatlarda TNF-inhibitorlar samarali
- ✅ Yiliga **1–2 marta** rentgen/MRT nazorati`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Bexterev kasalligining oldini olish va asoratsizlashtirishni oldini olish

**Kasallikning rivojlanishini to'liq oldini olish imkoni yo'q** (genetik omil muhim), lekin:

- 🏃 **Muntazam harakat** — kasallik boshlangandan oldin ham, keyin ham
- 🚭 **Chekmaslik** — o'pka asoratlari riskini kamaytiradi
- 👁️ **Ko'z tekshiruvi** — yiliga 1 marta, hatto belgi bo'lmasa ham
- 💊 **Erta tashxis va davo** — umurtqa deformatsiyasini sekinlashtiradi
- 🧬 **Oilada bor bo'lsa** — HLA-B27 tahlilidan o'tish, erta belgilarda shifokorga borish`,
      evidenceLevel: 'B',
    },
  ],
  symptoms: [
    { code: 'INFLAMMATORY_BACK_PAIN', nameUz: 'Yallig\'lanish xarakteridagi bel og\'rig\'i', category: 'muskuloskeletal', bodyZone: 'back', isRedFlag: false, weight: 0.95, isRequired: true, isExcluding: false },
    { code: 'MORNING_STIFFNESS', nameUz: 'Ertalabki qattiqlik (30 min+)', category: 'muskuloskeletal', isRedFlag: false, weight: 0.85, isRequired: true, isExcluding: false },
    { code: 'NIGHT_BACK_PAIN', nameUz: 'Tunda bel og\'rig\'i', category: 'muskuloskeletal', bodyZone: 'back', isRedFlag: false, weight: 0.8, isRequired: false, isExcluding: false },
    { code: 'IMPROVEMENT_WITH_EXERCISE', nameUz: 'Harakat bilan yaxshilanish', category: 'muskuloskeletal', isRedFlag: false, weight: 0.75, isRequired: false, isExcluding: false },
    { code: 'UVEITIS', nameUz: 'Ko\'z uveit (qizil, og\'riqli)', category: 'oftal\'mologik', bodyZone: 'head', isRedFlag: false, weight: 0.65, isRequired: false, isExcluding: false },
    { code: 'SACROILIAC_PAIN', nameUz: 'Son-chanoq bo\'g\'imi og\'rig\'i', category: 'muskuloskeletal', bodyZone: 'back', isRedFlag: false, weight: 0.7, isRequired: false, isExcluding: false },
    { code: 'HEEL_PAIN', nameUz: 'Tovon og\'rig\'i (enthesit)', category: 'muskuloskeletal', bodyZone: 'lower_limb', isRedFlag: false, weight: 0.5, isRequired: false, isExcluding: false },
  ],
};

// ── 20 STUB KASALLIKLAR ───────────────────────────────────────────────────────

export const stubs: StubFixture[] = [
  { slug: 'diabet-1', icd10: 'E10', nameUz: '1-tur qand kasalligi', nameRu: 'Сахарный диабет 1 типа', category: 'endokrinologiya' },
  { slug: 'diabet-2', icd10: 'E11', nameUz: '2-tur qand kasalligi', nameRu: 'Сахарный диабет 2 типа', category: 'endokrinologiya' },
  { slug: 'bronxial-astma', icd10: 'J45.9', nameUz: 'Bronxial astma', nameRu: 'Бронхиальная астма', category: 'pulmonologiya' },
  { slug: 'surunkali-bronxit', icd10: 'J42', nameUz: 'Surunkali bronxit', nameRu: 'Хронический бронхит', category: 'pulmonologiya' },
  { slug: 'oshqozon-yara', icd10: 'K25.9', nameUz: 'Oshqozon yarasi', nameRu: 'Язва желудка', category: 'gastroenterologiya' },
  { slug: 'ichak-yara', icd10: 'K26.9', nameUz: '12-barmoqli ichak yarasi', nameRu: 'Язва двенадцатиперстной кишки', category: 'gastroenterologiya' },
  { slug: 'revmatoid-artrit', icd10: 'M05.9', nameUz: 'Revmatoid artrit', nameRu: 'Ревматоидный артрит', category: 'revmatologiya' },
  { slug: 'osteoartrit', icd10: 'M15.9', nameUz: 'Osteoartrit', nameRu: 'Остеоартрит', category: 'revmatologiya' },
  { slug: 'gipotiroidizm', icd10: 'E03.9', nameUz: 'Gipotiroidizm', nameRu: 'Гипотиреоз', category: 'endokrinologiya' },
  { slug: 'gipertiroidizm', icd10: 'E05.9', nameUz: 'Gipertiroidizm', nameRu: 'Гипертиреоз', category: 'endokrinologiya' },
  { slug: 'yurak-etishmovchiligi', icd10: 'I50.9', nameUz: 'Yurak etishmovchiligi', nameRu: 'Сердечная недостаточность', category: 'kardiologiya' },
  { slug: 'koronar-kasallik', icd10: 'I25.9', nameUz: 'Yurak toj tomir kasalligi', nameRu: 'ИБС', category: 'kardiologiya' },
  { slug: 'aritmiya', icd10: 'I49.9', nameUz: 'Yurak aritmiyasi', nameRu: 'Аритмия сердца', category: 'kardiologiya' },
  { slug: 'insult', icd10: 'I63.9', nameUz: 'Insult (miya qon tomirlari kasalligi)', nameRu: 'Ишемический инсульт', category: 'nevrologiya' },
  { slug: 'epilepsiya', icd10: 'G40.9', nameUz: 'Epilepsiya', nameRu: 'Эпилепсия', category: 'nevrologiya' },
  { slug: 'depressiya', icd10: 'F32.9', nameUz: 'Depressiya', nameRu: 'Депрессия', category: 'psixiatriya' },
  { slug: 'psoriaz', icd10: 'L40.9', nameUz: 'Psoriaz', nameRu: 'Псориаз', category: 'dermatologiya' },
  { slug: 'buyrak-toshlari', icd10: 'N20.9', nameUz: 'Buyrak-siydik yo\'l toshlari', nameRu: 'МКБ (нефролитиаз)', category: 'urologiya' },
  { slug: 'giperxolesterolemiya', icd10: 'E78.0', nameUz: 'Giperxolesterolemiya', nameRu: 'Гиперхолестеринемия', category: 'kardiologiya' },
  { slug: 'osteoporoz', icd10: 'M81.9', nameUz: 'Osteoporoz', nameRu: 'Остеопороз', category: 'revmatologiya' },
];
