# Disease KB Moduli — Texnik Talabnoma (Gap-larni to'ldirish)

**Hujjat versiyasi**: 1.0
**Sana**: 2026-04-18
**Mualliflar** (rollar birlashtirilgan): Tibbiy ekspert · Biznes-analitik · Tizim analitik · Loyiha menedjeri
**Asos**: `demo.html` (Gipertoniya I10 namunasi) vs platforma hozirgi holati tahlili
**Mos yozuvlar**: `docs/analysis/feature-analysis.md`, `docs/analysis/implementation-plan.md`, `docs/09-modules/disease-kb-module.md`

---

## 0. Boshqaruv xulosasi (Executive Summary)

### 0.1 Kontekst
Platforma `Disease KB` moduli backend poydevorida ~75% yaratilgan (16 Prisma modeli, FTS, pgvector, moderatsiya pipeline, triage match-engine). Frontend ~40% — asosiy tuzilma bor, lekin demo'dagi **interaktiv klinik UX komponentlari** yaratilmagan. Umumiy: **~50-55%**.

### 0.2 Hujjat maqsadi
Qolgan **~45-50% ish hajmini** ishlab chiquvchilar guruhi darhol bajara oladigan darajada batafsil tavsiflash:
- Tibbiy asoslanish (nega kerak, qaysi protokol/standart bo'yicha)
- UI/UX spesifikatsiyasi **web (desktop)** va **app (mobile/tablet)** uchun alohida
- Ma'lumot modeli (Prisma + TypeScript) o'zgarishlari
- API endpoint'lar (REST + DTO)
- Validatsiya qoidalari, edge-case'lar
- Acceptance criteria (Gherkin-style)
- Ish hajmi baholari (story point / kun)
- Qo'shimcha taklif qilingan funksionalliklar (demo'da yo'q, lekin klinik qiymatga ega)

### 0.3 Muvaffaqiyat mezonlari (Success Metrics)
| Metrika | Joriy | Maqsad (Q2 2026 oxiri) | Metodika |
|---|---|---|---|
| Kasallik kartasi to'liqligi (L1) | ~35% | ≥90% | `CompletenessBar` score |
| Symptom Matcher oxirigacha o'tish (funnel) | — | ≥65% | Analytics event |
| Klinik qaror qo'llab-quvvatlash to'g'riligi (DDx top-5 da asl tashxis) | — | ≥80% | Retrospektiv klinik validatsiya (100 case) |
| Bemor tavsiyasini o'qish vaqti | — | < 3 min (median) | Scroll + active-time tracking |
| WCAG 2.1 AA muvofiqligi | N/A | 100% kritik yo'llar | axe-core + manual audit |
| i18n qamrovi (uz/ru/en blok) | Schema level | ≥80% bloklar 3 tilda | `translationStatusRu/En = VERIFIED` |
| Mobile performance (LCP) | — | ≤2.5s (3G fast) | Lighthouse CI |

### 0.4 Hujjat tuzilishi
- **§1** — Stakeholder va foydalanuvchi roli
- **§2** — Prioritet va ish yo'nalishi (qisqacha)
- **§3** — Detallashtirilgan TZ (GAP-01 … GAP-10, TOP-10 bo'shliq)
- **§4** — Qisman funksiyalarni tuzatish (FIX-01 … FIX-08)
- **§5** — Qo'shimcha takliflar (ADD-01 … ADD-10)
- **§6** — Nofunksional talablar
- **§7** — Data governance, xavfsizlik, klinik javobgarlik
- **§8** — Milestone, RACI, Definition of Done
- **§9** — Xavflar va kamaytirish choralari

---

## 1. Stakeholder'lar va foydalanuvchi rollari

### 1.1 Asosiy foydalanuvchi rollari

| Rol | Birlamchi vazifalari (Disease KB kontekstida) | Qurilma | Audience Mode |
|---|---|---|---|
| **Bemor** (Patient) | Simptomlarini kiritish → DDx ko'rish → kasallik haqida o'qish → shifokorga yuborish | Mobile (app) · Web | `PATIENT` |
| **Talaba** (Medical Student) | O'rganish uchun batafsil kasallik kartasi; klinik case'lar | Web (asosan) · Mobile | `STUDENT` |
| **Hamshira** (Nurse) | Tezkor red-flag skrining, BP o'lchash qoidalari, dori doza | Mobile · Tablet | `NURSE` |
| **Shifokor** (Doctor / GP) | Klinik qaror qo'llab-quvvatlash: DDx, guidelines, dori, SCORE2 | Web (desktop) · Tablet | `DOCTOR` |
| **Mutaxassis** (Specialist — kardiolog, endokrinolog, …) | Chuqur ma'lumot, maxsus populyatsiyalar, rezistent holatlar | Web | `SPECIALIST` |
| **KB Muharriri** (KB Editor) | Kasallik kartalarini yozish/tahrirlash, reference qo'shish, audit | Web (desktop) | — |
| **KB Moderator** (Clinical Moderator) | Review queue, approve/reject, publish, lifecycle skan | Web (desktop) | — |
| **Admin** | Rollarni boshqarish, feature flag, monitoring | Web | — |

### 1.2 Qurilma/qamrov matritsasi

| Funksiya | Web (desktop ≥1024px) | Tablet (768-1023px) | Mobile App (<768px) |
|---|---|---|---|
| Kasallik kartasini o'qish | ✅ To'liq | ✅ To'liq | ✅ To'liq (stacked layout) |
| Symptom Matcher wizard | ✅ Drawer (o'ng) | ✅ Sheet (pastdan) | ✅ Full-screen ekran |
| SCORE2 kalkulyatori | ✅ | ✅ | ✅ (bosqichli forma) |
| Body map | ✅ (SVG 360×500) | ✅ | ✅ (tap + zoom) |
| KB Editor | ✅ Faqat | ❌ Ogohlantirish | ❌ Faqat o'qish |
| Review queue (moderatsiya) | ✅ Faqat | ⚠️ Read-only | ❌ |
| Print / PDF eksport | ✅ | ✅ | ⚠️ PDF yuklab olish |

---

## 2. Prioritet va faza rejasi

### 2.1 Prioritet matritsasi (RICE-style)

| ID | Gap | Reach | Impact (klinik) | Confidence | Effort (SP) | Score | Prioritet |
|---|---|---|---|---|---|---|---|
| GAP-01 | Symptom Matcher 4-step wizard | 10/10 | 5/5 | 0.9 | 21 | 2.14 | **P0** |
| GAP-02 | 8-tab karta strukturasi | 9/10 | 4/5 | 0.95 | 13 | 2.63 | **P0** |
| GAP-03 | Live DDx (differential diagnosis) | 9/10 | 5/5 | 0.8 | 13 | 2.77 | **P0** |
| GAP-04 | Red-flag + Emergency eskalatsiya | 10/10 | 5/5 | 0.95 | 8 | 5.94 | **P0** (xavfsizlik) |
| GAP-05 | SCORE2 / klinik kalkulyatorlar | 6/10 | 5/5 | 0.85 | 13 | 1.96 | **P1** |
| GAP-06 | Body map (tana sxemasi) | 7/10 | 4/5 | 0.8 | 13 | 1.72 | **P1** |
| GAP-07 | Stage Stepper interaktiv | 7/10 | 3/5 | 0.9 | 8 | 2.36 | **P1** |
| GAP-08 | FHIR R4 eksport | 4/10 | 4/5 | 0.7 | 8 | 1.40 | **P2** |
| GAP-09 | Timeline / kasallik evolyutsiyasi | 6/10 | 3/5 | 0.75 | 8 | 1.69 | **P2** |
| GAP-10 | UZ/RU/EN til switcher (UI) | 8/10 | 3/5 | 0.95 | 5 | 4.56 | **P1** |

### 2.2 Fazalar (MVP → v1.0)

**Sprint 1-2 (2 hafta) — P0 xavfsizlik va asos**
- GAP-04 Red-flag eskalatsiya to'liq
- GAP-02 8-tab karta strukturasi
- GAP-10 Til switcher UI

**Sprint 3-4 (2 hafta) — P0 klinik qaror**
- GAP-01 Symptom Matcher wizard (4-step)
- GAP-03 Live DDx paneli

**Sprint 5-6 (2 hafta) — P1 interaktiv widgetlar**
- GAP-05 SCORE2 + 3 ta kalkulyator
- GAP-06 Body map
- GAP-07 Stage Stepper

**Sprint 7-8 (2 hafta) — P2 integratsiya va polish**
- GAP-08 FHIR eksport
- GAP-09 Timeline
- FIX-01 … FIX-08 (qisman funksiyalar)
- ADD-01 … ADD-05 (yuqori qiymatli qo'shimchalar)

**Sprint 9 (1 hafta) — Klinik validatsiya va QA**
- 100 case retrospektiv validatsiya
- WCAG 2.1 AA audit
- Performance (LCP ≤ 2.5s) optimizatsiya
- Feature flag → prod rollout

---

## 3. Detallashtirilgan TZ — bo'shliqlar (GAP-01 … GAP-10)

---

### GAP-01 · Symptom Matcher 4-Step Wizard

#### 3.1.1 Tibbiy asoslanish
Klinik simptom yig'ish to'rt asosiy o'lchovga tayanadi (Harrison's Principles of Internal Medicine, 21th ed., Ch. 4 "Decision-Making in Clinical Medicine"):
1. **Simptomlar** — OPQRST metodi (Onset, Provocation, Quality, Radiation, Severity, Timing)
2. **Risk omillari** — Framingham/ESC tasniflari: modifiable (lifestyle, BP, smoking) + non-modifiable (age, genetics) + komorbidlik
3. **Vaqt va joy** — kasallik boshlanishi (acute/subacute/chronic), lokalizatsiya, davriylik
4. **Xulosa va DDx** — Bayes-like pre-test probability → shifokorga yo'naltirish yoki o'z-o'ziga yordam

Hozirgi `SymptomMatcherSheet` faqat bitta banner ko'rsatadi — klinik qarorga yetarli ma'lumot yig'ilmaydi. Bu **diagnostik xatolik xavfi**ni oshiradi (Singh et al., BMJ Qual Saf 2014: 12% ambulator tashxislar noto'g'ri).

#### 3.1.2 User Story
> **Bemor sifatida** men simptomlarim asosida **qadamma-qadam savollarga javob berib**, **qaysi kasallik eng ehtimolli ekanini**, **tez yordam kerak-yo'qligini** va **keyingi qadamni** (dorixona, GP, tez yordam, bemor maslahat) bilmoqchiman — toki shifokor tashrifigacha o'zimni xavfsiz his qilay.
>
> **Shifokor sifatida** men bemor yuborgan SymptomMatch natijasini (ball, DDx, FHIR payload) **1 daqiqada tekshirib**, **o'z qaroriga qo'sha olishim kerak**.

#### 3.1.3 Qadamlar va UX oqim

##### Bosqich 1 — Simptomlar
**Maqsad**: Asosiy + qo'shimcha simptomlarni Ha/Ba'zan/Yo'q/Bilmayman deb belgilash + OPQRST detallari.

**UI elementlari**:
- **Chip row (yuqorida)** — foydalanuvchi kiritgan simptomlar chiplari (X bilan o'chirish)
- **Add combobox** — `cmdk` (commandk) autocomplete; `GET /api/v1/symptoms/search?q=` (debounce 300ms, min 2 char). Foydalanuvchi terish orqali yoki "Tavsiya etilgan" ro'yxatdan tanlash.
- **AI Suggestion chips** — `GET /api/v1/triage/suggest-symptoms?current=[...]` — semantic embedding asosida qo'shimcha 3-5 ta taklif (mas. "bosh aylanishi" kiritildi → "chakka og'rig'i", "yurak tez urishi")
- **Simptom kartasi** (har bir chip uchun bosilganda):
  - Ha / Ba'zan / Yo'q / Bilmayman (4-holat toggle)
  - Davomiyligi: 1-3 kun · 1-2 hafta · 1 oydan ortiq · 6 oydan ortiq
  - Boshlanishi: keskin (< 24s) · sekin (kunlar) · xurujlar
  - Chastota: doimo · kuniga bir necha marta · haftasiga · kamdan-kam
  - Lokalizatsiya (bodyZone ga asosan): dropdown yoki body-map chip
  - Trigger: jismoniy zo'riqish · stress · oziq-ovqat · preparat · noma'lum
- **Navigation**: "Keyingi →" (agar ≥1 simptom **Ha** javobi bo'lsa yoqiladi)

**Validatsiya**:
- Min 1 `Ha` javobi — aks holda step 2 ga o'tmaydi (`ERR_SYMPTOMS_EMPTY`)
- Max 20 ta simptom (rate-limit UI)
- Har bir simptom uchun davomiylik **majburiy** agar `Ha` tanlangan bo'lsa

**Red-flag trigger**: bu bosqichda simptom `isRedFlag: true` bo'lsa, emergency banner darhol ochiladi (GAP-04 ga bog'liq).

##### Bosqich 2 — Omillar (Risk Factors)
**Maqsad**: Modifiable va non-modifiable xavf omillarini yig'ish.

**UI**: 4 guruh grid (2×2 desktop, 1-column mobile):
- **Yashash tarzi**: chekish, alkogol, jismoniy faollik, ortiqcha vazn, dietik tuz, uyqu
- **Genetik/Oilaviy**: ota-ona HTN, erta miokard infarkti (< 55), stroke, diabet, buyrak kasalligi
- **Ko'shimcha kasalliklar** (Komorbidlik): CKD, DM, giperlipidemiya, obstruktiv uyqu apnoesi, homiladorlik
- **Dori-darmon**: NSAID, gormon (OCP), glyukokortikoidlar, dekongestantlar, sportchilar dopingi

**Kiritish mexanizmi**: Har bir element 3-cycle toggle (⚪ Yo'q / 🟡 Bilmayman / 🔴 Ha). Ha belgilangan bo'lsa — opsional detail (chekish: paketlar/yil, BP darajasi ± bosim dori).

**Validation**: Bilmayman default; majburiy emas. "Keyingi →" har doim yoqilgan.

##### Bosqich 3 — Vaqt va joy
**UI**:
- **Timeline slider** — `onset_date` (1 kun – 10 yil), tanlanganida sub-events qo'shish ("birinchi epizod", "oxirgi bosim tekshiruv", "hozirgi zo'ravonlik")
- **Body map** (GAP-06 ga bog'liq) — tana zonalariga belgilar (affected areas). Bir zona bosilsa: ogʻriq tavsifi, nurlanishi (radiation)
- **Kontext** dropdown: uyda · ishda · sport · sayohat · ovqatdan keyin · tunda
- **Avval tekshirganmi**: "Shifokorga murojaat qilganman" / "O'z-o'ziga davolandim" / "Hech qachon"

##### Bosqich 4 — Xulosa
**Maqsad**: Yig'ilgan ma'lumotni ko'rsatish + DDx + tavsiyalar.

**UI bloklari**:
1. **5 mini-gauge** (donut ring, har biri 72×72px):
   - `match%` — eng yaqin kasallik bilan mos %
   - `answered/total` — javob to'liqligi
   - `risk` — xavf omillari skoring (low/mod/high/very-high)
   - `redFlagCount` — aniqlangan red-flag belgilar soni
   - `confidence` — DDx top-1 va top-2 farqi (delta) asosida
2. **Live DDx list** (GAP-03 ga bog'liq) — top 5 kasallik, match% bilan, bosish → karta
3. **Tavsiyalar** (priority bo'yicha):
   - 🚨 **Kechiktirmasdan**: 103 qo'ng'iroq (agar red-flag)
   - 🏥 **24-48 soat ichida**: GP / specialist navbat (tavsiya mutaxassis bilan)
   - 💊 **Yashash tarzi**: lifestyle bloki (kasallik profiliga mos)
   - 🧪 **Tekshiruvlar**: tavsiya etilgan labs/instrumental (LOINC kod bilan)
4. **FHIR preview + Copy** (GAP-08 ga bog'liq) — pastki expandable panel
5. **Aksiya tugmalari**:
   - "Shifokorga yuborish" → `POST /api/v1/triage/send-to-doctor` (existing endpoint)
   - "PDF saqlash" → client-side `jspdf` (existing)
   - "Saqlash" → `UserDiseaseNote` ga
   - "Ulashish" → copy link (short URL) yoki native share API (`navigator.share`)
   - "Boshqatdan boshlash" — session ni reset

#### 3.1.4 Ma'lumot modeli

**Mavjud**: `SymptomMatchSession` (schema.prisma). Kengaytirish:

```prisma
model SymptomMatchSession {
  id              String    @id @default(uuid())
  userId          Int?      // anonim ham mumkin
  diseaseId       String?   // eng yaqin match (natijada)
  step            Int       @default(1)         // YANGI: 1-4
  status          MatchSessionStatus @default(IN_PROGRESS) // YANGI enum
  userAnswers     Json      // { symptoms: [...], riskFactors: {...}, timeline: {...}, bodyZones: [...] }
  score           Decimal?  @db.Decimal(5, 3)
  redFlagTripped  Boolean   @default(false)
  ddxSnapshot     Json?     // [{ diseaseId, match, confidence }, ...]
  fhirPayload     Json?     // FHIR R4 QuestionnaireResponse
  startedAt       DateTime  @default(now())
  completedAt     DateTime?
  sharedWithDoctorId Int?

  disease         Disease?  @relation(fields: [diseaseId], references: [id])

  @@index([userId])
  @@index([status])
  @@index([startedAt])
}

enum MatchSessionStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
  ESCALATED_EMERGENCY
}
```

**TypeScript (frontend)**:

```ts
// src/app/types/symptom-match.ts
export interface SymptomAnswer {
  symptomId: string;
  response: 'YES' | 'SOMETIMES' | 'NO' | 'UNKNOWN';
  duration?: '1_3_DAYS' | '1_2_WEEKS' | '1_MONTH_PLUS' | '6_MONTHS_PLUS';
  onsetType?: 'ACUTE' | 'GRADUAL' | 'EPISODIC';
  frequency?: 'CONSTANT' | 'DAILY' | 'WEEKLY' | 'RARE';
  bodyZones?: string[];
  triggers?: Array<'EXERCISE' | 'STRESS' | 'FOOD' | 'MEDICATION' | 'UNKNOWN'>;
}

export interface RiskFactorAnswer {
  factorId: string;          // e.g. "lifestyle.smoking"
  value: 'YES' | 'NO' | 'UNKNOWN';
  detail?: Record<string, unknown>; // e.g. { packYears: 15 }
}

export interface TimelineAnswer {
  onsetDate?: string;        // ISO date
  events?: Array<{ label: string; date: string }>;
  context?: 'HOME' | 'WORK' | 'SPORT' | 'TRAVEL' | 'POST_MEAL' | 'NIGHT';
  priorConsult?: 'GP' | 'SELF' | 'NEVER';
}

export interface MatcherState {
  sessionId: string;
  step: 1 | 2 | 3 | 4;
  symptoms: SymptomAnswer[];
  riskFactors: RiskFactorAnswer[];
  timeline: TimelineAnswer;
  affectedBodyZones: string[];
  ddx?: DifferentialDiagnosis[];
  scores?: MatchScores;
}
```

#### 3.1.5 API endpoint'lar

| Metod | Yo'l | Maqsad | Request | Response |
|---|---|---|---|---|
| POST | `/api/v1/triage/session` | Yangi sessiya ochish | `{ userId? }` | `{ sessionId }` |
| PATCH | `/api/v1/triage/session/:id` | Bosqichma-bosqich yangilash | `Partial<MatcherState>` | `MatcherState` |
| POST | `/api/v1/triage/session/:id/step/:n/validate` | Bosqich validatsiyasi | — | `{ valid, errors[] }` |
| GET | `/api/v1/triage/session/:id/ddx` | Hozirgi DDx (live) | — | `DifferentialDiagnosis[]` |
| POST | `/api/v1/triage/session/:id/complete` | Yakunlash + FHIR generatsiya | — | `{ scores, ddx, fhir }` |
| POST | `/api/v1/triage/session/:id/send-to-doctor` | Shifokorga yuborish | `{ doctorId, note? }` | `{ applicationId }` |
| GET | `/api/v1/symptoms/search?q=&bodyZone=&limit=` | Autocomplete | — | `Symptom[]` |
| GET | `/api/v1/triage/suggest-symptoms?sessionId=` | AI suggestion | — | `Symptom[]` (top 5) |

#### 3.1.6 Acceptance criteria

```gherkin
Feature: Symptom Matcher 4-step wizard

  Scenario: Bemor 4 bosqichni oxirigacha yakunlaydi
    Given bemor "/triage" sahifasida va autentifikatsiyadan o'tgan
    When "Boshqatdan boshlash" tugmasini bosadi
    Then bosqich 1 ochiladi va sessionId server'dan qaytariladi
    When 3 ta simptom kiritadi, har biriga "Ha" deb javob beradi
    And "Keyingi" tugmasini bosadi
    Then bosqich 2 ochiladi va indicator "2/4" ko'rsatadi
    When bosqich 4 ga yetganda
    Then 5 mini-gauge ko'rinadi, top-5 DDx ro'yxati ko'rsatiladi
    And "Shifokorga yuborish" tugmasi yoqilgan bo'ladi

  Scenario: Red-flag aniqlanganda emergency banner chiqadi
    Given bosqich 1 da
    When bemor "Yurak sohasida keskin og'riq" va "hushdan ketish" simptomlarini "Ha" deb belgilaydi
    Then EmergencyBanner darhol ko'rinadi
    And "103 ga qo'ng'iroq" tugmasi ko'rinadi
    And sessiya statusi "ESCALATED_EMERGENCY" ga o'zgaradi (backend log)

  Scenario: Sessiya saqlash va qayta ochish
    Given bemor bosqich 3 da va brauzerni yopgan
    When qaytib kiradi
    Then oxirgi bosqich avtomatik qayta tiklanadi (resumable)
    And oldingi javoblar tayyor bo'ladi

  Scenario: Minimal simptom validatsiyasi
    Given bosqich 1 da hech qanday simptom "Ha" emas
    When "Keyingi" tugmasini bosadi
    Then xato ko'rsatiladi "Kamida 1 simptomga 'Ha' javobi kerak"
    And bosqich o'zgarmaydi
```

#### 3.1.7 Ish hajmi
- Frontend (wizard + state + 4 ekran): **13 SP**
- Backend (endpoint'lar, validatsiya, FHIR stub): **5 SP**
- QA (unit + e2e): **3 SP**
- **Jami: 21 SP ≈ 2 sprint (2-3 developer)**

---

### GAP-02 · Kasallik Kartasi 8-Tab Strukturasi

#### 3.2.1 Tibbiy asoslanish
Klinik ma'lumot **ma'no guruhiga** bo'linishi kerak (WHO Clinical Practice Guidelines standart). Demo 8 tab ishlatadi:
- **Overview** — asosiy ma'lumot (patient friendly)
- **Diagnostika** — shifokor oqimi (anamnez → fizikal → labs)
- **Davo** — algoritm, preparatlar, maxsus populyatsiyalar
- **Bosqichlar** — kasallik stadium'lari (I/II/III/Crisis)
- **Asoratlar** — organ-tizim bo'yicha
- **Tavsiyalar** — bemor uchun
- **FAQ** — tez-tez so'raladigan savollar
- **Manbalar** — reference, guidelines, evidence level

Scroll asosida o'qish (hozirgi TOC) shifokor uchun samarali emas — u ma'lum tab'ga to'g'ri o'tishi kerak.

#### 3.2.2 UI spec

##### Web (desktop)
- **Tab bar** — yopishqoq (sticky, top: 64px). Ikona + matn. Faol tab — `data-state=active` (primary border).
- **Keyboard navigation**: ← → tab o'rtasida, `Tab` element fokusida. WAI-ARIA `role="tablist"` va `aria-controls`.
- **URL sync**: `/kasalliklar/:slug?tab=diagnostics` — deep link.
- **Lazy load**: faqat faol tab DOM'da renderlanadi. Tab o'zgarganda `data-prev-tab` saqlanadi (back button uchun).
- **Audience filter**: `PATIENT` rejimida "Bosqichlar" va "Sekundar HTN skrining" tab'lari yashirin; `DOCTOR` — hammasi ko'rinadi.

##### Mobile (app)
- Tab bar — horizontal scroll (`overflow-x-auto`), snap-to-tab.
- Swipe chap/o'ng (motion.js `dragConstraints`) tab o'zgartiradi.
- Tab ichida sticky sub-TOC (kichik quick-jump).

#### 3.2.3 Ma'lumot modeli

`DiseaseBlock.marker` allaqachon bor — uni `tabKey` ga mapping qo'shamiz:

```ts
// src/app/constants/disease-tabs.ts
export const DISEASE_TABS = [
  { key: 'overview', labelUz: 'Umumiy', icon: 'Info', audienceAll: true,
    blockMarkers: ['about', 'epidemiology', 'etiology', 'pathogenesis', 'risk-factors', 'symptoms', 'media', 'scientists'] },
  { key: 'diagnostics', labelUz: 'Diagnostika', icon: 'Stethoscope', audienceMin: 'NURSE',
    blockMarkers: ['complaints', 'bp-measurement', 'classification', 'anamnesis', 'examination', 'labs', 'instrumental', 'risk-stratification', 'secondary-htn'] },
  { key: 'treatment', labelUz: 'Davo', icon: 'Pill', audienceMin: 'PATIENT',
    blockMarkers: ['goals', 'lifestyle', 'algorithm', 'medications', 'special-populations', 'resistant'] },
  { key: 'stages', labelUz: 'Bosqichlar', icon: 'Timeline', audienceMin: 'STUDENT',
    blockMarkers: ['stage-1', 'stage-2', 'stage-3', 'crisis'] },
  { key: 'complications', labelUz: 'Asoratlar', icon: 'AlertTriangle', audienceAll: true,
    blockMarkers: ['heart', 'brain', 'kidney', 'eye', 'peripheral'] },
  { key: 'advice', labelUz: 'Tavsiyalar', icon: 'Heart', audienceMin: 'PATIENT',
    blockMarkers: ['lifestyle-advice', 'when-to-call', 'self-monitoring'] },
  { key: 'faq', labelUz: 'FAQ', icon: 'HelpCircle', audienceAll: true,
    blockMarkers: ['faq'] },
  { key: 'sources', labelUz: 'Manbalar', icon: 'BookOpen', audienceMin: 'STUDENT',
    blockMarkers: ['references', 'scientists'] },
] as const;
```

#### 3.2.4 Acceptance criteria
- Har 8 tab renderlanadi va kontenti to'g'ri marker'lar bilan filtrlanadi
- URL `?tab=xxx` deep link ishlaydi (refresh qilsangiz ham)
- Audience `PATIENT` tanlanganida "Bosqichlar" tab yashiriladi
- Keyboard ← → tab almashtiradi
- Mobile swipe bilan tab o'zgaradi (min 30px threshold)
- Screen reader: `role="tablist"`, `aria-controls`, `aria-selected`

#### 3.2.5 Ish hajmi: **13 SP** (FE: 8, BE mapping: 2, QA: 3)

---

### GAP-03 · Live DDx (Differential Diagnosis) paneli

#### 3.3.1 Tibbiy asoslanish
Differensial tashxis — klinik qaror qilishning yadrosi (Barondess & Carpenter, "Differential Diagnosis", 2nd ed.). Top-5 alternativ tashxislar har doim ko'rib chiqilishi shart — aks holda **anchoring bias** xavfi (Croskerry P., Acad Emerg Med 2002).

Platforma backend'ida `match-engine.ts` bor, lekin real-time UI yo'q — foydalanuvchi javob bergan sari DDx yangilanishi kerak.

#### 3.3.2 Scoring algoritmi

```
match_score = Σ (w_i × s_i) / Σ w_i

Bu yerda:
  w_i = symptom.weight (DiseaseSymptom.weight, 0.0-1.0)
  s_i = {
    +1.0 if answer == YES
    +0.5 if answer == SOMETIMES
    -0.5 if answer == NO and isRequired
    -1.0 if answer == NO and isExcluding
    0    if answer == UNKNOWN
  }

risk_multiplier = 1.0 + (matched_risk_factors / total_risk_factors) × 0.2

final_score = match_score × risk_multiplier × age_sex_adjustment

confidence = |top1 - top2| / top1    # delta / top1
```

**Threshold**:
- ≥ 0.80 → "Yuqori mos kelish" (yashil)
- 0.60-0.79 → "O'rtacha" (sariq)
- 0.40-0.59 → "Ehtimolli" (kulrang)
- < 0.40 → DDx ga qo'shilmaydi

**Red-flag override**: agar red-flag simptom aniqlansa — ularga mos kasallik DDx top-3 ga majburiy kiritiladi (ignore score).

#### 3.3.3 UI

**Web**: Bosqich 4 ning chap panelida sticky card. Har bir DDx item:
- Kasallik nomi + ICD-10
- Match % (ring gauge 48×48)
- "Farq" chipi: top-1 bilan farq (delta%)
- Red-flag indicator (agar)
- CTA: "Karta" (→ `/kasalliklar/:slug`), "Solishtirish" (2 ta tanlab side-by-side)

**Mobile**: vertical card stack, "Barchasini ko'rish" → full-screen modal.

**Live update**: WebSocket (`socket.io`) orqali bosqich 2-3 da javob o'zgarsa — DDx real-time yangilanadi. Fallback: debounced `PATCH + GET /ddx` (500ms).

#### 3.3.4 API

```
GET /api/v1/triage/session/:id/ddx?limit=5
→ [{ diseaseId, slug, nameUz, icd10, matchScore, confidence, redFlag, deltaFromTop }]
```

#### 3.3.5 Acceptance criteria
- Har qadamda kamida top-3 DDx yangilanadi
- Red-flag kasallik avtomatik top-3 ga qo'shiladi
- 2 ta kasallikni "Solishtirish" yonma-yon ko'rinadi (blocks comparison)
- Score > 0.80 bo'lsa — green, 0.60-0.79 yellow, < 0.60 gray
- Live update latentlik < 500ms (WebSocket yoki debounced REST)

#### 3.3.6 Ish hajmi: **13 SP**

---

### GAP-04 · Red-flag va Emergency Eskalatsiya (P0 — xavfsizlik)

#### 3.4.1 Tibbiy asoslanish
Emergency red-flag — bemorda **zudlik bilan tez-tez yordam** talab qiluvchi belgilar. Masalan HTN uchun:
- BP ≥ 180/120 (hypertensive crisis, ACC/AHA 2017)
- Ko'krak og'rig'i + nafas qisilishi (ACS suspected)
- Fokal nevrologik taqchillik (stroke suspected)
- Qusish + bosh og'riq + ko'rish buzilishi (intracranial HTN)

**Platforma qaytish xavfi**: red-flag yetarli sezgirlik (sensitivity) bilan aniqlanmasa — klinik zarar (tort liability).

#### 3.4.2 Mavjud
- `Symptom.isRedFlag: Boolean`
- `EmergencyCallBanner.tsx` + `red-flag-rules.ts`

#### 3.4.3 Kengaytirish

##### Data modeli
```prisma
model RedFlagRule {
  id              String   @id @default(uuid())
  diseaseId       String?  // null = global rule
  name            String   // "Hypertensive crisis"
  conditionJson   Json     // { AND: [{ symptom: "bp-sbp-180" }, { symptom: "confusion" }] }
  severity        RedFlagSeverity  // CRITICAL | HIGH | MODERATE
  actionUz        String   // "103 ga qo'ng'iroq qiling"
  actionRu        String?
  actionEn        String?
  emergencyNumber String   @default("103")
  createdAt       DateTime @default(now())
}

enum RedFlagSeverity {
  CRITICAL   // 103 avtomatik, sessiya bloklanadi
  HIGH       // 24 soat ichida shifokorga
  MODERATE   // Navbat olish tavsiyasi
}
```

##### Qoidalar engine
```ts
// server/src/triage/red-flag-engine.ts
export class RedFlagEngine {
  evaluate(answers: SymptomAnswer[], ruleSet: RedFlagRule[]): RedFlagHit[] {
    // AND/OR boolean tree evaluation
    // returns: [{ ruleId, severity, action, triggeredBy: [symptomIds] }]
  }
}
```

##### UI eskalatsiya
- **CRITICAL**: Full-screen modal (dismiss qilinmaydi), 103 tugmasi yirik, geolokatsiya avtomatik so'raydi, SMS jo'natish opsiyasi (backup), hozirgi kord bilan eng yaqin klinika xaritasi.
- **HIGH**: Top banner + "Shifokorga darhol yuborish" CTA
- **MODERATE**: Inline warning chip

##### Tekshirish (audit)
- Har red-flag event `AuditLog` tabel'ga yozilishi shart (kim, qachon, qaysi simptomlar).
- Mas'ul shifokor ogohlantirishi (push notification) — agar bemor uchun tayinlangan GP bo'lsa.

#### 3.4.4 Acceptance criteria
- 100% sensitivlik bilan 20 ta klinik test case'da red-flag aniqlanadi (QA suite)
- CRITICAL trigger'da modal 300ms ichida ochiladi
- "103" bosilganda `tel:103` schema ishlaydi (mobile) yoki ko'chirish (web)
- AuditLog yozuvi har bir trigger uchun saqlanadi
- i18n 3 til — action tekstlari to'liq tarjima qilingan

#### 3.4.5 Ish hajmi: **8 SP**

---

### GAP-05 · Klinik Kalkulyatorlar (SCORE2 + boshqalar)

#### 3.5.1 Tibbiy asoslanish
Har bir klinik kalkulyator — validatsiyalangan skor. Platform dastlabki 5 tani yaratishi kerak:

| # | Kalkulyator | Protokol | Kirish | Chiqish | Ishlatiladigan kasallik |
|---|---|---|---|---|---|
| 1 | **SCORE2** | ESC 2021 | yosh 40-69, jins, SBP, non-HDL, chekish, mintaqa | 10-y CV xavf % | I10-I15 |
| 2 | **SCORE2-OP** | ESC 2021 | yosh ≥70 | idem | keksa HTN |
| 3 | **CHA₂DS₂-VASc** | ESC 2020 AF | CHF, HTN, yosh, DM, stroke, vask kasallik, yosh 65-74, jins | stroke xavfi | AF |
| 4 | **HAS-BLED** | ESC 2020 | HTN, buyrak/jigar, stroke, qonash, labil INR, yosh, dori, alkogol | qonash xavfi | AF antikoagulyant |
| 5 | **GFR (CKD-EPI 2021)** | KDIGO | kreatinin, yosh, jins | eGFR ml/min/1.73m² | CKD, barcha HTN |

#### 3.5.2 Arxitektura

**Frontend** — reusable `<ClinicalCalculator>` komponenti:
```tsx
<ClinicalCalculator
  schema={SCORE2_SCHEMA}
  onResult={(r) => setScore2(r)}
  showFormula={auditLevel === 'DOCTOR'}
/>
```

**Schema format** (deklarativ):
```ts
// src/app/calculators/score2.ts
export const SCORE2_SCHEMA: CalculatorSchema = {
  id: 'score2',
  nameUz: 'SCORE2 — 10 yillik yurak-tomir xavf',
  source: 'ESC 2021',
  inputs: [
    { id: 'age', type: 'number', labelUz: 'Yosh', min: 40, max: 69, required: true },
    { id: 'sex', type: 'select', labelUz: 'Jins', options: ['male', 'female'], required: true },
    { id: 'smoking', type: 'boolean', labelUz: 'Chekish' },
    { id: 'sbp', type: 'number', labelUz: 'SBP (mmHg)', min: 100, max: 200 },
    { id: 'nonHdl', type: 'number', labelUz: 'Non-HDL (mmol/L)', min: 3.0, max: 7.0 },
    { id: 'region', type: 'select', options: ['low', 'moderate', 'high', 'very-high'],
      default: 'high' /* O'zbekiston */ },
  ],
  compute: (v) => computeScore2(v),  // pure function
  output: {
    format: 'percent',
    interpretation: (r) => {
      if (r < 2.5) return { label: 'Past xavf', color: 'green' };
      if (r < 7.5) return { label: 'O'rtacha', color: 'yellow' };
      if (r < 15)  return { label: 'Yuqori', color: 'orange' };
      return { label: 'Juda yuqori', color: 'red' };
    },
  },
  references: ['SCORE2 working group, Eur Heart J 2021;42(25):2439-2454'],
};
```

**Backend**: kalkulyatorlar client-side (tezlik + offline), lekin qiymat **auditlog**ga yuboriladi:
```
POST /api/v1/calculators/:id/log
{ sessionId?, inputs, result }
```

#### 3.5.3 UI
- Card yoki modal. "Hisoblash" tugmasi.
- Natija — gauge (radial progress) + interpretatsiya matni + "Formulani ko'rish" (DOCTOR rejimida) + "Manba" (klikabelli link)
- "Kasallik kartasiga saqlash" — agar shifokor bemor session'ida bo'lsa

#### 3.5.4 Acceptance criteria
- SCORE2 natijasi 20 ta referans case'da ESC jadvali bilan **100% mos**
- Invalid input'da real-time xato ko'rsatadi
- Mobile da barcha input 1 ustunli form, keyboard type mos (number)
- Audit log server'ga yetkaziladi

#### 3.5.5 Ish hajmi: **13 SP** (5 kalkulyator × ~2 SP + infratuzilma 3 SP)

---

### GAP-06 · Body Map (Tana Sxemasi)

#### 3.6.1 Tibbiy asoslanish
Og'riq yoki simptom lokalizatsiyasi — bemor savoli uchun qiyin (anatomik terminologiya). Vizual tana xaritasi — klinik skrining standarti (British Medical Journal, "Body Chart" 2019).

#### 3.6.2 UI spec
- **SVG asos** (anterior + posterior view), zonalarga bo'lingan (`<path data-zone="chest">`)
- **Zonalar** (30+): head, face, neck (anterior/posterior), chest, abdomen (4 kvadrant), left/right arm (shoulder/upper/elbow/forearm/wrist/hand), left/right leg, back (upper/lower), pelvis, genital
- **Interaksiya**:
  - Bosilganda — zona highlight (hover: outline; active: fill)
  - Ikkinchi bosish — chiqarib tashlash
  - Uzoq bosish (mobile) — detail popup: og'riq turi (o'tkir/o'tmas/yonuvchi/sanchuvchi), intensivlik slider (1-10)
- **Legend**: ranglar kaliti (og'riq intensivlikga ko'ra)
- **Multi-select**: bir necha zona bir vaqtda
- **Orqa tarafga o'tish**: "Orqa tomoni" toggle (swipe yoki tugma)

#### 3.6.3 Ma'lumot modeli
Mavjud: `Symptom.bodyZone: String?`. Kengaytirish — BodyZone enum (kontrolli so'zluk):

```ts
// src/app/constants/body-zones.ts
export const BODY_ZONES = {
  head: { labelUz: 'Bosh', labelLat: 'caput' },
  'head.frontal': { labelUz: 'Peshana', parent: 'head' },
  'head.temporal': { labelUz: 'Chakka', parent: 'head' },
  'head.occipital': { labelUz: 'Ensa', parent: 'head' },
  chest: { labelUz: 'Ko\'krak', labelLat: 'thorax' },
  'chest.retrosternal': { labelUz: 'Ko\'krak orqasi', parent: 'chest' },
  // ...30+
} as const;
```

Prisma:
```prisma
model SymptomBodyZone {
  symptomId String
  zoneCode  String  // BodyZone keyi
  severity  Int?    // 1-10
  @@id([symptomId, zoneCode])
}
```

#### 3.6.4 Acceptance criteria
- SVG 30+ zonada klik/tap javob beradi
- Mobile touch-target ≥44×44px (WCAG)
- Screen reader: har zona `<title>` va `aria-label` bilan
- Multi-select holat session'ga saqlanadi
- Orqa view swipe/tugma bilan almashadi

#### 3.6.5 Ish hajmi: **13 SP**

---

### GAP-07 · Stage Stepper (Interaktiv bosqichlar)

#### 3.7.1 Tibbiy asoslanish
Kasallik bosqichlari (stadium) — terapev taktikasini belgilaydi. HTN uchun ESC 2023:
- **Stage I** (SBP 140-159 yoki DBP 90-99)
- **Stage II** (160-179 / 100-109)
- **Stage III** (≥180/110)
- **Hypertensive Crisis** (≥180/120 + oxrgan zarari)

Har bosqich **maxsus targ'ibotlar** (target BP, preparat tanlovi, maqsad MAP).

#### 3.7.2 UI
- Horizontal stepper (desktop), vertical (mobile)
- Har step — dumaloq number + label + mini-tavsif
- Faol step — outlined + expanded panel (pastki 60vh) quyidagilar bilan:
  - Klinik tasniflash (BP range, belgilar)
  - Diagnostik talablar (qaysi labs, instrumental)
  - Terapevtik yondashuv (non-farm + dori)
  - Hedef (target BP)
  - Asoratlar xavfi
- Prev/Next tugmalari, keyboard ← →

#### 3.7.3 Ma'lumot modeli
Mavjud: `DiseaseStage`. Kengaytirish:
```prisma
model DiseaseStage {
  // ... mavjud maydonlar
  diagnosticCriteriaJson Json? // { sbp: [140, 159], dbp: [90, 99] }
  targetBp              String? // "< 140/90"
  therapeuticApproach   String? @db.Text
  complicationsRiskJson Json?  // { stroke: 1.5, mi: 1.3 }  // relative risk
}
```

#### 3.7.4 Ish hajmi: **8 SP**

---

### GAP-08 · FHIR R4 Eksport

#### 3.8.1 Tibbiy asoslanish
FHIR (Fast Healthcare Interoperability Resources) R4 — global EHR almashinuv standarti (HL7 2019). Bemor sessiyasini **QuestionnaireResponse** resursi sifatida eksport — keyinchalik O'zbekiston Milliy SIP (Sog'liqni saqlash Informatsiyon Platformasi) bilan integratsiya uchun asos.

#### 3.8.2 FHIR payload tuzilishi

```json
{
  "resourceType": "QuestionnaireResponse",
  "id": "smm-{sessionId}",
  "questionnaire": "https://medsmart.uz/fhir/Questionnaire/symptom-matcher|1.0",
  "status": "completed",
  "subject": { "reference": "Patient/{userId}" },
  "authored": "2026-04-18T12:34:00+05:00",
  "item": [
    {
      "linkId": "symptoms",
      "text": "Simptomlar",
      "item": [
        {
          "linkId": "symptom.{id}",
          "text": "Bosh og'riq",
          "answer": [{ "valueCoding": { "system": "http://snomed.info/sct", "code": "25064002", "display": "Headache" } }]
        }
      ]
    },
    {
      "linkId": "risk-factors", "item": [ /* ... */ ]
    },
    {
      "linkId": "ddx-result",
      "answer": [
        { "valueCoding": { "system": "http://hl7.org/fhir/sid/icd-10", "code": "I10", "display": "Essential hypertension" } }
      ]
    }
  ]
}
```

#### 3.8.3 Validation
- Server-side: `@smile-cdr/fhirts` yoki `fhir-validator-java` (Docker)
- Minimal SNOMED CT + LOINC kodlar `Symptom` modeli ga qo'shilishi kerak:

```prisma
model Symptom {
  // mavjud
  snomedCtCode String?
  loincCode    String?
}
```

#### 3.8.4 UI
- Bosqich 4 ga pastki expandable panel: "FHIR payload ko'rinishi"
- JSON syntax highlight (`shiki` yoki `prism`)
- "Copy JSON" tugmasi
- "Download .json" tugmasi

#### 3.8.5 Acceptance criteria
- Server `POST /api/v1/triage/session/:id/export/fhir` valid FHIR R4 JSON qaytaradi
- HL7 FHIR Validator `no errors` (warning'lar OK)
- Kopiyalash + yuklab olish ishlaydi

#### 3.8.6 Ish hajmi: **8 SP**

---

### GAP-09 · Timeline (Kasallik Evolyutsiyasi)

#### 3.9.1 Tibbiy asoslanish
Simptomlar kronologiyasi — akut vs surunkali farqlanish uchun kalit. Uchta view kerak:
- **Bemor timeline**: bemor kiritgan voqealar (hozirgi sessiya)
- **Kasallik tabiiy evolyutsiyasi** (general): kasallik odatiy rivojlanishi (statik)
- **Davo mobiliyati** (follow-up): dori qo'shilgan sanalar, BP o'lchashlar, asoratlar

#### 3.9.2 UI
- Horizontal axis (zoom imkoniyati, pinch-to-zoom mobile)
- Events — marker (dumaloq), hover/tap → detail popover
- Granulatsiya: kun / hafta / oy / yil
- Multi-layer: bemor events + general milestone'lar (rangli farqli)

#### 3.9.3 Ma'lumot modeli
```prisma
model DiseaseTimeline {
  id          String   @id @default(uuid())
  diseaseId   String
  phase       String   // "asymptomatic", "prodrome", "acute", "chronic", "complication"
  labelUz     String
  descriptionUz String? @db.Text
  typicalStartDays Int?  // kasallik boshlanganidan
  typicalEndDays   Int?
  orderIndex       Int

  disease     Disease  @relation(fields: [diseaseId], references: [id], onDelete: Cascade)
  @@index([diseaseId])
}
```

#### 3.9.4 Ish hajmi: **8 SP**

---

### GAP-10 · UZ/RU/EN Til Switcher (UI)

#### 3.10.1 Tibbiy asoslanish
O'zbekistonda klinika yuzaga — ikki tilli (uz + ru). Xalqaro referal uchun en. Schema'da `nameUz/Ru/En`, `DiseaseBlock.translationStatusUz/Ru/En` bor — lekin UI switcher yo'q.

#### 3.10.2 UI
- Header da segmented control: `UZ | RU | EN`
- Holatlar:
  - **VERIFIED** (yashil) — to'liq tarjima
  - **PENDING** (sariq) — qisman, "Asl uz tilida ko'rish" fallback
  - **MACHINE** (kulrang) — AI tarjima qilgan, "⚠️ Avtomatik tarjima" chip
- Fallback strategy: tanlangan til topilmasa → uz
- Tilni tanlash **per-user preference** (localStorage + backend user profile)

#### 3.10.3 Backend
- `GET /api/v1/diseases/:slug?lang=ru` — controller har maydon uchun mos til qaytaradi
- `translationStatus` bloki bilan birga qaytadi

#### 3.10.4 Acceptance criteria
- Til almashtirganda kontent 200ms ichida yangilanadi (cached)
- Pending tarjima bo'lsa fallback ko'rsatiladi + warning chip
- URL `?lang=ru` saqlanadi (shareable link)
- Screen reader til atributini to'g'ri e'lon qiladi (`<html lang="ru">`)

#### 3.10.5 Ish hajmi: **5 SP**

---

## 4. Qisman funksiyalarni tuzatish (FIX-01 … FIX-08)

### FIX-01 · AI Match Banner ring gauge
- **Hozir**: `SymptomMatchBanner.tsx` banner, ring yo'q
- **Tuzatish**: 96×96 radial progress (match%), 4 ta sub-metrika (answered, redflag, confidence, risk) 48×48 kichik ring
- **Effort**: 3 SP

### FIX-02 · CTA row to'liq (saqlash, ulashish)
- **Hozir**: PDF + Send-to-doctor bor. Save, Share yo'q.
- **Tuzatish**:
  - "Saqlash" → `UserDiseaseNote` ga (yangi not yoki tag)
  - "Ulashish" → `navigator.share` API (mobile), clipboard copy fallback (web), shortened link (`POST /api/v1/shortlinks`)
- **Effort**: 3 SP

### FIX-03 · Olimlar jadvali + O'zbekiston hissasi alohida block
- **Hozir**: Markdown ichida
- **Tuzatish**: `DiseaseScientistsTable.tsx` — strukturalangan, `DiseaseScientist` Prisma modeli (id, name, yearsActive, contribution, country, avatar). O'zbek olimlari tabel uchun alohida `isLocal: Boolean`
- **Effort**: 5 SP

### FIX-04 · Media gallery (rasm/video)
- **Hozir**: Yo'q
- **Tuzatish**: `DiseaseMedia` modeli (id, diseaseId, type: IMAGE|VIDEO, url, captionUz, license, orderIndex). `MediaGallery.tsx` (thumbnail grid + lightbox). Supabase Storage.
- **Effort**: 5 SP

### FIX-05 · ICD-10 hierarchy navigatsiya tree
- **Hozir**: `icd.controller.ts` bor, tree UI yo'q
- **Tuzatish**: Chaptergi `<IcdTreeNav>` — lazy load bo'lim (I00-I99 → I10-I15 → I10). `GET /api/v1/icd/tree?parent=I10-I15`
- **Effort**: 5 SP

### FIX-06 · Print CSS
- **Hozir**: Yo'q
- **Tuzatish**: `@media print` stylesheet — sidebar yashiradi, tab strukturasini flat scroll ga, header logo + disease meta + sahifa raqam. `printPreview` mode tugmasi.
- **Effort**: 3 SP

### FIX-07 · Right-rail: navbat olish + tahlillar tavsiyasi
- **Hozir**: `DiseaseSpecialty` bor, UI yo'q
- **Tuzatish**: Right-rail card — tavsiya mutaxassis + "Navbat olish" tugmasi → `/applications/new?specialtyId=` (mavjud booking oqimi). Tavsiya labs/instrumental — `RecommendedTestsCard.tsx`
- **Effort**: 5 SP

### FIX-08 · Confidence tiles (bosqich 4)
- **Hozir**: `MatchScoreIndicator` bor, to'liq tile-lar yo'q
- **Tuzatish**: 4 tile grid — Quality, Risk, Urgency, Completeness; har biriga ikona + foiz + tooltip izoh
- **Effort**: 3 SP

**Jami FIX effort**: 32 SP

---

## 5. Qo'shimcha funksionalliklar takliflari (demo'da yo'q)

### ADD-01 · Klinik qaror audit va explanation (XAI)
**Nega**: AI tavsiyalari **shaffof** bo'lishi shart (EU AI Act 2024 talab). Har DDx score uchun "Nima uchun bu kasallik?" paneli.

**UI**: Har DDx item yonida "?" ikona → popover:
- Qaysi simptomlar match'ga hissa qo'shdi (weight × response)
- Qaysi risk omillar multiplier berdi
- Formula breakdown (DOCTOR rejimida)
- "Siz bu natijaga ishonchsizmi? Fikr yuboring" feedback link

**Effort**: 5 SP · **Prioritet**: P1

---

### ADD-02 · Bemor so'rov journali (Patient Diary)
**Nega**: Surunkali kasalliklarda (HTN, DM) **davom etuvchi kuzatuv** kerak. Bemor har kuni BP, simptom, dori qabulini log qilsa — grafik evolyutsiya va shifokor follow-up osonlashadi.

**UI**:
- Pull-to-log card (oson kirish)
- 3 turda: BP o'lchash (SBP/DBP/pulse), simptom yozish, dori qabuli tasdiqi
- Trend chart (haftalik/oylik)
- Shifokor bilan ulashish (opt-in)

**Data model**: `PatientLog` (userId, type, valueJson, timestamp)

**Effort**: 13 SP · **Prioritet**: P1

---

### ADD-03 · Klinik case quiz (Talaba uchun)
**Nega**: Tibbiyot talabalar uchun **case-based learning** — USMLE, TOS-IMAT formatiga yaqin. Tijorat farqlash + marketing.

**UI**: "Quiz rejim" tugmasi → kasallik kartasi → simptom slayd-slayd → savol → javob → tushuntirish (rationale).

**Data model**: `ClinicalCase` bor; `CaseQuestion` qo'shiladi (caseId, stem, options[], correctIdx, explanationUz)

**Effort**: 8 SP · **Prioritet**: P2

---

### ADD-04 · Dori-dori ta'siri tekshiruvi (DDI Checker)
**Nega**: Polifarmatsiya — keksalarda uchinchi asosiy dori xatolik sababi (JAMA Intern Med 2017). Dorilarni kiritganda **o'zaro reaksiyani ogohlantirish**.

**UI**: Bemor / shifokor dori ro'yxati kiritadi → "Tekshirish" → oqash/sariq/qizil ogohlantirish jadvali.

**Data**: Tashqi API (UptoDate / Lexicomp) yoki lokal DB (`DrugInteraction`). MVP — top 100 eng tez-tez ishlatiladigan dori.

**Effort**: 13 SP · **Prioritet**: P2

---

### ADD-05 · Offline mod (PWA)
**Nega**: O'zbekiston viloyatlarida internet uzilishlar. Bemor va shifokor asosiy kasallik kartalariga offline kira olishi muhim.

**Texnika**: Service Worker + IndexedDB (Dexie) + Vite PWA plugin. MVP — top 50 kasallik `L1` tili offline caching.

**Effort**: 8 SP · **Prioritet**: P1

---

### ADD-06 · Voice input (bemor simptom kiritishda)
**Nega**: Yoshi katta bemorlar yozib kirita olmaydi — ovoz kirish kirish to'sig'ini pasaytiradi. Web Speech API `uz-UZ` mavjud (cheklangan, lekin MVP uchun yetarli).

**UI**: Mikrofon ikonasi simptom inputi yonida → gapiradi → tarjima qilinadi → chip yaratiladi.

**Effort**: 5 SP · **Prioritet**: P2

---

### ADD-07 · A/B test va klinik experiment platform
**Nega**: Yangi DDx algoritm, UI variantlarni **haqiqiy klinik metrikaga** (DDx to'g'riligi, shifokorga murojat darajasi) qarshi sinash zarur. Hardcoded "bu yaxshiroq" — noto'g'ri.

**Data**: `Experiment`, `ExperimentVariant`, `UserAssignment` modellari. GrowthBook yoki in-house feature-flag service.

**Effort**: 13 SP · **Prioritet**: P2 (umumiy platform qiymati)

---

### ADD-08 · Tadqiqot dashboard (Research/Analytics)
**Nega**: Anonimlangan agregat ma'lumotlar — O'zbekistonda **epidemiologik tadqiqot** uchun noyob resurs. Shifokorlar o'rta, viloyat bo'yicha HTN tarqalishi kabi savollarga javob olishi mumkin.

**UI**: Alohida `/research` yo'l (admin/researcher role). Queries: kasallik bo'yicha frekvent simptomlar, viloyat bo'yicha tarqalish, yosh guruh korrelyatsiyasi, mavsumiylik.

**Privacy**: k-anonymity ≥ 5, hech qanday PHI ko'rinmaydi.

**Effort**: 21 SP · **Prioritet**: P3 (uzoq muddatli qiymati katta)

---

### ADD-09 · Shifokor muloqot (Tele-consult integration)
**Nega**: Bemor SymptomMatch yakunlagach — **darhol tele-konsultatsiya** (WebRTC) imkoniyati. Hozir booking oqimi bor, lekin "1-click to consult" yo'q.

**UI**: Bosqich 4 da "Hoziroq shifokor bilan gaplashish" tugma → navbat topsa → video call.

**Effort**: 13 SP · **Prioritet**: P1 (konsultatsiya moduliga qaram)

---

### ADD-10 · Machine-translated tarjima loop (uz↔ru↔en)
**Nega**: 500+ kasallik × 3 til × 8-12 block = ~15,000 bloklar. Qo'lda tarjima — 2 yildan ko'p. Birinchi pass — AI (GPT-4o / Claude) tarjima, keyin tibbiy muharrir review.

**Oqim**:
1. Block uz tilida yozilsa → `translationStatusRu = PENDING` → background job AI tarjima → `MACHINE` statusga o'tadi
2. Moderator review queue'da ko'radi → tuzatadi → `VERIFIED`

**Effort**: 13 SP · **Prioritet**: P1

---

## 6. Nofunksional talablar

### 6.1 Performance
- **LCP** (Largest Contentful Paint) ≤ 2.5s 3G fast simulatsiyada
- **FID** (First Input Delay) ≤ 100ms
- **CLS** (Cumulative Layout Shift) ≤ 0.1
- Disease card API response ≤ 300ms (p95, cached)
- Symptom search autocomplete ≤ 150ms (p95)
- DDx recalc ≤ 500ms (p95)

**Strategiyalar**:
- React Query caching (`staleTime: 5 min` kasallik kartasi uchun)
- Pagination / virtualized list (100+ kasallik)
- Image lazy loading + AVIF/WebP
- Edge caching (Supabase CDN yoki Cloudflare)
- Prisma `select` — faqat zarur maydon

### 6.2 Accessibility (WCAG 2.1 AA)
- Color contrast ≥ 4.5:1 (matn), 3:1 (UI elementlari)
- Keyboard-only navigation har bir interaktiv element
- Screen reader friendly (ARIA landmarks, labels)
- Focus indicators 2px outline
- Touch target ≥ 44×44px (mobile)
- Respect `prefers-reduced-motion`
- Alt matn har rasmga; SVG uchun `<title>`

### 6.3 i18n / l10n
- Barcha UI string `t('key')` orqali (i18next yoki `@lingui/core`)
- Raqam/sanani lokal format (`date-fns` locale, `Intl.NumberFormat`)
- RTL — hozir rejada yo'q (kelajakda arab tili)
- Kasallik ma'lumotlari — schema da uz/ru/en

### 6.4 Xavfsizlik
- JWT 7-day expiry (mavjud)
- Rate limiting: `@nestjs/throttler` — 60 req/min per IP (anonim), 300 req/min (auth)
- CSRF: `SameSite=Lax` cookies
- Input sanitization — `class-validator` + `DOMPurify` markdown render'da
- PHI — MVP'da yo'q (platforma demo/anonim); haqiqiy PHI O'zbekiston hostinga ko'chgandan keyin
- Audit log: kim, qachon, qaysi kasallik kartasini o'qidi/tahrir qildi → `AuditLog` tabel

### 6.5 Observability
- **Logging**: Winston + Supabase / Sentry breadcrumbs
- **Error tracking**: Sentry (frontend + backend)
- **Analytics**: PostHog (open-source) — event based:
  - `symptom_matcher_started`, `symptom_matcher_completed`, `ddx_viewed`
  - `emergency_banner_triggered`, `emergency_call_clicked`
  - `disease_card_opened`, `tab_switched`, `calculator_used`
- **Metrics**: latency percentiles, error rate, funnel conversion
- **Health checks**: `/health` endpoint — DB, Redis, Supabase Storage ping

### 6.6 Test qamrovi
- **Unit**: Service qatlami ≥ 80% coverage (Jest)
- **Integration**: Prisma + NestJS testing module (in-memory DB yoki Testcontainers)
- **E2E**: Playwright — 10 kritik scenario (symptom matcher full flow, red-flag, auth, moderation publish)
- **Klinik validation**: 100 ta retrospektiv case (shifokor validated), DDx top-5 da asl tashxis ≥ 80%

---

## 7. Data Governance, xavfsizlik, klinik javobgarlik

### 7.1 Klinik kontent sifati
- Har block **evidence level** (A/B/C) tayinlanishi shart
- Reference kamida 1 (peer-reviewed protocol yoki guideline)
- Moderator double-review (2 ta tibbiy muharrir, 1 klinik mutaxassis)
- Lifecycle scan — 12 oy ichida yangilanmagan kasalliklar avtomatik `STALE` statusga

### 7.2 Klinik disclaimer (legal)
- Har kasallik karta ostida (mobile — sticky footer):
  > "⚠️ Bu ma'lumot faqat ta'limiy xarakterga ega va **mutaxassis konsultatsiyasini almashtira olmaydi**. Shoshilinch holatlarda 103 ga qo'ng'iroq qiling."
- SymptomMatcher natijasi ostida:
  > "AI yordamida chiqarilgan taxminiy natija. To'liq tashxis uchun shifokor tomonidan ko'rib chiqilishi shart."
- Legal team (Sog'liqni saqlash vazirligi) — kontent review qoidalarini tasdiqlash

### 7.3 PHI (Protected Health Information)
- MVP/demo: PHI **yo'q** — Supabase cloud'da saqlash xavfsiz (anonim)
- Haqiqiy klinik ishlab chiqarish: PHI **O'zbekiston hostingga ko'chiriladi** (IaaS UZINFOCOM yoki shunga o'xshash)
- SymptomMatchSession `userId` yoki anonim — agar authenticated bo'lsa, user profile bilan bog'lanadi (lekin tanasida PHI yo'q, faqat simptom ID'lar)

### 7.4 GDPR / O'zbekiston "Shaxsiy ma'lumotlar to'g'risida"gi Qonun (2019)
- Foydalanuvchi o'z ma'lumotlarini yuklab olishi (`/api/v1/me/export`) — JSON
- O'chirish huquqi (`DELETE /api/v1/me`) — soft-delete, 30 kun saqlash, keyin hard-delete
- Cookie policy, consent banner (analytics uchun opt-in)

---

## 8. Milestone, RACI, Definition of Done

### 8.1 Milestone'lar (8 sprint ≈ 16 hafta)

| Milestone | Sprint | Deliverable |
|---|---|---|
| **M1: Xavfsizlik poydevori** | 1-2 | GAP-04 red-flag, GAP-02 8-tab, GAP-10 til switcher |
| **M2: Klinik qaror** | 3-4 | GAP-01 wizard, GAP-03 live DDx |
| **M3: Interaktiv widgetlar** | 5-6 | GAP-05 kalkulyatorlar, GAP-06 body map, GAP-07 stages |
| **M4: Integratsiya va polish** | 7-8 | GAP-08 FHIR, GAP-09 timeline, FIX-01…08, ADD-01, ADD-05 |
| **M5: Validation va prod** | 9 | Klinik QA, WCAG audit, performance, feature-flag prod rollout |

### 8.2 RACI

| Ish | Mahsulot | Muhandis FE | Muhandis BE | Klinik ekspert | QA | UX dizayner |
|---|---|---|---|---|---|---|
| TZ tasdiqlash | R/A | C | C | C | I | C |
| UI prototype | I | C | — | C | I | R/A |
| Frontend implementatsiya | I | R/A | C | I | C | C |
| Backend implementatsiya | I | C | R/A | I | C | — |
| Klinik kontent (kasallik yozma) | I | — | — | R/A | I | — |
| Klinik validatsiya | C | I | I | R/A | C | — |
| QA / test | C | C | C | I | R/A | I |
| Release go/no-go | R/A | I | I | C | C | — |

(R=Responsible, A=Accountable, C=Consulted, I=Informed)

### 8.3 Definition of Done (har ish birligi uchun)

- [ ] Kod — TypeScript strict, `any` yo'q, lint pass
- [ ] Unit test — ≥ 80% coverage (service qatlami)
- [ ] E2E test — mos scenario Playwright'da
- [ ] OpenAPI — `openapi:generate` yangilandi
- [ ] Accessibility — axe-core zero serious, manual keyboard test pass
- [ ] Performance — LCP budget ichida (Lighthouse CI pass)
- [ ] Klinik review — tibbiy ekspert signed-off (agar kontent)
- [ ] i18n — uz/ru tugallangan, en minimum
- [ ] Analytics — event emit qilinadi
- [ ] Feature flag — `APP_FEATURE_<MODULE>` bilan gate
- [ ] Hujjat — `docs/09-modules/disease-kb-module.md` yangilandi
- [ ] Commit — convention (`feat(kb): ...`)
- [ ] Code review — ≥ 1 approve, CI yashil
- [ ] Staging'da manual test pass

---

## 9. Xavflar va kamaytirish

| # | Xavf | Ehtimollik | Ta'sir | Kamaytirish |
|---|---|---|---|---|
| R-01 | Klinik kontent sifati past — noto'g'ri tashxis xavfi | M | H | Har kasallik 2 mustaqil ekspert review; evidence-level majburiy; disclaimer yaqqol |
| R-02 | Red-flag algoritm false-negative (critical missed) | L | Critical | QA suite 20+ klinik case, retrospektiv validation 100 case, qo'shimcha safety-net: har "ogʻir og'riq" + "bilim o'zgarishi" avtomatik CRITICAL |
| R-03 | FHIR eksport validatsiyasi notogʻri — EHR integratsiyasi buziladi | M | M | HL7 Validator CI pipeline; external testing (FHIR test server) |
| R-04 | Tarjima sifati past (ru/en) | H | M | AI + human review loop (ADD-10); `MACHINE` status UI da yaqqol |
| R-05 | Performance — 500+ kasallik load slow | M | M | Pagination, virtualization, edge cache, Prisma `select` |
| R-06 | Scope creep — ADD-*lardan ko'pchiligi MVP'ga tiqildi | H | M | Sprint planning'da aniq cheklov; backlog grooming; stakeholder consensus M2 oxirida |
| R-07 | Developer resursi yetmaydi (2-3 FE, 1-2 BE kerak) | M | H | M2 oxirida yana bir FE/QA yollash kerak bo'lishi mumkin |
| R-08 | Klinik mutaxassislar vaqt bera olmaydi | M | H | Har mutaxassis bilan haftalik 4 soat kontrakt; top 50 kasallik prioritet tartibda |
| R-09 | PHI protokol noto'g'ri — huquqiy muammo | L | Critical | Legal review; MVP PHI-free; har feature-flagga "data classification" teg |
| R-10 | User feedback — bemor wizard'ni juda uzun deb topadi | M | M | UX test (5 bemor), bosqichni qisqartirish option ("Tez rejim"), skip-ahead qoidalari |

---

## 10. Javob olish va keyingi qadamlar

### 10.1 Stakeholder tasdiqi kerak (har bandi)
- [ ] **Klinik direktor**: tibbiy asoslanish, evidence level, red-flag qoidalari, disclaimer matn
- [ ] **Mahsulot menedjeri**: prioritet, ADD-*lardan qaysini MVP'ga kiritish
- [ ] **Tech lead**: texnik yondashuv, Prisma migratsiyalar, API versioning
- [ ] **UX lead**: UI prototype (Figma) 8-tab, wizard, body map, kalkulyator
- [ ] **Legal / DPO**: PHI strategiyasi, GDPR / UZ Personal Data Law
- [ ] **QA lead**: test strategiyasi, klinik validation plan

### 10.2 Darhol keyingi qadam (hafta 1)
1. TZ ni stakeholderlar bilan review (2 soat kickoff)
2. Figma UI prototip (GAP-01 wizard + GAP-02 8-tab) — UX dizayner 5 kun
3. Prisma migratsiya shabloni (RedFlagRule, DiseaseMedia, DiseaseScientist, DiseaseTimeline, PatientLog) — BE muhandis 3 kun
4. Storybook setup + design tokens (shadcn asosida) — FE muhandis 2 kun
5. Klinik mutaxassislar bilan HTN kartasi to'liq yozish pilot (birinchi kasallik) — tibbiy muharrir 5 kun

### 10.3 Baholash meta-mezon
Har oy oxirida:
- Success metrika (0.3 bo'lim) ga qarshi progress
- DDx to'g'riligi (retrospektiv 20 yangi case)
- Bemor/shifokor NPS (in-app so'rov)
- Sprint velocity (rejalashtirilgan SP vs yetkazib berilgan)

---

## Ilova A — Terminlar lug'ati

| Termin | Izoh |
|---|---|
| **DDx** | Differential Diagnosis — differensial tashxis |
| **FHIR** | Fast Healthcare Interoperability Resources — HL7 standarti |
| **ICD-10/11** | International Classification of Diseases |
| **LOINC** | Logical Observation Identifiers — lab test kodlari |
| **SNOMED CT** | Sistematic Nomenclature of Medicine — klinik terminologiya |
| **SCORE2** | Systematic Coronary Risk Evaluation 2 (ESC 2021) |
| **CHA₂DS₂-VASc** | AF bemorlarida stroke xavfi skori |
| **XAI** | Explainable AI |
| **PHI** | Protected Health Information |
| **k-anonymity** | Anonimlashtirish chorasi |
| **AuditLog** | Audit yozuvlari (kim, qachon, nima) |
| **WCAG** | Web Content Accessibility Guidelines |
| **LCP / FID / CLS** | Core Web Vitals metrikasi |

---

## Ilova B — Reference va protokollar

1. ESC/ESH Guidelines for Management of Arterial Hypertension 2023
2. AHA/ACC High Blood Pressure Guideline 2017
3. WHO Clinical Practice Guidelines for Hypertension
4. KDIGO Clinical Practice Guideline for Evaluation and Management of CKD 2024
5. HL7 FHIR R4 Specification (http://hl7.org/fhir/R4/)
6. Harrison's Principles of Internal Medicine, 21th ed.
7. SCORE2 working group, Eur Heart J 2021;42(25):2439-2454
8. Croskerry P. "The importance of cognitive errors in diagnosis." Acad Emerg Med 2002
9. Singh H. et al. "Types and origins of diagnostic errors in primary care." BMJ Qual Saf 2014
10. Harrison's "Decision-Making in Clinical Medicine" Ch. 4

---

## Ilova C — Ish hajmi summaryasi

| Kategoriya | Ish birligi | SP | ~Odam-kun (1 SP ≈ 0.5 kun) |
|---|---|---|---|
| GAP-01 … GAP-10 | 10 | **108** | ~54 |
| FIX-01 … FIX-08 | 8 | **32** | ~16 |
| ADD-01 … ADD-10 (tanlov) | 6 (Priority P1-P2) | **65** | ~33 |
| Infra (CI/CD, monitoring, analytics setup) | — | **13** | ~7 |
| QA, Klinik validation | — | **21** | ~11 |
| **JAMI (MVP + asosiy ADDs)** | | **~239 SP** | **~120 odam-kun ≈ 6-8 hafta 3 developer bilan** |

---

**Hujjat oxiri.** Savollar, tasdiq va o'zgarishlar — `docs/analysis/tz-disease-kb-gaps.md` ni pull-request orqali yangilang yoki TZ stakeholder kickoff yig'ilishida muhokama qiling.
