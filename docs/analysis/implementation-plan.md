# Implementation Plan — Kasalliklar Ma'lumotnomasi va Diagnoz Bazasi Moduli

**Loyiha**: MedSmart-Pro
**Modul**: Disease Knowledge Base
**Sana**: 2026-04-17
**Manba**: [`feature-analysis.md`](./feature-analysis.md) — qarorlar D1–D12
**Stack**: React 19 + Vite 6 + React Router v7 + Tailwind 4 + shadcn/ui (FE); NestJS 10 + Prisma 5 + PostgreSQL (Supabase) + BullMQ + Socket.io (BE)
**MVP qamrov**: 50 kasallik × L1 darajada × uz tilida; AI Tavsiya → Disease card → Symptom matcher → Shifokorga yuborish end-to-end
**Umumiy muddat**: ~8–10 hafta (28 PR × 2 kun o'rtacha; parallel ish bilan qisqaradi)

> **Bu hujjat — bosqichma-bosqich implementation rejasi.** Har PR mustaqil commit/merge qilinadi, test yozmasdan merge qilinmaydi (project rule). PR'lar dependency graph asosida paralellashtiriladi (§28).

---

## MUNDARIJA

- [1. Umumiy ko'rinish](#1-umumiy-korinish)
- [2. Fazalar qisqa ro'yxati](#2-fazalar-qisqa-royxati)
- [3. Faza 0 — Foundation (PR-01..06)](#3-faza-0--foundation-pr-0106)
- [4. Faza 1 — Backend core (PR-07..10)](#4-faza-1--backend-core-pr-0710)
- [5. Faza 2 — Backend: workflow + AI (PR-11..13)](#5-faza-2--backend-workflow--ai-pr-1113)
- [6. Faza 3 — Frontend: disease browser (PR-14..18)](#6-faza-3--frontend-disease-browser-pr-1418)
- [7. Faza 4 — Frontend: symptom matcher + shifokor (PR-19..21)](#7-faza-4--frontend-symptom-matcher--shifokor-pr-1921)
- [8. Faza 5 — CMS / moderatsiya (PR-22..24)](#8-faza-5--cms--moderatsiya-pr-2224)
- [9. Faza 6 — Kontent + sifat + launch (PR-25..28)](#9-faza-6--kontent--sifat--launch-pr-2528)
- [10. Faza 7 — Post-MVP (ixtiyoriy)](#10-faza-7--post-mvp-ixtiyoriy)
- [11. Bog'liqlik grafi](#11-bogliqlik-grafi)
- [12. DB migratsiya strategiyasi](#12-db-migratsiya-strategiyasi)
- [13. Rollback rejasi](#13-rollback-rejasi)
- [14. Test strategiyasi (umumiy)](#14-test-strategiyasi-umumiy)
- [15. CI/CD va PR konvensiyalari](#15-cicd-va-pr-konvensiyalari)
- [16. Ishga tushirishdan oldin chek-list](#16-ishga-tushirishdan-oldin-chek-list)

---

## 1. Umumiy ko'rinish

**Prinsiplar:**

1. **Atomic PR** — har PR o'z-o'zicha revert qilinadi. "PR-12 ishlamaydi" deb shikoyat bo'lsa, faqat PR-12 qaytariladi.
2. **Schema birinchi, API keyingi, UI eng oxiri** — har slice uchun Prisma → NestJS → Frontend tartibda.
3. **Backend mavjud bo'lmasa, frontend API call yozmaydi** — mock/stub lar faqat UI prototip uchun, merge'ga tushmaydi.
4. **Test yozmasdan PR merge bo'lmaydi** — unit (Jest/Vitest) + critical path uchun e2e (Playwright). Coverage xisoblanadi, lekin "majburiy min 70%" faqat MVP'dan keyin yoqiladi (hozir service-layer ≥ 70%, controller ≥ 50% MVP target).
5. **Migratsiya alohida faylda** — `server/prisma/migrations/` ichida har schema o'zgarishi alohida timestamp'li papkada (Prisma default).
6. **Feature flag** — `APP_FEATURE_DISEASE_KB` env var; prod'da to'liq tayyor bo'lgunicha `false`; staging/dev'da `true`. Release jumping uchun dinamik on/off.
7. **API versiyalash** — barcha yangi endpointlar `/api/v1/...` ichida; breaking change bo'lmasa v1 saqlanadi.

**PR naming:**
`<type>(<scope>): <qisqa tavsif>` → masalan `feat(diseases): add Disease/Symptom Prisma models (PR-02)`.

**Branch nomlanishi:** `feature/kb-<PR-raqami>-<qisqa-slug>` → `feature/kb-02-prisma-disease-models`.

---

## 2. Fazalar qisqa ro'yxati

| # | Faza | PR oralig'i | Parallellanadi | Davomiyligi (o'rtacha) |
|---|---|---|---|---|
| 0 | Foundation — repo, CLAUDE.md, Prisma schema, FTS, rollar | PR-01..06 | Cheklangan (sequential schema) | 1 hafta |
| 1 | Backend core — Diseases/Symptoms/References/Blocks CRUD + search | PR-07..10 | Ha (PR-08, 09 parallel) | 1.5 hafta |
| 2 | Backend workflow + AI — moderation, triage, auth ext | PR-11..13 | Cheklangan | 1 hafta |
| 3 | Frontend disease browser — list, card, chip, DiagnosisResults integration | PR-14..18 | Ha (PR-15, 17 parallel) | 1.5 hafta |
| 4 | Frontend symptom matcher + shifokor paneli | PR-19..21 | Cheklangan | 1 hafta |
| 5 | CMS / moderatsiya UI — editor, review queue, references | PR-22..24 | Ha (PR-22, 24 parallel) | 1 hafta |
| 6 | Kontent + sifat + launch — seed, red-flag, e2e, disclaimer | PR-25..28 | Ha (to'liq parallel) | 1 hafta |
| 7 | Post-MVP (ixtiyoriy) — PDF, i18n, chat WS, analytics | PR-29..32 | — | Keyin |

**Total MVP: PR-01..28 (28 PR), ~8 hafta.**

---

## 3. Faza 0 — Foundation (PR-01..06)

### PR-01: Repo scaffolding + CLAUDE.md + modul hujjati

**Effort**: S (0.5 kun) | **Bog'liqlik**: yo'q | **Reviewer**: tech lead

**Scope:**
- `CLAUDE.md` (root) — mavjud kod bazasi konvensiyalari, stack, `src/app/*` va `server/src/*` haqiqatiga aniqlik.
- `AGENTS.md` (root) — AI yordamchilar uchun yo'riqnoma (agar dev team uni ishlatsa).
- `docs/09-modules/disease-kb-module.md` — modul overview, §feature-analysis va §implementation-plan ga havolalar.
- `.env.example` yangilanadi — yangi env var'lar: `APP_FEATURE_DISEASE_KB`, `KB_MODERATION_QUEUE_NAME`, `KB_SEED_PATH`.

**O'zgaradigan fayllar:**
- `CLAUDE.md` (yangi)
- `AGENTS.md` (yangi, ixtiyoriy)
- `docs/09-modules/disease-kb-module.md` (yangi)
- `.env.example` (yangi yoki mavjudga qo'shish)
- `server/.env.example` (agar alohida bo'lsa)

**DB migratsiyasi:** yo'q.

**Test:**
- `docs/analysis/feature-analysis.md` va `implementation-plan.md` ichidagi ichki havolalar ishlaydi (markdown linter).
- `.env.example` + CI env validator: CI'da yo'q bo'lsa, build fails.

**Verification:**
- `grep -r "APP_FEATURE_DISEASE_KB" .env.example` muvaffaqiyat.
- GitHub'da `docs/09-modules/disease-kb-module.md` preview render bo'ladi.

**Rollback:** `git revert <commit>`. Xavfsiz, hech kimni bloklamaydi.

---

### PR-02: Prisma schema — Disease core models + FTS-ready

**Effort**: M (1 kun) | **Bog'liqlik**: PR-01 | **Reviewer**: backend + DBA

**Scope:**
Prisma schema'ga **asosiy kasallik modellari** qo'shiladi (faqat bitta migratsiya fayl — bir butun slice).

**Yangi modellar:**
- `Disease` — asosiy obyekt (id, slug unique, icd10 unique, icd11, nameUz/nameRu/nameEn/nameLat, synonyms String[], category enum, audienceLevels, severityLevels, protocolSources, updatedAt, editorId, createdAt)
- `Symptom` — lug'at (id, code, nameUz, nameRu?, nameEn?, nameLat?, category, bodyZone, severity enum, synonyms String[])
- `DiseaseSymptom` — M2M bog'lamasi (diseaseId, symptomId, weight Decimal, specificity Decimal?, sensitivity Decimal?, isRequired Boolean, isExcluding Boolean)
- `Reference` — manba (id, type enum: DOI/PUBMED/URL/WHO/PROTOCOL, citation, url?, doi?, pubmedId?, whoCode?, publishedAt?, accessedAt, evidenceLevel enum A/B/C/D)
- `DiseaseReference` — M2M (diseaseId, referenceId, blockMarker?, note?) — manba qaysi blokga tegishli.

**Yangi enumlar:**
- `ApprovalStatus` — `DRAFT, REVIEW, APPROVED, PUBLISHED, REJECTED, ARCHIVED`
- `EvidenceLevel` — `A, B, C, D`
- `ContentLevel` — `L1, L2, L3`
- `AudienceMode` — `PATIENT, STUDENT, NURSE, DOCTOR, SPECIALIST, MIXED`
- `DiseaseSeverity` — `MILD, MODERATE, SEVERE`
- `SymptomSeverity` — `MILD, MODERATE, SEVERE, CRITICAL`
- `ReferenceType` — `DOI, PUBMED, URL, WHO, PROTOCOL, BOOK, LOCAL_PROTOCOL`

**Indekslar:**
- `Disease.slug @unique`
- `Disease.icd10 @unique`
- `Disease.category` (filter uchun)
- `Disease.updatedAt` (lifecycle uchun)
- `DiseaseSymptom @@unique([diseaseId, symptomId])`
- `Symptom.code @unique`
- `Reference.doi @unique` (nullable)

**O'zgaradigan fayllar:**
- `server/prisma/schema.prisma` (modellar va enum'lar)
- `server/prisma/migrations/<timestamp>_add_disease_core/migration.sql` (auto-generated by `prisma migrate dev`)
- `server/src/common/types/disease.types.ts` (Prisma-generated types re-export)

**DB migratsiyasi:** `<timestamp>_add_disease_core` — bitta migratsiya fayli, barcha modellar + enumlar + indekslar.

**Test:**
- `server/test/prisma.spec.ts` — migratsiyani apply qilib, har modeldan 1 ta seed yaratib o'chirib tekshiradi (`create`, `findUnique`, `delete` smoke). Prisma schema validation (`prisma format` + `prisma validate`).
- CI: `prisma migrate reset --force && prisma migrate deploy && prisma generate` muvaffaqiyatli.

**Verification:**
- `pnpm prisma studio` — yangi jadvallar ko'rinadi.
- `server/openapi.json` regenerate — hozircha o'zgarmaydi (API yo'q).

**Rollback:**
- Migratsiyani bekor qilish: `prisma migrate resolve --rolled-back <migration-name>` (dev) yoki **yangi migratsiya** `<timestamp>_revert_disease_core` DROP TABLE barcha yangi jadvallar (prod).
- Prod'da har doim **yangi revert migration** + `git revert`, **hech qachon** eski migratsiyani o'chirmaslik (audit trail buziladi).
- Data yo'qotish: yo'q (hali hech qanday kontent yo'q).

---

### PR-03: Prisma schema — Blocks, Stages, Meds, LabTests, Cases

**Effort**: M (1 kun) | **Bog'liqlik**: PR-02 | **Reviewer**: backend

**Scope:**
Kontent va klinik detallar modeli.

**Yangi modellar:**
- `DiseaseBlock` — blok (id, diseaseId, marker String (canonical id `etiology`, `pathogenesis` va h.k.), label String (display sinonim variantidan tanlangan), level enum L1/L2/L3, orderIndex Int, audiencePriority Json ({patient: 1, doctor: 2, ...}), contentMd Text (markdown + `{{markers}}`), contentJson Json? (jadvallar, diagramalar uchun), translationStatus enum per til, evidenceLevel enum, status enum ApprovalStatus, lastEditedBy Int, lastEditedAt, publishedAt?)
- `DiseaseStage` — bosqich (id, diseaseId, stageType enum EARLY/EXPANDED/LATE, orderIndex, titleUz, descriptionMd, imageKey String? Supabase storage key, clinicalSigns String[])
- `DiseaseMedication` — dori bog'lamasi (id, diseaseId, medicineId FK Medicine mavjud, group String ("NSAID","DMARD"), averageDose String, dosageNotes Text?, contraindications Text?, interactions Json?, evidenceLevel, audienceVisibility enum — BEMOR bo'lsa yashirin default, DOCTOR ochiq)
- `DiseaseLabTest` — tahlil bog'lamasi (id, diseaseId, labTestId FK LabTest mavjud, loincCode String?, priority enum MINIMUM/EXTENDED, fastingRequired Boolean, timingNotes String?)
- `ClinicalCase` — klinik holat (id, diseaseId, anonymousId String, ageRange String, gender enum Gender, anamnesisMd Text, diagnosisResultMd Text, treatmentMd Text, outcomeMd Text, publishedBy Int, publishedAt, consentObtained Boolean default false)

**Yangi enumlar:**
- `StageType` — `EARLY, EXPANDED, LATE`
- `MedicationVisibility` — `PATIENT, STUDENT, DOCTOR` (default: `DOCTOR`)
- `LabTestPriority` — `MINIMUM, EXTENDED`
- `TranslationStatus` — `AUTO, REVIEWED, VERIFIED, PENDING` (per til)

**Kengaytirilgan mavjud modellar:**
- `Medicine` (mavjud) ga — `rxnormCode String?`, `innName String?` (agar yo'q bo'lsa)
- `LabTest` (mavjud) ga — `loincCode String?`

**O'zgaradigan fayllar:**
- `server/prisma/schema.prisma`
- `server/prisma/migrations/<timestamp>_add_disease_content/migration.sql`

**Test:**
- `server/test/prisma-blocks.spec.ts` — `Disease` + 3 ta `DiseaseBlock` yaratish, tartibni tekshirish, cascade delete.
- Prisma validation.

**Verification:** `prisma studio` da yangi jadvallar.

**Rollback:** Yangi revert migration `DROP` barcha yangi jadvallar. `Medicine.rxnormCode` / `LabTest.loincCode` nullable, revert uchun `ALTER TABLE DROP COLUMN`.

---

### PR-04: Prisma schema — Operational models (notes, sessions, audit)

**Effort**: M (1 kun) | **Bog'liqlik**: PR-03 | **Reviewer**: backend

**Scope:**
Bemor/sessiya, audit, mintaqaviy statistika.

**Yangi modellar:**
- `UserDiseaseNote` — bemor izohi kasallik bo'yicha (id, userId, diseaseId, noteMd Text?, savedAt, symptomAnswers Json? — qaysi simptomlarni ha/yo'q deb belgilagan)
- `SymptomMatchSession` — AI Tavsiya'dan card'ga o'tilganda yaratiladi (id, userId?, anonymousId?, aiTriageSessionId? — mavjud AI session'ga bog'lanadi, diseaseId, matchScore Decimal, matchedSymptoms Json, missingSymptoms Json, userAnswers Json per symptom (`YES/NO/UNKNOWN/SOMETIMES`), status enum ACTIVE/SENT_TO_DOCTOR/EXPIRED/ARCHIVED, sentToDoctorId? FK User, createdAt, updatedAt, expiresAt — 7 kun TTL)
- `AITriageSession` — agar hali yo'q bo'lsa; mavjud `draftSymptom`/`SymptomConsultation` tiplari frontenddagi analog (backendda hali yo'q, PR-07'dan oldin tekshir)
- `DiseaseEditLog` — har kontent o'zgarishi (id, diseaseId, blockId?, editorId, editType enum (CREATE/UPDATE/DELETE/STATUS_CHANGE), diffJson Json, createdAt). Mavjud `AuditEvent` — umumiy auditga qo'shimcha, KB specific.
- `RegionEpidemiology` — (id, diseaseId, region String ("UZ","UZ-TO","global"), prevalence Decimal?, incidence Decimal?, mortality Decimal?, sourceRefId FK Reference?, period String (masalan "2023"))
- `DiseaseSpecialty` — M2M Doctor mutaxassis kasallik ixtisosligi (doctorId, diseaseId) — yoki kengaytirilgan: `DoctorProfile` ga `specializesInDiseases Disease[]` many-to-many (Prisma explicit relation table auto-generates).

**SymptomAnswer enum:** `YES, NO, UNKNOWN, SOMETIMES`

**O'zgaradigan fayllar:**
- `server/prisma/schema.prisma`
- `server/prisma/migrations/<timestamp>_add_disease_operations/migration.sql`

**Test:**
- `server/test/prisma-ops.spec.ts` — Session yaratish, TTL expiry logic (service layer, PR-12 da), cascade delete tekshiruvi.

**Verification:** `prisma studio` + `SELECT COUNT(*)` har jadval.

**Rollback:** Yangi revert migration. PHI data bo'lishi mumkin (`UserDiseaseNote`, `SymptomMatchSession`) — **rollback'dan oldin data export qilish** (`pg_dump` specific tables).

---

### PR-05: UserRole enum — new roles (STUDENT, NURSE, EDITOR, MEDICAL_EDITOR)

**Effort**: S (0.5 kun) | **Bog'liqlik**: PR-01 (parallel with PR-02..04) | **Reviewer**: backend + security

**Scope:**
`UserRole` enum'iga 4 ta yangi qiymat qo'shiladi. Postgres `ALTER TYPE ... ADD VALUE` — **alohida transaksiyada**, commit'dan oldin ishlatilmaydi.

**Diqqat:** Postgres'da `ADD VALUE` qayta ko'rib chiqish kerak — bir transaksiyada `ADD VALUE` + qiymatni ishlatish ishlamaydi. Shuning uchun:
- Birinchi migratsiya — faqat enum qiymatlari qo'shiladi.
- Keyingi PR'larda bu qiymatlar ishlatiladi.

**O'zgaradigan fayllar:**
- `server/prisma/schema.prisma` (enum UserRole ga qo'shish)
- `server/prisma/migrations/<timestamp>_add_user_roles/migration.sql` — faqat `ALTER TYPE "UserRole" ADD VALUE 'STUDENT'; ...`
- `server/src/auth/roles.decorator.ts` (agar mavjud bo'lsa — yangi rollar enum import)
- `server/src/auth/roles.guard.ts` — yangi rollarga default-deny policy

**Test:**
- `server/test/auth/roles.spec.ts` — `@Roles(UserRole.EDITOR)` dekorator bilan endpoint; `EDITOR` token orqali 200, `PATIENT` orqali 403.

**Verification:** `psql "\dT+ \"UserRole\""` yangi qiymatlar ko'rinadi.

**Rollback:** Postgres'da `DROP VALUE` mavjud emas. **Rollback qilish qiyin** — qayta yaratish kerak yoki qiymatni `DEPRECATED` deb belgilash. Shuning uchun bu migratsiya — irreversible considered. Production'ga tushirishdan oldin diqqat bilan review.

---

### PR-06: Postgres FTS + pg_trgm + tsvector indexes

**Effort**: M (1 kun) | **Bog'liqlik**: PR-02 | **Reviewer**: backend + DBA

**Scope:**
Qidiruv uchun FTS setup:
- `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
- `CREATE EXTENSION IF NOT EXISTS unaccent;`
- `Disease` jadvaliga `search_vector tsvector GENERATED ALWAYS AS (...) STORED` — nom, sinonim, ICD10 bo'yicha.
- `CREATE INDEX idx_disease_search ON "Disease" USING GIN(search_vector);`
- `Symptom` ham xuddi shunday.

**O'zgaradigan fayllar:**
- `server/prisma/migrations/<timestamp>_add_fts_indexes/migration.sql` (raw SQL — Prisma schema'da tsvector ifodasi yo'q, lekin `Unsupported("tsvector")` bilan schema'da ham belgilanadi)
- `server/prisma/schema.prisma` — `Disease.searchVector Unsupported("tsvector")?`

**Test:**
- `server/test/prisma-fts.spec.ts` — 3 ta Disease seed, `$queryRaw` bilan FTS query, xato kuzatilmasa success.

**Verification:** `psql` da:
```sql
SELECT name_uz, ts_rank(search_vector, plainto_tsquery('simple', 'gipert')) AS rank
FROM "Disease"
WHERE search_vector @@ plainto_tsquery('simple', 'gipert')
ORDER BY rank DESC;
```

**Rollback:** `DROP INDEX idx_disease_search; ALTER TABLE ... DROP COLUMN search_vector; DROP EXTENSION pg_trgm;` — yangi revert migration.

---

## 4. Faza 1 — Backend core (PR-07..10)

### PR-07: DiseasesModule — CRUD + list + search

**Effort**: L (2–3 kun) | **Bog'liqlik**: PR-02, PR-06 | **Reviewer**: backend + product

**Scope:**
NestJS modul `DiseasesModule`:
- `DiseasesController`:
  - `GET /api/v1/diseases` — list/search (query: `q`, `icd`, `category`, `page`, `limit`, `audience`, `locale`; public — `published` only; admin — barcha status)
  - `GET /api/v1/diseases/:slug` — single disease + blocks (populated L1 default, query `?level=L1|L2|L3`)
  - `GET /api/v1/icd/:code` — ICD kod bo'yicha redirect/fetch (returns `{slug}` → 301 redirect frontend'da)
  - `POST /api/v1/diseases` — yaratish (Roles: EDITOR, MEDICAL_EDITOR, ADMIN)
  - `PATCH /api/v1/diseases/:id` — yangilash
  - `DELETE /api/v1/diseases/:id` — soft delete (status=ARCHIVED)
- `DiseasesService` — FTS search (`pg_trgm` similarity + tsvector rank), slug generation (nom + icd10), audit log write.
- `DiseasesRepository` — Prisma wrapper.
- DTO: `CreateDiseaseDto`, `UpdateDiseaseDto`, `DiseaseListQueryDto`, `DiseaseResponseDto` (Swagger + class-validator).
- Swagger decorators — `openapi.json` ga kiradi.

**O'zgaradigan fayllar:**
- `server/src/diseases/diseases.module.ts` (yangi)
- `server/src/diseases/diseases.controller.ts`
- `server/src/diseases/diseases.service.ts`
- `server/src/diseases/diseases.repository.ts`
- `server/src/diseases/dto/*.ts` (5+ fayllar)
- `server/src/diseases/tests/diseases.service.spec.ts`
- `server/src/diseases/tests/diseases.controller.spec.ts`
- `server/src/app.module.ts` — `DiseasesModule` import

**DB migratsiyasi:** yo'q (PR-02/06 da bor).

**Test:**
- Unit (`diseases.service.spec.ts`): `search()` FTS query, `create()` slug auto-gen, RBAC enforcement.
- Integration (`diseases.controller.spec.ts`): Supertest + in-memory Postgres (`@testcontainers/postgresql`) — `GET /diseases?q=gipert` topadi, `POST` as PATIENT → 403, as EDITOR → 201.
- Coverage target: service ≥ 75%, controller ≥ 60%.

**Verification:**
- `pnpm start:dev` + `curl http://localhost:3000/api/v1/diseases?q=gipert` → JSON qaytaradi.
- Swagger UI (`/api/docs`) da yangi tags `Diseases`.

**Rollback:** `git revert`. Data yo'qotish yo'q (faqat service qatlami). Migratsiya tegmaydi.

---

### PR-08: SymptomsModule — CRUD + search

**Effort**: M (1–2 kun) | **Bog'liqlik**: PR-02 | **Reviewer**: backend | **Paralel**: PR-09, PR-10

**Scope:**
`SymptomsModule` — simptomlar lug'at CRUD + sinonim bo'yicha qidiruv.

**Endpointlar:**
- `GET /api/v1/symptoms` — list + search
- `GET /api/v1/symptoms/:id`
- `POST /api/v1/symptoms` (EDITOR+)
- `PATCH /api/v1/symptoms/:id`
- `GET /api/v1/diseases/:slug/symptoms` — kasallik simptomlari (weight bilan)

**O'zgaradigan fayllar:** `server/src/symptoms/*` (similar struktura).

**Test:** Unit + integration, xuddi PR-07 kabi.

**Verification:** `curl /api/v1/symptoms?q=bosh` → bosh og'rig'i va sinonimlarini topadi.

**Rollback:** `git revert`.

---

### PR-09: ReferencesModule — manbalar va DOI/PubMed validation

**Effort**: M (1 kun) | **Bog'liqlik**: PR-02 | **Reviewer**: backend | **Paralel**: PR-08, PR-10

**Scope:**
Manba boshqaruvi. DOI/PubMed ID formati regex validation (DOI: `^10\.\d{4,9}/[-._;()/:A-Z0-9]+$`); URL fetch validation ixtiyoriy (Faza 2 — live URL check cron).

**Endpointlar:**
- `GET /api/v1/references` — search/list
- `POST /api/v1/references` (EDITOR+)
- `PATCH /api/v1/references/:id`
- `DELETE /api/v1/references/:id` (agar hech qaysi blokka bog'langan bo'lmasa)

**O'zgaradigan fayllar:** `server/src/references/*`.

**Test:** DOI validation regex tests, integration create/list.

**Verification:** Invalid DOI → 422 ValidationError.

**Rollback:** `git revert`.

---

### PR-10: DiseaseBlocksModule — blok CRUD per kasallik

**Effort**: L (2 kun) | **Bog'liqlik**: PR-03, PR-07 | **Reviewer**: backend | **Paralel**: PR-08, PR-09

**Scope:**
Blok boshqaruvi:
- `GET /api/v1/diseases/:slug/blocks` — barcha bloklar (audience filter)
- `GET /api/v1/diseases/:slug/blocks/:marker` — bitta blok (lazy-load uchun)
- `POST /api/v1/diseases/:slug/blocks` (EDITOR+)
- `PATCH /api/v1/diseases/:slug/blocks/:id`
- `DELETE /api/v1/diseases/:slug/blocks/:id`
- `POST /api/v1/diseases/:slug/blocks/:id/references` — manba bog'lash
- `GET /api/v1/markers` — canonical marker katalog (static data yoki DB)

**O'zgaradigan fayllar:** `server/src/disease-blocks/*`, `server/src/diseases/markers/markers.ts` (canonical 38 ta marker id + label variantlari).

**Test:** Unit — marker validation (faqat canonical enum'dan), audience_priority schema. Integration — blok yaratib, status=REVIEW qo'yib, public endpointda ko'rinmasligini tasdiqlash.

**Verification:** `curl /api/v1/diseases/gipertoniya-i10/blocks` → L1 bloklar json array.

**Rollback:** `git revert`.

---

## 5. Faza 2 — Backend: workflow + AI (PR-11..13)

### PR-11: KBModerationModule — draft→review→approved→published workflow + BullMQ

**Effort**: L (2–3 kun) | **Bog'liqlik**: PR-10, PR-05 | **Reviewer**: backend + product

**Scope:**
Moderatsiya workflow. BullMQ queue `kb-moderation` yaratiladi (mavjud `jobs` modulidan foydalaniladi).

**State machine:**
```
DRAFT → REVIEW → APPROVED → PUBLISHED
   ↖       ↓
    REJECTED ← REVIEW
APPROVED → (admin) → PUBLISHED
PUBLISHED → ARCHIVED (soft delete)
```

**Endpointlar:**
- `POST /api/v1/kb/blocks/:id/submit-review` — EDITOR: DRAFT → REVIEW
- `POST /api/v1/kb/blocks/:id/approve` — MEDICAL_EDITOR: REVIEW → APPROVED (+ imzo log)
- `POST /api/v1/kb/blocks/:id/reject` — MEDICAL_EDITOR: REVIEW → REJECTED (+ sabab)
- `POST /api/v1/kb/blocks/:id/publish` — ADMIN: APPROVED → PUBLISHED
- `POST /api/v1/kb/blocks/:id/archive` — ADMIN: * → ARCHIVED
- `GET /api/v1/kb/review-queue` — MEDICAL_EDITOR: REVIEW statusli barcha bloklar
- `GET /api/v1/kb/history/:blockId` — audit log (`DiseaseEditLog`)

**BullMQ jobs:**
- `kb.notify_review_needed` — `REVIEW` statusga o'tganda MEDICAL_EDITOR'larga notification
- `kb.notify_approved` — EDITOR'ga "approved" xabari
- `kb.lifecycle_refresh` — cron 12 oyda bir marta, `publishedAt > 12 months ago` bloklarga `needs_refresh=true` flag

**Notifications (mavjud modul):**
- Yangi notification event turlari: `kb.review_requested`, `kb.approved`, `kb.rejected`, `kb.published`.

**O'zgaradigan fayllar:**
- `server/src/kb-moderation/*` (modul)
- `server/src/jobs/processors/kb-moderation.processor.ts`
- `server/src/notifications/notifications.service.ts` — yangi event typelar

**Test:**
- Unit — state machine (transition matrix, invalid transition → error).
- Integration — EDITOR submit-review → BullMQ job queued → MEDICAL_EDITOR notification keladi.
- e2e (Jest+supertest, Playwright emas) — full workflow: create draft → submit → approve → publish → public endpointda ko'rinadi.

**Verification:**
- Manual: `curl` bilan EDITOR token → submit, MEDICAL_EDITOR token → approve, public `/diseases/:slug/blocks/:marker` → yangi kontent ko'rinadi.
- BullMQ dashboard (`@bull-board/express` ixtiyoriy).

**Rollback:** `git revert`. Queue job'lar halted (drain first). Audit log qoladi.

---

### PR-12: Triage/SymptomMatchingModule — match endpoint + FHIR export

**Effort**: XL (3–4 kun) | **Bog'liqlik**: PR-07, PR-08, PR-11 | **Reviewer**: backend + clinical

**Scope:**
Symptom match engine (server-side autoritativ), FHIR-style JSON export.

**Endpointlar:**
- `POST /api/v1/triage/match` — body: `{userSymptoms: [{code, answer: YES/NO/UNKNOWN/SOMETIMES}], diseaseId?}`. Agar `diseaseId` berilmasa — barcha public kasalliklarga nisbatan top-10. Agar berilgan — shu kasallik simptomlari bilan solishtiradi, match score qaytaradi. Yangi `SymptomMatchSession` yaratiladi.
- `POST /api/v1/triage/sessions/:id/update` — foydalanuvchi ha/yo'q'larini yangilaydi, score qayta hisoblanadi.
- `POST /api/v1/triage/sessions/:id/send-to-doctor` — FHIR-style JSON `QuestionnaireResponse` struktura yaratadi, doctorId ga notification + message.
- `GET /api/v1/triage/sessions/:id` — session snapshot (owner yoki shifokor).
- `POST /api/v1/triage/sessions/:id/save-note` — `UserDiseaseNote` yaratish.

**Match algoritmi (MVP):**
```
score = sum(weight * answerMultiplier) / sum(allWeights)
answerMultiplier:
  YES       → 1.0
  SOMETIMES → 0.5
  UNKNOWN   → 0.0 (neutral)
  NO        → -0.5 (excluding)
Red-flag bonus: agar red-flag symptom YES → score += 0.2
Excluding: agar isExcluding=true symptom YES → score *= 0.5
```

**FHIR-style response (MVP — naming only):**
```json
{
  "resourceType": "QuestionnaireResponse",
  "status": "completed",
  "subject": { "reference": "Patient/{userId}" },
  "questionnaire": "Disease/{diseaseId}/symptoms",
  "item": [
    { "linkId": "symptom_headache", "text": "Bosh og'rig'i", "answer": [{"valueCoding": {"code": "YES"}}] }
  ],
  "meta": {
    "matchScore": 0.78,
    "matchedSymptoms": 15,
    "totalSymptoms": 20,
    "diseaseSlug": "gipertoniya-i10"
  }
}
```

**O'zgaradigan fayllar:**
- `server/src/triage/*` (modul)
- `server/src/common/fhir/questionnaire-response.builder.ts` (serializer)
- `server/src/messages/messages.service.ts` — `sendTriageResult` metodi (chat'ga xabar qo'shish)
- `server/src/notifications/*` — yangi event `triage.sent_to_doctor`

**Test:**
- Unit — match algoritmi edge case (barcha UNKNOWN → 0; barcha YES → max; NO excluding → logic); FHIR builder snapshot test.
- Integration — session create → update → send-to-doctor (transaction: session status, message, notification birga commit).
- Coverage ≥ 75%.

**Verification:** Manual — Postman collection bilan full flow. Shifokor panelida (hozircha UI yo'q, faqat API) xabar keladi.

**Rollback:** `git revert`. Session data bo'lishi mumkin — rollback'dan oldin export. `UserDiseaseNote` — PHI, extra care.

---

### PR-13: Auth extensions — role guards + MFA skeleton (ixtiyoriy MVP uchun)

**Effort**: M (1 kun) | **Bog'liqlik**: PR-05 | **Reviewer**: backend + security

**Scope:**
- `@Roles()` dekorator EDITOR/MEDICAL_EDITOR/STUDENT/NURSE rollariga kengaytirilishi
- MFA skeleton — MFA endpoint (`POST /auth/mfa/enable`, `/mfa/verify`), lekin MVP'da faqat MEDICAL_EDITOR va ADMIN uchun optional (majburiy emas). Faza 2 da majburiy.
- Session refresh behavior unchanged.

**O'zgaradigan fayllar:**
- `server/src/auth/roles.guard.ts`
- `server/src/auth/mfa/*` (yangi modul, ixtiyoriy — PR'ni qisqartirish uchun skip qilinishi mumkin)
- `server/src/auth/dto/*`

**Test:** Integration — yangi rollar bilan endpoint access test.

**Verification:** Smoke test — har rol token yaratib, kerakli/kerakli bo'lmagan endpointlarga kirish.

**Rollback:** `git revert`. MFA enrolled foydalanuvchilar — fallback SMS OTP.

---

## 6. Faza 3 — Frontend: disease browser (PR-14..18)

### PR-14: FE types + API client — backend sync

**Effort**: M (1–2 kun) | **Bog'liqlik**: PR-07, PR-10 | **Reviewer**: frontend

**Scope:**
- `src/app/types/api/` — backend DTO'larga mos TypeScript tiplar (manual sync yoki OpenAPI codegen — MVP'da manual).
- `src/app/api/diseases.ts` — fetch wrappers (`listDiseases`, `getDisease`, `searchDiseases`, `getBlocks`, etc.)
- `src/app/api/symptoms.ts`
- `src/app/api/triage.ts`
- Mavjud `src/app/types/index.ts` KBDisease — `DEPRECATED` marked, yangi `DiseaseDto` ishlatiladi. Asta-sekin migratsiya.
- `src/app/hooks/useDiseases.ts` — React Query (`@tanstack/react-query` — yangi kutubxona) hooks.

**Yangi kutubxona:** `@tanstack/react-query` — yangi. MVP boshida qo'shiladi (cache, retry, background refetch).

**O'zgaradigan fayllar:**
- `src/app/types/api/disease.ts`, `symptom.ts`, `triage.ts` (yangi)
- `src/app/api/http.ts` (agar mavjud bo'lmasa, axios instance)
- `src/app/api/diseases.ts`, `symptoms.ts`, `triage.ts`
- `src/app/hooks/useDiseases.ts`, etc.
- `src/app/main.tsx` — `QueryClientProvider` wrap
- `package.json` — `@tanstack/react-query` qo'shiladi

**Test:**
- Vitest setup (agar yo'q bo'lsa — **yangi kerak**, bu PR'ning bir qismi). `src/test/setup.ts`, `vitest.config.ts`.
- Unit — API client mock responses (`msw` — Mock Service Worker yangi kutubxona).
- Hook test — `useDiseasesList` `renderHook` bilan, loading/success/error states.

**Verification:** `pnpm test` yangi testlar o'tadi.

**Rollback:** `git revert`. Mavjud `clinicalKB.ts` mock saqlanadi fallback sifatida.

---

### PR-15: `/diseases` list page + search + filter

**Effort**: L (2 kun) | **Bog'liqlik**: PR-14 | **Reviewer**: frontend + UX | **Paralel**: PR-17

**Scope:**
Yangi public sahifa — kasalliklar katalog, qidiruv, kategoriya filter.

**Komponentlar:**
- `src/app/pages/diseases/DiseaseListPage.tsx`
- `src/app/components/diseases/DiseaseSearchBar.tsx` — debounced input, ICD-10/nom/sinonim
- `src/app/components/diseases/DiseaseCategoryFilter.tsx` — pills/chips (Nevrologik, Kardiologik, ...)
- `src/app/components/diseases/DiseaseListItem.tsx` — kartochka (nom, ICD10, qisqa description, bosqichlar chip)
- Pagination infinite-scroll yoki load-more.

**Route:**
- `/diseases` — yangi, `App.tsx` ga qo'shilishi (React Router v7)
- `SCREEN_TO_PATH` dict'ga qo'shiladi

**O'zgaradigan fayllar:**
- `src/app/pages/diseases/*`
- `src/app/components/diseases/*`
- `src/app/App.tsx` (route)
- `src/app/context/NavigationContext.tsx` (agar screen enum'ga qo'shilsa)

**Test:**
- Vitest unit — komponent rendering, search debounce (fake timers).
- Playwright e2e (smoke) — `/diseases` ga kirib, "gipert" yozib, natija ko'rish.

**Verification:** Browser'da `http://localhost:5173/diseases` ochilib, qidiruv ishlaydi.

**Rollback:** `git revert`. Route olib tashlanadi, eski ekranlarga ta'sir yo'q.

---

### PR-16: `/diseases/:slug` Disease Card — to'liq karta renderer

**Effort**: XL (3–4 kun) | **Bog'liqlik**: PR-14, PR-15 | **Reviewer**: frontend + UX + medical editor

**Scope:**
Universal kasallik kartasi sahifasi.

**Komponentlar:**
- `src/app/pages/diseases/DiseaseCardPage.tsx` — main
- `src/app/components/diseases/DiseaseCardHero.tsx` — yuqori panel (nom, ICD10 chip, sinonim, AudienceSwitcher, completeness bar, "Oxirgi yangilanish")
- `src/app/components/diseases/AudienceSwitcher.tsx` — Bemor/Talaba/Shifokor/Mutaxassis toggle
- `src/app/components/diseases/TableOfContents.tsx` — sticky sidebar (desktop) / drawer (mobile)
- `src/app/components/diseases/BlockRenderer.tsx` — marker asosida tegishli komponentni ko'rsatadi (markdown, jadval, stepper, h.k.)
- `src/app/components/diseases/blocks/` — har marker turi uchun sub-komponentlar: `MarkdownBlock`, `StagesStepper`, `MedicationTable` (bemor rejimida collapsed), `ClinicalCaseCard`, `ReferenceList`, `SymptomsList`, `MediaGallery`, `EmergencyBanner`.
- `src/app/components/diseases/CompletenessBar.tsx` — L1/L2/L3 progress.
- `src/app/components/ui/Callout.tsx` — yangi (shadcn/ui tarzida).
- `src/app/components/ui/Chip.tsx` — mavjud badge bilan to'qnashmay yangi yoki ishlatilgan.

**Marker templating parser:**
- `src/app/lib/marker-parser.ts` — `{{marker}}` ni real qiymat bilan almashtiradi (fallback, format, audience, locale modifikatorlari).

**SEO:**
- `react-helmet-async` — title, description, og:*, JSON-LD `MedicalCondition`.

**O'zgaradigan fayllar:** 20+ yangi fayl. `DiagnosisResults.tsx` (PR-18 da) bog'lanadi.

**Test:**
- Vitest unit — BlockRenderer har marker turi uchun snapshot.
- Playwright — `/diseases/gipertoniya-i10` ga kirib, Hero, TOC, bloklar ko'rinishini tekshirish; AudienceSwitcher bosib blok tartibi o'zgarishini ko'rish.
- axe-core a11y check — 0 critical.

**Verification:**
- Manual: card ochilib to'liq render bo'ladi, SEO meta tags `view-source` da ko'rinadi, schema.org validator o'tadi.

**Rollback:** `git revert`. `/diseases/:slug` route olib tashlanadi, PR-15 list page mavjud bo'lsa ham, link'lar 404 — lekin bu PR revertdan oldin PR-18 revert qilish tavsiya (DiagnosisResults link'lari).

---

### PR-17: Cross-module DiseaseChip + modal preview

**Effort**: M (1–2 kun) | **Bog'liqlik**: PR-14 | **Reviewer**: frontend | **Paralel**: PR-15, PR-16

**Scope:**
Boshqa modullardan (EMR, prescription, chat, anamnez) kasallikni chaqirish uchun embed komponent.

**Komponentlar:**
- `src/app/components/diseases/DiseaseChip.tsx` — `<DiseaseChip icd="I10" />` → chip render (nom + ICD10), bosilganda modal preview.
- `src/app/components/diseases/DiseaseModalPreview.tsx` — kichik modal (Hero + 2-3 asosiy blok (Umumiy, Simptomlar) + "To'liq ochish" CTA `/diseases/:slug`).

**Mavjud ekranlarga embed:**
- `src/app/components/screens/patient/DiagnosisResults.tsx` — diagnoz itemlari endi `DiseaseChip` wrapper ishlatadi (yoki to'g'ridan-to'g'ri navigate, PR-18).
- Boshqa joylar (EMR, prescription, radiolog conclusion) — keyingi fazalarda.

**Test:** Vitest unit — Chip render, modal open/close, deep link.

**Verification:** Diagnoz natija ekranida kasallik nomi bosilib, modal ochiladi.

**Rollback:** `git revert`. Chip'lar olib tashlanadi.

---

### PR-18: DiagnosisResults ↔ Disease card navigation + symptom match context

**Effort**: M (1–2 kun) | **Bog'liqlik**: PR-16, PR-17 | **Reviewer**: frontend + product

**Scope:**
Mavjud `DiagnosisResults.tsx` ni disease card bilan ulash:
- Har disease item bosilganda `/diseases/:slug?session=<triageSessionId>&from=ai-tavsiya` ga navigate.
- Triage session context pass qilinadi (qaysi simptomlar kiritilgan).
- Disease card'da yuqorida banner: "Siz kiritgan N ta simptomdan M tasi mos keladi" (API call `/api/v1/triage/match?diseaseId=X&session=Y`).
- "Meni tekshirib ko'ring" CTA button ko'rinadi (PR-19 da funksional bo'ladi).

**O'zgaradigan fayllar:**
- `src/app/components/screens/patient/DiagnosisResults.tsx` (navigate logic)
- `src/app/pages/diseases/DiseaseCardPage.tsx` — `session` query param'ni o'qib banner render
- `src/app/components/diseases/SymptomMatchBanner.tsx` (yangi)

**Test:**
- Vitest — URL param parsing, banner render logic.
- Playwright e2e — AI Tavsiya simptom kirit → natija → kasallik bosish → card'da banner ko'rinadi.

**Verification:** Full flow manual test.

**Rollback:** `git revert`. `DiagnosisResults.tsx` eski behavior'ga qaytadi.

---

## 7. Faza 4 — Frontend: symptom matcher + shifokor (PR-19..21)

### PR-19: SymptomMatcherSheet — 4-chip interactive matcher

**Effort**: L (2–3 kun) | **Bog'liqlik**: PR-16, PR-12 | **Reviewer**: frontend + UX + clinical

**Scope:**
TZ §14.3 bo'yicha symptom taqqoslash UX.

**Komponentlar:**
- `src/app/components/diseases/SymptomMatcherSheet.tsx` — bottom sheet (mobile, `vaul` kutubxonasi yoki shadcn Drawer) / side drawer (desktop, shadcn Sheet)
- `src/app/components/diseases/SymptomChipRow.tsx` — bitta simptom qatori, 4 ta chip (Ha/Yo'q/Bilmayman/Ba'zan), rang kodi
- `src/app/components/diseases/MatchScoreIndicator.tsx` — real-time % (animated progress)
- `src/app/components/diseases/MatchDiffSummary.tsx` — yakunlangan ro'yxat (mos/mos emas/noaniq)
- `src/app/hooks/useSymptomMatcher.ts` — state machine, debounced API call to `/triage/sessions/:id/update`

**Interactions:**
- Chip bosilganda — local state yangilanadi → 300ms debounce → API POST — score refresh.
- Optimistic UI: score darhol ko'rinadi.

**Test:**
- Vitest unit — reducer logic, score hisoblash (match backend algoritmi bilan ±0.01).
- Playwright — sheet ochish, chip bosish, score o'zgarishini tekshirish.

**Verification:** Real disease card'da sheet ochilib ishlaydi.

**Rollback:** `git revert`. Sheet olib tashlanadi, "Meni tekshirib ko'ring" button no-op bo'ladi.

---

### PR-20: "Shifokorga yuborish" CTA + FHIR-style export + consent

**Effort**: M (1–2 kun) | **Bog'liqlik**: PR-19 | **Reviewer**: frontend + legal + clinical

**Scope:**
- `src/app/components/diseases/SendToDoctorDialog.tsx` — shifokorni tanlash (mavjud doctor list API), anonim/ochiq tanlash, "Roziman" checkbox (consent), yuborish.
- API call: `POST /api/v1/triage/sessions/:id/send-to-doctor`.
- Success — toast "Yuborildi", link `/chat/:doctorId`.
- "Saqlash (profilga)" CTA — `POST /triage/sessions/:id/save-note`.
- "PDF" CTA — hozir `disabled` + "Tez orada" (PR-29 da real).

**O'zgaradigan fayllar:**
- `src/app/components/diseases/SendToDoctorDialog.tsx`
- `src/app/components/diseases/SymptomMatcherSheet.tsx` — CTA lar integratsiya
- `src/app/pages/profile/MyDiseasesPage.tsx` — "Mening kasalliklarim" sahifa (minimal MVP)

**Test:**
- Vitest — dialog flow, consent required.
- Playwright — full flow AI Tavsiya → card → matcher → send-to-doctor → toast → chat ekran.

**Verification:** Manual full user journey.

**Rollback:** `git revert`.

---

### PR-21: Doctor panel — Incoming Case Panel

**Effort**: M (2 kun) | **Bog'liqlik**: PR-20 | **Reviewer**: frontend + clinical

**Scope:**
Shifokor dashboardida yangi xabar turi — "Yangi symptom match case".

**Komponentlar:**
- `src/app/components/screens/doctor/IncomingCasePanel.tsx` — AI top-5 + bemor javoblari (yashil/kulrang/sariq), disease card havolasi.
- `src/app/components/screens/doctor/SymptomAnswerGroupedList.tsx` — Ha (yashil) / Yo'q (kulrang) / Bilmayman (sariq) / Ba'zan (havorang).
- `src/app/components/screens/doctor/TriageActionBar.tsx` — "Diagnoz tasdiqlash", "Rad etish", "Qo'shimcha savol" (chat'ga redirect).

**Mavjud `DoctorDashboard.tsx` ga yangi tab — "Keluvchi murojaatlar".**

**Test:**
- Vitest — render; action buttons wire to API (mocked).
- Playwright e2e — shifokor logini → dashboard → incoming case ochish → disease cardga havola.

**Verification:** PR-20 yuborilgan case shu panelda ko'rinadi.

**Rollback:** `git revert`. Doctor dashboard eski tabs bilan qoladi.

---

## 8. Faza 5 — CMS / moderatsiya (PR-22..24)

### PR-22: WebRefKBDiseasesScreen upgrade — backend-connected admin list

**Effort**: M (1–2 kun) | **Bog'liqlik**: PR-14, PR-11 | **Reviewer**: frontend + editor | **Paralel**: PR-24

**Scope:**
Mavjud `src/app/components/screens/web/WebRefKBDiseasesScreen.tsx` (hozir mock) — backend API bilan ulash.
- Admin list — barcha kasalliklar (barcha statuslar), status filter (draft/review/approved/published/rejected/archived).
- "Yangi kasallik" CTA — PR-23 editor'ga o'tadi.
- Review queue link (MEDICAL_EDITOR uchun) → PR-24.

**O'zgaradigan fayllar:**
- `src/app/components/screens/web/WebRefKBDiseasesScreen.tsx` — mock o'chiriladi, API hooks.
- Yangi: `src/app/hooks/useKBDiseases.ts`.

**Test:** Vitest + Playwright — admin login → KB screen → list ko'rinadi.

**Verification:** API'dagi o'zgarishlar UI'da.

**Rollback:** `git revert`. Mock rejimiga qaytadi (fallback saqlansa).

---

### PR-23: KBDiseaseEditor — marker tree + WYSIWYG+Markdown editor

**Effort**: XL (4–5 kun) | **Bog'liqlik**: PR-22, PR-10 | **Reviewer**: frontend + editor + UX

**Scope:**
Editorial CMS sahifasi.

**Layout:**
- **Chap panel** — marker tree (canonical 38 + kengaytiruvchi). Har markerda: nom, status badge, sinonim variantlari dropdown, "Qo'shish/Tahrirlash".
- **O'ng panel** — Markdown editor (`@uiw/react-md-editor` yoki `tiptap` — yangi kutubxona). Rich text toolbar, link ref picker.
- **Yuqori panel** — kasallik header (ICD-10, nom inputlari), Completeness L1/L2/L3 progress, "Saqlash draft", "Review'ga yuborish".
- **Pastki panel** — References picker (PR-24 bilan reuse).

**Komponentlar:**
- `src/app/pages/kb/KBDiseaseEditorPage.tsx`
- `src/app/components/kb/MarkerTree.tsx`
- `src/app/components/kb/BlockEditor.tsx`
- `src/app/components/kb/CompletenessIndicator.tsx`
- `src/app/components/kb/SynonymLabelPicker.tsx` (3 ta variantdan tanlash yoki custom)

**Route:** `/kb/diseases/:id/editor` (EDITOR+, private).

**Test:**
- Vitest — marker tree navigation, block save debounce.
- Playwright — editor ochib, yangi blok yozib draft saqlash.

**Verification:** Content yozib saqlanadi, backend'da `DiseaseBlock` yaratilgan.

**Rollback:** `git revert`. Editor route yo'qoladi.

---

### PR-24: KB Review queue + approve/reject flow + Reference picker

**Effort**: L (2–3 kun) | **Bog'liqlik**: PR-11, PR-22 | **Reviewer**: frontend + editor | **Paralel**: PR-22 bilan

**Scope:**
- `src/app/pages/kb/KBReviewQueuePage.tsx` — MEDICAL_EDITOR uchun REVIEW statusli bloklar ro'yxati.
- `src/app/components/kb/ReviewActionPanel.tsx` — Approve/Reject (sabab bilan) tugmalar.
- `src/app/components/kb/DiffViewer.tsx` — oldingi versiyadan diff (`react-diff-viewer-continued`).
- `src/app/components/kb/ReferencePickerDialog.tsx` — DOI/PubMed qidiruvi, referensni blokka bog'lash, evidence grade tanlash.
- Reference picker PR-23 editor'dan chaqiriladi.

**Route:** `/kb/review` (MEDICAL_EDITOR+).

**Test:**
- Vitest — review actions, diff render.
- Playwright — full workflow: EDITOR submits → MEDICAL_EDITOR sees in queue → approves → status = APPROVED.

**Verification:** End-to-end moderatsiya.

**Rollback:** `git revert`.

---

## 9. Faza 6 — Kontent + sifat + launch (PR-25..28)

### PR-25: Seed script — 50 kasallik L1 + ICD-10 bootstrap

**Effort**: L (2–3 kun, content task) | **Bog'liqlik**: PR-10 | **Reviewer**: content/medical + backend | **Paralel**: PR-26, PR-27, PR-28

**Scope:**
- `server/scripts/seed-diseases.ts` — ICD-10 top-50 (`docs/New modul/16_Clinical_KB.md` dagi ro'yxat) uchun L1 darajada seed.
- Manba: WHO ICD-10 CSV (public) + open kontent (NIH MedlinePlus, Mayo abstract via manual review, mahalliy mutaxassis yozuvi).
- Har kasallik uchun: `Disease` row + 6 ta L1 blok (`about_disease`, `symptoms`, `dx_methods`, `treatment`, `prevention`, `important`) + simptomlar + 3+ reference.
- Status: `DRAFT` → manual review → `APPROVED` → `PUBLISHED`.

**Yangi fayllar:**
- `server/scripts/seed-diseases.ts`
- `server/scripts/data/icd10-top50.json`
- `server/scripts/data/diseases/<slug>.md` (har kasallik — markdown file + metadata)
- `package.json` — `"seed:diseases": "ts-node server/scripts/seed-diseases.ts"`

**Test:**
- Script dry-run mode (`--dry-run`) — hech nima yozmaydi, faqat validation.
- Seed idempotency — ikki marta ishlatilganda duplicate yaratmaydi.

**Verification:** Seed'dan keyin `/diseases` da 50 kasallik ko'rinadi.

**Rollback:**
- `server/scripts/unseed-diseases.ts` (parallel, bir vaqtda yoziladi) — barcha seed rows o'chiradi (ID orqali).
- Prod'da **hech qachon** `unseed` run qilinmaydi; faqat `archive` qilinadi.

---

### PR-26: Emergency red-flag engine + EmergencyBanner

**Effort**: M (2 kun) | **Bog'liqlik**: PR-16 | **Reviewer**: clinical + frontend | **Paralel**: PR-25

**Scope:**
- `server/src/triage/red-flag-rules.ts` — hardcoded rules (isitma + bo'yin qattiqligi → meningit shubhasi → "103"), har qoida: `{ruleId, description, requiredSymptoms, excludingSymptoms, severity}`.
- `POST /triage/match` response'ga `redFlags: [{ruleId, severity: 'EMERGENCY'|'URGENT', message, callNumber}]` field.
- Frontend: `src/app/components/diseases/EmergencyBanner.tsx` — qizil banner + "103 ga qo'ng'iroq" tugma (`tel:103`) + "Yaqin klinika" link.
- Disease card va SymptomMatcherSheet — banner yuqorida ko'rinadi redFlag bo'lsa.

**Test:**
- Unit — 10 ta emergency senariya (miokard infarkti, insult, anafilaksiya, meningit, sepsis, o'tkir karin, DKA, GI bleeding, zaharlanish, jarohat) — har biri mos signal bersin.
- Playwright — emergency simptomlar kiritilganda banner ko'rinadi.

**Verification:** Manual test senariyalari — clinical sign-off majburiy.

**Rollback:** `git revert`. Banner ko'rinmaydi, match oddiy ishlaydi (xavfsiz — emergency banner'ning yo'qligi "hayotga xavf" bo'lishi mumkin, shuning uchun bu PR merge'dan oldin QA + clinical sign-off).

---

### PR-27: Playwright e2e test suite

**Effort**: L (2–3 kun) | **Bog'liqlik**: PR-20 ≤ barcha fe PRs | **Reviewer**: QA + frontend | **Paralel**: PR-25, PR-26, PR-28

**Scope:**
Kritik path e2e testlari.

**Scenarios:**
1. **AI Tavsiya → Disease Card full flow:** login → patient home → AI Tavsiya → simptomlar → savollar → natija → disease bosish → card ochiladi → banner ko'rinadi.
2. **Symptom matcher:** card'da "Meni tekshirib ko'ring" → sheet ochilib 5 ta simptomga javob → score 60%+ ko'rsatadi.
3. **Send to doctor:** matcher'dan shifokorni tanlab yuborish → doctor login → incoming case ko'rinadi.
4. **Search:** `/diseases?q=gipert` → bir nechta natija.
5. **Admin workflow:** EDITOR login → yangi kasallik yaratish → DRAFT saqlash → REVIEW'ga yuborish → MEDICAL_EDITOR login → queue'da ko'rish → approve → ADMIN login → publish → public da ko'rinadi.
6. **Accessibility:** axe-core scan barcha asosiy sahifalar — 0 critical.

**Yangi infratuzilma:**
- `playwright.config.ts` (agar mavjud bo'lmasa)
- `tests/e2e/*.spec.ts`
- Fixtures: test users (patient1, doctor1, editor1, medical_editor1, admin1) + seed db fixture.
- CI integration — GitHub Actions workflow `e2e.yml`.

**Test:** Bu o'zi test.

**Verification:** `pnpm test:e2e` — barcha o'tadi.

**Rollback:** `git revert`. Testlar olib tashlanadi (lekin kod o'zgarmaydi).

---

### PR-28: Medical disclaimer + consent + SaMD safety

**Effort**: M (1–2 kun) | **Bog'liqlik**: PR-16 | **Reviewer**: legal + clinical + frontend | **Paralel**: PR-25, PR-26, PR-27

**Scope:**
- `src/app/components/diseases/MedicalDisclaimer.tsx` — har kartada footer "Bu tashxis emas, shifokor bilan maslahatlashing" + "Xatolik kuzatdim" tugma (feedback form).
- `src/app/components/diseases/ConsentCheckpoint.tsx` — shifokorga yuborishdan oldin, PDF yaratishdan oldin.
- `src/app/components/legal/TermsAcceptDialog.tsx` — birinchi kirganda (profilga saqlanadi `user.termsAcceptedAt`).
- `src/app/lib/medical-copy.ts` — "tashxis" so'zi o'rniga "ehtimoliy tashxis" yoki "mumkin bo'lgan kasallik"; majburiy copy rules (D6, NFR-C-01, NFR-C-02).
- Backend: `User.termsAcceptedAt` mavjud bo'lmasa — PR-04 da ko'rsatilmagan, alohida mini-migratsiya (yoki mavjud User model'ga add column).

**Test:**
- Vitest — disclaimer rendered, consent dialog blocks action.
- Playwright — consent majburiy.

**Verification:** Legal review.

**Rollback:** `git revert` — lekin **disclaimer yo'qligi** yuridik risk → bu revert **faqat** boshqa fatal bug bo'lsa tavsiya; odatda forward-fix.

---

## 10. Faza 7 — Post-MVP (ixtiyoriy)

| PR | Tavsif | Effort |
|---|---|---|
| PR-29 | PDF export — disease card + symptom match → server-side `@react-pdf/renderer` yoki Puppeteer | M (2 kun) |
| PR-30 | i18n setup — react-i18next, uz locale extraction, ru stubs, URL prefix Faza 2 | L (3 kun) |
| PR-31 | Chat WebSocket — message:new, typing, read receipts wiring; mavjud Socket.io gateway kengaytiriladi | L (3 kun) |
| PR-32 | Analytics events wiring — internal `analytics_events` jadvali + frontend emitter; Mixpanel/PostHog optional | M (2 kun) |
| PR-33 | L2/L3 kontenti — asta-sekin 50 kasallikka kengaytirilgan bloklar | XL (continuous) |
| PR-34 | Clinical board audit — 6 oylik re-review cron + "Sertifikatlangan" badge | M (2 kun) |
| PR-35 | pgvector semantik qidiruv + Claude embeddings | L (3–4 kun) |
| PR-36 | Prerender / SSG public disease sahifalari (vite-plugin-prerender) | M (2 kun) |
| PR-37 | PWA + offline — service worker, cache oxirgi 5 card | L (3 kun) |

---

## 11. Bog'liqlik grafi

```
PR-01 (docs)
   │
   ├──► PR-02 (disease core schema) ──► PR-06 (FTS) ──┐
   │         │                                          │
   │         ├──► PR-03 (content schema) ──┐            │
   │         │                              │            │
   │         ├──► PR-04 (ops schema) ──┐   │            │
   │         │                          │   │            │
   │         └──► PR-05 (roles enum) ──┼──┼────────────┼──► PR-13 (auth ext)
   │                                    │   │            │
   └──► PR-14 (FE types + API client) ──┤   │            │
                                          │   │            │
                      PR-07 (Diseases API) ◄──┴────────────┘
                           │
                           ├──► PR-08 (Symptoms API) ──┐
                           │                            │
                           ├──► PR-09 (Refs API)        │
                           │                            │
                           └──► PR-10 (Blocks API) ──┬──┤
                                                     │   │
                                     PR-11 (Moderation) ◄┤
                                           │
                                           └──► PR-12 (Triage + FHIR)
                                                       │
                                                       ▼
 PR-14 ──► PR-15 (List page) ──┐
    │                           │
    ├──► PR-17 (Chip embed)    │
    │                           │
    └──► PR-16 (Card page) ◄────┤
              │                  │
              ├──► PR-18 (DiagnosisResults ↔ Card) ◄─┘
              │
              ├──► PR-19 (SymptomMatcherSheet) ──► PR-20 (SendToDoctor + FHIR)
              │                                          │
              ├──► PR-26 (Red-flag engine)              │
              │                                          ▼
              │                              PR-21 (Doctor panel)
              │
              └──► PR-28 (Disclaimer + consent)

PR-22 (Admin list upgrade) ──► PR-23 (Editor) ──► PR-24 (Review queue + Refs picker)

PR-25 (Seed) ──► PR-27 (e2e tests covering full flow)
```

**Parallel imkoniyatlar:**
- PR-02/03/04 ketma-ket (ayni vaqtda boshqa backend ishi), lekin PR-05 mustaqil parallel.
- PR-08, PR-09, PR-10 — parallel (PR-03/02 dan keyin).
- PR-15, PR-17, PR-22 — parallel (PR-14 dan keyin).
- PR-25, PR-26, PR-27, PR-28 — to'liq parallel (Phase 6).

---

## 12. DB migratsiya strategiyasi

### 12.1. Prinsiplar

- **Har migratsiya alohida faylda** (project rule).
- **Prisma migrate** — dev'da `migrate dev`, prod'da `migrate deploy`.
- **Oldinga mos** (forward-compatible) — har migratsiya production'da **uzilmasdan** apply bo'lishi kerak.
- **Nullable qo'shish, keyin to'ldirish, keyin NOT NULL** — agar yangi NOT NULL maydon kerak bo'lsa, 3 bosqichda:
  1. `ALTER TABLE ADD COLUMN foo NULL` (migration A)
  2. Data backfill (migration B `UPDATE`)
  3. `ALTER TABLE ALTER COLUMN foo SET NOT NULL` (migration C)
- **Enum ADD VALUE** — alohida migratsiya, qiymat ishlatishdan **bitta PR oldin** (Postgres transaksion cheklovi).
- **Index creation** — CONCURRENTLY (katta jadvallar uchun), blok qilmasin.

### 12.2. Migratsiya ro'yxati

| # | Migration | PR | Turi | Reversible |
|---|---|---|---|---|
| 1 | `<ts>_add_disease_core` | PR-02 | Schema add | Yes (DROP) |
| 2 | `<ts>_add_disease_content` | PR-03 | Schema add | Yes |
| 3 | `<ts>_add_disease_operations` | PR-04 | Schema add | Yes |
| 4 | `<ts>_add_user_roles` | PR-05 | Enum ADD VALUE | **No** (Postgres constraint) |
| 5 | `<ts>_add_fts_indexes` | PR-06 | Extension + generated column | Yes |
| 6 | `<ts>_add_terms_accepted_at` | PR-28 | Column add | Yes |

### 12.3. Production deploy jarayoni

1. **Shadow DB test** — `prisma migrate dev` hozirgi dev DB'da.
2. **Staging apply** — staging'da `prisma migrate deploy`, smoke test, rollback plan tasdiqlash.
3. **Production apply** — off-peak (soat 03:00 Toshkent) vaqtida, `prisma migrate deploy`.
4. **Post-deploy verification** — `SELECT COUNT(*) FROM "Disease"` va kritik querylar.
5. **Monitoring** — Sentry + Supabase Dashboard, 1 soat davomida yaqindan kuzatish.

### 12.4. Data migration (kontent seed)

- PR-25 `seed-diseases.ts` — **dev/staging birinchi**, prod'ga kopirovka faqat content sign-off bo'lgach.
- Seed **idempotent** — qayta ishga tushirsa yangi rows yaratmaydi.

---

## 13. Rollback rejasi

### 13.1. PR darajasida rollback

Har PR — mustaqil `git revert` mumkin, lekin **bog'liqlik tartibida teskari**:
- PR-20 ni revert qilish PR-21 dan oldin qilinmaydi (21 faqat 20'ning output'ini ishlatadi).
- Migration bo'lsa — alohida revert migration yoziladi (12.1 ga qarang).

### 13.2. Hot-rollback senariylari

| Senariya | Belgilar | Harakat |
|---|---|---|
| API 500 (yangi endpoint) | Sentry spike | `git revert` + fast deploy (5 daqiqada) |
| Disease card render crash | FE error spike | Revert PR-16, fallback eski ekran (agar mavjud bo'lsa) yoki 404 message |
| Symptom match xato natijalar | Shifokor shikoyatlari | Feature flag `APP_FEATURE_DISEASE_KB=false` → UI'dan olib tashlash (5 daqiqa), keyin fix |
| Emergency banner noto'g'ri ishlamaydi | QA topadi yoki clinical audit | **Immediate revert PR-26** + clinical review; medical editor va legal eskalatsiya |
| Data corruption (disease content) | Editor xato flag | Prisma `DiseaseEditLog` dan diff olib **manual restore** (audit log asosida) |
| PHI leak | Security incident | **Full stop** — PHI endpoint'lari `503`, incident response plan |

### 13.3. Feature flag asosida rollback

`APP_FEATURE_DISEASE_KB=false` qilinganda:
- Frontend: `/diseases/*` route'lari redirect `/` → "Tez orada"; `DiagnosisResults`'da disease link'lar disabled.
- Backend: `GET /diseases/*` → 503 (yoki tri-state: 404) — business-as-usual AI Tavsiya ishlashda davom etadi.
- Bu — yumshoq rollback (kod saqlanadi, foydalanuvchi ko'rmaydi).

### 13.4. Enum rollback (PR-05)

Postgres'da `DROP VALUE` yo'q. Rollback strategiyalari:
- **Bosh tortish**: yangi rol foydalanuvchisini boshqa rolga ko'chirish (`UPDATE User SET role='PATIENT' WHERE role='STUDENT'`).
- Yangi enum qiymatlari `_DEPRECATED_STUDENT` kabi nom bilan qoldiriladi.
- Prisma schema'da enum qiymatini olib tashlash mumkin — lekin DB level'da qoladi.

### 13.5. Content rollback

- `DiseaseBlock.status = ARCHIVED` soft-delete.
- `DiseaseEditLog` diff'lari bilan **oldingi versiyaga restore** UI (PR-24 review page'ga qo'shilishi mumkin).

---

## 14. Test strategiyasi (umumiy)

### 14.1. Test turlari

| Qatlam | Framework | Target coverage | Qayerda |
|---|---|---|---|
| Backend unit | Jest + ts-jest | Service ≥ 75%, util ≥ 90% | `server/src/**/*.spec.ts` |
| Backend integration | Jest + Supertest + `@testcontainers/postgresql` | Controller ≥ 60% | `server/test/*.integration.spec.ts` |
| Frontend unit | **Vitest + Testing Library** (YANGI — PR-14 da qo'shiladi) | Component render ≥ 50%, hook ≥ 70% | `src/**/*.test.tsx` |
| Frontend e2e | **Playwright** (YANGI — PR-27 da) | 100% happy path, 80% critical edge | `tests/e2e/*.spec.ts` |
| A11y | axe-core (Playwright plugin) | 0 critical, 0 serious | `tests/e2e/a11y.spec.ts` |
| Visual regression | — (Faza 3, Chromatic yoki Percy) | — | — |

### 14.2. Pre-commit hook

- `lint-staged` + ESLint + Prettier + `tsc --noEmit` (faqat staged files).
- Commit reject bo'lsa — fix, **hech qachon `--no-verify`** (loyiha qoidasi).

### 14.3. CI pipeline (GitHub Actions — yangi)

```yaml
on: [pull_request]
jobs:
  lint-typecheck: (npm ci → eslint → tsc --noEmit)
  backend-tests: (Postgres service → prisma migrate deploy → jest)
  frontend-tests: (vitest)
  e2e-tests: (build → playwright — faqat PR'lar ishga tushirishda emas, nightly)
  prisma-validate: (prisma format check → prisma validate)
```

### 14.4. PR merge bloklari

- [ ] `pnpm test` muvaffaqiyatli
- [ ] `pnpm lint` muvaffaqiyatli
- [ ] `tsc --noEmit` muvaffaqiyatli
- [ ] Code review 1 approved (clinical PR'lar uchun 2 — biri medical editor)
- [ ] Yangi migratsiya bor bo'lsa — staging'da test qilingan
- [ ] Coverage regression yo'q (asta-sekin threshold ko'tariladi)

---

## 15. CI/CD va PR konvensiyalari

### 15.1. Branch strategy

- `master` — prod (protected branch).
- `develop` — integration (yoki `master` to'g'ridan-to'g'ri — loyihada `master` only, so bu saqlansa bo'ladi).
- `feature/kb-<PR>-<slug>` — feature branches.

### 15.2. Commit format

Conventional commits:
- `feat(diseases): add Disease Prisma model (PR-02)`
- `fix(triage): correct match score calculation for NO answers`
- `refactor(kb): extract marker parser to lib`
- `test(diseases): add FTS integration tests`
- `docs(kb): update feature analysis decisions`

### 15.3. PR template

```markdown
## Summary
- Which PR (number)
- What it does (1–3 bullets)

## Scope
- In: ...
- Out: ...

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Playwright e2e (if FE critical path)
- [ ] Manual verification steps:
  1. ...

## Migration
- [ ] Migration file: `<path>`
- [ ] Reversible: yes/no
- [ ] Staging tested: yes/no

## Rollback
- ...

## Dependencies
- Depends on: #PR-X
- Blocks: #PR-Y
```

---

## 16. Ishga tushirishdan oldin chek-list (Launch readiness)

**MVP launch (PR-28 merge'dan keyin):**

- [ ] 50 ta kasallik `published` statusda (PR-25 + manual review)
- [ ] Red-flag engine clinical sign-off (PR-26)
- [ ] Legal sign-off: disclaimer, ToS, Privacy Policy (PR-28 + Q28/Q29)
- [ ] Playwright e2e yashil (PR-27)
- [ ] Performance smoke test — NFR-P-01..05 mos
- [ ] Accessibility audit — Lighthouse ≥ 90, axe 0 critical
- [ ] Sentry alert thresholds sozlangan
- [ ] Rollback rejasi runbook (shu hujjat §13) tim tomonidan o'qilgan
- [ ] Feature flag `APP_FEATURE_DISEASE_KB` — prod'da default OFF, bosqichma-bosqich % rollout (10% → 50% → 100%)
- [ ] Medical editor on-call kontakti aniq
- [ ] Support team onboarding — 1 soatlik brief + FAQ

**Prod PHI migration (D5 follow-up, keyinroq):**
- [ ] Mahalliy hosting tanlandi (tender yoki partner)
- [ ] Data migration rejasi (Supabase EU → UZ DC)
- [ ] Regulatoriya tasdig'i (yuridik)
- [ ] DR drill (disaster recovery) — o'qituvchi bazada
- [ ] Cutover window rejalashtirildi

---

## Ilovalar

- [feature-analysis.md](./feature-analysis.md) — talablar va qarorlar.
- TZ asli: [`MedSmart-Pro_Kasalliklar_Moduli_TZ.md`](../../MedSmart-Pro_Kasalliklar_Moduli_TZ.md)
- [`docs/New modul/`](../New%20modul/) — pre-analiz konteksti (qisman eskirgan, D1 ga ko'ra).
- Canonical marker ro'yxati — [feature-analysis.md §10](./feature-analysis.md#10-qoshimcha-blok-royxati-canonical-markers).

---

**Hujjat oxiri.** Savollar — loyiha menejeriga yoki PR'da `/cc @tech-lead`.
