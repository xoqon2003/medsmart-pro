# MedSmart-Pro — Claude Code bilan Full-Stack Rivojlantirish Rejasi

**Sana:** 2026-04-21
**Auditor:** Claude (20 yillik senior arxitektor rejimi)
**Loyiha:** MedSmart-Pro (web + Telegram mini-app + NestJS backend)

---

## 1. MAVJUD HOLAT — NIMA TAYYOR, NIMA YO'Q

### 1.1 Umumiy jadval (real tekshirish asosida)

| Qatlam | Holati | Tafsilot |
|---|---|---|
| **Web Frontend (`/src`)** | **~75%** | 133 ta TSX ekran, ~64 600 qator. Patient 35, Doctor 24, Web/Admin 59, Radiolog 4, Shared 2. PWA + BottomNav + Responsive. |
| **Backend (`/server`)** | **~80%** | 36 modul, 35 controller, 36 service, 68 Prisma model, 10 migratsiya, 223 ta `operationId`, 31 `*.spec.ts`. |
| **Telegram mini-app** | **~5%** | Alohida papka yo'q. `@telegram-apps/sdk` o'rnatilmagan. Faqat shifokor profilida "Telegram bot" UI stub bor. |
| **Integratsiya (FE↔BE)** | **~30%** | 20 ta `src/services/api/*` yozilgan, ammo `VITE_USE_REAL_API=false` — mock rejimda. |
| **Claude Code infra (`.claude/`)** | **~40%** | `settings.local.json` bor (bash/web permissions). Agent / skill / hook / MCP — **yo'q**. |
| **Docs** | **~70%** | `docs/09-modules/` va `docs/analysis/` to'liq; consultation/home-visit/radiology docs bor, **kod yo'q**. |
| **DevOps** | **~60%** | Root `Dockerfile` + `docker-compose.yml` + `vercel.json` + `.github/workflows/ci.yml` bor. |

**Umumiy o'rtacha: ~56% (MVP-plus darajasi).**

### 1.2 Veb qismi — batafsil

**Tayyor (ishlab chiqilgan):**
- AI Radiology: `SymptomInput` → `AdaptiveQuestions` → `DiagnosisResults`.
- Konsultatsiya UI flow: Type → SubType → Doctor → Calendar → Confirm (frontend).
- Uyga chaqirish UI flow: Manzil → Aloqa → Vaqt → Mutaxassis.
- Tekshiruv: Category → Exam → Center → Calendar.
- Disease KB: `KBDiseaseListPage`, `MyDiseasesPage`, admin CRUD.
- Doctor dashboard: profil, tarif, portfolio, klinika, triage inbox, "Telegram bot" (UI stub).
- Web Admin: 59 ekran (dashboard, users, KB moderation, onlayn qabul, sozlamalar).
- PWA (`vite-plugin-pwa`), `OfflineBanner`, Tailwind 4 + shadcn/ui + Radix.
- React Router v7 to'liq wired.

**Yo'q yoki yarim tayyor:**
- Real API ulanish (mock'da).
- Telegram WebApp SDK va `initData` auth.
- Radiolog rolining 4 ekrani minimal darajada.

### 1.3 Backend — batafsil

**Joriy modullar:** `auth`, `users`, `doctor-profile`, `booking`, `examinations`, `diseases` (3 ctrl/2 svc/8 DTO/4 test), `disease-blocks`, `triage`, `clinical-tools`, `kb-moderation`, `references`, `symptoms`, `file-storage`, `jobs`.

**Yo'q modullar** (hujjati bor, `server/src/` ichida yo'q):
- `consultation/` ❌
- `home-visit/` ❌
- `radiology/` ❌

**Auth:** JWT 7 kun, guards, roles. **Prisma:** 68 model, enumlar `SCREAMING_SNAKE_CASE`. **Queues:** BullMQ + ioredis. **WS:** `socket.io` bor, ammo endpointlar minimal.

### 1.4 Telegram mini-app — haqiqiy holati

