# MedSmart Pro — Tizim Tahlili Hujjatlari (10-15)

**Versiya:** 1.0 | **Sana:** 11.04.2026

---

# 10. USE CASE DOCUMENT

## UC-01: Bemor ro'yxatdan o'tadi
- **Aktyor:** Yangi bemor
- **Old shartlar:** Telefon raqami va internet
- **Asosiy oqim:**
  1. Bemor ilovani ochadi
  2. "Ro'yxatdan o'tish" tugmasini bosadi
  3. Telefon raqamini kiritadi
  4. Tizim SMS OTP yuboradi
  5. Bemor OTP'ni kiritadi
  6. Tizim akkaunt yaratadi
  7. Bemor profil ma'lumotlarini to'ldiradi
- **Muqobil oqim:** OTP eskirgan → qayta yuborish
- **Post shartlar:** Akkaunt yaratildi

## UC-02: Bemor simptom kiritadi
- **Aktyor:** Ro'yxatdan o'tgan bemor
- **Asosiy oqim:**
  1. Bemor "Yangi murojaat" tugmasini bosadi
  2. Tizim kiritish usulini tanlashni so'raydi (matn/ovoz/tana xaritasi)
  3. Bemor simptomlarini kiritadi
  4. Tizim adaptiv savollar beradi
  5. Bemor javob beradi
  6. Tizim AI tahlilni boshlaydi

## UC-03: AI birlamchi tashxis qo'yadi
- **Aktyor:** Tizim (AI)
- **Asosiy oqim:**
  1. Tizim simptomlarni va EMR'ni AI ga jo'natadi
  2. AI ehtimoliy tashxislarni qaytaradi
  3. Tizim red flag tekshiradi
  4. Agar red flag bor → shoshilinch xabar
  5. Aks holda → natijalar sahifasi

## UC-04: Bemor klinikaga navbat oladi
## UC-05: Shifokor bemor kartasini ko'radi
## UC-06: Tahlil natijasi yuklanadi
## UC-07: Admin yangi klinika qo'shadi
## UC-08: Tibbiy ekspert bilim bazasini yangilaydi
## UC-09 ... UC-30 (qolganlari shu format bo'yicha)

---

# 11. USER STORIES

**US-001:** Bemor sifatida, men simptomlarimni ovozim bilan ayta olishni xohlayman, chunki yozish qiyin.  
*Acceptance:* Given mikrofon ruxsati, When men gapiraman, Then matn paydo bo'ladi.

**US-002:** Bemor sifatida, men oilaviy kasalliklarimni saqlay olishni xohlayman, chunki bu tashxisga ta'sir qiladi.

**US-003:** Shifokor sifatida, men bemor kelishidan oldin uning ma'lumotlarini ko'ra olishni xohlayman.

**US-004:** Onaman, bolam uchun alohida profil yaratmoqchiman.

**US-005:** Surunkali kasalim bor, men dorilarimni ro'yxatga kiritmoqchiman.

(Jami ~100 ta story tayyorlanadi, MoSCoW bo'yicha prioritetlanadi)

---

# 12. BPMN JARAYON DIAGRAMMALARI

## Jarayon 1: Birlamchi tashxis
```
[Boshlash] → [Bemor login] → [Yangi murojaat] → [Simptom kiritish]
  → [Adaptiv savollar] → [AI tahlil] → [Red flag?]
     ├─ Ha → [Shoshilinch xabar] → [103 ga yo'naltirish]
     └─ Yo'q → [Natijalar] → [Mutaxassis tavsiya] → [Navbat olish?]
                                                      ├─ Ha → [To'lov] → [Tasdiq]
                                                      └─ Yo'q → [Saqlash]
[Tugash]
```

## Jarayon 2: Ro'yxatdan o'tish
## Jarayon 3: Klinika onboarding
## Jarayon 4: Tahlil topshirish va natija olish
## Jarayon 5: Shifokor konsultatsiyasi

---

# 13. USER JOURNEY MAPS

## Persona: Aziza, 35 yosh, ona, gipertoniyasi bor

| Bosqich | Harakat | Fikr | His | Og'riq nuqtasi | Imkoniyat |
|---|---|---|---|---|---|
| Awareness | Boshi og'riydi | "Yana boshlandi" | Xavotir | Qaysi shifokorga? | AI tavsiya |
| Consideration | Google'ga qidiradi | "Qancha narsa" | Sarosima | Noaniqlik | Aniq javob |
| Onboarding | MedSmart'ni ochadi | "Oddiy ekan" | Yengillik | — | — |
| Usage | Simptom kiritadi | "Tushundi" | Ishonch | — | Ovoz orqali |
| Result | Tashxis va tavsiya | "Nevropatolog" | Aniqlik | — | Darhol navbat |
| Action | Navbat oladi | "Tez bo'ldi" | Mamnunlik | — | — |
| Retention | Qaytalanadi | "Yana ishonaman" | Sodiqlik | — | EMR saqlandi |

---

# 14. FUNCTIONAL DECOMPOSITION

```
MedSmart Pro
├── F1: Foydalanuvchi boshqaruvi
│   ├── F1.1: Ro'yxatdan o'tish
│   │   ├── F1.1.1: Telefon + OTP
│   │   ├── F1.1.2: Google Sign-in
│   │   └── F1.1.3: Apple Sign-in
│   ├── F1.2: Profil
│   ├── F1.3: 2FA
│   └── F1.4: Oila a'zolari
├── F2: EMR
│   ├── F2.1: Demografiya
│   ├── F2.2: Anamnez
│   ├── F2.3: Allergiyalar
│   ├── F2.4: Dorilar
│   └── F2.5: Tahlillar
├── F3: AI tahlil
│   ├── F3.1: Simptom kiritish (matn/ovoz/xarita)
│   ├── F3.2: Adaptiv savollar
│   ├── F3.3: NLP qatlami
│   ├── F3.4: RAG qidiruv
│   ├── F3.5: Tashxis generatsiya
│   └── F3.6: Red flag tekshiruvi
├── F4: Klinika va shifokor
├── F5: Navbat va to'lov
├── F6: Tahlillar boshqaruvi
├── F7: Bilimlar bazasi
├── F8: Admin panel
└── F9: Analitika
```

---

# 15. DATA FLOW DIAGRAMS

## Level 0 (Context)
```
[Bemor] ↔ [MedSmart Pro] ↔ [Klinika]
                ↓↑
           [LLM API]
                ↓↑
           [Laboratoriya]
                ↓↑
           [To'lov gateway]
```

## Level 1 (asosiy jarayonlar)
1. Foydalanuvchi boshqaruvi
2. Simptom qabul qilish
3. AI tahlil
4. Natija va tavsiya
5. Navbat olish
6. Ma'lumotlar saqlash

## Level 2 — har bir jarayon ichida
(har bir jarayon uchun alohida diagramma chiziladi)

**Hujjat oxiri.**
