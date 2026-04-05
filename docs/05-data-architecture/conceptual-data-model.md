# Kontseptual Ma'lumot Modeli (CDM)

> **Hujjat ID:** DATA-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Entity Relationship Diagram (ERD)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   User   │────▶│  Application │◀────│  Conclusion  │
│          │  1:N│              │ 1:N │              │
└──────────┘     └──────┬───────┘     └──────────────┘
                        │
                   1:1  │  1:N
                        │
                 ┌──────▼───────┐     ┌──────────────┐
                 │   Payment    │     │  AuditEvent  │
                 └──────────────┘     └──────────────┘
                                           ▲
                                           │ N:1
┌──────────┐     ┌──────────────┐     ┌────┴─────────┐
│ Anamnez  │────▶│  FileRecord  │     │  Notification│
│          │ 1:1 │              │     └──────────────┘
└──────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐
│ KassaSmena   │────▶│ KassaTolov   │
│ (Shift)      │ 1:N │ (Payment Rec)│
└──────────────┘     └──────────────┘
```

## Asosiy entitylar

### 1. User (Foydalanuvchi)
Platformadagi barcha foydalanuvchilar - bemorlar, shifokorlar, operatorlar va boshqalar.
- Bir foydalanuvchi bitta rolga ega
- Professional foydalanuvchilar qo'shimcha maydonlarga ega (litsenziya, tajriba, reyting)

### 2. Application (Ariza)
Markaziy domen modeli. Bemor tomonidan yaratilgan tibbiy ariza.
- Bir arizaning bitta bemori bor
- Bitta ariza bir nechta xulosa olishi mumkin (AI, radiolog, mutaxassis)
- Bitta ariza bitta to'lovga ega
- 11 ta holat bosqichi

### 3. Conclusion (Xulosa)
Tibbiy mutaxassis yoki AI tomonidan berilgan diagnostik xulosa.
- 4 turi: ai_analysis, radiolog, specialist, doctor
- Muallif va vaqt belgisi bilan

### 4. Payment (To'lov)
Ariza uchun to'lov ma'lumotlari.
- 7 ta to'lov usuli
- 4 ta holat: pending, paid, cancelled, refunded

### 5. Anamnez (Tibbiy tarix)
Bemorning tibbiy tarixi va hozirgi shikoyatlari.
- Allergiyalar, dorilar, surunkali kasalliklar
- Og'riq darajasi, shikoyat davomiyligi

### 6. FileRecord (Fayl)
Yuklangan tibbiy tasvirlar va hujjatlar.
- DICOM, JPG, PDF, ZIP formatlar
- Hajm va tur tekshiruvi

### 7. AuditEvent (Audit yozuvi)
Barcha muhim harakatlar qaydnomasi.
- Kim, nima, qachon, qaysi ariza

### 8. Notification (Bildirishnoma)
Foydalanuvchiga yuborilgan bildirishnomalar.
- Ariza holati o'zgarishi, yangi xulosa, to'lov tasdigi

### 9. KassaSmena (Kassir smenasi)
Kassirning ish smenasi.
- Smena boshi va oxiri, jami summa

### 10. KassaTolov (Kassa to'lovi)
Kassir tomonidan qayd qilingan to'lov.
- Invoice raqami, chegirma, qaytim

## Munosabatlar jadvali

| Entity A | Munosabat | Entity B | Tavsif |
|----------|-----------|----------|--------|
| User | 1:N | Application | Bemor ko'p ariza topshiradi |
| Application | 1:N | Conclusion | Ariza ko'p xulosa oladi |
| Application | 1:1 | Payment | Har bir ariza bitta to'lov |
| Application | 1:1 | Anamnez | Har bir ariza bitta anamnez |
| Application | 1:N | FileRecord | Ariza ko'p fayl o'z ichiga oladi |
| Application | 1:N | AuditEvent | Ariza ko'p audit yozuvi |
| User | 1:N | Notification | Foydalanuvchi ko'p bildirishnoma |
| KassaSmena | 1:N | KassaTolov | Smena ko'p to'lov |
