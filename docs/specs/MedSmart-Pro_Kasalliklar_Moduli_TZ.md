# TEXNIK TOPSHIRIQ (TZ / ТЗ)

## «MedSmart-Pro» — Kasalliklar Ensiklopediyasi va Diagnoz Bazasi Moduli

**Loyiha**: MedSmart-Pro (<https://medsmart-pro.vercel.app/>)
**Modul nomi**: Kasalliklar Ma’lumotnomasi (Disease Knowledge Base / База заболеваний)
**Hujjat turi**: Detallashtirilgan Texnik Topshiriq (Detailed Technical Specification, v1.0)
**Hujjat sanasi**: 2026-04-17
**Mualliflar (rollar bo‘yicha ekspert jamoasi)**:

- Tibbiyot fanlari professori / umumiy amaliyot shifokori (medical lead)
- Klinik epidemiolog va evidence-based medicine mutaxassisi
- Tor mutaxassislar: kardiolog, revmatolog (Bexterev kasalligi misolida), nevrolog, gastroenterolog, gematolog, genetik
- Biznes analitik (BA)
- Tizim analitigi (SA)
- UI/UX dizayner (web + mobile)
- Loyiha menejeri (PM)
- Ma’lumotlar muhandisi (data engineer) va MLOps mutaxassisi (AI Tavsiya moduli bilan integratsiya)
- Yuridik/compliance mutaxassisi (shaxsiy ma’lumotlar, tibbiy ma’lumotlarni himoyalash)

**Hujjatni qabul qiluvchilar**: bosh konstruktor (tech lead), frontend/backend jamoalari, content-redaksiyasi, QA, product owner, investorlar va klinik maslahat kengashi.

---

## MUNDARIJA

1. Kirish va biznes konteksti
2. Maqsad, vazifalar, muvaffaqiyat mezonlari (KPI / OKR)
3. Hujjatda qo‘llaniladigan atamalar va qisqartmalar lug‘ati
4. Stakeholderlar va rollar matritsasi (RACI)
5. Foydalanuvchi segmentlari va personalar
6. Ishlatish stsenariylari (User stories + Use cases)
7. Asosiy foydalanuvchi yo‘llari (User flows)
8. Kasallik kartasining universal struktura sxemasi
9. Har bir bo‘lim uchun sarlavha sinonimlari (marker-label variantlari)
10. Markerli shablon tizimi ({{ma’lumot}} — templating engine)
11. Ma’lumotlar modeli va ER-sxema
12. API shartnomasi (contract)
13. AI Tavsiya moduli bilan integratsiya (symptom matching)
14. UI/UX talablari (web + mobile)
15. Dizayn tizimi (tokens, komponentlar, a11y)
16. Kontentni yaratish va moderatsiya qilish jarayoni (editorial pipeline)
17. Sifat, xavfsizlik, compliance va etika talablari
18. Non-functional talablar (performance, SEO, SLO)
19. Analitika va telemetriya
20. Joriy qilish bosqichlari (roadmap) va yetkazib berish mezonlari
21. Qabul qilish mezonlari (Acceptance Criteria) va DoD
22. Xavf registri (Risk register)
23. Bo‘limlarga sinonim-matritsa (marker dictionary)
24. Ilova A: «Bexterev kasalligi» misolida to‘ldirilgan karta namunasi
25. Ilova B: JSON sxema (kasallik obyekti)
26. Ilova C: Kontent sifati uchun tahrir chek-listi

---

## 1. KIRISH VA BIZNES KONTEKSTI

MedSmart-Pro — bu bemor shikoyatlarini qabul qilib, AI yordamida ehtimoliy kasalliklarni taklif qiluvchi, ularni mutaxassis va tahlillarga yo‘naltiruvchi platforma. Birinchi oynada foydalanuvchi o‘z simptomlarini tanlaydi («Qorin og‘rig‘i», «Bosh og‘rig‘i», «Ko‘krak og‘rig‘i», «Ko‘ngil aynash», «Holsizlik», «Bosh aylanishi» va h.k.). AI natijasi sifatida «Tahlil natijalari» oynasi ochiladi va u yerda, masalan: Gipertoniya (I10) — 95%, Migren (G43.9) — 93%, Gastrit (K29.7) — 93% kabi ehtimollik darajalari bilan kasallik ro‘yxati ko‘rsatiladi (referens skrin tibbiy ilovaning joriy versiyasidan olingan).

Hozirgi vaziyatda har bir kasallik kartasi cheklangan ma’lumot beradi: ta’rif, 2–3 tavsiya, taklif qilinayotgan tahlillar. Foydalanuvchi kasallik nomi yoki ICD-10 (MKB-10) kodini bosgan paytda chuqur, tizimli, professional ma’lumotnomaga o‘ta olmaydi. **Ushbu modul shu bo‘shliqni yopadi** — bemor, talaba, hamshira, shifokor va tor mutaxassislar uchun birdek foydali bo‘lgan, kasallikni boshidan oxirigacha qamrab oluvchi universal ma’lumotnoma (“живой справочник”) yaratiladi.

Modul, shu bilan birga, keyingi moduldlar uchun baza vazifasini bajaradi: Shifokor paneli, Elektron tibbiy karta (EHR), Triaj, Chatbot, Laboratoriya tahlili izohlari, Dori-darmon o‘zaro ta’siri, Ta’lim moduli (talabalar va rezidentlar uchun). Boshqacha aytganda, Kasalliklar Bazasi — MedSmart-Pro-ning **klinik “domain core”** ishtarushi.

---

## 2. MAQSAD, VAZIFALAR, MUVAFFAQIYAT MEZONLARI

### 2.1. Loyiha maqsadi

Yagona, ishonchli, ko‘p tilli va ko‘p auditoriyali elektron kasalliklar ma’lumotnomasini yaratish: har bir kasallik uchun **universal karta**, u **markerlar (templates)** asosida to‘ldiriladi, **AI Tavsiya** bilan uzviy bog‘liq bo‘ladi va boshqa modullar tomonidan **ko‘p marta qayta ishlatiladi** (reusable content).

### 2.2. Biznes vazifalari

1. Bemorning «Tahlil natijalari» oynasidan kasallik nomi/kodiga bosgan paytda chuqur ma’lumot beruvchi karta oynasini ochish.
2. Bemorga o‘z simptomlarini ushbu kasallik belgilariga qiyoslash imkonini berish («bor» / «yo‘q» / «aniq emas» bilan belgilash) va natijani shifokorga yuborish.
3. Shifokorga strukturaviy anamnez, tahlil rejasi va klinik bayonnomaga asos olish uchun bir yerda professional ma’lumotlar manbasini taqdim qilish.
4. Talabalar va hamshiralarga o‘qish/imtihonga tayyorlanish uchun patogenez, tasnif, klinik shakllar, bosqichlar bo‘yicha tuzilgan material.
5. Mutaxassislarga so‘nggi dalillar (evidence), klinik protokollar, statistika, mintaqaviy epidemiologiya, ilmiy izlanishlar va olimlar haqida xulosalar.
6. Boshqa modullar uchun **yagona haqiqat manbai (single source of truth)** — barcha joylarda tavsif bir xil, dori-darmon, ICD-10, LOINC kodlari barqaror.

### 2.3. Muvaffaqiyat mezonlari (KPI)

| Mezon | O‘lchov birligi | Maqsad (6 oy) |
|---|---|---|
| Bazadagi kasalliklar soni | ta (ICD-10 bo‘yicha) | 1000+ (faol, kamida L1 to‘liqligi) |
| «Tahlil natijalari» dan kartaga o‘tish CTR | % | ≥ 55% |
| Bemor tomonidan «bor/yo‘q» simptom belgilash konversiyasi | % | ≥ 35% |
| «Shifokorga yuborish» tugmasi konversiyasi | % | ≥ 15% |
| Karta yuklanish vaqti (p95) | ms | ≤ 1200 |
| Shifokorlardan olingan NPS | ball (–100…+100) | ≥ +40 |
| Kontent xatosi shikoyatlari | ta/1000 ko‘rish | ≤ 0.5 |

### 2.4. OKR (Q2–Q3 2026)

O1: Kasalliklar bazasini MedSmart-Pro-ning “qalbiga” aylantirish.

- KR1: 300 ta eng ko‘p uchraydigan ICD-10 kasalligi uchun L1 (asosiy) bo‘limlar to‘ldirilgan.
- KR2: Kamida 50 kasallik uchun L2 (chuqurlashgan) bo‘limlar (patogenez, klinika, bosqichlar, asoratlar) tayyor.
- KR3: «AI Tavsiya → Karta → Simptom taqqoslash → Shifokorga yuborish» yo‘li end-to-end ishlaydi.

---

## 3. ATAMALAR VA QISQARTMALAR

- **ICD-10 / MKB-10** — Xalqaro kasalliklar klassifikatsiyasi, 10-qayta ko‘rib chiqish.
- **LOINC** — laboratoriya tahlillari kodlari standarti.
- **SNOMED CT** — klinik atamalar uchun xalqaro standart.
- **FHIR** — sog‘liqni saqlash ma’lumotlari almashinuvi standarti (HL7 FHIR R4).
- **L1/L2/L3** — kontentning chuqurlik darajalari: L1 — bemor uchun qisqa; L2 — kengaytirilgan (talaba/hamshira); L3 — chuqur (shifokor/mutaxassis).
- **Marker / Placeholder** — `{{blok_nomi}}` ko‘rinishidagi shablon.
- **SMAD** — qon bosimini sutkalik monitoring qilish (АД-мониторинг).
- **EKG** — elektrokardiografiya.
- **KB (Knowledge Base)** — bilimlar bazasi.
- **CMS** — content management system (redaksion panel).
- **SSR/ISR** — Server-Side Rendering / Incremental Static Regeneration (Next.js/Vercel).
- **CTA** — Call-to-Action (harakatga chorlovchi tugma).

---

## 4. STAKEHOLDERLAR VA ROLLAR (RACI)

| Vazifa | Prof./Bosh shifokor | Tor mutaxassis | BA | SA | UX | Frontend | Backend | Data eng. | QA | PM | Yurist |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kontent skeleti | A | R | C | I | C | I | I | C | I | I | I |
| Klinik aniqlik | A | R | I | I | I | I | I | C | C | I | C |
| Ma’lumot modeli | I | C | C | A/R | C | C | R | R | I | C | I |
| UI/UX qarorlar | C | C | C | C | A/R | R | I | I | C | C | I |
| Integratsiya (AI Tavsiya) | I | C | C | R | C | R | A | R | C | C | I |
| Compliance (PDn, tibbiy maxfiylik) | C | C | C | C | I | I | C | C | I | C | A/R |
| Release planlash | I | I | R | R | C | C | C | C | C | A | I |

(R — Responsible, A — Accountable, C — Consulted, I — Informed)

---

## 5. FOYDALANUVCHI SEGMENTLARI VA PERSONALAR

Har bir kasallik kartasi quyidagi auditoriyalarni bir yerda qoniqtirishi lozim. Ular uchun alohida **«ko‘rish rejimi» (view mode)** mavjud: «Bemor», «Talaba/Hamshira», «Shifokor», «Mutaxassis», «Aralash» (default). Mode bo‘yicha filter kartadagi bloklarni **yashirmasdan**, prioritetlaydi va tilni soddalashtiradi yoki chuqurlashtiradi.

- **Bemor (patient)** — “Men nima ahvoldaman?” savoliga javob oladi. Til — sodda, tarjima, infografika, 5–7 sinf darajasi. Kerakli bloklar: Ta’rif, Sabablar, Belgilar, Nima mumkin emas/mumkin, Qachon shifokorga borish, Bemor savollari (FAQ).
- **Tibbiyot talabasi** — patogenez, tasnif, klinik bosqichlar, differensial diagnostika, tahlillar, klassik protokollar. Til — akademik, lotin nomlari bilan.
- **Hamshira / feldsher** — hamshiralik diagnozi (NANDA), parvarish bosqichlari, dori-darmonni dozalash, in’ektsiya qoidalari, bemorni kuzatish va hujjatlashtirish.
- **Umumiy shifokor (GP)** — diagnostika algoritmi, birlamchi davolash, tahlillar minimum/kengaytirilgan to‘plami, mutaxassisga yo‘naltirish mezonlari.
- **Mutaxassis (kardiolog, revmatolog, nevrolog va h.k.)** — so‘nggi xalqaro qo‘llanmalar (ESC/ESH, EULAR, ACR, WHO), eksperimental terapiya, kam uchrovchi shakllar, ilmiy maqolalar, klinik holatlar.
- **Akademik/Ilmiy tadqiqotchi** — statistika, mintaqaviy epidemiologiya, genetik marker, bio-marker, kohort ma’lumotlari.

> Qo‘shimcha segmentlar (rivojlanish): farmatsevt (retsept va o‘zaro ta’sir), tibbiy hujjatchi/kodirovshchik (ICD/DRG kodlash), sug‘urtachi (tarif/protokolga asoslangan to‘lov).

---

## 6. USE CASES VA USER STORIES

### 6.1. Asosiy Use Case (UC-01): «Bemor simptomlardan kasallik kartasiga»

- Aktyor: Bemor
- Oldingi holat: bemor «AI Tavsiya — shikoyatim bor» so‘rovnomasini to‘ldirgan, natija oynasida kasalliklar ro‘yxati ko‘rsatilgan.
- Asosiy yo‘l:
  1. Bemor «Gipertoniya (I10) — 95%» qatoriga bosadi.
  2. Tizim ushbu kasallik uchun **Karta oynasi**ni ochadi (tab yoki modal + deep-link).
  3. Karta yuqorisida simptom taqqoslash banneri chiqadi: «Siz kiritgan 6 ta simptomdan 4 tasi ushbu kasallikka mos keladi».
  4. Bemor «Simptomlarni taqqoslash» bo‘limiga o‘tib, har bir belgi uchun “Ha, menda bor / Yo‘q / Bilmayman / Ba’zan” ni belgilaydi.
  5. Bemor natijani «Shifokorga yuborish» yoki «Saqlab qo‘yish (PDF / profil)» tugmasi orqali jo‘natadi.
- Muqobil yo‘llar:
  - Bemor kasallik ustiga emas, **MKB-10 kodi** ustiga bosadi — xuddi shu oyna ochiladi, lekin `?anchor=icd` bilan ICD-10 blokiga sakraydi.
  - Bemor modalni yopsa, natijalar saqlanadi (draft) va 7 kun davomida mavjud.
- Kutilgan natija: Shifokor panelida strukturaviy, semantik belgilangan ma’lumot (FHIR Observation / Condition / Questionnaire Response) paydo bo‘ladi.

### 6.2. Boshqa User Stories (qisqacha)

- **US-02 (Shifokor)**: «Bemorning ma’lumoti ochiqligini ko‘rib, klinik protokol bo‘yicha zudlik bilan qaror qabul qilmoqchiman» → karta shifokor rejimida ochiladi, “Diagnostika algoritmi” va “Davolash sxemasi” bloklari yuqoriga suriladi.
- **US-03 (Talaba)**: «Imtihonga tayyorlanyapman, kasallikni ikki daqiqada takrorlashim kerak» → «Cheat-sheet» / Tez ko‘rib chiqish rejimi.
- **US-04 (Hamshira)**: «Palatada bemor ahvoli yomonlashdi, tezkor harakat rejasini ko‘rmoqchiman» → «Parvarish va monitoring» bloki + qizil rang CTA «Shifokorni chaqirish mezonlari».
- **US-05 (Mutaxassis)**: «Rare case bilan uchrashdim, oxirgi klinik holatlarni ko‘raman» → «Klinik holatlar» (case reports) bo‘limiga o‘taman.
- **US-06 (Admin/Redaktor)**: «Yangi kasallik kartasini marker shablonidan yarataman, 40 bo‘lim to‘ldirish kerak» → CMS-da `{{blok}}` chap panelda, matn o‘ng panelda.

---

## 7. FOYDALANUVCHI YO‘LLARI (FLOWS)

### 7.1. Flow A — AI Tavsiya → Karta → Shifokor

```
[Shikoyat tanlash]
      │
      ▼
[AI so‘rovnomasi: lokalizatsiya, davomiyligi, shiddat]
      │
      ▼
[Natija: kasalliklar ro‘yxati + %]
      │   (kasallik nomi yoki MKB-10 ga bosish)
      ▼
[Karta oynasi: «Bemor» rejimida default]
   ├─ Yuqori banner: “4/6 simptom mos keladi”
   ├─ “Simptomlarni taqqoslash” bo‘limi (Ha/Yo‘q/Bilmayman)
   ├─ Bloklar: Ta’rif → Sabablar → Belgilar → Diagnostika → Davolash va boshqalar
   └─ CTA:
        ▪ Saqlash (profilga)
        ▪ PDF olish
        ▪ Shifokorga yuborish
        ▪ Navbat olish
      │
      ▼
[Shifokor paneli: Yangi so‘rov + filtrlangan natija]
```

### 7.2. Flow B — To‘g‘ridan-to‘g‘ri qidiruv

Foydalanuvchi `/diseases` sahifasida nom, ICD-10 kodi, sinonimi, rus/ingliz/o‘zbek varianti bo‘yicha qidiradi → karta ochiladi. URL: `/diseases/{slug}` (slug = `gipertoniya-i10`), alternativ: `/icd/I10`.

### 7.3. Flow C — Boshqa modullar ichidan havola

Elektron retsept, anamnez, ta’lim materiali, chat-bot javobida kasallik nomi/ICD-10 «pill» (chip) ko‘rinishida chiqadi va bosilganda **modal preview** ochadi (to‘liq sahifaga o‘tmasdan, kichik oynada ko‘rish). Bu — cross-module embed komponenti.

---

## 8. KASALLIK KARTASINING UNIVERSAL STRUKTURASI

Har bir kasallik uchun quyidagi bloklar mavjud. Har bir blok **moddular (pluggable)** — mavjud bo‘lishi shart emas, lekin tartib qat’iy. Bloklar **chuqurlik darajasi** (L1/L2/L3) bilan belgilanadi. Kontent markerli shablondan kelib chiqadi (§10).

### 8.1. MKB-10 paneli (har doim sahifaning yuqorisida)

- Kasallik nomi (o‘zbek, rus, ingliz, lotin)
- Kasallik kodi (ICD-10, ICD-11 ixtiyoriy)
- Kod guruhi (masalan: «I10–I15 Gipertoniya kasalliklari»)
- Sinonimlar / eski nomlar
- Rivojlanish darajasi va bosqichlari (chip)
- Xalqaro protokol manbai (ESC/ESH, EULAR va h.k.)
- Oxirgi yangilanish sanasi va redaktor

### 8.2. Asosiy blok-ro‘yxat (kanonik tartib)

1. Kasallik haqida ma’lumot (Информация о заболевании)
2. Umumiy ma’lumotlar (Общие сведения)
3. Suratlar / media (Медиаматериалы)
4. Sabablar (Причины)
5. Patogenezi (Патогенез)
6. Bemor shikoyatlarini o‘rganish (Изучение жалоб)
7. Anamnez yig‘ish (Сбор анамнеза)
8. Tahlillar (Лабораторные и инструментальные анализы) — kasallikka qarab moslanadi
9. Kasallik turlari / variantlari (Разновидности заболевания)
10. Ko‘zdan kechirish (Осмотр)
11. Tasniflash (Классификация)
12. Kasallik belgilari / simptomlar (Симптомы)
13. Diagnostika (Диагностика)
14. Davolash (Лечение)
15. Dori-darmon bilan davolash (Медикаментозное лечение)
16. Prognoz va profilaktika (Прогноз и профилактика)
17. O‘rtacha davolanish narxlari (Цены на лечение)
18. Davolaydigan tibbiyot muassasalari (Лечебные учреждения)
19. Qaysi shifokor davolaydi? (Какой врач лечит?)
20. Shifokorlar / mutaxassislar katalogi (Лечащие врачи)
21. Kasallik bo‘yicha boshqa ma’lumotlar (Другие данные)
22. Buni bilish muhim! (Важно!) — ogohlantirishlar va MYTH/FACT
23. Kasallik xususiyatlari (Особенности болезни)
24. Patologiya tasnifi (Классификация патологии)
25. Rivojlanish bosqichlari (Стадии развития)
26. Klinik ko‘rinishlari (Клинические проявления)
27. Dastlabki bosqich (Ранняя стадия)
28. Kengaytirilgan bosqich (Развернутая стадия)
29. Kechki bosqich (Поздняя стадия)
30. Mumkin bo‘lgan asoratlar (Возможные осложнения)
31. Diagnostika usullari (Методы диагностики)
32. Davolash tartibi (Схема лечения)
33. Qo‘shimcha tavsiyalar (Дополнительные рекомендации)
34. Profilaktika choralari (Меры профилактики)
35. Nimalar mumkin emas! (Чего нельзя!)
36. Tavsiya etiladi! (Рекомендуется!)
37. Prognoz. Profilaktika (Прогноз. Профилактика)
38. Klinik holatlar (Клинические случаи) — case reports

### 8.3. Kengaytiruvchi bloklar (ixtiyoriy, ammo universallik uchun muhim)

- Epidemiologiya (jahon, mintaqa, O‘zbekiston bo‘yicha statistika)
- Qon guruhi va Rh-omil bog‘liqligi (agar klinik ahamiyatli bo‘lsa)
- Genetika va irsiyat (HLA-B27, BRCA1, LDLR, APOE va h.k.)
- Xavf omillari (risk factors)
- Differensial diagnostika
- Ko‘rsatkichlar (scales): NYHA, BASDAI, VAS, Glasgow va h.k.
- Hamroh kasalliklar (comorbidities) va boshqa patologiyalar bilan aloqasi
- Homiladorlik va laktatsiya davridagi xususiyatlar
- Pediatriya / geriatriya xususiyatlari
- Reabilitatsiya va fizioterapiya
- Ruhiy sog‘liq aspekti (psixosomatika, depressiya bilan aloqa)
- Ovqatlanish va parhez (dietoterapiya)
- Jismoniy tarbiya va sport yuklamalari
- Ish faoliyati (MSEK / nogironlik), sug‘urta, qonun-qoidalar
- Shoshilinch yordam algoritmi (ASL-BLS)
- Klinik protokollar va qo‘llanmalar (manbalar bilan)
- Dori-darmonlarning o‘zaro ta’siri va xolatinda taqiqlari
- Vaktsinatsiya va immunoprofilaktika
- Kasallikka bog‘liq olimlar va tarix (Bechterev, Strümpell, Marie, Brodie — misolda)
- Xalqaro tadqiqotlar va ekspertlar (recent trials: NCT ID bilan)
- Mintaqaviy xususiyatlar (O‘zbekiston bo‘yicha epidemiologik holat)
- Bemor tashkilotlari va jamoalari (Uzb va jahon)
- FAQ — bemor savollari
- So‘nggi yangiliklar va kashfiyotlar
- Xulosa (take-home messages)

### 8.4. Ko‘rish rejimlari bo‘yicha ustuvorlik (view-mode prioritization)

| Blok | Bemor | Talaba/Hamshira | Shifokor/Mutaxassis |
|---|---|---|---|
| Ta’rif, Sabablar, Belgilar | P1 (top) | P2 | P3 |
| Patogenez, Tasnif | yashirilgan (collapsed) | P1 | P2 |
| Diagnostika algoritmi | P3 | P1 | P1 |
| Davolash sxemasi, dori dozalari | yashirilgan | P2 | P1 |
| FAQ, nimalar mumkin emas | P1 | P2 | P3 |
| Klinik holatlar | yashirilgan | P2 | P1 |

---

## 9. BO‘LIM SARLAVHALARI UCHUN SINONIM-MATRITSA (marker labels)

Har bir blokning sarlavhasi yozuvchi uchun zerikarli bo‘lmasligi uchun **2–3 sinonim variant** mavjud; CMS ichida muharrir shu variantlardan birini tanlaydi yoki o‘ziniki yozadi (global terminology validator bilan tekshiriladi). Bu — foydalanuvchiga kontentning tirik, tabiiy tuyulishini ta’minlash uchun.

Misol: «Kechki bosqich» → «Kechki bosqich simptomlari», «Kasallikning kechki bosqichlari», «Oxirgi bosqich belgilari».

Asosiy sinonimlar jadvali (qisqacha, to‘liq versiyasi §23-Ilovada):

| Kanonik marker | Variant 1 | Variant 2 | Variant 3 (ixtiyoriy) |
|---|---|---|---|
| `about_disease` | Kasallik haqida ma’lumot | Kasallik haqida qisqacha | Umumiy tavsif |
| `overview` | Umumiy ma’lumotlar | Kasallik bo‘yicha sharh | Asosiy tushunchalar |
| `media` | Suratlar | Tasvir va diagrammalar | Media-galereya |
| `etiology` | Sabablar | Kelib chiqish omillari | Etiologiya |
| `pathogenesis` | Patogenez | Rivojlanish mexanizmi | Kasallik jarayoni |
| `complaints` | Bemor shikoyatlari | Shikoyatlarni o‘rganish | Shikoyatlar |
| `anamnesis` | Anamnez yig‘ish | Anamnez | Kasallik tarixi |
| `labs` | Tahlillar | Laboratoriya tekshiruvlari | Diagnostika testlari |
| `variants` | Kasallik turlari | Variantlari | Shakllari |
| `examination` | Ko‘zdan kechirish | Fizikal tekshiruv | Tibbiy ko‘rik |
| `classification` | Tasnif | Klassifikatsiya | Toifalash |
| `symptoms` | Belgilar | Simptomlar | Kasallik alomatlari |
| `diagnostics` | Diagnostika | Aniqlash usullari | Diagnostika yo‘li |
| `treatment` | Davolash | Terapiya | Davolash yondashuvi |
| `medications` | Dori-darmon bilan davolash | Farmakoterapiya | Medikamentoz davo |
| `prognosis` | Prognoz va profilaktika | Kelajak prognozi | Oqibat va oldini olish |
| `pricing` | O‘rtacha narxlar | Davolash narxi | Xarajatlar |
| `clinics` | Tibbiyot muassasalari | Klinikalar | Davolash joylari |
| `doctor_type` | Qaysi shifokor davolaydi | Mas’ul shifokor | Mutaxassis yo‘nalishi |
| `doctors` | Shifokorlar | Mutaxassislar katalogi | Davolovchi shifokorlar |
| `other_info` | Boshqa ma’lumotlar | Qo‘shimcha faktlar | Qiziqarli ma’lumot |
| `important` | Buni bilish muhim! | Eslatma | Ogohlantirish |
| `features` | Kasallik xususiyatlari | O‘ziga xos jihatlar | Xarakterli belgilar |
| `patho_classification` | Patologiya tasnifi | Morfologik toifa | Klinik klassifikatsiya |
| `stages` | Rivojlanish bosqichlari | Kasallik bosqichlari | Evolyutsiya |
| `clinical` | Klinik ko‘rinish | Klinik manzarasi | Klinika |
| `stage_early` | Dastlabki bosqich | Erta bosqich | Kasallikning boshlanishi |
| `stage_expanded` | Kengaytirilgan bosqich | Rivojlangan bosqich | O‘rta bosqich |
| `stage_late` | Kechki bosqich | Oxirgi bosqich | Kechki bosqich simptomlari |
| `complications` | Asoratlar | Mumkin bo‘lgan oqibatlar | Og‘ir oqibatlar |
| `dx_methods` | Diagnostika usullari | Tekshiruv metodlari | Qanday aniqlanadi |
| `tx_scheme` | Davolash tartibi | Davolash sxemasi | Terapiya rejasi |
| `recommendations` | Qo‘shimcha tavsiyalar | Maslahatlar | Turmush tarziga oid tavsiyalar |
| `prevention` | Profilaktika choralari | Oldini olish tadbirlari | Himoya choralari |
| `donts` | Nimalar mumkin emas! | Taqiqlar | Chetlanish kerak bo‘lgan amallar |
| `dos` | Tavsiya etiladi! | Foydali amallar | Foydali odatlar |
| `prognosis_prevention` | Prognoz. Profilaktika | Kelajak istiqbollari | Oldini olish va prognoz |
| `cases` | Klinik holatlar | Bemorlarga oid misollar | Case reports |

---

## 10. MARKERLI SHABLON TIZIMI ({{…}} TEMPLATING)

### 10.1. Sintaksis

Kontentda `{{marker_name}}` — bu shablon o‘zgaruvchisi; redaksion panel (CMS) tomonidan to‘ldiriladi. Markerlar ikki turda bo‘ladi:

- **Atomar (atomic)** — bir qator matn, raqam, sanani qaytaradi. Masalan: `{{icd10_code}}`, `{{prevalence_global}}`.
- **Blokli (block-level)** — butun bir bo‘limni qaytaradi. Masalan: `{{block:stages}}`, `{{block:symptoms}}`.

Qo‘shimcha modifikatorlar:

- `{{symptom_list | format: chips}}` — ro‘yxatni chip sifatida ko‘rsatish.
- `{{prevalence_uz | fallback: "ma’lumot yo‘q"}}` — fallback qiymati.
- `{{overview | audience: patient}}` — auditoriyaga qarab tanlovchi.
- `{{medications | locale: ru}}` — til.
- `{{labs | visibility: doctor}}` — ko‘rinuvchanlik filteri (faqat shifokor rejimida ko‘rinadi).

### 10.2. Marker manifesti (JSON-sxema)

```json
{
  "id": "pathogenesis",
  "label_uz": "Patogenezi",
  "label_ru": "Патогенез",
  "label_en": "Pathogenesis",
  "synonyms_uz": ["Rivojlanish mexanizmi", "Kasallik jarayoni"],
  "synonyms_ru": ["Механизм развития"],
  "type": "block",
  "required_for_levels": ["L2", "L3"],
  "audience_priority": {
    "patient": 3,
    "student": 1,
    "doctor": 2
  },
  "fields": [
    { "id": "summary", "type": "richtext", "max_chars": 1200 },
    { "id": "mechanism_diagram", "type": "image" },
    { "id": "references", "type": "array<reference>" }
  ]
}
```

### 10.3. Content contract

Har bir marker uchun **“placeholder copy”** (zerikarli bo‘lmasligi uchun taklif matn) va **“example fill”** (to‘ldirilgan misol) majburiy. Redaktor 3 ta sinonim sarlavhadan birini tanlaydi yoki o‘ziniki yozadi — ammo semantik marker (`pathogenesis`) o‘zgarmaydi, faqat display label o‘zgaradi. Bu — SEO, tahlil va ma’lumotni re-use qilish uchun shart.

### 10.4. CMS interfeysi

- Chap panel — marker daraxti (treeview), kasallik shabloni asosida ochiladi.
- O‘ng panel — WYSIWYG + Markdown muharriri; pastda “Klinik dalillar” maydoni (manba URL, DOI, PubMed ID).
- Yuqori panel — “To‘liqlik indikatori” (0–100%), L1/L2/L3 to‘lish progressi.
- Saqlash — “Qoralama / Review / Nashr qilingan” statuslari + tibbiy muharrir (medical editor) tomonidan tasdiqlash kerak.

---

## 11. MA’LUMOTLAR MODELI

### 11.1. Asosiy entitetlar

- `Disease` — kasallik
- `DiseaseTranslation` — kasallik tarjimalari (uz/ru/en)
- `Block` — blok (marker) nusxasi (disease-ga bog‘langan)
- `Symptom` — simptom
- `DiseaseSymptom` — kasallik-simptom bog‘lamasi (vazn, specificity, sensitivity)
- `Classification` — tasnif (WHO/ESC/ACR)
- `Stage` — bosqich
- `LabTest` — tahlil (LOINC bilan bog‘lanadi)
- `DiseaseLabTest` — kasallik uchun taklif qilinadigan tahlillar (priority, window, fasting)
- `Medication` — dori
- `DiseaseMedication` — dori-kasallik bog‘lamasi (dosage, contraindications)
- `Specialty` — mutaxassislik
- `Doctor` — shifokor (tashqi modul bilan tegadi)
- `Facility` — klinika
- `RegionEpidemiology` — mintaqaviy statistika
- `Reference` — manba (DOI/PubMed/WHO URL)
- `ClinicalCase` — klinik holat
- `AITriageSession` — AI Tavsiya seansi
- `SymptomMatch` — bemor kiritgan simptom bilan kasallik simptomini solishtirish natijasi (user-specific)
- `UserNote` — bemor yozgan izoh/belgilashlar
- `Audit` — har qanday kontent o‘zgarishining auditi

### 11.2. Asosiy maydonlar (Disease)

```ts
interface Disease {
  id: string;                 // ULID
  slug: string;               // gipertoniya-i10
  icd10: string;              // "I10"
  icd11?: string;
  names: {
    uz: string;               // "Gipertoniya"
    ru: string;               // "Гипертония"
    en: string;               // "Hypertension"
    latin?: string;
  };
  synonyms: string[];
  icd_group: { code: string; title_uz: string };
  severity_levels: ("mild" | "moderate" | "severe")[];
  protocol_sources: string[]; // "ESC/ESH 2023"
  updated_at: string;
  editor: { id: string; name: string; credentials: string };
  completeness: { L1: number; L2: number; L3: number }; // %
  blocks: Block[];
  symptoms: DiseaseSymptom[];
  labs: DiseaseLabTest[];
  medications: DiseaseMedication[];
  specialties: string[];      // ["kardiolog"]
  epidemiology: RegionEpidemiology[];
  genetics?: { markers: string[]; inheritance?: string };
  blood_group_notes?: string;
  pregnancy_notes?: string;
  pediatric_notes?: string;
  geriatric_notes?: string;
  references: Reference[];
  clinical_cases: ClinicalCase[];
  tags: string[];
}
```

### 11.3. ER-sxema (soddalashtirilgan)

```
Disease 1 ─── * DiseaseSymptom * ─── 1 Symptom
Disease 1 ─── * DiseaseLabTest * ─── 1 LabTest
Disease 1 ─── * DiseaseMedication * ─── 1 Medication
Disease 1 ─── * Block (markerlar bilan)
Disease 1 ─── * ClinicalCase
Disease 1 ─── * Reference
AITriageSession 1 ─── * SymptomMatch * ─── 1 Disease
User 1 ─── * UserNote (belgilashlar, saqlangan holatlar)
```

### 11.4. Saqlash/indekslash

- Asosiy bazasi: Postgres (jsonb `blocks` uchun) + full-text `pg_trgm` + `tsvector` uz/ru/en.
- Search va semantik qidiruv: OpenSearch/Typesense yoki Postgres + pgvector (embedding bilan).
- Fayllar: S3-mos obyekt saqlash (rasm, diagramma, PDF).

### 11.5. Standartlar

- ICD-10/11 kodlash majburiy, LOINC — tahlillar uchun, SNOMED CT — simptom va topilmalar uchun (roadmap), RxNorm/MNN — dori.
- Tashqi hujjat almashinuvi: FHIR R4 `Condition`, `Observation`, `Questionnaire`, `QuestionnaireResponse`.

---

## 12. API SHARTNOMASI (CONTRACT)

REST + JSON; ixtiyoriy GraphQL gateway. Versiyalash: `/api/v1`.

### 12.1. Kasalliklar

- `GET /api/v1/diseases?search=gipert&icd=I10&locale=uz&page=1` — qidiruv
- `GET /api/v1/diseases/{slug}` — karta ma’lumoti (blocks, symptoms va b.)
- `GET /api/v1/diseases/{slug}/blocks/{marker}` — bir blokni olish (lazy-load)
- `GET /api/v1/diseases/{slug}/symptoms` — simptomlar ro‘yxati (weight bilan)
- `GET /api/v1/icd/{code}` — ICD kod bo‘yicha
- `POST /api/v1/triage/{sessionId}/match` — simptomlarni kasallik bilan solishtirish; body: user simptomlari, belgilashlari
- `POST /api/v1/triage/{sessionId}/send-to-doctor` — shifokorga yuborish
- `POST /api/v1/user/notes` — bemor izoh/markeri
- `GET /api/v1/diseases/{slug}/export.pdf` — PDF eksport

### 12.2. Auth & roles

- `patient`, `student`, `nurse`, `doctor`, `specialist`, `editor`, `medical_editor`, `admin`
- JWT (access 15 min) + refresh; admin uchun MFA majburiy.

### 12.3. Response kontrakti (misol)

```json
{
  "id": "01HY...",
  "slug": "gipertoniya-i10",
  "icd10": "I10",
  "names": { "uz": "Gipertoniya", "ru": "Гипертония", "en": "Hypertension" },
  "completeness": { "L1": 100, "L2": 78, "L3": 40 },
  "blocks": [
    {
      "marker": "etiology",
      "label": "Sabablar",
      "audience_priority": { "patient": 1 },
      "content": "…markdown…",
      "last_updated": "2026-04-01"
    }
  ],
  "symptoms": [
    { "id": "sym_headache", "name_uz": "Bosh og‘rig‘i", "weight": 0.82 },
    { "id": "sym_dizziness", "name_uz": "Bosh aylanishi", "weight": 0.74 }
  ]
}
```

### 12.4. Error model

```json
{ "error": { "code": "DISEASE_NOT_FOUND", "message": "…", "traceId": "…" } }
```

---

## 13. AI TAVSIYA MODULI BILAN INTEGRATSIYA

### 13.1. Kontrakt

AI Tavsiya natijasi `AITriageSession` ob’yektini qaytaradi; har bir kasallik uchun `score ∈ [0,1]`, `matched_symptoms[]`, `missing_symptoms[]`. Kasallik kartasiga o‘tilganda:

1. Sessiyadan `userSymptoms[]` olinadi.
2. Karta `diseaseSymptoms[]` bilan solishtiriladi (semantik moslik, sinonim, SNOMED CT bo‘yicha).
3. **Top banner** chiqadi: «Siz kiritgan 6 ta simptomdan 4 tasi ushbu kasallik simptomlariga mos keladi. Mos kelmaydigan 2 ta simptom ham boshqa kasallikda uchrashi mumkin.»

### 13.2. Simptom taqqoslash UX-i

- Har bir kasallik simptomi ro‘yxati (top 20 weight-ranked) ko‘rsatiladi.
- Har bir qatorda 4 ta tanlov chipi: «Ha, bor», «Yo‘q», «Bilmayman», «Ba’zan».
- Rang: yashil (mos), kulrang (yo‘q), sariq (bilmayman), havorang (ba’zan).
- Pastda **«Yakunlangan moslik»** — real vaqtda foiz (matching score).
- CTA: «Shifokorga yuborish», «Saqlash», «PDF».

### 13.3. Natija shifokorga yetkazilishi

- `QuestionnaireResponse` (FHIR) tuzilmasida yuboriladi (strukturaviy, keyin tahlil qilish osonroq).
- Shifokor panelida ikkita blok:
  1. AI xulosasi (top-5 kasallik, ehtimolliklar).
  2. Bemor tomonidan tasdiqlangan simptomlar (yashil) + rad etilgan (kulrang) + noaniq (sariq).

### 13.4. Learning loop

- Har bir shifokor qarori (tasdiqladi / rad qildi) — model uchun labelled signal.
- Noto‘g‘ri moslik (false positive) uchun redaktorga flag.

---

## 14. UI/UX TALABLARI (web + mobile)

### 14.1. Umumiy printsiplar

- **Mobile-first**. Kontent 1 ta ustunda, widgetlar collapsable.
- **Information density**: bemor rejimida kam, shifokor rejimida yuqori.
- **Progressive disclosure**: L1 darhol ko‘rinadi, L2/L3 “Ko‘proq o‘qish” tugmasi ortida.
- **Yengil to‘lqin (reading rhythm)**: har 2–3 paragrafda call-out, chip, icon.
- **Accessibility (a11y)**: WCAG 2.1 AA; shriftlar 16+ px, kontrast 4.5:1, tabindex izchil, screen reader uchun landmark (`<main>`, `<nav>`, `<aside>`), alt text barcha rasmlarga.

### 14.2. Asosiy ekranlar

1. **Karta bosh sahifasi** (hero)
   - Yuqorida: kasallik nomi, ICD-10 chip, sinonimlar, auditoriya switcher («Bemor | Talaba | Shifokor»).
   - Tab tuzilishi: Umumiy | Diagnostika | Davolash | Bosqichlar | Asoratlar | Bemorga maslahat | FAQ | Manbalar.
   - Sidebar (desktop): sahifa ichida tezkor navigatsiya (anchor menu), to‘liqlik progressi.
2. **Simptom taqqoslash oynasi** — 14.3 bo‘limi.
3. **Bosqichlar wizard** — gorizontal stepper (Dastlabki → Kengaytirilgan → Kechki) har bosqich uchun quyidagi ma’lumot: xarakterli belgilar, maslahat, rasm.
4. **Dori-darmon jadvali** — tartib: INN nomi, brend, doza, shakli, kontr-indikatsiyalar, o‘zaro ta’sir, manba. Filter: hamshira / shifokor rejimi.
5. **Klinik holatlar** — card layout (asosiy shikoyat, yosh, jins, diagnoz, davolash, natija).
6. **Manbalar** — strukturali, APA/Vancouver uslubi + DOI link.

### 14.3. Simptom taqqoslash oynasi (muhim!)

- **Yo‘l**: kartaning yuqori qismida “Meni tekshirib ko‘ring” CTA → panel pastdan chiqadi (bottom sheet mobilda, side drawer desktopda).
- **Mundarija**:
  1. «Siz kiritgan simptomlar» — ro‘yxat (disabled chip, tick bilan).
  2. «Ushbu kasallikda odatda uchraydigan simptomlar» — interaktiv ro‘yxat (Ha/Yo‘q/Bilmayman/Ba’zan).
  3. «Keltirib chiqaruvchi omillar» — interaktiv (stress, dorilar, parhez).
  4. «Progressiv belgilar» — kasallik bosqichiga bog‘liq (dinamik).
- **Pastda**:
  - Umumiy moslik: `78% (15/20 belgi mos)`.
  - Diff: qaysilari mos, qaysilari mos emas, qaysilari aniq emas.
  - CTA: `Saqlash`, `Shifokorga yuborish`, `PDF`, `Yangi kasallik bilan solishtir`.

### 14.4. Dizayn tokenlari

- Rang palitrasi:
  - Primary: #2E75B6 (ishonchli tibbiy ko‘k)
  - Secondary: #8E6AC7 (akademik binafsha)
  - Accent: #C94F4F (xavf/muhim) — faqat «Buni bilish muhim» va «Nimalar mumkin emas» bloklarida
  - Success: #3FA06E; Warn: #E1A94A
  - Surface: #F7F8FA; Ink: #1C1F26; Muted: #6B7280
- Shrift: Inter (UI), Noto Serif (uzun matn kontent, chuqur o‘qish uchun ixtiyoriy).
- Radius: 12px default; chip 999px.
- Shadow: elevation-1 (soft), elevation-2 (modal).

### 14.5. Mobile spec (MedSmart-Pro mobil ilovasi)

- Bottom sheet **“Simptom taqqoslash”**.
- Swipe navigation bosqichlar bo‘ylab.
- Offline rejim — oxirgi 5 ta ochilgan karta keshlanadi (service worker, SW cache).
- Push: «Simptomlaringizni yangiladingizmi? Natija yangilansinmi?» (eslatma).

### 14.6. Web spec

- SSR + ISR Next.js; har bir karta URL: `/diseases/{slug}`.
- Open Graph + Schema.org `MedicalCondition` mikromarkup (SEO + google rich results).

### 14.7. A11y qisqacha chek-list

- Keyboard navigatsiya (Tab/Shift+Tab, Space/Enter, Escape modallar uchun).
- Kontrast 4.5:1 minimum.
- ARIA roli: tablist, tab, tabpanel; dialog (modal); list/listitem.
- Simptom chiplari uchun `role="radiogroup"` va aria-label.
- Motion-reduce rejim.

---

## 15. DIZAYN TIZIMI INTEGRATSIYASI

- **Komponentlar**: `Chip`, `Callout`, `CollapsibleSection`, `Stepper`, `DataTable`, `ReferenceList`, `AudienceSwitcher`, `CompletenessBar`, `SymptomMatcher`, `MedicationTable`, `CaseCard`.
- **Dokumentatsiya**: Storybook; har bir komponent uchun variantlar (bemor/shifokor), holatlar (default, hover, active, disabled, error), a11y izohlari.
- **Tokenlar**: Figma variables + kod (CSS variables / Tailwind `theme.extend`).

---

## 16. KONTENTNI YARATISH VA MODERATSIYA (EDITORIAL PIPELINE)

1. **Bootstrap** — WHO ICD-10 ro‘yxati asosida 1000+ `Disease` shablonlar yaratiladi (skeleton).
2. **Seed** — har bir kasallik uchun `about_disease`, `overview`, `symptoms`, `dx_methods`, `treatment`, `prevention` — L1 darajasida.
3. **Deepen** — klinik protokollar, patogenez, klinik holatlar qo‘shiladi (L2/L3).
4. **Peer review** — tibbiy muharrir (medical editor) + tor mutaxassis imzosi.
5. **Publish** — `status = published`, audit log yozadi.
6. **Lifecycle** — har 12 oyda qayta ko‘rib chiqish majburiy, protokol yangilanganda push.

Rollar:

- **Content writer (tibbiy yozuvchi)** — drafts yozadi.
- **Medical editor** — klinik aniqlikni tekshiradi, manbalar bilan solishtiradi.
- **Clinical board** — 6 oyda bir marta sertifikatlash (auditoriya uchun «Tasdiqlangan» badge).

---

## 17. SIFAT, XAVFSIZLIK, COMPLIANCE VA ETIKA

### 17.1. Klinik xavfsizlik

- **Medical disclaimer** — har bir kartada ko‘rinuvchi (“bu tibbiy tashxis emas, shifokor bilan maslahatlashing”).
- **Emergency flag** — ba’zi kasalliklar (miokard infarkti, ishemik insult, anafilaksiya) uchun avtomatik qizil banner: «103 ga zudlik bilan qo‘ng‘iroq qiling».
- Har bir tavsiya/dori doza ko‘rsatkichi **manba bilan** va «sozlangan shifokor nazoratisiz qabul qilmang» ogohlantirishi bilan.

### 17.2. Ma’lumot maxfiyligi

- O‘zbekiston Respublikasi «Shaxsiy ma’lumotlar to‘g‘risida»gi qonun talablariga muvofiq.
- Halqaro: GDPR, HIPAA-ga moslashish (uzoq muddatli).
- Shifokorga yuborilgan har bir simptom tasdiqlangan — log saqlanadi, bemor hisobidagi data `delete on request` qilinadi.
- Shifrlash: at-rest (AES-256), in-transit (TLS 1.2+).

### 17.3. Audit va ishonchlilik

- Barcha kontent o‘zgarishlari audit log, `editor_id`, sana, diff.
- «Klinik dalillar» jadvali (evidence grade: A/B/C).
- Disclaimer: “Ushbu ma’lumotnoma — ma’lumot berish maqsadidadir; tashxis va davolash shifokor tomonidan belgilanadi.”

---

## 18. NON-FUNCTIONAL TALABLAR

- **Performance**: TTFB ≤ 300ms (p95), LCP ≤ 2.5s mobil, CLS < 0.1.
- **SEO**: schema.org `MedicalCondition`, hreflang `uz/ru/en`, sitemap, canonical.
- **SLO**: 99.9% availability; RTO 1 soat, RPO 15 daqiqa.
- **I18n**: uz (asosiy), ru, en; til almashinuvi URL prefiksi bilan: `/uz/…`, `/ru/…`, `/en/…`.
- **Accessibility**: WCAG 2.1 AA.
- **Observability**: OpenTelemetry; Sentry + Grafana.
- **Load**: 500 RPS peak; karta yuklanish 2KB+gzipped markdown; rasmlar WebP/AVIF + lazyload.

---

## 19. ANALITIKA VA TELEMETRIYA

Hodisa modeli (event dictionary):

- `disease_card_opened` — slug, source (triage/search/chat), audience_mode.
- `symptom_match_opened`
- `symptom_answered` — symptom_id, answer (`yes/no/unknown/sometimes`).
- `symptom_match_completed` — match_score.
- `send_to_doctor_clicked` — disease_id, score.
- `pdf_export`
- `feedback_content` — rating 1–5, comment.

Dashboardlar: Product (Mixpanel/PostHog), Klinik aniqlik (redaksion), Performance (Grafana).

---

## 20. ROADMAP (4 fazali)

### Faza 0 — Discovery (2 hafta)

- Bozor va raqib tahlili (MSD, Medscape, UpToDate, PROBOLEZN, KRASOTAIMEDICINA).
- Uzb epidemiologiya ma’lumotlari (Sog‘liqni saqlash vazirligi statistikasi).
- UX research: 8 bemor + 4 talaba + 6 shifokor + 2 mutaxassis intervyusi.

### Faza 1 — MVP (6 hafta)

- Ma’lumot modeli, CMS, marker tizimi, 50 ta kasallik (L1), karta web sahifasi, ICD-10 qidiruv.
- AI Tavsiya → karta deep-link.

### Faza 2 — Symptom match + Shifokor paneliga yuborish (6 hafta)

- Simptom taqqoslash oynasi, FHIR QuestionnaireResponse eksporti, shifokor panelida ko‘rinishi.
- 150 ta kasallik (L1 + qisman L2).

### Faza 3 — Chuqurlashtirish (12 hafta)

- L2/L3 kontenti, klinik holatlar, dori-darmon o‘zaro ta’siri, mintaqaviy statistika, klinik holatlar.
- Mobil ilova kengaytmasi (offline kesh, push).
- SEO va ko‘p tilli.
- Birinchi Klinik Kengash auditi.

### Faza 4 — Ekosistema (doimiy)

- EHR bilan integratsiya, sug‘urta modullari, MedRAG (RAG chatbot) foydalanadi, WHO va EULAR protokollariga podpiska.

---

## 21. QABUL QILISH MEZONLARI (Acceptance Criteria) VA DoD

- Har bir kasallik kartasi minimum L1 to‘liqligi 100%, manbalar soni ≥ 3.
- Simptom taqqoslash UX-da 4 ta javob tanlovi ishlaydi, natija real-time yangilanadi.
- Yuklanish vaqti (p95 mobil 4G) ≤ 1.5s.
- A11y audit ≥ 95 (Lighthouse, axe-core).
- Medical editor imzosi bilan `published` statusidan boshqa statuslar yakuniy foydalanuvchilarga ko‘rinmaydi.
- ICD-10 qidiruv, sinonim qidiruv, AI Tavsiya deep-link ishlaydi.
- QA: smoke + regression test suite (Playwright) ≥ 90% happy path qamrab olingan.

---

## 22. XAVF REGISTRI

| ID | Xavf | Ehtimollik | Ta’sir | Harakat |
|---|---|---|---|---|
| R1 | Kontent xatosi (klinik noto‘g‘rilik) | O‘rta | Yuqori | Peer review, medical editor, clinical board |
| R2 | Ma’lumotlar maxfiyligi buzilishi | Past | Juda yuqori | Shifrlash, audit, role-based access |
| R3 | Performance (katta bloklar) | O‘rta | O‘rta | Lazy load, CDN, content chunking |
| R4 | AI Tavsiya noto‘g‘ri moslik beradi | O‘rta | Yuqori | Disclaimer, shifokor tasdig‘i, learning loop |
| R5 | ICD-10 yangilanishi | Past | O‘rta | Yillik sinxronizatsiya, WHO release tracker |
| R6 | Kam tilli / regional tarjima bo‘shligi | Yuqori | O‘rta | Til prioriteti; AI-assisted tarjima + inson muharriri |
| R7 | Yuridik javobgarlik (tavsiya) | Past | Yuqori | Disclaimer + «shifokor tavsiyasi emas» siyosati |

---

## 23. ILOVA A — «BEXTEREV KASALLIGI (ANKILOZLOVCHI SPONDILOARTRIT)» — TO‘LDIRILGAN KARTA NAMUNASI

> Ushbu namuna barcha markerlar qanday to‘ldirilishini va 2–3 sinonim sarlavha variantidan qaysi birini tanlash mumkinligini ko‘rsatish uchun xizmat qiladi. Matnlar qisqartirilgan (placeholder).

**MKB-10 paneli**: M45 — Ankiloziruyushchiy spondilit (Bechterew–Strümpell–Marie disease).

### Kasallik haqida ma’lumot (Kasallik haqida qisqacha / Umumiy tavsif)

Bexterev kasalligi — umurtqa pog‘onasining surunkali yallig‘lanishi bo‘lib, vaqt o‘tishi bilan umurtqa bo‘g‘imlari qotib, harakatchanligini yo‘qotadi. Asosan 15–40 yoshdagi erkaklarda uchraydi. HLA-B27 geni bilan mustahkam bog‘liq.

### Umumiy ma’lumotlar (Kasallik bo‘yicha sharh)

- Klassifikatsiya: spondiloartritlar guruhi.
- Tarqalganligi: jahon bo‘yicha 0.1–1.4%; O‘zbekistonda ko‘rsatkich taxminan {{prevalence_uz | fallback: "ma’lumot yetarli emas"}}.
- Jins nisbati: 2–3 E : 1 A.

### Suratlar (Tasvir va diagrammalar)

Rentgen manzarasi: “bambuk tayoqcha” shaklidagi umurtqa; MRT T2-STIR da sakroiliit.

### Sabablar (Kelib chiqish omillari / Etiologiya)

Genetik moyillik: **HLA-B27** musbat — 80–90%. Tetiklovchilar: ichak infeksiyalari (Klebsiella), travma, stress; jinsiy gormonal omillar muhokama qilinmoqda.

### Patogenezi (Rivojlanish mexanizmi)

Autoimmun yallig‘lanish → sakroiliak bo‘g‘imlarida enthesitis → suyak eroziyasi → sindesmofitlar → ankiloz. IL-17/IL-23 yo‘li markaziy o‘rin tutadi.

### Bemor shikoyatlarini o‘rganish (Shikoyatlar)

Surunkali bel og‘rig‘i (> 3 oy), ertalabki qotishlik > 30 daqiqa, kechasi uyg‘onish, faollikda yengillashish, damda kuchayish.

### Anamnez yig‘ish (Kasallik tarixi)

Oilaviy anamnez: qarindoshlarda AS/psoriaz/psoriatik artrit/IBD bormi? Travmalar, oldingi infeksiyalar, ko‘z muammolari (uveit).

### Bexterev kasalligidagi tahlillar (Laboratoriya tekshiruvlari / Diagnostika testlari)

- Umumiy qon tahlili (ESR↑, CRP↑).
- HLA-B27 genotiplash.
- RF, ACPA (asosan manfiy — differensial uchun).
- HLA-B27+ bo‘lsa, diagnostika ishonchi oshadi, ammo yagona mezon emas.
- Instrumental: sakroiliak MRT (T1, STIR), umurtqa rentgeni, oldingi yo‘naltirishda entezit USI.

### Kasallik turlari (Variantlari / Shakllari)

Markaziy (faqat umurtqa), rizomeliy (yirik proksimal bo‘g‘imlar), periferik, skandinav (kichik bo‘g‘imlar), visseral.

### Ko‘zdan kechirish (Fizikal tekshiruv / Tibbiy ko‘rik)

Schober testi, ko‘krak kengayishi, Tragus-devor masofasi, Menell, Kushelevskiy, FABER testlari.

### Tasniflash (Klassifikatsiya / Toifalash)

ASAS mezonlari (2009) — axial / peripheral; modified New York kriteriylari (1984) — rentgenologik.

### Bexterev kasalligi belgilari (Simptomlar / Kasallik alomatlari)

Bel og‘rig‘i, ertalabki qotishlik, kifoz rivojlanishi, ko‘krak qafasi kengayishining pasayishi, kechki uyg‘onish, uveit, entezitlar (Axill paychasi), qorin mushaklari qattiqlashishi.

### Diagnostika (Aniqlash usullari)

ASAS/modified NY kriteriylari + klinik + HLA-B27 + MRT; BASDAI ≥ 4 — faollik belgisi.

### Bexterev kasalligini davolash (Terapiya)

NSAIDs birinchi qator → sulfasalazin periferik shaklda → biologik terapiya (anti-TNF: adalimumab, infliksimab, etanertsept; anti-IL-17: sekukinumab, ixekizumab). Fizioterapiya va fizik mashg‘ulot obligat.

### Dori-darmonlar bilan davolash (Farmakoterapiya / Medikamentoz davo)

| Guruh | Misol | Doza (o‘rtacha) | Eslatma |
|---|---|---|---|
| NSAID | Naproksen | 500 mg 2 mahal | gastroprotektsiya |
| DMARD | Sulfasalazin | 2–3 g/kun | periferik shakl uchun |
| Anti-TNF | Adalimumab | 40 mg 2 haftada s/c | latent TB skrining |
| Anti-IL-17 | Sekukinumab | 150 mg/oy | psoriazli bemorlarga qulay |

### Prognoz va profilaktika (Kelajak prognozi)

Erta diagnoz va biologik terapiya — prognozni yaxshilaydi. Kifoz va respirator muammolar — yondosh patologiya.

### O‘rtacha davolanish narxlari (Xarajatlar)

Biologik terapiya oylik taxminiy narxi: {{price_biologic_monthly | fallback: "ma’lumot yangilangan"}}.

### Davolaydigan muassasalar, shifokorlar — dynamic (Facility/Doctor modulidan).

### Bexterev kasalligini qaysi shifokor davolaydi? — Revmatolog (asosiy), oftalmolog (uveit), reabilitolog, ba’zida jarroh.

### Dastlabki bosqich simptomlari

Bel va yonbosh sohasidagi og‘riq, ertalabki qotishlik, kichik uveit epizodlari.

### Kengaytirilgan bosqich

Harakat chegarasining pasayishi, sindesmofitlar, ko‘krak qafasi kengayishining kamayishi.

### Kechki bosqich (Oxirgi bosqich / Kechki bosqich simptomlari)

Umurtqa “bambuk tayoqcha” ko‘rinishi, kifoz, yurak-qon tomir asoratlari (aort yetishmovchiligi), o‘pka cheklanishi.

### Mumkin bo‘lgan asoratlar

Uveit, aort yetishmovchiligi, amiloidoz, osteoporoz singan, yurak blokadasi, restriktiv o‘pka.

### Nimalar mumkin emas!

- Uzoq muddat bir xil holatda yotish.
- O‘zboshimchalik bilan NSAID dozasini oshirish.
- Chekish — progressiyani tezlashtiradi.

### Tavsiya etiladi!

- Kundalik mashq (kengaytirish, chuqur nafas).
- Pravilnaya ish joyi ergonomikasi, qattiq to‘shak.
- Reabilitolog nazorati, yiliga 1–2 marta yondosh skrining.

### Klinik holatlar

- Holat 1: 28 yoshli E, 6 oy bel og‘rig‘i, HLA-B27+, MRT: sakroiliit → adalimumab bilan 6 oyda BASDAI 6→2.
- Holat 2: 42 yoshli A, uveit + yonbosh og‘rig‘i, erta diagnoz → sulfasalazin + NSAID.

### Olimlar va tarix

Vladimir Bechterev (Russia, 1892), Adolph Strümpell (Germany, 1884), Pierre Marie (France, 1898) — klinik tasvir. Zamonaviy: ASAS konsensusi (2009).

---

## 24. ILOVA B — JSON SXEMA (Disease)

```json
{
  "$id": "https://medsmart-pro/schemas/disease.json",
  "title": "Disease",
  "type": "object",
  "required": ["id", "slug", "icd10", "names", "blocks"],
  "properties": {
    "id": { "type": "string" },
    "slug": { "type": "string" },
    "icd10": { "type": "string", "pattern": "^[A-TV-Z][0-9][0-9AB]\\.?[0-9A-Z]?$" },
    "icd11": { "type": "string" },
    "names": {
      "type": "object",
      "properties": {
        "uz": { "type": "string" },
        "ru": { "type": "string" },
        "en": { "type": "string" },
        "latin": { "type": "string" }
      },
      "required": ["uz", "ru", "en"]
    },
    "synonyms": { "type": "array", "items": { "type": "string" } },
    "completeness": {
      "type": "object",
      "properties": {
        "L1": { "type": "number", "minimum": 0, "maximum": 100 },
        "L2": { "type": "number", "minimum": 0, "maximum": 100 },
        "L3": { "type": "number", "minimum": 0, "maximum": 100 }
      }
    },
    "blocks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["marker", "label", "content"],
        "properties": {
          "marker": { "type": "string" },
          "label": { "type": "string" },
          "level": { "enum": ["L1", "L2", "L3"] },
          "audience_priority": {
            "type": "object",
            "properties": {
              "patient": { "type": "integer" },
              "student": { "type": "integer" },
              "nurse": { "type": "integer" },
              "doctor": { "type": "integer" },
              "specialist": { "type": "integer" }
            }
          },
          "content": { "type": "string" },
          "last_updated": { "type": "string", "format": "date" }
        }
      }
    }
  }
}
```

---

## 25. ILOVA C — KONTENT SIFATI CHEKLISTI (redaktor uchun)

- [ ] Har bir da’vo manba bilan qo‘llab-quvvatlangan (DOI/PubMed/WHO).
- [ ] Doza va retsept ma’lumoti mintaqaviy normalarga mos.
- [ ] Disclaimer va emergency banner (agar kerak bo‘lsa) mavjud.
- [ ] Atamalar — SNOMED/ICD/LOINC bilan moslashtirilgan.
- [ ] Bo‘limlar orasidagi ma’lumot dubl qilinmagan, ichki havolalar to‘g‘ri.
- [ ] Tarjima (uz/ru/en) yoki mavjud, yoki “tarjima kutilmoqda” deb belgilangan.
- [ ] Rasmlarda alt-text, diagramma manbasi, litsenziya ko‘rsatilgan.
- [ ] A11y: sarlavha ierarxiyasi to‘g‘ri (H1 → H2 → H3), `tabindex` o‘zgartirilmagan.

---

## 26. YAKUNIY SO‘Z

Ushbu modul — MedSmart-Pro platformasining markaziy bilim bazasidir. U AI Tavsiya bilan qo‘shilib, bemorga shifokorga qadar strukturaviy ma’lumot to‘plashga yordam beradi, shifokorga esa qaror qabul qilishni tezlashtiradi, talaba va mutaxassis uchun ta’limiy va ilmiy baza bo‘ladi. To‘g‘ri amalga oshirilsa, bu o‘z-o‘zidan reusable (boshqa modullarda qayta ishlatiladigan) va kengayadigan “living reference” bo‘ladi — platforma qiymatining asosiy ustunlaridan biri.

— Hujjat versiyasi 1.0 — v.d. 2026-04-17 —
