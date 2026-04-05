# Deployment Hujjati

> **Hujjat ID:** OPS-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Hozirgi deployment

### Vercel
- **URL:** https://medsmart-pro.vercel.app/
- **Mini App:** https://medsmart-pro.vercel.app/ (index.html)
- **Web Panel:** https://medsmart-pro.vercel.app/web (web.html)

### Vercel konfiguratsiyasi (`vercel.json`)
```json
{
  "rewrites": [
    { "source": "/web", "destination": "/web.html" },
    { "source": "/web/", "destination": "/web.html" },
    { "source": "/((?!web|assets|favicon).*)", "destination": "/index.html" }
  ]
}
```

### Build jarayoni
```bash
# Development
npm run dev          # localhost:5173

# Production build
npm run build        # dist/ papkasiga chiqaradi

# Build natijasi
dist/
├── index.html       # Mini App
├── web.html         # Web Platform
└── assets/          # JS, CSS, images
```

### Vite konfiguratsiyasi (`vite.config.ts`)
```typescript
build: {
  rollupOptions: {
    input: {
      main: 'index.html',   // Mini App entry
      web: 'web.html',      // Web Platform entry
    }
  }
}
```

## CI/CD (kelajak)

### GitHub Actions pipeline
```
Push to main
  → Lint (ESLint)
  → Type check (tsc --noEmit)
  → Unit tests (vitest)
  → Build (vite build)
  → Deploy (Vercel auto-deploy)
```

## Environment o'zgaruvchilari (kelajak)

| O'zgaruvchi | Tavsif | Production | Development |
|-------------|--------|-----------|-------------|
| `VITE_API_URL` | Backend API | https://api.medsmart-pro.uz | http://localhost:3000 |
| `VITE_TELEGRAM_BOT_TOKEN` | Bot token | *** | *** |
| `VITE_SENTRY_DSN` | Error tracking | *** | - |

## Monitoring (kelajak)

| Xizmat | Maqsad |
|--------|--------|
| Sentry.io | Error tracking |
| Vercel Analytics | Performance monitoring |
| Grafana | Server metrics (backend tayyor bo'lganda) |
