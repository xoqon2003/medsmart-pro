# O'zgarishlar Tarixi (Changelog)

> Barcha muhim o'zgarishlar shu yerda qayd qilinadi.
> Format: [SemVer](https://semver.org/) | [Keep a Changelog](https://keepachangelog.com/)

## [1.0.0] - 2026-03-25

### Qo'shildi
- Mini App (Telegram Mini App) - 80+ ekranli mobil interfeys
- Web Platform - desktop professional panel (13+ ekran)
- 7 ta foydalanuvchi roli: patient, radiolog, doctor, specialist, operator, admin, kassir
- Radiologik tahlil moduli (fayl yuklash, anamnez, xizmat tanlash, to'lov, xulosa)
- Konsultatsiya moduli (onlayn/oflayn, shifokor tanlash, vaqt band qilish)
- Tekshiruv moduli (kategoriya, markaz tanlash, vaqt band qilish)
- Uyga chaqirish moduli (5 bosqichli oqim)
- Kassir moduli (smena boshqarish, to'lov qayd qilish)
- Admin KPI paneli (grafiklar, statistika, tizim monitoring)
- Operator paneli (arizalar boshqaruvi)
- PDF xulosa generatsiyasi
- Audit logging tizimi
- Mock service layer (API ga almashtirishga tayyor)
- 50+ shadcn/ui komponentlari
- Vercel deployment
- To'liq hujjatlashtirish (docs/ - 37 ta fayl)

### Texnik
- React 18.3 + TypeScript + Vite 6.3
- Tailwind CSS 4.1 + shadcn/ui
- React Context (AppStore) global state
- Multi-page Vite build (index.html + web.html)
- React Hook Form + Recharts + jsPDF + Motion.js

---

## O'zgarish yozish qoidalari

Har bir yozuv quyidagi kategoriyalardan birida bo'lishi kerak:

- **Qo'shildi** - yangi funksiyalar
- **O'zgartirildi** - mavjud funksiyalardagi o'zgarishlar
- **Eskirgan** - tez orada olib tashlanadigan funksiyalar
- **Olib tashlandi** - olib tashlangan funksiyalar
- **Tuzatildi** - xatolar tuzatildi
- **Xavfsizlik** - xavfsizlik bilan bog'liq o'zgarishlar
