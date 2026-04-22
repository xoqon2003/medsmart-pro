# Claude Code integratsiyasi — MedSmart-Pro (2026-04-21)

Ushbu qo'llanma Cowork'da yaratilgan infrastruktura va skeleton'larni Claude Code muhitida ishga tushirish va to'liq foydalanish tartibini ko'rsatadi.

## 1. Papka tekshiruvi

Cowork sessiyasidan keyin loyihada quyidagilar paydo bo'lishi kerak:

```
.claude/
  agents/
    code-reviewer.md
    security-auditor.md
    api-builder.md
    db-migrator.md
    test-writer.md
    tg-integration-specialist.md
    phi-guardian.md
  hooks/
    phi-scanner.sh         (chmod +x)
    secret-scanner.sh      (chmod +x)
    lint-after-edit.sh     (chmod +x)
  skills/
    pr-review/SKILL.md
    pre-deploy/SKILL.md
    mock-to-real/SKILL.md
  settings.json            (hooks + MCP)

CLAUDE.md                  (## Lessons seksiyasi qo'shilgan)

server/src/
  consultation/            (controller + service + dto + tests)
  home-visit/
  radiology/
  tg-auth/

packages/
  tg-auth/                 (HMAC-SHA256 verifier + tests)

apps/
  telegram-miniapp/        (Vite + React + WebApp SDK)
  bot/                     (grammY)

pnpm-workspace.yaml        (monorepo)
```

Tekshirish:
```bash
find .claude -type f | sort
ls server/src/{consultation,home-visit,radiology,tg-auth}
ls packages/tg-auth apps/telegram-miniapp apps/bot
```

## 2. Dastlabki o'rnatish

```bash
# Workspace dependencies
pnpm install -w

# Server (yangi modullar uchun tiplari generatsiya)
pnpm --dir server exec prisma generate

# Hooks ishga tushuvchi bo'lishini tasdiqlang
chmod +x .claude/hooks/*.sh
```

## 3. Claude Code'da birinchi sinov

```bash
claude
```

Buyruqlar:
```
/agents                   # 7 ta agent ro'yxatda bo'lishi kerak
/skills                   # 3 ta skill
```

Test qilish:
```
@code-reviewer  triage moduliga oxirgi o'zgarishlarni tekshir.
@phi-guardian   server/src/ ichidan Supabase PHI oqimini audit qil.
/skill pre-deploy
```

## 4. Feature flag'larni yoqish (dev/stage)

`.env` (server):
```
APP_FEATURE_CONSULTATION=true
APP_FEATURE_HOME_VISIT=true
APP_FEATURE_RADIOLOGY=true
APP_FEATURE_TELEGRAM=true
```

Prod'da **false** holatida qoldiring — yangi endpointlar 404 qaytaradi.

## 5. Testlarni ishga tushirish

```bash
# Yangi modul testlari
pnpm --dir server test consultation
pnpm --dir server test home-visit
pnpm --dir server test radiology
pnpm --dir server test tg-auth

# packages/tg-auth
pnpm --dir packages/tg-auth test
```

Hammasi yashil bo'lishi kerak.

## 6. OpenAPI regen

```bash
pnpm --dir server run openapi:generate
pnpm dlx openapi-typescript server/openapi.json -o src/app/types/api.generated.ts
```

## 7. Telegram Mini-App lokal test

1. `@BotFather`dan bot oling → tokenni `server/.env` va `apps/bot/.env`ga qo'ying.
2. `apps/telegram-miniapp/.env` → `VITE_API_URL=http://localhost:3000/api/v1`.
3. Terminal 1: `pnpm --dir server start:dev`
4. Terminal 2: `pnpm --dir apps/telegram-miniapp dev` (port 5174).
5. Terminal 3: `ngrok http 5174` → public URL oling.
6. Terminal 4: `pnpm --dir apps/bot dev` (yoki webhook'ni public URL'ga yo'naltiring).
7. BotFather'da `/setmenubutton` → mini-app URL (ngrok).
8. Telegram'da bot bilan `/start` → WebApp tugmasi → mini-app ochiladi → avtomatik JWT oladi.

## 8. MCP server'lar

`.claude/settings.json` faylida `postgres`, `github`, `playwright`, `context7` sozlangan. Ularni ishlatish uchun:

```bash
export DATABASE_URL="postgresql://..."
export GITHUB_TOKEN="ghp_..."
```

Keyin Claude Code'da:
```
@postgres  List all tables in public schema
@github    Create issue: "Consultation module e2e tests"
@playwright Open http://localhost:5173 and click "Login"
@context7  Get NestJS 10 guards docs
```

## 9. Keyingi ishlar (TODO)

- [ ] `frontend` da mock-to-real migration boshlash — `src/services/api/consultation.ts` va h.k.
- [ ] `apps/telegram-miniapp/` ichida disease KB, consultation, home-visit ekranlari.
- [ ] E2E testlar `playwright` MCP bilan.
- [ ] `notifications` moduliga Telegram bot adapter qo'shish (grammY orqali).
- [ ] `User.phone` TG auth flow'ida default emas, `/profile` ekran orqali to'ldirilishi.
- [ ] Production'da webhook (polling emas).

## 10. Troubleshooting

**Agent chaqirilmayapti?** — `.claude/agents/<name>.md` frontmatter'ida `name:` sizniki bilan bir xilmi tekshiring.

**Hook bajarilmayapti?** — `chmod +x .claude/hooks/*.sh` va `settings.json`'da to'g'ri `command` yo'li.

**tg-auth 401 qaytaryapti?** — `TELEGRAM_BOT_TOKEN` mos kelmaydi; BotFather'dagi tokenni server env'iga qo'ying.

**Prisma P2002 (unique constraint) `telegramId` da** — bir xil telegramId bilan ikki marta login bo'layotgan; upsert to'g'ri ishlasa muammo bo'lmasligi kerak. Log'ni tekshiring.

**initData yaroqsiz** — Mini-App Telegram'dan tashqari browserda ochilgan. `(window as any).Telegram?.WebApp?.initData` bo'sh.
