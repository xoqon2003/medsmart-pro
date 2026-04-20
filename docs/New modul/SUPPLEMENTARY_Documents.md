# MedSmart Pro — Qo'shimcha To'ldiruvchi Hujjatlar

**Versiya:** 1.0 | **Sana:** 11.04.2026

Asosiy 45 ta hujjatdan tashqari, professional loyiha uchun quyidagi **25+ ta qo'shimcha hujjat** kerak bo'ladi. Ular 7 toifaga bo'linadi.

---

## QO'SHIMCHA HUJJATLAR RO'YXATI

### A. STRATEGIK VA BIZNES (6 ta)
1. **Investor Pitch Deck** — investorlarga taqdimot
2. **Go-to-Market Strategy** — bozorga chiqish rejasi
3. **Pricing Strategy** — narx siyosati
4. **Marketing Plan** — marketing rejasi
5. **Partnership Strategy** — klinika va laboratoriyalar bilan
6. **Exit Strategy** — IPO/sotish rejasi

### B. MAHSULOT VA UX (5 ta)
7. **Product Roadmap** — 3 yillik mahsulot rejasi
8. **MVP Scope Document** — birinchi versiya aniq doirasi
9. **Persona Document** — foydalanuvchi personalari
10. **Information Architecture** — sayt/ilova tuzilishi
11. **Content Strategy** — kontent rejasi (maqolalar, blog)

### C. TEXNIK (6 ta)
12. **Coding Standards** — kodlash standartlari
13. **Git Workflow** — branching, PR jarayoni
14. **Database Migration Strategy** — migratsiya rejasi
15. **API Versioning Strategy** — API versiyalash
16. **Performance Optimization Guide** — optimallashtirish
17. **Code Review Checklist** — kod ko'rib chiqish

### D. OPERATSION (5 ta)
18. **Runbook** — production muammolari uchun qo'llanma
19. **On-Call Schedule** — navbatchilik jadvali
20. **Incident Postmortem Template** — incident tahlili shablon
21. **SLA Document** — xizmat sifati majburiyatlari
22. **Vendor Management** — yetkazib beruvchilar boshqaruvi

### E. INSON RESURSLARI (3 ta)
23. **Hiring Plan** — ishga olish rejasi
24. **Onboarding Guide** — yangi xodimlar uchun
25. **Team Handbook** — jamoa qoidalari

---

# ENDI ENG MUHIM 5 TASINI YOZAMAN

---

# 1. INVESTOR PITCH DECK (qisqartirilgan)

## Slide 1: Sarlavha
**MedSmart Pro** — Markaziy Osiyoning birinchi AI tibbiy yordamchisi  
*"Cho'ntagingizdagi shifokor"*

## Slide 2: Muammo
- 35M aholi, 1 shifokorga 2500 bemor
- O'rtacha tashxis kechikishi — 5-10 kun
- 60% bemorlar noto'g'ri mutaxassisga boradi
- Tibbiy savodxonlik past

## Slide 3: Yechim
AI yordamchi: simptom → 5 daqiqada birlamchi tashxis → mutaxassis tavsiyasi → navbat olish

