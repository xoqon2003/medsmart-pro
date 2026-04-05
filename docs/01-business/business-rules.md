# Biznes Qoidalari

> **Hujjat ID:** BIZ-002 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Identifikatsiya qoidalari

| ID | Qoida | Kategoriya |
|----|-------|-----------|
| BR-001 | Har bir foydalanuvchi telefon raqami orqali ro'yxatdan o'tadi | Auth |
| BR-002 | Har bir arizaga unikal `arizaNumber` beriladi (MSP-YYYY-NNNNN) | Application |
| BR-003 | Bemor bir vaqtda bir nechta faol arizaga ega bo'lishi mumkin | Application |
| BR-004 | Har bir xulosa muallifi va vaqt belgisi bilan qayd qilinadi | Conclusion |

## Ariza holatlari qoidalari

| ID | Qoida | Kategoriya |
|----|-------|-----------|
| BR-010 | Yangi ariza `new` holatida yaratiladi | Status |
| BR-011 | To'lov tasdiqlangach ariza `accepted` ga o'tadi | Status |
| BR-012 | Radiolog qo'shimcha ma'lumot so'rasa `extra_info_needed` ga o'tadi | Status |
| BR-013 | Xulosa yozilayotganda `conclusion_writing` holatiga o'tadi | Status |
| BR-014 | Barcha xulosa tayyor bo'lgach `done` holatiga o'tadi | Status |
| BR-015 | Bekor qilingan ariza `failed` holatiga o'tadi | Status |
| BR-016 | 90 kundan eski yakunlangan arizalar `archived` ga o'tadi | Status |

## To'lov qoidalari

| ID | Qoida | Kategoriya |
|----|-------|-----------|
| BR-020 | To'lov qabul qilinmaguncha ariza radiologga yuborilmaydi | Payment |
| BR-021 | Shoshilinch arizalar narxi 1.5x ko'payadi | Payment |
| BR-022 | Favqulodda arizalar narxi 2x ko'payadi | Payment |
| BR-023 | Qaytarilgan to'lov 3 ish kuni ichida amalga oshiriladi | Payment |
| BR-024 | Kassir har bir smena boshida boshlang'ich qoldiq kiritadi | Payment |
| BR-025 | Smena yopilganda jami hisob-kitob chiqariladi | Payment |

## Narxlar

| ID | Xizmat turi | Narx (so'm) | Shoshilinch (1.5x) | Favqulodda (2x) |
|----|-------------|-------------|---------------------|-----------------|
| BR-030 | AI + Radiolog | 150,000 | 225,000 | 300,000 |
| BR-031 | Faqat Radiolog | 200,000 | 300,000 | 400,000 |
| BR-032 | Radiolog + Mutaxassis | 350,000 | 525,000 | 700,000 |

## Tibbiy qoidalar

| ID | Qoida | Kategoriya |
|----|-------|-----------|
| BR-040 | Radiolog faqat litsenziyali mutaxassis bo'lishi kerak | Medical |
| BR-041 | AI tahlili faqat dastlabki skrining uchun, yakuniy xulosa inson tomonidan | Medical |
| BR-042 | Har bir xulosa imzolanishi va vaqt belgisi qo'yilishi shart | Medical |
| BR-043 | Bemor anamnezi to'liq to'ldirilishi kerak (allergiya, dorilar, surunkali kasalliklar) | Medical |
| BR-044 | DICOM, JPG, PDF, ZIP formatdagi tasvirlar qabul qilinadi | Medical |

## Xavfsizlik qoidalari

| ID | Qoida | Kategoriya |
|----|-------|-----------|
| BR-050 | Barcha muhim harakatlar audit logga yoziladi | Security |
| BR-051 | Foydalanuvchi faqat o'z roliga tegishli ma'lumotlarni ko'radi | Security |
| BR-052 | Sessiya 7 kun davom etadi, keyin qayta tizimga kirish kerak | Security |
| BR-053 | PIN kod 6 raqamdan iborat (web login uchun) | Security |

## SLA qoidalari

| ID | Qoida | Kategoriya |
|----|-------|-----------|
| BR-060 | Oddiy ariza xulosasi 48 soat ichida tayyor bo'ladi | SLA |
| BR-061 | Shoshilinch ariza xulosasi 12 soat ichida tayyor bo'ladi | SLA |
| BR-062 | Favqulodda ariza xulosasi 4 soat ichida tayyor bo'ladi | SLA |
| BR-063 | Tizim 99.5% vaqt ishlashi kerak | SLA |

## Uyga chaqirish qoidalari

| ID | Qoida | Kategoriya |
|----|-------|-----------|
| BR-070 | Uyga chaqirish faqat belgilangan hududlarda mavjud | HomeVisit |
| BR-071 | Bemor aniq manzil va aloqa ma'lumotlarini berishi shart | HomeVisit |
| BR-072 | Shifokor yo'lda (`hv_onway`) va yetib keldi (`hv_arrived`) holatlarini belgilaydi | HomeVisit |
| BR-073 | Uyga chaqirish bugun, ertaga yoki indinga band qilish mumkin | HomeVisit |

## Konsultatsiya qoidalari

| ID | Qoida | Kategoriya |
|----|-------|-----------|
| BR-080 | Onlayn konsultatsiya: video, telefon yoki chat orqali | Consultation |
| BR-081 | Oflayn konsultatsiya: klinika, uy, statsionar yoki sanatoriy | Consultation |
| BR-082 | Shifokor tanlashda mutaxassislik, reyting va tajriba ko'rsatiladi | Consultation |
| BR-083 | Band bo'lgan vaqt slotlari ko'rsatilmaydi | Consultation |
