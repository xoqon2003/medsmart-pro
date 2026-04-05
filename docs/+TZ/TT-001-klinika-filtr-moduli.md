# TT-001: Klinika Filtrlash Moduli

**Modul:** Bemor → Yangi Ariza → Oflayn → Klinika tanlash
**Sahifa:** `KonsultatsiyaDoctor.tsx` (offline rejim)
**Sana:** 2026-04-04
**Versiya:** 1.0
**Status:** Yangi

---

## 1. Hozirgi holat (AS-IS)

### 1.1 Frontend
- **Komponent:** `src/app/components/screens/patient/KonsultatsiyaDoctor.tsx`
- **Ishlash tartibi:** Viloyat → Tuman → Klinika (3 ta cascading `<Select>` dropdown)
- **Ma'lumot manbai:** `bookingService.getGeo()` → `GET /booking/geo`
- **Muammo:** Filter yo'q, qidiruv yo'q, foydalanuvchi faqat dropdown orqali tanlaydi. Klinikalar soni ko'p bo'lganda topish qiyin.

### 1.2 Backend
- **Endpoint:** `GET /booking/geo` — hardcoded static JSON qaytaradi (DB dan emas)
- **Clinic model:** Prisma'da to'liq mavjud (`Clinic`, `DoctorClinic`), lekin `getGeo()` DB'ga ulanmagan
- **Mavjud fieldlar:** `id, name, address, city, region, phone, email, website, isVerified`

### 1.3 Yo'qotilganlar
- Klinika qidiruv (search) funksiyasi
- Geolokatsiya asosida yaqin klinikalarni aniqlash
- Xizmatlar soni bo'yicha filter
- Top/tavsiya etilgan klinikalar
- Kengaytirilgan filter paneli

---

## 2. Talab qilinadigan o'zgarishlar (TO-BE)

### 2.1 Umumiy UX konseptsiya

```
┌─────────────────────────────────────┐
│  🔍 Klinika qidiring...       [⚙]  │  ← Qidiruv input + Filter ikonka
├─────────────────────────────────────┤
│  ▼ Kengaytirilgan filtr (yashirin)  │  ← [⚙] bosilganda pastga ochiladi
│  ┌─ Viloyat: [Tanlang ▾]           │
│  ├─ Tuman:   [Tanlang ▾]           │
│  ├─ 📍 Yaqin klinikalar  [toggle]  │
│  └─ Xizmatlar soni: [▾]            │
│  [Qo'llash]          [Tozalash]     │
├─────────────────────────────────────┤
│  ⭐ Top klinikalar                   │  ← Horizontal scroll cards
│  [Card1] [Card2] [Card3] →         │
├─────────────────────────────────────┤
│  Barcha klinikalar (filtered)       │
│  ┌─ MedLine Chilonzor ────────┐    │
│  │  📍 Chilonzor, Toshkent    │    │
│  │  🏥 12 ta xizmat           │    │
│  └────────────────────────────┘    │
│  ...                                │
└─────────────────────────────────────┘
```

### 2.2 Minimal filtr (doim ko'rinadi)

**Joylashuv:** Sahifa yuqorisida, tablar ostida
**Komponentlar:**

| Element | Turi | Tavsif |
|---------|------|--------|
| Qidiruv input | `<Input>` | Klinika nomi bo'yicha real-time qidiruv (debounce 300ms) |
| Filter ikonka | `<Button>` icon | `SlidersHorizontal` (lucide-react), bosilganda kengaytirilgan filtrni toggle qiladi |

**Logika:**
- Input'ga 2+ belgi kiritilganda filtrlash boshlanadi
- Qidiruv `clinic.name` va `clinic.address` bo'yicha ishlaydi (case-insensitive)
- Filter ikonka bosilganda kengaytirilgan panel `slideDown` animatsiya bilan ochiladi

### 2.3 Kengaytirilgan filtr (toggle panel)

**Joylashuv:** Qidiruv satri ostida, `[⚙]` ikonka bosilganda pastga qarab ochiladi
**Animatsiya:** `max-height` transition yoki `Collapsible` (Radix UI)
**Default holat:** Yopiq (yashirin)

