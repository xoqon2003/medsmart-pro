# MedSmart Pro — Clinical Knowledge Base (KENGAYTIRILGAN)

**Hujjat ID:** DOC-16-CKB-EXT | **Versiya:** 2.0 | **Sana:** 11.04.2026  
**Mas'ul:** Bosh shifokor + Tibbiy ekspertlar konsiliumi

---

## 1. UMUMIY ARXITEKTURA

### 1.1. KB ning roli
Clinical Knowledge Base — bu MedSmart Pro tizimining "tibbiy miyasi". U quyidagilarni ta'minlaydi:
- Strukturali tibbiy ma'lumot (kasalliklar, simptomlar, dorilar)
- AI uchun kontekst (RAG manba)
- Decision rules (qaror qoidalari)
- Validatsiya (AI javoblarini tekshirish)

### 1.2. Texnik tuzilma
- **PostgreSQL** — strukturali ma'lumotlar (kasallik, simptom, dori jadvallari)
- **Pinecone (Vector DB)** — semantik qidiruv uchun embeddings
- **JSON Schema** — har bir kasallik uchun standart format
- **Git versioning** — har bir o'zgarish track qilinadi

### 1.3. Xalqaro standartlar
- ICD-10/11, SNOMED CT, LOINC, RxNorm, MeSH

### 1.4. Manbalar prioriteti
1. WHO va Soglomlik vazirligi protokollari (eng yuqori)
2. UpToDate, BMJ Best Practice
3. Mayo Clinic, Cleveland Clinic
4. Peer-reviewed maqolalar (PubMed, Cochrane)
5. Mahalliy klinik tajriba

---

## 2. KASALLIK MA'LUMOT SXEMASI (to'liq)