- `/telegram-app`, `/apps/telegram`, `/bot` — **hech biri yo'q**.
- `package.json`'da `@telegram-apps/sdk`, `@telegram-apps/sdk-react`, `grammy`, `telegraf`, `aiogram` — **yo'q**.
- `.env`'da `TELEGRAB_BOT_TOKEN` placeholder sifatida bor.
- `DoctorTelegramBot.tsx` — faqat UI stub (forma maketi).
- **Xulosa: mini-app hali qurilgan emas.** Barcha UI flow'lar veb uchun yaratilgan — ularni `@telegram-apps/sdk` qobig'iga o'rash kerak.

---

## 2. CLAUDE CODE BILAN ISHLAGANDA BILISH KERAK BO'LGAN HAMMA NARSA

### 2.1 Arxitektura — 5 qatlam (yozma qo'llanmadan)

| Qatlam | Fayl joyi | Qachon kerak |
|---|---|---|
| **CLAUDE.md** | Repo ildizi (+ har modul uchun qo'shimcha) | Doimiy xotira, har sessiyaga auto-load |
| **Skills** (`.claude/skills/`) | Qayta ishlatiladigan workflow | PR review, deploy, migration |
| **Subagents** (`.claude/agents/`) | Og'ir/maxsus kontekst | Security audit, code review, test writer |
| **MCP servers** (`.claude/settings.json`) | Tashqi tizim | Postgres, GitHub, Playwright, Context7 |
| **Hooks** (`.claude/settings.json`) | Majburiy tekshiruv | Lint-after-edit, secret scanner, TDD guard |

### 2.2 Muvaffaqiyat formulasi

Har qarorda Claude ~80% aniq. Oddiy feature = **20 qaror**.

```
0.8^20 ≈ 0.012 = 1.2%  ← rejasiz
```

Plan Mode har qarorni ~100% ga yaqinlashtiradi. CodeRabbit (2025-12, 470 PR): strukturalangan setup → **1.7× kam xato, 2.74× kam CVE**.

### 2.3 MedSmart-Pro uchun tavsiyaviy MCP to'plami

```json
{
  "mcpServers": {
    "postgres": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-postgres", "$DATABASE_URL"] },
    "github":   { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"], "env": { "GITHUB_TOKEN": "$GH_TOKEN" } },
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp"] },
    "context7":   { "command": "npx", "args": ["-y", "@upstash/context7-mcp"] },
    "supabase":   { "command": "npx", "args": ["-y", "@supabase/mcp-server"] }
  }
}
```

**Qo'shimcha:** Sentry (prod xato), Linear/Jira (task), Figma (dizayn → kod).

### 2.4 Subagentlar — ushbu loyiha uchun majburiy 6 ta

1. **`code-reviewer`** (opus-4-7) — commit oldidan.
2. **`security-auditor`** (opus) — OWASP + PHI leak tekshiruvi (tibbiy platform!).
3. **`test-writer`** (sonnet) — NestJS Jest + React Testing Library.
4. **`db-migrator`** (sonnet) — Prisma migratsiya + rollback.
5. **`api-builder`** (sonnet) — NestJS controller + DTO + Swagger.
6. **`tg-integration-specialist`** (opus) — Telegram WebApp + bot + `initData` verification.

### 2.5 Hooks — loyiha qoidalariga bog'lanadi

`CLAUDE.md`'dagi "PHI Supabase prod'da saqlanmasin" qoidasi **hook** orqali majburlanishi kerak:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/scan-phi-in-supabase.sh" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "pnpm typecheck --silent" },
          { "type": "command", "command": "pnpm --dir server lint --silent" }
        ]
      }
    ]
  }
}
```

### 2.6 Promt formulalari (haqiqatan ishlaydigan)

**XML-strukturalangan prompt (Anthropic tavsiyasi):**

```xml
<role>Sen 15 yillik NestJS + Prisma + React Native tajribaga ega staff engineer.</role>
<task>Telegram mini-app orqali bemor konsultatsiya yozilishini qo'sh.</task>
<constraints>
- Auth: Telegram initData HMAC-SHA256 verification (bot token bilan)
- Frontend: @telegram-apps/sdk-react, mavjud Konsultatsiya* ekranlarini qayta ishlat
- Backend: yangi `tg-auth` modul, /api/v1/tg/auth/verify endpoint
- APP_FEATURE_TG_MINIAPP flag bilan
</constraints>
<deliverables>
1. server/src/tg-auth/ (ctrl+svc+DTO+test)
2. apps/telegram-miniapp/ (Vite + React + @telegram-apps/sdk-react)
3. packages/shared-types/ — OpenAPI-dan generatsiya
4. docs/09-modules/tg-miniapp-module.md
</deliverables>
<quality_gates>
- TS strict, `any` taqiqlangan
- Har endpoint Zod/class-validator
- initData verification test qamrovi 100%
- openapi.json qayta generatsiya qilingan
</quality_gates>
<forbidden>Implement qilma. Avval batafsil Plan ber. Men tasdiqlamaguncha kod yozma.</forbidden>
```

**Boris Cherny stili (agressiv):**
- ❌ "Balki shuni sinab ko'rsak..."
- ✅ "Bu ishlamayapti. Fix."
- ✅ "Bu yechim sifatsiz. Hammasini tashla va qayta yoz."

### 2.7 Parallel sessiyalar (Boris texnikasi)

```bash
git worktree add ../medsmart-feature-consultation feat/consultation
git worktree add ../medsmart-feature-tg-miniapp    feat/tg-miniapp
git worktree add ../medsmart-feature-home-visit    feat/home-visit

