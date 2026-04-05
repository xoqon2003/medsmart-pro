# Payment Moduli - To'lov (Kassa)

> **Modul ID:** MOD-PAY | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Umumiy

To'lov qabul qilish, kassir smenasi boshqarish va moliyaviy hisobot moduli.

## Fayl joylashuvi

| Fayl | Maqsad |
|------|--------|
| `src/app/components/patient/PatientPayment.tsx` | Bemor to'lov ekrani |
| `src/app/components/screens/kassir/KassirDashboard.tsx` | Kassir paneli |
| `src/app/components/screens/web/WebKassirPanel.tsx` | Web kassir paneli |
| `src/app/types/index.ts` | Payment, KassaTolov, KassaSmena |
| `src/app/data/mockData.ts` | mockKassaTolovlar |

## Bemor to'lov oqimi

```
Xizmat tanlash → Narx ko'rish → To'lov usuli tanlash
  │
  ├─ Payme → Redirect → Callback → Tasdiqlash
  ├─ Click → Redirect → Callback → Tasdiqlash
  ├─ Uzum → Redirect → Callback → Tasdiqlash
  ├─ UzCard → Karta ma'lumotlari → Tasdiqlash
  ├─ Humo → Karta ma'lumotlari → Tasdiqlash
  └─ Naqd → Kassirga yo'naltirish → Kassir tasdiqlaydi
```

## Kassir ish oqimi

### Smena boshqaruvi
```
Smena ochish (boshlang'ich qoldiq kiritish)
  → To'lovlarni qabul qilish (kun davomida)
  → Smena yopish (jami hisob-kitob)
```

### Smena statistikasi
```typescript
interface KassaSmena {
  id: number
  kassirId: number
  openedAt: string
  closedAt?: string
  initialBalance: number   // Boshlang'ich qoldiq
  cashTotal: number        // Naqd jami
  cardTotal: number        // Karta jami
  onlineTotal: number      // Onlayn jami
  grandTotal: number       // Umumiy jami
  transactionsCount: number
}
```

### To'lov qayd qilish
```typescript
interface KassaTolov {
  invoiceNumber: string    // INV-2026-XXXXX
  patientName: string
  serviceName: string
  amount: number           // Xizmat narxi
  discount: number         // Chegirma
  amountDue: number        // To'lash kerak (amount - discount)
  amountPaid: number       // To'langan
  changeAmount: number     // Qaytim (naqd uchun)
  paymentMethod: string    // naqd, karta, payme, click, uzum, ...
  status: string           // kutilmoqda, qabul_qilindi, bekor, qaytarildi
}
```

## To'lov usullari

| Usul | Kod | Turi | Holat |
|------|-----|------|-------|
| Shaxsiy karta | `personal_card` | Onlayn | Mock |
| Payme | `payme` | Onlayn | Rejada |
| Click | `click` | Onlayn | Rejada |
| Uzum Bank | `uzum` | Onlayn | Rejada |
| UzCard | `uzcard` | Karta | Rejada |
| Humo | `humo` | Karta | Rejada |
| Naqd | `cash` | Naqd | Tayyor |
| Terminal | `terminal` | Karta | Rejada |

## Narx hisoblash

```
Yakuniy narx = Bazaviy narx × Shoshilinchlik koeffitsienti - Chegirma

Koeffitsientlar:
  normal:    1.0x
  urgent:    1.5x
  emergency: 2.0x
```

## API Endpoints

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| POST | `/api/v1/payments` | ✅ JWT | To'lov yaratish (applicationId, amount, provider) |
| POST | `/api/v1/payments/:id/confirm` | ✅ JWT | To'lovni tasdiqlash |
| POST | `/api/v1/payments/:id/refund` | ✅ JWT | To'lovni qaytarish (refund) |
| POST | `/api/v1/kassa/smena` | ✅ JWT | Kassir smenasini ochish |
| PUT | `/api/v1/kassa/smena/:id` | ✅ JWT | Smenani yopish |
| GET | `/api/v1/kassa/smena/active` | ✅ JWT | Faol smenani olish |
| POST | `/api/v1/kassa/tolov` | ✅ JWT | Kassa to'lovi yaratish |
| GET | `/api/v1/kassa/tolov` | ❌ | Smena to'lovlari ro'yxati (?smenaId) |

