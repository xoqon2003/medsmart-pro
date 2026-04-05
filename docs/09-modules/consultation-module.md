# Consultation Moduli - Konsultatsiya

> **Modul ID:** MOD-KONS | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Umumiy

Bemor shifokordan onlayn yoki oflayn konsultatsiya olish moduli.

## Fayl joylashuvi

| Fayl | Maqsad |
|------|--------|
| `src/app/components/screens/patient/PatientKonsultatsiya.tsx` | Konsultatsiya bosh ekrani |
| `src/app/components/screens/patient/PatientKonsType.tsx` | Tur tanlash |
| `src/app/components/screens/patient/PatientKonsSubtype.tsx` | Subtur tanlash |
| `src/app/components/screens/patient/PatientKonsDoctor.tsx` | Shifokor tanlash |
| `src/app/components/screens/patient/PatientKonsConfirm.tsx` | Tasdiqlash |
| `src/services/mock/bookingService.ts` | Shifokor va slot ma'lumotlari |

## Konsultatsiya oqimi

```
patient_konsultatsiya
  │
  ├─ Onlayn konsultatsiya (patient_kons_type)
  │   ├─ Video qo'ng'iroq
  │   ├─ Telefon qo'ng'iroq
  │   └─ Chat
  │
  └─ Oflayn konsultatsiya (patient_kons_subtype)
      ├─ Klinikada qabul
      ├─ Uyga tashrif
      ├─ Statsionarda
      └─ Sanatoriyda
          ├─ Tog'li sanatoriy
          ├─ Suvli sanatoriy
          ├─ Tekislik sanatoriy
          └─ Dengiz bo'yi sanatoriy
```

## Shifokor tanlash

Filterlar:
- **Mutaxassislik** - Nevrolog, Kardiolog, Ortoped va boshqalar
- **Reyting** - 0 dan 5 gacha
- **Tajriba** - yillar bo'yicha
- **Narx** - konsultatsiya narxi

Shifokor profili:
- To'liq ism, rasm
- Mutaxassislik, tajriba
- Reyting, ko'rilgan bemorlar soni
- Bo'sh vaqt slotlari (kalendar)

## Vaqt slotlari

`bookingService.getSlots(doctorId, date)` - har bir sana uchun slotlar:
```
09:00 - free
09:30 - busy
10:00 - free
...
```

Band slotlar ko'rsatilmaydi (BR-083).

## API Endpoints

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/v1/booking/doctors` | ❌ | Shifokorlar qidirish (?query, ?specialties) |
| GET | `/api/v1/booking/doctors/:id/slots` | ❌ | Shifokor bo'sh vaqtlari (?date) |
| GET | `/api/v1/booking/geo` | ❌ | Geografik hududlar (viloyat/tuman) |
| GET | `/api/v1/booking/specialties` | ❌ | Mutaxassisliklar ro'yxati |

> 📖 To'liq API spec: `docs/06-api-specification/api-endpoints.yaml` (Booking tag)

## Data Model

```
┌──────────────────────────────────────────┐
│             BookingSlot                   │
├──────────────────────────────────────────┤
│ id       : String (UUID, PK)            │
│ doctorId : String (FK → User)           │
│ date     : DateTime                      │
│ time     : String                        │
│ status   : String (free | busy)          │
└──────────────────────────────────────────┘
```

**Shifokor tanlash modeli:** `User` jadvalidan `role=DOCTOR` bo'lganlar filtrlash, `specialty` maydoni bo'yicha filtrlash.

**Slot response formati:**
```json
{
  "09:00": "free",
  "09:30": "busy",
  "10:00": "free"
}
```

## Security

| Xavfsizlik jihati | Amalga oshirish |
|---|---|
| **Shifokor ma'lumotlari** | Public endpoint, auth talab etilmaydi |
| **Slot band qilish** | Hozircha faqat ko'rish (booking yaratish keyingi fazada) |
| **Bemor ma'lumotlari** | Konsultatsiya uchun faqat bemor o'z ma'lumotlarini ko'radi |
| **Rate limiting** | Shifokor qidirish endpointda rate limit qo'yilishi kerak |

### Ruxsatlar matritsasi

| Amal | PATIENT | DOCTOR | OPERATOR | ADMIN |
|------|---------|--------|----------|-------|
| Shifokorlar ko'rish | ✅ | ✅ | ✅ | ✅ |
| Slot ko'rish | ✅ | ✅ | ✅ | ✅ |
| Konsultatsiya yaratish | ✅ | ❌ | ✅ | ✅ |
| Bekor qilish | ✅ (o'ziniki) | ❌ | ✅ | ✅ |

## Bog'liq talablar
FR-KONS-001 ... FR-KONS-006, BR-080 ... BR-083
