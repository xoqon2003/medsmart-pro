# Container Diagramma (C4 Model Level 2)

> **Hujjat ID:** ARC-002 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Hozirgi arxitektura (MVP)

```
┌─────────────────────────────────────────────────────────────┐
│                    MedSmart-Pro Platform                     │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────┐     │
│  │   Mini App (SPA)    │    │    Web Platform (SPA)   │     │
│  │                     │    │                         │     │
│  │ Entry: index.html   │    │ Entry: web.html         │     │
│  │ Router: App.tsx     │    │ Router: WebApp.tsx       │     │
│  │ 80+ screens         │    │ 13+ screens             │     │
│  │ Max-width: 425px    │    │ Full-screen             │     │
│  │ Bottom nav          │    │ Sidebar nav             │     │
│  └────────┬────────────┘    └──────────┬──────────────┘     │
│           │                            │                    │
│           └──────────┬─────────────────┘                    │
│                      │                                      │
│           ┌──────────▼──────────┐                           │
│           │   Shared Layers     │                           │
│           │                     │                           │
│           │ ┌─────────────────┐ │                           │
│           │ │  AppStore       │ │  React Context            │
│           │ │  (appStore.tsx) │ │  Global state management  │
│           │ └─────────────────┘ │                           │
│           │ ┌─────────────────┐ │                           │
│           │ │  Types          │ │  TypeScript interfaces    │
│           │ │  (types/)       │ │  User, Application, etc.  │
│           │ └─────────────────┘ │                           │
│           │ ┌─────────────────┐ │                           │
│           │ │  Services       │ │  Mock → API swap          │
│           │ │  (services/)    │ │  auth, app, booking, etc. │
│           │ └─────────────────┘ │                           │
│           │ ┌─────────────────┐ │                           │
│           │ │  UI Components  │ │  shadcn/ui (50+)          │
│           │ │  (components/ui)│ │  Radix UI primitives      │
│           │ └─────────────────┘ │                           │
│           └─────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Konteyner tafsilotlari

### 1. Mini App (Telegram Mini App)

| Xususiyat | Qiymat |
|-----------|--------|
| **Turi** | Single Page Application |
| **Texnologiya** | React 18 + TypeScript + Vite |
| **Kirish nuqtasi** | `index.html` → `src/main.tsx` → `App.tsx` |
| **Foydalanuvchilar** | Bemorlar va tibbiy xodimlar (mobil) |
| **Layout** | Max-width 425px, bottom navigation |
| **Ekranlar** | 80+ (patient, radiolog, doctor, specialist, operator, admin, kassir) |

### 2. Web Platform (Desktop Panel)

| Xususiyat | Qiymat |
|-----------|--------|
| **Turi** | Single Page Application |
| **Texnologiya** | React 18 + TypeScript + Vite |
| **Kirish nuqtasi** | `web.html` → `src/web-main.tsx` → `WebApp.tsx` |
| **Foydalanuvchilar** | Tibbiy xodimlar (desktop) |
| **Layout** | Full-screen, sidebar navigation |
| **Ekranlar** | 13+ (web_admin, web_radiolog, web_doctor, web_operator, web_kassir, ...) |

### 3. AppStore (Global State)

| Xususiyat | Qiymat |
|-----------|--------|
| **Turi** | React Context Provider |
| **Fayl** | `src/app/store/appStore.tsx` |
| **Ma'lumotlar** | currentUser, applications, notifications, drafts, audit |
| **Funksiyalar** | navigate, goBack, updateApplicationStatus, addApplication |

### 4. Mock Services

| Service | Fayl | Vazifasi |
|---------|------|---------|
| authService | `services/mock/authService.ts` | Foydalanuvchi autentifikatsiyasi |
| applicationService | `services/mock/applicationService.ts` | Ariza CRUD |
| bookingService | `services/mock/bookingService.ts` | Shifokor band qilish, geo ma'lumotlar |
| examinationService | `services/mock/examinationService.ts` | Tekshiruv markazlari |
| notificationService | `services/mock/notificationService.ts` | Bildirishnomalar |

### 5. UI Component Library

| Kategoriya | Komponentlar soni | Texnologiya |
|-----------|------------------|-------------|
| Form | 10+ | React Hook Form, Radix |
| Layout | 8+ | shadcn/ui |
| Dialog | 5+ | Radix UI |
| Navigation | 5+ | shadcn/ui |
| Data Display | 5+ | shadcn/ui |
| Feedback | 4+ | Sonner, Radix |
| Custom | 10+ | Patient, Figma, Screens |

## Aloqa oqimlari

```
Telegram Bot ──── Bot API ────▶ Mini App (index.html)
                                    │
                                    ▼
                               AppStore ◀──── Web Platform (web.html)
                                    │              │
                                    ▼              ▼
                              Mock Services   Mock Services
                              (shared data)   (shared data)
```

**Muhim:** Mini App va Web Platform bitta AppStore va Mock Services dan foydalanadi. Arizalar, to'lovlar va bildirishnomalar ikki platformada sinxron ko'rinadi.
