# MedSmart Pro — Texnik Topshiriq (ТЗ)

**Versiya:** 1.0  
**Sana:** 11.04.2026  
**Loyiha URL:** https://medsmart-pro.vercel.app/

---

## 1. LOYIHA HAQIDA UMUMIY MA'LUMOT

### 1.1. Maqsad
MedSmart Pro — bu sun'iy intellekt asosidagi tibbiy yordamchi platforma bo'lib, bemorga:
- Birlamchi (taxminiy) tashxis qo'yadi
- Qaysi mutaxassisga murojaat qilishni tavsiya etadi
- Qaysi tahlil va tekshiruvlarni topshirish kerakligini ko'rsatadi
- Yaqin atrofdagi tibbiyot muassasalarini taklif qiladi
- Bemorning to'liq tibbiy tarixini saqlaydi va keyingi murojaatlarda hisobga oladi

### 1.2. Asosiy printsip
**MUHIM:** Tizim hech qachon yakuniy tashxis qo'ymaydi. U faqat **yo'naltiruvchi vosita**. Har bir natijada disclaimer bo'lishi shart: *"Bu yakuniy tashxis emas. Iltimos, shifokorga murojaat qiling."*

---

## 2. FOYDALANUVCHI ROLLARI

| Rol | Tavsifi |
|---|---|
| **Bemor (Patient)** | Asosiy foydalanuvchi. Simptomlarini kiritadi, tavsiyalar oladi |
| **Shifokor (Doctor)** | Bemor kartasini ko'radi, AI tavsiyalarini tasdiqlaydi/o'zgartiradi |
| **Administrator** | Tizim sozlamalari, foydalanuvchilar boshqaruvi |
| **Tibbiy ekspert** | Bilimlar bazasini yangilaydi, qoidalarni qo'shadi |
| **Klinika** | O'z xizmatlari, shifokorlari, manzilini joylashtiradi |

---

## 3. ASOSIY MODULLAR VA SUBMODULLAR

### MODUL 1: Foydalanuvchi ro'yxatdan o'tishi va profil

**Submodullar:**
1. **Ro'yxatdan o'tish** — telefon raqam + SMS OTP, email, Google/Apple Sign-in
2. **Bemor profili** — quyida 4-bo'limda batafsil
3. **Shaxsni tasdiqlash** — passport/ID upload (KYC)
4. **Oila a'zolari** — bir akkaunt orqali bolalar va keksa ota-onalar uchun profil

**Funksionallik:**
- Parol tiklash
- Ikki bosqichli autentifikatsiya (2FA)
- Sessiya boshqaruvi
- Maxfiylik sozlamalari (kim ma'lumotlarni ko'ra oladi)

---

### MODUL 2: Elektron tibbiy karta (EMR — Electronic Medical Record)

**Submodullar:**

