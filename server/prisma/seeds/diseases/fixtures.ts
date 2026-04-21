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

// ── 6. DIABET-2 ───────────────────────────────────────────────────────────────

export const diabet2: DiseaseFixture = {
  slug: 'diabet-2',
  icd10: 'E11',
  nameUz: '2-tur qand kasalligi',
  nameRu: 'Сахарный диабет 2 типа',
  nameEn: 'Type 2 Diabetes Mellitus',
  synonyms: ['Qand kasalligi', 'Diabet'],
  category: 'endokrinologiya',
  protocolSources: ['WHO 2019', 'ADA Standards of Care 2024'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## 2-tur qand kasalligi nima?

2-tur qand kasalligi — organizm insulinni yetarli ishlab chiqarmaydi yoki to'qimalar insulinga sezgirligini yo'qotadi. Natijada qonda shakar (glyukoza) miqdori oshib ketadi.

Jahon aholisining **9%** dan ortig'i diabetdan aziyat chekadi. O'zbekistonda taxminan **700 000** kishi ro'yxatda.

> 💡 **Muhim**: 2-tur diabet ko'pincha yillar davomida belgilar bermaydi. Erta aniqlash asoratlarni oldini oladi.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## 2-tur diabet belgilari

**Asosiy belgilar (klassik triada):**
- 🥛 **Ko'p ichish** (polidipsiya) — suvsizlik hissi doimiy
- 🚽 **Ko'p siydik** (poliuriya) — tunda ham turib borish
- 🍽️ **Ko'p ovqatlanish** (polifagiya) — to'ymaydi, ammo vazn yo'qolishi mumkin

**Boshqa belgilar:**
- Charchash, holsizlik
- Ko'rish xiralanishi (shisha ko'z)
- Oyoq-qo'llarda uvishish, qichishish
- Yaralaning sekin bitishi
- Tez-tez infeksiyalar (siydik yo'li, teri)

**Og'ir holat — DKA belgilari (darhol yordam kerak!):**
- Aseton hidi og'izdan
- Chuqur-tez nafas
- Qorin og'rig'i, ko'ngil aynashi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon shifokorga borish kerak?

### 📅 Endokrinologga murojaat qiling:
- Qonda shakar darajasi **6.1 mmol/L** dan yuqori bo'lsa (och qorin)
- Semizlik + qon bosimi balandligi bor bo'lsa
- Oilada diabet bor bo'lsa va 40 yoshdan oshgan bo'lsa
- Ko'p siydik, ko'p ichish hissi bo'lsa

### ⚠️ TEZKOR yordam (103):
- Qonda shakar **3 mmol/L dan past** (gipoglikemiya): titroq, terlash, hushdan ketish
- Qonda shakar **20 mmol/L dan yuqori** + qusish + aseton hidi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Diabet bilan nima qilmaslik kerak

- ❌ **Shifokor ruxsatisiz insulin to'xtatish** — hayot uchun xavfli
- ❌ **Uglevod ko'p bo'lgan oziq-ovqat** (shirin ichimliklar, oq non, pirojnoe)
- ❌ **Piyoda yurishni to'xtatish** — faoliyat insulin sezgirligini oshiradi
- ❌ **Oyoq yarasini e'tiborsiz qoldirish** — gangrena riski
- ❌ **Alkogol** — gipoglikemiyani kuchaytiradi
- ❌ **Stress** — qandni oshiradi, stressni boshqarishni o'rganing`,
      evidenceLevel: 'B',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Diabet bilan yaxshi yashash uchun

- ✅ **Har kuni piyoda yurish** 30 daqiqa — insulin sezgirligini oshiradi
- ✅ **Glikozilangan gemoglobin (HbA1c)** — 3 oyda bir tekshirish (maqsad < 7%)
- ✅ **Qon bosimini nazorat** — maqsad < 130/80 mmHg
- ✅ **Oyoqni har kuni ko'zdan kechirish** — yaralar va shishlar
- ✅ **Dieta**: ko'p sabzavot, kam uglevod, to'yinmagan yog'lar
- ✅ **Ko'z tubini** yiliga bir marta tekshirish (retinopat riski)
- ✅ **Buyrak tahlili** — yiliga bir marta kreatinin, mikroalbuminuriya`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Diabetning oldini olish

**Prediyabet bosqichida to'xtatish mumkin!**

- 🏃 **Jismoniy faollik** — haftada 150 daqiqa o'rtacha intensivlikda
- ⚖️ **Vazn normalizatsiya** — 5–7% vazn yo'qotish riski 58% kamaytiradi
- 🥗 **Ratsion**: to'yingan yog', oddiy shakar, tuz kamaytirish
- 🚭 **Chekmaslik** — insulin rezistentligini oshiradi
- 🩺 **40 yoshdan oshganda** yiliga qon shakerini tekshirish`,
      evidenceLevel: 'A',
    },
  ],
  symptoms: [
    { code: 'POLYURIA', nameUz: 'Ko\'p siydik (tunda ham)', category: 'endokrin', isRedFlag: false, weight: 0.85, isRequired: true, isExcluding: false },
    { code: 'POLYDIPSIA', nameUz: 'Doimiy suvsizlik hissi', category: 'endokrin', isRedFlag: false, weight: 0.85, isRequired: true, isExcluding: false },
    { code: 'FATIGUE_CHRONIC', nameUz: 'Doimiy charchash, holsizlik', category: 'umumiy', isRedFlag: false, weight: 0.7, isRequired: false, isExcluding: false },
    { code: 'BLURRED_VISION', nameUz: 'Ko\'rishning xiralanishi', category: 'oftalmologik', bodyZone: 'head', isRedFlag: false, weight: 0.65, isRequired: false, isExcluding: false },
    { code: 'NUMBNESS_EXTREMITIES', nameUz: 'Oyoq-qo\'llarda uvishish/qichishish', category: 'nevrologik', isRedFlag: false, weight: 0.6, isRequired: false, isExcluding: false },
    { code: 'SLOW_WOUND_HEALING', nameUz: 'Yaraning sekin bitishi', category: 'teri', isRedFlag: false, weight: 0.65, isRequired: false, isExcluding: false },
    { code: 'RECURRENT_INFECTIONS', nameUz: 'Tez-tez infeksiyalar (siydik, teri)', category: 'immunologik', isRedFlag: false, weight: 0.6, isRequired: false, isExcluding: false },
    { code: 'HYPERGLYCEMIA', nameUz: 'Yuqori qon shakar darajasi', category: 'laborator', isRedFlag: true, weight: 1.0, isRequired: false, isExcluding: false },
    { code: 'KUSSMAUL_BREATHING', nameUz: 'Chuqur-tez nafas (aseton hidi)', category: 'nafas', isRedFlag: true, weight: 0.9, isRequired: false, isExcluding: false },
  ],
};