```yaml
disease_id: D001
icd10: G43.9
icd11: 8A80
snomed: 37796009
category: "Nevrologik"
subcategory: "Bosh og'rig'i"

names:
  uz: "Migren"
  ru: "Мигрень"
  en: "Migraine"
  lat: "Migraena"

severity: "moderate"  # mild | moderate | severe | life-threatening
chronicity: "chronic"  # acute | subacute | chronic | recurrent
contagious: false

description:
  short: "Bosh og'rig'ining bir tomonlama, pulsatsiyali turi"
  long: "Migren — bu epizodik bosh og'rig'i bo'lib, odatda bir tomonlama, o'rta yoki kuchli intensivlikda, 4-72 soat davom etadi va ko'ngil aynishi, fotofobiya bilan kechadi."

epidemiology:
  prevalence: "12-15% aholi"
  gender_ratio: "Ayollar:Erkaklar = 3:1"
  age_peak: "25-45 yosh"
  uzbekistan_specific: "Mahalliy ma'lumot bo'yicha taxminan 2.5 mln kishi"

etiology:
  - "Genetik moyillik (50-70% holatlarda oilada)"
  - "Trigeminal-vaskulyar tizim faollashishi"
  - "Serotonin darajasi tebranishi"
  - "CGRP (calcitonin gene-related peptide) chiqishi"

triggers:
  - "Stress va emotsional zo'riqish"
  - "Uyqu yetishmovchiligi yoki ortiqcha uyqu"
  - "Hormonal o'zgarishlar (ayollarda — hayz, homiladorlik)"
  - "Ovqat: shokolad, qahva, qizil sharob, pishloq"
  - "Yorqin yorug'lik, baland tovush, kuchli hidlar"
  - "Ob-havo o'zgarishi"
  - "Ochlik"

primary_symptoms:
  - id: S001
    name_uz: "Bir tomonlama bosh og'rig'i"
    weight: 0.95
    must_have: true
  - id: S002
    name_uz: "Pulsatsiyali xarakter"
    weight: 0.85
  - id: S003
    name_uz: "O'rta yoki kuchli intensivlik"
    weight: 0.80
  - id: S004
    name_uz: "Harakat bilan kuchayish"
    weight: 0.75
  - id: S005
    name_uz: "Ko'ngil aynishi"
    weight: 0.70
  - id: S006
    name_uz: "Fotofobiya (yorug'likdan qo'rqish)"
    weight: 0.75
  - id: S007
    name_uz: "Fonofobiya (tovushdan qo'rqish)"
    weight: 0.70

secondary_symptoms:
  - "Aura (20-30% holatlarda) — ko'rish buzilishi, sezgi o'zgarishi"
  - "Aylanish"
  - "Diqqat susayishi"
  - "Charchoq"

duration: "4-72 soat (davolanmasa)"
frequency: "Oyiga 1-15 marta"

differential_diagnosis:
  - disease_id: D002
    name: "Tarang tipdagi bosh og'rig'i"
    distinguishing: "Ikki tomonlama, bosuvchi, yengil-o'rta, hamroh simptomlarsiz"
  - disease_id: D003
    name: "Klaster bosh og'rig'i"
    distinguishing: "Ko'z atrofida, juda kuchli, qisqa (15-180 daq), bir tomon ko'z qizarish"
  - disease_id: D999
    name: "Subaraxnoidal qon quyilish"
    distinguishing: "RED FLAG! O'tkir, 'hayotidagi eng kuchli', sekundlarda paydo bo'ladi"
  - disease_id: D998
    name: "Meningit"
    distinguishing: "Isitma + bo'yin qattiqligi"

required_tests:
  basic:
    - "Umumiy qon tahlili (UQT)"
    - "Qon bosimi monitoringi"
  if_needed:
    - "Bosh MRT (atypik holatlarda)"
    - "EEG (epilepsiya bilan adashganda)"
    - "Lyumbal punktsiya (meningit shubhasida)"

treatment_principles:
  acute_attack:
    - "NSAID (ibuprofen)"
    - "Triptanlar (sumatriptan)"
    - "Antiemetiklar (metoklopramid)"
  prophylaxis:
    - "Beta-blokerlar (propranolol)"
    - "Antikonvulsantlar (topiramat)"
    - "CGRP inhibitorlar (yangi)"
  WARNING: "Bu faqat ma'lumot. Aniq dori va doza shifokor tomonidan belgilanadi."

specialist_primary: "Nevropatolog"
specialist_secondary: ["Terapevt", "Oilaviy shifokor"]

red_flags:
  - "Birinchi marta 50 yoshdan keyin paydo bo'lgan"
  - "Sekundlarda paydo bo'lgan o'tkir og'riq"
  - "Bir necha kunda kuchayib boruvchi"
  - "Bosh jarohatidan keyin"
  - "Isitma + bo'yin qattiqligi"
  - "Nutq, ko'rish, harakat buzilishi"
  - "Tirishish bilan birga"
  - "Onkologik kasallik anamnezida"
  - "HIV/immunitet susayganda"

risk_factors:
  - "Ayol jinsi"
  - "20-50 yosh"
  - "Oilaviy anamnez"
  - "Stress, depressiya"
  - "Uyqu buzilishi"
  - "Semizlik"

prognosis: "Yaxshi, surunkali lekin nazorat qilinadi. 50 yoshdan keyin ko'pchilikda kamayadi."

prevention:
  - "Trigger'lar kundaligi yuritish"
  - "Muntazam uyqu (7-9 soat)"
  - "Stress boshqaruvi (meditatsiya, yoga)"
  - "Muntazam jismoniy faollik"
  - "Suv ichish (1.5-2 L/kun)"

patient_education_links:
  - "https://medsmartpro.uz/articles/migren-haqida"

sources:
  - "ICHD-3 (International Classification of Headache Disorders)"
  - "UpToDate: Migraine in adults"
  - "Mayo Clinic: Migraine"
  - "WHO Headache Atlas 2024"

last_updated: "2026-04-11"
reviewed_by:
  - name: "Dr. Karimov A."
    specialty: "Nevropatolog"
    experience: "18 yil"
  - name: "Dr. Yusupova M."
    specialty: "Nevropatolog"
    experience: "12 yil"
review_date: "2026-04-10"
next_review: "2026-10-10"
```

---

## 3. ASOSIY 20 KASALLIK RO'YXATI (MVP UCHUN)

