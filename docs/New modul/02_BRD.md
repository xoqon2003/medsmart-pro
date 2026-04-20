# MedSmart Pro — Business Requirements Document (BRD)

**Hujjat ID:** DOC-02-BRD | **Versiya:** 1.0 | **Sana:** 11.04.2026  
**Mas'ul:** Biznes-analitik

---

## 1. KIRISH
Ushbu BRD MedSmart Pro loyihasining biznes talablarini aniqlaydi va Vision Document'dagi yuqori darajadagi maqsadlarni amaliy talablarga aylantiradi.

## 2. BIZNES MAQSADLARI
- **BG-1:** Bemorlarga 24/7 birlamchi tibbiy maslahat berish
- **BG-2:** Klinikalar bilan bemorlarni bog'lash (marketplace)
- **BG-3:** Bemor tibbiy tarixini markazlashtirish
- **BG-4:** Shoshilinch holatlarda hayotlarni saqlab qolish
- **BG-5:** Barqaror daromad modeli yaratish

## 3. STAKEHOLDER'LAR
| Stakeholder | Manfaati |
|---|---|
| Bemorlar | Tezkor, sifatli maslahat |
| Shifokorlar | Yangi bemorlar, oldingi anamnez |
| Klinikalar | Bemorlar oqimi, brending |
| Investorlar | ROI, o'sish |
| Davlat (Soglom) | Aholi salomatligi |
| Sug'urta | Risk baholash |

## 4. AS-IS HOLATI
Hozirda bemor: simptom paydo bo'ladi → Google'da qidiradi → noaniq ma'lumot → tanish so'raydi → klinikaga boradi → terapevt → mutaxassis → tahlillar → qaytadan kelish. **5-10 kun, 500,000-2,000,000 so'm.**

## 5. TO-BE HOLATI
Bemor: simptom → MedSmart Pro → 5 daqiqada birlamchi tashxis va yo'nalish → to'g'ridan-to'g'ri kerakli mutaxassisga navbat → tahlillar bilan boradi. **1-2 kun, 200,000-500,000 so'm.**

## 6. BIZNES JARAYONLAR
1. **Bemor onboarding** — ro'yxatdan o'tish, EMR to'ldirish
2. **Simptom tahlili** — kiritish, AI tahlil, natija
3. **Yo'naltirish** — mutaxassis tanlash, navbat olish, to'lov
4. **Davolanish kuzatuvi** — natijalarni saqlash, qayta murojaat
5. **Klinika onboarding** — ro'yxatdan o'tish, shifokorlar qo'shish
6. **To'lovlar va hisob-kitoblar**

## 7. FUNKSIONAL TALABLAR (yuqori daraja)
- **FR-1:** Tizim bemorni telefon raqam orqali ro'yxatdan o'tkazishi kerak
- **FR-2:** Tizim bemorning to'liq EMR'ini saqlashi kerak
- **FR-3:** Tizim simptomlarni 3 usulda qabul qilishi kerak (matn, ovoz, tana xaritasi)
- **FR-4:** Tizim adaptiv savollar bersihi kerak
- **FR-5:** Tizim ehtimollik bilan kamida 3 ta tashxis taklifi berishi kerak
- **FR-6:** Tizim mutaxassis va tahlillarni tavsiya qilishi kerak
- **FR-7:** Tizim red flag holatlarni darhol aniqlashi kerak
- **FR-8:** Tizim yaqin klinikalarni ko'rsatishi kerak
- **FR-9:** Tizim onlayn navbat va to'lovni qo'llab-quvvatlashi kerak
- **FR-10:** Tizim 3 tilda ishlashi kerak (uz/ru/en)

## 8. NOFUNKSIONAL TALABLAR
- **NFR-1 (Performance):** Javob vaqti < 3 sekund
- **NFR-2 (Availability):** 99.9% uptime
- **NFR-3 (Security):** HIPAA, GDPR, mahalliy qonunlarga muvofiq
- **NFR-4 (Scalability):** 1M foydalanuvchigacha kengayish imkoniyati
- **NFR-5 (Usability):** WCAG 2.1 AA, keksalar uchun qulay
- **NFR-6 (Reliability):** Ma'lumotlar yo'qotilmasligi (RPO=0)

## 9. BIZNES QOIDALARI
- **BR-1:** Tizim hech qachon yakuniy tashxis qo'ymaydi
- **BR-2:** Har bir natijada disclaimer ko'rsatiladi
- **BR-3:** 18 yoshgacha bo'lganlar uchun ota-ona roziligi kerak
- **BR-4:** Bemor o'z ma'lumotlarini istalgan vaqt o'chira oladi
- **BR-5:** Red flag aniqlanganda darhol 103 raqami chiqariladi

## 10. CHEKLOVLAR
- **C-1 (Huquqiy):** O'zbekiston "Shaxsiy ma'lumotlar to'g'risida" qonuni
- **C-2 (Texnik):** Bemor ma'lumotlari mahalliy serverlarda
- **C-3 (Moliyaviy):** Birinchi yil byudjet — $300,000
- **C-4 (Vaqt):** MVP 3 oy ichida

## 11. ROI HISOB-KITOBI (qisqacha)
- **Xarajatlar (1-yil):** $300K (jamoa, infratuzilma, marketing)
- **Daromad (1-yil):** $400K (klinika komissiyasi 20%, premium obuna)
- **Break-even:** 10-oy

## 12. ASOSIY RISKLAR
1. Klinik xato → bemor zarari (yuqori ta'sir, past ehtimol)
2. Ma'lumotlar sizishi (yuqori ta'sir, o'rta ehtimol)
3. Foydalanuvchi qabul qilmaslik (o'rta ta'sir, o'rta ehtimol)
4. Huquqiy muammolar (yuqori ta'sir, past ehtimol)

## 13. TASDIQLASH
- Mahsulot egasi: _______ Sana: _______
- Bosh shifokor: _______ Sana: _______
- Investor: _______ Sana: _______

**Hujjat oxiri.**
