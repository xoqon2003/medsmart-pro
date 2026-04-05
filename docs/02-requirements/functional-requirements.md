# Funksional Talablar

> **Hujjat ID:** REQ-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25 | **Standart:** IEEE 29148

## Modul bo'yicha funksional talablar

### AUTH - Autentifikatsiya moduli

| ID | Talab | Ustuvorlik | Holat |
|----|-------|-----------|-------|
| FR-AUTH-001 | Foydalanuvchi telefon raqami orqali ro'yxatdan o'tadi | Yuqori | Tayyor |
| FR-AUTH-002 | OTP (bir martalik parol) orqali tasdiqlash | Yuqori | Mock |
| FR-AUTH-003 | PIN kod orqali web platformaga kirish | Yuqori | Tayyor |
| FR-AUTH-004 | Rol tanlash ekrani (7 rol) | Yuqori | Tayyor |
| FR-AUTH-005 | JWT token bilan sessiya boshqaruvi (7 kun) | O'rta | Mock |
| FR-AUTH-006 | Demo login ma'lumotlari (test uchun) | Past | Tayyor |

### APP - Ariza moduli

| ID | Talab | Ustuvorlik | Holat |
|----|-------|-----------|-------|
| FR-APP-001 | Bemor yangi ariza yaratadi (radiologik tahlil) | Yuqori | Tayyor |
| FR-APP-002 | Tibbiy tasvirlarni yuklash (DICOM, JPG, PDF, ZIP) | Yuqori | Tayyor |
| FR-APP-003 | Anamnez ma'lumotlarini to'ldirish | Yuqori | Tayyor |
| FR-APP-004 | Xizmat turini tanlash (3 variant) | Yuqori | Tayyor |
| FR-APP-005 | Shoshilinchlik darajasini tanlash | Yuqori | Tayyor |
| FR-APP-006 | Shartnomani qabul qilish (3 checkbox) | Yuqori | Tayyor |
| FR-APP-007 | Ariza holatini real-time kuzatish | Yuqori | Tayyor |
| FR-APP-008 | Ariza tarixini ko'rish | O'rta | Tayyor |
| FR-APP-009 | Draft (qoralama) saqlash | O'rta | Tayyor |

### PAY - To'lov moduli

| ID | Talab | Ustuvorlik | Holat |
|----|-------|-----------|-------|
| FR-PAY-001 | To'lov usulini tanlash (6+ variant) | Yuqori | Tayyor |
| FR-PAY-002 | To'lov holatini kuzatish | Yuqori | Tayyor |
| FR-PAY-003 | Kassir to'lovni qabul qiladi | Yuqori | Tayyor |
| FR-PAY-004 | Smena ochish va yopish | Yuqori | Tayyor |
| FR-PAY-005 | Kunlik/haftalik/oylik statistika | O'rta | Tayyor |
| FR-PAY-006 | Qaytarish (refund) funksiyasi | O'rta | Tayyor |
| FR-PAY-007 | Chek/invoice generatsiya | O'rta | Tayyor |

### RAD - Radiologiya moduli

| ID | Talab | Ustuvorlik | Holat |
|----|-------|-----------|-------|
| FR-RAD-001 | Radiolog arizalar ro'yxatini ko'radi | Yuqori | Tayyor |
| FR-RAD-002 | Arizani qabul qilish | Yuqori | Tayyor |
| FR-RAD-003 | Qo'shimcha ma'lumot so'rash | O'rta | Tayyor |
| FR-RAD-004 | Xulosa yozish (rich text editor) | Yuqori | Tayyor |
| FR-RAD-005 | AI tahlil natijalarini ko'rish | Yuqori | Tayyor |
| FR-RAD-006 | Mutaxassisga yo'naltirish | O'rta | Tayyor |
| FR-RAD-007 | Xulosa PDF generatsiya | Yuqori | Tayyor |

### KONS - Konsultatsiya moduli

| ID | Talab | Ustuvorlik | Holat |
|----|-------|-----------|-------|
| FR-KONS-001 | Konsultatsiya turini tanlash (onlayn/oflayn) | Yuqori | Tayyor |
| FR-KONS-002 | Mutaxassislik bo'yicha shifokor qidirish | Yuqori | Tayyor |
| FR-KONS-003 | Shifokor profili ko'rish (reyting, tajriba) | O'rta | Tayyor |
| FR-KONS-004 | Vaqt tanlash (kalendar + slot) | Yuqori | Tayyor |
| FR-KONS-005 | Band bo'lgan slotlarni ko'rsatmaslik | Yuqori | Tayyor |
| FR-KONS-006 | Sanatoriy tanlash (tog'/suv/tekislik/dengiz) | Past | Tayyor |

### TKS - Tekshiruv moduli

| ID | Talab | Ustuvorlik | Holat |
|----|-------|-----------|-------|
| FR-TKS-001 | Tekshiruv kategoriyasini tanlash | Yuqori | Tayyor |
| FR-TKS-002 | Tekshiruv turini tanlash | Yuqori | Tayyor |
| FR-TKS-003 | Markaz tanlash (hudud, narx, reyting bo'yicha) | Yuqori | Tayyor |
| FR-TKS-004 | Vaqt band qilish | Yuqori | Tayyor |
| FR-TKS-005 | Markaz ma'lumotlarini ko'rish | O'rta | Tayyor |

### HV - Uyga chaqirish moduli

| ID | Talab | Ustuvorlik | Holat |
|----|-------|-----------|-------|
| FR-HV-001 | Manzil kiritish (viloyat/tuman/ko'cha) | Yuqori | Tayyor |
| FR-HV-002 | Aloqa ma'lumotlarini kiritish | Yuqori | Tayyor |
| FR-HV-003 | Sana va vaqt tanlash | Yuqori | Tayyor |
| FR-HV-004 | Mutaxassis tanlash | O'rta | Tayyor |
| FR-HV-005 | Tasdiqlash va yuborish | Yuqori | Tayyor |

### WEB - Web Platform moduli

| ID | Talab | Ustuvorlik | Holat |
|----|-------|-----------|-------|
| FR-WEB-001 | Login (telefon + PIN) | Yuqori | Tayyor |
| FR-WEB-002 | Rol asosida dashboard | Yuqori | Tayyor |
| FR-WEB-003 | Admin KPI paneli (grafik, statistika) | Yuqori | Tayyor |
| FR-WEB-004 | Operator ariza boshqaruvi | Yuqori | Tayyor |
| FR-WEB-005 | Radiolog web paneli (xulosa yozish) | Yuqori | Tayyor |
| FR-WEB-006 | Kassir web paneli | Yuqori | Tayyor |
| FR-WEB-007 | Bemor profili / EMK ko'rish | O'rta | Tayyor |
| FR-WEB-008 | Bildirishnomalar paneli | O'rta | Tayyor |
| FR-WEB-009 | Sozlamalar | Past | Tayyor |

### BOT - Telegram Bot moduli

| ID | Talab | Ustuvorlik | Holat |
|----|-------|-----------|-------|
| FR-BOT-001 | Bot orqali Mini App ochish | Yuqori | Tayyor |
| FR-BOT-002 | initData orqali foydalanuvchini aniqlash | Yuqori | Mock |
| FR-BOT-003 | Bildirishnoma yuborish (ariza holati o'zgarganda) | Yuqori | Rejada |
| FR-BOT-004 | Inline tugmalar orqali tezkor harakatlar | O'rta | Rejada |