### Nevrologik
1. **D001 — Migren** (yuqorida to'liq)
2. **D002 — Tarang tipdagi bosh og'rig'i** — ikki tomonlama, bosuvchi, stress bilan
3. **D003 — Insult** (RED FLAG) — FAST testi, darhol 103
4. **D004 — Epileptik tutqanoqlar**

### Yurak-qon tomir
5. **D005 — Arterial gipertoniya** — BP ≥140/90, asosiy KVK xavf omili
6. **D006 — Stenokardiya / IHD** — ko'krak siquvchi og'rig'i, jismoniy zo'riqishda
7. **D007 — Miokard infarkti** (RED FLAG) — 30+ daqiqa og'riq, terlash, qo'rquv
8. **D008 — Aritmiya**

### Nafas yo'llari
9. **D009 — ARVI / Gripp** — isitma, yo'tal, tomoq og'rig'i
10. **D010 — Pnevmoniya** — yo'tal balg'am bilan, isitma, hansirash
11. **D011 — Bronxial astma** — hansirash, hushtak, ekspirator
12. **D012 — COVID-19**

### Oshqozon-ichak
13. **D013 — O'tkir gastrit** — epigastral og'riq, ko'ngil aynishi
14. **D014 — Oshqozon yarasi** — och qoringa og'riq, ovqatdan keyin yengillashish
15. **D015 — Appenditsit** (RED FLAG) — to'g'ri pastki kvadrantda og'riq
16. **D016 — Virusli gepatit**

### Endokrin
17. **D017 — Qandli diabet (II tip)** — chanqash, polurya, vazn yo'qotish
18. **D018 — Gipotireoz** — charchoq, vazn ortishi, soviqda qiynalish

### Siydik-tanosil
19. **D019 — O'tkir sistit** — siydikda achishish, tez-tez siyish
20. **D020 — Pyelonefrit** — bel og'rig'i, isitma, siydik buzilishi

Har bir kasallik yuqoridagi to'liq sxema bo'yicha to'ldiriladi (taxminan 4-6 bet matn).

---

## 4. SIMPTOMLAR LUG'ATI

### 4.1. Tuzilma
Har bir simptom uchun:
- ID, nomlari (4 tilda)
- Sinonimlari (xalq tilidagi)
- ICD-10 kodi
- Tegishli kasalliklar (weight bilan)
- Aniqlashtiruvchi savollar
- Red flag varianti (agar bo'lsa)

### 4.2. Misol
```yaml
symptom_id: S001
icd10: R51
names:
  uz: ["Bosh og'rig'i", "Sefalja"]
  ru: ["Головная боль", "Цефалгия"]
  en: ["Headache", "Cephalgia"]
synonyms_uz:
  - "Boshim og'riyapti"
  - "Boshim yorilyapti"
  - "Boshim sanchayapti"
  - "Boshim zirqirayapti"
  - "Chakkam og'riyapti"

related_diseases:
  - {id: D001, weight: 0.95, base_probability: 0.30}
  - {id: D002, weight: 0.85, base_probability: 0.40}
  - {id: D005, weight: 0.40, base_probability: 0.15}

follow_up_questions:
  - q_id: Q001
    text_uz: "Qancha vaqtdan beri bosh og'riyapti?"
    type: "single_select"
    options:
      - "1 soatdan kam"
      - "Bugun"
      - "Bir necha kun"
      - "Bir hafta+"
      - "Bir oy+"
  - q_id: Q002
    text_uz: "Og'riq qaysi joyida?"
    type: "single_select"
    options: ["Peshona", "Chakka", "Ensa", "Butun bosh", "Bir tomonda"]
  - q_id: Q003
    text_uz: "Og'riq xarakteri?"
    options: ["Pulsatsiyali", "Bosuvchi", "O'tkir-sanchuvchi", "Zerikarli"]
  - q_id: Q004
    text_uz: "Og'riq darajasi (1-10)?"
    type: "slider"

red_flag_combinations:
  - if: [Q001 == "1 soatdan kam", "ong yo'qotish"]
    flag: "Subaraxnoidal qon quyilish shubhasi"
    action: "EMERGENCY"
  - if: ["isitma", "bo'yin qattiqligi"]
    flag: "Meningit shubhasi"
    action: "EMERGENCY"
```

(Jami ~200 ta simptom shu sxema bo'yicha)

---

## 5. DORILAR BAZASI

### 5.1. Tuzilma
- Nomi (xalqaro INN + savdo nomlari)
- Faol modda
- Farmakologik guruh
- Ko'rsatmalar
- Qarshi ko'rsatmalar
- Yon ta'sirlar
- O'zaro ta'sirlar (boshqa dorilar bilan)
- Allergiya potensiali
- Homiladorlik kategoriyasi (FDA A/B/C/D/X)
- Bolalar uchun

### 5.2. Misol — Ibuprofen
```yaml
drug_id: DR001
inn: "Ibuprofen"
trade_names: ["Nurofen", "Advil", "Brufen"]
group: "NSAID"
indications: ["Bosh og'rig'i", "Mushak og'rig'i", "Isitma", "Migren hujumi"]
contraindications: 
  - "Oshqozon yarasi"
  - "Buyrak yetishmovchiligi"
  - "Homiladorlik 3-trimestr"
side_effects: ["Oshqozon og'rig'i", "Allergik reaksiya", "Bosh aylanishi"]
interactions:
  - drug: "Aspirin"
    severity: "moderate"
  - drug: "Varfarin"
    severity: "high"
    note: "Qon ketish xavfi"
pregnancy: "C (3-trimestrda — D)"
```

(Jami ~500 ta keng tarqalgan dori)

---

## 6. TAHLILLAR BAZASI

Har bir tahlil uchun:
- Nomi, LOINC kodi
- Maqsadi
- Norma chegaralari (yosh, jins bo'yicha)
- Qachon tayinlash kerak
- Tayyorgarlik (och qoringa va h.k.)
- Narx oralig'i

---

## 7. KB BOSHQARUV JARAYONI

### 7.1. Yangilanish jadvali
- **Kunlik:** Critical fix'lar (xato topilsa)
- **Haftalik:** Yangi simptom-savollar
- **Oylik:** Yangi kasalliklar qo'shish, mavjudlarini yangilash
- **Kvartalda:** To'liq audit
- **Yiliga:** Manbalar bilan solishtirish, eskirganlarni almashtirish

### 7.2. Review workflow
1. Tibbiy yozuvchi loyiha tayyorlaydi
2. 1-ekspert review (mutaxassis bo'yicha)
3. 2-ekspert review (boshqa shifokor)
4. Kelishmaslik bo'lsa — 3-shifokor
5. Bosh shifokor tasdig'i
6. Production'ga deploy
7. Git'da version saqlash

### 7.3. Sifat metrikalar
- Har kasallik kamida 2 ekspert tasdig'i
- Manba ko'rsatilishi 100%
- Yangilanish oxirgi 6 oy ichida bo'lishi
- AI javoblari KB bilan mos kelishi >95%

---

## 8. KB → AI INTEGRATSIYASI

### 8.1. RAG pipeline
```
Bemor savoli → Embedding → Vector qidiruv (top-10 disease)
  → KB dan to'liq strukturali ma'lumot olish
  → LLM promptga kontekst qo'shish
  → LLM javob qaytarish
  → KB bilan validatsiya (galyutsinatsiya tekshirish)
```

### 8.2. Validatsiya qoidalari
- AI faqat KB dagi kasalliklarni taklif qila oladi
- AI taklif qilgan ICD-10 kod KB da bo'lishi shart
- AI taklif qilgan mutaxassis KB dagi bilan mos kelishi
- Aks holda — fallback javob

---

## 9. ETIK CHEGARALAR

KB ichida quyidagilar HECH QACHON saqlanmaydi/chiqmaydi:
- Aniq dori dozalari (faqat umumiy ma'lumot)
- Konkret davolash protokollari (faqat printsiplar)
- Yakuniy tashxis hukmi
- Bemor o'zini o'zi davolashi uchun ko'rsatmalar

KB doimo ushbu disclaimer bilan birga ishlatiladi:  
*"Bu ma'lumot faqat o'quv maqsadida. Aniq tashxis va davolash uchun shifokorga murojaat qiling."*

---

## 10. KENGAYTIRISH ROADMAP

| Bosqich | Kasalliklar soni | Simptomlar | Dorilar |
|---|---|---|---|
| MVP (1-3 oy) | 20 | 100 | 100 |
| V1.0 (6 oy) | 100 | 300 | 300 |
| V2.0 (12 oy) | 300 | 600 | 500 |
| V3.0 (24 oy) | 500+ | 1000+ | 800+ |

**Hujjat oxiri.**
