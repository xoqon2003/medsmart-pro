# Ma'lumotlar Lug'ati (Data Dictionary)

> **Hujjat ID:** DATA-003 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## ENUM turlari

### UserRole
| Qiymat | Tavsif |
|--------|--------|
| `patient` | Bemor |
| `radiolog` | Radiolog mutaxassisi |
| `doctor` | Shifokor |
| `specialist` | Tor mutaxassis |
| `operator` | Operator |
| `admin` | Administrator |
| `kassir` | Kassir |

### ApplicationStatus
| Qiymat | Tavsif | Keyingi holatlar |
|--------|--------|-----------------|
| `new` | Yangi yaratilgan | paid_pending, failed |
| `paid_pending` | To'lov kutilmoqda | accepted, failed |
| `accepted` | Radiolog qabul qildi | extra_info_needed, conclusion_writing |
| `extra_info_needed` | Qo'shimcha ma'lumot kerak | accepted |
| `with_specialist` | Mutaxassisda | conclusion_writing |
| `conclusion_writing` | Xulosa yozilmoqda | done |
| `done` | Yakunlangan | archived |
| `failed` | Bekor qilingan | - |
| `archived` | Arxivlangan | - |
| `hv_onway` | Shifokor yo'lda (uyga chaqirish) | hv_arrived |
| `hv_arrived` | Shifokor yetib keldi | done |

### ServiceType
| Qiymat | Tavsif | Narx (so'm) |
|--------|--------|-------------|
| `ai_radiolog` | AI + Radiolog tahlili | 150,000 |
| `radiolog_only` | Faqat radiolog | 200,000 |
| `radiolog_specialist` | Radiolog + Mutaxassis | 350,000 |
| `consultation` | Konsultatsiya | O'zgaruvchan |
| `home_visit` | Uyga chaqirish | O'zgaruvchan |

### Urgency
| Qiymat | Koeffitsient | SLA |
|--------|-------------|-----|
| `normal` | 1.0x | 48 soat |
| `urgent` | 1.5x | 12 soat |
| `emergency` | 2.0x | 4 soat |

### PaymentProvider
| Qiymat | Tavsif |
|--------|--------|
| `personal_card` | Shaxsiy karta |
| `payme` | Payme |
| `click` | Click |
| `uzum` | Uzum Bank |
| `uzcard` | UzCard |
| `humo` | Humo |
| `cash` | Naqd pul |

### PaymentStatus
| Qiymat | Tavsif |
|--------|--------|
| `pending` | Kutilmoqda |
| `paid` | To'langan |
| `cancelled` | Bekor qilingan |
| `refunded` | Qaytarilgan |

### ConclusionType
| Qiymat | Tavsif |
|--------|--------|
| `ai_analysis` | AI tahlili (avtomatik) |
| `radiolog` | Radiolog xulosasi |
| `specialist` | Mutaxassis xulosasi |
| `doctor` | Shifokor xulosasi |

### ScanType
| Qiymat | Tavsif |
|--------|--------|
| `MRT` | Magnit rezonans tomografiya |
| `MSKT` | Multispiral kompyuter tomografiya |
| `Rentgen` | Rentgen |
| `USG` | Ultratovush |
| `Boshqa` | Boshqa turlar |

## Ma'lumot klassifikatsiyasi

| Kategoriya | Tavsif | Misollar | Himoya |
|-----------|--------|----------|--------|
| **Public** | Ochiq ma'lumot | Xizmat turlari, narxlar | Yo'q |
| **Internal** | Ichki ma'lumot | KPI, statistika | Kirish nazorati |
| **Confidential** | Maxfiy | Biznes qoidalari, audit log | Shifrlash + RBAC |
| **PII** | Shaxsiy ma'lumot | Ism, telefon, manzil | AES-256 + RBAC |
| **PHI** | Tibbiy ma'lumot | Anamnez, xulosa, tasvirlar | AES-256 + RBAC + Audit |

## AI Analysis tuzilishi

```typescript
interface AIAnalysis {
  anomalies: string[]    // Topilgan anomaliyalar
  regions: string[]      // Ta'sirlangan hududlar
  confidence: number     // Ishonch darajasi (0-100%)
  notes: string          // Qo'shimcha izoh
}
```
