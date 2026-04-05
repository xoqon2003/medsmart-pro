# TT-002: Tekshiruv Markazi Filtrlash va Qidiruv Moduli

**Modul:** Bemor → Yangi Ariza → Tekshiruv / Tahlil → Markaz tanlash
**Sahifa:** `TekshiruvCenter.tsx` (3-bosqich — Tekshiruv markazini tanlash)
**Bog'liq sahifalar:** `TekshiruvCategory.tsx` (1-bosqich), `TekshiruvExam.tsx` (2-bosqich)
**Sana:** 2026-04-04
**Versiya:** 1.0
**Status:** Yangi
**Bog'liq TT:** TT-001 (Klinika filtrlash — umumiy komponentlar qayta ishlatiladi)

---

## 1. Hozirgi holat (AS-IS)

### 1.1 Tekshiruv oqimi (Flow)
```
1-bosqich: Kategoriya tanlash (TekshiruvCategory)
   5 ta kategoriya: visual, ultrasound, laboratory, functional, endoscopy
   ↓
2-bosqich: Tekshiruv nomini tanlash (TekshiruvExam)
   Kategoriyaga mos tekshiruvlar ro'yxati
   ↓
3-bosqich: Markaz tanlash (TekshiruvCenter)  ← SHU SAHIFA
   Viloyat → Tuman → Markaz kartochkasi
   ↓
4-bosqich: Sana va vaqt (TekshiruvCalendar)
   ↓
5-bosqich: Tasdiqlash (TekshiruvConfirm)
```

### 1.2 Hozirgi TekshiruvCenter.tsx
- **Komponent:** `src/app/components/screens/patient/TekshiruvCenter.tsx` (~195 qator)
- **Ma'lumot:** `examinationService.getCenters()` → `GET /examinations/centers`
- **Mavjud filtrlar:**
  - Viloyat (region) — `<Select>` dropdown
  - Tuman (district) — `<Select>` dropdown (viloyatga bog'liq)
  - Saralash (sort): Reyting | Narx | Masofa — 3 ta tugma
- **Markaz kartochkasi ko'rsatadi:** Nomi, Viloyat/Tuman, Masofa (km), Reyting (⭐), Narx (so'm)

### 1.3 Hozirgi Backend
- **Endpoint:** `GET /examinations/centers?region=...&district=...`
- **Service:** `examinationsService.getCenters()` — Prisma orqali DB dan oladi
- **Model:** `ExaminationCenter { id, name, region, district, rating, price, distanceKm }`
- **Tekshiruv nomlari:** Hozircha hardcoded `EXAMS_BY_CATEGORY` dict (DB da emas)

### 1.4 Yo'qotilganlar (muammolar)
- ❌ Markaz nomini yozib qidirish imkoniyati yo'q
- ❌ Geolokatsiya asosida yaqin markazlar yo'q (distanceKm statik, real emas)
- ❌ Xizmatlar soni bo'yicha filtrlash yo'q
- ❌ Operatsiya/tekshiruv turi bo'yicha filtrlash yo'q (markaz qaysi tekshiruvlarni qiladi?)
- ❌ Top/reklama markazlar yo'q
- ❌ Kengaytirilgan filtr paneli yo'q (barchasi doim ochiq)
- ❌ Qidiruv yo'q

---

## 2. Talab qilinadigan o'zgarishlar (TO-BE)

### 2.1 UX konseptsiya — Markaz tanlash sahifasi

