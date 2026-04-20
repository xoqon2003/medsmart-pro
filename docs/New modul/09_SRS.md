# MedSmart Pro — Software Requirements Specification (SRS)

**Hujjat ID:** DOC-09-SRS | **Versiya:** 1.0 | **Sana:** 11.04.2026  
**Mas'ul:** Tizim analitigi | **Standart:** IEEE 830

---

## 1. KIRISH

### 1.1. Maqsad
Ushbu SRS MedSmart Pro tizimining barcha funksional va nofunksional talablarini batafsil bayon etadi. Hujjat dasturchilar, QA, dizaynerlar va stakeholder'lar uchun mo'ljallangan.

### 1.2. Miqyos
Tizim quyidagilarni qamrab oladi: bemor profili, simptom tahlili, AI tashxis, klinika navbatlari, EMR, admin panel.  
**Qamrab olmaydi:** dori sotish, jarrohlik rejalashtirish, sug'urta to'lovlari (1-versiyada).

### 1.3. Ta'riflar va qisqartmalar
- **EMR** — Electronic Medical Record
- **AI** — Artificial Intelligence
- **ICD-10** — International Classification of Diseases
- **RAG** — Retrieval Augmented Generation
- **PHI** — Protected Health Information
- **SaMD** — Software as a Medical Device

### 1.4. Havolalar
- Vision Document (DOC-01)
- BRD (DOC-02)
- Clinical Knowledge Base Spec (DOC-15)

---

## 2. UMUMIY TAVSIF

### 2.1. Mahsulot istiqboli
MedSmart Pro mustaqil mahsulot bo'lib, tashqi tizimlar bilan integratsiyalashadi: laboratoriyalar API, klinika boshqaruv tizimlari, to'lov gateway'lar, SMS provayderlar.

### 2.2. Mahsulot funksiyalari
- F1: Foydalanuvchi boshqaruvi
- F2: EMR boshqaruvi
- F3: Simptom tahlili va AI tashxis
- F4: Mutaxassis va klinika tavsiyasi
- F5: Navbat olish va to'lov
- F6: Tahlillar boshqaruvi
- F7: Bilimlar bazasi
- F8: Admin panel
- F9: Hisobot va analitika

### 2.3. Foydalanuvchi sinflari
- Bemor (asosiy)
- Shifokor
- Klinika administratori
- Tizim administratori
- Tibbiy ekspert

### 2.4. Ish muhiti
- **Web:** Chrome, Safari, Firefox, Edge (oxirgi 2 versiya)
- **Mobile:** iOS 14+, Android 8+
- **Server:** Linux, Docker, Kubernetes

