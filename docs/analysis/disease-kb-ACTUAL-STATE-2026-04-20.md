# Disease KB — ACTUAL STATE (Reality Check Audit)

**Sana**: 2026-04-20 (kun oxiri)
**Maqsad**: `TT-DISEASE-KB-MODULE-v2.md` va `CORRECTION-PROMPT-va-GAP-ANALIZ.md` (ertalabki versiya) da ta'riflangan holatni — kod bazaning **haqiqiy holati** bilan solishtirish.
**Xulosa**: Eski hujjatlar ~32% "yo'q" deb hisoblagan komponentlarning ko'pchiligi **allaqachon mavjud va LIVE backend bilan ishlaydi**. MVP funksional bo'yicha **~85% tayyor**.

---

## 1. HUJJAT vs HAQIQAT — Tez qarash

| Hujjat ta'rifi | Hujjatdagi status | **Haqiqiy status** | Tasdiq |
|---|---|---|---|
| `DiseaseCard.tsx` ekrani | ❌ yo'q | ✅ **LIVE** | `src/app/pages/diseases/DiseaseCardPage.tsx` (+20 ta sub-komponent) |
| `SymptomMatcherSheet.tsx` | ❌ yo'q | ✅ **HYBRID** | `src/app/components/diseases/SymptomMatcherSheet.tsx` + 4-bosqichli wizard |
| `SendToDoctor.tsx` + FHIR | 🟡 alohida | ✅ **LIVE** submit (doctor list mock) | `src/app/components/diseases/SendToDoctorDialog.tsx` |
| `IncomingCasePanel` (shifokor) | ❌ yo'q | ✅ komponent LIVE (chat message ichida) | `src/app/components/screens/doctor/IncomingCasePanel.tsx` |
| CMS `WebKBDiseaseEditor` | ❌ yo'q | ✅ **LIVE** (176 qator, MarkerTree + BlockEditor) | `src/app/pages/kb/KBDiseaseEditorPage.tsx` |
| `WebKBModerationQueue` | ❌ yo'q | ✅ **LIVE** (151 qator) | `src/app/pages/kb/KBReviewQueuePage.tsx` |
| `POST /symptom-sessions` endpoint | ❌ yo'q | ❌ yo'q (lekin `/triage/sessions/*` mavjud — ekvivalent) | `server/src/triage/triage.controller.ts` |
| Re-review on edit workflow | ❌ yo'q | ✅ state machine + guard | `server/src/kb-moderation/state-machine.ts` |
| Feature flag `APP_FEATURE_DISEASE_KB` | — | ✅ backend | ❌ frontend | `server/src/common/feature-flag.guard.ts:44` |
| pgvector semantic search | 🟡 qisman | ✅ **LIVE** `/diseases/semantic-search` | `server/src/diseases/diseases.controller.ts` |
| Markerli template (40+ marker) | ✅ | ✅ `/markers` endpoint | `server/src/disease-blocks/markers.controller.ts` |
| Deep-link `Tahlil → Kasallik kartasi` | ❌ uzilgan | ✅ **tuzatilgan** | `DiagnosisResults.tsx:104-110` → `/kasalliklar/{slug}` |

---

## 2. ROUTER — Haqiqiy routelar

