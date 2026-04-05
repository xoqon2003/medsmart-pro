# MedSmart-Pro - Loyiha Konteksti (LLM uchun)

> Bu fayl AI yordamchilari va LLM modellari uchun loyiha kontekstini taqdim etadi.
> **Oxirgi yangilanish:** 2026-03-25 | **Versiya:** 2.0

## Umumiy ma'lumot

- **Nomi:** MedSmart-Pro
- **Turi:** Tibbiy diagnostika va teletibbiyot platformasi
- **Til:** O'zbek tili (interfeys), TypeScript (kod)
- **Holat:** MVP - ishlaydigan frontend + NestJS backend (mock/real almashtirishga tayyor)
- **URL:** https://medsmart-pro.vercel.app/ (mini app), https://medsmart-pro.vercel.app/web (web panel)

## Arxitektura

### Dual Interface
- **Mini App** (`index.html` → `src/main.tsx` → `App.tsx`) - Telegram Mini App, mobil interfeys, max-width 425px
- **Web Platform** (`web.html` → `src/web-main.tsx` → `WebApp.tsx`) - Desktop panel, to'liq ekran
- **Backend** (`server/`) - NestJS + Prisma ORM + PostgreSQL (Supabase)

### Tech Stack
| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | React 19, TypeScript, Tailwind CSS, shadcn/ui |
| State | React Context (appStore.tsx) |
| Backend | NestJS, Prisma ORM, JWT auth |
| Database | PostgreSQL (Supabase) |
| Hosting | Vercel (frontend + serverless) |
| Bot | Telegram Bot API (rejada) |

### Shared qatlamlar
- **Types:** `src/app/types/index.ts` - barcha TypeScript interfeyslari
- **Store:** `src/app/store/appStore.tsx` - React Context global state
- **Services:** `src/services/` - mock → real API almashtirishga tayyor (`index.ts` da `./mock` → `./api`)
- **Components:** `src/app/components/ui/` - shadcn/ui komponentlari (50+)
- **Data:** `src/app/data/mockData.ts` - test ma'lumotlari

### Navigatsiya
- Mini App: `currentScreen` state orqali ekranlar almashinadi (80+ ekran)
- Web: `web_login` → `web_dashboard` → rol asosida panellar
- Vercel routing: `/web` → `web.html`, `/` → `index.html`

## Backend (NestJS)

### Server tuzilishi
```
server/
├── src/
│   ├── main.ts              # Entry point (port 3000, prefix /api/v1)
│   ├── auth/                # JWT auth (send-otp, verify-otp, login, me)
│   ├── users/               # User CRUD
│   ├── applications/        # Application CRUD + status workflow
│   ├── conclusions/         # Medical conclusions
│   ├── payments/            # Payment processing
│   ├── notifications/       # User notifications
│   ├── booking/             # Doctor booking + slots
│   ├── examinations/        # Examination centers
│   └── kassa/               # Cashier operations
├── prisma/
│   ├── schema.prisma        # 14 model, 8 enum
│   └── seed.ts              # Demo data seeder
└── .env                     # DATABASE_URL, JWT_SECRET
```

### API Endpoints (26 ta)
- **Auth:** 4 endpoint (send-otp, verify-otp, login, me)
- **Users:** 3 endpoint (list, get, update)
- **Applications:** 5 endpoint (list, get, create, update, status)
- **Conclusions:** 2 endpoint (list, create)
- **Payments:** 3 endpoint (create, confirm, refund)
- **Notifications:** 3 endpoint (list, read, read-all)
- **Booking:** 4 endpoint (doctors, slots, geo, specialties)
- **Examinations:** 2 endpoint (centers, exams)
- **Kassa:** 5 endpoint (smena CRUD, tolov CRUD)

> 📖 To'liq spec: `docs/06-api-specification/api-endpoints.yaml`

### Database modellari (14 ta)
User, Application, Anamnez, FileRecord, Payment, Conclusion, AuditEvent, Notification, Examination, KassaSmena, KassaTolov, ExaminationCenter, BookingSlot

### Frontend ↔ Backend ulanish
`src/services/index.ts` da eksportni o'zgartirish:
- `export * from './mock'` → Mock rejimi (hozirgi)
- `export * from './api'` → Real API rejimi

Frontend API clientlar tayyor: `src/services/api/` (authService, applicationService, notificationService, bookingService, examinationService)
**Yetishmayotgan client:** paymentService, conclusionService, kassaService

## Asosiy domenlar

### 1. Ariza (Application)
Markaziy domen modeli. 11 ta holat workflow:
```
NEW → PAID_PENDING → ACCEPTED → ASSIGNED → IN_PROGRESS →
WAITING_RESULT → RESULT_READY → CONSULTATION → COMPLETED → DONE
(istalgan bosqichda → REJECTED)
```

### 2. Xizmat turlari
| Tur | Kod | Bazaviy narx |
|-----|-----|-------------|
| AI + Radiolog tahlili | XRAY | 150,000 so'm |
| Faqat radiolog | MRI | 200,000 so'm |
| Radiolog + Mutaxassis | CT | 350,000 so'm |
| UZI | ULTRASOUND | - |
| Flyuorografiya | FLUOROGRAPHY | - |

Shoshilinchlik koeffitsienti: NORMAL (1.0x), URGENT (1.5x), EMERGENCY (2.0x)