```
┌─────────────────────────────────────┐
│  ← 3-bosqich: Markaz tanlash    👤 │
│  "MRT bosh miya" uchun markaz       │  ← Tanlangan tekshiruv nomi
├─────────────────────────────────────┤
│  🔍 Markaz qidiring...        [⚙]  │  ← Qidiruv input + Filter ikonka
├─────────────────────────────────────┤
│  ▼ Kengaytirilgan filtr (yashirin)  │  ← [⚙] bosilganda pastga ochiladi
│  ┌─ Viloyat:     [Tanlang ▾]       │
│  ├─ Tuman:       [Tanlang ▾]       │
│  ├─ 📍 Yaqin markazlar   [toggle]  │
│  ├─ Xizmatlar:   [5+ ▾]            │
│  └─ Operatsiya:  [MRT ▾] [KT ▾]   │  ← Multi-select chips
│  [Qo'llash]           [Tozalash]    │
├─────────────────────────────────────┤
│  ⭐ Top markazlar                    │  ← Horizontal carousel
│  [Card1] [Card2] [Card3] →         │
├─────────────────────────────────────┤
│  Saralash: [⭐Reyting] [💰Narx] [📍Masofa] │
├─────────────────────────────────────┤
│  Filtrlangan markazlar (12 ta)      │
│  ┌────────────────────────────────┐ │
│  │  Toshkent Diagnostika Markazi  │ │
│  │  📍 M. Ulug'bek, Toshkent     │ │
│  │  ⭐ 4.7  |  🏥 15 xizmat       │ │
│  │  📍 2.3 km  |  💰 180,000 so'm │ │
│  │  [MRT] [KT] [Rentgen]         │ │ ← Xizmat badge'lar
│  └────────────────────────────────┘ │
│  ...                                │
└─────────────────────────────────────┘
```

### 2.2 Minimal filtr (doim ko'rinadi)

**Joylashuv:** Sahifa yuqorisida, tekshiruv nomi ostida

| Element | Turi | Tavsif |
|---------|------|--------|
| Qidiruv input | `<Input>` | Markaz nomi bo'yicha real-time qidiruv (debounce 300ms) |
| Filter ikonka | `<Button>` icon | `SlidersHorizontal` (lucide-react), kengaytirilgan filtrni toggle qiladi |
| Aktiv filtr badge | `<Badge>` | Filtr ikonka yonida aktiv filtrlar soni (masalan: "3") |

**Logika:**
- Input'ga 2+ belgi kiritilganda filtrlash boshlanadi
- Qidiruv `center.name` va `center.region + center.district` bo'yicha ishlaydi (case-insensitive)
- Filter ikonka bosilganda kengaytirilgan panel `slideDown` animatsiya bilan ochiladi
- Aktiv filtrlar soni ikonka yonida ko'rsatiladi

### 2.3 Kengaytirilgan filtr (toggle panel)

**Joylashuv:** Qidiruv satri ostida
**Animatsiya:** `Collapsible` (Radix UI) — pastga slide
**Default holat:** Yopiq

#### 2.3.1 Viloyat filtr
| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | `<Select>` (shadcn/ui) |
| Placeholder | "Viloyatni tanlang" |
| Ma'lumot | `ExaminationCenter` larning unique `region` qiymatlari |
| O'zgarishda | Tumanni tozalash, markazlarni qayta filtrlash |
| Default | Bo'sh (barchasi) |

#### 2.3.2 Tuman filtr
| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | `<Select>` (shadcn/ui) |
| Placeholder | "Tumanni tanlang" |
| Dependency | Viloyat tanlangandan keyin aktivlashadi |
| Ma'lumot | Tanlangan viloyatdagi markazlarning unique `district` qiymatlari |
| Default | Bo'sh (barchasi) |

#### 2.3.3 Yaqin markazlar (Geolokatsiya)
| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | `<Switch>` toggle (shadcn/ui) |
| Label | "📍 Yaqin markazlar" |
| Logika | `navigator.geolocation.getCurrentPosition()` |
| Radius | Default 10 km |
| Prioritet | Yoqilganda Viloyat/Tuman filtrlari disable bo'ladi |
| Natija | Real `distanceKm` hisoblanadi va ko'rsatiladi |

