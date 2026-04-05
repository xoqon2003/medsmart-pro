# Foydalanuvchi Stsenariylari (User Stories)

> **Hujjat ID:** UC-003 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Bemor stsenariylari

### US-RAD-001: Radiologik tahlil uchun ariza topshirish

**Sifatida:** Bemor
**Men xohlayman:** Radiologik tasvirlarimni yuklash va mutaxassis xulosasini olish
**Shunda:** Uyimdan chiqmasdan professional diagnostika xulosa olaman

**Qabul mezonlari:**
```gherkin
Given: Bemor Mini App da tizimga kirgan
When: "Yangi ariza" tugmasini bosadi
Then: Fayl yuklash ekrani ko'rsatiladi

Given: Bemor tasvirlarni yuklagan
When: Anamnez va xizmat turini tanlaydi
Then: Narx va shartnoma ko'rsatiladi

Given: Bemor shartnomani qabul qilgan
When: To'lov usulini tanlaydi va to'laydi
Then: Ariza "accepted" holatiga o'tadi va radiologga yuboriladi
```

**Ekranlar:** `patient_upload` → `patient_anamnez` → `patient_service` → `patient_contract` → `patient_payment` → `patient_status`

---

### US-RAD-002: Ariza holatini kuzatish

**Sifatida:** Bemor
**Men xohlayman:** Arizam qaysi bosqichda ekanini ko'rish
**Shunda:** Xulosa qachon tayyor bo'lishini bilaman

**Qabul mezonlari:**
```gherkin
Given: Bemor faol arizaga ega
When: "Arizalarim" bo'limiga kiradi
Then: Barcha arizalar holati bilan ko'rsatiladi (vaqt belgilari bilan)
```

---

### US-KONS-001: Onlayn konsultatsiya band qilish

**Sifatida:** Bemor
**Men xohlayman:** Mutaxassis shifokordan onlayn konsultatsiya olish
**Shunda:** Video/telefon orqali sifatli maslahat olaman

**Qabul mezonlari:**
```gherkin
Given: Bemor konsultatsiya bo'limiga kirgan
When: "Onlayn" turini tanlaydi
Then: Mavjud mutaxassisliklar ro'yxati ko'rsatiladi

Given: Bemor shifokorni tanlagan
When: Bo'sh vaqt slotini tanlaydi
Then: Konsultatsiya band qilinadi va tasdiqlash ko'rsatiladi
```

**Ekranlar:** `patient_konsultatsiya` → `patient_kons_type` → `patient_kons_subtype` → `patient_kons_doctor` → `patient_kons_confirm`

---

### US-TKS-001: Tekshiruvga yozilish

**Sifatida:** Bemor
**Men xohlayman:** Yaqin atrofdagi tekshiruv markaziga yozilish
**Shunda:** Navbatsiz tekshiruvdan o'taman

**Ekranlar:** `patient_tekshiruv` → `patient_tks_category` → `patient_tks_exam` → `patient_tks_center` → `patient_tks_calendar` → `patient_tks_confirm`

---

### US-HV-001: Uyga shifokor chaqirish

**Sifatida:** Bemor
**Men xohlayman:** Shifokorni uyimga chaqirish
**Shunda:** Klinikaga bormasdan tibbiy yordam olaman

**Ekranlar:** `home_visit` → `home_visit_address` → `home_visit_contact` → `home_visit_time` → `home_visit_specialist` → `home_visit_confirm`

---

## Radiolog stsenariylari

### US-RAD-010: Ariza qabul qilish va xulosa yozish

**Sifatida:** Radiolog
**Men xohlayman:** Bemorning radiologik tasvirlarini ko'rib xulosa yozish
**Shunda:** Professional diagnostik xulosa bemorga yetkaziladi

**Qabul mezonlari:**
```gherkin
Given: Radiolog dashboardda
When: Yangi ariza ro'yxatini ko'radi
Then: Ariza tafsilotlari va tasvirlar ko'rsatiladi

Given: Radiolog arizani qabul qilgan
When: Xulosa yozib "Tasdiqlash" bosadi
Then: Xulosa saqlanadi, ariza "done" ga o'tadi
```

---

### US-RAD-011: Mutaxassisga yo'naltirish

**Sifatida:** Radiolog
**Men xohlayman:** Murakkab holatda mutaxassisga yo'naltirish
**Shunda:** Bemor qo'shimcha professional xulosa oladi

---

## Operator stsenariylari

### US-OPR-001: Arizalar oqimini boshqarish

**Sifatida:** Operator
**Men xohlayman:** Barcha arizalarni ko'rish va boshqarish
**Shunda:** Har bir ariza to'g'ri mutaxassisga yo'naltiriladi

---

## Kassir stsenariylari

### US-KAS-001: To'lovni qabul qilish

**Sifatida:** Kassir
**Men xohlayman:** Bemorning to'lovini qayd qilish
**Shunda:** To'lov tasdiqlangan va arizaga bog'langan

**Qabul mezonlari:**
```gherkin
Given: Kassir smena ochgan
When: Yangi to'lov keladi
Then: To'lov tafsilotlari ko'rsatiladi (summa, chegirma, usul)

Given: Kassir to'lovni tasdiqlagan
When: "Qabul qilish" tugmasini bosadi
Then: Chek generatsiya qilinadi, ariza holati yangilanadi
```

---

## Admin stsenariylari

### US-ADM-001: KPI monitoring

**Sifatida:** Administrator
**Men xohlayman:** Platformaning asosiy ko'rsatkichlarini ko'rish
**Shunda:** Biznes qarorlar qabul qila olaman

**Web ekran:** `web_admin` - KPI kartalar, grafiklar, tizim holati

---

## Web Platform stsenariylari

### US-WEB-001: Web platformaga kirish

**Sifatida:** Tibbiy xodim
**Men xohlayman:** Desktop brauzerdan platformaga kirish
**Shunda:** Katta ekranda qulay ishlash mumkin

**Qabul mezonlari:**
```gherkin
Given: Xodim web.html sahifasiga kiradi
When: Telefon va PIN kodni kiritadi
Then: Roliga mos dashboard ochiladi
```