> 📖 To'liq API spec: `docs/06-api-specification/api-endpoints.yaml` (Payments, Kassa tag)

## Data Model

```
┌──────────────────────────────────────────┐
│               Payment                     │
├──────────────────────────────────────────┤
│ id            : String (UUID, PK)        │
│ amount        : Float                    │
│ provider      : PaymentProvider (ENUM)   │
│ status        : PaymentStatus (ENUM)     │
│ transactionId : String (nullable)        │
│ applicationId : String (FK, UNIQUE)      │
│ createdAt     : DateTime                 │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│             KassaSmena                    │
├──────────────────────────────────────────┤
│ id                : String (UUID, PK)    │
│ kassirId          : String (FK → User)   │
│ kassirIsmi        : String               │
│ boshlanghichQoldiq: Float (default: 0)   │
│ jami              : Float (default: 0)   │
│ naqd              : Float (default: 0)   │
│ karta             : Float (default: 0)   │
│ status            : SmenaStatus (ENUM)   │
│ ochilganVaqt      : DateTime             │
│ yopilganVaqt      : DateTime (nullable)  │
├──────────────────────────────────────────┤
│ RELATIONS: → tolovlar (1:N KassaTolov)  │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│             KassaTolov                    │
├──────────────────────────────────────────┤
│ id             : String (UUID, PK)       │
│ smenaId        : String (FK)             │
│ applicationId  : String                  │
│ bemorIsmi      : String                  │
│ xizmatNomi     : String                  │
│ summa          : Float                   │
│ chegirma       : Float (default: 0)      │
│ tolashKerak    : Float                   │
│ tolanganSumma  : Float                   │
│ qaytim         : Float (default: 0)      │
│ tolovUsuli     : TolovUsuli (ENUM)       │
│ kassirId       : String                  │
│ izoh           : String (nullable)       │
│ yaratilganVaqt : DateTime                │
└──────────────────────────────────────────┘
```

**Enumlar:**
- **PaymentProvider:** PAYME, CLICK, UZUM, CASH, CARD, TRANSFER, INSURANCE
- **PaymentStatus:** PENDING, COMPLETED, FAILED, REFUNDED
- **SmenaStatus:** OCHIQ, YOPIQ
- **TolovUsuli:** NAQD, KARTA, ARALASH

## Security

| Xavfsizlik jihati | Amalga oshirish |
|---|---|
| **To'lov yaratish** | Faqat JWT autentifikatsiya |
| **Refund** | Faqat ADMIN yoki CASHIER roli |
| **Kassa operatsiyalari** | Faqat CASHIER yoki ADMIN roli |
| **Smena** | Kassir faqat o'z smenasini boshqaradi |
| **Moliyaviy audit** | Barcha to'lovlar audit log da qayd qilinadi |
| **PCI DSS** | Karta ma'lumotlari serverda saqlanmaydi, to'lov provayderga redirect |

### Ruxsatlar matritsasi

| Amal | PATIENT | CASHIER | OPERATOR | ADMIN |
|------|---------|---------|----------|-------|
| To'lov yaratish | ✅ | ✅ | ✅ | ✅ |
| To'lovni tasdiqlash | ❌ | ✅ | ❌ | ✅ |
| Refund | ❌ | ✅ | ❌ | ✅ |
| Smena ochish/yopish | ❌ | ✅ | ❌ | ✅ |
| Kassa to'lovi yaratish | ❌ | ✅ | ❌ | ✅ |
| Hisobotlarni ko'rish | ❌ | ✅ (o'z smenasi) | ❌ | ✅ (barchasi) |

## Bog'liq talablar
FR-PAY-001 ... FR-PAY-007, BR-020 ... BR-025, BR-030 ... BR-032