**Geolokatsiya logikasi:**
1. Toggle ON → `navigator.geolocation.getCurrentPosition()` chaqiriladi
2. Ruxsat berilsa → `{latitude, longitude}` olinadi
3. Backend'ga → `GET /examinations/centers/nearby?lat=...&lng=...&radius=10` so'rov
4. Natija: markazlar masofa bo'yicha tartiblangan, real `distanceKm` bilan
5. Ruxsat rad etilsa → toast xato: "Joylashuvga ruxsat berilmadi", toggle OFF

#### 2.3.4 Xizmatlar soni bo'yicha filtr
| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | `<Select>` (shadcn/ui) |
| Label | "Xizmatlar soni" |
| Variantlar | "Barchasi", "5+ xizmat", "10+ xizmat", "20+ xizmat" |
| Logika | `center.servicesCount >= tanlangan_qiymat` |

#### 2.3.5 Operatsiya turlari bo'yicha filtr (YANGI)
| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | Multi-select chips / `<ToggleGroup>` |
| Label | "Operatsiya turlari" |
| Ma'lumot | Markazdagi mavjud tekshiruv turlari |
| Misol | `[MRT] [KT] [UZI] [Rentgen] [EKG] [Tahlil]` |
| Logika | Tanlangan turlar markazda mavjud bo'lishi kerak |
| Default | Hech biri (barchasi ko'rsatiladi) |

**Eslatma:** Bu filtr tanlangan kategoriyaga bog'liq. Agar "Vizual diagnostika" tanlangan bo'lsa, faqat `[MRT] [KT] [Rentgen] [Flyuorografiya] [Mammografiya]` ko'rsatiladi.

#### 2.3.6 Filtr action tugmalari
| Tugma | Funksiya |
|-------|----------|
| **"Qo'llash"** | Filtrlarni apply qiladi, panelni yopadi, natijalarni yangilaydi |
| **"Tozalash"** | Barcha filtrlarni reset qiladi, panelni yopmaydi |

### 2.4 Top Markazlar (Marketing/Reklama)

**Joylashuv:** Filtr paneli ostida, saralash tugmalari ustida
**Ko'rinish:** Doim ko'rinadi (filtr natijasidan mustaqil)
**Layout:** Horizontal scroll carousel

| Xususiyat | Qiymat |
|-----------|--------|
| Komponent | `TopCenterCard` (yoki TT-001 dan `TopClinicCard` qayta ishlatiladi) |
| Layout | `flex gap-3 overflow-x-auto snap-x` |
| Card mazmuni | Logo, nomi, reyting, "⭐ Top" badge, narx diapazoni |
| Ma'lumot | Backend'dan `isTop: true` filtrlangan markazlar |
| Soni | Max 10 ta |
| Bosilganda | Shu markazni tanlaydi → `updateDraftExamination({ centerId, region, district, price })` → keyingi sahifaga |

### 2.5 Saralash (mavjudni saqlash + kengaytirish)

**Mavjud:** Reyting | Narx | Masofa
**Yangi qo'shiladi:** Xizmatlar soni

| Saralash | Logika | Default |
|----------|--------|---------|
| ⭐ Reyting | `b.rating - a.rating` (desc) | ✅ Default |
| 💰 Narx | `a.price - b.price` (asc) | |
| 📍 Masofa | `a.distanceKm - b.distanceKm` (asc) | Geo yoqilganda auto |
| 🏥 Xizmatlar | `b.servicesCount - a.servicesCount` (desc) | |

### 2.6 Markaz kartochkasi (yangilangan)

**Hozirgi:** Nomi, Viloyat/Tuman, Masofa, Reyting, Narx
**Qo'shiladigan elementlar:**

| Element | Tavsif |
|---------|--------|
| Logo/rasm | `center.logoUrl` — 48x48 rounded |
| Xizmatlar soni | "🏥 15 ta xizmat" |
| Xizmat badge'lar | `[MRT] [KT] [UZI]` — markazda mavjud tekshiruv turlari (max 4 ta ko'rinadi + "+3") |
| Top badge | Agar `isTop: true` → "⭐ Top" badge |

---

## 3. Backend o'zgarishlar

### 3.1 Prisma schema o'zgarishlar

