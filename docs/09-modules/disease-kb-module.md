# Kasalliklar Ma'lumotnomasi (Disease KB) Moduli

> **Modul ID:** MOD-DISEASE-KB | **Versiya:** 0.1 (MVP design) | **Sana:** 2026-04-17 | **Status:** In development

## Umumiy

Strukturaviy, ICD-10/ICD-11 asosidagi **universal kasallik kartasi** moduli. Bemor AI Tavsiya natijalaridan kasallikka o'tadi; simptomlar ro'yxati bilan tekshirib, natijani shifokorga yuborishi mumkin. Shifokor panelida FHIR-uslubidagi JSON qabul qilinadi.

**40+ blok** har kasallik uchun: etiology, patogenez, simptomlar, diagnostika, davolash, bosqichlar, klinik holatlar, shifokorlar, manbalar, epidemiologiya va h.k. Marker-template tizimi (`{{etiology}}`) qayta ishlatiladigan kontent uchun.

## Batafsil hujjatlar

- **Talablar va qarorlar**: [`docs/analysis/feature-analysis.md`](../analysis/feature-analysis.md) — FR, NFR, D1–D12 qarorlari, ochiq savollar.
- **Implementation reja**: [`docs/analysis/implementation-plan.md`](../analysis/implementation-plan.md) — 28 PR, bog'liqlik grafi, migratsiya strategiyasi, rollback.
- **TZ (asosiy manba)**: [`MedSmart-Pro_Kasalliklar_Moduli_TZ.md`](../../MedSmart-Pro_Kasalliklar_Moduli_TZ.md) — 1003 qator, kanonik talablar.

## MVP qamrovi

- **50 kasallik**, **L1 (bemor) darajasida**, **uz tilida**.
- AI Tavsiya → Disease card → Symptom matcher → Shifokorga yuborish — end-to-end.
- L2/L3 darajalar, ru/en tillari, PWA offline, vector search, real-time chat — **post-MVP**.

## Rollar

| Rol | Kirish | Amallar |
|-----|--------|---------|
| `PATIENT` | L1 kontent | Ko'rish, simptom match, shifokorga yuborish |
| `STUDENT` | L1 + L2 | Ko'rish, klinik holatlar |
| `NURSE` | L1 + L2 | Ko'rish, tezkor ma'lumot |
| `DOCTOR` | L1 + L2 + L3 | Ko'rish, bemor case'larini qabul qilish |
| `SPECIALIST` | L1 + L2 + L3 | Ko'rish, konsultatsiya |
| `EDITOR` | Admin panel | Draft yaratish, tahrirlash |
| `MEDICAL_EDITOR` | Admin panel | Tibbiy tasdiqlash (review → approved) |
| `ADMIN` | To'liq | Publish, arxiv, foydalanuvchi boshqaruvi |

## Asosiy fayllar (MVP uchun)

### Frontend (yaratilishi kerak)
- `src/app/components/screens/patient/DiseaseCard.tsx` — asosiy kasallik kartasi
- `src/app/components/screens/patient/SymptomMatcherSheet.tsx` — simptom tekshirish sheet
- `src/app/components/screens/patient/SendToDoctor.tsx` — shifokorga yuborish
- `src/app/components/screens/doctor/IncomingCasePanel.tsx` — shifokor qabul paneli
- `src/app/components/screens/web/WebRefKBDiseasesScreen.tsx` — **mavjud** admin mock; real API'ga ulanadi
- `src/app/components/screens/web/WebKBDiseaseEditor.tsx` — WYSIWYG editor (yaratilishi kerak)

### Backend (yaratilishi kerak)
- `server/src/modules/diseases/` — CRUD + search
- `server/src/modules/symptoms/` — simptom lug'at
- `server/src/modules/disease-blocks/` — blok kontent
- `server/src/modules/kb-references/` — manbalar
- `server/src/modules/kb-moderation/` — draft→review→published pipeline
- `server/src/modules/triage/` — AI Tavsiya natija matcher + FHIR eksport

### DB (Prisma)
- 15+ yangi model (`Disease`, `Symptom`, `DiseaseBlock`, `Reference`, `SymptomMatchSession`, …)
- 7+ yangi enum (`ApprovalStatus`, `EvidenceLevel`, `ContentLevel`, `AudienceMode`, …)
- `UserRole` enum kengaytiriladi: `STUDENT`, `NURSE`, `EDITOR`, `MEDICAL_EDITOR`.

## Feature flag

```bash
APP_FEATURE_DISEASE_KB=false   # Default prod'da
APP_FEATURE_DISEASE_KB=true    # Staging/dev
```

Flag `false` bo'lsa — barcha `/api/v1/diseases/*` endpointlar 404, frontend navigation'da disease card'ga link ko'rsatilmaydi.

## Joriy progress (2026-04-17)

- [x] TZ tahlili va qarorlar — `feature-analysis.md`
- [x] Implementation reja — `implementation-plan.md` (28 PR)
- [x] **PR-01** (scaffolding: CLAUDE.md, modul hujjati, env flag) — **shu commit**
- [ ] PR-02..06 — Prisma schemas + FTS migrations
- [ ] PR-07..10 — Backend CRUD modullari
- [ ] PR-11..13 — Moderatsiya pipeline + AI Tavsiya triage + Auth ext
- [ ] PR-14..18 — Frontend disease browser
- [ ] PR-19..21 — Symptom matcher + shifokor paneli
- [ ] PR-22..24 — CMS/moderatsiya UI
- [ ] PR-25..28 — Seed, red-flag, e2e, disclaimer
