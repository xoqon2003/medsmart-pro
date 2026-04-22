# @medsmart/web — Web Platform

MedSmart-Pro'ning web yuzasi (surface). Vite + React 18 + Router v7 + Tailwind 4 + shadcn/ui.

## Holat: Phase 2.1 — skeleton

Bu workspace **skeleton** bosqichida. Hozircha `src/` hali monorepo root'da
(`../../src/`); `vite.config.ts` `root: projectRoot` orqali unga ulanadi.

Bu oraliq holatning maqsadi:

1. `pnpm-workspace.yaml` ga `apps/web` ni qo'shish (pattern `apps/*`
   allaqachon qamragan — alohida yozuv shart emas).
2. Workspace'ni ro'yxatga olish — `pnpm --filter @medsmart/web <script>`
   ishlay boshlaydi.
3. Root'dagi `vite.config.ts` / `web.html` / `index.html` / `src/` fayllarini
   **o'zgartirmasdan** parallel run qilish — regression risk nol.

## Komandalar

```bash
# Dev server (:5173 portida)
pnpm --filter @medsmart/web dev

# Production build (→ apps/web/dist/)
pnpm --filter @medsmart/web build

# TypeScript tekshirish
pnpm --filter @medsmart/web typecheck
```

## Phase 2.2 — fayllarni ko'chirish (keyingi bosqich)

Tayyor bo'lganda quyidagi migratsiya amalga oshiriladi:

```
src/              → apps/web/src/
web.html          → apps/web/index.html   (rename: web → index)
index.html        → apps/telegram-miniapp/index.html  (yoki alohida app)
public/           → apps/web/public/
```

Shu bilan birga `apps/web/vite.config.ts` dan quyidagilar olib tashlanadi:

- `root: projectRoot` (default apps/web/ bo'ladi)
- `alias '@'` → `path.resolve(__dirname, './src')` ga soddalashadi
- `rollupOptions.input.web` → `input` (default `index.html`) ga aylanadi
- Root'dagi `vite.config.ts` butunlay o'chiriladi

## Phase 2.3 — routing migratsiyasi (parallel / keyinroq)

GAP tahlili bo'yicha `WebApp.tsx` switch'da 45 ta `web_*` screen React
Router route'lariga ega emas. Har bir screen uchun `router.tsx` ga yozuv
qo'shiladi, `AppStore.navigate()` chaqiruvlari `useNavigate()` ga o'tadi,
oxirida `WebApp.tsx` o'chiriladi.

Batafsil: `docs/analysis/monorepo-migration.md` (hozircha mavjud emas,
Phase 2.3 da yoziladi).