**Fayl:** `server/prisma/schema.prisma`

```prisma
model ExaminationCenter {
  id          Int      @id @default(autoincrement())
  name        String
  region      String
  district    String
  rating      Float    @default(0)
  price       Int      @default(0)
  distanceKm  Float    @default(0)

  // YANGI FIELDLAR:
  latitude      Float?           // Geolokatsiya uchun
  longitude     Float?           // Geolokatsiya uchun
  servicesCount Int     @default(0)  // Ko'rsatiladigan xizmatlar soni
  isTop         Boolean @default(false) // Top/reklama markaz
  topPriority   Int     @default(0)    // Top markazlar tartibi
  topExpiresAt  DateTime?              // Top status muddati
  logoUrl       String?                // Markaz logosi
  description   String?                // Qisqa tavsif
  phone         String?                // Telefon
  address       String?                // To'liq manzil
  workingHours  String?                // Ish vaqti ("08:00-18:00")

  // Relation: markaz qaysi tekshiruvlarni bajaradi
  examTypes     CenterExamType[]

  @@index([region, district])
  @@index([isTop, topPriority])
  @@index([latitude, longitude])
}

// YANGI MODEL: Markaz ↔ Tekshiruv turi bog'lanishi
model CenterExamType {
  id        Int               @id @default(autoincrement())
  centerId  Int
  center    ExaminationCenter @relation(fields: [centerId], references: [id])
  category  String            // 'visual', 'ultrasound', 'laboratory', 'functional', 'endoscopy'
  examName  String            // 'MRT bosh', 'UZI qorin', etc.
  price     Int?              // Shu tekshiruv uchun narx (agar umumiy narxdan farq qilsa)

  @@unique([centerId, examName])
  @@index([category])
}
```

**Migration:** `npx prisma migrate dev --name add_center_filter_and_exam_types`

### 3.2 Yangi API endpointlar

#### 3.2.1 Markazlarni qidirish va filtrlash (mavjudni kengaytirish)
```
GET /api/v1/examinations/centers/search
```

| Parametr | Turi | Majburiy | Tavsif |
|----------|------|----------|--------|
| `q` | string | Yo'q | Nomi/manzili bo'yicha qidiruv |
| `region` | string | Yo'q | Viloyat |
| `district` | string | Yo'q | Tuman |
| `category` | string | Yo'q | Tekshiruv kategoriyasi (masalan: 'visual') |
| `examTypes` | string[] | Yo'q | Operatsiya turlari (comma-separated: "MRT,KT") |
| `minServices` | number | Yo'q | Minimal xizmatlar soni |
| `sort` | string | Yo'q | "rating" (default), "price", "distance", "services" |
| `page` | number | Yo'q | Sahifa (default: 1) |
| `limit` | number | Yo'q | Har sahifada (default: 20) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Toshkent Diagnostika Markazi",
      "region": "Toshkent",
      "district": "M. Ulug'bek",
      "address": "Buyuk Ipak Yo'li 12",
      "rating": 4.7,
      "price": 180000,
      "distanceKm": 2.3,
      "servicesCount": 15,
      "logoUrl": "https://...",
      "isTop": false,
      "workingHours": "08:00-18:00",
      "examTypes": ["MRT bosh", "MRT umurtqa", "KT qorin", "KT ko'krak", "Rentgen"]
    }
  ],
  "total": 28,
  "page": 1,
  "limit": 20
}
```

#### 3.2.2 Yaqin markazlar (Geo)
```
GET /api/v1/examinations/centers/nearby
```

| Parametr | Turi | Majburiy | Tavsif |
|----------|------|----------|--------|
| `lat` | float | Ha | Latitude |
| `lng` | float | Ha | Longitude |
| `radius` | number | Yo'q | Radius km (default: 10) |
| `category` | string | Yo'q | Faqat shu kategoriya markazlari |

**Logika:** Haversine formula:
```sql
-- PostgreSQL raw query
SELECT *,
  (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) *
  cos(radians(longitude) - radians(:lng)) +
  sin(radians(:lat)) * sin(radians(latitude)))) AS distance
