# MedSmart-Pro — Telegram Bot (grammY)

## Ishga tushirish

```bash
cd apps/bot
pnpm install
cp .env.example .env
# .env'ni tahrirlang (BOT_TOKEN + MINIAPP_URL)
pnpm dev
```

## Webhook (prod)

Production'da polling o'rniga webhook ishlating:

```ts
import { webhookCallback } from 'grammy';
// Express/Nest adapter orqali public HTTPS URL'ga ulang.
```

Telegram faqat quyidagi CIDR'lardan so'rovlar yuboradi:
- 149.154.160.0/20
- 91.108.4.0/22

Kiruvchi IP'ni filter qiling.

## Komandalar

- `/start` — Mini-App ochish tugmasi.
- `/help` — yordam.
- `/about` — loyiha haqida.
