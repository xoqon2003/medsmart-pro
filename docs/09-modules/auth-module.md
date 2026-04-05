# Auth Moduli - Autentifikatsiya

> **Modul ID:** MOD-AUTH | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Umumiy

Foydalanuvchilarni ro'yxatdan o'tkazish, tizimga kirish va sessiya boshqarish moduli.

## Fayl joylashuvi

| Fayl | Maqsad |
|------|--------|
| `src/services/mock/authService.ts` | Auth service (mock) |
| `src/app/store/appStore.tsx` | currentUser, login/logout |
| `src/app/components/screens/web/WebLogin.tsx` | Web login ekrani |
| `src/app/App.tsx` | Role select (Mini App) |

## Autentifikatsiya oqimlari

### Mini App (Telegram)
```
Telegram Bot → /start → Mini App ochiladi
  → initData dan user aniqlanadi
  → Rol tanlash ekrani (role_select)
  → Tanlangan rol bilan navigate
```

### Web Platform
```
web_login sahifasi ochiladi
  → Telefon raqami kiritiladi
  → PIN kod kiritiladi (6 raqam)
  → Server tekshiradi
  → Rol asosida web_dashboard ga yo'naltiriladi
```

## Rollar

| Rol | Kodi | Mini App | Web | Tavsif |
|-----|------|---------|-----|--------|
| Bemor | `patient` | + | - | Ariza topshiruvchi |
| Radiolog | `radiolog` | + | + | Tasvir tahlilchi |
| Shifokor | `doctor` | + | + | Konsultant |
| Mutaxassis | `specialist` | + | + | Tor mutaxassis |
| Operator | `operator` | + | + | Ariza boshqaruvchi |
| Admin | `admin` | + | + | Tizim boshqaruvchi |
| Kassir | `kassir` | + | + | To'lov qabul qiluvchi |

## Demo kirish ma'lumotlari

| Rol | Telefon | PIN | User ID |
|-----|---------|-----|---------|
| Admin | +998903333333 | 000000 | 4 |
| Operator | +998902222222 | 654321 | 3 |
| Kassir | +998908888888 | 222222 | 9 |
| Radiolog | +998901111111 | 123456 | 2 |
| Mutaxassis | +998906666666 | 111111 | 7 |
| Shifokor | +998907777777 | 777777 | 8 |
| Bemor | +998901234567 | 0000 | 1 |

## API Endpoints

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| POST | `/api/v1/auth/send-otp` | ❌ | Telefon raqamiga OTP yuborish |
| POST | `/api/v1/auth/verify-otp` | ❌ | OTP tasdiqlash, JWT token olish |
| POST | `/api/v1/auth/login` | ❌ | PIN orqali kirish (Web Panel) |
| GET | `/api/v1/auth/me` | ✅ JWT | Joriy foydalanuvchi profilini olish |
| GET | `/api/v1/users` | ❌ | Foydalanuvchilar ro'yxati (?role=ROLE) |
| GET | `/api/v1/users/:id` | ❌ | Foydalanuvchi ma'lumotlari |
| PUT | `/api/v1/users/:id` | ❌ | Foydalanuvchi yangilash |

> 📖 To'liq API spec: `docs/06-api-specification/api-endpoints.yaml` (Auth, Users tag)

## Data Model

```
┌──────────────────────────────────────────┐
│                  User                     │
├──────────────────────────────────────────┤
│ id          : String (UUID, PK)          │
│ phone       : String (UNIQUE)            │
│ pin         : String (nullable)          │
│ fullName    : String                     │
│ role        : UserRole (ENUM)            │
│ specialty   : String (nullable)          │
│ region      : String (nullable)          │
│ district    : String (nullable)          │
│ avatarUrl   : String (nullable)          │
│ createdAt   : DateTime                   │
│ updatedAt   : DateTime                   │
├──────────────────────────────────────────┤
│ RELATIONS:                               │
│ → applications (as patient)              │
│ → radiologApplications (as radiolog)     │
│ → specialistApplications (as specialist) │
│ → doctorApplications (as doctor)         │
│ → notifications                          │
│ → kassaSmenas                            │
│ → bookingSlots                           │
└──────────────────────────────────────────┘
```

**UserRole ENUM:** PATIENT, DOCTOR, RADIOLOG, SPECIALIST, OPERATOR, ADMIN, CASHIER

## Security

| Xavfsizlik jihati | Amalga oshirish |
|---|---|
| **Autentifikatsiya** | JWT Bearer token (NestJS `JwtGuard`) |
| **OTP** | 6 raqamli SMS kod, 5 daqiqa amal qiladi |
| **PIN** | Web login uchun, bcrypt bilan hashlanadi |
| **Token muddati** | 24 soat (configurable) |
| **CORS** | Faqat `localhost:5173` va `medsmart-pro.vercel.app` |
| **PIN maxfiylik** | `/auth/me` endpoint PIN maydonini qaytarmaydi |
| **Role-based access** | JWT payload da `sub` (userId) va `role` mavjud |

### Ruxsatlar matritsasi (Auth moduli uchun)

| Amal | PATIENT | DOCTOR | RADIOLOG | SPECIALIST | OPERATOR | ADMIN | CASHIER |
|------|---------|--------|----------|------------|----------|-------|---------|
| OTP yuborish | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PIN bilan kirish | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profilni ko'rish | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profilni tahrirlash | O'zi | O'zi | O'zi | O'zi | O'zi | Barchani | O'zi |

## Bog'liq talablar
FR-AUTH-001 ... FR-AUTH-006, BR-001, BR-050 ... BR-053