## Slide 4: Bozor
- TAM: $2B (Markaziy Osiyo digital health)
- SAM: $400M (O'zbekiston)
- SOM: $40M (3 yilda 10% ulush)

## Slide 5: Mahsulot demo
Skrinshotlar va video link

## Slide 6: Biznes modeli
- Klinika komissiyasi 15-20%
- Premium obuna $5/oy
- B2B sug'urta integratsiyasi

## Slide 7: Tortish (Traction)
- MVP launch — 3 oy
- Pilot — 5 ta klinika
- Beta foydalanuvchilar — 1000

## Slide 8: Raqobat
Ada Health, Babylon — global, mahalliylashmagan  
Mahalliy ilovalar — faqat navbat olish, AI yo'q

## Slide 9: Jamoa
CEO, CTO, Bosh shifokor, Lead Dev, BizDev

## Slide 10: Moliya
- Boshlang'ich xarajat: $300K
- Daromad prognozi: 1y $400K, 2y $1.2M, 3y $3M
- Break-even: 10-oy

## Slide 11: So'rov
$500K seed round, 15% equity uchun

## Slide 12: Aloqa
contact@medsmartpro.uz

---

# 2. MVP SCOPE DOCUMENT

## 1. MVP MAQSAD
3 oy ichida ishlaydigan birinchi versiya chiqarish — minimal funksional, lekin to'liq ekosistema.

## 2. MVP GA KIRADIGAN (IN SCOPE)
- Bemor ro'yxatdan o'tish (telefon + OTP)
- Asosiy profil (demografiya, allergiyalar, surunkali kasalliklar)
- Simptom kiritish (faqat matn)
- 20 ta kasallik bo'yicha AI tahlil
- Top-3 tashxis ko'rsatish
- Mutaxassis tavsiyasi
- Red flag aniqlash
- Yaqin klinikalar (statik ro'yxat — 10 ta klinika Toshkentda)
- Navbat olish (manual — telefon orqali)
- 2 til (uz, ru)
- Faqat web (mobile keyinroq)

## 3. MVP GA KIRMAYDIGAN (OUT OF SCOPE)
- ❌ Mobile ilova
- ❌ Ovoz orqali simptom
- ❌ Tana xaritasi
- ❌ Onlayn to'lov
- ❌ Telemeditsina
- ❌ Tahlil natijalarini yuklash
- ❌ Oilaviy profil
- ❌ Apple/Google Sign-in
- ❌ Ingliz tili

## 4. MUVAFFAQIYAT MEZONI
- 100 beta foydalanuvchi
- Top-3 accuracy ≥75%
- Red flag sensitivity ≥90%
- 5 ta klinika hamkor

## 5. MUDDAT
- Hafta 1-2: Setup, dizayn
- Hafta 3-6: Backend + AI
- Hafta 7-9: Frontend
- Hafta 10-11: Test
- Hafta 12: Launch

---

# 3. PERSONA DOCUMENT

## Persona 1: Aziza, 35 yosh, ona
**Demografiya:** Toshkent, o'rta sinf, ikki bola onasi, ofis xodimi  
**Tibbiy holati:** Yengil gipertoniya, vaqti-vaqti bilan migren  
**Muammosi:** Bola kasal bo'lganida tushunmaydi, qaysi shifokorga borishni bilmaydi  
**Maqsadi:** Bolasi va o'zi uchun tezkor maslahat olish  
**Foydalanish stsenariysi:** Bola yuqori harorat — ilovaga kiradi — savol-javob — taklif: pediatr + harorat tushiruvchi  
**Texnologik tajriba:** O'rta — Telegram, Instagram ishlatadi  
**Til:** O'zbek (lotin)

## Persona 2: Bobur, 28 yosh, dasturchi
**Demografiya:** Toshkent, IT sohasida, sog'lom turmush tarziga e'tiborli  
**Muammosi:** Vaqt yo'q, shifokorga borish uchun navbat kutish — to'g'ri kelmaydi  
**Maqsadi:** Tezkor, sifatli, online maslahat  
**Foydalanish:** Premium obuna sotib oladi, tahlillar tarixini saqlaydi  
**Til:** Rus/ingliz

## Persona 3: Karim ota, 65 yosh, pensioner
**Tibbiy holati:** Diabet, gipertoniya, eski operatsiyalar  
**Muammosi:** Klinikalarga borish qiyin, dorilar ko'p, esidan chiqadi  
**Maqsadi:** Dorilarini eslatish, tahlillar dinamikasi  
**Texnologik:** Past — katta shrift, oddiy interfeys kerak  
**Yordamchi:** O'g'li yordam beradi  
**Til:** O'zbek (kiril)

## Persona 4: Dr. Sherzod, 42 yosh, terapevt
**Roli:** Xususiy klinika shifokori  
**Maqsadi:** Yangi bemorlar oqimi, vaqt tejash (oldindan anamnez)  
**Foydalanish:** Doctor portal — bemor kelishidan oldin EMR ko'radi

## Persona 5: Klinika administratori
Klinika tomonidan ro'yxatdan o'tkazadi, shifokorlar va vaqtlarni boshqaradi.

---

# 4. CODING STANDARDS (qisqa)

## 1. UMUMIY
- **Tillar:** TypeScript (FE/BE), Python (AI service)
- **Linter:** ESLint + Prettier (TS), Black + Ruff (Py)
- **Naming:** camelCase (TS), snake_case (Py)
- **Files:** kebab-case

## 2. TYPESCRIPT QOIDALARI
- `any` ishlatish taqiqlangan
- Strict mode yoqilgan
- Interfeys nomi `IUser` emas, faqat `User`
- Async/await preferred over .then()
- Funksiya max 50 qator

## 3. PYTHON QOIDALARI
- Type hints majburiy (mypy strict)
- Docstrings (Google style)
- Max 80 belgi qator
- f-strings, .format() emas

## 4. KOMMENTARIYALAR
- Faqat "nima uchun" kerak, "nima qilayotgan" emas
- TODO/FIXME — ticket ID bilan
- Tibbiy logika — manba ko'rsatish

## 5. GIT COMMIT
- Format: `type(scope): message`
- Misol: `feat(ai): add red flag detection`
- Types: feat, fix, docs, style, refactor, test, chore

## 6. CODE REVIEW
- Min 1 reviewer
- Critical kod (AI, security) — 2 reviewer
- 24 soatda javob

---

# 5. RUNBOOK (Production muammolari uchun)

## INCIDENT 1: AI service ishlamayapti

### Belgilar
- Foydalanuvchilar "tashxis olinmayapti" deb shikoyat
- AI service health check FAIL
- Latency > 30s

### Tekshirish
1. Sentry alertlari
2. AI service logs (`kubectl logs ai-service`)
3. LLM API status (Claude status page)
4. Token quota tekshirish

### Yechim
1. Agar Claude ishlamasa → fallback GPT-4 ga o'tish (env variable)
2. Agar token quota tugagan → emergency top-up
3. Agar service crash → restart (`kubectl rollout restart`)
4. Agar DB connection → connection pool tekshirish

### Eskalatsiya
- 5 daqiqa ichida hal bo'lmasa → AI Lead chaqirish
- 15 daqiqa → CTO chaqirish

## INCIDENT 2: Database down
## INCIDENT 3: SMS service ishlamayapti
## INCIDENT 4: Payment gateway xatosi
## INCIDENT 5: Yuqori latency
(Har biri yuqoridagi format bo'yicha yoziladi)

## SHOSHILINCH ALOQALAR
- AI Lead: +998XX XXX-XX-XX
- DB Admin: +998XX XXX-XX-XX
- DevOps: +998XX XXX-XX-XX
- CTO: +998XX XXX-XX-XX

---

# QO'SHIMCHA TAVSIYALAR

## Yana yozilishi mumkin bo'lgan hujjatlar:
- **Glossary** — 100+ tibbiy va texnik atamalar
- **Style Guide** — yozuv uslubi (UI matnlari uchun)
- **Translation Guide** — tarjimonlar uchun
- **Accessibility Audit** — WCAG tekshiruvi
- **SEO Strategy** — qidiruv tizimi optimallashtirish
- **Email Templates** — barcha avtomatik xabarlar
- **Push Notification Templates**
- **Crisis Communication Plan** — PR/media bilan ishlash
- **Customer Support Scripts** — call center uchun

**Hujjat oxiri.**