#### 2.1. Demografik ma'lumotlar
- F.I.Sh., tug'ilgan sana, jins, manzil, telefon
- Qon guruhi va Rh-faktor
- Bo'y, vazn (BMI avtomatik hisoblanadi)
- Til, millat (ba'zi kasalliklar etnik xususiyatga ega)

#### 2.2. Anamnez (tibbiy tarix)
- **Oilaviy anamnez:** ota-ona, aka-uka, bobo-buvilarning kasalliklari
- **Surunkali kasalliklar:** ICD-10 kodlari bilan
- **O'tkazilgan operatsiyalar:** sanasi, turi, asoratlari
- **Jarohatlar:** bosh jarohati, suyak sinishi va h.k.
- **Emlash:** kalendar bo'yicha
- **Ginekologik anamnez** (ayollar uchun)
- **Pediatrik anamnez** (bolalar uchun) — tug'ilish vazni, rivojlanish

#### 2.3. Allergiyalar
- Dori allergiyalari (eng muhim — anafilaksiya xavfi)
- Oziq-ovqat allergiyalari
- Mavsumiy/atrof-muhit
- Allergik reaksiya darajasi (yengil/o'rta/og'ir)

#### 2.4. Hozirgi dorilar
- Dori nomi, dozasi, qabul qilish chastotasi
- Boshlangan sana
- O'zaro ta'sirlarni tekshirish (drug interaction checker)

#### 2.5. Hayot tarzi
- Chekish (kuniga nechta, necha yildan beri)
- Alkogol iste'moli
- Jismoniy faollik
- Ovqatlanish odatlari
- Kasbi va ish sharoiti

#### 2.6. Tahlillar va tekshiruvlar tarixi
- Qon tahlillari (umumiy, biokimyo, gormonlar)
- Siydik tahlili
- UZI, MRT, KT, rentgen natijalari (PDF/rasm yuklash)
- ECG, EEG
- Endoskopiya, kolonoskopiya
- Onkomarkerlar

#### 2.7. Murojaatlar tarixi
- Har bir murojaat sanasi
- Shikoyatlar
- AI tavsiyasi
- Haqiqiy shifokor tashxisi
- Tayinlangan davolanish
- Natija (yaxshilandi/yomonlashdi)

---

### MODUL 3: Simptom kiritish va birlamchi tahlil (ENG MUHIM MODUL)

#### 3.1. Simptom kiritish usullari
1. **Matn orqali** — erkin shaklda yozish ("boshim og'riyapti, ko'nglim aynayapti")
2. **Ovoz orqali** — speech-to-text (o'zbek, rus, ingliz tillarida)
3. **Tana xaritasi** — interaktiv 3D model, og'rigan joyni bosish
4. **Tayyor ro'yxatdan tanlash** — eng keng tarqalgan simptomlar

#### 3.2. Aniqlashtiruvchi savollar (Adaptive Questionnaire)
AI dastlabki simptomdan keyin **kontekstga qarab** qo'shimcha savollar beradi:

**Misol — bemor "boshim og'riyapti" deydi:**
- Og'riq qancha vaqtdan beri? (1 soat / 1 kun / 1 hafta / 1 oy+)
- Og'riqning xarakteri? (pulsatsiyali / bosuvchi / o'tkir / zerikarli)
- Qaysi joyida? (peshona / chakka / ensa / butun bosh / bir tomonda)
- Og'riq darajasi? (1-10 ballik shkala)
- Hamroh simptomlar? (ko'ngil aynishi / qusish / yorug'likdan qo'rqish / ko'rish buzilishi)
- Nima qachon yengillashadi/kuchayadi?
- Avval shunday holat bo'lganmi?
- Qon bosimingizni o'lchadingizmi?

**Javob berish usullari:**
- Tanlash (radio button / checkbox)
- Matn yozish
- Ovoz bilan
- Slayder (og'riq darajasi uchun)

#### 3.3. AI tahlil dvigateli (Inference Engine)
**Arxitektura:**
1. **NLP qatlami** — bemor matnini tushunadi (Uzbek/Russian/English)
2. **Simptom ekstraktori** — matndan aniq simptomlarni ajratib oladi
3. **Bilimlar bazasi (Knowledge Base)**:
   - ICD-10 (Xalqaro kasalliklar tasnifi)
   - SNOMED CT
   - UpToDate / Mayo Clinic ma'lumotlari
   - Mahalliy klinik protokollar
4. **Differensial diagnostika dvigateli** — bir nechta ehtimoliy tashxislarni ehtimollik bilan qaytaradi
5. **Bemor konteksti qatlami** — EMR dan ma'lumotlarni hisobga oladi (yoshi, jinsi, surunkali kasalliklari, allergiyalari, irsiyati)

#### 3.4. Red Flag (Qizil bayroq) tizimi
**SHOSHILINCH** holatlar aniqlansa, tizim darhol ogohlantiradi:
- Ko'krak qafasi og'rig'i + chap qo'lga berilish → infarkt shubhasi → **103 ga qo'ng'iroq qiling!**
- Kuchli bosh og'rig'i + nutq buzilishi → insult shubhasi → **darhol tez yordam!**
- Nafas qisilishi + ko'kargan lab → o'pka shishi → **darhol tez yordam!**
- Suitsidal fikrlar → ishonch telefoni raqami

---

### MODUL 4: Tashxis natijalari (skrinshotdagi UI)

Bemor ko'rsatadigan natija sahifasi quyidagilardan iborat bo'lishi kerak (sizning skrinshot asosida kengaytirilgan):

```
┌─────────────────────────────────────────┐
│  Tashxis natijalari                     │
│  Simptomlaringiz asosida quyidagi       │
│  ehtimoliy tashxislar aniqlandi:        │
├─────────────────────────────────────────┤
│  1. MIGREN (Migraine)        85% ishonch│
│     ICD-10: G43.9                       │
│     [████████████████░░░] 85%           │
│                                         │
│     📋 Tavsif:                          │
│     Bosh og'rig'ining bir turi...       │
│                                         │
│     ✓ Asoslantiruvchi simptomlar:       │
│       • Bosh og'rig'i                   │
│       • Ushalish (ko'ngil aynishi)      │
│       • Yorug'likdan qo'rqish           │
│                                         │
│     📄 Tavsiya etilgan tahlillar:       │
│       • Umumiy qon tahlili              │
│       • Qon bosimi monitoringi          │
│       • Bosh MRT (agar qaytalansa)      │
│                                         │
│     👨‍⚕️ Yo'naltirish: Nevropatolog       │
│     [Navbat olish]  [Batafsil]          │
├─────────────────────────────────────────┤
│  2. TARANG TIPDAGI BOSH OG'RIG'I  10%  │
│  3. KLASTER BOSH OG'RIG'I          5%  │
└─────────────────────────────────────────┘
⚠️ DIQQAT: Bu yakuniy tashxis emas!
```

**Har bir tashxis kartasi tarkibi:**
- Kasallik nomi (mahalliy + lotincha + ICD-10 kodi)
- Ishonch foizi (progress bar bilan)
- Qisqa tavsif
- Bemorda mavjud bo'lgan mos simptomlar ro'yxati
- Mavjud bo'lmagan, lekin tekshirish kerak bo'lgan simptomlar
- Tavsiya etilgan tahlillar (qon, siydik, instrumental)
- Tavsiya etilgan mutaxassis
- "Navbat olish" tugmasi → MODUL 5 ga o'tish
- "Batafsil ma'lumot" — kasallik haqida o'qish

---

### MODUL 5: Mutaxassis va klinika tavsiyasi

#### 5.1. Yaqin klinikalarni topish
- Geolokatsiya orqali (foydalanuvchi ruxsati bilan)
- Manzil bo'yicha qidiruv
- Filtrlar: narx, reyting, masofa, sug'urta qabul qiladimi
- Xarita ko'rinishi

#### 5.2. Shifokor profili
- Tajriba, mutaxassislik, sertifikatlar
- Bemorlar sharhlari va reytingi
- Narx
- Bo'sh vaqtlar (kalendar)

#### 5.3. Onlayn navbat olish
- Vaqt tanlash
- To'lov (Click, Payme, Uzum, Visa)
- SMS/Push tasdiqlash
- Eslatmalar (1 kun oldin, 1 soat oldin)

#### 5.4. Telemeditsina (kelajakda)
- Video konsultatsiya
- Chat shifokor bilan

---

### MODUL 6: Tahlillar va tekshiruvlar boshqaruvi

#### 6.1. Tahlil topshirish uchun yo'naltirish
- Yaqin laboratoriyalar ro'yxati
- Narx solishtirish
- Onlayn buyurtma berish

#### 6.2. Natijalarni saqlash
- Laboratoriyadan to'g'ridan-to'g'ri integratsiya (API)
- Yoki bemor o'zi PDF/rasm yuklaydi
- AI natijalarni o'qiydi (OCR + tushunish)
- Norma chegaralaridan chetga chiqishlarni belgilaydi

#### 6.3. Dinamikada kuzatish
- Grafiklar (masalan, qandlik darajasi vaqt bo'yicha)
- Trendlar va ogohlantirishlar

---

### MODUL 7: Bilimlar bazasi va kontent

- Kasalliklar ensiklopediyasi
- Dorilar ma'lumotnomasi (qo'llanma, yon ta'sirlar)
- Birinchi yordam ko'rsatmalari
- Sog'lom turmush tarzi maqolalari

---

### MODUL 8: Xavfsizlik va maxfiylik

- **Shifrlash:** TLS 1.3 (transit), AES-256 (rest)
- **HIPAA / GDPR / O'zbekiston "Shaxsiy ma'lumotlar to'g'risida" qonuniga muvofiqlik**
- Audit log — kim, qachon, qaysi ma'lumotni ko'rdi
- Bemor o'z ma'lumotlarini eksport qilishi va o'chirishi mumkin (Right to be forgotten)
- Anonimlashtirish — statistika uchun

---

### MODUL 9: Admin panel

- Foydalanuvchilar boshqaruvi
- Klinikalar va shifokorlarni tasdiqlash
- AI qoidalarini sozlash
- Statistika va hisobotlar
- Kontent boshqaruvi

---

## 4. TEXNOLOGIK STEK (TAVSIYA)

| Qatlam | Texnologiya |
|---|---|
| Frontend | Next.js 14 (allaqachon bor), TailwindCSS, shadcn/ui |
| Backend | Node.js (NestJS) yoki Python (FastAPI) |
| Ma'lumotlar bazasi | PostgreSQL (asosiy) + Redis (kesh) |
| AI/LLM | Claude API / GPT-4 + RAG (Pinecone/Weaviate) |
| Fayllar | AWS S3 yoki MinIO |
| Autentifikatsiya | Auth0 / Supabase Auth |
| Hosting | AWS / GCP (HIPAA-compliant zona) |
| Monitoring | Sentry, Grafana, Prometheus |
| CI/CD | GitHub Actions |

---

## 5. BOSQICHMA-BOSQICH RIVOJLANTIRISH (Roadmap)

**1-bosqich (1-3 oy) — MVP:**
- Ro'yxatdan o'tish, profil
- Oddiy simptom kiritish
- 20 ta eng keng tarqalgan kasallik uchun AI tahlil
- Mutaxassis tavsiyasi (statik ro'yxat)

**2-bosqich (4-6 oy):**
- To'liq EMR
- Adaptiv savollar
- 200+ kasallik
- Klinikalar bilan integratsiya

**3-bosqich (7-12 oy):**
- Tahlil natijalarini AI tahlili
- Telemeditsina
- Mobil ilova (iOS/Android)
- Sug'urta kompaniyalari bilan integratsiya

---

## 6. MUVAFFAQIYAT METRIKASI (KPI)

- Tashxis aniqligi (haqiqiy shifokor tashxisi bilan solishtirish) — **>80%**
- Foydalanuvchi qoniqishi (NPS) — **>60**
- Oylik faol foydalanuvchilar (MAU) — maqsad
- Bemordan-shifokorga konversiya — **>30%**
- Red flag holatlarni aniqlash aniqligi — **>95%**

---

## 7. RISKLAR VA ULARNI KAMAYTIRISH

| Risk | Kamaytirish |
|---|---|
| Noto'g'ri tashxis → bemor zarari | Disclaimer, har doim shifokor tasdig'i, red flag tizimi |
| Ma'lumotlar sizib chiqishi | Shifrlash, audit, penetration testing |
| Huquqiy javobgarlik | Yurist, foydalanuvchi shartnomasi, sug'urta |
| AI "gallyutsinatsiyasi" | RAG, faqat tasdiqlangan manbalar, ekspert nazorati |

---

**Hujjat oxiri.** Har bir modul bo'yicha alohida batafsil spetsifikatsiya keyingi bosqichda yoziladi.
