# Metodologik Asoslar

> **Hujjat ID:** STD-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Maqsad

MedSmart-Pro loyihasida qo'llaniladigan standartlar, metodologiyalar va eng yaxshi amaliyotlarni belgilash.

## Qo'llaniladigan standartlar

### Talablar boshqaruvi
| Standart | Qo'llanilish sohasi |
|----------|---------------------|
| **IEEE 29148** | Talablarni yozish va boshqarish |
| **BABOK v3** | Biznes tahlili asoslari |

### Arxitektura
| Standart | Qo'llanilish sohasi |
|----------|---------------------|
| **C4 Model** | Arxitektura vizualizatsiyasi (Context, Container, Component, Code) |
| **ARC42** | Arxitektura hujjatlashtirish shabloni |
| **IEEE 1471** | Arxitektura tavsifi standardi |

### Sifat nazorati
| Standart | Qo'llanilish sohasi |
|----------|---------------------|
| **ISO 25010** | Dasturiy ta'minot sifati modeli |
| **ISTQB** | Test metodologiyasi |
| **ISO 29119** | Test jarayonlari |

### API va integratsiya
| Standart | Qo'llanilish sohasi |
|----------|---------------------|
| **OpenAPI 3.0** | REST API spetsifikatsiyasi |
| **SemVer** | Semantik versiyalash |

### Operatsiyalar
| Standart | Qo'llanilish sohasi |
|----------|---------------------|
| **ITIL** | IT xizmat boshqaruvi |

### Tibbiy standartlar
| Standart | Qo'llanilish sohasi |
|----------|---------------------|
| **HL7 FHIR R4** | Tibbiy ma'lumot almashish (kelajakda) |
| **DICOM** | Tibbiy tasvirlar standarti |
| **ICD-10** | Kasalliklar klassifikatsiyasi |

## Loyiha metodologiyasi

### Agile/Scrum
- **Sprint:** 2 haftalik
- **Daily standup:** Har kuni 09:00
- **Sprint review:** Sprint oxirida
- **Retrospektiva:** Sprint oxirida

### User Story formati
```
Sifatida: [Rol]
Men xohlayman: [Harakat]
Shunda: [Natija]

Qabul mezonlari:
Given: [Boshlang'ich holat]
When: [Harakat]
Then: [Kutilgan natija]
```

### Git Workflow
- **main** - ishlab chiqarish (production)
- **develop** - rivojlantirish
- **feature/*** - yangi xususiyatlar
- **fix/*** - xatolarni tuzatish
- **docs/*** - hujjatlar

### Kod sifati
- TypeScript strict mode
- ESLint + Prettier
- PR review majburiy
- Minimal 80% test coverage (maqsad)
