# MedSmart Pro — Tibbiy Hujjatlar (17-21)

**Versiya:** 1.0 | **Sana:** 11.04.2026

---

# 17. CLINICAL DECISION RULES (Diagnostic Logic)

## 1. UMUMIY YONDASHUV
Tizim 3 qatlamli mantiqdan foydalanadi:
1. **Rule-based** — aniq qoidalar (red flag)
2. **Bayesian** — ehtimollik hisoblash
3. **LLM + RAG** — kontekstli tahlil

## 2. BAYES FORMULASI
P(Kasallik|Simptom) = P(Simptom|Kasallik) × P(Kasallik) / P(Simptom)

## 3. DECISION TREE — Bosh og'rig'i
```
Bosh og'rig'i bor
├── O'tkir (<1 soat) + jarohat → Travmatik (XIRURG/RED FLAG)
├── O'tkir + bo'yin qattiqligi + isitma → Meningit (RED FLAG)
├── O'tkir + nutq buzilishi → Insult (RED FLAG)
├── Surunkali (>3 oy)
│   ├── Bir tomonlama + pulsatsiya + ko'ngil → Migren (85%)
│   ├── Ikki tomonlama + bosuvchi → Tarang tipdagi (75%)
│   └── Ko'z atrofida + qisqa → Klaster (60%)
└── Yangi (50+ yosh) → Tekshiruv kerak
```