#### 2.3.1 Viloyat filtr
| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | `<Select>` (shadcn/ui) |
| Placeholder | "Viloyatni tanlang" |
| Ma'lumot | `GeoRegion[].region` dan olinadi |
| Default | Bo'sh (barchasi) |

#### 2.3.2 Tuman filtr
| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | `<Select>` (shadcn/ui) |
| Placeholder | "Tumanni tanlang" |
| Dependency | Viloyat tanlangandan keyin aktivlashadi |
| Ma'lumot | Tanlangan viloyatning `districts[].name` |
| Default | Bo'sh (barchasi) |

#### 2.3.3 Yaqin klinikalar (Geolokatsiya)
| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | `<Switch>` toggle (shadcn/ui) |
| Label | "📍 Yaqin klinikalar" |
| Logika | `navigator.geolocation.getCurrentPosition()` chaqiradi |
| Radius | Default 10 km (keyinchalik sozlanishi mumkin) |
| Prioritet | Yoqilganda Viloyat/Tuman filtrlari disable bo'ladi |

**Geolokatsiya logikasi:**
1. Toggle yoqilganda → `navigator.geolocation.getCurrentPosition()` so'rov
2. Ruxsat berilsa → `latitude, longitude` olinadi
3. Backend'ga `GET /booking/clinics/nearby?lat=...&lng=...&radius=10` so'rov
4. Ruxsat berilmasa → xato xabar ko'rsatiladi, toggle o'chadi

#### 2.3.4 Xizmatlar soni bo'yicha filtr
| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | `<Select>` (shadcn/ui) |
| Variantlar | "Barchasi", "5+ xizmat", "10+ xizmat", "20+ xizmat" |
| Logika | `clinic.servicesCount >= tanlangan_qiymat` |

#### 2.3.5 Filtr action tugmalari
| Tugma | Funksiya |
|-------|----------|
| **"Qo'llash"** | Filtrlarni apply qiladi, panelni yopadi |
| **"Tozalash"** | Barcha filtrlarni reset qiladi |

### 2.4 Top Klinikalar (Marketing/Reklama)

**Joylashuv:** Filtr paneli ostida, klinikalar ro'yxati ustida
**Ko'rinish sharti:** Filtr bo'sh bo'lganda (hech narsa tanlanmagan) YOKI alohida seksiya sifatida doim ko'rinadi
**Layout:** Horizontal scroll (carousel)

| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | Yangi `TopClinicCard` komponenti |
| Layout | Horizontal scroll, `flex gap-3 overflow-x-auto` |
| Card mazmuni | Logo/rasm, nomi, reyting (yulduzcha), "Top" badge |
| Ma'lumot | Backend'dan `isTop: true` yoki `priority` field orqali |
| Soni | Max 10 ta ko'rinadi |
| Bosilganda | Shu klinikani tanlaydi (draftConsultation'ga yozadi) |

---

## 3. Backend o'zgarishlar

### 3.1 Prisma schema o'zgarishlar

**Fayl:** `server/prisma/schema.prisma`

```prisma
model Clinic {
  // ... mavjud fieldlar ...

  // YANGI FIELDLAR:
  latitude      Float?          // Geolokatsiya uchun
  longitude     Float?          // Geolokatsiya uchun
  servicesCount Int       @default(0)  // Ko'rsatiladigan xizmatlar soni
  isTop         Boolean   @default(false) // Top/reklama klinika
  topPriority   Int       @default(0)  // Top klinikalar tartibi (katta = yuqori)
  topExpiresAt  DateTime?       // Top status muddati (marketing uchun)
  logoUrl       String?         // Klinika logosi
  rating        Float     @default(0)  // O'rtacha reyting (0-5)
  description   String?         // Qisqa tavsif
}
```

**Migration:** `npx prisma migrate dev --name add_clinic_filter_fields`

### 3.2 Yangi API endpointlar

#### 3.2.1 Klinikalarni filtrlash
```
GET /api/v1/booking/clinics/search
```

**Query parametrlari:**

| Parametr | Turi | Majburiy | Tavsif |
|----------|------|----------|--------|
| `q` | string | Yo'q | Nomi/manzili bo'yicha qidiruv |
| `region` | string | Yo'q | Viloyat nomi |
| `district` | string | Yo'q | Tuman nomi |
| `minServices` | number | Yo'q | Minimal xizmatlar soni |
| `page` | number | Yo'q | Sahifalash (default: 1) |
| `limit` | number | Yo'q | Har sahifada (default: 20) |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "MedLine Chilonzor",
      "address": "Chilonzor, 5-kvartal",
      "region": "Toshkent",
      "city": "Chilonzor",
      "servicesCount": 15,
      "rating": 4.5,
      "logoUrl": "https://...",
      "isTop": false,
      "doctorsCount": 8
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

#### 3.2.2 Yaqin klinikalar (Geo)
```
GET /api/v1/booking/clinics/nearby
```

| Parametr | Turi | Majburiy | Tavsif |
|----------|------|----------|--------|
| `lat` | float | Ha | Latitude |
| `lng` | float | Ha | Longitude |
| `radius` | number | Yo'q | Radius km (default: 10) |

**Logika:** Haversine formula yoki PostGIS extension orqali masofa hisoblash

**Response:** Xuddi `/search` kabi, qo'shimcha `distance` field bilan (km da)

#### 3.2.3 Top klinikalar
```
GET /api/v1/booking/clinics/top
```

| Parametr | Turi | Majburiy | Tavsif |
|----------|------|----------|--------|
| `limit` | number | Yo'q | Soni (default: 10) |

**Logika:** `isTop: true AND (topExpiresAt IS NULL OR topExpiresAt > NOW())` → `ORDER BY topPriority DESC`

---

## 4. Frontend implementatsiya

### 4.1 Yangi komponentlar

| Komponent | Fayl | Vazifasi |
|-----------|------|----------|
| `ClinicSearchBar` | `src/app/components/patient/ClinicSearchBar.tsx` | Qidiruv input + filter ikonka |
| `ClinicAdvancedFilter` | `src/app/components/patient/ClinicAdvancedFilter.tsx` | Kengaytirilgan filtr paneli (collapsible) |
| `TopClinicCarousel` | `src/app/components/patient/TopClinicCarousel.tsx` | Top klinikalar horizontal scroll |
| `ClinicCard` | `src/app/components/patient/ClinicCard.tsx` | Klinika card (ro'yxatda) |
| `TopClinicCard` | `src/app/components/patient/TopClinicCard.tsx` | Top klinika mini card |

### 4.2 State o'zgarishlar

**`DraftConsultation` type'ga qo'shimcha:**
```typescript
// src/app/types/index.ts
interface ClinicFilters {
  query?: string;           // Qidiruv matni
  region?: string;          // Viloyat
  district?: string;        // Tuman
  nearbyEnabled?: boolean;  // Geolokatsiya yoqilgan
  userLat?: number;         // Foydalanuvchi latitude
  userLng?: number;         // Foydalanuvchi longitude
  minServices?: number;     // Minimal xizmatlar soni
}
```

### 4.3 Service layer qo'shimcha

**`bookingService.ts` ga yangi metodlar:**
```typescript
async searchClinics(filters: ClinicFilters): Promise<PaginatedResponse<ClinicSearchResult>>
async getNearbyClinics(lat: number, lng: number, radius?: number): Promise<ClinicSearchResult[]>
async getTopClinics(limit?: number): Promise<ClinicSearchResult[]>
```

### 4.4 O'zgartirilgan component: `KonsultatsiyaDoctor.tsx`

**Mavjud offline qismni almashtirish:**

```
OLDIN:                          KEYIN:
┌──────────────┐               ┌──────────────────────┐
│ Select Viloyat│               │ 🔍 Qidiruv...   [⚙] │
│ Select Tuman  │      →       │ [Kengaytirilgan filtr]│
│ Select Klinika│               │ ⭐ Top klinikalar     │
└──────────────┘               │ Filtrlangan ro'yxat   │
                                └──────────────────────┘
```

**Logika tartibi:**
1. Sahifa yuklanganda → `getTopClinics()` chaqiriladi
2. Qidiruv input'ga yozilganda → `searchClinics({ query })` (debounce 300ms)
3. Kengaytirilgan filtr qo'llanilganda → `searchClinics(allFilters)`
4. Geolokatsiya toggle → `getNearbyClinics(lat, lng)`
5. Klinika tanlanganda → `updateDraftConsultation({ clinic, clinicName, clinicAddress })`

---

## 5. UX/UI detallar

### 5.1 Filter ikonka xatti-harakati

| Holat | Ko'rinish |
|-------|-----------|
| Filtr yopiq, bo'sh | `SlidersHorizontal` ikonka (default rang) |
| Filtr yopiq, aktiv filtr bor | `SlidersHorizontal` ikonka + yashil nuqta (badge) |
| Filtr ochiq | `X` ikonka (yopish uchun) |

### 5.2 Animatsiyalar
- Filtr panel ochilishi: `transition: max-height 300ms ease-in-out`
- Klinika ro'yxati yangilanishi: `fade-in` 200ms
- Top klinikalar: smooth horizontal scroll

### 5.3 Bo'sh holat (Empty state)
- Filtr natijasi bo'sh → "Klinika topilmadi. Filtrlarni o'zgartiring." xabari
- Geolokatsiya ruxsat berilmadi → "Geolokatsiyaga ruxsat bering" xabari bilan toggle o'chadi

### 5.4 Loading holatlari
- Qidiruv paytida → input ichida spinner
- Ro'yxat yuklanyotganda → skeleton cards
- Geolokatsiya aniqlanayotganda → "Joylashuvingiz aniqlanmoqda..." xabari

---

## 6. O'zgartiladigan fayllar ro'yxati

### Frontend
| # | Fayl | Amal |
|---|------|------|
| 1 | `src/app/components/patient/ClinicSearchBar.tsx` | YANGI |
| 2 | `src/app/components/patient/ClinicAdvancedFilter.tsx` | YANGI |
| 3 | `src/app/components/patient/TopClinicCarousel.tsx` | YANGI |
| 4 | `src/app/components/patient/ClinicCard.tsx` | YANGI |
| 5 | `src/app/components/patient/TopClinicCard.tsx` | YANGI |
| 6 | `src/app/components/screens/patient/KonsultatsiyaDoctor.tsx` | TAHRIR |
| 7 | `src/app/types/index.ts` | TAHRIR (ClinicFilters, ClinicSearchResult type'lar) |
| 8 | `src/services/api/bookingService.ts` | TAHRIR (yangi metodlar) |
| 9 | `src/services/mock/bookingService.ts` | TAHRIR (mock data) |

### Backend
| # | Fayl | Amal |
|---|------|------|
| 10 | `server/prisma/schema.prisma` | TAHRIR (yangi fieldlar) |
| 11 | `server/src/booking/booking.controller.ts` | TAHRIR (yangi endpointlar) |
| 12 | `server/src/booking/booking.service.ts` | TAHRIR (yangi metodlar) |
| 13 | `server/src/booking/dto/clinic-search.dto.ts` | YANGI (DTO) |

---

## 7. Implementatsiya tartibi (ketma-ketlik)

```
1-qadam: Prisma schema → migration
    ↓
2-qadam: Backend DTO + Service + Controller
    ↓
3-qadam: Frontend types + bookingService metodlari
    ↓
4-qadam: ClinicSearchBar + ClinicAdvancedFilter komponentlari
    ↓
5-qadam: TopClinicCarousel + card komponentlari
    ↓
6-qadam: KonsultatsiyaDoctor.tsx integratsiya
    ↓
7-qadam: Mock data yangilash + test
```

---

## 8. Qabul qilish mezonlari (Acceptance Criteria)

1. ✅ Klinika nomini yozib qidirish ishlaydi (2+ belgi, debounce 300ms)
2. ✅ Filter ikonka bosilganda kengaytirilgan panel pastga ochiladi (animatsiya bilan)
3. ✅ Viloyat → Tuman cascading filter to'g'ri ishlaydi
4. ✅ Geolokatsiya toggle yoqilganda yaqin klinikalar ko'rsatiladi
5. ✅ Xizmatlar soni bo'yicha filtrlash ishlaydi
6. ✅ Top klinikalar horizontal carousel'da ko'rsatiladi
7. ✅ Klinika tanlanganda `draftConsultation` to'g'ri yangilanadi
8. ✅ Bo'sh natija uchun empty state ko'rsatiladi
9. ✅ Loading holatlari (spinner, skeleton) ko'rsatiladi
10. ✅ Mobil qurilmada to'g'ri ko'rinadi (responsive)
