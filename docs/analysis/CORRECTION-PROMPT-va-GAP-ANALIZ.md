# 🔧 CORRECTION PROMPT + DEEP GAP ANALYSIS

## MedSmart-Pro · Disease KB Module — Nima noto'g'ri tushunilgan va qanday to'g'rilash

**Hujjat maqsadi**: Foydalanuvchining asl niyatini qayta tiklash; oldingi Claude/AI urinishlarida tushunilmagan joylarni aniqlash; yangi, aniq, qayta ishlatiladigan **correction prompt** va **qadamma-qadam tahlil reja** taqdim etish.

**Muallif rollari (20+ yillik ekspert darajasida)**: Senior Project Manager · Senior Full-Stack Engineer · Business Analyst · System Analyst · UX/UI Designer · Medical Domain Expert.

**Sana**: 2026-04-20 · **Status**: v1.0 (aniqlanish bosqichi) · **Til**: uz (texnik terminlar en/ru)

---

## 1. EXECUTIVE SUMMARY (1 sahifa)

### 1.1. Sizning asl niyatingiz (rekonstruksiya)

Siz bitta, aniq belgilangan oqimni so'ragansiz:

> **Bemor** → `Ariza` → `AI Tavsiya — shikoyatim bor` → simptomlarni kiritadi → `Tahlil natijalari` oynasida ehtimoliy kasalliklar ro'yxatini oladi (masalan: **Migren · G43.9 · 95%**) → shu **kasallik nomiga yoki MKB-10 kodiga bosganda** → alohida **Kasallik Kartasi** oynasi ochiladi → u yerda kasallik haqida **to'liq, ko'p qatlamli, professional ma'lumot** bor (40+ bo'lim) → bemor o'zining simptomlarini ushbu kasallik belgilari bilan **taqqoslay oladi** ("bor / yo'q / aniq emas") → natijani shifokorga yuboradi.

Shu bilan birga, siz yana 3 ta strategik talabni qo'shgansiz:

1. **Multi-audience**: bitta kasallik kartasi — bemor, talaba, hamshira, shifokor, mutaxassislar uchun bir vaqtda ishlaydi (ko'rish rejimi — `view mode`).
2. **Moderatsiya pipeline**: kontent ekspert (professor / bosh mutaxassis) tomonidan tasdiqlanmaguncha nashrga chiqmaydi; boshqalar qo'shgan qo'shimchalar ham qayta tasdiqlanadi.
3. **Ko'p maqsadli reusable domain core**: bu modul Konsultatsiya, Radiologiya, Uy-vizit, Triage, EHR, Ta'lim modullari uchun **yagona haqiqat manbai** (single source of truth) bo'ladi.

### 1.2. Nima qilingan (fakt)

Loyihada **asos bor**, lekin u parchalangan va oqim uzilgan. Quyida topilgan komponentlar (`docs/`, `server/`, `src/` bo'yicha):

| Komponent | Holati | Fayl / Modul |
|---|---|---|
| Feature analysis + implementation plan | ✅ yozilgan | `docs/analysis/feature-analysis.md`, `implementation-plan.md` |
| Module overview | ✅ yozilgan | `docs/09-modules/disease-kb-module.md` |
| Gap-analiz | ✅ yozilgan | `docs/analysis/tz-disease-kb-gaps.md` |
| Batafsil TZ (26 bo'lim) | ✅ yozilgan | `MedSmart-Pro_Kasalliklar_Moduli_TZ.md` (1003 qator) |
| Prisma schema: Disease, Symptom, DiseaseBlock, Reference, SymptomMatchSession, … | ✅ 15+ model | `server/prisma/schema.prisma` |
| Backend endpoints `/api/v1/diseases` CRUD + FTS + pgvector | ✅ asos bor | `server/src/diseases/` |
| Frontend matcher (`DiagnosisResults`) | ⚠️ qisman — mock data | `src/app/components/screens/patient/DiagnosisResults.tsx` |
| Mock clinical KB (8 kasallik) | ⚠️ faqat 8 ta | `src/app/data/clinicalKB.ts` |
| Admin KB browser | ⚠️ faqat list, editor yo'q | `src/app/components/screens/web/WebRefKBDiseasesScreen.tsx` |
| **Disease Detail Screen (bemor uchun kasallik kartasi)** | ❌ **yo'q** | — kerak: `src/app/components/screens/patient/DiseaseCard.tsx` |
| **Symptom Matcher Sheet (bor/yo'q/aniq emas)** | ❌ **yo'q** | — kerak: `src/app/components/screens/patient/SymptomMatcherSheet.tsx` |
| **Send-to-Doctor flow (FHIR export)** | ❌ **yo'q** | — kerak: `src/app/components/screens/patient/SendToDoctor.tsx` |
| **Doctor incoming panel** | ❌ **yo'q** | — kerak: `src/app/components/screens/doctor/IncomingCasePanel.tsx` |
| **Moderation queue UI** | ❌ **yo'q** | — kerak: `src/app/components/screens/web/WebKBModerationQueue.tsx` |
| **WYSIWYG editor (markerli template)** | ❌ **yo'q** | — kerak: `src/app/components/screens/web/WebKBDiseaseEditor.tsx` |
| demo.html (Gipertoniya · I10 · 8000 qator) | 🟡 **alohida**, loyihaga bog'lanmagan | `/uploads/demo.html` |

### 1.3. Asosiy muammo (1 jumla)

> **Ko'p "qog'oz" tayyor (4 ta analysis hujjati + 1000 qatorli TZ + 8000 qatorli demo), lekin `AI Tavsiya → Kasallik Kartasi → Simptom taqqoslash → Shifokorga yuborish` end-to-end oqimi hech bir joyda ishchi kod ko'rinishida yig'ilgan emas, va "kasallik bazasi" moduli React ichidagi konkret ekran + route + state + API mappingi sifatida aniq belgilanmagan.**

---

## 2. GAP ANALIZ — Siz so'ragan talablar vs Amalga oshirilgan

Siz ikki marta bergan promtlardan **32 ta atomik talab** ajratib oldik. Har biri uchun: **Status** (✅ bor / 🟡 qisman / ❌ yo'q), **Qayerda**, **Nima qolgan**.

### 2.1. End-to-end bemor oqimi

| # | Talab | Status | Qayerda / Nima qolgan |
|---|---|---|---|
| 1 | Bemor `Ariza` → `AI Tavsiya — shikoyatim bor` yo'nalishi | ✅ | Frontend oqim bor |
| 2 | Simptom kiritish oynasi | ✅ | `DiagnosisResults.tsx` + body-zones |
| 3 | Tahlil natijalari — ehtimoliy kasalliklar ro'yxati % bilan | ✅ | Matcher ishlayapti (8 mock kasallik) |
| 4 | **Kasallik nomi yoki kodiga (MKB-10) bosganda kasallik kartasi ochilishi** | 🟡 | Router `/disease/:slug` mavjud, lekin `DiseaseCard.tsx` kompanenti **yaratilmagan** — faqat stub |
| 5 | **Simptomlarni "bor / yo'q / aniq emas" bilan belgilash** | ❌ | **Umuman yo'q** — backendda `SymptomMatchSession` model bor, UI yo'q |
| 6 | Bemor o'zining oldingi simptomlari bilan kasallik belgilari qancha mosligini ko'rishi | ❌ | Score matchingi backend-da mavjud, UI yo'q |
| 7 | "Shifokorga yuborish" tugmasi + FHIR export | 🟡 | demo.html ichida `exportAction('doctor')` bor, **asl appga integratsiya qilinmagan** |
| 8 | Shifokor incoming panel (bemordan kelgan sessiya) | ❌ | Backend endpoint yo'q, UI yo'q |
| 9 | Saqlash / keyinchalik ko'rish | ❌ | `SymptomMatchSession.saveDraft` endpoint yo'q |

### 2.2. Kasallik kartasi tarkibiy qismlari (40+ marker)

Siz ro'yxatlagan 40+ blok: *MKB-10, Umumiy ma'lumotlar, Sabablar, Patogenez, Belgilar, Diagnostika, Davolash, Prognoz, Klinik holatlar, …*

| # | Talab | Status | Izoh |
|---|---|---|---|
| 10 | Markerli template tizimi `{{etiology}}`, `{{pathogenesis}}`, … | ✅ | `server/src/diseases/markers/markers.ts` + Prisma `DiseaseBlock.marker` |
| 11 | Har bir blok uchun 2-3 sinonim sarlavha (spravochnik to'ldirganda zerikarli bo'lmasin) | 🟡 | **Idea TZ-da yozilgan, kod-da yo'q** — `markerLabels[marker][audienceMode]` table kerak |
| 12 | L1/L2/L3 chuqurlik qatlamlari (bemor/talaba/mutaxassis) | ✅ | `ContentLevel` enum + `DiseaseBlock.level` |
| 13 | Audience mode: Bemor/Talaba/Hamshira/Shifokor/Mutaxassis | ✅ | `AudienceMode` enum |
| 14 | Kasallik turlari, Rivojlanish bosqichlari (Dastlabki/Kengaytirilgan/Kechki) | ✅ | `DiseaseStage` model |
| 15 | Dori-darmonlar (dozalash, bemordan yashirish) | ✅ | `DiseaseMedication.audienceVisibility` |
| 16 | Tahlillar (LOINC kod) | ✅ | `DiseaseLabTest` |
| 17 | Klinik holatlar (anonim, yosh, jinsi, tashxis natijasi) | ✅ | `ClinicalCase` model |
| 18 | Bemor savollari / FAQ | ❌ | Marker bor (`patientFAQ`), kontent yo'q |
| 19 | Suratlari / media materiallari | 🟡 | Field bor (`mediaUrls[]`), UI gallery yo'q |
| 20 | Qon guruhi, genetik, qaysi hududda, kasallik tarixi | 🟡 | `RegionEpidemiology` bor, genetika/qon guruhi uchun `DiseaseGenetic` **yo'q** |
| 21 | Kasallikni tadqiq qilgan olimlar, so'nggi izlanishlar | ❌ | **Yo'q** — `DiseaseScientist`, `DiseaseResearch` modeli kerak |

### 2.3. Moderatsiya va kontent

| # | Talab | Status | Izoh |
|---|---|---|---|
| 22 | Draft → Review → Approved → Published pipeline | ✅ | `ApprovalStatus` enum |
| 23 | Tizim eksperti (professor/akademik/bosh mutaxassis) tomonidan tasdiqlash | ✅ | `MEDICAL_EDITOR` role guard |
| 24 | Qo'shimchalar ham qayta tasdiqlanishi | 🟡 | `DiseaseEditLog` bor, lekin "re-approval on edit" workflow **yo'q** |
| 25 | Har bir dalil / simptom / ma'lumot uchun **manba** (Reference) | ✅ | `Reference` + `DiseaseReference.blockMarker` |
| 26 | Bir simptom bir nechta manbada — evidence level A/B/C | ✅ | `EvidenceLevel` enum |
| 27 | Tajriba orqali tasdiqlangan (Real-world evidence) | ❌ | RWE markerlari yo'q |
| 28 | Ko'p maqsadli Spravochnik (to'ldirish oson) | 🟡 | CMS editor **yo'q** — `WebKBDiseaseEditor.tsx` yaratilmagan |

### 2.4. Shifokor / Talaba foydasi

| # | Talab | Status | Izoh |
|---|---|---|---|
| 29 | Shifokor / Talaba tizimdagi bemorlarning soni, yoshi, muammolarini ko'ra olishi | ❌ | Aggregate endpoint `/diseases/:id/cohort` yo'q |
| 30 | Chat yoki telefon orqali bemor bilan gaplashish (ruxsat asosida) | ❌ | Chat module boshqa modul, linkage yo'q |
| 31 | Bemor ma'lumotlarini ochiq / anonim qilish | 🟡 | `ClinicalCase.anonymousId` bor, bemor UI toggle yo'q |
| 32 | Har kasallik ichida qaysi tor mutaxassis ishlaydi | ✅ | `DiseaseSpecialty[]` field bor |

### 2.5. Statistika

- **To'liq bor (✅)**: 13 talab (~40%)
- **Qisman (🟡)**: 9 talab (~28%)
- **Yo'q (❌)**: 10 talab (~32%)

> Ya'ni, **taxminan 60% qolgan** — asosan frontend ekranlari, CMS editor, va "bor/yo'q/aniq emas" simptom taqqoslash oqimi.

---

## 3. NIMA NOTO'G'RI TUSHUNILGAN — Root-cause analysis

### 3.1. Asosiy sabablar (5 ta)

**1. Siz katta bir vazifa ichiga 4 ta alohida muammoni solganingizda, Claude har biriga alohida hujjat yaratgan, lekin ularni **bir oqim** sifatida kod'ga ko'chirmagan.**
- Sizning niyatingiz: bitta ko'p maqsadli modul.
- Claude natijasi: 4 ta parchalangan hujjat (feature-analysis, implementation-plan, disease-kb-module, tz-disease-kb-gaps) + Prisma modellari + qisman backend.

**2. "demo.html" ni Claude alohida demo deb qabul qilib, loyiha kod'iga integratsiya qilmagan.**
- Demo.html (8000 qator) — bu tugal dizayn referens (Gipertoniya I10, 7 tab, SCORE2 kalkulyator, FHIR preview, body-map). Lekin u `src/app/components/` ichida React komponent sifatida tarkibiy qismlarga bo'linmagan.

**3. "Tahlil natijalari" oynasidan `Kasallik kartasi`ga o'tish deep-link uzilgan.**
- Matcher ishlaydi, lekin bosilganda ochiladigan ekran (`DiseaseCard.tsx`) yozilmagan.
- Natija — sizning asosiy user story'ingiz end-to-end ishlamaydi.

**4. "Simptomlarni bor/yo'q/aniq emas bilan belgilash" talabi hech bir joyda UI sifatida ochiq yozilmagan.**
- Backend'da `SymptomMatchSession` model bor, lekin sizning asl talabingiz bu - *"bemor kasallik kartasini o'qib borayotgan payti o'zining simptomlarini belgilasin"* — **interaktiv checkbox tree** kerak.

**5. Moderatsiya "re-approval on edit" (qo'shimchalar ham qayta tasdiqlanishi) talab edi, lekin backend'da `on update → reset status to REVIEW` mantig'i yo'q.**

### 3.2. Ikkilamchi muammolar

- **Ko'p joyda dublikat**: `MedSmart-Pro_Kasalliklar_Moduli_TZ.md` (1003 qator) va `docs/analysis/feature-analysis.md` (45 qator) + `docs/09-modules/disease-kb-module.md` (80 qator) — uchtasi bir-birini qisman takrorlaydi. **Canonical hujjat qaysi ekanligi aniq emas.**
- **Mock ma'lumot va real API aralashgan**: `clinicalKB.ts` (8 kasallik mock) va `/api/v1/diseases` (real backend) ikkalasi bir vaqtda ishlatilgan — fallback strategiya yozilmagan.
- **Multi-audience UI toggle yo'q**: `AudienceMode` backend'da bor, frontend'da `<AudienceSelector>` komponent yo'q.
- **demo.html ichidagi SCORE2 kalkulyator, body-map, FHIR preview — bular sohaga oid ajoyib ideyalar, lekin qaysi komponent bo'lishini aniq belgilanmagan.**

---

## 4. STRATEGIK TAVSIYA: Saqlash / Qayta ishlash / O'chirish

### ✅ SAQLASH (65% — kuchli asos)

1. Prisma schema (Disease, Symptom, DiseaseBlock, Reference, SymptomMatchSession, …) — **yaxshi modellashtirilgan, tegmang**.
2. Backend `server/src/diseases/` CRUD + FTS + pgvector — **asos sifatida kengaytiring**.
3. `DiagnosisResults.tsx` matcher logikasi — **ishlayapti, saqlang**.
4. demo.html Gipertoniya — **dizayn referens** sifatida saqlang, `design/references/disease-card-gipertoniya.html` ga ko'chiring.
5. MedSmart-Pro_Kasalliklar_Moduli_TZ.md — **canonical biznes TT** sifatida saqlang, lekin **yangi Module Spec bilan solishtirib belgilang** (versiya 1.0 → 2.0 muhr).

### ♻️ QAYTA ISHLASH (25% — birlashtiring)

1. `docs/analysis/feature-analysis.md` + `implementation-plan.md` + `docs/09-modules/disease-kb-module.md` → bitta **canonical module spec** ga birlashtiring: `docs/09-modules/disease-kb-module.md` (yangi, tartiblangan).
2. `clinicalKB.ts` (8 kasallik mock) → `/api/v1/diseases` backend'dan keluvchi real ma'lumotga **feature flag bilan** almashtiring; mock faqat test uchun qoladi.
3. `WebRefKBDiseasesScreen.tsx` — admin browser — **editor UI** (WYSIWYG + marker fields + moderation status) bilan to'ldiring.

### 🗑 O'CHIRISH (10% — dublikat / noto'g'ri kontekst)

1. `docs/New modul/` papka (agar shunda yangi TZ duplicate bo'lsa — tekshiring, keraksizini o'chiring).
2. `~$dSmart-Pro_PRD_Migratsiya.docx` (Word lock file) — **o'chiring**.
3. `MedSmart-Pro_Kasalliklar_Moduli_TZ.docx` va `.md` **bitta source of truth** bo'lsin — docx'ni **.md dan auto-generate** qiling.
4. `Delop_qilingani.7z`, `.zip` — eski arxivlar, agar kerak bo'lmasa o'chiring.

> **⚠️ MUHIM**: Hech narsani o'chirishdan oldin `git status`, `git log` tekshiring va alohida commit qiling.

---

## 5. 🎯 CORRECTION PROMPT (qayta ishlatiladigan, Claude/AI uchun)

Quyidagi promptni **keyingi safar** yangi chat'da ishlating — Claude darhol sizning niyatingizni tushunadi. Kopirovka qiling:

```
═══════════════════════════════════════════════════════════════════
MedSmart-Pro · Disease KB Module — Implementation Task
═══════════════════════════════════════════════════════════════════

ROL: Siz 20+ yillik senior full-stack muhandis, biznes analitik,
tizim analitigi va UX/UI dizaynerisiz. Men siz bilan tibbiy
platforma (MedSmart-Pro) ustida ishlayman.

STACK (qat'iy, o'zgartirmang):
- Frontend: React 18 + Vite 6 + TypeScript strict + React Router 7
  + Tailwind 4 + shadcn/ui + Context API (Redux YO'Q)
- Backend: NestJS 10 + Prisma 5 + PostgreSQL (Supabase) + JWT
  + BullMQ + Socket.io + Swagger
- Monorepo: pnpm
- Feature flag: APP_FEATURE_DISEASE_KB (default=false in prod)

MAVJUD ASOS (tegmang, ustiga quring):
- /server/src/diseases/ — Prisma Disease+15 model, CRUD, FTS,
  pgvector embedding, moderation status
- /src/app/components/screens/patient/DiagnosisResults.tsx —
  simptom matcher (mock KB bilan)
- /src/app/data/clinicalKB.ts — mock 8 kasallik
- /docs/analysis/ — feature-analysis, implementation-plan,
  tz-disease-kb-gaps, CORRECTION-PROMPT-va-GAP-ANALIZ
- /MedSmart-Pro_Kasalliklar_Moduli_TZ.md — canonical biznes TZ
  (1003 qator, 26 bo'lim, Bexterev misoli bilan)
- /uploads/demo.html — dizayn referens (Gipertoniya I10,
  8000 qator, 7 tab, SCORE2, FHIR)

VAZIFA (faqat shu, boshqa hech nima qilmang):

1. End-to-end user story'ni yakunlash:
   Bemor → Ariza → "AI Tavsiya — shikoyatim bor" → simptom kirit
   → Tahlil natijalari (ehtimoliy kasalliklar % bilan) →
   KASALLIK NOMI/KODI (MKB-10) GA BOSGANDA → Kasallik Kartasi
   oynasi ochiladi → 40+ blokli ma'lumot → bemor o'z
   simptomlarini "bor/yo'q/aniq emas" toggle bilan belgilaydi →
   "Shifokorga yuborish" → FHIR QuestionnaireResponse export →
   Shifokor IncomingCasePanel'da ko'radi.

2. Yangi React komponentlar (faqat shularni yarating):
   (a) src/app/components/screens/patient/DiseaseCard.tsx
       - 7 tab: Umumiy · Belgilar · Diagnostika · Davolash ·
         Bosqichlar · Prognoz · FAQ
       - Audience toggle (Bemor/Talaba/Hamshira/Shifokor/Mutaxassis)
       - Tab ichida markerli bloklar, manba referenslari bilan
       - Demo.html dizayn referens sifatida ishlatiladi
   (b) src/app/components/screens/patient/SymptomMatcherSheet.tsx
       - Bottom-sheet yoki side-panel
       - Har simptom uchun 3-holatli toggle: Bor / Yo'q / Aniq emas
       - Real-time match score update (backend /diseases/:id/match)
   (c) src/app/components/screens/patient/SendToDoctor.tsx
       - Doctor picker + confirmation
       - FHIR QuestionnaireResponse JSON generate + POST to
         /api/v1/symptom-sessions
   (d) src/app/components/screens/doctor/IncomingCasePanel.tsx
       - Kelgan sessiyalar ro'yxati
       - Click → bemor simptomlari + AI DDx + kasallik kartasi
         deep-link
   (e) src/app/components/screens/web/WebKBDiseaseEditor.tsx
       - WYSIWYG markdown editor
       - Marker dropdown (etiology, pathogenesis, …)
       - Evidence level A/B/C dropdown
       - Source citation multiselect
       - Draft → Review → Publish workflow
   (f) src/app/components/screens/web/WebKBModerationQueue.tsx
       - Review status filter
       - Diff viewer (before/after)
       - Approve / Reject / Request changes

3. Yangi backend endpointlar:
   - POST /api/v1/symptom-sessions (create from matcher)
   - GET  /api/v1/symptom-sessions?doctorId=... (incoming)
   - PATCH /api/v1/diseases/:id/blocks/:marker (edit block)
   - POST  /api/v1/diseases/:id/blocks/:marker/submit-for-review
   - POST  /api/v1/diseases/:id/blocks/:marker/approve
   - POST  /api/v1/diseases/:id/blocks/:marker/reject

4. Qoidalar (NON-NEGOTIABLE):
   - Har PR alohida, atomic, 300 qatordan kam
   - Har service metod uchun unit test (Jest), ≥ 70% coverage
   - Kritik yo'l (AI Tavsiya → Kasallik Kartasi → SendToDoctor)
     uchun e2e test (Playwright)
   - TypeScript strict, any TAQIQLANGAN
   - Prisma migration — alohida commit, alohida fayl
   - Commit format: feat(disease-kb): <message>
   - Har blok edit bo'lsa, status avtomatik REVIEW ga qaytadi
   - Prod'da feature flag OFF, demo'da ON
   - PHI (shaxsiy tibbiy ma'lumot) prod Supabase'da SAQLANMAYDI

5. Deliverable ketma-ketligi:
   (1) TodoWrite bilan atomic PR ro'yxatini yarating
   (2) Har PR uchun alohida commit
   (3) Har bosqichda screenshot/UI demo ko'rsating
   (4) Oxirida e2e test script va migration guide

ME'YOR:
- Bir marta bitta PR — parallel ishlamang
- Har PR oxirida test qiling, screenshots oling
- Agar biror qadamda noaniqlik bo'lsa — AskUserQuestion bilan
  menga 4ta aniq variant taklif qiling
- Hujjat yozish o'rniga KOD yozing; 95% kod, 5% qisqa hujjat
═══════════════════════════════════════════════════════════════════
```

---

## 6. CHUQUR TAHLIL REJASI (qadamma-qadam)

Quyidagi reja bo'yicha siz yoki keyingi AI sessiyasi **18 ish kunida** Disease KB modulini ishchi holatga olib chiqishi mumkin.

### 🧭 Faza 0 · Audit va Konsolidatsiya (2 kun)

| Kun | Vazifa | Deliverable |
|---|---|---|
| 1 | `docs/` va `server/` va `src/` ichida barcha disease-kb'ga tegishli fayllarni inventorizatsiya qilish | `docs/analysis/disease-kb-inventory.md` |
| 1 | 3 ta dublikatli hujjatni (feature-analysis, implementation-plan, disease-kb-module.md) bitta canonical'ga birlashtirish | Yangilangan `docs/09-modules/disease-kb-module.md` |
| 2 | `MedSmart-Pro_Kasalliklar_Moduli_TZ.md` ni v2.0 ga yangilash — GAP-ANALIZ natijalarini qo'shish | TZ v2.0 |
| 2 | demo.html ni `design/references/disease-card-gipertoniya-demo.html` ga ko'chirish va README qo'shish | Tozalangan struktura |

### 🧪 Faza 1 · Backend yakunlash (3 kun)

| Kun | Vazifa | Deliverable |
|---|---|---|
| 3 | `POST /api/v1/symptom-sessions` endpoint — matcher'dan kelgan natijani saqlash (draft/submitted) | Controller + service + DTO + test |
| 3 | `GET /api/v1/symptom-sessions` endpoint — shifokor uchun incoming list | Controller + test |
| 4 | Block-level CRUD: `PATCH /diseases/:id/blocks/:marker` + avtomatik REVIEW status | Service + test |
| 4 | Moderation endpoints: submit-for-review, approve, reject (ROLE guard) | Controller + test |
| 5 | 50 kasallik × L1 seed skripti (`pnpm db:seed:diseases`) | Prisma seed + fixtures |

### 🎨 Faza 2 · Frontend asosiy ekranlar (7 kun)

| Kun | Ekran | Asosiy vazifa |
|---|---|---|
| 6 | `DiseaseCard.tsx` — karta layout, 7 tab, audience toggle | `design/references/demo.html` dan tokens va blok struktura |
| 7 | `DiseaseCard.tsx` — kontent bloklar, marker loop, manbalar | `DiseaseBlock[]` render, `Reference[]` tooltip |
| 8 | `SymptomMatcherSheet.tsx` — 3-holatli toggle, match score | `PATCH /sessions/:id` live update |
| 9 | `SendToDoctor.tsx` — doctor picker, FHIR export, POST | `fhir-r4` export logic |
| 10 | `DiagnosisResults.tsx` da deep-link tuzatish | `onClick={() => nav('/disease/' + slug)}` |
| 11 | `IncomingCasePanel.tsx` (shifokor) — list + detail | `/symptom-sessions?doctorId` consume |
| 12 | Router + NavigationContext — `/disease/:slug`, `/cases` qo'shish | `src/app/router.tsx` |

### 🛠 Faza 3 · CMS va Moderatsiya (4 kun)

| Kun | Ekran | Vazifa |
|---|---|---|
| 13 | `WebKBDiseaseEditor.tsx` — markdown editor + marker picker | shadcn `<Tabs>`, `<Textarea>`, custom markdown preview |
| 14 | `WebKBDiseaseEditor.tsx` — citation picker, evidence level, publish | `PubMed` autocomplete, `Reference` model |
| 15 | `WebKBModerationQueue.tsx` — queue filter, diff viewer | `react-diff-viewer-continued` |
| 16 | `WebKBModerationQueue.tsx` — approve/reject actions + notifications | Toast + email |

### ✅ Faza 4 · Test, Seed, Polish (2 kun)

| Kun | Vazifa |
|---|---|
| 17 | 50 kasallik × L1 kontent tuzilishi (medical editor bilan) · Playwright e2e |
| 18 | Performance (LCP ≤ 2.5s), a11y (WCAG 2.1 AA), feature flag test, doc polish, release PR |

### 🗓 Total: 18 ish kuni (~3.5 hafta, 1 full-stack + 1 medical editor)

---

## 7. RISK REGISTER (yangi aniqlangan)

| # | Risk | Ehtimol | Ta'sir | Mitigation |
|---|---|---|---|---|
| R1 | Medical content sifati | O'rta | Katta (klinik xato) | Professional medical editor, evidence level A/B/C, external audit |
| R2 | FHIR export standartga mos kelmaslik | O'rta | O'rta | HL7 Validator + snapshot test |
| R3 | Audience toggle — kontent oshiq/kam ko'rinishi | O'rta | O'rta | Style guide + visual regression test |
| R4 | CMS editor UX murakkabligi | Yuqori | O'rta | Prototipni medical editor bilan sinovdan o'tkazish |
| R5 | pgvector embedding narxi (OpenAI API) | Past | Past | Batch embedding, local model alternativasi |
| R6 | Tarjima (uz/ru/en) sifati | Yuqori | O'rta | MVP da faqat uz to'liq, ru/en L1 only |
| R7 | Kasallik/simptom taxonomiya konfliktlari (ICD-10 vs SNOMED) | O'rta | Yuqori | ICD-10 primary, SNOMED sekundar mapping |
| R8 | Demo.html ichidagi SCORE2 kalkulyatorni alohida komponentga ajratish | Past | Past | `src/app/components/medical/score2-calculator.tsx` alohida task |

---

## 8. YAKUNIY XULOSA

1. **Sizning ideya to'g'ri va aniq** — uni tushunish uchun 4 ta parchalangan hujjat kerak emas, bitta aniq spec yetarli.
2. **Loyiha 40% tayyor** — asosan backend va data model. Frontend'da 4 ta asosiy ekran (DiseaseCard, SymptomMatcher, SendToDoctor, IncomingCasePanel) **umuman yo'q**.
3. **Yo'l aniq**: 18 ish kunida (3.5 hafta) MVP'ni yakunlash mumkin.
4. **Keyingi qadam**: § 5 dagi *Correction Prompt*ni yangi Claude chat'ga berish va § 6 dagi fazalarni TodoWrite bilan boshqarish.
5. **Canonical hujjat**: `docs/09-modules/disease-kb-module-v2.md` (keyingi deliverable — TT v2) yagona source of truth bo'lsin; qolgan analysis fayllar arxivlansin.

---

**Keyingi hujjat**: `docs/09-modules/TT-DISEASE-KB-MODULE-v2.md` — to'liq Texnik Topshiriq (BRD + SRS + UX + Data Model + API + Acceptance + Roadmap).

**Muallif**: Claude (senior PM + FS eng + BA/SA/UX ekspert rollarida) · `2026-04-20`
