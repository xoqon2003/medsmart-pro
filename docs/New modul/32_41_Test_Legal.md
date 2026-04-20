# MedSmart Pro — Test va Huquqiy Hujjatlar (32-41)

**Versiya:** 1.0 | **Sana:** 11.04.2026

---

# 32. MASTER TEST PLAN

## 1. STRATEGIYA
Tibbiy AI uchun standart QA + klinik validatsiya majburiy.

## 2. TEST DARAJALARI
- **Unit** — har funksiya (Jest, Pytest), ≥80% coverage
- **Integration** — servislar o'rtasida
- **System** — to'liq end-to-end (Playwright/Cypress)
- **UAT** — real foydalanuvchilar (beta)
- **Clinical** — shifokorlar tomonidan

## 3. TEST TURLARI
- Functional, Performance, Security, Usability, Accessibility, Localization, Regression, Compatibility (browser/device)

## 4. ENTRY/EXIT KRITERIYALARI
- **Entry:** kod tayyor, unit testlar o'tgan, environment tayyor
- **Exit:** ≥95% test passed, kritik bug yo'q, klinik validatsiya ≥80%

## 5. JAMOA VA JADVAL
- 3 QA muhandisi
- 2 hafta sprint test
- 1 hafta regressiya
- Avtomatlash darajasi: 70%

## 6. VOSITALAR
- **Test management:** TestRail
- **Bug tracking:** Jira
- **Automation:** Playwright, Pytest, k6
- **CI:** GitHub Actions

## 7. RISKLAR
- Klinik xato → eng yuqori prioritet
- Real bemor ma'lumotlari yo'q → sintetik dataset

---

# 33. TEST CASES DOCUMENT

## NAMUNA TC

**TC-001:** Bemor telefon orqali ro'yxatdan o'tadi  
**Prioritet:** Critical  
**Old shartlar:** Yangi telefon raqami  
**Qadamlar:**
1. Ilovani ochish
2. "Ro'yxatdan o'tish" bosish
3. +998901234567 kiritish
4. "Yuborish" bosish
5. SMS dan OTP olish
6. OTP kiritish

**Kutilgan:** Akkaunt yaratiladi, profil sahifasi ochiladi  
**Status:** [Passed/Failed]

**TC-002:** Bemor migren simptomlarini kiritadi va to'g'ri tashxis oladi  
**TC-003:** Red flag (insult belgilari) aniqlanadi  
**TC-004:** Allergiyasi bor bemor uchun dori tavsiya qilinmaydi  
**TC-005:** Klinika navbati to'lov bilan tasdiqlanadi  
... (jami 500+ TC tayyorlanadi)

---

# 34. CLINICAL VALIDATION PROTOCOL

## 1. METODOLOGIYA
AI tashxisini real shifokor tashxisi bilan solishtirish (ground truth).

