# MedSmart Pro — Clinical Knowledge Base Specification

**Hujjat ID:** DOC-16-CKB | **Versiya:** 1.0 | **Sana:** 11.04.2026  
**Mas'ul:** Bosh shifokor + Tibbiy ekspertlar konsiliumi

---

## 1. KIRISH
Ushbu hujjat MedSmart Pro tizimi foydalanadigan tibbiy bilimlar bazasining tuzilishi, manbalari va boshqarish jarayonini belgilaydi. KB AI tashxis dvigatelining "miyasi" hisoblanadi.

## 2. MANBALAR

### 2.1. Xalqaro standartlar
- **ICD-10/ICD-11** — Xalqaro kasalliklar tasnifi (WHO)
- **SNOMED CT** — Klinik atamalar
- **LOINC** — Laboratoriya tahlillari kodlari
- **RxNorm** — Dorilar standartlashtirilgan nomlari
- **MeSH** — Medical Subject Headings

### 2.2. Klinik manbalar
- **UpToDate** — eng obro'li klinik resurs
- **Mayo Clinic** — kasalliklar haqida ma'lumot
- **NIH MedlinePlus** — bemorlar uchun
- **PubMed** — peer-reviewed maqolalar
- **Cochrane Library** — meta-tahlillar

### 2.3. Mahalliy manbalar
- **O'zbekiston Soglomlik vazirligi protokollari**
- **Mahalliy klinik ko'rsatmalar** (terapiya, pediatriya, hamshiralik)
- **Toshkent Tibbiyot Akademiyasi materiallari**

## 3. KASALLIKLAR RO'YXATI

### 3.1. Birinchi bosqichda (MVP) — 50 ta eng keng tarqalgan
1. **Bosh og'rig'i:** migren, tarang tipdagi, klaster
2. **Yurak-qon tomir:** gipertoniya, IHD, aritmiya
3. **Nafas yo'llari:** ARVI, gripp, bronxit, pnevmoniya, astma, COVID-19
4. **Oshqozon-ichak:** gastrit, yara, IBS, GERD, gepatit
5. **Endokrin:** diabet, qalqonsimon bez kasalliklari
6. **Asab:** insult, epilepsiya, polinevropatiya
7. **Siydik-tanosil:** sistit, pyelonefrit, prostatit
8. **Ginekologik:** vaginit, mastopatiya, endometrioz
9. **Teri:** ekzema, psoriaz, akne, allergik dermatit
10. **Pediatrik:** otit, angina, suvchechak, qizilcha

### 3.2. Ikkinchi bosqich — 200 ta
### 3.3. Uchinchi bosqich — 500+ ta

## 4. HAR BIR KASALLIK UCHUN MA'LUMOT TUZILMASI