// ── 7. BRONXIAL ASTMA ─────────────────────────────────────────────────────────

export const bronxialAstma: DiseaseFixture = {
  slug: 'bronxial-astma',
  icd10: 'J45.9',
  nameUz: 'Bronxial astma',
  nameRu: 'Бронхиальная астма',
  nameEn: 'Bronchial Asthma',
  synonyms: ['Astma', 'Nafas qisishi'],
  category: 'pulmonologiya',
  protocolSources: ['GINA 2024 Guidelines', 'WHO Asthma Factsheet'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Bronxial astma nima?

Bronxial astma — nafas yo'llarining surunkali yallig'lanish kasalligi. Bronxlar torayib qoladi, shilliq ko'payadi, nafas qisadi. Hujumlar tetikchilar (allergiya, sovuq havo, stress) tomonidan keltirib chiqariladi.

Dunyo bo'yicha **350 million** kishida astma bor. O'zbekistonda taxminan **3%** aholida.

> 💡 **Yaxshi xabar**: Zamonaviy dorilar bilan 90% bemorlar hujumsiz yashay oladi.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Bronxial astma belgilari

**Klassik to'rtlik:**
- 😤 **Nafas qisishi** — ayniqsa kechasi va ertalab
- 🌬️ **Xirillash** (bronxlarda hushtak ovozi)
- 😮‍💨 **Ko'krak qisishi** hissi
- 😷 **Yo'tal** — quruq yoki shilimshiq balgam

**Hujum tetikchilari:**
- Gard, changlar, o'simlik changi
- Sovuq havo, jismoniy zo'riqish
- NSAID dorilar (ibuprofen, aspirin)
- Stress, kuchli hidlar

**Og'ir hujum belgilari (TEZKOR YORDAM):**
- Gapira olmaydi, o'tirgan holda egilgan
- Ko'kargan lablar (sianoz)
- Ingichator o'z-o'zidan yordam bermaydi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon shifokorga borish kerak?

### 📅 Pulmonolog yoki allergologga:
- Haftada 2 martadan ko'p nafas qisganda
- Ingichatorni (salbutamol) haftada 2 martadan ko'p ishlatganda
- Tungi simptomlar oyiga 2 martadan ko'p bo'lsa

### ⚠️ TEZKOR YORDAM:
- Ingichator 5–10 daqiqada yordam bermasa
- Gapirish qiyin, lablar ko'kargan
- SpO2 < 92% (pulsoksimetr bor bo'lsa)`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Astma bilan nima qilmaslik kerak

- ❌ **Inhalyatorni shifokor ruxsatisiz to'xtatish** — nazorat yo'qoladi
- ❌ **Betablokerlar** (metoprolol, atenolol) — bronxospazm yomonlashadi
- ❌ **Aspirin/ibuprofen** — astmali bemorlarning 10% da hujum chaqiradi
- ❌ **Chekish** — bronxial yallig'lanishni keskin oshiradi
- ❌ **Uy hayvoni bilan yashash** (allergiya bo'lsa)
- ❌ **Hujumda faqat inhalyatorsiz qolish** — hujum paytida har doim yonida bo'lishi shart`,
      evidenceLevel: 'A',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Astma bilan yaxshi yashash uchun

- ✅ **Asosiy (bazis) dori** — kortikosteroid inhalyator har kuni (simptom bo'lmasa ham)
- ✅ **Ingichator (salbutamol)** — har doim yonida, hujum vaqtida
- ✅ **Pikfloumetr** — o'z holatingizni uyda kuzatish (PSV)
- ✅ **Astma harakatlar rejasi** — shifokor bilan tuzish
- ✅ **Tetikchilardan qochish** — uyni changdan tozalash, allergen yo'q
- ✅ **Jismoniy faollik** mumkin — isitish mashqlari bilan, ingichator oldindan
- ✅ Yiliga bir marta **spirometriya**`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Astma hujumlarining oldini olish

- 🏠 **Uyni toza ushting** — yo'rg'an, gilamlarni tez-tez tozalash
- 🌿 **Gullash davrida** — dori oldindan boshlash, tashqariga chiqmaslik
- 🚭 **Chekishni to'xtatish** — passiv tutun ham xavfli
- 💉 **Gripp vaksinasi** — yiliga bir marta
- 🩺 **Muntazam shifokor ziyoratlari** — hattoki yaxshi his qilsangiz ham`,
      evidenceLevel: 'B',
    },
  ],
  symptoms: [
    { code: 'DYSPNEA_EXERTIONAL', nameUz: 'Nafas qisishi (harakatda va tinch holatda)', category: 'nafas', bodyZone: 'chest', isRedFlag: false, weight: 0.9, isRequired: true, isExcluding: false },
    { code: 'WHEEZING', nameUz: 'Nafas olganda xirillash/hushtak ovozi', category: 'nafas', bodyZone: 'chest', isRedFlag: false, weight: 0.9, isRequired: true, isExcluding: false },
    { code: 'CHEST_TIGHTNESS', nameUz: 'Ko\'krak siqilish hissi', category: 'nafas', bodyZone: 'chest', isRedFlag: false, weight: 0.8, isRequired: false, isExcluding: false },
    { code: 'DRY_COUGH_NIGHT', nameUz: 'Tungi quruq yo\'tal', category: 'nafas', isRedFlag: false, weight: 0.75, isRequired: false, isExcluding: false },
    { code: 'SYMPTOM_TRIGGERED', nameUz: 'Sovuq havo/allergiyadan keltirib chiqarilishi', category: 'nafas', isRedFlag: false, weight: 0.7, isRequired: false, isExcluding: false },
    { code: 'CYANOSIS', nameUz: 'Lab/tirnoq ko\'karishi (og\'ir hujumda)', category: 'nafas', isRedFlag: true, weight: 0.95, isRequired: false, isExcluding: false },
  ],
};

// ── 8. DEPRESSIYA ─────────────────────────────────────────────────────────────

export const depressiya: DiseaseFixture = {
  slug: 'depressiya',
  icd10: 'F32.9',
  nameUz: 'Depressiya',
  nameRu: 'Депрессия',
  nameEn: 'Major Depressive Disorder',
  synonyms: ['Ruhiy tushkunlik', 'Kayfiyat buzilishi'],
  category: 'psixiatriya',
  protocolSources: ['DSM-5', 'WHO mhGAP 2023'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Depressiya nima?

Depressiya — kayfiyat, fikrlash va harakatga ta'sir etuvchi klinik kasallik. Bu oddiy "xafa bo'lish" emas, balki miyaning kimyoviy muvozanat buzilishi.

Dunyo bo'yicha **280 million** kishida depressiya bor — bu eng ko'p uchraydigan ruhiy kasallik.

> 💡 **Muhim**: Depressiya davolanadi. O'z vaqtida murojaat qilish 80% hollarda yordam beradi.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Depressiya belgilari

**Asosiy belgilar (ikkalasi bo'lishi shart, 2 haftadan ko'p):**
- 😔 **Kayfiyatning tushkunligi** — umidsizlik, bo'shashish
- 😴 **Ilgari yoqqan narsalardan quvonch yo'qolishi** (anhedoniya)

**Qo'shimcha belgilar:**
- Uyqu buzilishi (ko'p uxlash yoki uxlolmaslik)
- Ishtaha o'zgarishi (ko'p yeyish yoki yemaslik)
- Charchash, energiya yo'qligi
- Diqqatni jamlash qiyinligi
- O'z-o'zini ayblaш
- Hayotdan bezish hissi

### 🚨 Tezkor yordam kerak:
- O'ziga zarar yetkazish fikrlari
- "Yashashni istamayman" — bu TEZKOR SOS signali`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon psixiatr yoki psixologga borish kerak?

### 📅 Murojaat qiling, agar:
- 2 haftadan ko'p **kayfiyat past** bo'lsa
- Ish, o'qish, munosabatlar buzilgan bo'lsa
- Kecha-kunduz **uyqu yoki ishtaha** o'zgargan bo'lsa

### ⚠️ DARHOL murojaat (ishonch telefoni yoki 103):
- O'ziga zarar yetkazish fikrlari bo'lsa
- "Hayotni tugatmoqchiman" — iborasi

**O'zbekistonda yordam**: 183 (Aholini ijtimoiy qo'llab-quvvatlash)`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Depressiyada nima qilmaslik kerak

- ❌ **"O'zing yig'il"** deyish yoki eshitish — kasallikni kamsitish
- ❌ **Alkogol bilan davolash** — vaqtinchalik, keyinchalik kuchaytiradi
- ❌ **Antidepressantlarni o'z-o'zidan to'xtatish** — abstinensiya va relaps
- ❌ **Yolg'iz qolishga ruxsat berish** — ijtimoiy izolatsiya yomonlashtiradi
- ❌ **Shifokorga borishni kechiktirish** — erta bosqichda osonroq davolanadi`,
      evidenceLevel: 'B',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Depressiyada foydali harakatlar

- ✅ **Psixoterapiya** (KBT) — antidepressantlar bilan birga eng samarali
- ✅ **Kundalik kun tartibi** — uyqu, ovqat, harakatni muntazam qilish
- ✅ **Jismoniy faollik** — 30 daqiqa yurish kayfiyatni oshiradi
- ✅ **Yaqinlar bilan muloqot** — izolatsiyaga qarshi
- ✅ **Antidepressantlarni** shifokor ko'rsatmasi bo'yicha olish (4–6 hafta keyin ta'sir)
- ✅ **Mindfulness/meditatsiya** — stress pasaytiradi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Depressiyaning oldini olish

- 🏃 **Muntazam jismoniy faollik** — eng yaxshi tabiiy antidepressant
- 😴 **To'liq uyqu** — 7–9 soat, muntazam jadval
- 🤝 **Ijtimoiy aloqalar** — yaqinlar, do'stlar bilan muloqot
- 📵 **Ijtimoiy tarmoqlar** dan uzilish davrlari
- 🩺 **Stressni boshqarish** ko'nikmalari
- 💊 **Relaps bo'lganda** erta murojaat`,
      evidenceLevel: 'B',
    },
  ],
  symptoms: [
    { code: 'DEPRESSED_MOOD', nameUz: 'Kayfiyat tushkunligi (2 haftadan ko\'p)', category: 'psixiatrik', isRedFlag: false, weight: 1.0, isRequired: true, isExcluding: false },
    { code: 'ANHEDONIA', nameUz: 'Ilgari yoqqan narsalardan quvonch yo\'qolishi', category: 'psixiatrik', isRedFlag: false, weight: 0.95, isRequired: true, isExcluding: false },
    { code: 'SLEEP_DISTURBANCE', nameUz: 'Uyqu buzilishi (ko\'p/kam uxlash)', category: 'psixiatrik', isRedFlag: false, weight: 0.75, isRequired: false, isExcluding: false },
    { code: 'FATIGUE_CHRONIC', nameUz: 'Doimiy charchash, energiya yo\'qligi', category: 'umumiy', isRedFlag: false, weight: 0.7, isRequired: false, isExcluding: false },
    { code: 'APPETITE_CHANGE', nameUz: 'Ishtaha o\'zgarishi (ko\'p/kam yeyish)', category: 'psixiatrik', isRedFlag: false, weight: 0.65, isRequired: false, isExcluding: false },
    { code: 'CONCENTRATION_DIFFICULTY', nameUz: 'Diqqatni jamlash qiyinligi', category: 'psixiatrik', isRedFlag: false, weight: 0.65, isRequired: false, isExcluding: false },
    { code: 'SUICIDAL_IDEATION', nameUz: 'O\'ziga zarar yetkazish fikrlari', category: 'psixiatrik', isRedFlag: true, weight: 1.0, isRequired: false, isExcluding: false },
  ],
};

// ── 9. GIPOTIROIDIZM ─────────────────────────────────────────────────────────

export const gipotiroidizm: DiseaseFixture = {
  slug: 'gipotiroidizm',
  icd10: 'E03.9',
  nameUz: 'Gipotiroidizm',
  nameRu: 'Гипотиреоз',
  nameEn: 'Hypothyroidism',
  synonyms: ['Qalqonsimon bez kasalligi', 'Tireoid etishmovchiligi'],
  category: 'endokrinologiya',
  protocolSources: ['ETA Guidelines 2022', 'ATA 2023'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Gipotiroidizm nima?

Gipotiroidizm — qalqonsimon bez (tiroid) yetarli miqdorda gormoni ishlab chiqarmasa yuzaga keladi. Tiroid gormonlari barcha organ va to'qimalarning metabolizmini boshqaradi.

Aholining **5%** da gipotiroidizm bor, ayollarda 5–10 barobar ko'p uchraydi.

> 💡 **Muhim**: Gipotiroidizm — har kuni bir tabletkada davolanishi mumkin bo'lgan kasallik.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Gipotiroidizm belgilari

**Metabolizm sekinlashish belgilari:**
- 🥶 **Sovuqqa sezgirlik** — boshqalar issiq desa siz sovuq
- ⚖️ **Vazn oshishi** — ovqat kamaytirsangiz ham
- 😴 **Uyquchanlik, charchash** — to'liq uxlasangiz ham charchagan
- 💬 **Sekin fikrlash**, xotira susayishi

**Tashqi belgilar:**
- Teri quruqligi, tushishi
- Soch to'kilishi
- Ovozning yo'g'onlashuvi
- Yuz, qo'l shishishi (miksedema)
- Yurak urishi sekinlashuvi

**Xotin-qizlarda:**
- Hayz buzilishi (ko'p, tartibsiz)
- Homiladorlikka ta'sir`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon endokrinologga borish kerak?

### 📅 Murojaat qiling, agar:
- Charchash + sovuqqa sezgirlik + vazn oshishi birgalikda bo'lsa
- Soch tez to'kilyapti, teri quruq bo'lsa
- TSH tahlili 4.0 mIU/L dan yuqori bo'lsa

### ⚠️ TEZKOR yordam:
- Gipotiroid koma (kam uchraydi): past temperatura, hushini yo'qotish, nafas sekinlashishi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Gipotiroidizmda nima qilmaslik kerak

- ❌ **Levotiroksinni to'xtatish** — simptomlар qaytib keladi, yaxshilanish sezilsa ham
- ❌ **Levotiroksinni ovqat bilan ichish** — 30 daqiqa oldin, och qorin ichiladi
- ❌ **Kalsiy, temir preparatlari bilan birga ichish** — so'rilishni kamaytiradi (4 soat oraliq)
- ❌ **Yo'd preparatlarini o'z-o'zidan ichish** — kasallikni yomonlashtirishi mumkin`,
      evidenceLevel: 'B',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Gipotiroidizm bilan yaxshi yashash

- ✅ **Levotiroksin** — har kuni ertalab osh qorinda, bir vaqtda
- ✅ **TSH tahlilini** 6–12 oyda bir marta tekshirish
- ✅ **Doza sozlash** — doz bilan shifokor belgilaydi, o'z-o'zidan o'zgartirmang
- ✅ **Yo'd tuz** ishlatish — profilaktika uchun
- ✅ **Homiladorlik** rejalashtirsa — oldindan endokrinologga borish`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Gipotiroidizmning oldini olish

- 🧂 **Yo'dlangan tuz** ishlatish — eng oddiy profilaktika
- 🐟 **Dengiz mahsulotlari** — tabiiy yo'd manbai
- 🩺 **Oilada qalqonsimon bez kasalligi** bor bo'lsa — yiliga TSH tekshirish
- 🤰 **Homiladorlikda** — tiroid gormonlari nazorati (bola rivojlanishi uchun muhim)`,
      evidenceLevel: 'B',
    },
  ],
  symptoms: [
    { code: 'COLD_INTOLERANCE', nameUz: 'Sovuqqa sezgirlik oshishi', category: 'endokrin', isRedFlag: false, weight: 0.85, isRequired: true, isExcluding: false },
    { code: 'WEIGHT_GAIN_UNEXPLAINED', nameUz: 'Sababsiz vazn oshishi', category: 'endokrin', isRedFlag: false, weight: 0.8, isRequired: false, isExcluding: false },
    { code: 'FATIGUE_CHRONIC', nameUz: 'Doimiy charchash/uyquchanlik', category: 'umumiy', isRedFlag: false, weight: 0.8, isRequired: true, isExcluding: false },
    { code: 'DRY_SKIN_HAIR_LOSS', nameUz: 'Teri quruqligi + soch to\'kilishi', category: 'teri', isRedFlag: false, weight: 0.75, isRequired: false, isExcluding: false },
    { code: 'BRADYCARDIA', nameUz: 'Yurak urishi sekinlashuvi', category: 'kardiovaskular', isRedFlag: false, weight: 0.65, isRequired: false, isExcluding: false },
    { code: 'VOICE_HOARSENESS', nameUz: 'Ovoz yo\'g\'onlashuvi', category: 'lor', isRedFlag: false, weight: 0.6, isRequired: false, isExcluding: false },
    { code: 'MEMORY_IMPAIRMENT', nameUz: 'Xotira susayishi, sekin fikrlash', category: 'nevrologik', isRedFlag: false, weight: 0.6, isRequired: false, isExcluding: false },
    { code: 'FACIAL_PUFFINESS', nameUz: 'Yuz/qo\'l shishishi (miksedema)', category: 'teri', isRedFlag: false, weight: 0.7, isRequired: false, isExcluding: false },
  ],
};

// ── 10. REVMATOID ARTRIT ─────────────────────────────────────────────────────

export const revmatoidArtrit: DiseaseFixture = {
  slug: 'revmatoid-artrit',
  icd10: 'M05.9',
  nameUz: 'Revmatoid artrit',
  nameRu: 'Ревматоидный артрит',
  nameEn: 'Rheumatoid Arthritis',
  synonyms: ['Bo\'g\'im kasalligi', 'Polyartrit'],
  category: 'revmatologiya',
  protocolSources: ['EULAR 2022', 'ACR/EULAR Classification Criteria 2010'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Revmatoid artrit nima?

Revmatoid artrit — immunitet tizimi o'z bo'g'imlarini hujum qiladigan avtoimmun kasallik. Bo'g'im pardasi (sinoviya) yallig'lanib, keyinchalik suyak va tog'ay shikastlanadi.

Aholining **1%** da revmatoid artrit bor, ayollarda 3 barobar ko'p.

> 💡 **Muhim**: Erta davolash bo'g'im deformatsiyasini oldini oladi. Birinchi 6 oy — "oltin darcha".`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Revmatoid artrit belgilari

**Klassik triad:**
- 🦴 **Simmetrik bo'g'im og'rig'i** — ikkala tomonda (masalan, ikkala qo'l panjasi)
- 🌅 **Ertalabki qattiqlik** — 1 soat va undan ortiq davom etadi
- 🤲 **Qo'l panjasi, bilak bo'g'imlari** — tez-tez ta'sir qiladi

**Keyingi bosqichlarda:**
- Bo'g'imlar shishadi, isiydi, qizaradi
- Bo'g'im deformatsiyasi (panjalar qiyshaydi)
- Harakat chegaralanadi

**Sistematik belgilar:**
- Charchash, ishtahasizlik
- Past isitma
- Revmatoid tugunchalar (tirsak ostida)`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon revmatologga borish kerak?

### 📅 Tezkor murojaat:
- **2 haftadan ortiq** bo'g'im og'rig'i + shishishi
- Ertalabki qattiqlik **30 daqiqadan** ko'p
- Ikkala tomonda simmetrik bo'g'im og'rig'i

### ⚠️ Darhol murojaat:
- Bo'g'im keskin qizarib, isib, og'riq kuchaysa
- Bunga qo'shimcha yurak, o'pka bezovtaliklari bo'lsa`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Revmatoid artritda nima qilmaslik kerak

- ❌ **Metotreksat/biologiklarni to'xtatish** — remissiya yo'qoladi
- ❌ **Faqat og'riq qoldiruvchilarga tayanish** — kasallik progressiyalashadi
- ❌ **Og'ir jismoniy ish** og'riq paytida — bo'g'imni shikastlaydi
- ❌ **Chekish** — kasallik faolligini oshiradi, dorilarning ta'sirini kamaytiradi
- ❌ **Xalq tabobati bilan davolashni birinchi o'ringa qo'yish** — vaqtni yo'qotmaslik kerak`,
      evidenceLevel: 'B',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Revmatoid artritda foydali harakatlar

- ✅ **Metotreksat** — birinchi qator dori, remissiyaga olib keladi
- ✅ **Biologik dorilar** (adalimumab, etanersept) — og'ir hollarda
- ✅ **Suzish, suv aerobikasi** — bo'g'imlarga yuk bermasdan
- ✅ **Issiq kompresslar** ertalabki qattiqlikka
- ✅ **Fiziоterapevtik mashqlar** — bo'g'im harakatini saqlash uchun
- ✅ **DAS28 skori** — faollikni kuzatish (shifokor o'lchaydi)`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Revmatoid artrit progressiyasini sekinlashtirish

- 🚭 **Chekishni to'xtatish** — eng muhim modifikatsiya omil
- ⚖️ **Vazn normalizatsiya** — bo'g'imlarga yuklanish kamayadi
- 💊 **Erta tashxis va davo** — "biologik oyna" dan foydalanish
- 🦷 **Tish-og'iz gigienasi** — periodontit RA ni yomonlashtiradi
- 🩺 **Yiliga 2 marta** revmatolog ko'rikdan o'tish`,
      evidenceLevel: 'B',
    },
  ],
  symptoms: [
    { code: 'SYMMETRIC_JOINT_PAIN', nameUz: 'Simmetrik bo\'g\'im og\'rig\'i (ikkala tomonda)', category: 'muskuloskeletal', isRedFlag: false, weight: 0.95, isRequired: true, isExcluding: false },
    { code: 'MORNING_STIFFNESS', nameUz: 'Ertalabki qattiqlik (1 soat va ko\'proq)', category: 'muskuloskeletal', isRedFlag: false, weight: 0.9, isRequired: true, isExcluding: false },
    { code: 'SMALL_JOINT_SWELLING', nameUz: 'Kichik bo\'g\'imlar shishishi (qo\'l panjasi)', category: 'muskuloskeletal', isRedFlag: false, weight: 0.85, isRequired: false, isExcluding: false },
    { code: 'FATIGUE_CHRONIC', nameUz: 'Charchash, umumiy holsizlik', category: 'umumiy', isRedFlag: false, weight: 0.65, isRequired: false, isExcluding: false },
    { code: 'LOW_GRADE_FEVER', nameUz: 'Subfebril harorat (37–38°C)', category: 'umumiy', isRedFlag: false, weight: 0.55, isRequired: false, isExcluding: false },
    { code: 'RHEUMATOID_NODULES', nameUz: 'Tirsak ostida tugunchalar', category: 'teri', isRedFlag: false, weight: 0.6, isRequired: false, isExcluding: false },
  ],
};

// ── 11. INSULT ───────────────────────────────────────────────────────────────

export const insult: DiseaseFixture = {
  slug: 'insult',
  icd10: 'I63.9',
  nameUz: 'Insult (miya qon tomirlari kasalligi)',
  nameRu: 'Ишемический инсульт',
  nameEn: 'Ischemic Stroke',
  synonyms: ['Miya qon aylanishi buzilishi', 'Insult', 'Apoplexy'],
  category: 'nevrologiya',
  protocolSources: ['ESO Guidelines 2021', 'AHA/ASA 2019'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Insult nima?

Insult — miyaga qon yetkazib beruvchi tomir tiqilib qolsa (ishemik) yoki yorilib ketsa (gemorragik), miya hujayralar nobud bo'ladi.

Insult — O'zbekistonda **o'lim va nogironlikning** asosiy sababi. Har 40 soniyada 1 kishi insult bor bo'ladi.

> 🚨 **FAST qoidasi**: **F**ace drooping · **A**rm weakness · **S**peech difficulty · **T**ime to call 103`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Insult belgilari — FAST qoidasi

### 🚨 TEZKOR BELGILAR (103 chaqiring!):
- 😶 **F**ace (Yuz) — yuzning bir tomoni osilib qolsa
- 💪 **A**rm (Qo'l) — bir qo'l zaif/ko'tarib bo'lmasa
- 🗣️ **S**peech (Nutq) — gapirish qiyinlashsa yoki tushunarsiz bo'lsa
- ⏰ **T**ime (Vaqt) — darhol 103 chaqiring!

**Boshqa belgilar:**
- Bir tomonda ko'rish yo'qolishi
- Shiddat bilan bosh og'rig'i ("hayotimdagi eng kuchli")
- Muvozanat yo'qolishi, aylana holati
- Yutish qiyinligi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## 🚨 INSULT — TEZKOR TIBBIY YORDAM ZARUR!

### Ushbu belgilar bo'lsa DARHOL 103 chaqiring:
- Yuz osilib qolishi
- Bir tomonda qo'l/oyoq zaiflik
- Nutq buzilishi
- Ko'rish yo'qolishi
- "Hayotimdagi eng kuchli" bosh og'rig'i

**Alteplaza (tPA) — 4.5 soat ichida berilsa** miya shikastini tiklaydi. Har daqiqa muhim!

> ⚠️ **TIA (o'tkinchi ishemik hujum)** ham tezkor yordamni talab qiladi — 48 soat ichida to'liq insult riski yuqori.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Insult paytida va keyin nima qilmaslik kerak

- ❌ **Kutish** — "o'tib ketadi" deb o'ylash. Har daqiqa 1.9 million neyron nobud bo'ladi
- ❌ **Kasalni yotqizib qo'yib to'xtatish** — zarur bo'lsa, lekin 103 chaqirib
- ❌ **Og'izdan dori berish** — yutish buzilishi bo'lsa xavfli
- ❌ **Antiplatetar dorilarni to'xtatish** — reinsult riski oshadi
- ❌ **Zararli odatlar** — chekish, alkogol, semizlik`,
      evidenceLevel: 'A',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Insultdan keyin reabilitatsiya

- ✅ **Erta reabilitatsiya** — 24 soat ichida boshlash (dori bilan stabilizatsiya bo'lsa)
- ✅ **Logoped** — nutq tiklanishi uchun
- ✅ **Fizioterapevt** — harakat tiklanishi
- ✅ **Aspirin + klopidogrel** — reinsultdan saqlash uchun
- ✅ **Qon bosimini nazorat** — maqsad <130/80
- ✅ **Statinlar** — xolesterin pasaytirish`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Insultning oldini olish

**80% insult oldini olinishi mumkin:**

- 💊 **Qon bosimini nazorat** — eng muhim omil
- 🚭 **Chekishni to'xtatish** — risk 2 barobar kamayadi
- 🏃 **Jismoniy faollik** — haftada 150 daqiqa
- 🍎 **O'rtayer dengizi dietasi** — sabzavot, baliq, zeytun moyi
- 💊 **Atrial fibrillatsiya** bo'lsa antikoagulyant (varfarin/DOAC)
- 🩺 **Qand kasalligi, xolesterin** nazorat`,
      evidenceLevel: 'A',
    },
  ],
  symptoms: [
    { code: 'FACIAL_DROOP', nameUz: 'Yuzning bir tomoni osilib qolishi', category: 'nevrologik', bodyZone: 'head', isRedFlag: true, weight: 1.0, isRequired: false, isExcluding: false },
    { code: 'ARM_WEAKNESS_UNILATERAL', nameUz: 'Bir tomonda qo\'l/oyoq zaiflik', category: 'nevrologik', isRedFlag: true, weight: 1.0, isRequired: false, isExcluding: false },
    { code: 'SPEECH_DIFFICULTY', nameUz: 'Nutq buzilishi (gapira olmaydi yoki tushunarsiz)', category: 'nevrologik', bodyZone: 'head', isRedFlag: true, weight: 1.0, isRequired: false, isExcluding: false },
    { code: 'SUDDEN_SEVERE_HEADACHE', nameUz: '"Hayotimdagi eng kuchli" bosh og\'rig\'i', category: 'nevrologik', bodyZone: 'head', isRedFlag: true, weight: 0.95, isRequired: false, isExcluding: false },
    { code: 'VISION_LOSS_UNILATERAL', nameUz: 'Bir tomonda ko\'rish to\'satdan yo\'qolishi', category: 'oftalmologik', bodyZone: 'head', isRedFlag: true, weight: 0.9, isRequired: false, isExcluding: false },
    { code: 'BALANCE_LOSS', nameUz: 'Muvozanat yo\'qolishi, aylana holati', category: 'nevrologik', isRedFlag: true, weight: 0.85, isRequired: false, isExcluding: false },
  ],
};

// ── 12. BUYRAK TOSHLARI ───────────────────────────────────────────────────────

export const buyrakToshlari: DiseaseFixture = {
  slug: 'buyrak-toshlari',
  icd10: 'N20.9',
  nameUz: "Buyrak-siydik yo'l toshlari",
  nameRu: 'МКБ (нефролитиаз)',
  nameEn: 'Nephrolithiasis / Urolithiasis',
  synonyms: ["Buyrak toshlari", "Urolitiaz", "Nefrolit"],
  category: 'urologiya',
  protocolSources: ['EAU Guidelines on Urolithiasis 2023'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Buyrak toshlari nima?

Buyrak toshlari (urolitiaz) — buyrak yoki siydik yo'llarida mineral tuzlar to'planib qattiq kristallar (toshlar) hosil bo'lishi. Tosh siydik yo'lidan o'tishda kuchli og'riq chaqiradi.

Erkaklar ayollarga nisbatan 3 barobar ko'p ta'sirlanadi. Hayot davomida **1 kishi 10 tadan** birida uchraydi.

> 💡 **Qiziq fakt**: 5 mm gacha toshlarning **80%** o'z-o'zidan chiqib ketadi (ko'p suyuqlik ichib).`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Buyrak toshlari belgilari

**"Renal kolik" — tez boshlanuvchi og'riq:**
- 😫 **Belidagi keskin, to'lqinli og'riq** — bel pastidan qovuq tomon tarqaladi
- 🚽 Siydikda **qon** (gematüriya) — pushti yoki qizil
- 🤢 Ko'ngil aynashi, qusish
- Siydik qilishda og'riq, tez-tez borish ehtiyoji

**Toshning joylashuviga qarab:**
- Buyrakda: doimiy bel og'rig'i, siydik infeksiyasi
- Ureterada: to'lqinli kolik, son ichki tomonga tarqaladi
- Qovuqda: tez-tez, og'riqli siydik`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon urologga borish kerak?

### 📅 Murojaat qiling:
- Birinchi marta buyrak kolik bo'lsa
- Siydikda qon ko'rinsa
- Infeksiya belgilari bo'lsa

### ⚠️ TEZKOR YORDAM (103):
- Isitma + bel og'rig'i (infeksiyali gidronefrozpyelonefrit)
- Nafas qisilgunicha kuchli og'riq
- Siydik umuman chiqmasa (bir buyrakli yoki ikkalasi ham bloklanib)`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Buyrak toshlarida nima qilmaslik kerak

- ❌ **Suyuqlik ichishni kamaytirish** — aksincha, tosh chiqarishga yordam beradi
- ❌ **Kalsiy qabul qilishni keskin kamaytirish** (vitamin D bilan birga normal)
- ❌ **Og'riqni e'tiborsiz qoldirish** — tiqilish va infeksiya xavfli
- ❌ **Ultratovush tekshiruvini kechiktirish** — toshni aniqlash kerak`,
      evidenceLevel: 'B',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Buyrak toshlari bilan yashash

- ✅ **Suv ko'p ichish** — kuniga 2–2.5 litr (siydik och sariq bo'lishi kerak)
- ✅ **Oksalat kam oziq-ovqat** (spinat, shokolad, yong'oq) — oksalat toshlarida
- ✅ **Limon suvi** — sitrat miqdori oshiradi, tosh hosil bo'lishini kamaytiradi
- ✅ **Tamsulosin** — alfa-bloker, tosh o'tishini osonlashtiradi
- ✅ **Ultratovush** — 3–6 oyda bir marta nazorat
- ✅ **ESWL** (ultratovush bilan parchalash) — 10 mm gacha toshlar uchun`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Buyrak toshlarining oldini olish

- 💧 **Kuniga 2.5 litr suyuqlik** — eng muhim profilaktika
- 🧂 **Tuz (natriy) kamaytirish** — kaltsiy ekskretsiyasini kamaytiradi
- 🥩 **Hayvon oqsili me'yorida** — urat toshlar riski
- 🍋 **Limon, apelsin** — sitrat manbai
- ⚖️ **Vazn normalizatsiya** — BMI ↓ → tosh riski ↓
- 🔬 **Tahlil** — takroriy tosh bo'lganda 24 soatlik siydik tahlili`,
      evidenceLevel: 'A',
    },
  ],
  symptoms: [
    { code: 'RENAL_COLIC', nameUz: 'Bel pastida to\'satdan keskin og\'riq (kolik)', category: 'urologik', bodyZone: 'back', isRedFlag: false, weight: 1.0, isRequired: true, isExcluding: false },
    { code: 'HEMATURIA', nameUz: 'Siydikda qon (pushti/qizil)', category: 'urologik', isRedFlag: false, weight: 0.9, isRequired: false, isExcluding: false },
    { code: 'NAUSEA_VOMITING', nameUz: 'Ko\'ngil aynashi va qusish', category: 'gastroenterologik', isRedFlag: false, weight: 0.7, isRequired: false, isExcluding: false },
    { code: 'DYSURIA', nameUz: 'Siydik qilishda og\'riq/yonish', category: 'urologik', isRedFlag: false, weight: 0.65, isRequired: false, isExcluding: false },
    { code: 'FLANK_PAIN_RADIATING', nameUz: 'Og\'riq qovuq/son ichiga tarqalishi', category: 'urologik', bodyZone: 'back', isRedFlag: false, weight: 0.75, isRequired: false, isExcluding: false },
    { code: 'FEVER_WITH_FLANK_PAIN', nameUz: 'Isitma + bel og\'rig\'i (infeksiya)', category: 'urologik', isRedFlag: true, weight: 0.9, isRequired: false, isExcluding: false },
  ],
};

// ── 13. YURAK ETISHMOVCHILIGI ─────────────────────────────────────────────────

export const yurakEtishmovchiligi: DiseaseFixture = {
  slug: 'yurak-etishmovchiligi',
  icd10: 'I50.9',
  nameUz: 'Yurak etishmovchiligi',
  nameRu: 'Сердечная недостаточность',
  nameEn: 'Heart Failure',
  synonyms: ['Yurak yetishmovchiligi', 'Kardiyak dekompensatsiya'],
  category: 'kardiologiya',
  protocolSources: ['ESC Guidelines on Heart Failure 2021'],
  blocks: [
    {
      marker: 'generalInfo', label: "Umumiy ma'lumot", level: 'L1', orderIndex: 0,
      contentMd: `## Yurak etishmovchiligi nima?

Yurak etishmovchiligi — yurak to'qimalar va organlar ehtiyojini qondirish uchun yetarli qon haydolmaydi. Asorat bo'lib, o'zidan oldingi yurak kasalliklarining (MI, gipertoniya, kardiomiopatiya) natijasida rivojlanadi.

Jahon bo'yicha **64 million** kishida yurak etishmovchiligi bor.

> 💡 **Muhim**: Zamonaviy dorilar bilan yashov muddati va sifati sezilarli oshiriladi.`,
      evidenceLevel: 'A',
    },
    {
      marker: 'clinicalSigns', label: 'Belgilar', level: 'L1', orderIndex: 1,
      contentMd: `## Yurak etishmovchiligi belgilari

**Asosiy belgilar:**
- 😮‍💨 **Nafas qisishi** — dastlab harakatda, keyinchalik tinch holatda
- 🦵 **Oyoq shishi** (passiv gidrops) — kechqurun kuchayadi
- 😴 **Charchash** — oddiy yurish ham qiyinlashadi
- 🛏️ **Yotganda nafas qisinqiraash** — 2–3 yostiqda yotishga majbur

**Og'ir belgilar:**
- Ko'k ko'pikli balg'am (o'pka shishi)
- Qorin kattalashuvi (astsit)
- Yurak urishi tezlashishi

### ⚠️ Tezkor yordam:
- To'satdan kuchli nafas qisishi — o'pka shishi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'whenToSeeDoctor', label: 'Qachon shifokorga borish?', level: 'L1', orderIndex: 2,
      contentMd: `## Qachon kardiologa borish kerak?

### 📅 Murojaat:
- Nafas qisishi + oyoq shishi bilan
- Vazn 2–3 kunda 2 kg oshsa (suyuqlik to'planishi)
- Horib-charchash holati kuchaysa

### ⚠️ TEZKOR (103):
- To'satdan kuchli nafas qisishi, ko'pik
- Ko'karish (sianoz)
- Ko'krak og'rig'i`,
      evidenceLevel: 'A',
    },
    {
      marker: 'doNot', label: "Nimalar mumkin emas!", level: 'L1', orderIndex: 3,
      contentMd: `## Yurak etishmovchiligida nima qilmaslik kerak

- ❌ **Diuretiklar, beta-blokerlarni to'xtatish** — dekompensatsiya
- ❌ **Tuz ko'p iste'mol qilish** — suyuqlik ushlab qoladi
- ❌ **Suyuqlik cheklash ko'rsatmalarini e'tiborsiz qoldirish**
- ❌ **NSAID dorilar** (ibuprofen) — suyuqlik ushlab qoladi, buyrakni shikastlaydi
- ❌ **Alkogol** — kardiomiopatiyani kuchaytiradi`,
      evidenceLevel: 'A',
    },
    {
      marker: 'recommended', label: 'Tavsiya etiladi!', level: 'L1', orderIndex: 4,
      contentMd: `## Yurak etishmovchiligida foydali harakatlar

- ✅ **Har kuni vazn o'lchash** — 2 kg oshsa shifokorga xabar berish
- ✅ **Tuz chegaralash** — kuniga 2 g dan kam
- ✅ **ACEI/ARB + beta-bloker + diuretik** — asosiy dori triadi
- ✅ **EF < 35% bo'lsa** — ICD yoki resinkronizatsiya (CRT) tavsiya
- ✅ **Engilroq jismoniy mashq** — o'rtacha, shifokor ruxsati bilan
- ✅ **O'z-o'zini nazorat** — simptomlар kuzati, kundalik yurita`,
      evidenceLevel: 'A',
    },
    {
      marker: 'prevention', label: 'Profilaktika', level: 'L1', orderIndex: 5,
      contentMd: `## Yurak etishmovchiligining oldini olish

- 💊 **Gipertoniyani nazorat** — eng muhim risk omil
- 🩺 **MI keyin** kardioreabilitatsiya va dorilarni muntazam ichish
- 🚭 **Chekishni to'xtatish**
- ⚖️ **Semirishdan saqlanish**
- 🍎 **Yurak sog'lom ovqatlanish** — DASH dieta
- 🏃 **Muntazam aerob mashq** — yurish, suzish`,
      evidenceLevel: 'A',
    },
  ],
  symptoms: [
    { code: 'DYSPNEA_ON_EXERTION', nameUz: 'Harakatda nafas qisishi', category: 'kardiovaskular', bodyZone: 'chest', isRedFlag: false, weight: 0.9, isRequired: true, isExcluding: false },
    { code: 'ORTHOPNEA', nameUz: 'Yotganda nafas qisinqi, baland yostiqda yotish', category: 'kardiovaskular', bodyZone: 'chest', isRedFlag: false, weight: 0.85, isRequired: false, isExcluding: false },
    { code: 'PEDAL_EDEMA', nameUz: 'Oyoq (tuproq ustida) shishishi', category: 'kardiovaskular', bodyZone: 'lower_limb', isRedFlag: false, weight: 0.85, isRequired: false, isExcluding: false },
    { code: 'FATIGUE_CHRONIC', nameUz: 'Doimiy charchash, faollikning pasayishi', category: 'umumiy', isRedFlag: false, weight: 0.75, isRequired: false, isExcluding: false },
    { code: 'RAPID_WEIGHT_GAIN', nameUz: '2–3 kunda 2 kg tez vazn oshishi', category: 'kardiovaskular', isRedFlag: false, weight: 0.8, isRequired: false, isExcluding: false },
    { code: 'PULMONARY_EDEMA_SIGNS', nameUz: 'Ko\'pik balg\'am, kuchli nafas qisishi (o\'pka shishi)', category: 'kardiovaskular', isRedFlag: true, weight: 1.0, isRequired: false, isExcluding: false },
  ],
};

// ── STUBS (metadata-only, ≥ 50 kasallik uchun) ────────────────────────────────

export const stubs: StubFixture[] = [
  // --- Allaqachon to'liq fixture sifatida mavjud (seed script chiqarib tashlaydi) ---
  { slug: 'diabet-1', icd10: 'E10', nameUz: '1-tur qand kasalligi', nameRu: 'Сахарный диабет 1 типа', category: 'endokrinologiya' },
  { slug: 'surunkali-bronxit', icd10: 'J42', nameUz: 'Surunkali bronxit', nameRu: 'Хронический бронхит', category: 'pulmonologiya' },
  { slug: 'oshqozon-yara', icd10: 'K25.9', nameUz: 'Oshqozon yarasi', nameRu: 'Язва желудка', category: 'gastroenterologiya' },
  { slug: 'ichak-yara', icd10: 'K26.9', nameUz: '12-barmoqli ichak yarasi', nameRu: 'Язва двенадцатиперстной кишки', category: 'gastroenterologiya' },
  { slug: 'osteoartrit', icd10: 'M15.9', nameUz: 'Osteoartrit', nameRu: 'Остеоартрит', category: 'revmatologiya' },
  { slug: 'gipertiroidizm', icd10: 'E05.9', nameUz: 'Gipertiroidizm', nameRu: 'Гипертиреоз', category: 'endokrinologiya' },
  { slug: 'koronar-kasallik', icd10: 'I25.9', nameUz: 'Yurak toj tomir kasalligi', nameRu: 'ИБС', category: 'kardiologiya' },
  { slug: 'aritmiya', icd10: 'I49.9', nameUz: 'Yurak aritmiyasi', nameRu: 'Аритмия сердца', category: 'kardiologiya' },
  { slug: 'epilepsiya', icd10: 'G40.9', nameUz: 'Epilepsiya', nameRu: 'Эпилепсия', category: 'nevrologiya' },
  { slug: 'psoriaz', icd10: 'L40.9', nameUz: 'Psoriaz', nameRu: 'Псориаз', category: 'dermatologiya' },
  { slug: 'giperxolesterolemiya', icd10: 'E78.0', nameUz: 'Giperxolesterolemiya', nameRu: 'Гиперхолестеринемия', category: 'kardiologiya' },
  { slug: 'osteoporoz', icd10: 'M81.9', nameUz: 'Osteoporoz', nameRu: 'Остеопороз', category: 'revmatologiya' },
  // --- Yangi stublar (50 kasallikka yetkazish uchun) ---
  { slug: 'sook', icd10: 'J44.1', nameUz: "Surunkali obstruktiv o'pka kasalligi (SOOK)", nameRu: 'ХОБЛ', category: 'pulmonologiya' },
  { slug: 'miyokard-infarkti', icd10: 'I21.9', nameUz: 'Miokard infarkti', nameRu: 'Инфаркт миокарда', category: 'kardiologiya' },
  { slug: 'orvi', icd10: 'J06.9', nameUz: "O'tkir respirator virus infeksiyasi (ORVI)", nameRu: 'ОРВИ', category: 'infektologiya' },
  { slug: 'gripp', icd10: 'J11.1', nameUz: 'Gripp (influenza)', nameRu: 'Грипп', category: 'infektologiya' },
  { slug: 'o-pka-sili', icd10: 'A15.0', nameUz: "O'pka sili (tuberkulyoz)", nameRu: 'Туберкулёз лёгких', category: 'ftiziatriya' },
  { slug: 'siydik-yoli-infeksiyasi', icd10: 'N39.0', nameUz: "Siydik yo'li infeksiyasi", nameRu: 'ИМП (цистит)', category: 'urologiya' },
  { slug: 'buyrak-etishmovchiligi', icd10: 'N18.9', nameUz: "Surunkali buyrak etishmovchiligi", nameRu: 'ХБП', category: 'nefrologiya' },
  { slug: 'jigar-sirrozi', icd10: 'K74.6', nameUz: 'Jigar sirrozi', nameRu: 'Цирроз печени', category: 'gastroenterologiya' },
  { slug: 'gepatit-b', icd10: 'B18.1', nameUz: 'Surunkali gepatit B', nameRu: 'Гепатит B хронический', category: 'infektologiya' },
  { slug: 'gepatit-c', icd10: 'B18.2', nameUz: 'Surunkali gepatit C', nameRu: 'Гепатит C хронический', category: 'infektologiya' },
  { slug: 'pankreatit', icd10: 'K86.1', nameUz: "Surunkali pankreatit", nameRu: 'Хронический панкреатит', category: 'gastroenterologiya' },
  { slug: 'appenditsit', icd10: 'K37', nameUz: "O'tkir appenditsit", nameRu: 'Острый аппендицит', category: 'xirurgiya' },
  { slug: 'anemiya', icd10: 'D64.9', nameUz: "Anemiya (kamqonlik)", nameRu: 'Анемия', category: 'gematologiya' },
  { slug: 'semizlik', icd10: 'E66.9', nameUz: "Semizlik (obesitet)", nameRu: 'Ожирение', category: 'endokrinologiya' },
  { slug: 'tashvish-buzilishi', icd10: 'F41.1', nameUz: "Umumlashtirilgan tashvish buzilishi", nameRu: 'ГТР', category: 'psixiatriya' },
  { slug: 'tomir-trombozi', icd10: 'I82.9', nameUz: "Chuqur vena trombozi", nameRu: 'ТГВ', category: 'angiokirurgiya' },
  { slug: 'atopik-dermatit', icd10: 'L20.9', nameUz: "Atopik dermatit (ekzema)", nameRu: 'Атопический дерматит', category: 'dermatologiya' },
  { slug: 'glaukoma', icd10: 'H40.9', nameUz: "Glaukoma", nameRu: 'Глаукома', category: 'oftalmologiya' },
  { slug: 'o-tkir-pielonefrit', icd10: 'N10', nameUz: "O'tkir pielonefrit", nameRu: 'Острый пиелонефрит', category: 'nefrologiya' },
  { slug: 'prostata-adenoma', icd10: 'N40.0', nameUz: "Prostata adenomasi (GSGO)", nameRu: 'ДГПЖ', category: 'urologiya' },
  { slug: 'o-tkir-gastroenterit', icd10: 'A09', nameUz: "O'tkir gastroenterit (diareya)", nameRu: 'Острый гастроэнтерит', category: 'infektologiya' },
];
