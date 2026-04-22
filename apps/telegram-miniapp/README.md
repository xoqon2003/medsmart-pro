# MedSmart-Pro — Telegram Mini-App

## Ishga tushirish

```bash
cd apps/telegram-miniapp
pnpm install
cp .env.example .env
pnpm dev
```

## Telegram orqali testlash

1. Bot yarating (@BotFather) → tokenni `.env` ga qo'ying (server).
2. Mini-app URL'ini BotFather'da belgilang: `/setmenubutton` yoki `/newapp`.
3. Lokalda `ngrok http 5174` orqali public URL oling.
4. Bot'dagi WebApp tugmasi orqali oching.

## Struktura

```
src/
  hooks/useTelegramAuth.ts  — initData → JWT mubodalasi
  App.tsx                   — root komponent
  main.tsx                  — React mount
```

## Kelgusi ishlar

- [ ] Routing (`react-router-dom@7`)
- [ ] Disease KB ekrani
- [ ] Consultation ekrani
- [ ] Home-visit ekrani
- [ ] Shared UI komponentlar (`packages/shared-ui`)
