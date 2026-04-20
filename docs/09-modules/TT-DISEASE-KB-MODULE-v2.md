# TT-MOD-DISEASE-KB-v2

## Kasalliklar Bazasi Moduli · Texnik Topshiriq v2.0

**Loyiha**: MedSmart-Pro (<https://medsmart-pro.vercel.app/>)
**Modul ID**: `MOD-DISEASE-KB` · **Versiya**: 2.0 · **Sana**: 2026-04-20
**Maqsad hajmi**: MVP — 50 kasallik × L1 × uz · **Keyin**: 300 kasallik × L1+L2 × uz/ru
**Feature flag**: `APP_FEATURE_DISEASE_KB` (prod default = `false`)

**Bu hujjat oldin yozilgan quyidagi 4 hujjatni BIRLASHTIRIB, qayta tartiblab beradi** (ular arxivlanadi):
- `docs/analysis/feature-analysis.md`
- `docs/analysis/implementation-plan.md`
- `docs/analysis/tz-disease-kb-gaps.md`
- `docs/09-modules/disease-kb-module.md` (eski, v1)

**Canonical biznes asosnoma**: `MedSmart-Pro_Kasalliklar_Moduli_TZ.md` (saqlanadi, 26 bo'lim, Bexterev misoli bilan).

---

## MUNDARIJA

1. Kirish va biznes konteksti
2. Stakeholders va RACI
3. User segments va personas
4. Oqim: End-to-end user journey (aniq)
5. Use cases (12 ta, Gherkin formatida)
6. Ma'lumotlar modeli (Prisma schema + ERD)
7. API shartnomasi (OpenAPI endpoint'lari)
8. AI Tavsiya integratsiyasi (symptom matching pipeline)
9. UI/UX spetsifikatsiyasi (Web + Mobile)
10. Audience mode va markerli template tizimi
11. Moderatsiya pipeline (redaktsion ish jarayoni)
12. Fayl strukturasi va kod konvensiyasi
13. Non-functional talablar (perf, a11y, i18n, security)
14. Analitika va telemetriya
15. Acceptance Criteria va DoD
16. Bosqichli joriy qilish (18 ish kunlik reja)
17. Risk register
18. Ilovalar: JSON schema, Bexterev misoli, marker dictionary

---

## 1. KIRISH VA BIZNES KONTEKSTI

### 1.1. Muammo bayoni

MedSmart-Pro platformasining asosiy oqimi `Ariza → AI Tavsiya — shikoyatim bor → simptom kiritish → Tahlil natijalari` hozirda quyidagi joyda **to'xtaydi**:

> Bemor `Migren · G43.9 · 95%` natijasini ko'radi, lekin kasallik haqida **faqat 2-3 qator** tushuntirish, 1 mutaxassis nomi va 3 ta tahlil ro'yxatini oladi. Kasallik nomi yoki MKB-10 kodiga bosish **hech narsaga olib bormaydi**.

Bu bilan bemor:
- Kasallik haqida chuqur o'qiy olmaydi (patogenez, belgilar, asoratlar, prognoz).
- O'zining simptomlarini kasallikning to'liq belgilar ro'yxati bilan **qiyoslay olmaydi**.
- Aniqlashtirilgan natijani shifokorga **strukturalangan shaklda yubora olmaydi**.

Shifokor, talaba, hamshira va mutaxassis tomondan ham shunday: **yagona, ishonchli, moderatsiyadan o'tgan, ko'p auditoriyali kasallik ma'lumotnomasi mavjud emas**.

### 1.2. Modul vazifasi

Disease KB moduli — MedSmart-Pro **klinik domain core**'i. U:

1. Bemorga chuqur, tushunarli va vizual ma'lumot beradi (L1 darajada).
2. Bemorning shikoyatlarini kasallik belgilariga **interaktiv taqqoslash** imkonini beradi.
3. Natijani **FHIR QuestionnaireResponse** formatida shifokorga yuboradi.
4. Shifokor, talaba, hamshira, mutaxassis uchun L2/L3 qatlamlarda professional kontent beradi.
5. Boshqa modullar (Konsultatsiya, Radiologiya, Uy-vizit, EHR, Triage, Ta'lim) uchun **single source of truth** bo'ladi.
6. Redaksion panel orqali **eksperti tomonidan tasdiqlangan** kontentni boshqaradi.

### 1.3. Muvaffaqiyat mezonlari (KPI)

| KPI | O'lchov | MVP (6 oy) | Target (12 oy) |
|---|---|---|---|
| Published kasalliklar soni | ta | 50 (L1 uz) | 300 (L1+L2, uz/ru) |
| Tahlil natijalari → Kasallik kartasi CTR | % | ≥ 40% | ≥ 55% |
| Simptom matcher "bor/yo'q" to'ldirish | % | ≥ 25% | ≥ 35% |
| Shifokorga yuborish konversiyasi | % | ≥ 10% | ≥ 15% |
| Karta p95 load time | ms | ≤ 1500 | ≤ 1200 |
| Shifokor NPS | ball | ≥ +20 | ≥ +40 |
| Kontent sifat shikoyatlari | ta / 1000 view | ≤ 1.0 | ≤ 0.5 |
| Moderatsiya lead time | soat | ≤ 72 | ≤ 24 |

---

## 2. STAKEHOLDERLAR VA RACI

| Vazifa | Med-prof | Tor-mut | BA | SA | UX | FE | BE | Data | QA | PM | Yurist |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kontent skeleti | A | R | C | I | C | I | I | C | I | I | I |
| Klinik aniqlik | A | R | I | I | I | I | I | C | C | I | C |
| Ma'lumot modeli | I | C | C | A/R | C | C | R | R | I | C | I |
| API spec | I | C | C | A/R | I | R | R | R | C | I | I |
| UI/UX | C | C | C | C | A/R | R | I | I | C | C | I |
| AI matcher integratsiya | I | C | C | R | C | R | A | R | C | C | I |
| Moderatsiya workflow | R | C | C | A | C | R | R | I | C | C | I |
| Compliance (PHI) | C | C | C | C | I | I | C | C | I | C | A/R |
| Release | I | I | R | R | C | C | C | C | C | A | I |

---

## 3. FOYDALANUVCHI SEGMENTLARI VA PERSONALAR

### 3.1. Asosiy personalar

**P1 — Bemor Zamira (28 yosh, Toshkent, marketing menejer)**
- Muammo: ikki kundan beri bosh og'rig'i, ko'ngil aynashi, yorug'likdan bezovtalik.
- Ehtiyoj: tushunarli til, vizual, "bu nima?" va "qachon shifokorga borish kerak?".
- View mode: **Bemor** (L1, sodda til, infografika, FAQ).

**P2 — Talaba Rustam (TashMI 4-kurs)**
- Muammo: revmatologiya imtihoniga tayyorlanyapti, Bexterev kasalligi bo'yicha aniq material kerak.
- Ehtiyoj: patogenez, tasnif, diagnostika algoritmi, klinik holatlar, lotin terminlari.
- View mode: **Talaba** (L2, akademik til, klassik protokollar).

**P3 — Hamshira Dilnoza (5 yillik tajriba, poliklinika)**
- Muammo: bemorni kuzatish rejasi, dori-darmon dozalash.
- Ehtiyoj: NANDA diagnozlari, parvarish bosqichlari, in'ektsiya qoidalari, hujjatlashtirish.
- View mode: **Hamshira** (L2, amaliy, dozalash jadvallari).

**P4 — GP Shifokor Akbar (10 yillik tajriba)**
- Muammo: bemordan kelgan simptom sessiyasi ustida qaror qabul qilish.
- Ehtiyoj: differensial diagnostika, tahlillar minimum/kengaytirilgan, mutaxassisga yo'naltirish mezonlari, WHO/ESC protokollari.
- View mode: **Shifokor** (L3, klinik algoritmlar, evidence level).

**P5 — Revmatolog Ziyoda (mutaxassis)**
- Muammo: kam uchrovchi shakllar, so'nggi tadqiqotlar.
- Ehtiyoj: EULAR/ACR guidelines, eksperimental terapiya, ilmiy maqolalar, klinik case'lar.
- View mode: **Mutaxassis** (L3+, research-grade).

**P6 — Medical Editor Saida (kontent redaktor)**
- Muammo: yangi kasallik bloklarini yaratish va moderatsiya.
- Ehtiyoj: CMS editor, marker template, manba citation, submit-for-review.
- Rol: `EDITOR`.

**P7 — Chief Medical Officer Dr. Umarov (professor)**
- Muammo: kontent klinik aniqligini tasdiqlash.
- Ehtiyoj: review queue, diff viewer, evidence level validator.
- Rol: `MEDICAL_EDITOR` / `MEDICAL_REVIEWER`.

### 3.2. Kirish rollari va ruxsatlari

| Rol | Disease list | Disease detail | Symptom matcher | Edit | Review | Publish |
|---|---|---|---|---|---|---|
| `PATIENT` | ✅ published only, L1 | ✅ L1 | ✅ | ❌ | ❌ | ❌ |
| `STUDENT` | ✅ L1+L2 | ✅ L1+L2 | ✅ read-only | ❌ | ❌ | ❌ |
| `NURSE` | ✅ L1+L2 | ✅ L1+L2 (hamshira mode) | ✅ read-only | ❌ | ❌ | ❌ |
| `DOCTOR` | ✅ all levels | ✅ all levels | ✅ incoming | ❌ | ❌ | ❌ |
| `SPECIALIST` | ✅ all | ✅ all (L3+ research) | ✅ incoming | ❌ | ❌ | ❌ |
| `EDITOR` | ✅ + DRAFT | ✅ + DRAFT | ✅ | ✅ draft | ❌ | ❌ |
| `MEDICAL_EDITOR` | ✅ + REVIEW | ✅ all status | ✅ | ✅ | ✅ | ❌ |
| `ADMIN` | ✅ all | ✅ all | ✅ | ✅ | ✅ | ✅ |

---

## 4. END-TO-END USER JOURNEY (ANIQ)

### 4.1. Bemor oqimi (asosiy — P0)

```
┌──────────────────┐   ┌──────────────────────┐   ┌─────────────────────┐
│  Ariza sahifasi  │──▶│ AI Tavsiya — shikoyat │──▶│ Simptom kiritish    │
│  (/arizalar)     │   │ (/application/new)    │   │  body-zones + list  │
└──────────────────┘   └──────────────────────┘   └──────────┬──────────┘
                                                              │
                                                              ▼
                                                   ┌──────────────────────┐
                                                   │ Tahlil natijalari    │
                                                   │ (/application/:id/   │
                                                   │  results)            │
                                                   │  - Migren 95%        │
                                                   │  - Gipertoniya 78%   │
                                                   │  - Gastrit 65%       │
                                                   └──────────┬───────────┘
                                                              │ [click kasallik nomi yoki MKB-10]
                                                              ▼
                                                   ┌─────────────────────────┐
                                                   │ Kasallik Kartasi (NEW)  │
                                                   │ /disease/migraine       │
                                                   │ ?sessionId=...          │
                                                   │                         │
                                                   │ Tab1 Umumiy             │
                                                   │ Tab2 Belgilar ← matcher │
                                                   │ Tab3 Diagnostika        │
                                                   │ Tab4 Davolash           │
                                                   │ Tab5 Bosqichlar         │
                                                   │ Tab6 Prognoz            │
                                                   │ Tab7 FAQ                │
                                                   │                         │
                                                   │ [Symptom Matcher Sheet] │
                                                   │ Bor / Yo'q / Aniq emas  │
                                                   │                         │
                                                   │ [Shifokorga yuborish]   │
                                                   └──────────┬──────────────┘
                                                              │
                                                              ▼
                                                   ┌─────────────────────────┐
                                                   │ SendToDoctor Dialog     │
                                                   │ - Shifokor picker       │
                                                   │ - FHIR preview          │
                                                   │ - Confirmation          │
                                                   └──────────┬──────────────┘
                                                              │ POST /symptom-sessions
                                                              ▼
                                                   ┌─────────────────────────┐
                                                   │ Success: "Yuborildi"    │
                                                   │ + tracking ID           │
                                                   │ + saqlangan sessiyalar  │
                                                   └─────────────────────────┘
```

### 4.2. Shifokor oqimi

```
Dashboard → "Yangi sessiyalar (3)" badge
          ↓
IncomingCasePanel (/cases/inbox)
  - Sessiya kartasi: Bemor ismi, vaqt, Top 3 DDx, red flags
          ↓ [Ochish]
CaseDetail (/cases/:id)
  - Bemor simptomlari (checkbox state)
  - AI DDx ro'yxati (probability)
  - Bemor "bor/yo'q" javoblari
  - "Kasallik Kartasiga o'tish" deep-link
  - "Konsultatsiyaga taklif qilish" / "Tahlil buyurish"
          ↓
Consultation module
```

### 4.3. Editor oqimi

```
Admin panel → KB Diseases (/admin/kb/diseases)
            ↓
   - Search, filter (status, category, ICD)
   - [+] Yangi kasallik
   - Bosish → Editor (/admin/kb/diseases/:id/edit)
              ├── Metadata tab (ICD, nameUz/Ru/En, synonyms, audience, severity)
              ├── Blocks tab (40+ marker, har biri markdown editor)
              │   ├── Marker dropdown (etiology, pathogenesis, …)
              │   ├── Level (L1/L2/L3)
              │   ├── Evidence level (A/B/C)
              │   ├── Audience visibility (patient/student/…)
              │   ├── Markdown content
              │   └── Citations (Reference picker, PubMed search)
              ├── Symptoms tab (DiseaseSymptom M2M, weight, specificity)
              ├── Stages tab (DiseaseStage, acute/subacute/chronic)
              ├── Medications tab (DiseaseMedication, dosing, visibility)
              ├── Lab tests tab (DiseaseLabTest, LOINC)
              ├── Clinical cases tab (ClinicalCase, anonymized)
              └── Media tab (images, diagrams)
            ↓
   [Draft saqlash] → status=DRAFT
   [Ko'rib chiqishga yuborish] → status=REVIEW (medical_editor'ga email)
```

### 4.4. Medical Editor (reviewer) oqimi

```
Review Queue (/admin/kb/moderation)
  - Filter: status=REVIEW, category, author
  - Har yozuv: title, author, submitted_at, diff size
          ↓ [Review]
ModerationView (/admin/kb/moderation/:blockId)
  - Diff viewer (before/after)
  - Citations panel
  - Evidence level validator
  - [Approve] → status=APPROVED → (optional: publish now)
  - [Reject] → status=DRAFT + comment
  - [Request changes] → status=DRAFT + annotations
```

---

## 5. USE CASES (12 ta, Gherkin formatida)

### UC-01: Bemor simptomlardan kasallik kartasiga o'tadi

```gherkin
Feature: Tahlil natijalaridan kasallik kartasiga deep-link
  As a patient
  I want to click on a diagnosis in the results screen
  So that I can read full details about that disease

  Scenario: Bemor Migren kartasiga o'tadi
    Given I am on /application/:id/results
    And  I see "Migren · G43.9 · 95%"
    When I tap on the disease name
    Then I should be navigated to /disease/migraine?sessionId=:id
    And  The page should load in <= 1.5s (p95)
    And  The Umumiy tab should be active by default
    And  A "Simptom matcher" CTA should be visible
```

### UC-02: Bemor simptomlarni "bor/yo'q/aniq emas" bilan belgilaydi

```gherkin
Scenario: Interaktiv simptom taqqoslash
  Given I am on /disease/migraine?sessionId=abc123
  And  The session has 4 initial symptoms
  When I open the Symptom Matcher sheet
  Then I see the full symptom list for Migren (12 symptoms)
  And  My initial 4 symptoms are pre-filled as "Bor"
  When I toggle "Aura (ko'rish) buzilishi" to "Bor"
  Then The match score updates from 78% to 86% in real-time
  And  The updated score is persisted via PATCH /symptom-sessions/abc123
```

### UC-03: Bemor natijani shifokorga yuboradi

```gherkin
Scenario: FHIR export va shifokorga yuborish
  Given I completed the Symptom Matcher
  And  Match score is >= 70%
  When I click "Shifokorga yuborish"
  Then A doctor-picker dialog opens with my previous doctors + recommended specialists
  When I select "Dr. Nevropatolog Akbar" and confirm
  Then A POST /symptom-sessions/:id/submit is sent
  And  The payload is a valid FHIR R4 QuestionnaireResponse
  And  Doctor receives a notification (email + in-app)
  And  I see confirmation with tracking ID "QR-XXXX"
```

### UC-04: Shifokor kelgan sessiyani ko'radi

```gherkin
Scenario: IncomingCasePanel
  Given I am a DOCTOR logged in
  And  3 sessions are assigned to me
  When I navigate to /cases/inbox
  Then I see a list of sessions sorted by red-flag severity then time
  And  Each card shows: patient name, top DDx, match score, age, timestamp
  When I click on a session
  Then I navigate to /cases/:id
  And  I see: full symptom list with patient responses, AI DDx, notes
  And  I can click "Kasallik kartasiga o'tish" to see same card patient saw
```

### UC-05: Medical Editor yangi kasallikni DRAFT qiladi

```gherkin
Scenario: Create new disease entry
  Given I am EDITOR
  When I go to /admin/kb/diseases and click [+ Yangi]
  Then I see the Editor with empty Metadata tab
  When I fill ICD-10, nameUz, slug
  And  I add an "Umumiy ma'lumot" block with marker=generalInfo, level=L1
  And  I click "Draft saqlash"
  Then A Disease row is created with status=DRAFT
  And  A DiseaseBlock row is created with status=DRAFT
  And  I can return later to continue editing
```

### UC-06: Editor review'ga yuboradi, blok avtomatik REVIEW statusiga o'tadi

```gherkin
Scenario: Submit-for-review
  Given a DRAFT disease with 6 filled blocks
  When editor clicks "Ko'rib chiqishga yuborish"
  Then All blocks transition DRAFT -> REVIEW
  And  Disease.status = REVIEW
  And  MEDICAL_EDITOR receives a notification
  And  ReviewQueue shows this disease
```

### UC-07: Medical Editor approve qiladi

```gherkin
Scenario: Approve via moderation queue
  Given a disease in REVIEW status
  When MEDICAL_EDITOR opens it in /admin/kb/moderation/:id
  And  All blocks have Evidence Level >= B
  And  All required markers (L1) are present
  And  MEDICAL_EDITOR clicks "Approve"
  Then All blocks transition REVIEW -> APPROVED
  And  Editor may optionally "Publish now" -> status=PUBLISHED
  And  A DiseaseEditLog entry is created
```

### UC-08: Published blok tahrirlansa, avtomatik REVIEW ga qaytadi

```gherkin
Scenario: Edit published block triggers re-review
  Given a PUBLISHED disease
  When EDITOR modifies a block's content
  And  Clicks "Save"
  Then The block's status transitions PUBLISHED -> REVIEW
  And  Disease.lastReviewAt is set to NULL
  And  Disease.status = REVIEW (if any block is in REVIEW)
  And  Public API /diseases/:slug still returns last APPROVED snapshot
  And  MEDICAL_EDITOR is notified
```

### UC-09: Bemor audience mode'dan foydalanmaydi, faqat L1 ko'radi

```gherkin
Scenario: Audience-based content filtering
  Given I am a PATIENT
  When I view /disease/migraine
  Then Only blocks with level=L1 AND audienceVisibility includes PATIENT are visible
  And  Blocks with level=L2 or L3 are hidden (or shown collapsed with "Shifokor uchun" label)
  And  Medications are shown but dosing is hidden if visibility=DOCTOR
```

### UC-10: Student L2 ko'rsa, patogenez ochiladi

```gherkin
Scenario: Student view
  Given I am a STUDENT
  When I view /disease/migraine
  Then Blocks with level=L1 AND L2 are visible
  And  Patogenez bloki, tasnif, klassik protokollar ko'rinadi
```

### UC-11: Shifokor custom notes qo'shadi

```gherkin
Scenario: Doctor clinical notes
  Given I am a DOCTOR viewing a session in /cases/:id
  When I type notes in "Klinik xulosa" field
  And  Click "Saqlash"
  Then A ClinicalNote is attached to the session
  And  It is visible to MEDICAL_EDITOR (aggregate view) but NOT to patient
```

### UC-12: Tarjima workflow (uz → ru)

```gherkin
Scenario: Block translation
  Given a block with translationStatusUz=VERIFIED, translationStatusRu=PENDING
  When TRANSLATOR opens /admin/kb/translate
  And  Fills in the Russian version
  And  Clicks "Submit for translation review"
  Then translationStatusRu transitions PENDING -> REVIEW
  And  MEDICAL_TRANSLATOR is notified
```

---

## 6. MA'LUMOTLAR MODELI

### 6.1. ERD (yuqori darajali)

```
Disease ──< DiseaseBlock (marker, level, audience, evidenceLevel, content, status)
   │    ──< DiseaseSymptom >── Symptom
   │    ──< DiseaseReference >── Reference
   │    ──< DiseaseStage
   │    ──< DiseaseMedication >── Medicine
   │    ──< DiseaseLabTest >── LabTest
   │    ──< ClinicalCase
   │    ──< RegionEpidemiology
   │    ──< DiseaseSpecialist >── User (specialist)
   │    ──< DiseaseScientist (NEW) — olimlar, ilmiy tadqiqotchilar
   │    ──< DiseaseResearch (NEW) — so'nggi izlanishlar, clinical trials
   │    ──< DiseaseGenetic (NEW) — genetik markerlar, qon guruhi
   │    ──< DiseaseEditLog
   │
SymptomMatchSession ──< SessionSymptom (patient responses: HAS/NOT_HAS/UNSURE)
   │    └── Disease (matched)
   │    └── User (patient) + User (doctor, nullable)
```

### 6.2. Yangi Prisma modellari (qo'shiladigan)

**Mavjud 15+ model (Disease, DiseaseBlock, Reference, SymptomMatchSession, …) tegmaydi.** Quyidagilar qo'shiladi:

```prisma
model DiseaseScientist {
  id          String   @id @default(cuid())
  diseaseId   String
  disease     Disease  @relation(fields: [diseaseId], references: [id])
  fullName    String
  role        ScientistRole // DISCOVERER, CLASSIFIER, CONTRIBUTOR, RESEARCHER
  country     String?
  birthYear   Int?
  deathYear   Int?
  bio         String?  @db.Text
  contributions String? @db.Text
  photoUrl    String?
  references  Reference[] @relation("ScientistRefs")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model DiseaseResearch {
  id          String   @id @default(cuid())
  diseaseId   String
  disease     Disease  @relation(fields: [diseaseId], references: [id])
  title       String
  authors     String   // comma-separated or JSON
  journal     String?
  year        Int
  doi         String?
  pubmedId    String?
  nctId       String?  // ClinicalTrials.gov ID
  type        ResearchType // RCT, META_ANALYSIS, COHORT, CASE_REPORT, …
  summary     String   @db.Text
  evidenceLevel EvidenceLevel
  isLandmark  Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model DiseaseGenetic {
  id          String   @id @default(cuid())
  diseaseId   String
  disease     Disease  @relation(fields: [diseaseId], references: [id])
  geneSymbol  String?  // e.g., HLA-B27 for Bexterev
  variantType String?
  inheritancePattern InheritancePattern? // AUTOSOMAL_DOMINANT, …
  penetrance  Float?
  bloodGroup  BloodGroup? // если genotip qon guruhiga ta'sir qiladi
  populationNote String? @db.Text // e.g., "O'zbek populyatsiyasida 8% uchraydi"
}

enum ScientistRole { DISCOVERER CLASSIFIER CONTRIBUTOR RESEARCHER EDITOR }
enum ResearchType  { RCT META_ANALYSIS SYSTEMATIC_REVIEW COHORT CASE_CONTROL CASE_SERIES CASE_REPORT GUIDELINE }
enum InheritancePattern { AUTOSOMAL_DOMINANT AUTOSOMAL_RECESSIVE X_LINKED_DOMINANT X_LINKED_RECESSIVE MITOCHONDRIAL COMPLEX SPORADIC }
enum BloodGroup { A_POS A_NEG B_POS B_NEG AB_POS AB_NEG O_POS O_NEG }
```

**`SymptomMatchSession` kengaytiriladi**:

```prisma
model SymptomMatchSession {
  id            String   @id @default(cuid())
  patientId     String?
  patient       User?    @relation("PatientSessions", fields: [patientId], references: [id])
  doctorId      String?
  doctor        User?    @relation("DoctorSessions", fields: [doctorId], references: [id])
  diseaseId     String?  // top match
  disease       Disease? @relation(fields: [diseaseId], references: [id])
  matchScore    Float    // 0-100
  status        SessionStatus @default(DRAFT) // DRAFT, SUBMITTED, UNDER_REVIEW, RESOLVED
  // NEW:
  bodyZones     String[] // ["abdomen", "head"]
  ddxTop5       Json     // [{diseaseId, slug, name, probability}]
  redFlags      Json     // [{symptomCode, action}]
  submittedAt   DateTime?
  reviewedAt    DateTime?
  clinicalNote  String?  @db.Text
  fhirJson      Json?    // full FHIR QuestionnaireResponse
  sessionSymptoms SessionSymptom[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SessionSymptom {
  id          String   @id @default(cuid())
  sessionId   String
  session     SymptomMatchSession @relation(fields: [sessionId], references: [id])
  symptomId   String
  symptom     Symptom  @relation(fields: [symptomId], references: [id])
  response    SymptomResponse @default(UNSURE) // HAS, NOT_HAS, UNSURE
  severity    Int?     // VAS 0-10
  duration    String?  // "2 hafta", "kuniga 3 marta"
  notes       String?  @db.Text
  @@unique([sessionId, symptomId])
}

enum SymptomResponse { HAS NOT_HAS UNSURE }
enum SessionStatus   { DRAFT SUBMITTED UNDER_REVIEW RESOLVED ARCHIVED }
```

### 6.3. Migration reja

`server/prisma/migrations/20260421_disease_kb_v2_extensions/migration.sql` — bitta atomic migration.

---

## 7. API SHARTNOMASI

Barcha endpoint'lar `/api/v1` prefiksida. Auth: JWT Bearer token. Swagger: `/api/docs`.

### 7.1. Mavjud (saqlanadi)

| Method | Path | Rol | Izoh |
|---|---|---|---|
| GET | `/diseases` | any | List, filter (q, category, icd, audience, status, page) |
| GET | `/diseases/:slug` | any | Single disease (audience param: patient/student/doctor/…) |
| GET | `/diseases/:slug/symptoms` | any | Related symptoms with weight |
| POST | `/diseases` | EDITOR+ | Create DRAFT |
| PATCH | `/diseases/:id` | EDITOR+ | Update metadata |
| DELETE | `/diseases/:id` | ADMIN | Archive |

### 7.2. Qo'shiladigan endpoint'lar

```
POST   /api/v1/symptom-sessions
       Body: {bodyZones, symptoms[], answers[], diseaseMatches[]}
       Resp: {id, matchScore, ddxTop5, status:DRAFT}
       Auth: PATIENT

PATCH  /api/v1/symptom-sessions/:id
       Body: {sessionSymptoms: [{symptomId, response, severity, duration, notes}]}
       Resp: {id, matchScore (recalculated), ...}
       Auth: PATIENT (owner)

POST   /api/v1/symptom-sessions/:id/submit
       Body: {doctorId, fhirJson}
       Resp: {id, status:SUBMITTED, trackingId}
       Auth: PATIENT (owner)

GET    /api/v1/symptom-sessions?doctorId=:id&status=SUBMITTED
       Resp: [{id, patient, diseaseMatch, matchScore, redFlags, createdAt}]
       Auth: DOCTOR (owner) | ADMIN

GET    /api/v1/symptom-sessions/:id
       Resp: {full session + sessionSymptoms + disease + patient}
       Auth: DOCTOR (assigned) | PATIENT (owner) | ADMIN

POST   /api/v1/symptom-sessions/:id/clinical-note
       Body: {note}
       Auth: DOCTOR

---- BLOCK-LEVEL CRUD ----

GET    /api/v1/diseases/:id/blocks
       Resp: [{id, marker, level, audience, content, status, references}]

POST   /api/v1/diseases/:id/blocks
       Body: {marker, level, audience, contentMd, evidenceLevel, references[]}
       Auth: EDITOR+

PATCH  /api/v1/diseases/:id/blocks/:marker
       Body: {contentMd, evidenceLevel, references[]}
       Resp: {id, status:REVIEW (avtomatik)}
       Auth: EDITOR+
       Side effect: Agar block.status=PUBLISHED edi, REVIEW ga qaytadi.

POST   /api/v1/diseases/:id/blocks/:marker/submit-for-review
       Auth: EDITOR+

POST   /api/v1/diseases/:id/blocks/:marker/approve
       Auth: MEDICAL_EDITOR+

POST   /api/v1/diseases/:id/blocks/:marker/reject
       Body: {reason}
       Auth: MEDICAL_EDITOR+

POST   /api/v1/diseases/:id/publish
       Resp: {status:PUBLISHED, publishedAt}
       Auth: ADMIN | MEDICAL_EDITOR

---- MODERATION QUEUE ----

GET    /api/v1/moderation/queue?status=REVIEW&category=...
       Resp: [{diseaseId, blockId, marker, editor, submittedAt, diff}]
       Auth: MEDICAL_EDITOR+

---- COHORT ANALYTICS (for doctors/students) ----

GET    /api/v1/diseases/:id/cohort?ageRange=...&gender=...
       Resp: {totalSessions, avgAge, genderDist, topSymptoms[], regionDist[]}
       Auth: DOCTOR+ | STUDENT (aggregate only, anonymized)
```

### 7.3. WebSocket (real-time)

- `ws /cases/inbox` — DOCTOR uchun yangi sessiya kelganda push notif.
- `ws /moderation/queue` — MEDICAL_EDITOR uchun yangi review.

---

## 8. AI TAVSIYA INTEGRATSIYASI

### 8.1. Oqim

```
[DiagnosisResults]
    └── runDiagnosis(bodyZones, symptoms, answers)
        ├── Client-side matcher (fallback, offline uchun)
        └── POST /api/v1/triage/match (preferred)
             └── Server: pgvector semantic search + rule engine
                  └── DDx top 5 + red flags
    └── Click on disease card
        └── navigate(`/disease/${slug}?sessionId=${sessionId}`)

[DiseaseCard]
    └── GET /diseases/:slug?audience=patient&level=L1
    └── Load DiseaseBlock[], Symptom[], Reference[]
    └── Open Symptom Matcher Sheet
        └── PATCH /symptom-sessions/:id with updated responses
             └── Server: recalculate matchScore via weights
```

### 8.2. Matcher algoritmi (server-side)

Sof mantiq (backend `TriageService.match(input)`):

1. **Normalize** input symptoms (SNOMED + local taxonomy).
2. **Candidate retrieval**: pgvector similarity search on `Disease.embedding` (top 50).
3. **Feature scoring** per disease:
   - `sum(weight × matchedSymptom) - sum(weight × excludedSymptom)`
   - `requiredSymptoms`: agar bor bo'lmasa — 0.
   - Body zone filter (if specified).
4. **Normalization** to [0, 95] range.
5. **Red flag detection**: `redFlagSymptoms[]` aniqlansa — `urgency=EMERGENCY`.
6. **Return**: `ddxTop5`, `redFlags`, `matchScore`, `explainability{blockers, boosters}`.

### 8.3. Fallback logika (client)

Agar `/triage/match` 500 ms ichida javob bermasa — client-side `runDiagnosis()` (mock KB) ishlatilib, `source: "offline"` belgilanadi.

---

## 9. UI/UX SPETSIFIKATSIYASI

### 9.1. Ekranlar ro'yxati (aniq fayl yo'li bilan)

| # | Ekran | Yo'l | Fayl |
|---|---|---|---|
| E1 | Diagnosis Results (mavjud, tuzatish) | `/application/:id/results` | `src/app/components/screens/patient/DiagnosisResults.tsx` |
| **E2** | **Disease Card (YANGI)** | `/disease/:slug` | `src/app/components/screens/patient/DiseaseCard.tsx` |
| **E3** | **Symptom Matcher Sheet (YANGI)** | modal in E2 | `src/app/components/screens/patient/SymptomMatcherSheet.tsx` |
| **E4** | **Send To Doctor Dialog (YANGI)** | modal in E2 | `src/app/components/screens/patient/SendToDoctor.tsx` |
| **E5** | **Doctor Incoming (YANGI)** | `/cases/inbox` | `src/app/components/screens/doctor/IncomingCasePanel.tsx` |
| **E6** | **Case Detail (YANGI)** | `/cases/:id` | `src/app/components/screens/doctor/CaseDetailScreen.tsx` |
| E7 | KB Diseases List (mavjud) | `/admin/kb/diseases` | `src/app/components/screens/web/WebRefKBDiseasesScreen.tsx` |
| **E8** | **KB Disease Editor (YANGI)** | `/admin/kb/diseases/:id/edit` | `src/app/components/screens/web/WebKBDiseaseEditor.tsx` |
| **E9** | **KB Moderation Queue (YANGI)** | `/admin/kb/moderation` | `src/app/components/screens/web/WebKBModerationQueue.tsx` |

### 9.2. Disease Card (E2) — tafsilotlar

Layout (mobile-first):

```
┌─────────────────────────────────────────────┐
│ [←] Migren · Migraine · G43.9   [Star]      │
│ Klinik protokol (WHO 2022)                  │
├─────────────────────────────────────────────┤
│ Audience: [Bemor] Talaba Hamshira Shifokor Mut│
├─────────────────────────────────────────────┤
│ Tabs: Umumiy │ Belgilar │ Diagnostika │ ... │
├─────────────────────────────────────────────┤
│ [Tab content — marker blocks, collapse/expand]│
│ ┌─ Umumiy ma'lumot ──────────────────┐      │
│ │ Migren — neyrologik kasallik...    │ [src]│
│ └────────────────────────────────────┘      │
│ ┌─ Qachon shifokorga borish? ────────┐      │
│ │ • Birinchi marta kuchli bosh og'ri │      │
│ │ • 72 soatdan ortiq davom etsa      │      │
│ └────────────────────────────────────┘      │
├─────────────────────────────────────────────┤
│ [⊞ Simptom taqqoslash] [📤 Shifokorga yubor] │
└─────────────────────────────────────────────┘
```

Komponentlar (shadcn/ui):
- `<Tabs>`, `<Accordion>`, `<Badge>`, `<Popover>` (manba sitatasi uchun), `<Sheet>` (Matcher uchun), `<Dialog>` (SendToDoctor uchun).

Design tokens: `demo.html` ichidagi `:root` CSS variables (primary `#2E75B6`, secondary `#8E6AC7`, …) **Tailwind config'ga ko'chiriladi**.

### 9.3. Symptom Matcher Sheet (E3)

```
┌─────────────────────────────────────────────┐
│ Simptom taqqoslash · Migren                 │
│ ─────────────────────────────────────────── │
│ Bor    Yo'q    Aniq emas                    │
│  ( )    (X)     ( )   │ Bir tomonlama og'riq│
│  (X)    ( )     ( )   │ Pulsatsiyali og'riq │
│  (X)    ( )     ( )   │ Ko'ngil aynashi     │
│  ( )    ( )     (X)   │ Aura (ko'rish buz.) │
│  ( )    ( )     ( )   │ Yorug'likdan bezov. │
│  ...                                         │
│ ─────────────────────────────────────────── │
│ Yangi mos darajasi:  78% → 86%  ↑           │
│ ─────────────────────────────────────────── │
│         [🔄 Boshidan]  [✔ Tasdiqlash]        │
└─────────────────────────────────────────────┘
```

State: `SymptomMatcherState = { [symptomId]: { response: HAS|NOT_HAS|UNSURE, severity?, duration?, notes? } }`.

Debounced PATCH `/symptom-sessions/:id` (500 ms).

### 9.4. Design tokens (Tailwind config)

demo.html ichidagi tokenlar `tailwind.config.ts` ga ko'chiriladi:

```ts
theme: {
  extend: {
    colors: {
      'medsmart-primary': { DEFAULT: '#2E75B6', 600: '#2563a0', 700: '#1E558A', 50: '#EAF2FB' },
      'medsmart-secondary': { DEFAULT: '#8E6AC7', 50: '#F2EDFB' },
      'medsmart-accent': { DEFAULT: '#C94F4F', 50: '#FBECEC' },
      // audience accents
      'aud-patient': '#3FA06E',
      'aud-student': '#8E6AC7',
      'aud-nurse':   '#E1A94A',
      'aud-doctor':  '#2E75B6',
      'aud-specialist':'#C94F4F',
    },
    fontFamily: {
      ui: ['Inter', 'system-ui', 'sans-serif'],
      read: ['Noto Serif', 'Georgia', 'serif'],
    },
  }
}
```

### 9.5. A11y va responsive

- WCAG 2.1 AA (kontrast ≥ 4.5:1, touch target ≥ 44px, ARIA tablist/tabpanel).
- Mobile LCP ≤ 2.5s (4G, 75%-tile).
- Tablet break at 768px, desktop at 1024px.
- Keyboard nav: Tab, Arrow keys in Tabs, Escape in Sheet/Dialog.
- Screen reader: all icons have `aria-label`; status chips have `role="status"`.

---

## 10. AUDIENCE MODE VA MARKERLI TEMPLATE TIZIMI

### 10.1. Canonical marker dictionary

`server/src/diseases/markers/markers.ts` da **yagona ro'yxat** (40+ marker):

```ts
export const DISEASE_MARKERS = {
  // General
  generalInfo:        { label_uz: ["Umumiy ma'lumot", "Kasallik haqida"], level: 'L1', audience: ['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR'] },
  etiology:           { label_uz: ["Sabablar", "Etiologiya"],              level: 'L2', audience: ['STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST'] },
  pathogenesis:       { label_uz: ["Patogenez", "Kasallikning rivojlanishi"], level: 'L2', audience: ['STUDENT', 'DOCTOR', 'SPECIALIST'] },
  classification:     { label_uz: ["Tasniflash", "Kasallik turlari"],       level: 'L2', audience: ['STUDENT', 'DOCTOR', 'SPECIALIST'] },
  clinicalSigns:      { label_uz: ["Belgilar", "Klinik ko'rinish"],         level: 'L1', audience: ['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR'] },
  earlyStage:         { label_uz: ["Dastlabki bosqich"],                    level: 'L2', audience: ['STUDENT', 'NURSE', 'DOCTOR'] },
  expandedStage:      { label_uz: ["Kengaytirilgan bosqich"],               level: 'L2', audience: ['STUDENT', 'NURSE', 'DOCTOR'] },
  lateStage:          { label_uz: ["Kechki bosqich"],                       level: 'L2', audience: ['STUDENT', 'NURSE', 'DOCTOR'] },
  complications:      { label_uz: ["Mumkin bo'lgan asoratlar"],             level: 'L2', audience: ['PATIENT', 'STUDENT', 'DOCTOR'] },
  diagnosticMethods:  { label_uz: ["Diagnostika usullari"],                 level: 'L2', audience: ['STUDENT', 'DOCTOR', 'SPECIALIST'] },
  labTests:           { label_uz: ["Tahlillar", "Laboratoriya"],            level: 'L2', audience: ['STUDENT', 'NURSE', 'DOCTOR'] },
  imaging:            { label_uz: ["Vizualizatsiya tahlillari", "MRT, KT, UZI"], level: 'L2', audience: ['STUDENT', 'DOCTOR'] },
  examination:        { label_uz: ["Ko'zdan kechirish", "Osmotr"],          level: 'L2', audience: ['STUDENT', 'NURSE', 'DOCTOR'] },
  anamnesis:          { label_uz: ["Anamnez yig'ish"],                      level: 'L2', audience: ['STUDENT', 'DOCTOR'] },
  treatment:          { label_uz: ["Davolash", "Davolash tartibi"],         level: 'L2', audience: ['DOCTOR', 'SPECIALIST'] },
  medications:        { label_uz: ["Dori-darmonlar bilan davolash"],        level: 'L2', audience: ['NURSE', 'DOCTOR', 'SPECIALIST'] },
  nursingCare:        { label_uz: ["Hamshiralik parvarishi"],               level: 'L2', audience: ['NURSE'] },
  prognosis:          { label_uz: ["Prognoz"],                              level: 'L1', audience: ['PATIENT', 'DOCTOR'] },
  prevention:         { label_uz: ["Profilaktika", "Oldini olish"],         level: 'L1', audience: ['PATIENT', 'STUDENT', 'NURSE'] },
  doNot:              { label_uz: ["Nimalar mumkin emas!"],                 level: 'L1', audience: ['PATIENT'] },
  recommended:        { label_uz: ["Tavsiya etiladi!"],                     level: 'L1', audience: ['PATIENT'] },
  whenToSeeDoctor:    { label_uz: ["Qachon shifokorga borish?"],            level: 'L1', audience: ['PATIENT'] },
  patientFAQ:         { label_uz: ["Bemor savollari"],                      level: 'L1', audience: ['PATIENT'] },
  specialistsInvolved:{ label_uz: ["Qaysi shifokor davolaydi?"],            level: 'L1', audience: ['PATIENT'] },
  treatmentCosts:     { label_uz: ["O'rtacha davolanish narxlari"],         level: 'L1', audience: ['PATIENT'] },
  medicalFacilities:  { label_uz: ["Davolaydigan tibbiyot muassasalari"],   level: 'L1', audience: ['PATIENT'] },
  epidemiology:       { label_uz: ["Epidemiologiya", "Statistik ma'lumotlar"], level: 'L2', audience: ['STUDENT', 'DOCTOR', 'SPECIALIST'] },
  genetics:           { label_uz: ["Genetik omillar"],                      level: 'L3', audience: ['DOCTOR', 'SPECIALIST'] },
  scientists:         { label_uz: ["Kasallikni tadqiq qilgan olimlar"],     level: 'L2', audience: ['STUDENT', 'DOCTOR'] },
  latestResearch:     { label_uz: ["So'nggi izlanishlar", "Clinical trials"], level: 'L3', audience: ['DOCTOR', 'SPECIALIST'] },
  clinicalCases:      { label_uz: ["Klinik holatlar"],                      level: 'L2', audience: ['STUDENT', 'DOCTOR', 'SPECIALIST'] },
  importantNote:      { label_uz: ["Buni bilish muhim!"],                   level: 'L1', audience: ['PATIENT', 'NURSE'] },
  media:              { label_uz: ["Suratlar", "Video materiallar"],        level: 'L1', audience: ['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR'] },
  // ... 8+ more
} as const;
```

### 10.2. Audience-driven rendering (client)

```tsx
// DiseaseCard.tsx
const visibleBlocks = disease.blocks.filter(b =>
  b.audience.includes(currentAudience) &&
  ['L1', 'L2', 'L3'].indexOf(b.level) <= audienceLevelCap[currentAudience]
);
```

Agar bemor L2 blokni ochmoqchi bo'lsa — collapse-expand rejimida, `"Tibbiy talaba/shifokor uchun"` labeli bilan ko'rsatiladi (yashirilmaydi, shaffof).

---

## 11. MODERATSIYA PIPELINE

### 11.1. State machine

```
            (EDITOR)                    (MEDICAL_EDITOR)
   [DRAFT] ──submit──▶ [REVIEW] ──approve──▶ [APPROVED]
      ▲                   │                      │
      │                   └──reject──▶ [DRAFT]   │
      │                                          │
      │                                      (ADMIN)
      │                                          │
      │                                      publish
      │                                          │
      │                                          ▼
      └──────── edit (autoset) ────────── [PUBLISHED]
```

### 11.2. Re-review on edit (muhim)

- Har `PATCH /diseases/:id/blocks/:marker` chaqirilganda, agar block.status=PUBLISHED — avtomatik REVIEW ga qaytadi.
- Public API `/diseases/:slug` esa **oxirgi snapshot** (last APPROVED version)ni ko'rsatadi (versioning kerak).
- `DiseaseBlockVersion` (yangi model, ixtiyoriy) — har APPROVED version'ning snapshoti (ContentMd + references) saqlanadi.

### 11.3. Notifikatsiyalar

- Submit → MEDICAL_EDITOR email + in-app toast.
- Approve → EDITOR email.
- Reject → EDITOR email + reason.
- Publish → Interested users (starring disease).

---

## 12. FAYL STRUKTURASI VA KOD KONVENSIYASI

### 12.1. Backend (`/server/src/diseases/`)

```
server/src/diseases/
├── diseases.module.ts
├── diseases.controller.ts
├── diseases.service.ts
├── diseases.repository.ts
├── markers/
│   └── markers.ts
├── blocks/
│   ├── blocks.controller.ts
│   └── blocks.service.ts
├── moderation/
│   ├── moderation.controller.ts
│   └── moderation.service.ts
├── embedding/
│   └── embedding.service.ts
├── dto/
│   ├── create-disease.dto.ts
│   ├── update-disease.dto.ts
│   ├── create-block.dto.ts
│   └── match-request.dto.ts
└── tests/
    ├── diseases.service.spec.ts
    ├── blocks.service.spec.ts
    └── moderation.e2e-spec.ts
```

`server/src/symptom-sessions/` (yangi, flat konvensiyaga mos):
```
├── symptom-sessions.module.ts
├── symptom-sessions.controller.ts
├── symptom-sessions.service.ts
├── dto/
└── tests/
```

### 12.2. Frontend (`/src/app`)

```
src/app/
├── components/screens/
│   ├── patient/
│   │   ├── DiagnosisResults.tsx      # MAVJUD, tuzatish kerak
│   │   ├── DiseaseCard.tsx           # YANGI
│   │   ├── SymptomMatcherSheet.tsx   # YANGI
│   │   └── SendToDoctor.tsx          # YANGI
│   ├── doctor/
│   │   ├── IncomingCasePanel.tsx     # YANGI
│   │   └── CaseDetailScreen.tsx      # YANGI
│   └── web/
│       ├── WebRefKBDiseasesScreen.tsx # MAVJUD
│       ├── WebKBDiseaseEditor.tsx    # YANGI
│       └── WebKBModerationQueue.tsx  # YANGI
├── hooks/
│   ├── useDisease.ts                 # YANGI (GET /diseases/:slug)
│   ├── useSymptomSession.ts          # YANGI (CRUD)
│   ├── useKBDiseasesList.ts          # MAVJUD
│   └── useModerationQueue.ts         # YANGI
├── services/api/
│   └── diseaseKb.ts                  # YANGI (axios wrapper)
├── services/fhir/
│   └── questionnaireResponse.ts      # YANGI (export logic)
├── data/
│   └── clinicalKB.ts                 # MAVJUD (fallback only)
└── types/
    └── diseaseKb.ts                  # YANGI
```

### 12.3. Commit konvensiyasi

```
feat(disease-kb): add DiseaseCard screen with 7 tabs and audience toggle
feat(disease-kb): symptom matcher sheet with real-time match update
feat(disease-kb/api): POST /symptom-sessions endpoint
refactor(disease-kb): move clinicalKB.ts to fallback mode
test(disease-kb): e2e AI Tavsiya → DiseaseCard → SendToDoctor flow
docs(disease-kb): finalize module spec v2
```

---

## 13. NON-FUNCTIONAL TALABLAR

| Kategoriya | Talab | O'lchov |
|---|---|---|
| Performance (web) | LCP (p95) | ≤ 1.5s |
| Performance (mobile 4G) | LCP (p75) | ≤ 2.5s |
| Performance (API) | p95 response | ≤ 300ms (disease GET), ≤ 800ms (match) |
| Accessibility | WCAG | 2.1 AA |
| i18n | Tillar (MVP) | uz full, ru L1 only, en skeleton |
| Security | PHI storage | NOT in Supabase prod (MVP demo no PHI) |
| Security | Token | JWT 7 days, refresh token |
| Availability | SLO | 99.5% (demo), 99.9% (prod) |
| Rate limiting | Match endpoint | 30 req/min per user |
| SEO | Disease pages | SSR, canonical URL, OG tags |
| Offline | Fallback | Client-side matcher works offline |
| Caching | Published disease | CDN cache 1h, invalidate on publish |

---

## 14. ANALITIKA VA TELEMETRIYA

### 14.1. Eventlar (frontend)

```
disease_card_viewed { slug, audience, source: "ai_ddx"|"search"|"direct" }
symptom_matcher_opened { slug, sessionId }
symptom_matcher_toggled { slug, symptomId, response }
symptom_matcher_completed { slug, sessionId, finalScore, count }
send_to_doctor_started { slug, sessionId }
send_to_doctor_confirmed { sessionId, doctorId, trackingId }
disease_card_audience_changed { slug, from, to }
```

### 14.2. Dashboard KPIs

- Top viewed diseases (daily).
- DDx → DiseaseCard CTR.
- Symptom matcher completion rate.
- Doctor response time (SUBMITTED → SEEN).

---

## 15. ACCEPTANCE CRITERIA VA DoD

### 15.1. Story-level (har UC uchun)

UC-01 (deep-link): 
- [ ] `/disease/:slug?sessionId=:id` route ishlaydi.
- [ ] Tahlil natijalaridan bosilsa — karta ochiladi ≤ 1.5s.
- [ ] Session context (bemor simptomlari) kartaga yetadi.
- [ ] Playwright test passes.

UC-02 (matcher):
- [ ] 3-holatli toggle ishlaydi.
- [ ] Match score real-time (debounced 500ms) yangilanadi.
- [ ] Backend PATCH /symptom-sessions/:id test passes.
- [ ] Accessibility: keyboard nav works.

UC-03 (send to doctor): 
- [ ] FHIR QuestionnaireResponse valid (HL7 Validator).
- [ ] Doctor picker shows previous + recommended.
- [ ] POST /symptom-sessions/:id/submit returns trackingId.
- [ ] Doctor receives notification.

… (har UC uchun)

### 15.2. Module-level DoD

- [ ] Backend: ≥ 70% service coverage, e2e passes.
- [ ] Frontend: ≥ 60% component coverage, e2e (Playwright) covers UC-01 to UC-04.
- [ ] Feature flag OFF in prod, ON in staging/demo.
- [ ] Storybook stories for DiseaseCard, SymptomMatcher, IncomingCasePanel.
- [ ] 50 kasallik seed data (L1 uz), 5 ta L2 to'liq (misol: Bexterev, Migren, Gipertoniya, Gastrit, Pnevmoniya).
- [ ] Swagger `/api/docs` yangilangan, `openapi.json` regenerated.
- [ ] Migration tested on fresh DB.
- [ ] Documentation: bu hujjat tasdiqlangan; PROJECT_CONTEXT.md yangilangan.
- [ ] Release notes (CHANGELOG.md).

---

## 16. BOSQICHLI JORIY QILISH (18 ISH KUNLIK REJA)

### Faza 0 — Audit & Konsolidatsiya (2 kun)
- PR-00: docs cleanup, canonical module spec (bu hujjat), legacy hujjatlarni `docs/_archive/` ga ko'chirish.
- PR-01: design tokens (demo.html → tailwind.config.ts), reference html'ni `design/references/` ga.

### Faza 1 — Backend API yakunlash (3 kun)
- PR-02: Prisma migration (SymptomMatchSession kengaytmasi, DiseaseScientist, DiseaseResearch, DiseaseGenetic).
- PR-03: `/symptom-sessions` module (controller + service + DTO + tests).
- PR-04: `/diseases/:id/blocks/*` module (CRUD + moderation, auto-review on edit).
- PR-05: Seed script — 50 kasallik × L1 (fixtures), 5 ta L2 to'liq.

### Faza 2 — Frontend patient ekranlari (5 kun)
- PR-06: `DiseaseCard.tsx` skeleton (layout, tabs, audience toggle).
- PR-07: `DiseaseCard.tsx` content blocks (marker loop, references popover).
- PR-08: `SymptomMatcherSheet.tsx`.
- PR-09: `SendToDoctor.tsx` + FHIR export.
- PR-10: `DiagnosisResults.tsx` deep-link tuzatish + router integratsiya.

### Faza 3 — Frontend doctor ekranlari (2 kun)
- PR-11: `IncomingCasePanel.tsx`.
- PR-12: `CaseDetailScreen.tsx` + doctor notes.

### Faza 4 — CMS va moderatsiya (4 kun)
- PR-13: `WebKBDiseaseEditor.tsx` — metadata + blocks tab.
- PR-14: `WebKBDiseaseEditor.tsx` — references picker (PubMed search).
- PR-15: `WebKBModerationQueue.tsx`.
- PR-16: Notifikatsiyalar (email + WebSocket).

### Faza 5 — Test, a11y, polish (2 kun)
- PR-17: Playwright e2e (UC-01…04).
- PR-18: a11y audit (axe-core), perf audit (Lighthouse), release PR.

**Jami: 18 PR, 18 ish kuni (1 full-stack + 1 medical editor, parallel).**

---

## 17. RISK REGISTER

| ID | Risk | P | I | Mitigation |
|---|---|---|---|---|
| R1 | Klinik kontent sifati | O | K | Medical Editor + evidence level A/B/C + external audit |
| R2 | FHIR non-compliant export | O | O | HL7 validator + snapshot test |
| R3 | Audience mode murakkab UX | O | O | User testing 3+ roll bilan |
| R4 | CMS Editor UX | Y | O | Prototype + editorial team feedback |
| R5 | pgvector xarajati (OpenAI) | P | P | Batch embedding, local model opsional |
| R6 | Tarjima (ru/en) sifat | Y | O | MVP: uz only, ru L1 MLP translation post-MVP |
| R7 | ICD-10 vs SNOMED conflict | O | Y | ICD-10 primary, SNOMED mapping ikkilamchi |
| R8 | Performance on mobile 4G | O | O | SSR + image optimization + CDN |
| R9 | PHI leak via Supabase | O | Y | PHI-less demo, local hosting post-MVP |
| R10 | Medical liability | O | Y | Disclaimer banner, "bu tibbiy maslahat emas" |

---

## 18. ILOVALAR

### 18.1. Ilova A — Bexterev misolida to'ldirilgan karta (L1)

Bu to'liq namuna `MedSmart-Pro_Kasalliklar_Moduli_TZ.md` Ilova A da mavjud — uni to'ldirib ushbu spec bilan sinxron qiling (oxirgi version 1003 qator).

### 18.2. Ilova B — JSON schema

`DiseaseCardResponse` (OpenAPI):
```yaml
DiseaseCardResponse:
  type: object
  required: [id, slug, icd10, nameUz, blocks, symptoms, references, status]
  properties:
    id: {type: string}
    slug: {type: string, example: "migraine"}
    icd10: {type: string, example: "G43.9"}
    icd11: {type: string, nullable: true}
    nameUz: {type: string}
    nameRu: {type: string, nullable: true}
    nameEn: {type: string, nullable: true}
    synonyms: {type: array, items: {type: string}}
    category: {type: string}
    audienceLevels: {type: array, items: {type: string, enum: [L1, L2, L3]}}
    severityLevels: {type: array, items: {type: string, enum: [MILD, MODERATE, SEVERE, CRITICAL]}}
    status: {type: string, enum: [DRAFT, REVIEW, APPROVED, PUBLISHED, REJECTED, ARCHIVED]}
    blocks:
      type: array
      items:
        $ref: '#/components/schemas/DiseaseBlockResponse'
    symptoms:
      type: array
      items:
        type: object
        properties:
          id: {type: string}
          code: {type: string}
          nameUz: {type: string}
          weight: {type: number, minimum: 0, maximum: 1}
          specificity: {type: number}
          sensitivity: {type: number}
          isRequired: {type: boolean}
          isExcluding: {type: boolean}
          isRedFlag: {type: boolean}
    references:
      type: array
      items:
        type: object
        properties:
          id: {type: string}
          type: {type: string, enum: [JOURNAL, GUIDELINE, BOOK, WEBSITE, CASE_SERIES]}
          citation: {type: string}
          doi: {type: string, nullable: true}
          pubmedId: {type: string, nullable: true}
          whoCode: {type: string, nullable: true}
          evidenceLevel: {type: string, enum: [A, B, C]}
          blockMarker: {type: string}
```

### 18.3. Ilova C — Tahrir chek-listi

MedSmart-Pro_Kasalliklar_Moduli_TZ.md §23 dagi ro'yxat bilan sinxron. Quyidagi minimal shartlar:
- [ ] ICD-10 kodi to'g'ri.
- [ ] nameUz (majburiy).
- [ ] Kamida 6 L1 blok (generalInfo, clinicalSigns, whenToSeeDoctor, doNot, recommended, prevention).
- [ ] Har blok uchun ≥ 1 Reference (WHO/PubMed/guideline).
- [ ] Redaktor evidence level A/B/C tanlagan.
- [ ] Tarjima status (uz=VERIFIED, ru=PENDING OK in MVP).
- [ ] Audience visibility aniqlangan.
- [ ] DiseaseSymptom weight va specificity to'g'ri (sum ≤ 1.2).

### 18.4. Ilova D — Migration uchun SQL qisqacha

```sql
-- 20260421_disease_kb_v2
ALTER TABLE "SymptomMatchSession"
  ADD COLUMN "bodyZones" TEXT[],
  ADD COLUMN "ddxTop5" JSONB,
  ADD COLUMN "redFlags" JSONB,
  ADD COLUMN "submittedAt" TIMESTAMP,
  ADD COLUMN "reviewedAt" TIMESTAMP,
  ADD COLUMN "clinicalNote" TEXT,
  ADD COLUMN "fhirJson" JSONB;

CREATE TABLE "SessionSymptom" (...);
CREATE TABLE "DiseaseScientist" (...);
CREATE TABLE "DiseaseResearch" (...);
CREATE TABLE "DiseaseGenetic" (...);

CREATE TYPE "SymptomResponse" AS ENUM ('HAS','NOT_HAS','UNSURE');
CREATE TYPE "SessionStatus" AS ENUM ('DRAFT','SUBMITTED','UNDER_REVIEW','RESOLVED','ARCHIVED');
-- ... ScientistRole, ResearchType, InheritancePattern, BloodGroup
```

---

## 19. YAKUNIY TASDIQLASH

Ushbu hujjat **canonical source of truth** — Disease KB modulini yakunlash bo'yicha. Uni tasdiqlagandan so'ng:

1. **Arxivlash**: `docs/analysis/feature-analysis.md`, `implementation-plan.md`, `tz-disease-kb-gaps.md`, eski `docs/09-modules/disease-kb-module.md` → `docs/_archive/disease-kb-v1/` ga ko'chiriladi.
2. **Yangi module spec**: Ushbu hujjat `docs/09-modules/disease-kb-module.md` nomi bilan ham saqlanadi (canonical).
3. **Business TT**: `MedSmart-Pro_Kasalliklar_Moduli_TZ.md` saqlanadi (biznes-hujjat).
4. **Correction prompt**: `docs/analysis/CORRECTION-PROMPT-va-GAP-ANALIZ.md` — keyingi AI chat'lar uchun.
5. **Implementation**: 18 PR ketma-ket (§16).

**Tasdiqlovchilar**: Product Owner (PM) · Tech Lead · Medical Director (professor) · QA Lead.

**Hujjat versiya jurnali**:
- v2.0 (2026-04-20): birinchi consolidated version, gap analizdan keyin.
- v1.0 (2026-04-17): eski TZ (MedSmart-Pro_Kasalliklar_Moduli_TZ.md), 26 bo'lim.

---

**Muallif**: Claude (Senior PM + FS Eng + BA + SA + UX Designer rollarida) · `2026-04-20`

**Havolalar**:
- Biznes TZ: `MedSmart-Pro_Kasalliklar_Moduli_TZ.md`
- Gap analiz: `docs/analysis/CORRECTION-PROMPT-va-GAP-ANALIZ.md`
- Loyiha CLAUDE.md: `CLAUDE.md` (root)
