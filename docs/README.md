# MedSmart-Pro - Hujjatlar Markazi

> **Versiya:** 1.0.0 | **Sana:** 2026-03-25 | **Holat:** Faol ishlab chiqish

## Loyiha haqida qisqacha

**MedSmart-Pro** - tibbiy diagnostika va teletibbiyot platformasi. Bemorlar radiologik tasvirlarni yuklash, mutaxassis konsultatsiyasi olish, tekshiruvga yozilish va uyga shifokor chaqirish imkoniyatiga ega. Platforma ikki interfeysdan iborat:

- **Mini App** (`/`) - Telegram bot orqali mobil interfeys
- **Web Platform** (`/web`) - Desktop professional panel

## Hujjatlar tuzilishi

| # | Bo'lim | Tavsif | Bosqich |
|---|--------|--------|---------|
| 00 | [Standartlar](./00-standards/) | Metodologik asoslar | 1-bosqich |
| 01 | [Biznes](./01-business/) | Biznes talablari, vizyon | 2-bosqich |
| 02 | [Talablar](./02-requirements/) | Funksional va nofunksional talablar | 2-bosqich |
| 03 | [Stsenariylar](./03-use-cases/) | Foydalanuvchi stsenariylari | 2-bosqich |
| 04 | [Arxitektura](./04-architecture/) | Tizim arxitekturasi | 3-bosqich |
| 05 | [Ma'lumotlar](./05-data-architecture/) | Ma'lumotlar arxitekturasi | 3-bosqich |
| 06 | [API](./06-api-specification/) | API spetsifikatsiyalari | 4-bosqich |
| 07 | [Integratsiyalar](./07-integrations/) | Tashqi integratsiyalar | 4-bosqich |
| 08 | [Xavfsizlik](./08-security/) | Xavfsizlik siyosati | 5-bosqich |
| 09 | [Modullar](./09-modules/) | Modullar hujjatlari | 6-bosqich |
| 10 | [DevOps](./10-devops/) | Deployment va operatsiyalar | 7-bosqich |
| 11 | [Testlar](./11-testing/) | Test strategiyasi va rejasi | 7-bosqich |
| 12 | [Changelog](./12-changelog/) | O'zgarishlar tarixi | Doimiy |
| 13 | [Onboarding](./13-onboarding/) | Yangi xodimlar uchun | Doimiy |
| 14 | [Amaliyot](./14-practicals/) | Demo va amaliy topshiriqlar | Doimiy |
| 15 | [Shablonlar](./15-templates/) | Hujjat shablonlari | Doimiy |

## Qo'shimcha fayllar

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - LLM va AI yordamchilari uchun kontekst
- [doc-update-checklist.md](./doc-update-checklist.md) - O'zgarishlar nazorati cheklisti

## Texnologiya steki

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | React 18.3, TypeScript, Vite 6.3 |
| UI | Tailwind CSS 4.1, shadcn/ui, Radix UI |
| State | React Context (AppStore) |
| Grafik | Recharts 2.15 |
| PDF | jsPDF 4.2 |
| Deploy | Vercel |
| Backend | Mock services (kelajakda NestJS) |

## Foydalanuvchi rollari

| Rol | Mini App | Web Panel | Tavsif |
|-----|----------|-----------|--------|
| Patient | + | - | Bemor - ariza topshiradi |
| Radiolog | + | + | Radiolog - xulosa yozadi |
| Doctor | + | + | Shifokor - konsultatsiya beradi |
| Specialist | + | + | Mutaxassis - qo'shimcha xulosa |
| Operator | + | + | Operator - arizalarni boshqaradi |
| Admin | + | + | Administrator - tizimni boshqaradi |
| Kassir | + | + | Kassir - to'lovlarni qabul qiladi |