# Har biriga alohida terminal + alohida Claude sessiya
```

Bir vaqtda 3 modul parallel ishlanadi, konfliktsiz.

---

## 3. ENG KO'P QILINGAN XATOLAR (LOYIHAGA XOS) — YECHIM BILAN

| # | Xato | Ta'sir | Yechim |
|---|---|---|---|
| 1 | Frontend mock'da qotib qolgan (`VITE_USE_REAL_API=false`) | FE/BE parallel emas, integration debt to'planadi | Har sprint oxirida mock→real migratsiya; `src/services/api/*.ts` mock va real versiyalarini bitta interface orqasiga qo'yish |
| 2 | Consultation/Home-visit/Radiology UI tayyor, backend YO'Q | PR merge'da orphan kod, bemor flow ishlamaydi | Quyidagi reja (5-bo'lim) bo'yicha backend modullarini **bir haftada** to'ldirish |
| 3 | Telegram mini-app paketlari o'rnatilmagan, lekin UI'da "Telegram bot" tugmalari bor | Foydalanuvchi aldanadi | Feature flag `APP_FEATURE_TG_MINIAPP=false`, UI'dan gate qilish |
| 4 | `CLAUDE.md` juda yaxshi, lekin `.claude/agents/`, `.claude/skills/`, `.claude/hooks/` yo'q | Har sessiyada Claude qoidalarni "unutishi" mumkin | Bugun kechqurun 6 ta subagent + 3 ta hook + 2 ta skill qo'shish (pastda reja) |
| 5 | Commit'da PHI leak xavfi (tibbiy platform!) | GDPR/O'zbekiston qonuni buzilishi | `secret-scanner` hook + `security-auditor` subagent + `CLAUDE.md`'dagi PHI qoidasini pre-commit'ga majburiy qilish |
| 6 | Monorepo to'liq emas (web + server bor, telegram yo'q, shared yo'q) | Tiplar dublikati, OpenAPI qayta generatsiya tartibsiz | `pnpm workspaces` + `packages/shared-types` + `apps/telegram-miniapp` qo'shish |
| 7 | 36 modul — 31 spec. Ko'p modullarda test yo'q (`users`, `doctor-profile`, `booking`, `examinations`) | Regression xavfi | `test-writer` subagent bilan **har modul uchun 80% coverage** majburiy qilish |
| 8 | `openapi.json` qo'lda qayta generatsiya qilinmoqda | FE tiplari eskiradi | `pnpm openapi:generate` ni `postbuild` hook'iga qo'shish + FE'da `openapi-typescript` bilan auto-types |
| 9 | `any` type `src/app/types/index.ts` (~1280 qator) ichida qolgan bo'lishi mumkin | Strict mode buzilgan | `tsc --noEmit --strict` CI'da red bo'lgunicha tuzatish, keyin `any` uchun lint rule'ni `error` qilish |
| 10 | Context7 MCP yo'q → Claude React Router v7 yoki Tailwind 4 eski syntax'ni aralashtirishi mumkin | Hallucinated API | Context7 MCP qo'shish: "React Router 7.13, Tailwind 4.1 syntax bilan yoz, Context7'dan tekshir" |

---

## 4. MINI-APP + WEB + NESTJS — YAGONA BACKEND ARXITEKTURASI (PRO)

### 4.1 Maqsad arxitektura diagrammasi

```
┌──────────────────┐   ┌────────────────────┐   ┌─────────────────┐
│  Web SPA (Vite)  │   │ Telegram Mini-App  │   │ Telegram Bot    │
│  apps/web        │   │ apps/telegram-miniapp│  │ apps/bot        │
│  (mavjud /src)   │   │ (yangi)            │   │ (yangi, grammy) │
└────────┬─────────┘   └──────────┬─────────┘   └────────┬────────┘
         │ HTTPS + JWT            │ HTTPS + initData      │ Long-poll / Webhook
         └─────────┬──────────────┴───────────────────────┘
                   ▼
         ┌───────────────────────┐
         │  API Gateway / BFF    │  (NestJS, `apps/api`)
         │  - /api/v1/*          │
         │  - /api/v1/tg/*       │  ← Telegram ga xos endpointlar
         │  - /api/v1/ws         │  ← WebSocket (socket.io)
         └──────────┬────────────┘
                    │
         ┌──────────┼───────────┬──────────────┐
         ▼          ▼           ▼              ▼
      Prisma    BullMQ       Supabase       Redis
      Postgres  (queues)     (Storage,       (cache,
                              no PHI)         sessions)
```

### 4.2 Monorepo strukturasi (hozirgini migratsiya qilish)

```
medsmart-pro/
├── apps/
│   ├── web/                    # hozirgi /src + /public + vite.config.ts
│   ├── telegram-miniapp/       # YANGI: @telegram-apps/sdk-react
│   ├── telegram-bot/           # YANGI: grammy + NestJS microservice
│   └── api/                    # hozirgi /server
├── packages/
│   ├── shared-types/           # openapi-typescript dan generatsiya
│   ├── shared-ui/              # ikkala frontend bo'lishgan shadcn komponentlari
│   ├── shared-utils/           # formatters, validators, i18n (uz/ru)
│   └── tg-auth/                # initData HMAC verification — FE+BE da ishlatiladi
├── .claude/
│   ├── agents/                 # 6 subagent
│   ├── skills/                 # pr-review, pre-deploy, mock-to-real
│   ├── hooks/                  # phi-scanner.sh, lint.sh
│   └── settings.json           # MCP + hooks
├── CLAUDE.md                   # mavjud + kengaytirilgan
├── pnpm-workspace.yaml
├── turbo.json                  # Turborepo pipeline
└── docker-compose.yml
```

### 4.3 Auth yechimi (eng muhim qism!)

Telegram mini-app uchun alohida `POST /api/v1/tg/auth/verify` endpoint:

```typescript
// server/src/tg-auth/tg-auth.service.ts
import * as crypto from 'crypto';

verifyInitData(initData: string): TelegramUser {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  const dataCheckString = [...urlParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  const computed = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString).digest('hex');

  if (computed !== hash) throw new UnauthorizedException('Invalid initData');
  return JSON.parse(urlParams.get('user')!);
}
```

Javobda MedSmart'ning o'zining JWT (7 kun) beriladi → keyingi barcha chaqiriqlar standart `Authorization: Bearer` bilan ishlaydi. Shu tufayli **frontend (web) va mini-app bir xil API'dan foydalanadi**, faqat login yo'li farqli.

### 4.4 Umumiy tiplar (type-safety)

```bash
# server tarafida (NestJS)
pnpm --dir apps/api openapi:generate   # server/openapi.json

# repo ildizida
pnpm openapi-typescript apps/api/openapi.json \
     -o packages/shared-types/src/api.ts
```

Har ikki frontend `@medsmart/shared-types`'ni import qiladi — endpoint o'zgarsa TS error'i ikkalasida bir vaqtda chiqadi.

### 4.5 Ikkala FE uchun umumiy API layer

```
packages/shared-api-client/
├── src/
│   ├── client.ts           # axios instance
│   ├── auth-web.ts         # web JWT flow
│   ├── auth-tg.ts          # Telegram initData → JWT flow
│   └── endpoints/          # OpenAPI'dan generatsiya
```

### 4.6 Telegram bot (alohida microservice)

`apps/telegram-bot/` — grammY + NestJS. Bot quyidagilarni qiladi:
- `/start` → mini-app tugmasi (`web_app` button).
- Webhook → BullMQ'ga payload yuboradi (async ishlov).
- Notification: bemorga tashxis tayyor bo'lganda Telegram xabari.

Bot API Gateway bilan ichki HTTP orqali gaplashadi (private network).

### 4.7 Real-time (WebSocket)

`socket.io` allaqachon backend'da bor. Mini-app `socket.io-client` orqali ulanadi, autentifikatsiya `handshake.auth.token` orqali (JWT). Xonalar: `user:{id}`, `doctor:{id}`, `appointment:{id}`.

### 4.8 CORS, CSP, Telegram WebApp xavfsizligi

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: [
    'https://app.medsmart.uz',           // web
    'https://tg.medsmart.uz',            // mini-app (HTTPS majburiy!)
    'https://web.telegram.org'            // Telegram WebApp host
  ],
  credentials: true,
});
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      frameAncestors: ["'self'", "https://web.telegram.org"]  // iframe uchun
    }
  }
}));
```

### 4.9 Feature flag'lar (CLAUDE.md qoidasi 5)

```
APP_FEATURE_TG_MINIAPP=false        # stable bo'lgunicha prod'da o'chiq
APP_FEATURE_CONSULTATION=false
APP_FEATURE_HOME_VISIT=false
APP_FEATURE_RADIOLOGY=false
APP_FEATURE_DISEASE_KB=true         # 50 kasallik × L1 × uz
```

Backend'da `@FeatureFlag('tg_miniapp')` decorator → 404 qaytaradi flag o'chiq bo'lsa.

---

## 5. BOSQICHMA-BOSQICH REJA (12 HAFTA)

### PHASE 0 — Claude Code infra qurish (hafta 1, 3 kun)

- [ ] `.claude/agents/code-reviewer.md` (opus)
- [ ] `.claude/agents/security-auditor.md` (opus, OWASP + PHI checklist)
- [ ] `.claude/agents/test-writer.md` (sonnet, Jest + RTL)
- [ ] `.claude/agents/db-migrator.md` (sonnet, Prisma)
- [ ] `.claude/agents/api-builder.md` (sonnet, NestJS + Swagger)
- [ ] `.claude/agents/tg-integration-specialist.md` (opus)
- [ ] `.claude/hooks/phi-scanner.sh` (commit'da Supabase'ga PHI yoziladimi?)
- [ ] `.claude/hooks/` uchun lint + typecheck PostToolUse hook
- [ ] `.claude/skills/pr-review/SKILL.md`
- [ ] `.claude/skills/pre-deploy/SKILL.md`
- [ ] `.claude/skills/mock-to-real/SKILL.md` (frontend service'larni real'ga ko'chirish)
- [ ] `.claude/settings.json`'ga MCP: postgres, github, playwright, context7
- [ ] `CLAUDE.md`'ga "Lessons" bo'limi qo'shish (xatolar qaytarilmasligi uchun)

**Tekshirish:** `claude mcp list` → 4 ta server; sessiya boshida `/agents` → 6 ta subagent.

### PHASE 1 — Yo'q backend modullarni to'ldirish (hafta 2-3)

Har modul uchun `@api-builder` subagent + `@db-migrator` + `@test-writer` parallel git worktree'da:

- [ ] `server/src/consultation/` — 8 endpoint (book, list, reschedule, cancel, rate, join, doctor-list, availability)
- [ ] `server/src/home-visit/` — 6 endpoint + address validation
- [ ] `server/src/radiology/` — study upload (Supabase Storage), DICOM parse, AI-report stub
- [ ] Har modul: controller + service + DTOlar + `tests/` + Swagger ApiProperty
- [ ] Prisma migratsiyalari: `2026_04_22_add_consultations`, `..._add_home_visits`, `..._add_radiology_studies`
- [ ] `pnpm --dir apps/api openapi:generate` → yangilangan `openapi.json` commit

**Tekshirish:** `pnpm --dir server test` — 80%+ coverage; Swagger UI'da yangi endpointlar ko'rinadi.

### PHASE 2 — Mock'dan real API'ga ko'chirish (hafta 4)

- [ ] `packages/shared-types/` yaratish + `openapi-typescript` bilan auto-gen
- [ ] `src/services/api/*.ts` har birini `packages/shared-api-client/` ga migratsiya
- [ ] `VITE_USE_REAL_API=true` qilib har flow'ni manual test
- [ ] `@security-auditor` bilan authorization tekshirish
- [ ] Playwright E2E: `auth → book consultation → cancel` uchun happy path
- [ ] Mock service'larni `__mocks__/` papkasiga ko'chirish (test uchun qoldirish)

**Tekshirish:** `.env`'da `VITE_USE_REAL_API=true` bilan barcha flow ishlaydi; `pnpm e2e` → 0 fail.

### PHASE 3 — Monorepo migratsiya (hafta 5)

- [ ] `pnpm-workspace.yaml` + `turbo.json`
- [ ] `/src` → `apps/web/`
- [ ] `/server` → `apps/api/`
- [ ] `packages/shared-types/`, `packages/shared-ui/`, `packages/shared-utils/` yaratish
- [ ] CI (GitHub Actions) — affected packages only (`turbo run build --filter=...`)
- [ ] Root `CLAUDE.md` + har app uchun alohida `apps/*/CLAUDE.md`

**Tekshirish:** `pnpm build` → barcha paketlar green; CI <5 daqiqa.

### PHASE 4 — Telegram mini-app (hafta 6-8)

- [ ] `apps/telegram-miniapp/` — Vite + React 18 + `@telegram-apps/sdk-react`
- [ ] `packages/tg-auth/` — `initData` HMAC-SHA256 verification (shared)
- [ ] Backend: `server/src/tg-auth/` modul + `/api/v1/tg/auth/verify` endpoint + Jest test
- [ ] FE: `useTelegramAuth()` hook — startup'da `initDataRaw`'ni backend'ga yuborib JWT oladi
- [ ] `shared-ui` dan 3 ta asosiy flow'ni mini-app'ga bog'lash: Konsultatsiya, Uyga chaqirish, Tekshiruv
- [ ] Telegram-specific UX: `MainButton`, `BackButton`, `HapticFeedback`, theme params
- [ ] BotFather'da mini-app URL: `https://tg.medsmart.uz` (HTTPS majburiy)
- [ ] `APP_FEATURE_TG_MINIAPP=true` staging'da

