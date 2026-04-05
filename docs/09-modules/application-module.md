# Application Moduli - Arizalar

> **Modul ID:** MOD-APP | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Umumiy

Markaziy domen moduli. Bemor tomonidan yaratilgan tibbiy arizalarni boshqarish - yaratishdan yakunlashgacha.

## Fayl joylashuvi

| Fayl | Maqsad |
|------|--------|
| `src/services/mock/applicationService.ts` | Application CRUD |
| `src/app/store/appStore.tsx` | applications[], addApplication, updateApplicationStatus |
| `src/app/types/index.ts` | Application, ApplicationStatus, ServiceType interfeyslari |
| `src/app/data/mockData.ts` | mockApplications |

## Holat diagrammasi

```
┌─────┐   to'lov    ┌──────────────┐   radiolog    ┌──────────┐
│ new │───────────▶│ paid_pending │─────────────▶│ accepted │
└──┬──┘            └──────────────┘              └────┬─────┘
   │                                                   │
   │ bekor                          ┌─────────────────┤
   ▼                                ▼                  ▼
┌────────┐              ┌───────────────────┐  ┌─────────────────┐
│ failed │              │ extra_info_needed │  │ with_specialist  │
└────────┘              └───────────────────┘  └────────┬────────┘
                                                        │
                                                        ▼
                        ┌────────────────────┐  ┌──────────────┐
                        │ conclusion_writing │◀─┤              │
                        └────────┬───────────┘  └──────────────┘
                                 │
                                 ▼
                        ┌────────┐     90 kun    ┌──────────┐
                        │  done  │──────────────▶│ archived │
                        └────────┘               └──────────┘
```

## Xizmat turlari va narxlar

| Tur | Narx | Shoshilinch (1.5x) | Favqulodda (2x) |
|-----|------|-------------------|-----------------|
| AI + Radiolog | 150,000 | 225,000 | 300,000 |
| Faqat Radiolog | 200,000 | 300,000 | 400,000 |
| Radiolog + Mutaxassis | 350,000 | 525,000 | 700,000 |

## Bemor ariza topshirish oqimi

1. **Fayl yuklash** (`patient_upload`) - DICOM, JPG, PDF, ZIP
2. **Anamnez** (`patient_anamnez`) - shikoyatlar, og'riq, dorilar, allergiya
3. **Xizmat tanlash** (`patient_service`) - 3 variant + shoshilinchlik
4. **Shartnoma** (`patient_contract`) - 3 checkbox qabul qilish
5. **To'lov** (`patient_payment`) - 6+ to'lov usuli
6. **Holat kuzatish** (`patient_status`) - real-time progress
7. **Xulosa** (`patient_conclusion`) - PDF yuklab olish

## Draft (Qoralama) tizimi

AppStore da `draftApplication` saqlanadi - bemor oraliq bosqichlardan chiqsa, ma'lumotlar saqlanib qoladi.

## API Endpoints

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| GET | `/api/v1/applications` | ❌ | Arizalar ro'yxati (?status, ?patientId, ?radiologId, ?page, ?limit) |
| GET | `/api/v1/applications/:id` | ❌ | Ariza to'liq ma'lumotlari (patient, files, payment, conclusions, auditLog) |
| POST | `/api/v1/applications` | ✅ JWT | Yangi ariza yaratish |
| PUT | `/api/v1/applications/:id` | ✅ JWT | Ariza yangilash |
| PATCH | `/api/v1/applications/:id/status` | ✅ JWT | Ariza holatini o'zgartirish |

