# Arxitektura Dizayn Hujjati (ADD)

> **Hujjat ID:** ARC-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25 | **Standart:** ARC42 / IEEE 1471

## 1. Kirish

### 1.1 Maqsad
MedSmart-Pro - tibbiy diagnostika va teletibbiyot platformasi uchun arxitektura qarorlari va tuzilishini hujjatlashtirish.

### 1.2 Arxitektura yondashuvi
**Hozirgi (MVP):** Monolitik SPA (Single Page Application) + Mock Services
**Kelajak (v2.0):** Modular Monolith (NestJS) → Microservices

## 2. Kontekst diagrammasi (C4 Level 1)

```
                    ┌──────────────┐
                    │   Telegram   │
                    │   Bot API    │
                    └──────┬───────┘
                           │
┌──────────┐    ┌──────────▼───────────┐    ┌──────────────┐
│  Bemor   │───▶│   MedSmart-Pro       │◀──▶│  To'lov      │
│ (mobil)  │    │   Platformasi        │    │ Provayderlari│
└──────────┘    │                      │    └──────────────┘
                │  - Mini App (/)      │
┌──────────┐    │  - Web Panel (/web)  │    ┌──────────────┐
│  Tibbiy  │───▶│  - API (kelajak)     │◀──▶│  AI Model    │
│  xodim   │    │                      │    │ (tasvir      │
│ (desktop)│    └──────────────────────┘    │  tahlili)    │
└──────────┘                                └──────────────┘
```

## 3. Texnik qarorlar

### 3.1 Frontend arxitekturasi

| Qaror | Tanlangan | Alternativlar | Sabab |
|-------|-----------|--------------|-------|
| Framework | React 18 | Vue, Angular | Keng ekosistem, Telegram WebApp mos |
| Build tool | Vite 6 | Webpack, Turbopack | Tez HMR, multi-page support |
| UI library | shadcn/ui | MUI, Ant Design | Lightweight, customizable |
| Styling | Tailwind CSS | CSS Modules, Styled | Utility-first, tez prototiplash |
| State | React Context | Redux, Zustand | Oddiy, yetarli MVP uchun |
| Forms | React Hook Form | Formik | Performance, minimal re-render |
| Charts | Recharts | Chart.js, D3 | React-native, deklarativ |

### 3.2 Multi-page arxitektura

```
┌─────────────────────────────────────────────┐
│                  Vite Build                  │
│                                             │
│  index.html ──▶ src/main.tsx ──▶ App.tsx    │
│  (Mini App)     React.render    (80+ ekran) │
│                                             │
│  web.html ──▶ src/web-main.tsx ──▶ WebApp   │
│  (Web Panel)   React.render    (13+ ekran)  │
│                                             │
│            Shared Layers:                   │
│  ┌─────────────────────────────────────┐    │
│  │ types/ │ store/ │ services/ │ ui/   │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 3.3 Navigatsiya modeli

**Mini App** - screen-based navigation:
```typescript
// appStore.tsx
currentScreen: Screen  // 80+ screen enum
screenHistory: Screen[]  // back navigation stack
navigate(screen)  // push to history
goBack()  // pop from history
```

**Web Platform** - role-based dashboard:
```
web_login → web_dashboard → web_{role}
```

### 3.4 Service Layer abstraktsiyasi

```
┌─────────────┐     ┌──────────────┐
│  Components │────▶│  services/   │
│  (UI)       │     │  index.ts    │
└─────────────┘     └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  mock/       │ ◀── Hozir
                    │  (local data)│
                    └──────────────┘
                    ┌──────────────┐
                    │  api/        │ ◀── Kelajak
                    │  (HTTP calls)│
                    └──────────────┘
```

`src/services/index.ts` da import o'zgartirilsa, mock → real API ga o'tiladi.

## 4. Deployment arxitekturasi

```
┌─────────────────────────┐
│       Vercel CDN        │
│                         │
│  /        → index.html  │  (Mini App)
│  /web     → web.html    │  (Web Panel)
│  /assets  → static      │  (JS, CSS, images)
│                         │
│  vercel.json routing    │
└─────────────────────────┘
```

## 5. Ma'lumot oqimi

### Ariza yaratish oqimi
```
Bemor (Mini App)
  │
  ├─ 1. Fayl yuklash (DICOM/JPG)
  ├─ 2. Anamnez to'ldirish
  ├─ 3. Xizmat tanlash + narx
  ├─ 4. Shartnoma qabul qilish
  ├─ 5. To'lov qilish
  │
  ▼
AppStore (Global State)
  │
  ├─ applications[] ga qo'shiladi
  ├─ audit log yoziladi
  ├─ notification yaratiladi
  │
  ▼
Radiolog (Mini App / Web)
  │
  ├─ Arizani ko'radi va qabul qiladi
  ├─ Xulosa yozadi
  ├─ (ixtiyoriy) Mutaxassisga yo'naltiradi
  │
  ▼
Bemor
  │
  └─ Xulosa ko'radi, PDF yuklab oladi
```

## 6. Xavfsizlik arxitekturasi

| Qatlam | Himoya | Holat |
|--------|--------|-------|
| Transport | HTTPS (Vercel) | Tayyor |
| Autentifikatsiya | Phone + PIN / Telegram initData | Tayyor |
| Avtorizatsiya | RBAC (rolga asoslangan) | Tayyor |
| Ma'lumot | Soft delete, audit log | Tayyor |
| API | JWT token (kelajak) | Mock |
| Fayl | File type validation | Tayyor |

## 7. Kelajak arxitektura (v2.0)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Mini App │  │ Web App  │  │ Telegram │
│ (React)  │  │ (React)  │  │ Bot      │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
            ┌──────▼──────┐
            │  API Gateway│
            │  (NestJS)   │
            └──────┬──────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
┌────▼────┐  ┌────▼────┐  ┌────▼────┐
│Auth     │  │App      │  │Payment  │
│Service  │  │Service  │  │Service  │
└────┬────┘  └────┬────┘  └────┬────┘
     │             │             │
┌────▼─────────────▼─────────────▼────┐
│            PostgreSQL               │
│     + Redis Cache + MinIO Storage   │
└─────────────────────────────────────┘
```