FROM "ExaminationCenter"
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
HAVING distance <= :radius
ORDER BY distance ASC;
```

**Response:** Xuddi `/search` kabi, lekin `distanceKm` real hisoblangan qiymat

#### 3.2.3 Top markazlar
```
GET /api/v1/examinations/centers/top
```

| Parametr | Turi | Majburiy | Tavsif |
|----------|------|----------|--------|
| `limit` | number | Yo'q | Soni (default: 10) |
| `category` | string | Yo'q | Faqat shu kategoriya markazlari |

**Logika:** `WHERE isTop = true AND (topExpiresAt IS NULL OR topExpiresAt > NOW()) ORDER BY topPriority DESC LIMIT :limit`

#### 3.2.4 Markaz exam types (operatsiya turlari)
```
GET /api/v1/examinations/centers/:id/exam-types
```

**Response:**
```json
{
  "categories": ["visual", "ultrasound"],
  "examTypes": [
    { "category": "visual", "examName": "MRT bosh", "price": 200000 },
    { "category": "visual", "examName": "KT qorin", "price": 180000 },
    { "category": "ultrasound", "examName": "UZI qorin", "price": 80000 }
  ]
}
```

#### 3.2.5 Kategoriya bo'yicha mavjud operatsiya turlari
```
GET /api/v1/examinations/exam-types?category=visual
```

**Response:** `["MRT", "KT", "Rentgen", "Flyuorografiya", "Mammografiya"]`
— Filtr panelida operatsiya chips ko'rsatish uchun

---

## 4. Frontend implementatsiya

### 4.1 Yangi komponentlar

| Komponent | Fayl | Vazifasi |
|-----------|------|----------|
| `CenterSearchBar` | `src/app/components/patient/CenterSearchBar.tsx` | Qidiruv input + filter ikonka (yoki TT-001 `ClinicSearchBar` universallashtiriladi) |
| `CenterAdvancedFilter` | `src/app/components/patient/CenterAdvancedFilter.tsx` | Kengaytirilgan filtr paneli |
| `TopCenterCarousel` | `src/app/components/patient/TopCenterCarousel.tsx` | Top markazlar horizontal scroll |
| `CenterCard` | `src/app/components/patient/CenterCard.tsx` | Markaz kartochkasi (yangilangan) |
| `ExamTypeChips` | `src/app/components/patient/ExamTypeChips.tsx` | Operatsiya turlari multi-select chips |

**TT-001 bilan umumiy komponentlar (shared):**

| Komponent | Qayta ishlatiladi | Sabab |
|-----------|-------------------|-------|
| `SearchBar` | Ha | Qidiruv + filter ikonka — ikkala modulda bir xil |
| `GeoLocationToggle` | Ha | Geolokatsiya switch — bir xil logika |
| `TopCarousel` | Ha | Top elementlar carousel — bir xil layout |

> **Tavsiya:** `src/app/components/patient/shared/` papkasida umumiy komponentlar yaratilsin. TT-001 va TT-002 ikkisi ham shu shared komponentlarni ishlatsin.

### 4.2 Type o'zgarishlar

**`src/app/types/index.ts` ga qo'shimchalar:**

```typescript
// Markaz filtrlash uchun
interface CenterFilters {
  query?: string;             // Qidiruv matni
  region?: string;            // Viloyat
  district?: string;          // Tuman
  category?: Category;        // Tekshiruv kategoriyasi
  examTypes?: string[];       // Operatsiya turlari (multi-select)
  nearbyEnabled?: boolean;    // Geolokatsiya
  userLat?: number;
  userLng?: number;
  minServices?: number;       // Minimal xizmatlar soni
  sort?: 'rating' | 'price' | 'distance' | 'services';
}