### 3. To'lov
Provayderlar: PAYME, CLICK, UZUM, CASH, CARD, TRANSFER, INSURANCE
Holatlar: PENDING → COMPLETED / FAILED / REFUNDED

### 4. Xulosa (Conclusion)
Turlari: AI, RADIOLOG, SPECIALIST, DOCTOR
PDF generatsiya: `src/app/utils/pdfGenerator.ts`

### 5. Kassa
Smena boshqaruvi (OCHIQ/YOPIQ), to'lovlar qayd qilish (NAQD/KARTA/ARALASH)

## Rollar (7 ta)

| Rol | Kod | Mini App | Web | Tavsif |
|-----|-----|---------|-----|--------|
| Bemor | PATIENT | ✅ | ❌ | Ariza topshiruvchi |
| Shifokor | DOCTOR | ✅ | ✅ | Yo'llanma beruvchi, konsultant |
| Radiolog | RADIOLOG | ✅ | ✅ | Tasvir tahlilchi, xulosa yozuvchi |
| Mutaxassis | SPECIALIST | ✅ | ✅ | Tor mutaxassis, maslahatchi |
| Operator | OPERATOR | ✅ | ✅ | Ariza boshqaruvchi |
| Admin | ADMIN | ✅ | ✅ | Tizim boshqaruvchi |
| Kassir | CASHIER | ✅ | ✅ | To'lov qabul qiluvchi |

## Frontend fayl tuzilishi

```
src/
├── app/
│   ├── App.tsx              # Mini App router
│   ├── WebApp.tsx           # Web Platform router
│   ├── components/
│   │   ├── screens/         # Rol asosida ekranlar
│   │   │   ├── patient/     # 40+ bemor ekranlari
│   │   │   ├── radiolog/    # Radiologiya paneli
│   │   │   ├── doctor/      # Shifokor paneli
│   │   │   ├── specialist/  # Mutaxassis paneli
│   │   │   ├── operator/    # Operator paneli
│   │   │   ├── admin/       # Admin paneli
│   │   │   ├── kassir/      # Kassa paneli
│   │   │   └── web/         # Web platform ekranlari
│   │   └── ui/              # shadcn/ui komponentlari (50+)
│   ├── store/appStore.tsx   # Global state
│   ├── types/index.ts       # TypeScript interfeyslari
│   ├── data/mockData.ts     # Mock ma'lumotlar
│   └── utils/pdfGenerator.ts
├── services/
│   ├── index.ts             # Service eksportlari (mock ↔ api switch)
│   ├── mock/                # Mock implementatsiyalar
│   └── api/                 # Real API clientlar
└── styles/                  # CSS fayllar
```

## Hujjatlar tuzilishi

```
docs/ (37 fayl)
├── 00-standards/   # Metodologiyalar (IEEE, BABOK, C4, ISTQB)
├── 01-business/    # Vizyon + 80+ biznes qoidasi
├── 02-requirements/# 60+ funksional + nofunksional talablar
├── 03-use-cases/   # 7 aktor + 10+ user story
├── 04-architecture/# ARC42 + C4 container diagramma
├── 05-data-architecture/ # CDM + LDM (14 jadval) + data dictionary
├── 06-api-specification/ # OpenAPI 3.0 spec (26 endpoint) + versioning
├── 07-integrations/# 19 ta integratsiya xaritasi
├── 08-security/    # RBAC + security policy
├── 09-modules/     # 7 modul (auth, app, radiology, consultation, examination, payment, home-visit)
├── 10-devops/      # Vercel deployment + runbook
├── 11-testing/     # Test strategiyasi + 30+ test case
├── 12-changelog/   # v1.0.0 changelog
├── 13-onboarding/  # Yangi xodimlar qo'llanmasi
├── 14-practicals/  # Demo credentials + test stsenariylari
├── 15-templates/   # User story + modul shablonlari
├── PROJECT_CONTEXT.md  # Ushbu fayl
├── README.md
└── doc-update-checklist.md # O'zgarishlar nazorati (10 trigger, cross-ref matritsa)
```

## Muhim qoidalar

1. **Mini App va Web bitta backenddan foydalanadi** - `server/` NestJS, CORS sozlangan
2. **Arizalar sinxron** - mini appdan topshirilgan ariza webda ko'rinadi va aksincha
3. **Rolga asoslangan kirish** - har bir rol o'z ekranlariga ega, JWT + RBAC
4. **Audit log** - barcha muhim harakatlar AuditEvent jadvaliga qayd qilinadi
5. **Smart polling** - 15 soniyada yangilanish (kelajakda WebSocket)
6. **Hujjat yangilash qoidasi** - har bir o'zgarishda `doc-update-checklist.md` ga amal qilinishi shart
7. **Mock ↔ Real switch** - `src/services/index.ts` da bitta qator o'zgarishi bilan

## Integratsiyalar (rejada)

| # | Tizim | Maqsad | Holat |
|---|-------|--------|-------|
| 1 | Telegram Bot API | Bot + Mini App | Rejada |
| 2 | Payme | Onlayn to'lov | Rejada |
| 3 | Click | Onlayn to'lov | Rejada |
| 4 | Uzum Bank | Onlayn to'lov | Rejada |
| 5 | Supabase | PostgreSQL database | Tayyor (schema) |
| 6 | AI Model | Radiologik tasvir tahlili | Rejada |
| 7 | SMS Gateway | OTP yuborish | Rejada |
