# Feature Analysis — Kasalliklar Ensiklopediyasi va Diagnoz Bazasi Moduli

**Loyiha**: MedSmart-Pro (<https://medsmart-pro.vercel.app/>)
**Modul**: Disease Knowledge Base / Kasalliklar Ma'lumotnomasi
**Hujjat turi**: Feature analysis (pre-planning, pre-code)
**Sana**: 2026-04-17
**Manba TZ**: [`MedSmart-Pro_Kasalliklar_Moduli_TZ.md`](../../MedSmart-Pro_Kasalliklar_Moduli_TZ.md) + [`docs/New modul/`](../New%20modul/) (15+ hujjat) + [`demo.html`](../../../../../D:/Loyihalar%202026%20yil/Demo/Demo%20oyna%20kassalik%20diagnozlar%20bazasi/demo.html)
**Status**: **Qarorlar qabul qilindi (2026-04-17)** — §1a ga qarang. Implementatsiya rejasi: [`implementation-plan.md`](./implementation-plan.md).

> Bu hujjat **kod yozishdan oldingi** tahlildir. Maqsad — qamrov (scope), ta'sir zonasi, noaniqliklar va risklarni aniqlash.

---

## 1a. Qabul qilingan qarorlar (2026-04-17)

Foydalanuvchi tomonidan tasdiqlangan — bular canonical va pastda hujjatning qolgan qismi shu qarorlarga asoslanadi.

| # | Mavzu | Qaror |
|---|---|---|
| **D1** | **Stack** | **Mavjud stack saqlanadi**: React 19 + Vite 6 + React Router v7 + Tailwind 4 + shadcn/ui (frontend); NestJS 10 + Prisma 5 + PostgreSQL (Supabase) + Supabase Storage + BullMQ + Socket.io (backend). TZ ning Next.js/FastAPI/Pinecone takliflari **e'tiborsiz qoldiriladi**. `docs/New modul/` hujjatlari ham shu stack'ga moslashtiriladi. |
| **D2** | **SSR / SEO** | MVP — **Vite SPA** (SSR yo'q). Public disease sahifalari uchun SEO — client-side meta + `react-helmet-async`; schema.org `MedicalCondition` JSON-LD injection. Prerender (vite-plugin-prerender) — MVP dan keyin ko'rib chiqiladi. |
| **D3** | **Search** | **Postgres FTS** (`pg_trgm` + `tsvector` uz/ru) — MVP. Yangi infra (OpenSearch/Typesense/Pinecone) **qo'shilmaydi**. Semantik qidiruv — Faza 3 da pgvector + Claude embeddings. |
| **D4** | **AI / RAG** | Hozirgi **client-side `runDiagnosis()` matcher** MVP uchun saqlanadi. Server-side matcher endpoint (`/api/v1/triage/match`) alohida — shifokorga yuborishda autoritativ. Claude API + pgvector — Faza 3. |
| **D5** | **Hosting / Data residency** | Hozirgi MVP/test/demo — Supabase (EU) **PHI'siz demo data** bilan. **Prod PHI** — mahalliy (O'zbekiston) hosting'ga o'tkaziladi (alohida infra task). Kod bu migratsiyaga tayyor bo'lsin: env-driven DATABASE_URL, Prisma-agnostic, storage abstraction. |
| **D6** | **Dori doza siyosati** | **O'zbekiston qonunchiligiga muvofiq**. Ruxsat etilgan joylarda doza ko'rsatiladi, majburiy disclaimer bilan ("shifokor nazoratisiz qabul qilmang", "bu retsept emas"). Bemor rejimida — default yashirilgan, "Batafsil ko'rish" tugmasi bilan ochiladi. Shifokor rejimida — ochiq. |
| **D7** | **i18n** | `react-i18next` kutubxonasi; MVP — faqat **uz**; Faza 2 — ru qo'shiladi; Faza 3 — en. URL prefiks (`/uz/…`) Faza 2'dan boshlab. |
| **D8** | **Moderation** | **Ikki-bosqichli**: `EDITOR` draft yozadi → `MEDICAL_EDITOR` (tizim eksperti) texnik+klinik review → approved. Keyin `ADMIN` `published` qiladi. MVP'da ikki bosqichni yagona `MEDICAL_EDITOR` imzosiga soddalashtirish mumkin; clinical board audit (6 oylik) Faza 3. |
| **D9** | **Rollar** | `UserRole` enum'iga `STUDENT`, `NURSE`, `EDITOR`, `MEDICAL_EDITOR` qo'shiladi. Fine-grained permission alohida `Permission` jadvali — Faza 2 (MVP'da `@Roles()` guard yetarli). |
| **D10** | **FHIR** | MVP — **FHIR-style JSON** (naming convention FHIR R4 ga mos: `Condition`, `QuestionnaireResponse`), lekin to'liq compliant emas. Faza 3 — to'liq FHIR validator. |
| **D11** | **Marker templating engine** | Client-side lightweight parser (`mustache.js` yoki custom 50-qatorli parser). Server raw markdown + metadata qaytaradi. |
| **D12** | **Katalog konvensiyasi** | `Muhim qoidalar` dagi `/src/modules/` va `/src/infra/` — **mavjud kod bilan mos kelmaydi**. Qaror — **mavjud struktura saqlanadi** (`src/app/`, `server/src/`). `CLAUDE.md` (yaratiladi) bu realligi aks ettiradi. |

**Blockerlardan ikkitasi yopildi, D5 (data residency) — bizness/infra task (MVP kodini bloklamaydi).**

---

## 1. Qisqacha xulosa (TL;DR)

- **Qamrov**: Bemor/talaba/hamshira/shifokor/mutaxassis uchun ICD-10 asosidagi **universal kasallik kartasi** (≈40 kanonik blok + 20+ kengaytirilgan blok), **marker-template tizimi** (`{{marker}}`), **moderatsiya pipeline'i** (draft → review → approved → published), **AI Tavsiya bilan chambarchas bog'lanish** (symptom-matching, FHIR QuestionnaireResponse), **shifokor paneliga yuborish**, **bemor-shifokor chati** va **manba/evidence** tizimi.
- **Mavjud asos**: Frontendda klinik KB **skeleton mavjud** — `KBDisease`, `KBSymptom`, `KBApprovalStatus`, `EvidenceLevel` tiplari, `src/app/data/clinicalKB.ts` (static mock), `WebRefKBDiseasesScreen.tsx` (admin screen), `DiagnosisResults.tsx` (client-side matcher). **Hammasi client-only, localStorage.** Backend tomonda **HECH NARSA** yo'q.
- **Asosiy ish**: Backend — bo'sh maydon (Prisma, REST API, moderatsiya workflow, search, file-links). Frontend — mavjud mock'ni backend'ga ulash + yangi bloklar (40+ section viewer, symptom matcher sheet, FHIR export, chat integratsiyasi).
- **Asosiy riskar**: (1) klinik aniqlik va yuridik javobgarlik, (2) kontent hajmi (1000+ kasallik × 40 blok × 3 til), (3) AI match noto'g'ri yo'naltirish, (4) i18n infratuzilma yo'q, (5) real-time chat faqat 70%.
- **Tavsiya**: MVP'ni **50 kasallik × L1 × 1 til (uz)** bilan cheklash, AI Tavsiya → Card deep-link + symptom matcher + "shifokorga yuborish" yo'lini end-to-end ishga tushirish. L2/L3, ko'p tillilik va mobil offline — Faza 3.

---

## 2. TZ tahlili — kirish ma'lumotlari

### 2.1. Asosiy manbalar

| Manba | Joylashuv | Asosiy rol |
|---|---|---|
| TZ v1.0 | [`MedSmart-Pro_Kasalliklar_Moduli_TZ.md`](../../MedSmart-Pro_Kasalliklar_Moduli_TZ.md) | 26 bo'lim, funksional + nofunksional + data model + API + roadmap |
| demo.html | D:\...\demo.html (364KB) | UI referens (kod bazasida emas) |
| New modul hujjatlari | [`docs/New modul/`](../New%20modul/) (15+ fayl) | Vision, BRD, SRS, Clinical KB, Architecture — TZ bilan **qisman ziddiyatli** (Next.js vs React/Vite, FastAPI vs NestJS) |
| Mavjud PRD | `MedSmart-Pro_PRD_Migratsiya.docx` | Repo root'da, migratsiya konteksti |

### 2.2. Ziddiyatlar — RESOLVED (D1 qaroriga ko'ra)

Barcha hujjatlar o'rtasidagi framework/infra ziddiyatlari D1 qarorida yopildi — **mavjud stack** canonical. Aynan bu hujjat bo'yicha ishlaganda:

| Mavzu | Canonical (biz amalga oshiramiz) | TZ / New modul da boshqacha yozilgan bo'lsa |
|---|---|---|
| Frontend | **React 19 + Vite 6 + React Router v7 + Tailwind 4 + shadcn/ui** | TZ §14.6 / New modul §22: Next.js 14 SSR/ISR → **e'tiborsiz** |
| Backend | **NestJS 10 + Prisma 5 + PostgreSQL (Supabase)** | New modul §22: Python FastAPI AI service alohida → **e'tiborsiz**, AI chaqiruvlari NestJS service ichidan |
| Vector DB | **Hech qanday** (MVP). Kelajakda — `pgvector` (Postgres extension) | TZ §11.4 / New modul §22: Pinecone/OpenSearch → **e'tiborsiz** |
| Storage | **Supabase Storage** (mavjud bucket'lar + yangi `DISEASE_MEDIA`) | TZ §11.4: S3-compatible → Supabase ham S3-compatible, bir xil |
| Auth | **Mavjud JWT (7 kun) + refresh** | TZ §12.2: access 15 min → MVP'da mavjud saqlanadi, MFA Faza 2 |
| i18n | **`react-i18next`**, MVP faqat `uz`, keyin `ru`, `en` | TZ §18 / §NFR: uz/ru/en majburiy → bosqichma-bosqich (D7) |
| SEO | **SPA + `react-helmet-async` + JSON-LD** | TZ §14.6: SSR/ISR Next.js → **SPA bilan amal qilamiz**, kerak bo'lsa vite-plugin-prerender |

---

## 3. Funksional talablar (FR)

TZ dan olingan. Har bir FR'ga **prioritet** (P0=MVP, P1=Faza2, P2=Faza3), **asosiy aktor**, **bog'liqlik** qo'yilgan.

### 3.1. Kontent va ma'lumot modeli

| ID | Talab | Aktor | Prioritet | Bog'liqlik |
|---|---|---|---|---|
| FR-C-01 | Har bir kasallik uchun **universal karta** (ICD-10 panel + 38 kanonik blok + kengaytiruvchi bloklar) mavjud bo'lsin. | Sistema | P0 | — |
| FR-C-02 | Bloklar **moddular (pluggable)**: har bir blok ixtiyoriy, lekin tartib qat'iy. | Sistema | P0 | FR-C-01 |
| FR-C-03 | Har bir blok **chuqurlik darajasi** (L1/L2/L3) bilan belgilanadi. | Sistema | P0 | FR-C-01 |
| FR-C-04 | Blok sarlavhasi uchun **2–3 sinonim variant** (TZ §9 matritsa) mavjud; semantik `marker` id o'zgarmaydi. | Editor | P0 | FR-C-01 |
| FR-C-05 | Kontent **`{{marker}}` templating** tizimi, modifikatorlar: `format`, `fallback`, `audience`, `locale`, `visibility`. | Sistema | P1 | FR-C-04 |
| FR-C-06 | Har bir kasallik uchun **tillar**: uz (majburiy), ru, en; latin nom — ixtiyoriy. | Content | P1 | i18n infra |
| FR-C-07 | **Sinonimlar** (eski nomlar, xalq tilida) saqlanadi, qidiruv va AI match uchun. | Sistema | P0 | FR-S-01 |
| FR-C-08 | Har bir blok **`last_updated`**, `editor_id`, `evidence_level` (A/B/C/D) bilan belgilanadi. | Sistema | P0 | Audit |
| FR-C-09 | Har bir da'vo uchun **manba** (DOI/PubMed/WHO URL/klinik protokol) bog'lanadi (FR-E-01 bilan). | Editor | P0 | FR-E-* |
| FR-C-10 | Kasallikning **simptomlari** `weight` (0..1), `specificity`, `sensitivity` bilan saqlanadi. | Sistema | P0 | FR-M-* |
| FR-C-11 | **Bosqichlar** (Dastlabki / Kengaytirilgan / Kechki) alohida entitet, har biri uchun belgilar+rasm+maslahat. | Sistema | P1 | — |
| FR-C-12 | **Klinik holatlar** (case reports) — alohida entitet (yosh, jins, anamnez, tashxis, davolash, natija). | Sistema | P2 | — |
| FR-C-13 | **Dori-darmon** jadvali (INN, brend, doza, shakl, kontr-indikatsiya, o'zaro ta'sir, manba). | Sistema | P2 | LOINC/RxNorm integratsiyasi |
| FR-C-14 | **Tahlillar** (LOINC kodi bilan) priority/window/fasting bilan. | Sistema | P1 | — |
| FR-C-15 | **Epidemiologiya** (jahon, mintaqa, O'zbekiston statistikasi) blokli. | Content | P2 | — |
| FR-C-16 | **Genetika** (HLA-B27 va h.k.), **qon guruhi notes**, **homiladorlik/pediatriya/geriatriya** notes — ixtiyoriy bloklar. | Content | P2 | — |
| FR-C-17 | **Emergency flag** — ma'lum kasalliklar (MI, insult, anafilaksiya) uchun avtomatik "103 ga qo'ng'iroq" banner. | Sistema | P0 | — |
| FR-C-18 | **Medical disclaimer** har bir kartada ko'rinuvchi. | Sistema | P0 | — |

### 3.2. Qidiruv va navigatsiya

| ID | Talab | Aktor | Prioritet | Bog'liqlik |
|---|---|---|---|---|
| FR-S-01 | `/diseases` — nom, ICD-10, sinonim, rus/ingliz/o'zbek bo'yicha qidiruv. | Foydalanuvchi | P0 | Postgres FTS (pg_trgm + tsvector) |
| FR-S-02 | URL: `/diseases/{slug}`, alternativ `/icd/{code}`, deep-link `?anchor=icd|symptoms|…`. | Sistema | P0 | React Router routes |
| FR-S-03 | **Semantik qidiruv** — embedding-based (pgvector/OpenSearch) — talaba/shifokor uchun "fraza bo'yicha". | Foydalanuvchi | P2 | Vector DB (hozir yo'q) |
| FR-S-04 | Boshqa modullardan **"pill/chip"** ko'rinishida havola → modal preview (to'liq sahifaga o'tmasdan). | Sistema | P1 | Cross-module embed komponenti |
| FR-S-05 | Filterlar: bo'lim (nevrologik/kardiologik/…), bosqich, auditoriya rejimi, til. | Foydalanuvchi | P1 | — |

### 3.3. AI Tavsiya integratsiyasi

| ID | Talab | Aktor | Prioritet | Bog'liqlik |
|---|---|---|---|---|
| FR-A-01 | AI Tavsiya natijasida kasallik nomi/ICD-10'ga bosilganda **karta oynasi** ochiladi (tab/modal + deep-link). | Bemor | P0 | FR-S-02, mavjud `DiagnosisResults.tsx` |
| FR-A-02 | Kartaning yuqorisida **symptom-match banner**: "Siz kiritgan N ta simptomdan M tasi mos keladi". | Bemor | P0 | FR-M-01 |
| FR-A-03 | Card'da "**Meni tekshirib ko'ring**" CTA → bottom sheet / side drawer `SymptomMatcher`. | Bemor | P0 | — |
| FR-A-04 | Simptom taqqoslashda har bir belgi uchun 4 tanlov chip: **Ha bor / Yo'q / Bilmayman / Ba'zan**, rang kodi (yashil/kulrang/sariq/havorang). | Bemor | P0 | — |
| FR-A-05 | Real-time **match score** (N/M = X%) pastda ko'rinadi, har javobdan keyin yangilanadi. | Bemor | P0 | — |
| FR-A-06 | CTA lar: `Saqlash (profilga)`, `PDF olish`, `Shifokorga yuborish`, `Navbat olish`, `Boshqa kasallik bilan solishtir`. | Bemor | P0 | FHIR export |
| FR-A-07 | Shifokorga yuborish — **FHIR R4 `QuestionnaireResponse`** strukturasi bilan, shifokor panelida tasdiqlangan / rad etilgan / noaniq bo'yicha guruhlangan. | Bemor → Shifokor | P0 | — |
| FR-A-08 | Shifokor qarori (tasdiq/rad) **learning loop** uchun labelled signal sifatida log qilinadi. | Shifokor | P2 | ML infra |
| FR-A-09 | Modal yopilganda natijalar **draft** sifatida 7 kun saqlanadi. | Bemor | P1 | — |

### 3.4. Auditoriya rejimi (view mode)

| ID | Talab | Aktor | Prioritet |
|---|---|---|---|
| FR-V-01 | Auditoriya switcher: **Bemor / Talaba/Hamshira / Shifokor/Mutaxassis / Aralash** (default). | Barcha | P0 |
| FR-V-02 | Rejim blokni **yashirmaydi**, faqat **priority/positionini** o'zgartiradi va tilni sozlaydi. | Sistema | P0 |
| FR-V-03 | "Cheat-sheet" (tez ko'rib chiqish) rejimi — talaba uchun. | Talaba | P2 |
| FR-V-04 | Hamshira rejimida NANDA parvarish diagnozi va in'ektsiya qoidalari bloklari yuqoriga suriladi. | Hamshira | P2 |

### 3.5. Editorial / Moderatsiya pipeline

| ID | Talab | Aktor | Prioritet | Bog'liqlik |
|---|---|---|---|---|
| FR-E-01 | CMS (admin panel) — chap panel marker tree, o'ng panel WYSIWYG+Markdown, yuqorida to'liqlik indikatori (L1/L2/L3). | Editor | P0 | `WebRefKBDiseasesScreen.tsx` kengaytirilsin |
| FR-E-02 | Status workflow: **draft → review → approved → published** + `rejected` (komment bilan qaytarish). | Editor/Medical editor | P0 | BullMQ jobs reuse |
| FR-E-03 | Tasdiqlash — **tizim eksperti** (professor/akademik/bosh mutaxassis) tomonidan, imzo + log. | Medical editor | P0 | Role = `MEDICAL_EDITOR` |
| FR-E-04 | Tasdiqlangan kasallikni **boshqa mutaxassislarga yuborish** — ular qo'shimcha kiritadi — yana sistema eksperti tasdiqlaydi. | Content/Editor | P0 | FR-E-02 |
| FR-E-05 | **Audit log**: kim, qachon, qaysi maydonda, qanday o'zgartirgan (diff). | Sistema | P0 | `AuditEvent` model mavjud |
| FR-E-06 | **Manba bazasi**: DOI/PubMed/WHO/UpToDate/Mayo — alohida `Reference` entitet, har qancha bloklarga bog'lanadi. | Editor | P0 | — |
| FR-E-07 | **Evidence grade**: A/B/C/D (GRADE-based) har bir da'voga qo'shiladi. | Editor | P0 | — |
| FR-E-08 | **Bootstrap**: WHO ICD-10 CSV'dan 1000+ `Disease` skeleton seed qilinadi. | Data eng. | P1 | Seed script |
| FR-E-09 | **Lifecycle**: har 12 oyda qayta ko'rib chiqish majburiy; protokol yangilanganda push notification. | Editor | P2 | Cron job |

### 3.6. Rol va ruxsatlar (RBAC)

TZ ga ko'ra yangi rollar kerak: `patient`, `student`, `nurse`, `doctor`, `specialist`, `editor`, `medical_editor`, `admin`.
Mavjud `UserRole` enum (Prisma): `PATIENT, RADIOLOG, DOCTOR, SPECIALIST, OPERATOR, ADMIN, KASSIR`.

| ID | Talab | Prioritet |
|---|---|---|
| FR-R-01 | `UserRole` enum'iga **yangi qiymatlar**: `STUDENT`, `NURSE`, `EDITOR`, `MEDICAL_EDITOR` qo'shilsin. | P0 |
| FR-R-02 | Fine-grained permission: `kb.draft.create`, `kb.review.submit`, `kb.approve`, `kb.publish`. | P0 |
| FR-R-03 | Admin uchun **MFA majburiy**; editor/medical_editor uchun MFA **tavsiya etiladi**. | P1 |
| FR-R-04 | Mutaxassis `specializes_in_diseases[]` (kasalliklarni bog'lash) imkoniyati — doctor profilining qismi. | P1 |

### 3.7. Bemor-Shifokor muloqoti va anonimlik

| ID | Talab | Prioritet | Bog'liqlik |
|---|---|---|---|
| FR-CH-01 | Bemor card'da **"Shifokor bilan maslahat"** CTA — chat oynasi ochadi (real-time). | P1 | Mavjud `messages` + Socket.io |
| FR-CH-02 | Telefon orqali aloqa — agar bemor ruxsat bergan bo'lsa (shifokor/talaba tomonidan). | P2 | `MessagePermission` mavjud |
| FR-CH-03 | Bemor o'z ma'lumotlarini **ochiq yoki anonim (pseudonim)** qilishi mumkin. | P0 | `AnonymousNumber` mavjud |
| FR-CH-04 | Shifokor/mutaxassis/talaba dashboard'da bemorlar ro'yxati (yosh, jins, kasallik, anonim holat), filter va aloqaga chiqish. | P1 | — |
| FR-CH-05 | Typing indicator, read receipt, file attachment (rasm/PDF). | P2 | WebSocket events |

### 3.8. Shifokor paneli integratsiyasi

| ID | Talab | Prioritet |
|---|---|---|
| FR-D-01 | Shifokor panelida **yangi bemor so'rovi** (AI Tavsiya natijasi + symptom match) yetkaziladi. | P0 |
| FR-D-02 | Shifokor panelida: (1) AI xulosasi top-5 kasallik, (2) bemor tasdiqlagan/rad etgan/noaniq simptomlar, (3) kasallik kartasiga havola. | P0 |
| FR-D-03 | "Diagnostika algoritmi" va "Davolash sxemasi" bloklari shifokor rejimida yuqoriga suriladi. | P0 |
| FR-D-04 | Klinik protokol havolasi va tahlil minimum/kengaytirilgan to'plami. | P1 |

### 3.9. Export va reuse

| ID | Talab | Prioritet |
|---|---|---|
| FR-X-01 | Kartani **PDF** ga export qilish (bemor uchun). | P1 |
| FR-X-02 | Shifokorga yuborish — **FHIR R4** (`Condition`, `Observation`, `Questionnaire`, `QuestionnaireResponse`). | P0 |
| FR-X-03 | Boshqa modullar (EMR, chatbot, prescription) `diseases` API dan foydalanadi — **single source of truth**. | P1 |
| FR-X-04 | Bemor kartasini **profilga saqlash** va "Mening kasalliklarim" ro'yxati. | P1 |

### 3.10. Analitika va telemetriya

| ID | Event | Prioritet |
|---|---|---|
| FR-T-01 | `disease_card_opened` (slug, source, audience_mode) | P0 |
| FR-T-02 | `symptom_match_opened`, `symptom_answered`, `symptom_match_completed` | P0 |
| FR-T-03 | `send_to_doctor_clicked`, `pdf_export`, `feedback_content` (rating 1–5) | P1 |
| FR-T-04 | Klinik aniqlik dashboard (redaksion) — noto'g'ri matchlar, fikr-mulohazalar. | P2 |

---

## 4. Nofunksional talablar (NFR) — bizning stack asosida

D1–D12 qarorlari asosida realistik raqamlar. TZ ning Next.js SSR/HIPAA/FHIR gipotezalari bosqichma-bosqich yoki **realligi bilan almashtirildi**.

### 4.1. Performance (Vite SPA + Supabase Postgres asosida)

| ID | Talab | MVP mezon | Keyingi faza |
|---|---|---|---|
| NFR-P-01 | Disease list sahifasi yuklanish (3G/4G mobile, p95) | ≤ 3.0s (SPA, Vite chunk + lazy-load) | ≤ 1.8s (prerender + CDN edge cache) |
| NFR-P-02 | Disease card karta ochilish (navigate dan render) | ≤ 1.5s p95 | ≤ 1.2s p95 |
| NFR-P-03 | API p95 (`GET /diseases/:slug`) | ≤ 400ms (Supabase EU + Vercel edge) | ≤ 200ms (mahalliy DC) |
| NFR-P-04 | API p95 (`GET /diseases/search`) | ≤ 600ms | ≤ 300ms |
| NFR-P-05 | POST `/triage/match` | ≤ 800ms | ≤ 400ms |
| NFR-P-06 | Bundle size (JS gzipped, birinchi tashrif) | ≤ 350KB | ≤ 250KB |
| NFR-P-07 | LCP (Lighthouse, mobil Fast 3G) | ≤ 3.5s | ≤ 2.5s |
| NFR-P-08 | CLS | < 0.15 | < 0.1 |
| NFR-P-09 | TTI (Time to Interactive) | ≤ 4.5s | ≤ 3.0s |
| NFR-P-10 | Concurrent users (MVP sinovdan o'tkazish) | 200 concurrent (Supabase free-tier chegarasi) | 2000 (paid tier) |

**Strategiyalar**: (1) React Router v7 route-based code-splitting mavjud (`lazy-load 70+ screens` commit — 42de8e3), disease module ham lazy; (2) Supabase Postgres `pg_trgm` + partial indekslar; (3) Vercel edge cache statik kasallik kartalari uchun (cache-control: `s-maxage=3600, stale-while-revalidate=86400`); (4) API response — `gzip` + `brotli`.

### 4.2. SEO (SPA constraints bilan)

| ID | Talab | MVP | Keyingi |
|---|---|---|---|
| NFR-S-01 | Meta tags per kasallik (`title`, `description`, `og:*`) | `react-helmet-async` — har `/diseases/:slug` sahifa | — |
| NFR-S-02 | `schema.org/MedicalCondition` JSON-LD injection | Yes — structured data har kartada | — |
| NFR-S-03 | Sitemap.xml (barcha published kasalliklar) | Backend cron generator → `public/sitemap.xml` | — |
| NFR-S-04 | Canonical URL | `/diseases/:slug` canonical; `/icd/:code` — 301 redirect | — |
| NFR-S-05 | Prerender (public sahifalar) | **NO** MVP'da (SPA yetarli) | `vite-plugin-prerender` Faza 2 — 100+ eng ko'p qidiriladigan kasallik SSG |
| NFR-S-06 | hreflang uz/ru/en | MVP: faqat uz → hreflang kerak emas | Faza 2–3 |

### 4.3. Accessibility (WCAG 2.1 AA)

| ID | Talab | Mezon |
|---|---|---|
| NFR-A-01 | Lighthouse accessibility skor | ≥ 90 (MVP), ≥ 95 (Faza 2) |
| NFR-A-02 | axe-core (Playwright test) | 0 critical, 0 serious |
| NFR-A-03 | Kontrast | 4.5:1 minimum (text), 3:1 (UI) |
| NFR-A-04 | Keyboard navigation | Tab/Shift+Tab, Space/Enter, Escape modallar; focus visible |
| NFR-A-05 | ARIA roles | `tablist`/`tab`/`tabpanel` disease card tabs; `radiogroup` symptom matcher chiplar; `dialog` modal preview |
| NFR-A-06 | Screen reader | `aria-label` barcha icon buttons; landmark `<main>`, `<nav>`, `<aside>`; `aria-live` symptom match score |
| NFR-A-07 | `prefers-reduced-motion` | `framer-motion` `MotionConfig reducedMotion="user"` (mavjud pattern) |
| NFR-A-08 | Mobile touch target | ≥ 44×44 px (Tailwind `min-h-11 min-w-11` utility) |

### 4.4. i18n

| ID | Talab | MVP | Keyingi |
|---|---|---|---|
| NFR-I-01 | Kutubxona | `react-i18next` + `i18next-http-backend` | — |
| NFR-I-02 | Tillar | `uz` | Faza 2: `ru`; Faza 3: `en` |
| NFR-I-03 | URL strategy | MVP: `/diseases/...` (til prefikssiz, `uz` default) | Faza 2: `/ru/diseases/...` prefiks qo'shiladi |
| NFR-I-04 | Kontent translation status | `DiseaseBlock.translationStatus` enum (`auto`, `reviewed`, `verified`) per til | — |
| NFR-I-05 | Locale switcher | UI switcher + `Accept-Language` fallback | — |

### 4.5. Security

| ID | Talab | Amalga oshirish |
|---|---|---|
| NFR-Sec-01 | In-transit | **TLS 1.2+** (Vercel + Supabase default — TLS 1.3) |
| NFR-Sec-02 | At-rest | Supabase default (AES-256); prod mahalliy hosting'da disk-level encryption |
| NFR-Sec-03 | Shaxsiy ma'lumot | O'zbekiston «Shaxsiy ma'lumotlar to'g'risida»gi qonun; **PHI faqat prod mahalliy DB da** (D5) |
| NFR-Sec-04 | Auth | Mavjud JWT 7 kun + refresh; MFA — `MEDICAL_EDITOR`/`ADMIN` uchun Faza 2 |
| NFR-Sec-05 | RBAC | NestJS `@Roles()` guard + Prisma middleware row-level; Supabase RLS (prod) |
| NFR-Sec-06 | Audit log | Mavjud `AuditEvent` model — har kontent o'zgarishi va PHI kirishi |
| NFR-Sec-07 | Delete on request | Bemor so'rovi → 30 kun ichida PHI o'chirish (`UserDiseaseNote`, `SymptomMatchSession`); KB kontenti — tegishli emas |
| NFR-Sec-08 | XSS | `DOMPurify` frontend'da rich text render oldidan; `dangerouslySetInnerHTML` — faqat sanitized |
| NFR-Sec-09 | Rate limit | Mavjud `ThrottlerModule` (100 req/min/IP) — yangi endpointlarga ham qo'llaniladi |
| NFR-Sec-10 | Secrets | `.env` fayllar git'ga kirmaydi (`.gitignore` mavjud); Supabase service key faqat backend'da |

### 4.6. Reliability & SLO

| ID | Talab | MVP (Supabase free + Vercel Hobby) | Prod (mahalliy) |
|---|---|---|---|
| NFR-R-01 | Availability | 99% (no SLA) | 99.9% |
| NFR-R-02 | RTO | Best-effort | ≤ 4 soat |
| NFR-R-03 | RPO | Supabase daily backup (24 soat) | ≤ 1 soat (WAL streaming) |
| NFR-R-04 | Backup strategy | Supabase default | 3-2-1 qoidasi (3 nusxa, 2 media, 1 offsite) |

### 4.7. Quality

| ID | Talab | Mezon |
|---|---|---|
| NFR-Q-01 | L1 to'liqligi `published` kasallik uchun | 100% + ≥ 3 manba havolasi |
| NFR-Q-02 | `published` bo'lmagan kontent **foydalanuvchilarga ko'rinmaydi** | Public endpoint faqat `published` qaytaradi; test suite |
| NFR-Q-03 | Test coverage | Backend: service-layer ≥ 70%, controller ≥ 50%; Frontend: Vitest unit ≥ 50%, Playwright e2e smoke (login → AI Tavsiya → disease card → symptom matcher → send to doctor) — 100% happy path |
| NFR-Q-04 | Type safety | Zero `any` in new code (CI enforces); Prisma generated types everywhere |
| NFR-Q-05 | Linter | ESLint + Prettier; pre-commit hook (lint-staged) |
| NFR-Q-06 | Migration safety | Har Prisma migratsiya alohida PR (project rule); `prisma migrate dev` dev'da, `prisma migrate deploy` prod'da |

### 4.8. Observability

| ID | Talab | MVP |
|---|---|---|
| NFR-O-01 | Error tracking | Sentry (frontend + backend) |
| NFR-O-02 | Request logging | NestJS default logger + Winston (JSON format) |
| NFR-O-03 | Database slow query log | Supabase Dashboard (mavjud); prod'da pg_stat_statements |
| NFR-O-04 | Event analytics | `analytics_events` jadval (internal) MVP; Mixpanel/PostHog — Faza 2 |
| NFR-O-05 | OpenTelemetry | Faza 3 (prod) |

### 4.9. Compliance

| ID | Talab | Siyosat |
|---|---|---|
| NFR-C-01 | SaMD klassifikatsiyasi | **Information reference** sifatida pozitsiyalash (medical device emas). Har kartada disclaimer: "Bu tashxis emas, ma'lumot". Davolash tavsiyasi → disclaimer + shifokor yo'naltirish. |
| NFR-C-02 | O'zbekiston tibbiyot qonuni | Tashxis qo'yish taqiqlanadi (UI: "ehtimoliy tashxis" frazasi majburiy, "tashxis" so'zi yo'q). |
| NFR-C-03 | Copyright | Manbalar — faqat ochiq kontent (WHO, NIH, MedlinePlus, open-access PubMed, Cochrane) + original mahalliy. UpToDate/Mayo/Medscape — **faqat havola**, matn nusxa ko'chirilmaydi. Rasm — CC-BY yoki original. |
| NFR-C-04 | Dori doza | D6 — O'zbekiston qonunchiligiga muvofiq, disclaimer bilan. |
| NFR-C-05 | Bemor roziligi | UI'da explicit opt-in: "Simptomlarimni shifokorga yuborishga roziman" checkbox; ToS+Privacy Policy link. |

---

## 5. Mavjud kod bazasi tahlili — ta'sir zonasi

### 5.1. Backend (`/server`)

**Stack**: NestJS 10 + Prisma 5 + PostgreSQL (Supabase) + Supabase Storage + BullMQ + Socket.io + JWT.
**Barcha modullar** (33): [`server/src/`](../../server/src/) ostida — `auth`, `users`, `applications`, `conclusions`, `payments`, `notifications`, `booking`, `examinations`, `kassa`, `doctor-profile`, `tariff`, `clinic`, `portfolio`, `contacts`, `messages`, `faq-services`, `extras`, `calendar`, `health`, `cache`, `jobs`, `file-storage`, `laboratory`, `pharmacy`, `emr`, `config`, `common` va b.

**Yangi kerak** (YARATILISHI SHART):

| Joy | Narsa | Izoh |
|---|---|---|
| [`server/prisma/schema.prisma`](../../server/prisma/schema.prisma) | 15+ yangi model: `Disease`, `DiseaseBlock`, `DiseaseTranslation`, `Symptom`, `DiseaseSymptom`, `DiseaseStage`, `DiseaseClassification`, `DiseaseMedication`, `DiseaseLabTest`, `Medicine`, `Reference`, `ClinicalCase`, `RegionEpidemiology`, `DiseaseSpecialty`, `UserDiseaseNote`, `SymptomMatchSession`, `AITriageSession` (agar hali yo'q bo'lsa), `DiseaseEditLog` | Migratsiya **alohida faylda** (project rule) |
| `server/prisma/schema.prisma` | Yangi enumlar: `ApprovalStatus (DRAFT/REVIEW/APPROVED/REJECTED/PUBLISHED)`, `EvidenceLevel (A/B/C/D)`, `ContentLevel (L1/L2/L3)`, `SymptomAnswer (YES/NO/UNKNOWN/SOMETIMES)`, `AudienceMode (PATIENT/STUDENT/NURSE/DOCTOR/SPECIALIST/MIXED)` | — |
| `server/prisma/schema.prisma` | `UserRole` ga qo'shimchalar: `STUDENT`, `NURSE`, `EDITOR`, `MEDICAL_EDITOR` | Migratsiya ENUM ADD VALUE — **transaksiyada alohida** |
| `server/src/modules/diseases/` | Yangi modul: controller, service, repository, DTO | REST `/api/v1/diseases/*` |
| `server/src/modules/symptoms/` | Yangi modul — simptomlar lug'ati + qidiruv | — |
| `server/src/modules/kb-moderation/` | Moderatsiya workflow (BullMQ queue `kb-moderation`) | `jobs` modulidan reuse |
| `server/src/modules/references/` | Manba boshqaruvi (DOI/PubMed/URL) | — |
| `server/src/modules/triage/` | AI Tavsiya ↔ Disease matcher (backend tomonida solishtiruv) | Hozir matcher faqat frontendda |
| `server/src/modules/search/` | Postgres FTS (pg_trgm + tsvector uz/ru/en) | — |
| `server/openapi.json` | Yangi tagslar: `Diseases`, `Symptoms`, `Triage`, `KBModeration`, `References` | Auto-generated |

**Ta'sir qiladigan mavjud modullar**:

| Modul | Nima o'zgaradi |
|---|---|
| [`server/src/auth/`](../../server/src/auth/) | Yangi rollar (`STUDENT`, `NURSE`, `EDITOR`, `MEDICAL_EDITOR`) + yangi permissions; MFA flow (MEDICAL_EDITOR/ADMIN) |
| [`server/src/users/`](../../server/src/users/) | `UserDiseaseNote` bog'lamasi, profilda "Mening kasalliklarim" |
| [`server/src/doctor-profile/`](../../server/src/doctor-profile/) | `specializes_in_diseases` (many-to-many) — mutaxassis profili kasalliklar bilan bog'lanadi |
| [`server/src/conclusions/`](../../server/src/conclusions/) | `Conclusion` da `diseaseId?` (FK) — shifokor xulosasi qaysi kasallikka tegishli |
| [`server/src/messages/`](../../server/src/messages/) | WebSocket eventlari (hozir REST only) — `message:new`, `message:read`, `typing` |
| [`server/src/notifications/`](../../server/src/notifications/) | Yangi event turlari (`kb:review_requested`, `kb:approved`, `symptom_match:sent_to_doctor`) |
| [`server/src/jobs/`](../../server/src/jobs/) | Yangi queue `kb-moderation`; har 12 oyda re-review cron |
| [`server/src/file-storage/`](../../server/src/file-storage/) | Yangi bucket `DISEASE_MEDIA` (rasm, diagramma, PDF protokollar) |
| [`server/src/laboratory/`](../../server/src/laboratory/) | `LabTest.loincCode` + `Disease ↔ LabTest` many-to-many |
| [`server/src/pharmacy/`](../../server/src/pharmacy/) | `Medicine` (mavjud) + `Disease ↔ Medicine` many-to-many + RxNorm kengaytma |
| [`server/src/emr/`](../../server/src/emr/) | `MedicalRecord` da `diseaseId?` (FK) — bemor anamnezida kasallik tarixi |

### 5.2. Frontend (`/src`)

**Stack**: React 19 + Vite 6 + React Router v7 + Tailwind CSS 4 + shadcn/ui + Radix UI + NavigationContext/AppStore (Context API, Zustand/Redux yo'q).

**Mavjud qisman KB asosi** (reuse/kengaytirish):

| Fayl | Hozirgi holat | Kerak |
|---|---|---|
| [`src/app/types/index.ts`](../../src/app/types/index.ts:1168) (≈1108–1280 qatorlar) | `KBDisease`, `KBSymptom`, `KBApprovalStatus (draft/review/approved/rejected)`, `EvidenceLevel (A/B/C/D)`, `DraftSymptomSession`, `SymptomConsultation`, `AdaptiveQuestion`, `DiagnosticProtocol` — tiplar bor | Backend DTO'ga moslash; `published` holatini qo'shish |
| [`src/app/data/clinicalKB.ts`](../../src/app/data/clinicalKB.ts) | **Static mock KB** (client-side), `runDiagnosis()` funksiyasi | API dan olinadigan bo'ladi; `runDiagnosis` — fallback/offline mode uchun qoldiriladi |
| [`src/app/store/appStore.tsx`](../../src/app/store/appStore.tsx) | `clinicalKBData`, `clinicalKBSymptoms`, `symptomHistory`, `draftSymptom` — Context+localStorage | API bilan sync; server-side cache invalidation |
| [`src/app/components/screens/patient/SymptomInput.tsx`](../../src/app/components/screens/patient/SymptomInput.tsx) | Matn/ovoz/tana-zonasi input | Unchanged; natija backenddan olinadi |
| [`src/app/components/screens/patient/AdaptiveQuestions.tsx`](../../src/app/components/screens/patient/AdaptiveQuestions.tsx) | Adaptive Q&A | Backend `/api/v1/triage/{sessionId}/next-question` bilan ulash |
| [`src/app/components/screens/patient/DiagnosisResults.tsx`](../../src/app/components/screens/patient/DiagnosisResults.tsx) | Client-side matcher | Natija card'ga havola (FR-A-01); "bu kasallik haqida ko'proq" CTA |
| [`src/app/components/screens/web/WebRefKBDiseasesScreen.tsx`](../../src/app/components/screens/web/WebRefKBDiseasesScreen.tsx) | Admin screen (mock), draft/review/approved/rejected filterlari | Backend API bilan ulash, redaktor panelini kengaytirish (FR-E-01) |

**Yangi kerak bo'lgan frontend qismlar**:

| Yo'l | Komponent | Nima |
|---|---|---|
| `/src/app/pages/diseases/` (yangi) | `DiseaseListPage`, `DiseaseCardPage`, `ICD10RedirectPage` | Public disease katalog + karta |
| `/src/app/components/screens/patient/DiseaseCard/` | `DiseaseCardHero`, `ICD10Panel`, `AudienceSwitcher`, `CompletenessBar`, `BlockRenderer`, `TableOfContents` (sidebar) | Universal karta renderer |
| `/src/app/components/screens/patient/SymptomMatcher/` | `SymptomMatcherSheet` (bottom sheet/side drawer), `SymptomChipRow` (Ha/Yo'q/Bilmayman/Ba'zan), `MatchScoreIndicator`, `MatchDiffSummary` | TZ §14.3 ga ko'ra |
| `/src/app/components/ui/` ichida | `Chip`, `Callout`, `CollapsibleSection`, `Stepper`, `DataTable`, `ReferenceList`, `MedicationTable`, `CaseCard` | TZ §15 kerakli komponentlar; shadcn/ui bilan uyg'unlashadi |
| `/src/app/components/screens/cross-module/` | `DiseaseChip` (pill), `DiseaseModalPreview` | FR-S-04 boshqa modullardan embed |
| `/src/app/components/screens/web/kb/` | `KBDiseaseEditorPage` (WYSIWYG+Markdown, marker tree), `KBReviewQueuePage`, `KBReferencePicker` | Redaksion panel |
| `/src/app/components/screens/doctor/` | `DoctorIncomingCasePanel` (AI summary + patient-confirmed symptoms) | FR-D-01/02 |
| `/src/app/router.tsx` yoki `App.tsx` | Yangi route'lar: `/diseases`, `/diseases/:slug`, `/icd/:code`, `/kb/editor/:id`, `/kb/review` | React Router v7 |
| `/src/app/lib/i18n.ts` (YANGI) | i18next/react-intl setup | **Hozir yo'q** — kerak |
| `/src/app/lib/fhir.ts` (YANGI) | FHIR R4 serializer (Condition, Observation, QuestionnaireResponse) | FR-A-07 |
| `/src/app/lib/pdf.ts` (YANGI) | Kasallik kartasini PDF ga eksport | FR-X-01 (react-pdf yoki server-side) |

### 5.3. Boshqa joylar

| Joy | O'zgarish |
|---|---|
| [`docs/`](../) | `docs/09-modules/disease-kb-module.md` yangi; `docs/05-data-architecture/` ga ER-sxema; `docs/06-api-specification/` ga endpoint katalogi |
| [`docs/New modul/`](../New%20modul/) | Mavjud 15+ faylni **canonical TZ** bilan reconsile qilish — next.js vs vite, pinecone vs pgvector |
| [`guidelines/`](../../guidelines/) | Template'dan real design system'ga o'tkazish (tokens, komponent variantlari) |
| Root fayllar | `MedSmart-Pro_PRD_Migratsiya.docx`, `MedSmart-Pro_Kasalliklar_Moduli_TZ.md`, `MedSmart-Pro_Kasalliklar_Moduli_TZ.docx` — asosiy, qoladi; `demo.html` — reference (repo'ga qo'shilmaydi katta bo'lgani uchun) |
| CI/CD | Hozir yo'q; **kerak**: lint + typecheck + prisma validate + unit test + Playwright smoke |

### 5.4. Project rule'lari (`Muhim qoidalar`) ta'siri

| Qoida | Ta'sir |
|---|---|
| **Test yozmasdan PR qilinmaydi** | Har bir yangi modul (backend + frontend) uchun Jest/Vitest unit + Playwright e2e. Frontend test infratuzilmasi **hozir yo'q** — kiritish kerak. |
| **DB migratsiyalar alohida faylda** | Yangi Prisma migratsiyalar `server/prisma/migrations/` ostida alohida. `UserRole` enum'ga qiymat qo'shish va yangi modellarni **alohida migratsiyalar** sifatida ajratish (rollback oson bo'lishi uchun). |
| **API o'zgarishlari versiyalanadi** | Barcha yangi endpointlar `/api/v1/...` ichida. Breaking change bo'lmasa `v1` saqlanadi; kelajakda `/v2` ehtiyot. |
| **Katalog tuzilmasi `/src/modules/` va `/src/infra/`** | **Mavjud kodga mos emas** — kod `/src/app/` va `/server/src/` da. Qaror kerak: (a) qoidani reallik bilan yangilash, (b) yangi kodni `/src/modules/` va `/src/infra/` ga joylash, (c) CLAUDE.md ga aniqlik kiritish. Tavsiya — (a). |

---

## 6. Noaniq talablar va qaror kerak bo'lgan joylar

Bu — implementatsiyani boshlashdan oldin foydalanuvchi **aniq javob berishi kerak** bo'lgan savollar ro'yxati. Har biriga **tavsiya** qo'shilgan, lekin yakuniy qarorni foydalanuvchi qabul qiladi.

### 6.1. Arxitektura va stack — RESOLVED (D1–D7)

| # | Savol | Qaror |
|---|---|---|
| Q1 | **Hujjatlar ziddiyati**: Next.js vs Vite | **RESOLVED (D1)**: Vite SPA saqlanadi. New modul hujjatlari e'tiborsiz. |
| Q2 | **SEO/SSR** | **RESOLVED (D2)**: MVP — SPA + `react-helmet-async` + JSON-LD. Prerender Faza 2. |
| Q3 | **Search backend** | **RESOLVED (D3)**: Postgres `pg_trgm` + `tsvector`. pgvector Faza 3. |
| Q4 | **RAG / Vector DB** | **RESOLVED (D4)**: MVP client-side mock matcher; server endpoint soddalashgan. Pinecone ishlatilmaydi. |
| Q5 | **Hosting** | **RESOLVED (D5)**: Demo/test Supabase, prod PHI mahalliy. Kod abstraction bilan tayyor. |
| Q6 | **Rol enumeration strategy** | **RESOLVED (D9)**: `UserRole` enum + `@Roles()` guard — MVP. Fine-grained `Permission` jadvali — Faza 2. |
| Q7 | **i18n kutubxona** | **RESOLVED (D7)**: `react-i18next`, MVP faqat uz. |

### 6.2. Kontent va data model

| # | Savol | Tavsiya |
|---|---|---|
| Q8 | **Blok content format**: TZ "markdown + `{{marker}}` templating" deydi. **Schema validation** qanday (JSON schema, Zod, Yup)? | Zod schema (frontend+backend shared) + `DiseaseBlock.content` ni `jsonb` sifatida saqlash, har bir blok uchun sxema (masalan `medications` bloki table, `overview` bloki markdown). |
| Q9 | **Marker templating engine**: TZ `{{marker | format: chips}}` kabi sintaksis. Server-side render yoki client-side? Qaysi kutubxona? | Client-side, lightweight: `mustache.js` yoki `handlebars` yoki custom parser. Server faqat raw content + metadata qaytaradi. |
| Q10 | **1000+ kasallikni bootstrap**: qayerdan olamiz? WHO ICD-10 CSV — ha, lekin **sinonim, tarjima, simptomlar** qayerdan? | (1) WHO ICD-10 → skeleton (kod + nom uz/ru/en). (2) Seed kontent — manba ochiq: NIH MedlinePlus API, OpenFDA, WHO disease factsheets. (3) AI-assisted translation + medical editor review. |
| Q11 | **FHIR R4 resource complexity**: to'liq FHIR-compliant kerakmi yoki soddalashgan struktura? | MVP — soddalashgan JSON (ilovaga mos), lekin **FHIR naming convention** (Condition, Observation, Questionnaire, QuestionnaireResponse) saqlanadi. Faza 3 — to'liq FHIR R4. |
| Q12 | **Mintaqaviy epidemiologiya**: O'zbekiston ma'lumotlari yo'q bo'lsa, fallback ("ma'lumot yo'q") yoki jahon o'rtacha? | `{{prevalence_uz \| fallback: "ma'lumot yetarli emas"}}` — TZ §10.1 bilan muvofiq. Sog'liqni saqlash vazirligi bilan keyinchalik integratsiya. |
| Q13 | **Dori doza ko'rsatish siyosati** | **RESOLVED (D6)**: O'zbekiston qonunchiligiga muvofiq ko'rsatiladi. Disclaimer + "bu retsept emas" majburiy. Bemor rejimida default yashirilgan, "Batafsil" bilan ochiladi; shifokor rejimida ochiq. |
| Q14 | **Kontent license**: UpToDate, Mayo Clinic va b. — copyright. Qanday manbalardan foydalanamiz? | Ochiq manbalar: WHO, NIH, Cochrane, open-access PubMed, MedlinePlus. Plus original mahalliy mutaxassislar kontentini. UpToDate/Mayo — havola beramiz, lekin matn nusxa ko'chirmaymiz. |
| Q15 | **"Klinik holatlar" (case reports)** — bemor ma'lumoti anonimlashtirilishi kerak mi? Kim kiritadi? | Ha, majburiy anonimlashtirish (ID, yosh oraliq, jins, diagnoz faqat). Kirituvchi: shifokor/mutaxassis (Content Writer roli). Medical editor tekshiradi. Bemordan **aniq rozilik** kerak. |

### 6.3. AI / symptom matching

| # | Savol | Tavsiya |
|---|---|---|
| Q16 | **Matching algorithm**: client-side (hozirgidek `runDiagnosis`) yoki server-side? | MVP: client-side qoladi (UX tezroq, offline imkoniyat). **Bir vaqtda** server-side alohida `/api/v1/triage/match` endpoint — shifokorga yuborishda autoritativ natija. |
| Q17 | **"Siz kiritgan N ta simptomdan M ta mos" — sinonim solishtiruvi qanday?** TZ SNOMED CT orqali deydi. SNOMED license $7k+/yil. | MVP: qo'lda yozilgan sinonim lug'at (`KBSymptom.synonyms[]`). Faza 3: SNOMED CT subset (agar byudjet bo'lsa) yoki UMLS Metathesaurus (tekin). |
| Q18 | **False positive xavfi**: AI yoki matcher noto'g'ri kasallik taklif qilsa (masalan "bosh og'rig'i" → o'sma). Qanday cheklash? | (1) Har doim top-3 ko'rsatish (1 ta emas). (2) "Bu tashxis emas" disclaimer. (3) Red flag algoritmi alohida (oddiy rule-based: "isitma+bo'yin qattiqligi → meningit shubhasi → 103"). (4) Shifokor tasdig'isiz yakuniy tashxis yo'q. |
| Q19 | **Learning loop**: shifokor tasdig'i/raddi modelni o'qitadi (FR-A-08). Bu qancha priority? | Faza 3. MVP — faqat log yig'iladi, ML pipeline keyin. |

### 6.4. Moderatsiya va rol

| # | Savol | Tavsiya |
|---|---|---|
| Q20 | **Kim "Medical editor"?** O'zbekiston real professor/akademiklari bilan shartnoma bormi? | Biznes savol. Tavsiya — **Klinik Kengash** (5–7 mutaxassis) va alohida **Medical Editor** (1 nafar, full-time). MVP bosqichida 1–2 nafar medical editor yetarli. |
| Q21 | **Kontent workflow**: draft → review → approved — bir bosqichmi yoki (medical editor → clinical board)? | **Ikki bosqich**: (a) medical editor texnik review, (b) tor mutaxassis (revmatolog Bexterev uchun) klinik review. `approved` — ikkala imzo bor. `published` — admin publish qiladi. |
| Q22 | **Boshqa mutaxassis qo'shimchasi** (FR-E-04): har bir qo'shimcha qayta approved bo'lishi kerakmi? | Ha, **minor edit** (tarjima tuzatishi) — bir imzo; **major edit** (protokol o'zgarishi) — ikki imzo. Field-level audit. |
| Q23 | **Clinical board auditi** (6 oyda bir marta): tasdiqlangan kasallik uchun **"Sertifikatlangan"** badge ko'rinadi — bu FR bo'ladi mi? | Ha, FR-E-10 sifatida qo'shilsin. Badge — trust signal. |

### 6.5. UX va audience

| # | Savol | Tavsiya |
|---|---|---|
| Q24 | **Default audience mode**: "Aralash" (default) — aynan nimani ko'rsatadi? | `Aralash` — `Bemor` + collapsible "Shifokor uchun" accordion. Yoki mode'ni tizim auto-detect qilsin (foydalanuvchi roli asosida). |
| Q25 | **Card URL strategy**: `/diseases/{slug}` (gipertoniya-i10) yoki `/icd/{code}` (I10)? Aliaslar? | Canonical — `/diseases/{slug}`, alias — `/icd/{code}` 301 redirect canonical'ga. `slug` = `{name-lowercase-normalized}-{icd10}`. |
| Q26 | **Tablar vs single scroll**: TZ ikkalasini ham eslatadi (desktop — tabs, mobil — accordion). Single scroll sidebar bilan emasmi? | Mobil: accordion + sticky TOC. Desktop: **tabs** (Umumiy/Diagnostika/Davolash/...) + side sticky TOC. Variant B — single long scroll + **left-side sticky TOC** (like UpToDate). Prototip kerak. |
| Q27 | **"Offline rejim"** (TZ §14.5 — service worker): MVP mi? | Faza 3. PWA keyin. |

### 6.6. Biznes/qonuniy

| # | Savol | Tavsiya |
|---|---|---|
| Q28 | **SaMD classification**: modul "medical device" mi yoki "information reference"? | **Information reference** sifatida pozitsiyalash (disclaimer har yerda). Davolash tavsiyasi bermaslik (faqat ma'lumot). Yuridikdan tasdiq majburiy. |
| Q29 | **O'zbekiston tibbiyot qonuni**: elektron ma'lumotnoma uchun litsenziya kerakmi? | Qaror — yurist bilan. MVP'da "ma'lumot berish" pozitsiyasi, tashxis qo'yish **taqiqlanadi**. |
| Q30 | **Data residency**: PHI qayerda saqlanadi? | **RESOLVED (D5)**: MVP/demo/test — Supabase EU (PHI yo'q, faqat KB kontenti + demo users). Prod PHI — **mahalliy O'zbekiston hosting'ga o'tkaziladi** (alohida infra task, kodni bloklamaydi). Kod env-driven DATABASE_URL + storage abstraction bilan tayyorlanadi. |

---

## 7. Risklar va edge case'lar

### 7.1. Klinik risklar (eng yuqori prioritet)

| ID | Risk | Ehtimollik | Ta'sir | Mitigatsiya |
|---|---|---|---|---|
| R-C-01 | **Noto'g'ri klinik ma'lumot** foydalanuvchiga zarar yetkazadi (noto'g'ri doza, noto'g'ri simptom interpretatsiyasi) | O'rta | Juda yuqori (yuridik, human harm) | Peer review (2 imzo), medical editor, clinical board audit 6 oyda, har bir da'voga manba, disclaimer |
| R-C-02 | **Emergency state missing** — masalan miokard infarkti simptomlari uchun "103 ga qo'ng'iroq" banner chiqmaydi | Past | Juda yuqori (hayotga xavf) | Rule-based red-flag engine (hardcoded, whitelist asosida), QA test-suite barcha ICD-10 emergency'lari uchun, QA medical signoff |
| R-C-03 | **AI match noto'g'ri kasallikka yo'naltiradi** — bemor "bosh og'rig'i" yozadi → "miya o'smasi" chiqadi → bemor panika | O'rta | Yuqori | Top-3 ko'rsatish, "ehtimoli past" banner, shifokor tasdig'i, disclaimer, UI'da 95%+ probability hech qachon ko'rsatilmaydi (cap) |
| R-C-04 | **Dori o'zaro ta'sirini yashirish** — kontentda eslatib o'tilmagan drug-drug interaction | O'rta | Yuqori | `Medication` modelida `interactions[]` majburiy; RxNorm/MNN dan sync; bemor allergy bilan cross-check |
| R-C-05 | **Kontent eskirgan** — protokol yangilangan, baza yangilanmagan | Yuqori | O'rta | 12 oyda re-review cron, WHO/ESC/EULAR release tracker, "Oxirgi yangilanish" badge |

### 7.2. Ma'lumot maxfiyligi va security

| ID | Risk | Mitigatsiya |
|---|---|---|
| R-S-01 | Bemor PHI leak (simptomlar, tashxis) | TLS 1.3, AES-256 at-rest, role-based access, audit log, anonim rejim default |
| R-S-02 | Shifokorga yuborilgan FHIR data boshqa shifokor tomonidan ko'rinadi | Strict row-level security (Prisma middleware + Supabase RLS); har bir `QuestionnaireResponse` faqat ID-lik shifokorga |
| R-S-03 | IDOR — `/diseases/{id}` public, lekin `/diseases/{id}/notes` bemor-spetsifik | Auth guard har bir endpoint uchun; `UserDiseaseNote` faqat `userId = session.userId` |
| R-S-04 | XSS — bemor yozgan izoh/simptom matnida | DOMPurify frontend'da, rich text sanitization |
| R-S-05 | Prompt injection — agar AI Claude'ga bemor matn yuborilsa | System prompt hardcoded, user input alohida template slot, output validation |

### 7.3. Performance va scale

| ID | Risk | Mitigatsiya |
|---|---|---|
| R-P-01 | **Katta blok yuklanishi** (L3 kontenti 10KB+) — p95 1.2s ni oshiradi | Lazy-load bloklar (FR `/diseases/{slug}/blocks/{marker}` endpoint alohida), CDN (Vercel + Supabase CDN), markdown → pre-rendered HTML kesh |
| R-P-02 | **1000 kasallik × 40 blok × 3 til** = 120K+ document — qidiruv sekin | Postgres FTS bilan boshlanadi, keyin pgvector; materialized view'lar; Redis kesh |
| R-P-03 | **Concurrent symptom match** (500 RPS) — server-side matcher bo'sh | Async job yoki client-side matching (MVP). Server matching alohida workers (BullMQ) |
| R-P-04 | **WebSocket scale** — real-time chat 10K+ connection | Redis pub/sub scaling; Socket.io adapter (Redis); prod'da Nginx sticky session |

### 7.4. Kontent va moderatsiya

| ID | Risk | Mitigatsiya |
|---|---|---|
| R-E-01 | Medical editor band — kontent `review` queue'da haftalar | SLA: 48 soat review; avtomatik "reminder" notification; ikkinchi editor fallback |
| R-E-02 | Reviewer conflict — ikki mutaxassis bir-biriga zid fikr | "Conflict resolution" step — 3-shaxs (clinical board chair) hakamlik qiladi; audit bilan saqlanadi |
| R-E-03 | Bootstrap skeleton'lar `published` bo'lmasdan foydalanuvchilarga ko'rinadi | `status` enum majburiy; public endpoint faqat `published` qaytaradi; test suite |
| R-E-04 | Tarjima sifati — mashina tarjimasi + inson review — xatoliklar | `translation_status` per blok: `auto`, `reviewed`, `verified`. Foydalanuvchiga `auto` ko'rsatilmaydi |
| R-E-05 | Rasm/diagramma copyright | Faqat CC-BY yoki original kontent. Har rasm uchun `license` maydon majburiy. Medical editor tekshiradi. |

### 7.5. Edge case'lar (UI/UX)

| ID | Edge case | Ta'minlash |
|---|---|---|
| E-01 | Kasallik haqida **hech qanday ma'lumot yo'q** (skeleton only) | "Bu kasallik uchun to'liq ma'lumot hali tayyorlanmoqda" placeholder + "Shifokor bilan bog'lanish" CTA |
| E-02 | Bemor **0 ta simptom** tanlagan | Symptom matcher ochilmaydi; "Avval AI Tavsiya orqali simptomlarni kiriting" |
| E-03 | Foydalanuvchi **ICD-10 kod mavjud emas** (masalan `Z99.99`) | 404 page + "Shunga o'xshash kasalliklar" taklif |
| E-04 | ICD-10 yangilandi (WHO release) — eski kod olib tashlangan | Migration script + redirect `/icd/{old}` → `/icd/{new}` |
| E-05 | Bemor **chet tilda** (en) qidiradi, kasallikning faqat `uz` nomi bor | Fallback til: `en` yo'q → `ru` → `uz`; `translation_pending` badge |
| E-06 | Bemor **offline** (mobil) | PWA service worker (Faza 3); MVP'da "internet yo'q" banner |
| E-07 | **Screen reader** foydalanuvchi | ARIA `tablist`, `role="radiogroup"` symptom chiplar uchun (TZ §14.7); Playwright a11y test |
| E-08 | **Motion-reduce** — animatsiyalar kam | `prefers-reduced-motion` CSS query; framer-motion `reducedMotion: "user"` |
| E-09 | **Juda uzun blok matni** (10K+ so'z patogenez) | Collapsible "Ko'proq o'qish" (FR-UX progressive disclosure); TOC anchor |
| E-10 | **Bir xil simptom** boshqa kasalliklarda — bemor yomon taassurot (5 xil kasallik chiqadi) | Top-3 limit + "Bu simptomlar boshqa kasalliklarda ham uchrashi mumkin" disclaimer |
| E-11 | Bemor **boshqa til** (uyg'ur, qozoq, tojik) | MVP — uz/ru/en qo'llab-quvvatlanadi; boshqalar uchun til switcher'da "kelgusida" xabar |
| E-12 | Shifokor **bir nechta bemor**dan symptom match yuborildi — queue overload | Dashboardda filter (yangi/ko'rilgan/javob berilgan), pagination, SLA counter |
| E-13 | **FHIR export xatosi** (validation fail) | Validation client-side + server-side; foydalanuvchiga "bu ma'lumot to'liq emas" xabar |
| E-14 | **Bemor anonim** rejimda — shifokor aloqaga chiqa olmaydi | `AnonymousNumber` mavjud; pseudonym bilan chat; `canBeContacted: boolean` |
| E-15 | Draft 7 kundan oshdi (FR-A-09) | Cron job delete + "draftingiz eskirgan" xabar |

### 7.6. Yuridik va compliance

| ID | Risk | Mitigatsiya |
|---|---|---|
| R-L-01 | **Tashxis qo'yish** deb talqin qilinishi (SaMD regulation) | "Bu tashxis emas, bu ma'lumot" har yerda; disclaimer; shifokor tasdig'i majburiy CTA |
| R-L-02 | **Yuridik javobgarlik** — bemor zarar ko'rsa | ToS + foydalanuvchi "men rozi" click; insurance (professional liability); content attributions |
| R-L-03 | **PDn** (O'zbekiston shaxsiy ma'lumotlar qonuni) | Data residency Q30, minimal data collection, consent UI, delete-on-request |
| R-L-04 | **GDPR** (agar EU foydalanuvchilar) | Right to erasure, DPA, cookie consent |
| R-L-05 | **Copyright** manbalar (UpToDate, Mayo) | Faqat havola, matn nusxa emas |

---

## 8. MVP uchun tavsiya qilingan qamrov (scope recommendation)

Yuqoridagilar asosida **MVP scope**:

**MVP (6–8 hafta, Faza 1+Faza 2 qisman)**:
- Backend: `Disease`, `Symptom`, `DiseaseSymptom`, `Reference`, `DiseaseBlock` (faqat L1 level), `SymptomMatchSession` Prisma modellari.
- Backend: REST API — list/search/get disease, list symptoms, POST triage match.
- Backend: Auth'ga `EDITOR`, `MEDICAL_EDITOR` rollari qo'shish + MFA skeleton.
- Frontend: `/diseases` list (qidiruv), `/diseases/:slug` karta (Bemor rejimi, L1 bloklar), `SymptomMatcherSheet`.
- Frontend: `DiagnosisResults` → disease card navigation.
- Frontend: Shifokorga yuborish (FHIR-style JSON, to'liq FHIR emas).
- Frontend: Shifokor panelida incoming symptom match case (minimal UI).
- Content: 50 ta kasallik, L1, uz tilida (ru avtomatik tarjima + manual tweak).
- Moderatsiya: draft → review → approved → published (simpler, 1 imzo).
- NFR: WCAG AA compliance, p95 < 1.5s, Playwright smoke tests.

**MVP dan tashqarida (keyingi fazalarga)**:
- L2/L3 kontenti, klinik holatlar, dori-darmon table, mintaqaviy statistika, epidemiologiya (Faza 3).
- Semantik qidiruv (pgvector), RAG, Claude API integratsiyasi (Faza 3).
- PWA offline rejim, PDF export (Faza 3).
- 3 tilli full support, URL prefix (`/uz/…`), schema.org (Faza 2).
- Ikki-bosqichli moderatsiya (medical editor + clinical specialist), clinical board audit (Faza 3).
- Real-time chat, typing indicator, file attachment (Faza 2).
- Learning loop, analytics dashboard (Faza 3).

---

## 9. Keyingi qadamlar (Next steps)

1. **RESOLVED** — §1a dagi D1–D12 qarorlari qabul qilindi (2026-04-17).
2. **DONE** — [`docs/analysis/implementation-plan.md`](./implementation-plan.md) — bosqichma-bosqich PR rejasi, test/verification/rollback strategiyasi bilan.
3. **Prototip**: disease card UI Figma'da (mustaqil dizayn tasks — loyiha menejeri PRga PR-16'dan oldin rejalashtirishi kerak).
4. **Content pipeline trial**: Bexterev kasalligini PR-24'dan keyin end-to-end sinash (draft → review → approved → published).
5. **Yuridik clearance** (kod bilan parallel, bloklamaydi): Q28 (SaMD pozitsiyasi), Q29 (elektron ma'lumotnoma litsenziyasi), Q30 (PHI residency migratsiyasi) — rasmiy tasdiqlar.
6. **D5 follow-up**: prod uchun mahalliy O'zbekiston hosting tanlovi va PHI migratsiya rejasi — alohida infra task.

---

## 10. Qo'shimcha: blok ro'yxati (canonical markers)

Har bir marker uchun semantik id (o'zgarmas) va display label variantlari (TZ §9 to'liq). Backend `DiseaseBlock.marker` enum/string, frontend blok renderer shu marker'ga qarab komponent tanlaydi.

**Kanonik ro'yxat** (38 ta):
`about_disease`, `overview`, `media`, `etiology`, `pathogenesis`, `complaints`, `anamnesis`, `labs`, `variants`, `examination`, `classification`, `symptoms`, `diagnostics`, `treatment`, `medications`, `prognosis`, `pricing`, `clinics`, `doctor_type`, `doctors`, `other_info`, `important`, `features`, `patho_classification`, `stages`, `clinical`, `stage_early`, `stage_expanded`, `stage_late`, `complications`, `dx_methods`, `tx_scheme`, `recommendations`, `prevention`, `donts`, `dos`, `prognosis_prevention`, `cases`.

**Kengaytiruvchi** (TZ §8.3, ixtiyoriy):
`epidemiology`, `blood_group_notes`, `genetics`, `risk_factors`, `differential_diagnosis`, `scales` (NYHA/BASDAI/VAS/Glasgow), `comorbidities`, `pregnancy_notes`, `pediatric_notes`, `geriatric_notes`, `rehab`, `psychosomatic`, `nutrition`, `exercise`, `disability_legal`, `emergency_algorithm`, `protocols`, `drug_interactions`, `vaccination`, `scientists_history`, `recent_trials`, `regional_uz`, `patient_orgs`, `faq`, `news`, `takeaways`.

---

## 11. Ilovalar

- **A. TZ markerlar sinonim-matritsasi** — [TZ §9](../../MedSmart-Pro_Kasalliklar_Moduli_TZ.md) dan olinadi.
- **B. JSON sxema (Disease)** — [TZ §24](../../MedSmart-Pro_Kasalliklar_Moduli_TZ.md) dan olinadi, Zod'ga konvertatsiya qilinadi.
- **C. ER-sxema (soddalashgan)** — [TZ §11.3](../../MedSmart-Pro_Kasalliklar_Moduli_TZ.md) + yangi kengaytmalar (`UserDiseaseNote`, `SymptomMatchSession`).
- **D. Kontent sifati checklist** — [TZ §25](../../MedSmart-Pro_Kasalliklar_Moduli_TZ.md).
- **E. Bexterev to'ldirilgan karta namunasi** — [TZ §23](../../MedSmart-Pro_Kasalliklar_Moduli_TZ.md) — testing/validation uchun reference.

---

**Hujjat oxiri. Status**: Draft → foydalanuvchi sharhi kutilmoqda → qaror qabul qilingach `plan.md` yoziladi.