// Center modelini kengaytirish
interface CenterSearchResult extends Center {
  servicesCount: number;
  logoUrl?: string;
  isTop: boolean;
  address?: string;
  workingHours?: string;
  examTypes: string[];         // Markaz bajaradigan tekshiruv nomlari
}

// DraftExamination ga qo'shimcha
interface DraftExamination {
  // ... mavjud fieldlar ...
  centerName?: string;         // YANGI: tanlangan markaz nomi
  centerAddress?: string;      // YANGI: tanlangan markaz manzili
}
```

### 4.3 Service layer qo'shimcha

**`src/services/api/examinationService.ts` ga yangi metodlar:**

```typescript
// Mavjud getCenters ni kengaytirish
async searchCenters(filters: CenterFilters): Promise<PaginatedResponse<CenterSearchResult>>

// Yangi metodlar
async getNearbyCenters(lat: number, lng: number, radius?: number, category?: string): Promise<CenterSearchResult[]>
async getTopCenters(limit?: number, category?: string): Promise<CenterSearchResult[]>
async getExamTypesByCategory(category: string): Promise<string[]>
```

### 4.4 O'zgartirilgan komponent: `TekshiruvCenter.tsx`

**Mavjud layoutni almashtirish:**

```
OLDIN:                              KEYIN:
┌──────────────────┐               ┌──────────────────────────┐
│ Select Viloyat    │               │ "MRT bosh" uchun markaz  │
│ Select Tuman      │      →       │ 🔍 Qidirish...      [⚙] │
│ Sort: 3 tugma     │               │ [Kengaytirilgan filtr]   │
│ Center cards list │               │ ⭐ Top markazlar          │
└──────────────────┘               │ Sort: 4 tugma            │
                                    │ Filtrlangan ro'yxat      │
                                    └──────────────────────────┘
```

**Komponent logikasi (lifecycle):**

```
1. Mount bo'lganda:
   ├─ getTopCenters(10, draftExam.category) → top markazlar
   ├─ getExamTypesByCategory(draftExam.category) → filtr chips uchun
   └─ searchCenters({ category: draftExam.category }) → barcha markazlar

2. Qidiruv input o'zgarganda (debounce 300ms):
   └─ searchCenters({ ...filters, query: inputValue })

3. Kengaytirilgan filtr "Qo'llash" bosilganda:
   └─ searchCenters(allFilters)

4. Geolokatsiya toggle ON:
   ├─ navigator.geolocation.getCurrentPosition()
   └─ getNearbyCenters(lat, lng, 10, category)

5. Sort o'zgarganda:
   └─ searchCenters({ ...filters, sort: newSort })

6. Markaz tanlanganda:
   └─ updateDraftExamination({
        centerId: center.id,
        centerName: center.name,
        region: center.region,
        district: center.district,
        price: center.price
      })
   └─ navigate('patient_tks_calendar')
