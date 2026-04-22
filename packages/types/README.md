# `@medsmart/types`

Shared domain types for MedSmart-Pro surfaces (web, Telegram mini-app,
and — eventually — Capacitor mobile).

## Nimani o'z ichiga oladi

- `disease` — kasallik ro'yxati, detail, bloklari, KB v2 metadatasi
  (olim, tadqiqot, genetika)
- `symptom` — SymptomListItem + DiseaseSymptomWithWeight (og'irlik bilan)
- `triage` — AnswerValue, TriageMatchRequest/Result/Session
- `matcher-wizard` — 4-bosqichli wizard state (symptoms → risk → timeline → DDx)

## Source strategy

Phase 3.1 — **source-resolved**: package.json `main` va `exports` to'g'ridan-to'g'ri
`.ts` fayllarga ishora qiladi. Build qadamisiz, zero-cost dev loop.

Bu ishlaydi chunki:
- Vite/Vitest source `.ts` ni o'zi resolve qiladi (workspace symlink orqali).
- `tsc --noEmit` tiplarini to'g'ridan-to'g'ri kuzatadi.
- NestJS (server) bu paketga dependent emas (server Prisma tiplarini ishlatadi).

Agar keyinroq emitted `dist/` kerak bo'lsa (masalan CDN/NPM uchun), `tsc -p tsconfig.json`
bilan declaration fayllarni chiqaramiz — hozircha shart emas.

## Migration pattern

Paket yaratilishidan oldin tiplar `src/app/types/api/*.ts` da joylashgan edi.
56+ consumer fayl `import type { ... } from '../../types/api/disease'`
pattern'ida ishlatgan.

Migratsiya:
1. Canonical tiplar `packages/types/src/` ga ko'chirildi.
2. `src/app/types/api/*.ts` thin re-export stub'lariga aylantirildi
   (`export type { ... } from '@medsmart/types/disease'`).
3. **Consumer kodi o'zgartirilmadi** — eski importlar ishlashda davom etadi.

Yangi kodda to'g'ridan-to'g'ri yozsa afzal:
```ts
import type { DiseaseDetail } from '@medsmart/types';
// yoki:
import type { DiseaseDetail } from '@medsmart/types/disease';
```

## `calculator.ts` nima uchun bu yerda emas

`src/app/types/api/calculator.ts` `TranslationKey = keyof typeof uz` ni
import qiladi — bu i18n runtime bog'liqlik. Uni bu paketga ko'chirish
i18n ni ham shared paketga aylantirishni talab qiladi — bu keyingi phase.

## Keyingi qadamlar (Phase 3.2+)

- **3.2** `server/scripts/generate-openapi.ts` + `openapi-typescript` →
  `packages/types/src/generated.ts` (backend kontrakti avtomatik sinkron).
- **3.3** `packages/api-client/` — `apiClient.ts` ni workspace'ga ko'chirish,
  bu paketdan tiplar iste'mol qilish.
