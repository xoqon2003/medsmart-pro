# MedSmart Pro — SRS (KENGAYTIRILGAN)

**Hujjat ID:** DOC-09-SRS-EXT | **Versiya:** 2.0 | **Sana:** 11.04.2026  
**Standart:** IEEE 830-1998

---

## 1. KIRISH

### 1.1. Maqsad
Ushbu kengaytirilgan SRS MedSmart Pro tizimining barcha funksional va nofunksional talablarini batafsil bayon etadi. Hujjatga muvofiq dasturchilar to'g'ridan-to'g'ri implementatsiyaga o'tishi mumkin.

### 1.2. Auditoriya
- Backend va frontend dasturchilar
- QA muhandislar
- DevOps
- Tibbiy ekspertlar (klinik logikani tekshirish uchun)
- Loyiha menejerlari

### 1.3. Konventsiyalar
- **FR-X.Y** — Funksional talab (X = modul, Y = tartib raqami)
- **NFR-N** — Nofunksional talab
- **MUST/SHALL** — majburiy
- **SHOULD** — kuchli tavsiya
- **MAY** — ixtiyoriy

---

## 2. MODUL 1: FOYDALANUVCHI BOSHQARUVI (12 ta FR)

### FR-1.1: Telefon orqali ro'yxatdan o'tish
**Tavsifi:** Tizim foydalanuvchini telefon raqami va SMS OTP orqali ro'yxatdan o'tkazishi SHALL.

**Kirish:**
- `phone_number` (string, format: +998XXXXXXXXX)
- `language_preference` (enum: uz/ru/en)

**Qayta ishlash:**
1. Format validatsiyasi (regex: `^\+998\d{9}$`)
2. Mavjud akkauntni tekshirish
3. 6-xonali OTP generatsiya
4. SMS yuborish (Eskiz.uz)
5. OTP'ni Redis'da saqlash (TTL: 5 daqiqa)

**Chiqish:**
```json
{
  "status": "otp_sent",
  "session_id": "uuid",
  "expires_in": 300
}
```

**Xato holatlari:**
- `400 INVALID_PHONE_FORMAT` — noto'g'ri format
- `409 PHONE_ALREADY_REGISTERED` — telefon mavjud
- `429 TOO_MANY_REQUESTS` — 1 soatda 5 dan ortiq urinish
- `503 SMS_SERVICE_UNAVAILABLE` — SMS provayder ishlamayapti

**Validatsiya qoidalari:**
- Bir telefonga 1 soatda max 5 ta OTP
- Bir IP'dan kuniga max 50 ta urinish
- OTP 5 daqiqada eskiradi

---

### FR-1.2: OTP tasdiqlash
**Kirish:** `session_id`, `otp_code`  
**Chiqish:** JWT access token + refresh token  
**Xatolar:** `INVALID_OTP`, `OTP_EXPIRED`, `MAX_ATTEMPTS_EXCEEDED` (3 marta noto'g'ri → bloklangan)

### FR-1.3: Google Sign-in (OAuth 2.0)
### FR-1.4: Apple Sign-in
### FR-1.5: Login (mavjud akkaunt)
### FR-1.6: Logout (token'ni revoke qilish)
### FR-1.7: Refresh token
### FR-1.8: Parolni tiklash (telefon orqali)
### FR-1.9: 2FA yoqish/o'chirish (TOTP)
### FR-1.10: Profil yaratish va tahrirlash
### FR-1.11: Oila a'zolari profilini boshqarish (max 5)
### FR-1.12: Akkauntni o'chirish (Right to be forgotten — 30 kun grace period)

---

## 3. MODUL 2: ELEKTRON TIBBIY KARTA — EMR (15 ta FR)

### FR-2.1: Demografik ma'lumotlarni saqlash
**Kirish:**
```json
{
  "first_name": "string",
  "last_name": "string",
  "birth_date": "YYYY-MM-DD",
  "gender": "M|F",
  "blood_type": "A+|A-|B+|B-|AB+|AB-|O+|O-",
  "height_cm": 170,
  "weight_kg": 65.5
}
```