```yaml
disease_id: D001
icd10: G43.9
snomed: 37796009
names:
  uz: "Migren"
  ru: "Мигрень"
  en: "Migraine"
  lat: "Migraena"
description:
  uz: "Bosh og'rig'ining surunkali nevrologik kasalligi..."
etiology:
  - "Genetik moyillik"
  - "Stress"
  - "Gormonal o'zgarishlar"
  - "Ovqatlanish (shokolad, qahva, pishloq)"
pathogenesis: "Trigeminal-vaskulyar tizim faollashishi..."
primary_symptoms:
  - symptom: "Bir tomonlama bosh og'rig'i"
    weight: 0.95
    icd: "R51"
  - symptom: "Pulsatsiyali xarakter"
    weight: 0.85
  - symptom: "Ko'ngil aynishi"
    weight: 0.70
  - symptom: "Yorug'likdan qo'rqish (fotofobiya)"
    weight: 0.75
  - symptom: "Tovushdan qo'rqish (fonofobiya)"
    weight: 0.70
secondary_symptoms:
  - "Aura (ko'rish buzilishi)"
  - "Aylanish"
differential_diagnosis:
  - disease: "Tarang tipdagi bosh og'rig'i"
    distinguishing_factor: "Ikki tomonlama, bosuvchi xarakter"
  - disease: "Klaster bosh og'rig'i"
    distinguishing_factor: "Ko'z atrofida, qisqa muddat"
  - disease: "Subaraxnoidal qon quyilish"
    distinguishing_factor: "RED FLAG! O'tkir, kuchli, birinchi marta"
required_tests:
  - "Umumiy qon tahlili"
  - "Qon bosimi monitoringi"
  - "Bosh MRT (qaytalansa)"
  - "EEG (zarurat tug'ilsa)"
treatment_principles:
  general: "Hujum davrida — triptanlar, NSAID. Profilaktika — beta-blokerlar"
  warning: "DORI TAVSIYASI EMAS - faqat ma'lumot"
specialist: "Nevropatolog"
red_flags:
  - "Birinchi marta 50 yoshdan keyin"
  - "Bir necha kunda kuchayib boruvchi"
  - "Bosh jarohatidan keyin"
  - "Isitma + bo'yin qattiqligi (meningit shubhasi)"
  - "Nutq buzilishi, falaj (insult shubhasi)"
risk_factors:
  - "Ayol jinsi"
  - "20-50 yosh"
  - "Oilaviy anamnez"
  - "Stress, uyqu yetishmovchiligi"
prognosis: "Yaxshi, lekin surunkali"
prevention:
  - "Trigger'lardan qochish"
  - "Muntazam uyqu"
  - "Stress boshqaruvi"
sources:
  - "ICD-10 G43"
  - "UpToDate: Migraine in adults"
  - "Mayo Clinic: Migraine"
last_updated: "2026-04-11"
reviewed_by: "Dr. [Ism], Nevropatolog, 15 yil tajriba"
```

## 5. SIMPTOMLAR LUG'ATI

Har bir simptom uchun:
- ID, nomlari (4 tilda)
- ICD-10 kodi
- Sinonimlari (xalq tilidagi nomlari ham — masalan "boshim aylanyapti" = "vertigo")
- Tegishli kasalliklar ro'yxati (weight bilan)
- Aniqlashtiruvchi savollar

**Misol:**
```yaml
symptom_id: S001
names:
  uz: ["Bosh og'rig'i", "Boshim og'riyapti", "Sefalja"]
  ru: ["Головная боль"]
icd10: R51
related_diseases:
  - {id: D001, weight: 0.95}  # migren
  - {id: D002, weight: 0.80}  # tarang
follow_up_questions:
  - "Qancha vaqtdan beri?"
  - "Qaysi joyida?"
  - "Qanday xarakterda?"
```

## 6. DORILAR BAZASI
- Nomi (xalqaro va savdo)
- Faol modda
- Ko'rsatma
- Qarshi ko'rsatmalar
- Yon ta'sirlar
- O'zaro ta'sirlar (boshqa dorilar bilan)
- Allergiya potensiali
- Homiladorlik kategoriyasi

## 7. KB ARXITEKTURASI
- **Saqlash:** PostgreSQL (strukturali) + Vector DB (semantik qidiruv uchun)
- **RAG:** Bilimlar embedding'lari Pinecone'da
- **Yangilanish:** Oylik review, kvartalda audit
- **Versioning:** Git-style, har o'zgarish log qilinadi

## 8. SIFAT NAZORATI
- Har bir kasallik kamida 2 ta mutaxassis tomonidan ko'rib chiqiladi
- Manba ko'rsatilishi shart
- Yiliga 1 marta to'liq audit
- Yangi tibbiy tadqiqotlar bo'yicha yangilash

## 9. ETIK TALABLAR
- Hech qachon aniq dori tavsiyasi berilmaydi (faqat "shifokor bilan maslahatlashing")
- Hech qachon doza ko'rsatilmaydi
- Har doim "bu tashxis emas" ogohlantirishi
- Manba ko'rsatish majburiy

**Hujjat oxiri.**