**Tekshirish:** Telegram Desktop/Mobile'da mini-app ochiladi, login ishlaydi, konsultatsiya yoziladi.

### PHASE 5 — Telegram bot (hafta 9)

- [ ] `apps/telegram-bot/` — grammY + NestJS microservice
- [ ] `/start` → `web_app` button bilan mini-app'ni ochadi
- [ ] Notification queue: BullMQ `tg-notify` — tashxis tayyor bo'lganda bemorga xabar
- [ ] Commands: `/profile`, `/appointments`, `/cancel`
- [ ] Webhook vs long-polling: production'da webhook (nginx + HTTPS)

**Tekshirish:** Bot `/start` ga javob beradi; konsultatsiya tasdiqlanganda xabar keladi.

### PHASE 6 — Test, xavfsizlik, performance (hafta 10)

- [ ] `@security-auditor` OWASP Top 10 + tibbiy qonunchilik (O'zbekiston)
- [ ] PHI audit: qaysi jadval Supabase'da, qaysi mahalliy hosting'da?
- [ ] Load test: `k6` bilan 500 concurrent user
- [ ] Lighthouse: web ≥90, mini-app ≥85
- [ ] Sentry integratsiyasi (web + mini-app + api + bot)

**Tekshirish:** `pnpm --dir apps/api test:cov` ≥80%; Lighthouse reports `docs/performance/`.

### PHASE 7 — Prod deploy (hafta 11-12)

- [ ] Frontend (web + mini-app): Vercel, alohida domenlar (`app.*`, `tg.*`)
- [ ] Backend + bot: O'zbekiston hosting (PHI uchun) — Docker Compose yoki Kubernetes
- [ ] Postgres: managed (PHI: local O'zbekiston hosting, metadata: Supabase)
- [ ] Redis: managed
- [ ] CI/CD: PR → preview; main → staging; tag `v*` → prod
- [ ] Rollback plan: Prisma migrate resolve, Vercel instant rollback
- [ ] Runbook: `docs/runbooks/incident-response.md`

**Tekshirish:** Smoke test'lar prod'da green; Sentry alert rules yoqilgan.

### Yaxlit vaqt jadvali

| Hafta | Bosqich | Asosiy natija |
|---|---|---|
| 1 | Phase 0 | Claude Code infra qurilgan, 6 subagent + hooks ishlaydi |
| 2-3 | Phase 1 | Consultation + Home-visit + Radiology backend tayyor |
| 4 | Phase 2 | Frontend real API'ga ulangan |
| 5 | Phase 3 | Monorepo, shared-types, turborepo |
| 6-8 | Phase 4 | Telegram mini-app ishlaydi |
| 9 | Phase 5 | Telegram bot + notifications |
| 10 | Phase 6 | Security + load test + coverage ≥80% |
| 11-12 | Phase 7 | Production deploy + runbooks |

**Jami: ~12 hafta (3 oy)** — Claude Code bilan bitta dasturchi. An'anaviy: 6-9 oy, 2-3 kishi.

---

## 6. XULOSA VA BIRINCHI QADAM (BUGUN)

Loyiha **solid asosda** — frontend 75%, backend 80%, infra 60% tayyor. Asosiy "qarzlar":
1. 3 ta backend moduli yo'q.
2. Mini-app hali yoq.
3. Claude Code power-features (agent/hook/skill/MCP) ishlatilmayapti.

**Bugun 30 daqiqada qilinadigan ishlar:**
1. `.claude/agents/code-reviewer.md` yaratish.
2. Context7 MCP qo'shish: `claude mcp add context7`.
3. `CLAUDE.md`'ga `## Lessons` bo'limi qo'shib, hozirgi 10 xatoning har birini alohida qoida qilish.
4. Parallel git worktree: `feat/backend-consultation`, `feat/backend-home-visit`, `feat/backend-radiology`.
5. Har worktree'da alohida Claude sessiya, Plan Mode'da boshlash.

Sh u reja bilan **12 hafta ichida** MedSmart-Pro to'liq full-stack (web + mini-app + bot + unified backend) production-grade mahsulotga aylanadi.