**Response format (GET list):**
```json
{
  "data": [Application],
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

> 📖 To'liq API spec: `docs/06-api-specification/api-endpoints.yaml` (Applications tag)

## Data Model

```
┌──────────────────────────────────────────┐
│              Application                  │
├──────────────────────────────────────────┤
│ id           : String (UUID, PK)         │
│ serviceType  : ServiceType (ENUM)        │
│ urgency      : Urgency (ENUM)            │
│ status       : AppStatus (ENUM)          │
│ bodyPart     : String (nullable)         │
│ diagnosis    : String (nullable)         │
│ notes        : String (nullable)         │
│ patientId    : String (FK → User)        │
│ radiologId   : String (FK → User)        │
│ specialistId : String (FK → User)        │
│ doctorId     : String (FK → User)        │
│ homeVisit    : Boolean (default: false)  │
│ homeAddress  : String (nullable)         │
│ homePhone    : String (nullable)         │
│ homeDate     : DateTime (nullable)       │
│ price        : Float (nullable)          │
│ createdAt    : DateTime                  │
│ updatedAt    : DateTime                  │
├──────────────────────────────────────────┤
│ RELATIONS:                               │
│ → anamnez (1:1 Anamnez)                 │
│ → files (1:N FileRecord)                │
│ → payment (1:1 Payment)                 │
│ → conclusions (1:N Conclusion)           │
│ → auditLog (1:N AuditEvent)            │
│ → examinations (1:N Examination)        │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│                Anamnez                    │
├──────────────────────────────────────────┤
│ id           : String (UUID, PK)         │
│ complaints   : String                    │
│ history      : String                    │
│ allergies    : String                    │
│ medications  : String                    │
│ applicationId: String (FK, UNIQUE)       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│              FileRecord                   │
├──────────────────────────────────────────┤
│ id           : String (UUID, PK)         │
│ fileName     : String                    │
│ fileType     : FileType (ENUM)           │
│ fileUrl      : String                    │
│ fileSize     : Int                       │
│ applicationId: String (FK)               │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│              AuditEvent                   │
├──────────────────────────────────────────┤
│ id           : String (UUID, PK)         │
│ action       : String                    │
│ details      : String (nullable)         │
│ userId       : String (nullable)         │
│ applicationId: String (FK)               │
│ createdAt    : DateTime                  │
└──────────────────────────────────────────┘
```

**Enumlar:**
- **ServiceType:** XRAY, MRI, CT, ULTRASOUND, FLUOROGRAPHY
- **Urgency:** NORMAL, URGENT, EMERGENCY
- **AppStatus:** NEW → PAID_PENDING → ACCEPTED → ASSIGNED → IN_PROGRESS → WAITING_RESULT → RESULT_READY → CONSULTATION → COMPLETED → REJECTED → DONE
- **FileType:** DICOM, IMAGE, PDF, OTHER

## Security

| Xavfsizlik jihati | Amalga oshirish |
|---|---|
| **Yaratish** | Faqat autentifikatsiya qilingan foydalanuvchi (JWT) |
| **Ko'rish** | Bemor faqat o'z arizalarini, operator barcha arizalarni ko'radi |
| **Status o'zgartirish** | JWT talab etiladi, audit log yoziladi |
| **Audit trail** | Har bir status o'zgarishida AuditEvent yaratiladi |
| **PHI himoya** | Bemor ma'lumotlari (anamnez) alohida jadvalda |
| **Fayl xavfsizligi** | DICOM fayllar maxfiy URL orqali yuklanadi |

### Ruxsatlar matritsasi

| Amal | PATIENT | RADIOLOG | SPECIALIST | OPERATOR | ADMIN |
|------|---------|----------|------------|----------|-------|
| Ariza yaratish | ✅ | ❌ | ❌ | ✅ | ✅ |
| O'z arizalarini ko'rish | ✅ | ✅ | ✅ | ✅ | ✅ |
| Barcha arizalarni ko'rish | ❌ | ❌ | ❌ | ✅ | ✅ |
| Status o'zgartirish | ❌ | ✅ | ✅ | ✅ | ✅ |
| Ariza tahrirlash | ❌ | ❌ | ❌ | ✅ | ✅ |

## Bog'liq talablar
FR-APP-001 ... FR-APP-009, BR-010 ... BR-016, BR-030 ... BR-032
