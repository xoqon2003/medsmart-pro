# Stakeholderlar Xaritasi

> **Hujjat ID:** UC-002 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Onion Diagram (Qatlamlar)

```
┌─────────────────────────────────────────────────────┐
│                   4-QATLAM: TASHQI MUHIT            │
│  Sog'liqni saqlash vazirligi, Raqamlashtirish       │
│  vazirligi, To'lov provayderlari, AI provayderlari   │
│  ┌─────────────────────────────────────────────┐     │
│  │           3-QATLAM: HAMKORLAR               │     │
│  │  Tekshiruv markazlari, Klinikalar,          │     │
│  │  Sanatoriylar, Telegram                     │     │
│  │  ┌─────────────────────────────────────┐    │     │
│  │  │       2-QATLAM: XODIMLAR            │    │     │
│  │  │  Radiolog, Shifokor, Mutaxassis,    │    │     │
│  │  │  Operator, Kassir, Admin            │    │     │
│  │  │  ┌─────────────────────────────┐    │    │     │
│  │  │  │   1-QATLAM: YADRO           │    │    │     │
│  │  │  │  Bemor (Patient)            │    │    │     │
│  │  │  │  Product Owner              │    │    │     │
│  │  │  │  Dev Team                   │    │    │     │
│  │  │  └─────────────────────────────┘    │    │     │
│  │  └─────────────────────────────────────┘    │     │
│  └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

## Stakeholder jadvali

| # | Stakeholder | Qatlam | Qiziqish | Ta'sir darajasi |
|---|------------|--------|----------|----------------|
| 1 | Bemor | Yadro | Tez va sifatli xulosa olish | Yuqori |
| 2 | Product Owner | Yadro | Loyiha muvaffaqiyati | Yuqori |
| 3 | Dev Team | Yadro | Texnik sifat | Yuqori |
| 4 | Radiolog | Xodim | Qulay ish muhiti | Yuqori |
| 5 | Shifokor | Xodim | Bemorlar bilan samarali aloqa | O'rta |
| 6 | Mutaxassis | Xodim | Aniq ma'lumotlar | O'rta |
| 7 | Operator | Xodim | Tez ariza boshqaruvi | O'rta |
| 8 | Kassir | Xodim | To'lov aniqligi | O'rta |
| 9 | Admin | Xodim | Tizim barqarorligi | Yuqori |
| 10 | Tekshiruv markazlari | Hamkor | Bemor oqimi | Past |
| 11 | Klinikalar | Hamkor | Xizmat sifati | Past |
| 12 | Telegram | Hamkor | Platforma qoidalariga rioya | Past |
| 13 | To'lov provayderlari | Tashqi | Tranzaksiya hajmi | O'rta |
| 14 | SSV (Sog'liqni saqlash) | Tashqi | Regulyativ talablar | Yuqori |

## Aloqa rejasi

| Stakeholder | Aloqa usuli | Chastotasi |
|------------|-------------|-----------|
| Bemor | Telegram bot, Mini App | Real-time |
| Tibbiy xodimlar | Web panel, bildirishnomalar | Kunlik |
| Product Owner | Sprint review | 2 haftada 1 |
| Dev Team | Daily standup | Kunlik |
| Tashqi hamkorlar | Email, API monitoring | Haftalik |
