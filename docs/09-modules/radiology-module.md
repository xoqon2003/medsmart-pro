# Radiology Moduli - Radiologiya

> **Modul ID:** MOD-RAD | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Umumiy

Radiolog mutaxassislarining ish jarayoni - arizalarni ko'rish, tasvirlarni tahlil qilish, xulosa yozish va mutaxassisga yo'naltirish.

## Fayl joylashuvi

| Fayl | Maqsad |
|------|--------|
| `src/app/components/screens/radiolog/RadiologyDashboard.tsx` | Radiolog bosh paneli |
| `src/app/components/screens/radiolog/ApplicationView.tsx` | Ariza ko'rish |
| `src/app/components/screens/radiolog/ConclusionEditor.tsx` | Xulosa yozish |
| `src/app/components/screens/web/WebRadiologPanel.tsx` | Web radiolog paneli |
| `src/app/utils/pdfGenerator.ts` | Xulosa PDF generatsiya |

## Radiolog ish oqimi

```
Dashboard → Yangi arizalar ro'yxati
  │
  ├─ Arizani ochish → Bemor ma'lumotlari + tasvirlar
  │
  ├─ Qabul qilish → Status: "accepted"
  │   │
  │   ├─ Qo'shimcha ma'lumot so'rash → Status: "extra_info_needed"
  │   │
  │   ├─ Xulosa yozish → Rich text editor
  │   │   ├─ Tavsif (description)
  │   │   ├─ Topilmalar (findings)
  │   │   ├─ Taassurot (impression)
  │   │   └─ Tavsiyalar (recommendations)
  │   │
  │   └─ Mutaxassisga yo'naltirish → Status: "with_specialist"
  │
  └─ Tasdiqlash → Status: "done" → PDF generatsiya
```

## Xulosa turlari

| Tur | Muallif | Tavsif |
|-----|---------|--------|
| `ai_analysis` | AI Model | Avtomatik skrining (anomaliyalar, ishonch %) |
| `radiolog` | Radiolog | Asosiy diagnostik xulosa |
| `specialist` | Mutaxassis | Qo'shimcha professional xulosa |
| `doctor` | Shifokor | Konsultatsiya xulosasi |

## AI Tahlil natijasi

```json
{
  "anomalies": ["Chap o'pkada soya topildi"],
  "regions": ["Chap o'pka pastki bo'limi"],
  "confidence": 87.5,
  "notes": "Qo'shimcha CT tavsiya etiladi"
}
```

## PDF Xulosa

`pdfGenerator.ts` orqali professional PDF generatsiya qilinadi:
- Bemor ma'lumotlari
- Skan tafsilotlari
- AI tahlil natijalari
- Radiolog xulosasi
- Mutaxassis xulosasi (agar mavjud)
- Tavsiyalar
- Imzo va sana

## API Endpoints

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/v1/applications` | ❌ | Radiolog o'z arizalarini olish (?radiologId=X) |
| GET | `/api/v1/applications/:id` | ❌ | Ariza to'liq ma'lumotlari (files, anamnez) |
| PATCH | `/api/v1/applications/:id/status` | ✅ JWT | Status o'zgartirish (accepted, extra_info_needed, with_specialist) |
| GET | `/api/v1/applications/:appId/conclusions` | ❌ | Ariza xulosalari |
| POST | `/api/v1/applications/:appId/conclusions` | ✅ JWT | Yangi xulosa yaratish |

> 📖 To'liq API spec: `docs/06-api-specification/api-endpoints.yaml` (Applications, Conclusions tag)

## Data Model

```
┌──────────────────────────────────────────┐
│              Conclusion                   │
├──────────────────────────────────────────┤
│ id              : String (UUID, PK)      │
│ conclusionType  : ConclusionType (ENUM)  │
│ description     : String                 │
│ findings        : String                 │
│ impression      : String                 │
│ recommendations : String (nullable)      │
│ source          : String (nullable)      │
│ aiAnalysis      : String (nullable)      │
│ pdfUrl          : String (nullable)      │
│ applicationId   : String (FK)            │
│ createdAt       : DateTime               │
└──────────────────────────────────────────┘
```

**ConclusionType ENUM:** AI, RADIOLOG, SPECIALIST, DOCTOR

## Security

| Xavfsizlik jihati | Amalga oshirish |
|---|---|
| **Xulosa yaratish** | Faqat JWT autentifikatsiya (radiolog/specialist/doctor) |
| **DICOM ko'rish** | Maxfiy URL, autentifikatsiya kerak |
| **PHI himoya** | Bemor ma'lumotlari faqat tayinlangan radiologga ko'rinadi |
| **Audit** | Har bir status o'zgarishida AuditEvent yaratiladi |
| **PDF** | Xulosa PDF faqat bemor va tayinlangan xodimlarga |

### Ruxsatlar matritsasi

| Amal | RADIOLOG | SPECIALIST | DOCTOR | OPERATOR | ADMIN |
|------|----------|------------|--------|----------|-------|
| Tayinlangan arizalarni ko'rish | ✅ | ✅ | ✅ | ✅ | ✅ |
| Arizani qabul qilish | ✅ | ❌ | ❌ | ❌ | ✅ |
| Xulosa yozish | ✅ | ✅ | ✅ | ❌ | ❌ |
| Mutaxassisga yo'naltirish | ✅ | ❌ | ❌ | ❌ | ❌ |
| PDF generatsiya | ✅ | ✅ | ✅ | ❌ | ✅ |

## Bog'liq talablar
FR-RAD-001 ... FR-RAD-007, BR-040 ... BR-044, BR-060 ... BR-062