```

---

## 5. TekshiruvCategory sahifasiga o'zgarishlar (1-bosqich)

### 5.1 Hozirgi holat
Kategoriya kartochkalari — icon + nom + tavsif → bosilganda keyingi sahifaga o'tadi.

### 5.2 Qo'shiladigan: Kategoriya ichida qidiruv

| Element | Tavsif |
|---------|--------|
| Qidiruv input | Sahifa yuqorisida: "Tekshiruv turini qidiring..." |
| Logika | Kategoriya nomi va tavsifi bo'yicha filtrlash |
| Misol | "MRT" yozilsa → faqat "Vizual diagnostika" ko'rinadi |

> **Eslatma:** Bu kichik o'zgarish, kategoriyalar 5 ta bo'lgani uchun ixtiyoriy (optional). Asosiy e'tibor TekshiruvCenter'ga.

---

## 6. UX/UI detallar

### 6.1 Filter ikonka xatti-harakati

| Holat | Ko'rinish |
|-------|-----------|
| Filtr yopiq, filtrlar bo'sh | `SlidersHorizontal` ikonka (neutral/gray) |
| Filtr yopiq, aktiv filtrlar bor | `SlidersHorizontal` + yashil badge (soni: "2") |
| Filtr ochiq | `X` ikonka (yopish uchun) |

### 6.2 Operatsiya turlari chips UI

```
┌─────────────────────────────────────┐
│ Operatsiya turlari:                 │
│ [✓ MRT] [✓ KT] [ Rentgen]         │
│ [ Flyurografiya] [ Mammografiya]   │
└─────────────────────────────────────┘
```

- Tanlangan chips: `bg-blue-500 text-white`
- Tanlanmagan chips: `bg-gray-100 text-gray-700 border`
- Bosilganda toggle: tanlangan ↔ tanlanmagan

### 6.3 Markaz kartochkasi (yangilangan layout)

```
┌──────────────────────────────────────┐
│ [Logo]  Toshkent Diagnostika     ⭐Top│
│         📍 M. Ulug'bek, Toshkent     │
│         ⭐ 4.7  •  🏥 15 xizmat      │
│  📍 2.3 km  •  💰 180,000 so'm    ›  │
│  [MRT] [KT] [Rentgen] [+2]          │
└──────────────────────────────────────┘
```

### 6.4 Loading holatlari

| Holat | Ko'rinish |
|-------|-----------|
| Dastlabki yuklanish | 3 ta skeleton card |
| Qidiruv paytida | Input ichida mini spinner |
| Geolokatsiya aniqlanmoqda | "📍 Joylashuvingiz aniqlanmoqda..." |
| Natija yo'q | "Markaz topilmadi. Filtrlarni o'zgartiring." |

### 6.5 Animatsiyalar
- Filtr panel: `Collapsible` + `transition: max-height 300ms ease-in-out`
- Ro'yxat yangilanishi: `fade-in 200ms`
- Top carousel: `scroll-snap-type: x mandatory`
- Kartochka bosilganda: `scale(0.98)` press effect

---

## 7. O'zgartiladigan fayllar ro'yxati

### Frontend

| # | Fayl | Amal | Tavsif |
|---|------|------|--------|
| 1 | `src/app/components/patient/shared/SearchBar.tsx` | YANGI | Umumiy qidiruv + filter ikonka (TT-001 bilan shared) |
| 2 | `src/app/components/patient/shared/GeoLocationToggle.tsx` | YANGI | Geolokatsiya switch (TT-001 bilan shared) |
| 3 | `src/app/components/patient/shared/TopCarousel.tsx` | YANGI | Top elementlar carousel (TT-001 bilan shared) |
| 4 | `src/app/components/patient/CenterAdvancedFilter.tsx` | YANGI | Markaz uchun kengaytirilgan filtr |
| 5 | `src/app/components/patient/CenterCard.tsx` | YANGI | Markaz kartochkasi (yangilangan) |
| 6 | `src/app/components/patient/ExamTypeChips.tsx` | YANGI | Operatsiya turlari multi-select |
| 7 | `src/app/components/screens/patient/TekshiruvCenter.tsx` | TAHRIR | Asosiy sahifa — to'liq qayta yoziladi |
| 8 | `src/app/types/index.ts` | TAHRIR | `CenterFilters`, `CenterSearchResult` type'lar |
| 9 | `src/services/api/examinationService.ts` | TAHRIR | Yangi metodlar |
| 10 | `src/services/mock/examinationService.ts` | TAHRIR | Mock data yangilash |

### Backend

| # | Fayl | Amal | Tavsif |
|---|------|------|--------|
| 11 | `server/prisma/schema.prisma` | TAHRIR | ExaminationCenter yangi fieldlar + CenterExamType model |
| 12 | `server/src/examinations/examinations.controller.ts` | TAHRIR | Yangi endpointlar qo'shish |
| 13 | `server/src/examinations/examinations.service.ts` | TAHRIR | Yangi service metodlar |
| 14 | `server/src/examinations/dto/center-search.dto.ts` | YANGI | DTO validatsiya |
| 15 | `server/src/examinations/dto/nearby-centers.dto.ts` | YANGI | Geo DTO |

---

## 8. TT-001 bilan integratsiya va shared komponentlar

### 8.1 Shared komponentlar arxitekturasi

```
src/app/components/patient/
├── shared/
│   ├── SearchBar.tsx           ← TT-001 va TT-002 ishlatadi
│   ├── GeoLocationToggle.tsx   ← TT-001 va TT-002 ishlatadi
│   ├── TopCarousel.tsx         ← TT-001 va TT-002 ishlatadi
│   └── FilterBadge.tsx         ← Aktiv filtrlar soni badge
├── ClinicAdvancedFilter.tsx    ← TT-001 (Klinika uchun)
├── CenterAdvancedFilter.tsx    ← TT-002 (Markaz uchun)
├── ClinicCard.tsx              ← TT-001
├── CenterCard.tsx              ← TT-002
└── ExamTypeChips.tsx           ← TT-002 (faqat tekshiruv uchun)
```

### 8.2 Shared props interfeyslari

```typescript
// SearchBar uchun
interface SearchBarProps {
  placeholder: string;
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
  activeFiltersCount: number;
  isFilterOpen: boolean;
}