## 4. KONTEKST OMILLARI (qoida og'irligi)
- **Yosh:** har kasallik uchun yosh diapazoni
- **Jins:** ayollar/erkaklar uchun farq (masalan migren ayollarda 3x ko'p)
- **Irsiyat:** oilada bor bo'lsa ehtimol +20%
- **Surunkali kasalliklar:** masalan diabet bor → diabetik asoratlar ehtimoli oshadi
- **Dorilar:** ba'zi dorilar simptomlarni keltirib chiqaradi
- **Allergiya:** dori tavsiyasidan istisno qilish
- **Hayot tarzi:** chekuvchilarda o'pka kasalliklari ehtimoli yuqori

## 5. SKORING TIZIMLARI
- **HEART score** — ko'krak og'rig'i (yurak)
- **Wells score** — TELA va DVT
- **CURB-65** — pnevmoniya og'irligi
- **GCS** — ong darajasi
- **Apgar** — yangi tug'ilgan chaqaloqlar

---

# 18. RED FLAG PROTOCOL

## 1. PRINTSIP
Red flag — hayotga xavfli holat belgisi. Tizim aniqlanganda DARHOL:
1. Boshqa tashxislarni ko'rsatishni to'xtatadi
2. Katta qizil ogohlantirish chiqaradi
3. **103** raqamini ko'rsatadi
4. Yaqin shifoxonalarni ko'rsatadi
5. SMS orqali yaqinlariga xabar (agar sozlangan bo'lsa)

## 2. RED FLAG RO'YXATI (50+)

### Yurak-qon tomir
- Ko'krak qafasi siquvchi og'rig'i + chap qo'lga berilish → **INFARKT**
- Hansirash + ko'kargan lab → **O'pka shishi**
- Aritmiya + hushidan ketish

### Nevrologik
- Birdan paydo bo'lgan kuchli bosh og'rig'i ("hayotidagi eng kuchli") → **Subaraxnoidal qon quyilish**
- Yuz egilishi + nutq buzilishi + qo'l zaifligi → **INSULT (FAST testi)**
- Tirishish (epileptik holatdan boshqa)
- Ong yo'qotish

### Nafas
- Kuchli hansirash, gapira olmaslik
- Ko'krak qafasidagi o'tkir og'riq + qon tupurish → **TELA**
- Anafilaksiya (qichima, shish, hansirash)

### Oshqozon-ichak
- Qattiq qorin + isitma → **Peritonit**
- Qon qusish, qora najas → **Ichki qon ketish**
- O'tkir qorin og'rig'i (appenditsit, panoreatit)

### Pediatrik
- Bola apatik, javob bermaydi
- 3 oygacha bola + 38°C+
- Petexial toshma + isitma → **Meningokokk**
- Suvsizlanish belgilari

### Ruhiy salomatlik
- Suitsidal fikrlar yoki reja → **Ishonch telefoni: 1051**
- O'z-o'ziga zarar yetkazish niyati

### Homiladorlik
- Qon ketishi
- Kuchli bosh og'rig'i + ko'rish buzilishi → **Eklampsiya**
- Bola harakatining to'xtashi

## 3. AMAL ALGORITMI
```
Red flag aniqlandi
├── Hayotga xavf darajasi
│   ├── Kritik (insult, infarkt) → "DARHOL 103!"
│   ├── Yuqori (qattiq og'riq) → "Tez yordam yoki shifoxonaga"
│   └── O'rta → "Bugun shifokorga uchrang"
└── Yaqin shifoxonalar xaritasi
```

---

# 19. ADAPTIVE QUESTIONNAIRE LIBRARY

## TUZILISHI
Har bir asosiy simptom uchun savollar to'plami (5-15 ta), decision tree shaklida.

## MISOL: Bosh og'rig'i savollari
1. **Qancha vaqtdan beri?** [<1 soat / 1-24 soat / 1-7 kun / >1 oy]
2. **Qaysi joyida?** [Peshona / Chakka / Ensa / Butun bosh / Bir tomonda]
3. **Xarakteri?** [Pulsatsiyali / Bosuvchi / O'tkir-sanchuvchi / Zerikarli]
4. **Og'riq darajasi?** [Slayder 1-10]
5. **Qachon kuchayadi?** [Harakatda / Yorug'likda / Stressda]
6. **Hamroh simptomlar?** [Ko'ngil aynishi / Qusish / Aylanish / Ko'rish buzilishi]
7. **Avval shunday bo'lganmi?** [Birinchi marta / Vaqti-vaqti bilan / Doimiy]
8. **Qon bosimingiz?** [O'lchaganmisiz?]
9. **Yaqinda jarohat?** [Ha / Yo'q]
10. **Isitma bormi?**

## DECISION TREE LOGIKASI
- Agar 9 = Ha → XIRURG yo'nalishi, KT bosh
- Agar 10 = Ha + bo'yin qattiqligi → MENINGIT shubhasi (RED FLAG)
- Agar 1 = >1 oy + 3 = Pulsatsiyali + 6 = Ko'ngil → MIGREN (yuqori ehtimol)

## SKORING
Har bir javob ma'lum tashxis ehtimolini oshiradi yoki kamaytiradi.

---

# 20. MEDICAL DISCLAIMERS & PATIENT SAFETY

## 1. ASOSIY DISCLAIMER (har sahifada)
> ⚠️ **DIQQAT:** MedSmart Pro yakuniy tibbiy tashxis emas. Bu tavsiyalar faqat ma'lumot uchun. Aniq tashxis va davolanish uchun shifokorga murojaat qiling.

## 2. RO'YXATDAN O'TISHDA
> Foydalanish shartnomasini qabul qilib, men quyidagilarni tushunaman:
> - Bu tizim shifokor o'rnini bosmaydi
> - AI xato qilishi mumkin
> - Shoshilinch holatlarda 103 ga qo'ng'iroq qilaman
> - Ma'lumotlarim shifrlangan holda saqlanadi

## 3. NATIJA SAHIFASIDA
> Bu natijalar AI tomonidan ishlab chiqilgan va 100% aniq emas. Iltimos, taklif etilgan mutaxassisga murojaat qiling.

## 4. RED FLAG SAHIFASIDA
> 🚨 **SHOSHILINCH!** Sizning belgilaringiz hayotga xavfli holatga o'xshaydi. DARHOL **103** ga qo'ng'iroq qiling yoki yaqin shifoxonaga boring.

## 5. TIBBIY HUQUQIY ISTISNO
- Tizim faqat ma'lumot beradi
- Foydalanuvchi o'z qarorlari uchun javobgar
- Kompaniya tibbiy javobgarlikni o'z zimmasiga olmaydi
- SaMD Class I sifatida ro'yxatga olingan

## 6. BEMOR XAVFSIZLIGI SIYOSATI
- Har shubhada — yuqori darajadagi yo'nalish (overcaution)
- Hech qachon "uyda davolaning" demaslik
- Doimo "shifokorga murojaat qiling"
- Suitsidal belgilarda — darhol 1051 ishonch telefoni

---

# 21. REGULATORY COMPLIANCE (Tibbiy)

## 1. O'ZBEKISTON QONUNCHILIGI
- "Fuqarolar sog'lig'ini saqlash to'g'risida"gi qonun
- "Shaxsiy ma'lumotlar to'g'risida"gi qonun (2019)
- Soglomlik vazirligi buyruqlari
- Telemeditsina to'g'risidagi nizomlar

## 2. SaMD KLASSIFIKATSIYASI
**MedSmart Pro = Class IIa** (Yevropa MDR bo'yicha):
- Tashxis taklifi beradi, lekin yakuniy emas
- Hayotga xavfli holatlarni aniqlaydi
- Klinik qaror qabul qilishga ta'sir qiladi

## 3. XALQARO STANDARTLAR
- **ISO 13485** — tibbiy qurilmalar sifat boshqaruvi
- **ISO 14971** — tibbiy qurilmalar risk boshqaruvi
- **IEC 62304** — tibbiy dasturiy ta'minot hayot tsikli
- **HIPAA** (AQSh bozoriga chiqishda)
- **GDPR** (Yevropa)
- **FDA** (kelajakda)

## 4. LITSENZIYALAR RO'YXATI
- Tibbiyot faoliyati litsenziyasi (Soglomlik vazirligi)
- Shaxsiy ma'lumotlarni qayta ishlash uchun roziligi
- Telemeditsina ruxsatnomasi (V2)

## 5. SERTIFIKATLASH JADVALI
- 1-yil: Mahalliy sertifikatlar
- 2-yil: ISO 13485
- 3-yil: CE Mark
- 5-yil: FDA

**Hujjat oxiri.**
