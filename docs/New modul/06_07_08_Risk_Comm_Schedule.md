# MedSmart Pro — Risk Management + Communication + Schedule

**Hujjat ID:** DOC-06+07+08 | **Versiya:** 1.0 | **Sana:** 11.04.2026

---

# QISM A: RISK MANAGEMENT PLAN

## 1. RISK REYESTRI

| ID | Risk | Kategoriya | Ehtimol | Ta'sir | Ball | Mitigation |
|---|---|---|---|---|---|---|
| R1 | AI noto'g'ri tashxis qo'yadi | Klinik | O'rta | Yuqori | 9 | Ekspert validatsiya, RAG, disclaimer, red flag tizimi |
| R2 | Ma'lumotlar sizishi | Xavfsizlik | Past | Yuqori | 6 | Shifrlash, audit, pen-test, HIPAA |
| R3 | Huquqiy muammo | Huquqiy | O'rta | Yuqori | 9 | Yurist, litsenziya, ToS |
| R4 | Foydalanuvchi qabul qilmaslik | Bozor | O'rta | O'rta | 6 | UX tadqiqot, pilot, marketing |
| R5 | Texnik kechikish | Loyiha | Yuqori | O'rta | 6 | Buffer, MVP-first |
| R6 | Klinikalar hamkorlik qilmaslik | Biznes | O'rta | Yuqori | 9 | Erta shartnomalar, foyda bo'lishish |
| R7 | LLM API narxlari oshishi | Texnik | Past | O'rta | 4 | Multi-provider, kesh, optimizatsiya |
| R8 | Bosh shifokor ketib qolishi | Resurs | Past | Yuqori | 6 | 2-3 ekspert |
| R9 | Investor mablag'i tugashi | Moliyaviy | Past | Yuqori | 6 | Erta daromad, qo'shimcha raund |
| R10 | Mahalliylashtirish sifati past | Sifat | O'rta | O'rta | 6 | Mahalliy QA, lingvistlar |

## 2. MONITORING
- Haftalik risk review (PM)
- Oylik risk audit (CTO + bosh shifokor)
- Yangi risklar darhol qo'shiladi

---

# QISM B: COMMUNICATION PLAN

## 1. ALOQA MATRITSASI

| Stakeholder | Kanal | Chastota | Format | Mas'ul |
|---|---|---|---|---|
| Investor | Email | Oylik | Hisobot PDF | CEO |
| Bosh shifokor | Slack + yig'ilish | Haftalik | Live | PM |
| Dev jamoa | Slack + standup | Kunlik | Live | Tech Lead |
| Bemorlar (foydalanuvchi) | Push + email | Maxsus | Marketing | Marketing |
| Klinikalar | Email + telefon | Haftalik | Hisobot | BizDev |

## 2. YIG'ILISHLAR JADVALI
- **Daily standup:** har kuni 09:00 (15 daqiqa)
- **Sprint planning:** har 2 hafta (2 soat)
- **Sprint review:** sprint oxirida (1 soat)
- **Retrospective:** sprint oxirida (1 soat)
- **Steering committee:** oylik (CEO, CTO, bosh shifokor, PM)

## 3. ESKALATSIYA
- 1-daraja: Tech Lead → 2-daraja: PM → 3-daraja: CTO → 4-daraja: CEO

## 4. VOSITALAR
- **Slack** — chat
- **Jira** — vazifalar
- **Confluence** — hujjatlar
- **GitHub** — kod
- **Figma** — dizayn
- **Google Meet** — yig'ilishlar

---

# QISM C: PROJECT SCHEDULE

## 1. WBS (Work Breakdown Structure)

```
MedSmart Pro
├── 1. Tahlil va rejalashtirish (4 hafta)
│   ├── 1.1 Hujjatlar yozish
│   ├── 1.2 Tibbiy ekspertlar bilan ishlash
│   └── 1.3 Tasdiqlash
├── 2. Dizayn (3 hafta)
│   ├── 2.1 UI/UX
│   ├── 2.2 Arxitektura
│   └── 2.3 DB sxema
├── 3. Rivojlantirish (8 hafta)
│   ├── 3.1 Backend
│   ├── 3.2 Frontend
│   ├── 3.3 AI integratsiya
│   └── 3.4 Mobil ilova
├── 4. Test (3 hafta)
│   ├── 4.1 Unit/Integration
│   ├── 4.2 Klinik validatsiya
│   └── 4.3 UAT
├── 5. Deploy (1 hafta)
└── 6. Launch (1 hafta)
```

## 2. ASOSIY MILESTONES (Gantt)

| Hafta | Vazifa | Mas'ul |
|---|---|---|
| 1-2 | Hujjatlar (BRD, SRS, Use Cases) | BA, SA |
| 3-4 | Tibbiy bilim bazasi | Bosh shifokor |
| 5-6 | UI/UX dizayn, arxitektura | UX, Arch |
| 7 | DB dizayn, API spec | DB Arch, BE Lead |
| 8-9 | Backend MVP | BE jamoa |
| 10-11 | Frontend MVP | FE jamoa |
| 12 | AI integratsiya | AI muhandisi |
| 13 | Test va tuzatish | QA |
| 14 | Klinik validatsiya | Bosh shifokor + QA |
| 15 | UAT va beta | PM |
| 16 | Launch | Hammasi |

## 3. CRITICAL PATH
Hujjatlar → DB dizayn → Backend → AI integratsiya → Klinik validatsiya → Launch  
**Critical path uzunligi:** 16 hafta

## 4. RESURSLAR
- 15 kishi
- 16 hafta
- ~9,600 ish-soat
- $300K byudjet

**Hujjat oxiri.**
