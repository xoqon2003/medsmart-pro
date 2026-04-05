# Aktorlar Katalogi

> **Hujjat ID:** UC-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Ichki aktorlar (Foydalanuvchilar)

| # | Aktor | Rol kodi | Platforma | Asosiy vazifalari |
|---|-------|----------|-----------|-------------------|
| 1 | **Bemor** | `patient` | Mini App | Ariza topshirish, xulosa ko'rish, to'lov qilish |
| 2 | **Radiolog** | `radiolog` | Mini App + Web | Tasvirlarni tahlil qilish, xulosa yozish |
| 3 | **Shifokor** | `doctor` | Mini App + Web | Konsultatsiya berish, bemorni ko'rish |
| 4 | **Mutaxassis** | `specialist` | Mini App + Web | Qo'shimcha xulosa, yo'naltirish |
| 5 | **Operator** | `operator` | Mini App + Web | Arizalar oqimini boshqarish |
| 6 | **Kassir** | `kassir` | Mini App + Web | To'lovlarni qayd qilish |
| 7 | **Administrator** | `admin` | Mini App + Web | Tizimni boshqarish, KPI monitoring |

## Tashqi aktorlar

| # | Aktor | Integratsiya | Tavsif |
|---|-------|-------------|--------|
| 1 | **Telegram Bot** | Bot API | Mini App ochish, bildirishnomalar |
| 2 | **Payme** | Payment API | Onlayn to'lov |
| 3 | **Click** | Payment API | Onlayn to'lov |
| 4 | **Uzum Bank** | Payment API | Onlayn to'lov |
| 5 | **AI Model** | REST API | Radiologik tasvir tahlili |

## Tizim aktorlari

| # | Aktor | Tavsif |
|---|-------|--------|
| 1 | **Scheduler** | SLA deadline kuzatish, arxivlash |
| 2 | **Notification Service** | Push/SMS/Telegram bildirishnomalar |
| 3 | **PDF Generator** | Xulosa va chek generatsiya |
| 4 | **Audit Logger** | Barcha harakatlarni qayd qilish |

## Ruxsat matritsasi

| Harakat | Patient | Radiolog | Doctor | Specialist | Operator | Kassir | Admin |
|---------|---------|----------|--------|-----------|----------|--------|-------|
| Ariza yaratish | + | - | - | - | + | - | - |
| Ariza ko'rish (o'zining) | + | + | + | + | + | + | + |
| Barcha arizalarni ko'rish | - | - | - | - | + | - | + |
| Xulosa yozish | - | + | + | + | - | - | - |
| To'lov qabul qilish | - | - | - | - | - | + | - |
| Foydalanuvchi boshqarish | - | - | - | - | - | - | + |
| KPI/Statistika ko'rish | - | - | - | - | + | + | + |
| Smena boshqarish | - | - | - | - | - | + | + |
| Ariza yo'naltirish | - | + | - | - | + | - | + |
| Tibbiy yozuv tahrirlash | - | + | + | + | - | - | - |
