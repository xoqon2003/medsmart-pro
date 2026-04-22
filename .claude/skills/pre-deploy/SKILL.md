---
name: pre-deploy
description: MedSmart-Pro deploy oldi checklist. Test, build, migration, secret skan, PHI skan, OWASP audit. NO-GO/GO verdikt.
---

# Pre-deploy checklist

## 1. Testlar
```bash
pnpm --dir server test --coverage
pnpm --dir server test:e2e
pnpm test  # frontend
```
Talab: **coverage ≥ 80%**, barcha testlar yashil.

## 2. Build
```bash
pnpm build
pnpm --dir server build
```
Nol warning (TS strict).

## 3. Migration
```bash
pnpm --dir server exec prisma migrate status
```
Kutilgan: "Database schema is up to date\!" — yangi migration bo'lsa qo'lda tekshir.

## 4. Secret skan
```bash
grep -rnE '(sk-[a-zA-Z0-9]{20,}|SUPABASE_SERVICE_ROLE|JWT_SECRET=|TELEGRAM_BOT_TOKEN=)' --exclude-dir=node_modules --exclude-dir=.git .
```
Hech narsa chiqmasligi kerak (faqat `.env.example`).

## 5. phi-guardian subagent ishga tushirish.

## 6. security-auditor subagent ishga tushirish.

## 7. Feature flag tekshiruvi
Yangi modullar `APP_FEATURE_<X>=false` prod'da, bu muhim.

## 8. OpenAPI sync
```bash
pnpm --dir server run openapi:generate
git diff server/openapi.json  # o'zgarish commit qilinganmi?
```

## Verdikt
- **GO**: barcha yashil.
- **NO-GO**: bitta qizil qadam yetarli.

## Output
```
=== PRE-DEPLOY ===
Tests: PASS/FAIL (coverage: XX%)
Build: PASS/FAIL
Migrations: CLEAN/PENDING
Secrets: CLEAN/FOUND
PHI: CLEAN/BLOCKERS
Security: CLEAN/FINDINGS
Feature flags: OK
OpenAPI: SYNC/DRIFT

VERDICT: GO | NO-GO
```
