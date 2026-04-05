# Examination Moduli - Tekshiruv

> **Modul ID:** MOD-TKS | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Umumiy

Bemor tekshiruv markazlarida laboratoriya, UZI, rentgen va boshqa tekshiruvlarga yozilish moduli.

## Fayl joylashuvi

| Fayl | Maqsad |
|------|--------|
| `src/app/components/screens/patient/PatientTekshiruv.tsx` | Bosh ekran |
| `src/app/components/screens/patient/PatientTksCategory.tsx` | Kategoriya tanlash |
| `src/app/components/screens/patient/PatientTksExam.tsx` | Tekshiruv tanlash |
| `src/app/components/screens/patient/PatientTksCenter.tsx` | Markaz tanlash |
| `src/app/components/screens/patient/PatientTksCalendar.tsx` | Vaqt tanlash |
| `src/app/components/screens/patient/PatientTksConfirm.tsx` | Tasdiqlash |
| `src/services/mock/examinationService.ts` | Markaz va tekshiruv ma'lumotlari |

## Tekshiruv oqimi

```
patient_tekshiruv → Kategoriya tanlash
  │
  ├─ Vizual tekshiruvlar (Rentgen, MRT, MSKT, Flyuorografiya)
  ├─ Ultratovush (UZI qorin, yurak, tireoid, ...)
  ├─ Laboratoriya (Umumiy qon, bioximiya, gormon, ...)
  ├─ Funksional (EKG, EEG, spirometriya, ...)
  └─ Endoskopiya (Gastroskopiya, kolonoskopiya, ...)
      │
      ▼
  Tekshiruv turini tanlash → Markaz tanlash → Vaqt tanlash → Tasdiqlash
```

## Markaz tanlash filterlari

| Filtr | Tavsif |
|-------|--------|
| Hudud | Viloyat va tuman bo'yicha |
| Narx | Arzon dan qimmatga |
| Reyting | Yuqoridan pastga |
| Masofa | Yaqindan uzoqqa (km) |

## Markaz ma'lumotlari

```typescript
interface Center {
  id: number
  name: string       // "City Med Lab"
  region: string     // "Toshkent"
  district: string   // "Chilonzor"
  rating: number     // 4.5
  price: number      // 80000
  distanceKm: number // 3.2
}
```

## API Endpoints

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/v1/examinations/centers` | ❌ | Tekshiruv markazlari (?region, ?district) |
| GET | `/api/v1/examinations/exams/:category` | ❌ | Kategoriya bo'yicha tekshiruvlar |

> 📖 To'liq API spec: `docs/06-api-specification/api-endpoints.yaml` (Examinations tag)

## Data Model

```
┌──────────────────────────────────────────┐
│          ExaminationCenter                │
├──────────────────────────────────────────┤
│ id         : String (UUID, PK)           │
│ name       : String                      │
│ region     : String                      │
│ district   : String                      │
│ rating     : Float                       │
│ price      : Float                       │
│ distanceKm : Float                       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│            Examination                    │
├──────────────────────────────────────────┤
│ id            : String (UUID, PK)        │
│ examType      : String                   │
│ result        : String (nullable)        │
│ centerId      : String (nullable)        │
│ applicationId : String (FK)              │
└──────────────────────────────────────────┘
```

## Security

| Xavfsizlik jihati | Amalga oshirish |
|---|---|
| **Markazlar ro'yxati** | Public endpoint, auth talab etilmaydi |
| **Natijalar** | Bemor faqat o'z tekshiruv natijalarini ko'radi |
| **PHI** | Tekshiruv natijalari tibbiy sir sifatida himoyalanadi |

### Ruxsatlar matritsasi

| Amal | PATIENT | DOCTOR | OPERATOR | ADMIN |
|------|---------|--------|----------|-------|
| Markazlarni ko'rish | ✅ | ✅ | ✅ | ✅ |
| Tekshiruvga yozilish | ✅ | ❌ | ✅ | ✅ |
| Natijalarni ko'rish | ✅ (o'ziniki) | ✅ | ✅ | ✅ |

## Bog'liq talablar
FR-TKS-001 ... FR-TKS-005
