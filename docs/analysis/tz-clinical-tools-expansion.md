# Klinik Asboblar Katalogini Kengaytirish — TZ (GAP-05/C)

**Hujjat versiyasi**: 0.1 (draft, tasdiqlash uchun)
**Sana**: 2026-04-18
**Mualliflar (rollar)**: Tibbiy ekspert (akademik) · Biznes-analitik · Tizim-arxitektor · DevOps
**Mos yozuvlar**:
- `docs/analysis/tz-disease-kb-gaps.md` (umumiy Disease KB TZ)
- `server/prisma/schema.prisma` (RedFlagRule, ClinicalCalculator modellari)
- `src/app/calculators/` (hozirgi 4 ta kalkulyator: SCORE2, CKD-EPI 2021, CHA₂DS₂-VASc, HAS-BLED)
- `src/app/lib/red-flag-engine.ts` (8 ta scoped rule)

---

## 0. Boshqaruv xulosasi (Executive Summary)

### 0.1 Muammo

Hozirgi platformada **4 ta kalkulyator + 8 ta red-flag qoidasi** mavjud bo'lib, asosan **yurak-qon tomir** va **endokrin** kasalliklarga yo'naltirilgan. Boshqa yuqori chastotali kasalliklar (pnevmoniya, COPD, astma, jigar sirrozi, pankreatit, migren, depressiya, osteoporoz va h.k.) uchun bemor/shifokor darhol ishlata oladigan **evidensiya bilan tasdiqlangan smart-asboblar yo'q**.

### 0.2 Maqsad

Qaysi kasallik uchun qanday klinik asbob (**calculator / score / questionnaire / algorithm**) yaratish kerakligini **guideline darajasidagi manbalarga** (ESC, AHA/ACC, ADA, KDIGO, GOLD, GINA, NICE, WHO, KDIGO, EULAR) tayangan holda aniqlash; prioritizatsiya qilish; arxitekturani universal moduliga kengaytirish; TZ bo'yicha bosqichli amalga oshirishga tayyorgarlik ko'rish.

### 0.3 Asosiy qarorlar (tasdiqlash zarur)

| # | Qaror | Variantlar | Tavsiya |
|---|---|---|---|
| Q1 | Asbob turlari — faqat kalkulyator yoki kengroqmi? | (a) faqat numeric score; (b) + questionnaire (PHQ-9 kabi); (c) + diagnostic criteria checker; (d) + dose calculator | **(d) Barcha 4 turni qamrab olish** — universal `ClinicalTool` konseptini joriy qilish |
| Q2 | Ma'lumotlar modeli | (a) Har tur uchun alohida model; (b) Bitta `ClinicalTool` + `toolType` discriminator; (c) Hozirgi `ClinicalCalculator` ni kengaytirish | **(b)** — `toolType` enum bilan, lekin formulaKey saqlanib qoladi |
| Q3 | Module chegarasi | (a) `triage/` ichida; (b) yangi `clinical-tools/` flat module; (c) `clinical-tools` + `clinical-tools-admin` | **(b)** — `server/src/clinical-tools/` alohida flat module sifatida |
| Q4 | Formulani qayerda hisoblash | (a) Faqat FE; (b) Faqat BE; (c) Gibrid: FE (instant UX) + BE (audit) | **(c)** — FE render uchun, BE CalculatorUsageLog uchun |
| Q5 | Bosqichli yo'l xaritasi | Wave 1 (MVP core, 10 asbob) → Wave 2 (kengayish) → Wave 3 (specialty) | Quyida §7 da |
| Q6 | Dori-doza asboblari (dose calculators) | Klinik javobgarlik katta — kiritsakmi? | **(a) Faqat ko'rsatkichli, DOCTOR audience only, disclaimer bilan** |

### 0.4 Natija

- Har kasallik kartasida **0–4 ta tegishli smart asbob** ICD/kategoriya bo'yicha avtomatik chiqadi (hozirgi CHADS-VASc/HAS-BLED modeli kabi).
- Universal `ClinicalTool` modeli `toolType`: `SCORE | QUESTIONNAIRE | CRITERIA | DOSE | STAGING` qiymatlari bilan.
- ~40 ta yangi asbob katalogga qo'shiladi (wave-3 dan keyin).
- Har bir asbob: guideline citation, primary literature reference case, unit test, i18n 3 tilda, audience gate.

---

## 1. Klinik asboblar taksonomiyasi (toolType)

Bitta universal `ClinicalTool` ostida **5 toifa** ajratiladi — har biri o'z hisoblash strategiyasiga ega, lekin UI render pattern'i va DB modeli umumiy:

| toolType | Tavsifi | Namunalar | Output shakli |
|---|---|---|---|
| `SCORE` | Raqamli chiqarishli risk skoreri | CHA₂DS₂-VASc, HAS-BLED, Wells PE, GRACE | `value + band + recommendation` |
| `QUESTIONNAIRE` | Bemor-hisoboti shakli | PHQ-9, GAD-7, CAT, ACT, AUDIT | `value + severity + interpretation` |
| `CRITERIA` | Boolean tree — "mos keladi / yo'q" | Duke (endokardit), Light's (plevral), ACR/EULAR gout | `met: boolean + matched: string[]` |
| `DOSE` | Doza hisobi (drug / IV / chemo) | Cockcroft-Gault dose adj, BSA (chemo), carboplatin AUC | `dose + unit + frequency` |
| `STAGING` | Kasallik bosqichini aniqlash | MELD-Na, Child-Pugh, NYHA, Hoehn-Yahr, KDIGO stage | `stage + prognosis + next action` |

**DB darajasida bu 5 turni farqlash shart, chunki:**
- `QUESTIONNAIRE` — odatda item-level i18n kerak (PHQ-9 ning 9 ta savoli o'zi i18n key), `SCORE` uchun — yo'q.
- `DOSE` — audience gate majburiy (`DOCTOR` only), boshqalarida ixtiyoriy.
- `CRITERIA` — output strukturasi boolean + matched-items, raqamli band emas.
- Analytics (`ClinicalToolUsageLog`) uchun group-by `toolType` kerak — adoption trendlari bo'yicha.

---

## 2. Tanlash mezoni (qanday asbob katalogga kiradi?)

Asbobning katalogga kirishi uchun **BARCHA 5 mezonga** mos kelishi shart:

1. **Guideline-endorsed** — Tier-1 xalqaro qo'llanmada (ESC, AHA/ACC, ADA, KDIGO, GOLD, GINA, NICE, WHO, EULAR, EASL, IDSA, ACR) nomi bilan tilga olingan.
2. **Actionable** — natijasi shifokor qaroriga to'g'ridan-to'g'ri ta'sir qiladi (masalan, OAC boshlash, hospitalizatsiya, statin dozasi).
3. **Bedside-feasible** — 1-2 daqiqada bemor/shifokordan olinadigan ma'lumotlar yetarli (hech qanday rare lab yoki imaging talab qilinmaydi).
4. **ICD-bounded** — bir yoki bir nechta ICD-10 prefiksi bilan aniq bog'lanadi (pollution oldini olish uchun).
5. **Locale-fit** — O'zbekiston va Markaziy Osiyo populyatsiyasiga tatbiq etish mantiqan to'g'ri (masalan, FRAX **Uzbek reference** yo'q, lekin UK pop'dan ekstrapolyatsiya qilsa bo'ladi — `regionFitness: MEDIUM` bayrog'i bilan).

---

## 3. Per-kasallik taklif (guideline asosida)

> **Format**: har bir qator — `[toolType] Asbob nomi (manba) — qisqa mantiq`.
> **Status**: ✅ mavjud · 🟢 Wave 1 · 🟡 Wave 2 · 🔵 Wave 3.

### 3.1 Yurak-qon tomir (ICD I)

**I10 — Gipertoniya**
- ✅ [SCORE] SCORE2 (ESC 2021)
- ✅ [SCORE] CKD-EPI 2021 (hypertensive nephropathy uchun)
- 🟢 [SCORE] **ASCVD Risk (AHA/ACC 2019 Pooled Cohort)** — 10 yillik ASCVD risk (stamp selection)
- 🟢 [QUESTIONNAIRE] **Home BP 7-day average** (ACC/AHA 2017) — 2× kunlik × 7 kun average
- 🟡 [CRITERIA] **Resistant HTN criteria** (AHA 2018) — 3 dori yetarli emas + mos dozada → rezistent

**I20–I25 — ACS / IHD**
- 🟢 [SCORE] **HEART Score (Backus 2013, ESC 2023 ACS)** — ED chest pain uchun
- 🟢 [SCORE] **GRACE 2.0 (ESC 2023 ACS)** — invasive strategy tanlash
- 🟡 [SCORE] TIMI Risk — UA/NSTEMI 14-day endpoints
- 🟡 [STAGING] Killip classification — acute MI haemodynamic severity

**I48 — Atrial fibrillatsiya**
- ✅ CHA₂DS₂-VASc, HAS-BLED
- 🟡 [SCORE] **SAMe-TT₂R₂ (Apostolakis 2013)** — VKA vs DOAC qaror
- 🟡 [QUESTIONNAIRE] **EHRA symptom class (ESC 2020)** — 1–4 symptom burden
- 🔵 [SCORE] ATRIA bleeding — HAS-BLED ga alternative

**I50 — Yurak yetishmovchiligi**
- 🟢 [STAGING] **NYHA Functional Class** — universal staging
- 🟡 [SCORE] **MAGGIC (Pocock 2013)** — 1/3-yillik mortality
- 🔵 [SCORE] Seattle Heart Failure Model

**I63 — Insult / G45 — TIA**
- 🟢 [SCORE] **NIHSS (National Institute of Health Stroke Scale)** — tPA/thrombectomy eligibility
- 🟢 [SCORE] **ABCD₂ (Johnston 2007, NICE 2019)** — TIA posle stroke 7-day risk
- 🟡 [CRITERIA] tPA eligibility checklist (AHA/ASA 2019) — 18 band, go/no-go
- 🟡 [STAGING] mRS (modified Rankin Scale) — functional outcome

**I26 — PE**
- 🟢 [SCORE] **Wells Score (PE)** — pre-test probability
- 🟢 [SCORE] **sPESI (ESC 2019)** — 30-day mortality, outpatient eligibility
- 🟡 [CRITERIA] **PERC rule (Kline 2008)** — low-risk PE exclusion
- 🟡 [SCORE] YEARS algorithm — D-dimer threshold adjustment

**I80 — DVT**
- 🟢 [SCORE] **Wells Score (DVT)**
- 🔵 [SCORE] Caprini — post-op VTE prophylaxis

### 3.2 Endokrinologiya (ICD E)

**E10 / E11 — Diabet**
- ✅ CKD-EPI 2021
- 🟢 [SCORE] **FINDRISC (Lindström 2003, ADA 2024 endorses)** — T2DM screening non-diabetics
- 🟢 [STAGING] **HbA1c → eAG (ADA 2024)** + target by comorbidity
- 🟢 [QUESTIONNAIRE] **Hypoglycemia awareness (Gold Score / Clarke)** — awareness loss risk
- 🟡 [DOSE] **Insulin correction factor + carb ratio** (DOCTOR-only)
- 🟡 [STAGING] DKA severity (mild/mod/severe, ADA 2024)
- 🔵 [SCORE] UKPDS Risk Engine

**E03 — Gipotireoz**
- 🟢 [DOSE] **Levothyroxine weight-based dose (1.6 μg/kg IBW)** — Jonklaas 2014, ATA guidelines (DOCTOR-only)
- 🟢 [STAGING] TSH target by age/pregnancy (ATA 2017)

**E66 — Semizlik**
- 🟢 [STAGING] **BMI + waist circumference (WHO)** — obesity class
- 🟢 [SCORE] Waist-to-height ratio (cut-off 0.5)
- 🟡 [DOSE] **Mifflin-St Jeor TEE** — deficit tavsiyasi
- 🟡 [STAGING] **Edmonton Obesity Staging System (EOSS)** — comorbidity-based 0–4

**E78 — Dislipidemiya**
- 🟢 [DOSE] **LDL target by ASCVD risk (ESC/EAS 2019)** — "treat to target" yordamchi
- 🟢 [SCORE] **Friedewald + Non-HDL calculator** — lab parsing

### 3.3 Nefrologiya (ICD N)

**N18 — CKD**
- ✅ CKD-EPI 2021
- 🟢 [SCORE] **KFRE (Tangri 2011, KDIGO 2024)** — 2/5-yillik kidney failure risk
- 🟢 [STAGING] **KDIGO CGA (eGFR × albuminuria)** — 9-box matrix
- 🟡 [DOSE] **Drug dose adjustment library** (100+ dori, eGFR-based) — DOCTOR-only

**N04 — Nefrotik sindrom**
- 🟡 [SCORE] 24h proteinuria ↔ spot UPCR/UACR converter

### 3.4 Pulmonologiya (ICD J)

**J44 — COPD**
- 🟢 [QUESTIONNAIRE] **CAT (COPD Assessment Test, GOLD 2024)** — 8 item symptom burden
- 🟢 [QUESTIONNAIRE] **mMRC Dyspnea Scale** — 0–4
- 🟢 [STAGING] **GOLD ABE classification (2024 revision)** — risk + symptom
- 🟡 [SCORE] **BODE Index (Celli 2004)** — 4-yillik mortality
- 🔵 [SCORE] CODEX — geriatric variant

**J45 — Astma**
- 🟢 [QUESTIONNAIRE] **ACT (Asthma Control Test, GINA 2024)** — 5-item
- 🟡 [QUESTIONNAIRE] **ACQ (Asthma Control Questionnaire)**
- 🟡 [STAGING] Peak flow traffic light zones (green/yellow/red)

**J18 — Pnevmoniya**
- 🟢 [SCORE] **CURB-65 (BTS 2009)** — mortality + disposition
- 🟢 [SCORE] **qSOFA (Sepsis-3, 2016)** — sepsis screen
- 🟡 [SCORE] PSI/PORT Score (Fine 1997) — disposition (kompleks, 20+ input)
- 🟡 [SCORE] SMART-COP — ICU admission risk

### 3.5 Gastroenterologiya (ICD K)

**K25–K27 — Yara / UGIB**
- 🟢 [SCORE] **Glasgow-Blatchford (Blatchford 2000, BSG 2020)** — UGIB disposition
- 🟡 [SCORE] Rockall — post-endoscopy mortality
- 🟡 [STAGING] Forrest classification (endoscopic)

**K70 — Alkogolli gepatit / K74 — Tsirroz**
- 🟢 [STAGING] **Child-Pugh Score** — classic A/B/C
- 🟢 [STAGING] **MELD-Na (UNOS 2016, EASL 2018)** — transplant priority
- 🟡 [SCORE] **Maddrey's DF (alcoholic hepatitis)** — steroid eligibility
- 🟡 [SCORE] Glasgow Alcoholic Hepatitis Score

**K85 — O'tkir pankreatit**
- 🟢 [SCORE] **BISAP (Wu 2008, ACG 2013)** — 24h mortality (5 item, bedside)
- 🟡 [SCORE] Ranson's (48h) — classic, 11 item
- 🟡 [STAGING] Revised Atlanta (2012) — mild/moderate/severe

**K50 — Kron / K51 — UC**
- 🟡 [STAGING] **Harvey-Bradshaw Index (CD)** — 5 item, bedside simplified
- 🟡 [STAGING] **Partial Mayo Score (UC)** — endoscopy-free variant
- 🔵 [SCORE] CDAI (full Crohn's)

### 3.6 Nevrologiya (ICD G)

**G40 — Epilepsiya**
- 🔵 [QUESTIONNAIRE] Seizure frequency log / QOLIE-10

**G43 — Migren**
- 🟢 [QUESTIONNAIRE] **MIDAS (Stewart 2001, IHS 2018)** — 3-month disability
- 🟡 [QUESTIONNAIRE] HIT-6 — Headache Impact Test
- 🟡 [CRITERIA] **ICHD-3 Migraine diagnostic criteria** — "meets / doesn't meet"

**G20 — Parkinson**
- 🟡 [STAGING] **Hoehn-Yahr Staging** — 1–5
- 🔵 [SCORE] UPDRS III (motor), MDS-UPDRS

**G30 / F03 — Dementsiya**
- 🟢 [QUESTIONNAIRE] **MMSE (Folstein 1975)** — 30-point
- 🟢 [QUESTIONNAIRE] **MoCA (Nasreddine 2005)** — more sensitive to MCI
- 🟡 [STAGING] **CDR (Clinical Dementia Rating)** — 0/0.5/1/2/3

### 3.7 Revmatologiya (ICD M)

**M05/M06 — Revmatoid artrit**
- 🟢 [SCORE] **DAS28-CRP / DAS28-ESR (EULAR 2010)** — disease activity, treat-to-target
- 🟡 [SCORE] CDAI / SDAI — lab-free/lab-variants
- 🟡 [QUESTIONNAIRE] HAQ-DI — functional disability

**M32 — SLE**
- 🔵 [SCORE] SLEDAI-2K — disease activity
- 🔵 [CRITERIA] **2019 EULAR/ACR SLE classification criteria**

**M10 — Podagra**
- 🟡 [CRITERIA] **2015 ACR/EULAR Gout classification** (Neogi 2015)

**M81 — Osteoporoz**
- 🟢 [SCORE] **FRAX (WHO, Kanis 2008)** — 10-yillik major osteoporotic + hip fracture risk
- 🟢 [STAGING] T-score → WHO classification (normal/osteopeniya/osteoporoz)

### 3.8 Mental salomatlik (ICD F)

**F32 — Depressiya**
- 🟢 [QUESTIONNAIRE] **PHQ-9 (Kroenke 2001)** — primary care gold standard
- 🟡 [QUESTIONNAIRE] PHQ-2 — ultra-short screen (2 ta savol)
- 🟡 [QUESTIONNAIRE] Edinburgh Postnatal Depression Scale (perinatal)

**F41 — Xavotirlanish**
- 🟢 [QUESTIONNAIRE] **GAD-7 (Spitzer 2006)** — primary care anxiety screen
- 🔵 [QUESTIONNAIRE] HAM-A — clinician-rated

**F10 — Alkogolizm**
- 🟢 [QUESTIONNAIRE] **AUDIT (WHO 1989)** — 10 item
- 🟢 [QUESTIONNAIRE] **AUDIT-C** — 3 item short screen
- 🟡 [SCORE] **CIWA-Ar** — withdrawal severity

### 3.9 Yuqumli kasalliklar (ICD A/B)

**Sepsis (R65)**
- 🟢 [SCORE] **qSOFA (Seymour 2016)** — bedside sepsis screen
- 🟢 [SCORE] **NEWS-2 (RCP 2017, NHS standard)** — universal deterioration score
- 🟡 [SCORE] SOFA — full ICU variant

**A15–A19 — Sil**
- 🔵 [QUESTIONNAIRE] TB screening questionnaire (WHO 4-symptom rule)

### 3.10 Akusherlik/Ginekologiya (ICD O)

**Universal homiladorlik**
- 🟢 [DOSE] **EDD + GA by LMP (Naegele) / USG** — gestatsion yosh
- 🟡 [STAGING] Fundal height vs weeks chart

**O14 — Preeklampsiya**
- 🟡 [SCORE] **fullPIERS (von Dadelszen 2011)** — 48h adverse outcome

**O24 — Gestatsion diabet**
- 🟡 [CRITERIA] OGTT interpretation (IADPSG / Carpenter-Coustan)

### 3.11 Onkologiya (ICD C) — umumiy

- 🟡 [STAGING] **ECOG Performance Status** — 0–4, chemo eligibility
- 🟡 [STAGING] **Karnofsky Performance Scale** — 0–100
- 🟡 [DOSE] **BSA (Mosteller, DuBois, Haycock)** — chemo dosing
- 🔵 [DOSE] Calvert AUC for carboplatin

### 3.12 Pediatriya

- 🟡 [STAGING] **APGAR (1 min + 5 min)**
- 🟡 [STAGING] **PEWS (Pediatric Early Warning Score)**
- 🟡 [SCORE] **Westley Croup Score**
- 🔵 [STAGING] Pediatric GCS

### 3.13 Universal (multi-category)

- 🟢 [STAGING] **Glasgow Coma Scale (Teasdale 1974)** — universal neurologic
- 🟢 [SCORE] **NEWS-2** — every admission deterioration signal
- 🟡 [STAGING] **Rockwood Clinical Frailty Scale** — geriatric triage

---

## 4. Arxitektura (tizim tahlili)

### 4.1 Hozirgi holat (GAP-04/05 dan keyin)

```
src/app/calculators/*.ts   — 4 ta schema (FE constants)
src/app/lib/red-flag-engine.ts  — 8 ta rule (FE constants)
server/prisma/schema.prisma:
  - RedFlagRule          (conditionJson)
  - ClinicalCalculator   (inputsJson, formulaKey)
  - RedFlagEvent         (audit)
  - CalculatorUsageLog   (adoption)
```

### 4.2 Taklif: universal `ClinicalTool` modeli

Hozirgi `ClinicalCalculator` ni **generalize** qilish — `toolType` discriminator qo'shish orqali 5 toifani bitta jadvalda boshqarish:

```prisma
enum ClinicalToolType {
  SCORE           // numeric risk/prognostic score
  QUESTIONNAIRE   // patient-reported (PHQ-9, CAT, ACT)
  CRITERIA        // boolean diagnostic (Light's, Duke)
  DOSE            // drug / IV / chemo dose
  STAGING         // disease stage (NYHA, MELD, Child-Pugh)
}

model ClinicalTool {
  id                       String            @id @default(uuid())
  toolKey                  String            @unique   // 'chads-vasc', 'phq-9', 'curb-65'
  toolType                 ClinicalToolType
  nameKey                  String            // i18n
  source                   String            // 'ESC 2020 AF Guidelines'
  formulaKey               String            // whitelisted FE function
  applicableCategories     String[]          @default([])
  applicableIcd10Prefixes  String[]          @default([])
  inputsJson               Json              // CalculatorInput[] / QuestionnaireItem[]
  outputSchemaJson         Json?             // band labels, threshold map
  showFormulaForAudience   String?           // 'PATIENT' | 'STUDENT' | 'DOCTOR' | 'L2' | 'L3'
  evidenceLevel            EvidenceLevel     @default(C)
  regionFitness            String?           // 'HIGH' | 'MEDIUM' | 'LOW' (UZ populyatsiya)
  isActive                 Boolean           @default(true)
  createdAt                DateTime          @default(now())
  updatedAt                DateTime          @updatedAt

  usageLogs                ClinicalToolUsageLog[]

  @@index([toolType])
  @@index([formulaKey])
  @@index([isActive])
}

model ClinicalToolUsageLog {
  id             String            @id @default(uuid())
  toolId         String
  diseaseId      String?
  matchSessionId String?
  toolType       ClinicalToolType  // denormalize — fast analytics
  band           String?           // 'low'/'moderate'/... (optional — CRITERIA da yo'q)
  numericValue   Decimal?          @db.Decimal(10, 3)
  booleanValue   Boolean?          // CRITERIA turidagi asboblar uchun
  createdAt      DateTime          @default(now())

  tool           ClinicalTool      @relation(fields: [toolId], references: [id], onDelete: Cascade)

  @@index([toolId])
  @@index([toolType, createdAt])
  @@index([diseaseId])
  @@index([matchSessionId])
}
```

### 4.3 Migratsiya strategiyasi

Eski `ClinicalCalculator` jadvalidagi 4 qator yangi `ClinicalTool` ga `toolType='SCORE'` bilan ko'chiriladi. SQL migratsiya:

```sql
-- 1. Yangi jadvallar (ClinicalTool + ClinicalToolUsageLog)
-- 2. Eski ClinicalCalculator dan ko'chirish (INSERT...SELECT)
-- 3. Eski ClinicalCalculator + CalculatorUsageLog ni DROP qilish
```

**Muqobil**: eski modelni qoldirib, yonida yangi universal modelni yaratish. 2 model dublirovka beradi — **tavsiya etilmaydi**.

### 4.4 Backend module strukturasi

```
server/src/clinical-tools/
  clinical-tools.module.ts
  clinical-tools.controller.ts        — public GET endpoints
  clinical-tools-admin.controller.ts  — ADMIN/EDITOR only POST/PATCH
  clinical-tools.service.ts
  dto/
    clinical-tool.dto.ts
    tool-query.dto.ts
    create-tool.dto.ts      (admin)
    update-tool.dto.ts      (admin)
  tests/
    clinical-tools.service.spec.ts
    matches-scope.spec.ts     (parity bilan FE)
```

**Triage module'dan ajratish sababi**: katalog triage jarayonidan kengroq — shifokor butun kasallik kartasi davomida asbobni ochadi, triage match session yo'q. Chegarani toza saqlaymiz.

### 4.5 Frontend module strukturasi

```
src/app/clinical-tools/
  registry.ts              — getApplicableTools({ category, icd10, toolType? })
  scores/                  — SCORE schemas
    chads-vasc.ts
    grace.ts
    heart.ts
    ...
  questionnaires/
    phq9.ts
    gad7.ts
    cat.ts
    ...
  criteria/
    lights.ts
    duke.ts
    ...
  dose/                    — DOCTOR-only
    levothyroxine.ts
    ...
  staging/
    nyha.ts
    child-pugh.ts
    meld-na.ts
    ...
  components/
    ToolRunner.tsx         — universal runner (dispatch by toolType)
    ScoreRunner.tsx
    QuestionnaireRunner.tsx
    CriteriaRunner.tsx
    DoseRunner.tsx
    StagingRunner.tsx
```

**`ToolRunner`** — asosiy UI entry point. Disease card'da:

```tsx
<ClinicalToolsSection
  category={disease.category}
  icd10={disease.icd10}
  audience={audience}    // PATIENT | STUDENT | DOCTOR
/>
```

ichida `getApplicableTools()` chaqiriladi → har bir tool uchun `<ToolCard>` (summary) + modal'da `<ToolRunner>` (dispatch by toolType).

### 4.6 Trust boundary va xavfsizlik

| Maydon | Kim yozadi | Kim o'qiydi | Izoh |
|---|---|---|---|
| `ClinicalTool` rows | ADMIN/EDITOR (admin API) | Hamma (authenticated) | Seed snapshot + live editing |
| `formulaKey` | ENGINEER (code commit) | FE `TOOL_FORMULAS` registry orqali | Whitelist — arbitrary kod yo'q |
| `inputsJson` schema | EDITOR | FE renderer | Shape validation zod schema bilan |
| Audience gate (`DOCTOR`) | BE enforces | FE hides | Dose calculators faqat DOCTOR/NURSE |
| `regionFitness=LOW` | ENGINEER | FE shows warning banner | Masalan, FRAX Uzbek pop uchun validatsiyalanmagan |

---

## 5. Biznes tahlili

### 5.1 Value proposition (persona bo'yicha)

| Persona | Value | Adoption metrikasi |
|---|---|---|
| GP / Oilaviy shifokor | Tezkor evidence-based qaror qo'llab-quvvatlash (30 soniya) | Kartada tool activation > 40% kasallik tashriflarida |
| Rezident / Talaba | Guideline + primary literature bilan o'rganish | MMSE/MoCA kabi o'rgan-amaliyot `Student` mode |
| Bemor | O'z-o'zini monitoring (PHQ-9, ACT), xavfsiz chegara ichida | Patient completion rate > 60% |
| Klinika rahbariyati | Standartlashtirilgan qaror, audit trail | `ClinicalToolUsageLog` → monthly report |

### 5.2 Prioritizatsiya matrikasi

**O'lchamlar**:
- **Impact** (1-5): klinik qaroringa qay darajada ta'sir
- **Feasibility** (1-5): amalga oshirish oddiyligi (input complexity, formula aniqligi)
- **Prevalence UZ** (1-5): O'zbekistonda kasallik chastotasi
- **Priority Score** = Impact × Feasibility × Prevalence (maksimum 125)

### 5.3 Wave 1 — Top 15 asbob (Priority > 45)

| Rank | Tool | ICD | Impact | Feas | Prev | Score | Reason |
|---|---|---|---|---|---|---|---|
| 1 | PHQ-9 | F32 | 5 | 5 | 5 | **125** | PC gold standard, simple 9-item |
| 2 | GAD-7 | F41 | 5 | 5 | 5 | **125** | PHQ-9 ga parallel, anxiety |
| 3 | CURB-65 | J18 | 5 | 5 | 5 | **125** | Bedside, disposition qarori |
| 4 | CAT | J44 | 5 | 5 | 4 | **100** | GOLD 2024, universal COPD follow-up |
| 5 | ACT | J45 | 5 | 5 | 4 | **100** | GINA 2024, astma control |
| 6 | ASCVD Risk | I10 | 5 | 4 | 5 | **100** | Statin qarori |
| 7 | HEART Score | I20 | 5 | 4 | 5 | **100** | Chest pain ED triage |
| 8 | NYHA Class | I50 | 4 | 5 | 5 | **100** | HF universal staging |
| 9 | MELD-Na | K74 | 5 | 4 | 4 | **80** | Transplant priority + mortality |
| 10 | FRAX | M81 | 4 | 4 | 5 | **80** | Osteoporosis fracture risk |
| 11 | MMSE / MoCA | G30/F03 | 4 | 4 | 5 | **80** | Dementsiya screening |
| 12 | Wells PE | I26 | 5 | 4 | 4 | **80** | PE pre-test probability |
| 13 | Child-Pugh | K74 | 4 | 5 | 4 | **80** | Classic cirrhosis staging |
| 14 | BISAP | K85 | 4 | 5 | 4 | **80** | Pankreatit 24h mortality |
| 15 | GCS + NEWS-2 | universal | 5 | 5 | 3 | **75** | Universal deterioration |

### 5.4 Wave 2 — Kengayish (30 ta asbob, Priority 30–45)

GRACE, TIMI, Killip, NIHSS, ABCD₂, sPESI, Wells DVT, SAMe-TT₂R₂, EHRA, MAGGIC, BODE, mMRC, GOLD ABE, PSI/PORT, qSOFA, Glasgow-Blatchford, Maddrey's DF, Harvey-Bradshaw, Partial Mayo, MIDAS, HIT-6, Hoehn-Yahr, DAS28, HAQ-DI, ACR/EULAR Gout, AUDIT, AUDIT-C, FINDRISC, HbA1c→eAG, Levothyroxine dose, BMI/EOSS, LDL target, KFRE, KDIGO CGA, fullPIERS, APGAR, PEWS, Westley Croup, BSA.

### 5.5 Wave 3 — Specialty (15+ asbob, Priority < 30)

UKPDS, Seattle HF, ATRIA, SLEDAI-2K, 2019 EULAR/ACR SLE, Calvert AUC, MDS-UPDRS, SOFA (full), CDAI (Crohn's), CODEX, Pediatric GCS, QOLIE-10, etc.

### 5.6 Build vs. partner

| Asbob turi | Build | Partner / license | Izoh |
|---|---|---|---|
| Oddiy SCORE (PHQ-9, CURB-65, MELD) | ✅ Build | — | Formulalar ochiq, primary literature |
| Kompleks SCORE (GRACE 2.0, UKPDS) | 🟡 Build + validate | Mumkin: MDCalc API | O'zimiz yozsak 100% test coverage kerak |
| FRAX | ⚠️ | **License** (ShefUK) | FRAX algoritmi yopiq — rasmiy license/API talab qilinadi |
| QUESTIONNAIRE (PHQ-9, GAD-7) | ✅ Build | — | Public domain, i18n o'zimiz |
| DOSE (Levothyroxine, Cockcroft) | ✅ Build | — | Ochiq formulalar |
| DAS28 | ✅ Build | — | Ochiq, EULAR |
| NIHSS | ✅ Build | — | AHA/ASA ochiq |
| MoCA | ⚠️ | **License** (MoCA Inc.) | 2019-dan beri MoCA Inc. rasmiy litsenziya talab qiladi — **institutional license** |
| MMSE | ⚠️ | **License** (PAR Inc.) | MMSE ham litsenziyali | Alternative: SLUMS, Mini-Cog (public domain) |

⚠️ **Huquqiy ogohlantiruv**: FRAX, MoCA, MMSE, HAM-A — litsenziyali. Mahsulot yo'lga qo'yilishidan oldin legal review zarur. MVP uchun **public domain alternativalar** (SLUMS, Mini-Cog) dastlab kiritilsin.

---

## 6. TZ shabloni (har bir asbob uchun to'ldiriladigan)

Har asbob uchun `docs/analysis/clinical-tools/<toolKey>.md` faylida qisqa TZ:

```
# Tool: <toolKey>

## Metadata
- toolType: SCORE | QUESTIONNAIRE | CRITERIA | DOSE | STAGING
- Source: <guideline body + year + DOI>
- Primary literature: <first author + journal + year>
- ICD-10 prefixes: [...]
- Categories: [...]
- Audience: PATIENT | STUDENT | DOCTOR
- Evidence level: A | B | C

## Inputs (item-level for QUESTIONNAIRE)
- id, type, label, unit, min/max, default, helpText

## Formula
<pseudocode or exact equation>

## Output schema
- value (numeric) | met (boolean)
- band labels + thresholds
- recommendationKey map

## Reference test cases (primary literature)
| # | Inputs | Expected value | Expected band | Source |
|---|---|---|---|---|

## i18n keys
- uz: ...
- ru: ...
- en: ...

## Acceptance criteria (Gherkin)
Given ...
When ...
Then ...

## Tasdiqlovchi
- [ ] Tibbiy ekspert (E. Ivanov, MD)
- [ ] Backend lead
- [ ] Frontend lead
```

---

## 7. Bosqichli yo'l xaritasi

### Wave 1 — MVP Complete (2-3 sprint, ~15 asbob)
- **Goal**: har kasallik kartasida kamida 1 ta asbob chiqsin.
- **Deliverables**:
  1. `ClinicalTool` universal model + migration + seed refactor
  2. Universal `ToolRunner` FE component (5 toolType dispatcher)
  3. 15 ta top-priority asbob (§5.3)
  4. i18n — 3 tilda barcha tool name + band labels
  5. Har asbob uchun reference test case (primary literature asosida)
  6. `/clinical-tools` NestJS public API + admin CRUD skeleton
- **Approval gate**: har asbob — tibbiy ekspert sign-off (checklist bilan)

### Wave 2 — Kengayish (3-4 sprint, ~30 asbob)
- **Goal**: top kasalliklarda 2-4 ta asbob to'liq qamrov.
- **Qo'shimcha**: SCORE admin CRUD UI, legal review (FRAX/MoCA), pediatrics ochilishi.

### Wave 3 — Specialty (3-4 sprint, ~15 asbob)
- **Goal**: onkologiya, ginekologiya, pediatriya chuqur qamrov.
- **Qo'shimcha**: drug-dose adjustment library (DOCTOR-only), institutional MoCA license.

### Wave 4 — Intelligence layer
- **Goal**: adoption analytics dashboard (klinikaga foydalanish statistikasi).
- **ML/LLM**: "Bu bemor uchun qaysi asbobni tavsiya etaman" prompt-based suggestion (opt-in).

---

## 8. Xavflar va kamaytirish choralari

| Xavf | Ehtimollik | Ta'sir | Mitigatsiya |
|---|---|---|---|
| Formula xato → klinik zarar | Pastsh | KRITIK | (a) primary literature reference case har asbob uchun majburiy; (b) E2E test suite; (c) disclaimer banner |
| Litsenziyali asboblar (FRAX/MoCA/MMSE) | Yuqori | Yuqori | Public-domain alternativlarni birinchi kiritish; legal review Wave-2 oldidan |
| i18n noaniq tarjima (PHQ-9 nuances) | O'rta | Yuqori | Mental health questionnaire tarjimasi — psixiatr tomonidan majburiy ko'rib chiqish |
| Over-diagnosis (tool-bias) | O'rta | O'rta | Har outputda "Bu qaror qo'llab-quvvatlashdir, klinik muhokama almashtirmaydi" disclaimer |
| Doza asboblari — javobgarlik | Pastsh | KRITIK | DOCTOR-only gate; double-check promptlari; audit log |
| O'zbek populyatsiyaga noaniq kalibrlash (SCORE2, FRAX) | Yuqori | O'rta | `regionFitness: LOW/MEDIUM` banner; retrospektiv validatsiya Wave-3 |

---

## 9. Tasdiqlash jarayoni (approval gates)

Ushbu TZ **bosqichli** tasdiqlanadi — har bir yozuvli element alohida "OK/NOT OK" bilan:

**Gate 1** — Q1–Q6 asosiy qarorlar tasdiqlanishi (ushbu hujjatning §0.3).
**Gate 2** — Prioritizatsiya jadvali (§5.3 Wave 1) — 15 asbob ro'yxatini muzlatish.
**Gate 3** — Arxitektura (§4) — universal `ClinicalTool` model + module bo'lish.
**Gate 4** — Har asbob uchun alohida TZ (§6 shabloni) — tibbiy ekspert sign-off.
**Gate 5** — Implementatsiya PR — test coverage ≥ 90%, reference case pass.

---

## 10. Keyingi qadam

**Darhol amalga oshiriladigan**: yo'q — bu hujjat **taklif**.

**Siz tasdiqlashingiz kerak**:
1. **§0.3 ning 6 ta asosiy qarorini** (Q1–Q6) — ha/yo'q/o'zgartirish.
2. **Wave 1 ro'yxatini** (§5.3 dagi 15 asbob) — qaysilarini qoldirish/olib tashlash.
3. **Arxitektura yo'nalishini** — universal `ClinicalTool` vs hozirgi `ClinicalCalculator` ni kengaytirish.

Tasdiqlangach: har bir asbob uchun `docs/analysis/clinical-tools/<toolKey>.md` alohida TZ yaratiladi → tibbiy ekspert ko'rib chiqadi → kodga o'tadi.
