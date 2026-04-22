# PHI Routing — Architecture Decision Record

> **Status**: Active (MVP — Supabase prod'da PHI yo'q)
> **Owner**: backend team
> **CLAUDE.md qoida #6**: Hech qanday PHI Supabase prod'da saqlanmaydi. MVP/demo'da PHI yo'q. PHI keyinchalik mahalliy O'zbekiston hostingga ko'chiriladi.

## Maqsad

MedSmart-Pro ma'lumotlarini **ikki** joyga ajratib saqlash:

1. **Non-PHI** (demografiya bo'lmagan, identifikatsiya qilmaydigan) — Supabase (prod).
2. **PHI** (ism, telefon, email, tashxis matni, rasm DICOM, eslatmalar) — O'zbekiston hostingdagi alohida Postgres (Phase 2).

## Qaror: DTO qatlamida PHI ni rad etish (MVP)

MVP bosqichida biz frontend'dan keladigan PHI maydonlarini **DTO'da qabul qilmaymiz**. Bu backend'da eng sodda va auditable yechim:

- DTO → `class-validator` — PHI fieldlar yo'q → `whitelist: true` avtomatik drop qiladi.
- Service qatlami patient ma'lumotlarini kerak bo'lsa **User profilidan** (JWT `sub` orqali) oladi.

## Affected tables (legacy PHI columns)

Quyidagi Prisma modellarda hozirgacha PHI ustunlar saqlanib qolgan (migratsiya Phase 2 da):

| Table                 | PHI columns                                        | Hozirgi holat                                 |
| --------------------- | -------------------------------------------------- | --------------------------------------------- |
| `ConsultationRequest` | `patientName`, `patientPhone`, `patientEmail`      | **Yangi yozuvlarda to'ldirilmaydi** (nullable) |
| `Application`         | `hvDoctorName`, `hvClinicName`, `notes`            | Nullable, audit davom etmoqda                 |
| `Conclusion`          | `text`, `recommendations`                          | Phase 2 ga ko'chiriladi                       |
| `FileRecord`          | `bucket`, `path` (DICOM fayllari)                  | Hozir Supabase Storage'da — Phase 2 migratsiya |

## Phase 2 — Migration plan

### M2.1 — Schema cleanup: `remove_phi_from_consultation`

**Timing**: Phase 2 kickoff (local hosting tayyorlangach)

```sql
-- Prisma migration: remove_phi_from_consultation
ALTER TABLE "ConsultationRequest" DROP COLUMN "patientName";
ALTER TABLE "ConsultationRequest" DROP COLUMN "patientPhone";
ALTER TABLE "ConsultationRequest" DROP COLUMN "patientEmail";
```

**Pre-reqs**:

- Frontend bu fieldlarga murojaat qilmasligi tekshirilgan (`grep -r "patientName\|patientPhone\|patientEmail" src/`)
- Barcha mavjud yozuvlar clean (null/empty) — `SELECT COUNT(*) FROM "ConsultationRequest" WHERE "patientName" IS NOT NULL;` → 0

### M2.2 — Split database

- Yangi `server/prisma-phi/schema.prisma` — PHI-only modellar (local host).
- `PrismaService` → `PrismaPublicService` + `PrismaPhiService` (ikkita client).
- Cross-DB join'lar o'rniga `patientId` foreign key + API qatlamida assemble.

### M2.3 — Storage routing

- DICOM/tibbiy rasm fayllar Supabase Storage'dan **mahalliy S3-compatible** (MinIO) ga ko'chiriladi.
- `FileRecord.bucket` endi mahalliy bucket, URL signing lokal hosting serveri orqali.

## Hozirgi test coverage

- `consultation.service.spec.ts` — `create()` ichida PHI fieldlar DTO'dan o'tmasligini tekshiradi (negative assertion):
  ```ts
  expect(callArg.data).not.toHaveProperty('patientName');
  expect(callArg.data).not.toHaveProperty('patientPhone');
  expect(callArg.data).not.toHaveProperty('patientEmail');
  ```
- CI'da `.claude/hooks/phi-scanner.sh` PreToolUse hook PHI yozish urinishlarini blokirovka qiladi.
- `phi-guardian` subagent PR review'da audit yuritadi.

## Bog'liq hujjatlar

- `CLAUDE.md` — NON-NEGOTIABLE qoida #6
- `.claude/agents/phi-guardian.md` — PHI audit subagent
- `.claude/hooks/phi-scanner.sh` — pre-write bloker

## Changelog

- **2026-04-22** — Initial ADR (xoqon). MVP DTO qatlamida PHI rad etiladi; Phase 2 da schema cleanup va split-DB.