## 2. DATASET
- **500 ta real klinik holat** (anonimlashtirilgan)
- Turli kasalliklar (50% keng tarqalgan, 30% o'rta, 20% noyob)
- Yosh, jins, etnik xilma-xillik

## 3. METRIKALAR
- **Sensitivity (sezuvchanlik):** TP / (TP+FN) — kasallikni topa olish
- **Specificity:** TN / (TN+FP)
- **Accuracy:** umumiy aniqlik
- **PPV (precision):** TP / (TP+FP)
- **F1-score**
- **Top-3 accuracy:** to'g'ri tashxis ehtimoliy ro'yxatda 3 ta ichida

## 4. CONFUSION MATRIX
Har bir kasallik uchun alohida.

## 5. TASDIQLASH MEZONLARI (release uchun)
- Top-3 accuracy ≥85%
- Red flag sensitivity ≥95%
- Hech qanday "missed critical" (insult, infarkt) yo'q

## 6. EKSPERT REVIEW
- 3 ta nezavisimy shifokor
- Disagreement → 4-shifokor

## 7. DOIMIY MONITORING
- Production'da har 1000 holatda 10 tasi tasodifiy ekspert revizyaga

---

# 35. PERFORMANCE TEST PLAN

## 1. STSENARIYLAR
- **Load:** 1000 concurrent users, 30 daqiqa
- **Stress:** 10,000 users gacha oshirib borish
- **Soak:** 100 users, 24 soat
- **Spike:** Birdan 5000 users

## 2. KPI'LAR
- API javob vaqti: p95 < 2s, p99 < 5s
- AI javob vaqti: < 8s
- Error rate: < 0.1%
- CPU/Memory: < 70%

## 3. VOSITALAR
- k6 (asosiy)
- JMeter (alternativa)
- Grafana (monitoring)

## 4. ENVIRONMENT
- Production-like staging

---

# 36. SECURITY TEST REPORT

## 1. SCOPE
- Web, mobile, API
- Auth, authorization
- Data encryption
- OWASP Top 10

## 2. TEST TURLARI
- **SAST** — Snyk, SonarQube
- **DAST** — OWASP ZAP, Burp Suite
- **Penetration test** — tashqi vendor
- **Vulnerability scan** — har deploy

## 3. OWASP TOP 10 TEKSHIRUVI
1. Broken Access Control
2. Cryptographic Failures
3. Injection (SQL, XSS)
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Identification/Auth Failures
8. Software/Data Integrity
9. Logging/Monitoring Failures
10. SSRF

## 4. NATIJA SHABLONI
| Severity | Topildi | Tuzatildi | Qoldi |
|---|---|---|---|
| Critical | 0 | 0 | 0 |
| High | 2 | 2 | 0 |
| Medium | 5 | 4 | 1 |
| Low | 12 | 8 | 4 |

---

# 37. PRIVACY POLICY

## 1. KIRISH
MedSmart Pro foydalanuvchi maxfiyligini hurmat qiladi.

## 2. QAYSI MA'LUMOTLAR YIG'ILADI
- Identifikatsiya: ism, telefon, email
- Tibbiy: simptomlar, anamnez, allergiyalar, dorilar
- Texnik: IP, qurilma, sessiya
- Geolokatsiya: faqat ruxsat bilan

## 3. NEGA YIG'ILADI
- Xizmat ko'rsatish
- Tashxis aniqligini oshirish
- Xavfsizlik
- Qonuniy talablar

## 4. KIM BILAN BO'LISHILADI
- Tanlangan klinika va shifokorlar (faqat bemor roziligi bilan)
- Hech qachon reklama beruvchilar bilan
- Davlat organlari (faqat sud qarori bilan)

## 5. SAQLASH MUDDATI
- Faol akkaunt: cheksiz
- O'chirilgan: 30 kun, keyin to'liq o'chiriladi
- Tibbiy ma'lumotlar: 10 yil (qonun talabi)

## 6. FOYDALANUVCHI HUQUQLARI
- Ko'rish, tahrirlash, eksport, o'chirish (Right to be forgotten)
- Roziligini qaytarib olish

## 7. ALOQA
privacy@medsmartpro.uz

---

# 38. TERMS OF SERVICE

## 1. XIZMAT TAVSIFI
MedSmart Pro — tibbiy ma'lumot va yo'naltirish xizmati. Tibbiy yordam emas.

## 2. FOYDALANUVCHI MAJBURIYATLARI
- Yoshi 18+ (yoki ota-ona roziligi bilan)
- To'g'ri ma'lumot kiritish
- Boshqa foydalanuvchilarga zarar yetkazmaslik

## 3. KOMPANIYA MAJBURIYATLARI
- Xizmatni saqlash (99.9% uptime)
- Ma'lumotlarni himoya qilish
- Disclaimer'larni ko'rsatish

## 4. JAVOBGARLIK CHEKLOVLARI
- Tizim YAKUNIY TASHXIS BERMAYDI
- Foydalanuvchi shifokorga murojaat qilishi shart
- Kompaniya tibbiy javobgarlikni o'z zimmasiga olmaydi

## 5. AKKAUNTNI TO'XTATISH
- Foydalanuvchi istalgan vaqt
- Kompaniya — ToS buzilganda

## 6. INTELLEKTUAL MULK
Barcha kontent kompaniya mulki.

## 7. NIZOLAR
O'zbekiston qonunlari, Toshkent sudi.

---

# 39. DATA PROCESSING AGREEMENT (DPA)

## 1. MAQSAD
PHI ni qayta ishlash bo'yicha rasmiy kelishuv (B2B uchun).

## 2. TARAFLAR
- Data Controller: Klinika
- Data Processor: MedSmart Pro

## 3. QAYTA ISHLASH MAQSADI
Faqat shartnomada ko'rsatilgan.

## 4. XAVFSIZLIK CHORALARI
- Shifrlash, RBAC, audit, backup

## 5. SUB-PROCESSORS
- AWS, Cloudflare, LLM provayderi (DPA shartlari bilan)

## 6. INCIDENT XABARNOMASI
- 24 soat ichida

## 7. AUDIT HUQUQI
- Yiliga 1 marta

---

# 40. INFORMED CONSENT FORM

## BEMOR ROZILIGI MATNI

> Men, _______, MedSmart Pro xizmatidan foydalanishga rozilik bildiraman va quyidagilarni tushunaman:
> 
> 1. Bu tizim shifokor o'rnini bosmaydi
> 2. AI taklif qiladigan tashxislar 100% aniq emas
> 3. Hayotga xavfli holatlarda men 103 ga qo'ng'iroq qilaman
> 4. Mening tibbiy ma'lumotlarim shifrlangan holda saqlanadi
> 5. Men ma'lumotlarimni istalgan vaqt o'chira olaman
> 6. Mening anonimlashtirilgan ma'lumotlarim AI ni yaxshilash uchun ishlatilishi mumkin
> 7. Men 18 yoshdan kattaman (yoki ota-onam ruxsat bergan)
> 
> Sana: _____ Imzo: _____

---

# 41. BACKUP & DISASTER RECOVERY PLAN

## 1. RPO va RTO
- RPO: 1 soat
- RTO: 4 soat

## 2. BACKUP STRATEGIYASI
- DB: kunlik full + soatlik incremental
- Files: kunlik
- Configuration: har o'zgarishda
- 3-2-1 qoidasi

## 3. SAQLASH JOYI
- Asosiy: AWS S3 (Frankfurt)
- Backup: Mahalliy DC + Backblaze
- Cold storage: Glacier (1 yildan keyin)

## 4. RESTORE PROTSEDURASI
1. Incident e'lon qilish
2. Severity baholash
3. DR jamoa yig'ilish
4. Backup'dan tiklash
5. Sanity test
6. Production'ga qaytish
7. Post-mortem

## 5. DR DRILL
Yiliga 2 marta to'liq simulyatsiya.

## 6. ALOQA
Incident vaqtida: foydalanuvchilarga email, status page, SMS.

**Hujjat oxiri.**
