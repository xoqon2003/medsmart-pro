# Integratsiya Xaritasi

> **Hujjat ID:** INT-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Integratsiyalar umumiy ko'rinishi

```
                         ┌─────────────────┐
                         │  MedSmart-Pro   │
                         │   Platform      │
                         └────────┬────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────▼─────┐          ┌─────▼─────┐          ┌─────▼─────┐
    │ Aloqa     │          │  To'lov   │          │  Tibbiy   │
    │           │          │           │          │           │
    │ Telegram  │          │ Payme     │          │ AI Model  │
    │ SMS       │          │ Click     │          │ DICOM     │
    │ Email     │          │ Uzum      │          │ HL7 FHIR  │
    └───────────┘          │ UzCard    │          └───────────┘
                           │ Humo      │
                           └───────────┘
```

## Batafsil integratsiya jadvali

### 1. Telegram Bot API

| Xususiyat | Qiymat |
|-----------|--------|
| **Turi** | Aloqa + Platforma |
| **Holat** | Qisman tayyor |
| **Protokol** | HTTPS / Bot API |
| **Maqsad** | Mini App ochish, bildirishnomalar |

**Funksiyalar:**
- `/start` - Mini App ni ochish
- `initData` - Foydalanuvchini aniqlash
- Inline tugmalar orqali tezkor harakatlar
- Ariza holati o'zgarganda push notification

**Kelajakdagi funksiyalar:**
- Fayl yuborish/qabul qilish
- Inline query (shifokor qidirish)
- Web App callback

---

### 2. To'lov provayderlari

#### 2.1 Payme
| Xususiyat | Qiymat |
|-----------|--------|
| **Holat** | Rejada |
| **Protokol** | REST API |
| **Maqsad** | Onlayn to'lov qabul qilish |

#### 2.2 Click
| Xususiyat | Qiymat |
|-----------|--------|
| **Holat** | Rejada |
| **Protokol** | REST API |

#### 2.3 Uzum Bank
| Xususiyat | Qiymat |
|-----------|--------|
| **Holat** | Rejada |
| **Protokol** | REST API |

#### 2.4 UzCard / Humo
| Xususiyat | Qiymat |
|-----------|--------|
| **Holat** | Rejada |
| **Protokol** | Bank API |

**Umumiy to'lov oqimi:**
```
Bemor → Xizmat tanlash → Narx ko'rish → To'lov usuli tanlash
  → Provayderga yo'naltirish → Callback → Ariza holatini yangilash
```

---

### 3. AI Model (Radiologik tasvir tahlili)

| Xususiyat | Qiymat |
|-----------|--------|
| **Holat** | Rejada |
| **Protokol** | REST API |
| **Maqsad** | Radiologik tasvirlarni avtomatik tahlil qilish |

**Input:** DICOM/JPG tasvir
**Output:**
```json
{
  "anomalies": ["Anomaliya tavsifi"],
  "regions": ["Ta'sirlangan hudud"],
  "confidence": 87.5,
  "notes": "Qo'shimcha izoh"
}
```

---

### 4. Fayl saqlash (kelajak)

| Xususiyat | Qiymat |
|-----------|--------|
| **Texnologiya** | MinIO / AWS S3 |
| **Holat** | Rejada |
| **Maqsad** | DICOM, PDF, tasvirlar saqlash |
| **Hajm limiti** | 50MB / fayl |

---

### 5. SMS xizmati (kelajak)

| Xususiyat | Qiymat |
|-----------|--------|
| **Provayderlar** | Eskiz.uz, PlayMobile |
| **Holat** | Rejada |
| **Maqsad** | OTP tasdiqlash, bildirishnomalar |

---

### 6. HL7 FHIR (kelajak v3.0)

| Xususiyat | Qiymat |
|-----------|--------|
| **Standart** | FHIR R4 |
| **Holat** | Rejada |
| **Maqsad** | Tashqi tibbiy tizimlar bilan interoperability |

## Integratsiya holatlari xulosasi

| # | Integratsiya | Holat | Ustuvorlik | Rejalashtirilgan |
|---|-------------|-------|-----------|-----------------|
| 1 | Telegram Bot | Qisman | Yuqori | v1.0 |
| 2 | Payme | Rejada | Yuqori | v1.1 |
| 3 | Click | Rejada | Yuqori | v1.1 |
| 4 | Uzum Bank | Rejada | O'rta | v1.2 |
| 5 | UzCard/Humo | Rejada | O'rta | v1.2 |
| 6 | AI Model | Rejada | Yuqori | v1.1 |
| 7 | MinIO/S3 | Rejada | Yuqori | v1.1 |
| 8 | SMS (Eskiz) | Rejada | O'rta | v1.1 |
| 9 | HL7 FHIR | Rejada | Past | v3.0 |