### 2.5. Cheklovlar
- Mahalliy serverlarda saqlash (O'zbekiston)
- 3 ta til majburiy
- HIPAA/GDPR muvofiqligi

---

## 3. TASHQI INTERFEYSLAR

### 3.1. Foydalanuvchi interfeysi
- Responsive (mobile-first)
- WCAG 2.1 AA accessibility
- Dark/Light mode

### 3.2. Hardware interfeyslari
- Kamera (hujjat skanlash, teri rasmi)
- Mikrofon (ovoz orqali simptom)
- GPS (yaqin klinikalar)

### 3.3. Software interfeyslari
- LLM API (Claude/GPT-4)
- Payme/Click/Uzum API (to'lovlar)
- Eskiz.uz (SMS)
- Google Maps API
- Laboratoriya API'lari (Intermed, Fergana Medical va h.k.)

### 3.4. Aloqa interfeyslari
- HTTPS (TLS 1.3)
- WebSocket (real-time)
- REST API
- Webhook

---

## 4. FUNKSIONAL TALABLAR (batafsil)

### 4.1. Modul 1: Foydalanuvchi boshqaruvi

**FR-1.1.** Tizim foydalanuvchini telefon raqam + SMS OTP orqali ro'yxatdan o'tkazishi kerak.  
**Kirish:** telefon raqami (+998XXXXXXXXX format)  
**Chiqish:** OTP yuboriladi, tasdiqlangach akkaunt yaratiladi  
**Xato holatlari:** noto'g'ri format, OTP eskirgan, 5 marta noto'g'ri kiritilgan

**FR-1.2.** Tizim Google va Apple Sign-in ni qo'llab-quvvatlashi kerak.

**FR-1.3.** Tizim parolni tiklash imkoniyatini berishi kerak (SMS orqali).

**FR-1.4.** Tizim 2FA ni ixtiyoriy qo'llab-quvvatlashi kerak.

**FR-1.5.** Tizim oila a'zolarini bir akkaunt ostida boshqarish imkoniyatini berishi kerak (kamida 5 ta profil).

### 4.2. Modul 2: EMR

**FR-2.1.** Tizim demografik ma'lumotlarni saqlashi kerak (F.I.Sh, sana, jins, qon guruhi, bo'y, vazn).

**FR-2.2.** Tizim oilaviy anamnezni saqlashi kerak (ota-ona, aka-uka kasalliklari).

**FR-2.3.** Tizim allergiyalar ro'yxatini saqlashi va har bir simptom kiritishda tekshirishi kerak.

**FR-2.4.** Tizim hozirgi dorilar ro'yxatini saqlashi va o'zaro ta'sirni tekshirishi kerak.

**FR-2.5.** Tizim tahlil natijalari uchun PDF/rasm yuklashga ruxsat berishi va OCR orqali matnni o'qishi kerak.

**FR-2.6.** Tizim murojaatlar tarixini xronologik tartibda saqlashi kerak.

### 4.3. Modul 3: Simptom tahlili va AI

**FR-3.1.** Tizim simptomlarni 3 usulda qabul qilishi kerak: matn, ovoz (speech-to-text), tana xaritasi.

**FR-3.2.** Tizim adaptiv savollar berishi kerak (decision tree asosida).

**FR-3.3.** Tizim bemorning EMR'ini AI promptga avtomatik qo'shishi kerak.

**FR-3.4.** Tizim kamida 3 ta ehtimoliy tashxisni ehtimollik foizi bilan qaytarishi kerak.

**FR-3.5.** Tizim har bir tashxis uchun ICD-10 kodini ko'rsatishi kerak.

**FR-3.6.** Tizim red flag aniqlanganda darhol shoshilinch xabar chiqarishi va 103 raqamini ko'rsatishi kerak.

**FR-3.7.** Tizim har bir natijada disclaimer ko'rsatishi kerak.

### 4.4. Modul 4: Mutaxassis va klinika tavsiyasi

**FR-4.1.** Tizim har bir tashxis uchun mos mutaxassisni tavsiya qilishi kerak.

**FR-4.2.** Tizim foydalanuvchi joylashuvi asosida yaqin klinikalarni ko'rsatishi kerak.

**FR-4.3.** Tizim klinikalarni filtrlash imkoniyatini berishi kerak: narx, reyting, masofa.

### 4.5. Modul 5: Navbat va to'lov

**FR-5.1.** Tizim shifokorning bo'sh vaqtlarini ko'rsatishi va navbat olish imkoniyatini berishi kerak.

**FR-5.2.** Tizim to'lovni Click, Payme, Uzum orqali qabul qilishi kerak.

**FR-5.3.** Tizim navbat eslatmalarini SMS va push orqali yuborishi kerak.

### 4.6. Modul 6: Tahlillar

**FR-6.1.** Tizim tavsiya etilgan tahlillarni laboratoriyalarda buyurtma qilish imkoniyatini berishi kerak.

**FR-6.2.** Tizim laboratoriya natijalarini API orqali avtomatik olishi kerak.

**FR-6.3.** Tizim norma chegaralaridan chetga chiqishlarni belgilashi kerak.

### 4.7. Modul 7-9: Bilim bazasi, Admin, Analitika
(qisqacha — har bir modul uchun 5-10 ta FR)

---

## 5. NOFUNKSIONAL TALABLAR

| ID | Talab | Mezon |
|---|---|---|
| NFR-1 | Performance | Javob vaqti < 3s (95-percentile) |
| NFR-2 | AI javob vaqti | < 8s |
| NFR-3 | Availability | 99.9% uptime |
| NFR-4 | Concurrent users | 10,000 bir vaqtda |
| NFR-5 | Scalability | 1M foydalanuvchigacha |
| NFR-6 | Security | HIPAA, GDPR, AES-256, TLS 1.3 |
| NFR-7 | Usability | WCAG 2.1 AA |
| NFR-8 | Localization | uz, ru, en |
| NFR-9 | Backup | Kunlik, RPO=1 soat, RTO=4 soat |
| NFR-10 | Audit | Barcha PHI kirishlar log qilinadi |
| NFR-11 | Browser support | Chrome/Safari/Firefox/Edge (oxirgi 2 versiya) |
| NFR-12 | Mobile | iOS 14+, Android 8+ |

---

## 6. MA'LUMOTLAR TALABLARI
- Bemor PHI mahalliy serverlarda
- Shifrlash: at-rest (AES-256), in-transit (TLS 1.3)
- Backup: 3-2-1 qoidasi
- Retention: 10 yil (tibbiy qonun talabi)

## 7. BOSHQA TALABLAR
- **Huquqiy:** O'zbekiston tibbiyot va shaxsiy ma'lumotlar qonunlari
- **Etik:** AI shaffofligi, bemor avtonomiyasi, zarar yetkazmaslik

## 8. ILOVALAR
- A: Glossariy
- B: Use Case ro'yxati (alohida hujjat — DOC-10)
- C: API spetsifikatsiyasi (alohida hujjat — DOC-19)

**Hujjat oxiri.**
