# Test Rejasi

> **Hujjat ID:** TST-002 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Test doirasi

### Doiradagi modullar

| # | Modul | Ustuvorlik | Test turi |
|---|-------|-----------|----------|
| 1 | AUTH - Autentifikatsiya | Yuqori | Unit + Integration + E2E |
| 2 | APP - Arizalar | Yuqori | Unit + Integration + E2E |
| 3 | RAD - Radiologiya | Yuqori | Unit + Integration + E2E |
| 4 | PAY - To'lov | Yuqori | Unit + Integration + E2E |
| 5 | KONS - Konsultatsiya | O'rta | Unit + Integration |
| 6 | TKS - Tekshiruv | O'rta | Unit + Integration |
| 7 | HV - Uyga chaqirish | O'rta | Unit + Integration |
| 8 | WEB - Web Platform | Yuqori | Unit + Integration + E2E |

## Test holatlari (Test Cases)

### TC-AUTH: Autentifikatsiya

| ID | Test holati | Kutilgan natija | Ustuvorlik |
|----|------------|----------------|-----------|
| TC-AUTH-001 | To'g'ri telefon + PIN bilan kirish | Dashboard ochiladi | Yuqori |
| TC-AUTH-002 | Noto'g'ri PIN bilan kirish | Xato xabari | Yuqori |
| TC-AUTH-003 | Rol tanlash (7 ta rol) | Rolga mos ekran | Yuqori |
| TC-AUTH-004 | Bo'sh telefon bilan kirish | Validatsiya xatosi | O'rta |

### TC-APP: Ariza yaratish

| ID | Test holati | Kutilgan natija | Ustuvorlik |
|----|------------|----------------|-----------|
| TC-APP-001 | To'liq ariza yaratish (7 bosqich) | Ariza "new" holatda | Yuqori |
| TC-APP-002 | Fayl yuklash (DICOM) | Fayl qabul qilindi | Yuqori |
| TC-APP-003 | Noto'g'ri fayl turi yuklash | Xato xabari | O'rta |
| TC-APP-004 | Anamnez to'ldirish | Ma'lumot saqlanadi | Yuqori |
| TC-APP-005 | Xizmat turi tanlash va narx | Narx to'g'ri hisoblangan | Yuqori |
| TC-APP-006 | Shoshilinch ariza narxi | 1.5x koeffitsient | Yuqori |
| TC-APP-007 | Shartnoma qabul qilish (3 checkbox) | Davom etish tugmasi aktiv | O'rta |
| TC-APP-008 | Draft saqlash va qayta yuklash | Ma'lumotlar saqlanib qoladi | O'rta |

### TC-PAY: To'lov

| ID | Test holati | Kutilgan natija | Ustuvorlik |
|----|------------|----------------|-----------|
| TC-PAY-001 | Payme orqali to'lov | To'lov muvaffaqiyatli | Yuqori |
| TC-PAY-002 | Naqd to'lov | Kassir tasdiqlaydi | Yuqori |
| TC-PAY-003 | To'lov bekor qilish | Status: cancelled | O'rta |
| TC-PAY-004 | Qaytarish (refund) | Status: refunded | O'rta |
| TC-PAY-005 | Kassir smena ochish | Smena ochildi | Yuqori |
| TC-PAY-006 | Kassir smena yopish (hisob-kitob) | Jami to'g'ri | Yuqori |

### TC-RAD: Radiologiya

| ID | Test holati | Kutilgan natija | Ustuvorlik |
|----|------------|----------------|-----------|
| TC-RAD-001 | Radiolog ariza qabul qilish | Status: accepted | Yuqori |
| TC-RAD-002 | Xulosa yozish va saqlash | Xulosa saqlanadi | Yuqori |
| TC-RAD-003 | PDF generatsiya | PDF yuklab olinadi | Yuqori |
| TC-RAD-004 | Mutaxassisga yo'naltirish | Status: with_specialist | O'rta |
| TC-RAD-005 | Qo'shimcha ma'lumot so'rash | Status: extra_info_needed | O'rta |

### TC-WEB: Web Platform

| ID | Test holati | Kutilgan natija | Ustuvorlik |
|----|------------|----------------|-----------|
| TC-WEB-001 | Web login | Dashboard ochiladi | Yuqori |
| TC-WEB-002 | Admin KPI paneli | Grafiklar ko'rinadi | Yuqori |
| TC-WEB-003 | Operator ariza boshqaruvi | Arizalar ro'yxati | Yuqori |
| TC-WEB-004 | Mini appdan ariza → Webda ko'rinishi | Sinxron ishlaydi | Yuqori |

## Risk-based test

| Risk | Ehtimol | Ta'sir | Test ustuvorligi |
|------|---------|--------|-----------------|
| To'lov xatosi | O'rta | Yuqori | P0 |
| Ma'lumot yo'qotish | Past | Yuqori | P0 |
| Noto'g'ri xulosa | Past | Yuqori | P1 |
| Login muammosi | O'rta | O'rta | P1 |
| UI buzilishi | Yuqori | Past | P2 |
