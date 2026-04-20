# MedSmart-Pro — Claude Code Guide

> **Loyiha**: Tibbiy platforma (AI radiolog, konsultatsiya, uy-vizit, Kasalliklar bazasi moduli).
> **Tillar**: Interfeys uz/ru; kod komentariyalari va commit xabarlari uz yoki en. AI javoblari uz.

## Stack (haqiqiy, 2026-04-17)

### Frontend (`/src`, `/public`, `vite.config.ts`)
- **React 18.3.1** + **Vite 6.3.5** + **TypeScript 5**
- **React Router 7.13** (URL-based routing — `83d42be` commit dan)
- **Tailwind CSS 4.1.12** (via `@tailwindcss/vite`) + **shadcn/ui** (Radix UI 1.x–2.x)
- **State**: Context API — `AppStore` + `NavigationContext` (`src/app/store/`). Redux/Zustand **yo'q**.
- **Animatsiya**: `motion` (framer-motion 12)
- **Formlar**: `react-hook-form` 7.55
- **Charts**: `recharts` 2.15
- **PDF**: `jspdf` 4.2
- **Boshqa**: `cmdk`, `sonner` (toast), `vaul` (drawer), `date-fns` 3.6, `lucide-react`

### Backend (`/server`)
- **NestJS 10.4** + **Prisma 5.20** + **PostgreSQL** (Supabase)
- **JWT** 7-day (`@nestjs/jwt`)
- **Storage**: `@supabase/supabase-js` 2.45
- **Queues**: BullMQ (`@nestjs/bull` + `bull`) + **ioredis** 5.10
- **WebSocket**: `@nestjs/websockets` + `socket.io` 4.8
- **Swagger**: `@nestjs/swagger` 11 → `server/openapi.json` auto-generated
- **Test**: Jest 30 + ts-jest
- **Rate limit**: `@nestjs/throttler` 6

### Monorepo infra
- **Paket menejer**: `pnpm` (root + server)
- **Build**: root `pnpm build` (Vite SPA); server `pnpm --dir server build` (NestJS)

## Papka strukturasi (qat'iy)

### Frontend (`/src`)
```
src/
  app/
    components/
      screens/        # Ekran komponentlari (Web*, patient/, doctor/, …)
      ui/             # shadcn/ui primitives
    store/            # AppStore + NavigationContext
    types/            # Umumiy tiplar (index.ts ~1280 qator)
    data/             # Static mock data (clinicalKB.ts va h.k.)
    router.tsx        # React Router v7 definitions
    App.tsx
  services/mock/      # Frontend mock servislar (backend yo'qligida)
  main.tsx
  index.css
```

### Backend (`/server/src`)
```
server/src/
  auth/               # Autentifikatsiya (JWT, guards, roles)
  users/              # User CRUD
  applications/       # Ariza/appointment boshqaruvi
  consultation/       # Konsultatsiya
  radiology/          # Radiolog
  home-visit/         # Uy-vizit
  file-storage/       # Supabase Storage wrapper
  jobs/               # BullMQ queuelar
  config/             # PrismaService, env config
  common/             # DTOlar, pipes, interceptorlar
  diseases/           # Disease KB moduli (flat konventsiya — mavjud modullar kabi)
  symptoms/
  references/
  disease-blocks/
  kb-moderation/
  triage/
  main.ts
```

### Hujjatlar (`/docs`)
- `docs/09-modules/` — har modul uchun qisqa overview (1 fayl).
- `docs/analysis/` — feature-analysis + implementation-plan (batafsil).
- `docs/architecture/`, `docs/db/`, `docs/api/` — umumiy.

## Loyiha qoidalari (NON-NEGOTIABLE)

1. **Test yozmasdan PR merge qilinmaydi.** Service qatlamiga unit, kritik yo'llarga e2e.
2. **DB migratsiyalar har doim alohida faylda** — `server/prisma/migrations/<timestamp>_<slug>/`. Prisma default.
3. **API versiyalanadi** — yangi endpointlar `/api/v1/...` ostida. Breaking change bo'lganda `/api/v2`.
4. **Backend modullari flat** — `server/src/<module>/` (mavjud konventsiya: `auth/`, `users/`, `applications/`, va h.k.). Ichida `<module>.module.ts`, `<module>.controller.ts`, `<module>.service.ts`, `dto/`, `tests/`.
5. **Feature flag** — yangi modullar env flag bilan (`APP_FEATURE_<MODULE>`), stabil bo'lgunicha prod'da `false`.
6. **Hech qanday PHI Supabase prod'da saqlanmaydi** — PHI keyinchalik mahalliy O'zbekiston hostingga ko'chiriladi; MVP/demo'da PHI yo'q.
7. **Commit message formati**: `<type>(<scope>): <xabar>` — `feat`, `fix`, `perf`, `refactor`, `chore`, `docs`, `test`.

## Kod konvensiyalari

- **TypeScript strict mode** yoqilgan (`any` taqiqlanadi — `b05c003` commit ko'rsatma beradi).
- **Komponentlar**: `PascalCase` fayl nomi, `kebab-case` papka.
- **Screens**: `src/app/components/screens/<role>/<FeatureName>Screen.tsx` yoki `web/Web<Feature>.tsx`.
- **Enums** (backend): `SCREAMING_SNAKE_CASE` qiymatlar (Prisma default).
- **Endpointlar**: `GET /api/v1/<resource>` (plural), `POST /api/v1/<resource>`, `PATCH /api/v1/<resource>/:id`.
- **DTOlar**: `class-validator` dekoratorlari; `@nestjs/swagger` dan `ApiProperty` — OpenAPI uchun majburiy.

## Yangi modullar qo'shishda

1. Prisma schema'ni yangilash → `prisma migrate dev --name <slug>` → alohida commit.
2. `server/src/<module>/` (flat, mavjud konventsiya) — controller + service + DTOlar + tests papkasi.
3. `docs/09-modules/<module>-module.md` — overview.
4. `openapi:generate` ishlatilib `server/openapi.json` yangilanadi.
5. Frontend'da tiplar `src/app/types/index.ts` ga qo'shiladi yoki `openapi-typescript` bilan auto-generate qilinadi.

## Faol ish

- **Disease KB moduli** — `docs/analysis/feature-analysis.md` + `docs/analysis/implementation-plan.md`. MVP: 50 kasallik × L1 × uz tilida. Flag: `APP_FEATURE_DISEASE_KB`.