Loyihada **`/disease/:slug` emas, `/kasalliklar/:slug`** ishlatilgan (o'zbekcha URL konventsiyasi).

| Route | Komponent | Holati |
|---|---|---|
| `/kasalliklar` | `DiseaseListPage` | ✅ LIVE |
| `/kasalliklar/:slug` | `DiseaseCardPage` | ✅ LIVE |
| `/kb/diseases/new` | `KBDiseaseEditorPage` (create) | ✅ LIVE |
| `/kb/diseases/:slug/edit` | `KBDiseaseEditorPage` (edit) | ✅ LIVE |
| `/kb/review` | `KBReviewQueuePage` | ✅ LIVE |
| `/cases/inbox` | — | ❌ yo'q |
| `/cases/:id` | — | ❌ yo'q |

> **Izoh**: TT-v2 hujjatidagi `/disease/:slug`, `/admin/kb/moderation`, `/admin/kb/diseases/:id/edit` URL'lari haqiqatdan farq qiladi. **Kod to'g'ri — hujjatni kod bilan moslashtirish kerak.**

---

## 3. BACKEND — Endpoint inventari

### ✅ Mavjud (23 endpoint, `FeatureFlagGuard('APP_FEATURE_DISEASE_KB')` bilan himoyalangan)

**Kasalliklar** (`/diseases`):
- `GET /diseases` · list + FTS
- `GET /diseases/:slug` · detail (audience level param)
- `GET /diseases/:slug/symptoms` · related symptoms
- `GET /diseases/semantic-search` · pgvector
- `POST /diseases` · create (EDITOR+)
- `PATCH /diseases/:id` · update
- `DELETE /diseases/:id` · archive (ADMIN)
- `POST /diseases/:id/index-embedding` · vector index
- `GET /icd/:code` · ICD-10 lookup

**Simptomlar** (`/symptoms`): GET list/id, POST, PATCH, DELETE.

**Manbalar** (`/references`): GET list/id, POST, PATCH, DELETE (if unused).

**Bloklar** (`/diseases/:slug/blocks`):
- `GET /diseases/:slug/blocks` · list
- `GET /diseases/:slug/blocks/:marker` · single (lazy)
- `POST /diseases/:slug/blocks` · create
- `PATCH /diseases/:slug/blocks/:id` · update
- `DELETE /diseases/:slug/blocks/:id` · delete
- `POST /diseases/:slug/blocks/:id/references` · attach reference
- `GET /markers` · canonical marker catalogue

**Moderatsiya** (`/kb`) — to'liq state machine:
- `POST /kb/blocks/:id/submit-review` · DRAFT|REJECTED → REVIEW
- `POST /kb/blocks/:id/approve` · REVIEW → APPROVED (MEDICAL_EDITOR+)
- `POST /kb/blocks/:id/reject` · REVIEW → REJECTED
- `POST /kb/blocks/:id/publish` · APPROVED → PUBLISHED (ADMIN)
- `POST /kb/blocks/:id/archive`
- `GET /kb/review-queue` · paginated (MEDICAL_EDITOR+)
- `GET /kb/history/:blockId` · edit log
- `POST /kb/admin/lifecycle-scan` · stale blocks

**Triage / Sessions** (`/triage`) — TT-v2 dagi "symptom-sessions" ning **ekvivalenti**:
- `POST /triage/match` · match + DDx + red flags
- `POST /triage/sessions/:id/update` · update status
- `POST /triage/sessions/:id/send-to-doctor` · FHIR QR + notification
- `GET /triage/sessions/:id` · single session
- `POST /triage/sessions/:id/save-note` · personal note
- `GET /triage/red-flag-rules` · rules catalogue
- `GET /triage/red-flag-rules/:ruleKey` · single rule

### ❌ Yo'q (kritik gap)
- `GET /triage/sessions?doctorId=me&status=SENT_TO_DOCTOR` — **shifokor inbox listi** (singular `:id` bor, list yo'q).
- WebSocket gateway `/cases/inbox` yoki `/triage/sessions` — real-time push (`chat` va `notifications` gateway'lari mavjud, lekin triage'ga ulanmagan).
- `GET /users?role=DOCTOR&specialty=...` — real doctor picker manbasi (SendToDoctorDialog da hozir mock).

---

## 4. PRISMA MA'LUMOT MODELI — To'liq

### ✅ Mavjud modellar
- `Disease`, `DiseaseBlock`, `DiseaseSymptom`, `DiseaseReference`, `DiseaseStage`, `DiseaseMedication`, `DiseaseLabTest`, `ClinicalCase`, `RegionEpidemiology`, `DiseaseSpecialist`, `DiseaseEditLog`
- `Symptom`, `Reference`
- `SymptomMatchSession` (schema.prisma:1501) — 14 ta maydon
- `UserDiseaseNote`, `RedFlagEvent` (TT-v2 dagi `redFlags` Json emas — alohida model, **yaxshiroq**)

### ❌ Yo'q (TT-v2 da talab qilingan, lekin MVP uchun kerak emas)
- `SessionSymptom` — ishlatilmaydi (symptoms `matchedSymptoms`/`missingSymptoms` **Json** maydonlarida — kelishilgan arxitektura).
- `DiseaseScientist`, `DiseaseResearch`, `DiseaseGenetic` — optional L3 models, MVP scope'dan tashqarida.
- `SymptomMatchSession.bodyZones/ddxTop5/clinicalNote/fhirJson` — hozir `matchedSymptoms` Json ichida yoki `UserDiseaseNote`/`RedFlagEvent` orqali.

### Enum'lar
- ✅ `SymptomAnswer` (YES/NO/UNKNOWN/SOMETIMES)
- ✅ `MatchSessionStatus` (ACTIVE/SENT_TO_DOCTOR/EXPIRED/ARCHIVED)
- ✅ `ApprovalStatus`, `EvidenceLevel`, `AudienceMode`, `EditLogType`
- ❌ `ScientistRole`, `ResearchType`, `InheritancePattern`, `BloodGroup` — L3 models uchun

---

## 5. HAQIQIY QOLGAN GAP'LAR (aniq, prioritized)

### 🔴 Kritik (MVP bloklovchi)
| # | Gap | Taxmin | Izoh |
|---|---|---|---|
| G1 | `GET /triage/sessions?doctorId=me` backend endpoint | 0.5 kun | Shifokor inbox uchun |
| G2 | `/cases/inbox` frontend sahifasi | 0.5 kun | `IncomingCasePanel` list ko'rinishi |
| G3 | `/cases/:id` frontend sahifasi (yoki inbox ichida detail) | 0.5 kun | Case detail + clinical note input |
| G4 | SendToDoctorDialog: `MOCK_DOCTORS` → real `/users?role=DOCTOR` | 0.25 kun | [SendToDoctorDialog.tsx:29-34](src/app/components/diseases/SendToDoctorDialog.tsx) |

### 🟡 Muhim (MVP sifatini oshiruvchi)
| # | Gap | Taxmin | Izoh |
|---|---|---|---|
| G5 | Frontend feature flag `VITE_FEATURE_DISEASE_KB` | 0.25 kun | Prod'da module'ni yashirish |
| G6 | WebSocket push (yangi session shifokorga) | 0.5 kun | `notifications.gateway.ts` ga event qo'shish |
| G7 | SymptomMatcherSheet steps 2-4 server persistence | 0.5 kun | Hozir local only |
| G8 | SendToDoctorDialog PDF export (hozir disabled) | 0.5 kun | [line 188](src/app/components/diseases/SendToDoctorDialog.tsx) |
| G9 | 50 kasallik × L1 uz seed (hozircha soni nechta?) | 1 kun | Medical editor ishi |

### 🟢 Post-MVP / Ko'zga tutilgan
- `DiseaseScientist`, `DiseaseResearch`, `DiseaseGenetic` modellari + endpoint + UI
- Playwright e2e (UC-01..04)
- A11y audit + Lighthouse CI
- Storybook stories
- BullMQ embedding job (hozir sync)

---

## 6. HUJJAT HOLATI — Arxivlash kerak

`docs/analysis/` ichida 4 ta **eskirgan** hujjat:

| Fayl | O'lcham | Harakat |
|---|---|---|
| `feature-analysis.md` | 53 KB | → `docs/_archive/disease-kb-v1/` |
| `implementation-plan.md` | 58 KB | → `docs/_archive/disease-kb-v1/` |
| `tz-disease-kb-gaps.md` | 53 KB | → `docs/_archive/disease-kb-v1/` |
| `CORRECTION-PROMPT-va-GAP-ANALIZ.md` | 23 KB | → `docs/_archive/disease-kb-v1/` (ertalabki snapshot) |

**Saqlanadi**: `docs/09-modules/TT-DISEASE-KB-MODULE-v2.md` (canonical), `MedSmart-Pro_Kasalliklar_Moduli_TZ.md` (biznes-hujjat).
**Tuzatiladi**: `docs/09-modules/disease-kb-module.md` (eski overview) — yangi URL konventsiyasi va holat bilan yangilanadi.

---

## 7. REJA QAYTA KALIBRLANISHI

Oldingi taklif: **13 ish kuni · 20 PR**. Reallik: **~4 ish kuni · 7 PR**.

### Yangi reja (qisqartirilgan)

| PR | Faza | Kun | Scope |
|---|---|---|---|
| **PR-1** | A · Docs | 0.25 | Eski 4 hujjatni `docs/_archive/disease-kb-v1/` ga ko'chirish; `disease-kb-module.md` ni yangilash |
| **PR-2** | B · Backend | 0.5 | `GET /triage/sessions?doctorId=me&status=SENT_TO_DOCTOR&page=` + test (G1) |
| **PR-3** | B · Backend | 0.5 | `GET /users?role=DOCTOR&specialty=` (doctor picker) + WS event hook (G4 backend part, G6 wiring) |
| **PR-4** | C · Frontend | 1 | `/cases/inbox` page + `useDoctorCaseInbox()` hook (G2) |
| **PR-5** | C · Frontend | 1 | `/cases/:id` page yoki `CaseDetail` drawer + clinical note (G3) + Mock → real doctor list (G4) |
| **PR-6** | C · Frontend | 0.25 | Frontend feature flag `VITE_FEATURE_DISEASE_KB` + route gating (G5) |
| **PR-7** | D · Quality | 0.5 | Playwright e2e (UC-01..04), a11y scan, CHANGELOG |

**Jami: ~4 ish kuni, 7 PR, 1 full-stack.**

### Keyin (post-MVP, alohida sprint)
- Seed 50 kasallik × L1 (G9) — Medical editor bilan parallel
- SymptomMatcher steps 2-4 persistence (G7)
- PDF export (G8)
- Optional modellar: Scientist/Research/Genetic
- BullMQ embedding job

---

## 8. XULOSA (1 jumla)

> **MedSmart-Pro Disease KB moduli MVP sifatida ~85% tayyor. Qolgan 15% — asosan shifokor inbox sahifasi (2 PR), kichik backend endpoint (1 PR), feature flag (1 PR), va hujjat tozalash (1 PR). Taxminan 4 ish kunida yakunlanadi.**

---

**Muallif**: Claude (reality check audit) · **Sana**: 2026-04-20
**Keyingi qadam**: PR-1 (hujjat arxivlash) bilan boshlash — userdan tasdiq kutilmoqda.
