# Home Visit Moduli - Uyga Chaqirish

> **Modul ID:** MOD-HV | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Umumiy

Bemor shifokorni uyiga chaqirish xizmati - manzil, aloqa, vaqt va mutaxassis tanlash.

## Fayl joylashuvi

| Fayl | Maqsad |
|------|--------|
| `src/app/components/screens/patient/HomeVisit.tsx` | Bosh ekran |
| `src/app/components/screens/patient/HomeVisitAddress.tsx` | Manzil |
| `src/app/components/screens/patient/HomeVisitContact.tsx` | Aloqa |
| `src/app/components/screens/patient/HomeVisitTime.tsx` | Vaqt |
| `src/app/components/screens/patient/HomeVisitSpecialist.tsx` | Mutaxassis |
| `src/app/components/screens/patient/HomeVisitConfirm.tsx` | Tasdiqlash |

## 5 bosqichli oqim

```
1. Manzil (home_visit_address)
   ├─ Viloyat tanlash
   ├─ Tuman tanlash
   ├─ Ko'cha nomi
   ├─ Uy raqami
   └─ Xonadon raqami

2. Aloqa (home_visit_contact)
   ├─ Telefon raqami
   ├─ Qo'shimcha telefon
   ├─ Telegram username
   └─ Mo'ljal (landmark)

3. Vaqt (home_visit_time)
   ├─ Bugun
   ├─ Ertaga
   └─ Indin
   + Vaqt sloti tanlash

4. Mutaxassis (home_visit_specialist)
   ├─ Mutaxassislik tanlash
   └─ Shifokor tanlash

5. Tasdiqlash (home_visit_confirm)
   └─ Barcha ma'lumotlarni ko'rib chiqish va yuborish
```

## Ariza ma'lumotlari

```typescript
// Application ga qo'shimcha maydonlar
hvClinicName?: string   // Klinika nomi
hvDoctorName?: string   // Shifokor ismi
hvVisitDay?: string     // Tashrif kuni
hvTimeSlot?: string     // Vaqt sloti
hvAddress?: string      // To'liq manzil
```

## Uyga chaqirish holatlari

```
new → paid_pending → accepted → hv_onway → hv_arrived → done
```

| Holat | Tavsif |
|-------|--------|
| `hv_onway` | Shifokor yo'lda |
| `hv_arrived` | Shifokor yetib keldi |

## API Endpoints

Uyga chaqirish moduli `Application` modulining kengaytmasi sifatida ishlaydi. Alohida endpoint yo'q - `homeVisit=true` bayrog'i bilan ariza yaratiladi.

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| POST | `/api/v1/applications` | ✅ JWT | Ariza yaratish (homeVisit=true, homeAddress, homePhone, homeDate) |
| GET | `/api/v1/booking/doctors` | ❌ | Uyga keladigan shifokorlar qidirish |
| GET | `/api/v1/booking/doctors/:id/slots` | ❌ | Shifokor bo'sh vaqtlari |
| GET | `/api/v1/booking/geo` | ❌ | Geografik hududlar (viloyat/tuman) |

> 📖 To'liq API spec: `docs/06-api-specification/api-endpoints.yaml` (Applications, Booking tag)

## Data Model

Uyga chaqirish ma'lumotlari `Application` jadvaliga qo'shimcha maydonlar sifatida saqlanadi:

```
┌──────────────────────────────────────────┐
│    Application (HV qo'shimcha maydonlar)  │
├──────────────────────────────────────────┤
│ homeVisit   : Boolean (default: false)   │
│ homeAddress : String (nullable)          │
│ homePhone   : String (nullable)          │
│ homeDate    : DateTime (nullable)        │
└──────────────────────────────────────────┘
```

**Frontend da qo'shimcha maydonlar** (store da saqlanadi):
- `hvClinicName` — Klinika nomi
- `hvDoctorName` — Shifokor ismi
- `hvVisitDay` — Tashrif kuni
- `hvTimeSlot` — Vaqt sloti

## Security

| Xavfsizlik jihati | Amalga oshirish |
|---|---|
| **Manzil ma'lumotlari** | PHI sifatida himoyalanadi |
| **Telefon raqam** | Faqat tayinlangan shifokor va operator ko'ra oladi |
| **Ariza yaratish** | JWT autentifikatsiya talab etiladi |
| **Geolokatsiya** | Bemor manzili aniq bo'lishi kerak (viloyat + tuman + ko'cha) |

### Ruxsatlar matritsasi

| Amal | PATIENT | DOCTOR | OPERATOR | ADMIN |
|------|---------|--------|----------|-------|
| Uyga chaqirish ariza yaratish | ✅ | ❌ | ✅ | ✅ |
| Manzilni ko'rish | ❌ | ✅ (tayinlangan) | ✅ | ✅ |
| Status yangilash | ❌ | ✅ (hv_onway, hv_arrived) | ✅ | ✅ |
| Bekor qilish | ✅ (faqat NEW holat) | ❌ | ✅ | ✅ |

## Bog'liq talablar
FR-HV-001 ... FR-HV-005, BR-070 ... BR-073