**Validatsiya:**
- Tug'ilgan sana — 1900 va bugun oralig'ida
- Yosh = bugun − birth_date (BMI = weight / (height/100)²)
- BMI avtomatik hisoblash (norma: 18.5-24.9)

**Saqlash:** PostgreSQL `patients` jadvali, encrypted at-rest

### FR-2.2: Surunkali kasalliklarni qo'shish
- ICD-10 koddan tanlash
- Boshlangan sana
- Hozirgi holat (faol/remissiyada/davolangan)

### FR-2.3: Allergiyalarni boshqarish
**Bu eng kritik FR — har bir AI tahlilda allergiyalar tekshiriladi.**
- Modda nomi (KB dan tanlash yoki erkin)
- Reaksiya turi (toshma, anafilaksiya, va h.k.)
- Og'irlik (yengil/o'rta/og'ir/hayotga xavfli)
- Aniqlangan sana

### FR-2.4: Hozirgi dorilar ro'yxati
- Dori nomi (KB dan)
- Dozasi, qabul chastotasi
- Boshlangan sana
- O'zaro ta'sirni tekshirish (drug interaction checker)

### FR-2.5: Oilaviy anamnez
- Qarindosh (ota/ona/aka/opa/bobo/buvi)
- Kasalligi (ICD-10)
- Yoshi (vafot etgan bo'lsa — vafot yoshi)

### FR-2.6: Operatsiyalar tarixi
### FR-2.7: Jarohatlar
### FR-2.8: Emlash kalendari
### FR-2.9: Yomon odatlar (chekish, alkogol)
### FR-2.10: Hayot tarzi (ovqatlanish, sport)
### FR-2.11: Ginekologik anamnez (ayollar uchun) — hayz tsikli, homiladorliklar
### FR-2.12: Tahlil natijalarini yuklash (PDF, JPG, PNG, max 10MB)
- OCR orqali matnni o'qish
- Strukturali ma'lumotga aylantirish
- Norma chegaralaridan chetga chiqishlarni belgilash

### FR-2.13: Tahlillar dinamikasi (grafiklar)
### FR-2.14: Murojaatlar tarixi (xronologik)
### FR-2.15: EMR ni eksport qilish (PDF, JSON)

---

## 4. MODUL 3: SIMPTOM TAHLILI VA AI (20 ta FR — eng katta modul)

### FR-3.1: Yangi murojaat boshlash
**Kirish:** `patient_id`, `input_method` (text/voice/body_map)  
**Chiqish:** `consultation_id` va birinchi savol

### FR-3.2: Matnli simptom kiritish
**Validatsiya:** min 3 ta belgi, max 1000 ta belgi, profanity filter

### FR-3.3: Ovozli simptom kiritish
**Texnik:**
- Whisper API orqali transcription
- Qo'llab-quvvatlanadigan tillar: uz, ru, en
- Max audio uzunligi: 60 sekund
- Format: webm, mp3, wav

### FR-3.4: Tana xaritasi orqali kiritish
- Interaktiv 3D model (yoki 2D)
- Klik orqali joy tanlash
- Joy → tegishli simptomlar ro'yxati

### FR-3.5: Adaptiv savol-javob
**Logikasi:**
1. Birinchi simptomdan keyin AI decision tree'dan keyingi savolni tanlaydi
2. Har savol javobi keyingi savolni o'zgartiradi
3. Min 3, max 15 savol
4. Bemor "tugatish" tugmasini istalgan vaqt bosishi mumkin

### FR-3.6: EMR konteksti AI ga uzatish
**Avtomatik qo'shiladi:**
- Yosh, jins
- Surunkali kasalliklar
- Allergiyalar (kritik)
- Hozirgi dorilar
- Oilaviy anamnez (tegishli kasalliklar)

### FR-3.7: AI tahlil chaqiruvi (Claude/GPT-4)
**Prompt strukturasi:**
```
[System] Sen tibbiy yordamchisan. Yakuniy tashxis BERMAYSAN...
[Context] Bemor: 35 yosh, ayol, gipertoniya, ibuprofen allergiyasi
[KB Context] Migren haqida ma'lumot... (RAG dan)
[User] Bemor shikoyatlari: ...
[Format] JSON: [{disease, icd10, probability, ...}]
```

**Timeout:** 10 sekund  
**Fallback:** Agar Claude ishlamasa → GPT-4

### FR-3.8: Javobni parse qilish va validatsiya
- Strukturali JSON tekshirish
- Har tashxis KB da mavjudligini tekshirish
- ICD-10 kod to'g'riligini tekshirish

### FR-3.9: Ehtimollikni kontekstga moslashtirish
- Yosh ko'paytirgichi
- Jins ko'paytirgichi
- Irsiyat ko'paytirgichi
- Surunkali kasalliklar ta'siri

### FR-3.10: Red Flag tekshiruvi
**Algoritm:**
```
for each red_flag in KB:
  if red_flag.conditions all match symptoms+EMR:
    return EMERGENCY(red_flag)
```
**Agar red flag bor — boshqa hech narsa ko'rsatilmaydi.**

### FR-3.11: Eng yuqori 3-5 ta tashxisni tartiblash
### FR-3.12: Har tashxis uchun batafsil ma'lumot olish (KB dan)
### FR-3.13: Mutaxassis tavsiyasi
### FR-3.14: Tahlillar tavsiyasi
### FR-3.15: Allergiya tekshiruvi (har tavsiyada)
### FR-3.16: Disclaimer chiqarish (har sahifada)
### FR-3.17: Murojaatni saqlash (consultation history)
### FR-3.18: Foydalanuvchi feedback (to'g'ri/noto'g'ri)
### FR-3.19: Shifokor tomonidan tasdiqlash (production tahlili uchun)
### FR-3.20: Murojaatni eksport qilish (PDF — shifokorga olib borish uchun)

---

## 5. MODUL 4: KLINIKA VA NAVBAT (10 ta FR)

### FR-4.1: Yaqin klinikalarni topish
**Kirish:** GPS koordinatalar, mutaxassislik, radius (km)  
**Qayta ishlash:** PostGIS yoki Google Maps API orqali masofa hisoblash  
**Chiqish:** Klinika ro'yxati (sortlanган: masofa/reyting/narx)

### FR-4.2: Klinika filtrlari (narx, reyting, ish vaqti, sug'urta)
### FR-4.3: Klinika va shifokor profili
### FR-4.4: Shifokor reyting va sharhlari
### FR-4.5: Shifokor bo'sh vaqtlarini ko'rish (kalendar)
### FR-4.6: Navbat olish
### FR-4.7: Navbatni bekor qilish (24 soat oldin — bepul)
### FR-4.8: To'lov amalga oshirish (Click/Payme/Uzum)
### FR-4.9: Navbat eslatmalari (24 soat va 1 soat oldin — SMS+Push)
### FR-4.10: Konsultatsiyadan keyin sharh qoldirish

---

## 6. MODUL 5-9 (qisqa)

### Modul 5: Tahlillar boshqaruvi (8 ta FR)
- Laboratoriya buyurtma, natija olish, dinamika

### Modul 6: Bilimlar bazasi (5 ta FR)
- Kasalliklar, dorilar, birinchi yordam maqolalari

### Modul 7: Admin panel (15 ta FR)
- Foydalanuvchilar, klinikalar, KB, AI sozlamalari, hisobotlar

### Modul 8: Hisobot va analitika (10 ta FR)
- Bizn dashboards, klinik metrikalar, AI sifati

### Modul 9: Notifikatsiyalar (6 ta FR)
- Push, SMS, Email, in-app

---

## 7. NOFUNKSIONAL TALABLAR (batafsil)

### Performance
- **NFR-1:** API javob vaqti p95 < 2s, p99 < 5s
- **NFR-2:** AI javob vaqti < 8s (90% holatlarda)
- **NFR-3:** Sahifa yuklash < 3s (3G da)
- **NFR-4:** Vector qidiruv < 500ms

### Scalability
- **NFR-5:** 10,000 concurrent users
- **NFR-6:** 1M registered users gacha
- **NFR-7:** Horizontal scaling Kubernetes orqali

### Availability
- **NFR-8:** 99.9% uptime (oyiga max 43 daqiqa downtime)
- **NFR-9:** Multi-AZ deployment
- **NFR-10:** Graceful degradation (AI ishlamasa — manual mode)

### Security
- **NFR-11:** TLS 1.3, AES-256, JWT, MFA
- **NFR-12:** OWASP Top 10 himoya
- **NFR-13:** Penetration test yiliga 2 marta
- **NFR-14:** PHI alohida shifrlash key (HSM)
- **NFR-15:** Audit log barcha PHI kirishlar uchun

### Usability
- **NFR-16:** WCAG 2.1 AA
- **NFR-17:** Onboarding < 3 daqiqa
- **NFR-18:** SUS score > 80

### Localization
- **NFR-19:** uz, ru, en (to'liq)
- **NFR-20:** Lotin va kiril yozuvlari (uz uchun)
- **NFR-21:** RTL qo'llab-quvvatlash (kelajakda arab uchun)

### Compliance
- **NFR-22:** O'zbekiston "Shaxsiy ma'lumotlar" qonuni
- **NFR-23:** GDPR (Yevropa foydalanuvchilari uchun)
- **NFR-24:** HIPAA (kelajakda AQSh uchun)
- **NFR-25:** SaMD Class IIa

### Reliability
- **NFR-26:** RPO = 1 soat, RTO = 4 soat
- **NFR-27:** Automated backup
- **NFR-28:** Disaster recovery drill yiliga 2 marta

### Maintainability
- **NFR-29:** Kod coverage > 80%
- **NFR-30:** Hujjatlashtirish — har endpoint Swagger'da
- **NFR-31:** Code review majburiy

---

## 8. MA'LUMOTLAR TALABLARI

### 8.1. PHI (Protected Health Information)
- Mahalliy serverlarda
- Shifrlash at-rest va in-transit
- Audit log
- 10 yil saqlash (qonun talabi)

### 8.2. Backup
- Kunlik full backup
- Soatlik incremental
- 3-2-1 qoidasi (3 nusxa, 2 turli media, 1 offsite)
- Yiliga 2 marta restore drill

### 8.3. Anonimlashtirish
- AI o'qitish uchun — to'liq anonim
- Statistika uchun — agregat darajada

---

## 9. INTEGRATSIYA TALABLARI

| Tashqi tizim | Protokol | SLA |
|---|---|---|
| Eskiz.uz (SMS) | REST | 99% |
| Click/Payme/Uzum | REST + webhook | 99.5% |
| Google Maps | REST | 99.9% |
| Whisper API | REST | 99% |
| Claude API | REST | 99.9% |
| Firebase (push) | SDK | 99.9% |
| Laboratoriyalar | REST/HL7 FHIR | shartnoma asosida |

---

## 10. AKSEPTANS KRITERIYALARI (release uchun)

- ✅ Barcha critical va high prioritet FR'lar implementlangan
- ✅ Barcha NFR'lar qoniqtirilgan
- ✅ Klinik validatsiya: top-3 accuracy ≥80%, red flag sensitivity ≥95%
- ✅ Security audit o'tgan
- ✅ Performance test o'tgan
- ✅ UAT 50+ real foydalanuvchi tomonidan tasdiqlangan
- ✅ Huquqiy hujjatlar tayyor
- ✅ Tibbiy ekspertlar tasdiqlagan

---

## 11. ILOVALAR

- A: Glossariy (50+ atama)
- B: Use Case ro'yxati (DOC-10)
- C: API spetsifikatsiyasi (DOC-25)
- D: ER diagramma (DOC-24)
- E: Wireframe'lar (DOC-30)

**Hujjat oxiri.**