// TopCarousel uchun
interface TopCarouselProps<T> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  onSelect: (item: T) => void;
  title: string;  // "Top klinikalar" yoki "Top markazlar"
}

// GeoLocationToggle uchun
interface GeoLocationToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean, coords?: { lat: number; lng: number }) => void;
  label?: string;
}
```

---

## 9. Implementatsiya tartibi

```
1-qadam: Prisma schema → migration (ExaminationCenter + CenterExamType)
    ↓
2-qadam: Backend DTO + Service + Controller (yangi endpointlar)
    ↓
3-qadam: Frontend types (CenterFilters, CenterSearchResult)
    ↓
4-qadam: Shared komponentlar (SearchBar, GeoLocationToggle, TopCarousel)
         ← TT-001 bilan parallel yoki TT-001 dan keyin
    ↓
5-qadam: CenterAdvancedFilter + ExamTypeChips
    ↓
6-qadam: CenterCard (yangilangan kartochka)
    ↓
7-qadam: TekshiruvCenter.tsx integratsiya (qayta yozish)
    ↓
8-qadam: Mock data yangilash + test
```

> **Muhim:** TT-001 (Klinika filtrlash) avval yoki parallel implementatsiya qilinishi kerak, chunki shared komponentlar TT-001 da yaratiladi.

---

## 10. Qabul qilish mezonlari (Acceptance Criteria)

1. ✅ Markaz nomini yozib qidirish ishlaydi (2+ belgi, debounce 300ms)
2. ✅ `[⚙]` ikonka bosilganda kengaytirilgan filtr paneli pastga slide animatsiya bilan ochiladi
3. ✅ Viloyat → Tuman cascading filter to'g'ri ishlaydi
4. ✅ Geolokatsiya toggle yoqilganda yaqin markazlar real masofa bilan ko'rsatiladi
5. ✅ Xizmatlar soni bo'yicha filtrlash ishlaydi (5+, 10+, 20+)
6. ✅ Operatsiya turlari chips multi-select to'g'ri ishlaydi (kategoriyaga mos)
7. ✅ Top markazlar horizontal carousel'da ko'rsatiladi
8. ✅ Saralash 4 ta variant bilan ishlaydi (reyting, narx, masofa, xizmatlar)
9. ✅ Markaz tanlanganda `draftExamination` to'g'ri yangilanadi va calendar sahifasiga o'tadi
10. ✅ Aktiv filtrlar soni badge'da ko'rsatiladi
11. ✅ Bo'sh natija uchun empty state, loading uchun skeleton ko'rsatiladi
12. ✅ Mobil qurilmada responsive ishlaydi
13. ✅ Shared komponentlar TT-001 bilan mos keladi (SearchBar, GeoToggle, Carousel)
