

TEXNIK TOPSHIRIQ (TT)
Telegram Mini App
«Masofaviy Radiologik Konsultatsiya Platformasi»
Versiya:	1.0
Holat:	Loyiha
Platforma:	Telegram Mini App (WebApp API)
Buyurtmachi:	Radiolog mutaxassis (20 yillik tajriba)
Xizmat turi:	MRT, MSKT, Rentgen — DICOM formatida masofaviy tashxis
Til:	O'zbekcha (asosiy), Ruscha (qo'shimcha)
Qonunchilik:	O'zbekiston Respublikasi, Telemedisin nizomi 2021
Sana:	09/03/2026


0. UMUMIY TUSHUNCHA VA MAQSAD
0.1. Loyiha maqsadi
Radiolog mutaxassis (Ijrochi) bilan bemor (Mijoz) o'rtasida Telegram Mini App orqali masofaviy radiologik konsultatsiya xizmatini avtomatlashtirish: bemor ma'lumotlari kiritish → DICOM tasvirlar yuklash → shartnoma → to'lov → radiolog xulosasi → bemorga yetkazish.

0.2. Aktorlar (Foydalanuvchilar)
👤 BEMOR	Xizmatga murojaat qiluvchi, ma'lumot va tasvir yuboruvchi, to'lov amalga oshiruvchi
👨‍⚕️ RADIOLOG	Tasvirlarni ko'rib chiquvchi, xulosa yozuvchi va tasdiqluvchi (asosiy ijrochi)
🤖 AI TIZIM	Dastlabki avtomatik tasvir tahlili, radiologga yordamchi xulosani tayyorlovchi
👨‍💼 OPERATOR	Noto'liq ma'lumotlarni aniqlovchi, bemorga qayta murojaat qiluvchi (admin)
💰 KASSIR/ADMIN	To'lovlar nazorati, hisobotlar, arxiv boshqaruvi

0.3. Asosiy jarayon xaritasi (yuqori daraja)
BEMOR tomoni:  Ro'yxat → Rol → Analiz/Tasvir → Shikoyat → Xizmat tanlash → Muhimlik → Verifikatsiya → Shartnoma → To'lov → Kutish → Xulosa olish
TIZIM tomoni:  Ariza qabul → AI tahlil → Radiologga yuborish → Xulosa tasdiqlash → Bemorga yuborish → Arxivlash

1. TEXNIK TALABLAR VA ARXITEKTURA
1.1. Frontend (Mini App)
•	Telegram WebApp API (telegram.org/js/telegram-web-app.js)
•	React 18 + TypeScript
•	Telegram UI Kit (twa-dev/twa-ui-kit) — native Telegram dizayn
•	Ohm.io yoki Cornerstone.js — DICOM viewer (brauzerda ko'rish)
•	i18n — O'zbekcha/Ruscha

1.2. Backend
•	Node.js + Express yoki FastAPI (Python)
•	PostgreSQL — asosiy ma'lumotlar bazasi
•	Redis — sessiya, queue boshqaruvi
•	BullMQ — asinxron vazifalar (AI tahlil, xabarnomalar)
•	JWT — autentifikatsiya
•	Telegram Bot API — xabarnomalar va fayl almashish

1.3. Fayllar saqlash
•	DICOM fayllar:  Backblaze B2 yoki AWS S3 — shifrlangan (AES-256)
•	PDF xulosalar:  Xuddi shu object storage
•	Maksimal fayl hajmi:  1 ta DICOM seriya — 500MB gacha
•	Muddati:  5 yil (tibbiy arxiv talabi)

1.4. To'lov tizimlari
Payme	Asosiy. API integratsiya. YaTT/MChJ litsenziyasi bilan. Komissiya 1.5%
Click	Qo'shimcha. API mavjud. Komissiya 1%
Uzum Merchants	Ixtiyoriy. Komissiya 2%
Webhook	To'lov tasdiqlanishi webhook orqali real-vaqtda qayta ishlanadi

1.5. AI Integratsiya
•	Provider:  OpenAI GPT-4 Vision yoki Google Gemini Pro Vision (DICOM → JPG konvertatsiyadan keyin)
•	Maqsad:  Radiologga dastlabki tahlil (xulosa emas, yordam materiali)
•	Chiqish:  Strukturlangan JSON: {anomalies: [], regions: [], confidence: float, notes: ''}
⚠️  AI xulosasi faqat radiologga ko'rsatiladi. Bemorga to'g'ridan-to'g'ri yuborilmaydi.

1.6. Xavfsizlik
•	HTTPS + TLS 1.3 barcha aloqalar uchun
•	DICOM fayllar end-to-end shifrlangan saqlangan
•	Telegram initData verifikatsiyasi har so'rovda
•	Rate limiting: 1 arizadan 1 bemor 10 daqiqada
•	PDPL 2019 — shaxsiy ma'lumotlar O'zbekiston serverda (yoki Yevropa GDPR serverda)

2. EKRANLAR VA JARAYONLAR (TO'LIQ)
Belgilar:  🔵 Maydon  |  🟢 Tugma  |  🔶 Logika/shart  |  📤 Yuborish  |  📥 Qabul

BLOK A — RO'YXAT VA AUTENTIFIKATSIYA

EKRAN A-1: BOSHLASH / SPLASH   [BEMOR]
Tavsif:	Bot /start buyrug'i berilganda Mini App avtomatik ochiladi. Foydalanuvchi Telegram identifikatsiyasidan o'tadi.
Maydonlar:	•	🔵 Telegram avatar (avtomatik)
•	🔵 Telegram ismi (avtomatik)
•	🔵 Telegram user_id (backend saqlanadi, ko'rsatilmaydi)
Tugmalar:	

Logika:	•	🔶 Telegram initData tekshiriladi → noto'g'ri bo'lsa xato ko'rsatiladi
•	🔶 Foydalanuvchi avval ro'yxatdan o'tganmi? → Ha: A-3 ga o'tadi, Yo'q: A-2 ga o'tadi
•	🔶 Tizim user_id, username, til backendga POST yuboradi
Keyingisi:	→ A-2 (yangi foydalanuvchi) yoki B-1 (qaytuvchi bemor)

EKRAN A-2: ROL TANLASH   [BEMOR / RADIOLOG / OPERATOR]
Tavsif:	Foydalanuvchi sistemaga qanday rolda kirishini tanlaydi. Har bir rol uchun alohida interfeys ochiladi.
Maydonlar:	•	🔵 Ro'l kartalari (katta tugmalar ko'rinishida)
Tugmalar:	


Logika:	•	🔶 Radiolog va Operator roli tanlanganda → maxsus 6-xonali PIN kod kiritish oynasi chiqadi
•	🔶 PIN xato bo'lsa: 3 urinish, keyin 10 daqiqa bloklanadi
•	🔶 Rol tanlash faqat birinchi marta. Keyingi kirishlarda avtomatik aniqlanadi
Keyingisi:	→ A-3 (Bemor) yoki R-1 (Radiolog paneli) yoki O-1 (Operator paneli)

EKRAN A-3: BEMOR PROFILI TO'LDIRISH   [BEMOR]
Tavsif:	Yangi bemor shaxsiy ma'lumotlarini kiritadi. Bir martalik to'ldirish, keyingi arizalarda avtomatik to'ldiriladi.
Maydonlar:	•	🔵 To'liq ism (matn, majburiy)
•	🔵 Tug'ilgan sana (sana tanlovchi, majburiy)
•	🔵 Jinsi (Radio tugma: Erkak / Ayol)
•	🔵 Telefon raqam (+998 formati, majburiy)
•	🔵 Manzil / Shahar (matn, ixtiyoriy)
•	🔵 Avvalgi kasalliklar / surunkali kasalliklar (matn, ixtiyoriy)
Tugmalar:	

Logika:	•	🔶 Telefon raqam formati: +998 XX XXX XX XX — regex tekshiruv
•	🔶 Barcha majburiy maydonlar to'ldirilmasa — qizil xato ko'rsatiladi
•	🔶 Ma'lumotlar backend/DB ga saqlanadi, Telegram user_id bilan bog'lanadi
•	🔶 Muvaffaqiyatli saqlangach: ✅ animatsiya → B-1 ga o'tadi
Keyingisi:	→ B-1 (Analiz turini yuklash)

BLOK B — ARIZA YARATISH

EKRAN B-1: ANALIZ TURINI TANLASH VA FAYLLAR YUKLASH   [BEMOR]
Tavsif:	Bemor qanday tasvir turini yuborayotganini tanlaydi va fayllarni yuklaydi. Bu ekran ariza yaratishning asosi.
Maydonlar:	•	🔵 Tasvir turi (chip/badge tanlash, majburiy):
•	     • MRT (Magnit-rezonans tomografiya)
•	     • MSKT (Multisrезli kompyuter tomografiya)
•	     • Rentgen (X-Ray)
•	     • Ultratovush (USG)
•	     • Boshqa (matn kiritish maydoni chiqadi)
•	🔵 Tekshirilgan organ/soha (dropdown yoki chip): Bosh, Bo'yin, Ko'krak qafasi, Qorin bo'shlig'i, Umurtqa pog'onasi, Oyoq-qo'l, Boshqa
•	🔵 Tasvirlar yuklash (fayl yuklash tugmasi)
•	     • DICOM (.dcm, .zip arxiv)
•	     • Rasm (.jpg, .png)
•	     • PDF
•	🔵 Tasvir olindi sanasi (sana tanlovchi)
•	🔵 Qaysi muassasada olingan (matn, ixtiyoriy)
Tugmalar:	



Logika:	•	🔶 Fayl yuklanmoqda: progress bar ko'rsatiladi (% hisobida)
•	🔶 DICOM fayl bo'lsa: mini preview (birinchi slice ko'rsatiladi)
•	🔶 Maksimal 500 MB, minimal 1 fayl — bo'lmasa davom etish bloklanadi
•	🔶 Noto'g'ri format bo'lsa: toast xabar 'Qabul qilinmaydigan format'
•	🔶 Muvaffaqiyatli yuklangach: fayl nomi, hajmi, ✅ belgisi ko'rsatiladi
•	🔶 Qo'shimcha fayl qo'shish tugmasi: '+ Yana fayl qo'shish'
•	🔶 Backend: fayl S3/B2 ga yuklangan, vaqtinchalik URL saqlanadi
Keyingisi:	→ B-2 (Shikoyatlar va anamnez)

EKRAN B-2: SHIKOYATLAR VA ANAMNEZ TO'LDIRISH   [BEMOR]
Tavsif:	Bemor asosiy shikoyatlarini, simptomlarni va tibbiy tarixini yozadi. Radiolog uchun muhim klinik kontekst.
Maydonlar:	•	🔵 Asosiy shikoyat (matn, majburiy, min 20 belgi)
•	🔵 Qachondan beri (dropdown: 1 kun, Bir hafta, 1 oy, 3 oy, Yildan ko'p)
•	🔵 Og'riq bormi? (Radio: Ha / Yo'q) → Ha bo'lsa: og'riq intensivligi 1-10 (slider)
•	🔵 Avval shu soha bo'yicha muolaja bo'lganmi? (Radio: Ha / Yo'q) → Ha bo'lsa: matn maydoni
•	🔵 Qabul qilinayotgan dorilar (matn, ixtiyoriy)
•	🔵 Allergiya (matn, ixtiyoriy)
•	🔵 Qo'shimcha ma'lumot (matn, ixtiyoriy, 500 belgigacha)
Tugmalar:	

Logika:	•	🔶 Asosiy shikoyat maydoni bo'sh bo'lsa — tugma bosilmaydi
•	🔶 Og'riq slider: 1 (kam) dan 10 (o'ta kuchli) gacha, vizual rang o'zgaradi
•	🔶 Ma'lumotlar real vaqtda draft sifatida saqlanadi (localStorage + backend)
•	🔶 Foydalanuvchi Mini Appni yopsa — qaytganda draft saqlanib qolgan bo'ladi
Keyingisi:	→ B-3 (Xizmat tanlash)

EKRAN B-3: XIZMAT TURINI VA MUHIMLIKNI TANLASH   [BEMOR]
Tavsif:	Bemor qaysi xizmat turini va konsultatsiya muhimlik darajasini tanlaydi. Bu narxga ta'sir qiladi.
Maydonlar:	•	🔵 Xizmat turi (katta karta ko'rinishi):
•	     • 🤖 AI + Radiolog xulosasi (Tavsiya — narx: XXX so'm)
•	     • 👨‍⚕️ Faqat Radiolog xulosasi (narx: XXX so'm)
•	     • 👥 Radiolog + Mutaxassis konsultatsiyasi (narx: XXX so'm)
•	🔵 Muhimlik darajasi:
•	     • 🟢 Oddiy (48-72 soat ichida)
•	     • 🟡 Tezkor (24 soat ichida) — + XX% qo'shimcha
•	     • 🔴 Shoshilinch (4-12 soat ichida) — + XX% qo'shimcha
Tugmalar:	

Logika:	•	🔶 Xizmat tanlanganda narx dinamik hisoblangan va ko'rsatiladi
•	🔶 'Shoshilinch' tanlanganda: 'Favqulodda tibbiy holat uchun 103 ga qo'ng'iroq qiling' eslatmasi
•	🔶 Tanlov tizimda saqlanadi, B-4 da shartnomaga avtomatik kiritiladi
Keyingisi:	→ B-4 (Verifikatsiya va shartnoma)

EKRAN B-4: VERIFIKATSIYA, SHARTNOMA VA ROZILIK   [BEMOR]
Tavsif:	Bemor kiritgan barcha ma'lumotlarni ko'rib chiqadi, shartnoma matnini o'qiydi va tasdiqlaydi. Yuridik muhim qadam.
Maydonlar:	•	🔵 Ma'lumotlar xulosasi (faqat ko'rish): Ism, Tasvir turi, Organ, Xizmat, Muhimlik, Narx
•	🔵 Shartnoma matni (to'liq, skrillash mumkin)
•	🔵 ☑️ 'Shartnoma shartlarini o'qidim va qabul qilaman' — checkbox (majburiy)
•	🔵 ☑️ 'Shaxsiy ma'lumotlarimni qayta ishlashga roziman (PDPL 2019)' — checkbox (majburiy)
•	🔵 ☑️ 'Xulosa klinik ko'rik o'rnini bosa olmasligini tushunaman' — checkbox (majburiy)
Tugmalar:	


Logika:	•	🔶 'Tasdiqlash' tugmasi BARCHA 3 ta checkbox belgilanmagan bo'lsa o'chirilgan (disabled)
•	🔶 Tasdiqlash bosilganda: timestamp, Telegram user_id, IP — backend DB ga yoziladi (elektron rozilik)
•	🔶 Bemorga avtomatik: shartnoma PDF Telegram chatga yuboriladi
•	🔶 Ariza raqami generatsiya qilinadi: RAD-YYYY-XXXXXX format
•	🔶 → To'lov ekraniga avtomatik o'tadi
Keyingisi:	→ C-1 (To'lov)

BLOK C — TO'LOV

EKRAN C-1: TO'LOV USULINI TANLASH   [BEMOR]
Tavsif:	Bemor to'lov usulini tanlaydi. Tizim to'lov so'rovini yaratadi va tashqi to'lov tizimiga yo'naltiradi.
Maydonlar:	•	🔵 To'lov summasi (katta, aniq ko'rinishda): XXX,XXX so'm
•	🔵 Ariza raqami: RAD-2024-XXXXXX
•	🔵 To'lov usuli (radio tugmalar):
•	     • 💳 Payme
•	     • 💳 Click
•	     • 💳 Uzum
Tugmalar:	

Logika:	•	🔶 'To'lovni amalga oshirish' bosilganda: tanlangan tizim (Payme/Click) in-app browser yoki deep link orqali ochiladi
•	🔶 Telegram WebApp.openLink() API ishlatiladi
•	🔶 To'lov muvaffaqiyatli bo'lsa: webhook → backend → ariza holati 'to'langan' ga o'tadi
•	🔶 30 daqiqa ichida to'lov bo'lmasa: ariza 'kutilmoqda' holatida qoladi, eslatma yuboriladi
•	🔶 To'lov bekor qilinsa yoki xato bo'lsa: C-2 (xato ekrani) ko'rsatiladi
Keyingisi:	→ C-2 (To'lov tasdiqlash) yoki D-1 (Kutish)

EKRAN C-2: TO'LOV NATIJASI   [BEMOR]
Tavsif:	To'lov natijasi ko'rsatiladi: muvaffaqiyatli yoki xato.
Maydonlar:	•	🔵 Holat animatsiyasi: ✅ Yashil yulduz (muvaffaqiyatli) yoki ❌ Qizil (xato)
•	🔵 Ariza raqami
•	🔵 To'langan summa
•	🔵 Sana va vaqt
•	🔵 Kutish muddati (tanlangan xizmatga qarab)
Tugmalar:	


Logika:	•	🔶 Muvaffaqiyatli to'lovda: Telegram chatga chek PDF yuboriladi
•	🔶 Radiolog paneliga yangi ariza bildirishnomasi ketadi
•	🔶 Kassir/Admin paneliga to'lov haqida xabar
•	🔶 Ariza holati DB da: 'to_langan_kutilmoqda'
Keyingisi:	→ D-1 (Ariza kuzatish)

BLOK D — KUTISH VA KUZATISH (BEMOR)

EKRAN D-1: ARIZA HOLATI VA KUZATISH   [BEMOR]
Tavsif:	Bemor o'z arizasining joriy holatini kuzatib boradi. Real vaqtda yangilanadi.
Maydonlar:	•	🔵 Holat progress bar: Qabul qilindi → Tekshirilmoqda → Xulosa tayyorlanmoqda → Yuborildi
•	🔵 Ariza raqami va sanasi
•	🔵 Taxminiy tayyor bo'lish vaqti (countdown timer)
•	🔵 Operator xabarlari (agar noto'liq ma'lumot bo'lsa)
Tugmalar:	


Logika:	•	🔶 Holat avtomatik yangilanadi (WebSocket yoki polling 30 soniyada)
•	🔶 Holat o'zgarganda: Telegram push bildirishnoma yuboriladi
•	🔶 Operator qo'shimcha ma'lumot so'rasa: ⚠️ banner va chat ochish tugmasi chiqadi
•	🔶 Xulosa tayyor bo'lsa: D-2 ga o'tadi
Keyingisi:	→ D-2 (Xulosa ko'rish)

EKRAN D-2: XULOSA NATIJASI   [BEMOR]
Tavsif:	Bemor tayyor radiologik xulosani ko'radi va yuklab oladi. Bu jarayonning yakuniy ekrani.
Maydonlar:	•	🔵 Radiolog F.I.Sh. va litsenziya raqami
•	🔵 Xulosa matni (formatlangan, to'liq)
•	🔵 Xulosa sanasi va vaqti
•	🔵 Qo'shimcha tavsiyalar (agar radiolog yozgan bo'lsa)
•	🔵 Keyingi qadam tavsiyasi
Tugmalar:	



Logika:	•	🔶 Xulosa PDF: radiolog imzosi (elektron), muhr, sana bilan rasmiylashtrilgan
•	🔶 PDF S3/B2 da saqlanadi, 5 yil davomida bemor uchun mavjud
•	🔶 Baho berilsa: radiologga ko'rsatiladi, statistikaga qo'shiladi
•	🔶 Noto'g'ri xulosa haqida shikoyat tugmasi: operator paneliga ketadi
Keyingisi:	→ Jarayon tugadi ✅

BLOK R — RADIOLOG PANELI

EKRAN R-1: RADIOLOG — ASOSIY PANEL (DASHBOARD)   [RADIOLOG]
Tavsif:	Radiolog kirganida bosh ekran: yangi arizalar, statistika, tezkor harakatlar.
Maydonlar:	•	🔵 Statistika kartalar: Yangi (badge qizil), Jarayonda, Bugun bajarildi
•	🔵 Ariza ro'yxati (filter bilan): Yangi / Jarayonda / Bajarildi / Arxiv
•	🔵 Har bir ariza kartasida: Bemor ismi, Tasvir turi, Muhimlik (rang), Vaqt qoldi
Tugmalar:	


Logika:	•	🔶 Yangi ariza kelganda: Telegram bot xabar yuboradi + Mini App ichida badge yangilanadi
•	🔶 'Shoshilinch' arizalar doim ro'yxat tepasida (pinned)
•	🔶 Muddati o'tgan arizalar: sariq/qizil highlight bilan ko'rsatiladi
Keyingisi:	→ R-2 (Ariza ko'rish)

EKRAN R-2: RADIOLOG — ARIZANI KO'RISH VA TAHLIL   [RADIOLOG]
Tavsif:	Radiolog bemorning to'liq arizasini, yuklangan tasvirlarni va AI dastlabki xulosasini ko'radi.
Maydonlar:	•	🔵 Bemor ma'lumotlari: Ism, Yosh, Jinsi, Kasalliklar tarixi
•	🔵 Shikoyatlar va anamnez (bemor yozganlari to'liq)
•	🔵 Tasvir turi va organ
•	🔵 DICOM viewer (inline, scrollable slices) yoki rasmlar galereyasi
•	🔵 🤖 AI dastlabki tahlili (collapsible panel): aniqlangan anomaliyalar, ishonch darajasi
•	🔵 Ariza raqami, muhimlik darajasi, muddat
Tugmalar:	



Logika:	•	🔶 DICOM viewer: windowing (W/L), zoom, pan, slice navigation
•	🔶 AI panel: avtomatik yuklangan, lekin radiolog uni e'tiborsiz qoldirishi mumkin
•	🔶 'Bemordan qo'shimcha ma'lumot' bosilsa: ariza holati 'qo'shimcha kerak' ga o'tadi, bemorga xabar
•	🔶 Arizani 'qabul qildim' bosish: ariza holati 'jarayonda' ga o'tadi, boshqa radiologga ko'rinmaydi
Keyingisi:	→ R-3 (Xulosa yozish)

EKRAN R-3: RADIOLOG — XULOSA YOZISH VA TASDIQLASH   [RADIOLOG]
Tavsif:	Radiolog rasmiy xulosani yozadi, formatlaydi va tasdiqlaydi. Bu xulosani bemorga yuboradi.
Maydonlar:	•	🔵 Xulosa muharrir (rich text editor):
•	     • Tasvir tavsifi (maydon 1)
•	     • Topilmalar / Patologiyalar (maydon 2)
•	     • Xulosa / Impression (maydon 3)
•	     • Tavsiyalar (maydon 4, ixtiyoriy)
•	🔵 Shablon tanlash (dropdown): Bosh MRT, Ko'krak rentgen, Umurtqa MSKT va h.k.
•	🔵 Muhimlik darajasini o'zgartirish (agar kerak bo'lsa)
•	🔵 Preview: PDF ko'rinishi oldindan ko'rish
Tugmalar:	



Logika:	•	🔶 'Tasdiqlash va Yuborish' bosilganda: radiolog elektron imzosi (F.I.Sh. + litsenziya + timestamp) PDF ga kiritiladi
•	🔶 PDF avtomatik generatsiya: bemorning ma'lumotlari, xulosa, radiolog imzosi, ariza raqami
•	🔶 PDF S3/B2 ga yuklangan, bemor paneliga D-2 ekrani ochiladi
•	🔶 Bemorga Telegram bot orqali: 'Xuloangiz tayyor!' xabari + PDF
•	🔶 Ariza holati: 'Bajarildi' → Arxivga o'tadi
•	🔶 Kassir paneliga: 'Shartnoma bajarildi' xabari
Keyingisi:	→ Jarayon tugadi ✅ → R-1 ga qaytadi

EKRAN R-4: RADIOLOG — MUTAXASSISGA YUBORISH (IXTIYORIY)   [RADIOLOG]
Tavsif:	Radiolog murakkab holatlarda boshqa mutaxassislarni konsultatsiyaga chaqiradi.
Maydonlar:	•	🔵 Mutaxassislar ro'yxati (filter: ixtisoslik bo'yicha)
•	🔵 Konsultatsiya sababi (matn, majburiy)
•	🔵 Bir yoki bir nechta mutaxassis tanlash
Tugmalar:	

Logika:	•	🔶 Yuborilgan mutaxassis(lar)ga Telegram bildirishnoma ketadi
•	🔶 Ular ham R-2 va R-3 ekranlardan foydalanadi (cheklangan ko'rinish)
•	🔶 Asosiy radiolog barcha mutaxassislar xulosasini ko'radi, yakuniy xulosani o'zi tuzadi
Keyingisi:	→ R-3 (Yakuniy xulosa)

BLOK O — OPERATOR PANELI

EKRAN O-1: OPERATOR — BOSHQARUV PANELI   [OPERATOR]
Tavsif:	Operator noto'liq arizalarni aniqlaydi, bemorlar bilan muloqot qiladi, to'lovlar va arxivni nazorat qiladi.
Maydonlar:	•	🔵 Ko'rsatkichlar: Bugungi arizalar, To'lanmagan, Muammo bo'lganlar, Bajarilganlar
•	🔵 Arizalar ro'yxati (filtr: Holat / Sana / Muhimlik)
•	🔵 To'lovlar jurnali
•	🔵 Bemorlar ro'yxati
Tugmalar:	



Logika:	•	🔶 Noto'liq ma'lumot aniqlanganda: ariza 'ushlanib qoldi' holatiga o'tadi
•	🔶 Bemorga chat xabari: 'Ariza raqami RAD-XXX: qo'shimcha ma'lumot kerak...'
•	🔶 48 soat ichida javob bo'lmasa: avtomatik eslatma + qo'l bilan to'lov qaytarish imkoniyati
•	🔶 Shartnoma bajarilmadi → To'lovni qaytarish jarayoni boshlanadi
•	🔶 Shartnoma bajarildi → Avtomatik arxivlanadi
Keyingisi:	→ Har bir ariza o'z holati bo'yicha tegishli oqimga yo'naltiriladi

3. ARIZA HOLATLARI (STATE MACHINE)
yangi_ariza	Bemor shartnomani tasdiqladi, to'lov kutilmoqda
tolangan_kutilmoqda	To'lov muvaffaqiyatli, radiolog hali qabul qilmagan
qabul_qilindi	Radiolog arizani qabul qildi, tekshiruv boshlandi
qoshimcha_kerak	Operator yoki radiolog qo'shimcha ma'lumot so'radi
mutaxassisda	Qo'shimcha mutaxassisga yuborildi
xulosa_tayyorlanmoqda	Radiolog xulosa yozmoqda
bajarildi	Xulosa bemorga yuborildi, arxivlandi
bajarilmadi	Texnik sabab yoki voz kechish — to'lov qaytariladi
arxiv	Yakuniy holat, faqat ko'rish mumkin

4. BILDIRISHNOMALAR TIZIMI
4.1. Bemor uchun bildirishnomalar
Ariza qabul qilindi	Ariza raqami + taxminiy muddat
To'lov tasdiqlandi	Chek PDF
Qo'shimcha ma'lumot kerak	Operator savoli + javob havolasi
Xulosa tayyor	PDF havolasi + D-2 ga o'tish tugmasi
Eslatma (30 daqiqa)	To'lov to'lanmagan bo'lsa

4.2. Radiolog uchun bildirishnomalar
Yangi ariza	Ariza ma'lumotlari + R-2 ga o'tish
Shoshilinch ariza	🔴 Alohida belgi bilan + qo'ng'iroq signali
Mutaxassis xulosasi keldi	Ko'rib chiqish so'rovi
Bemor baholadi	⭐ Baho natijasi

5. MA'LUMOTLAR BAZASI SXEMASI (ASOSIY JADVALLAR)
users jadval
id | telegram_user_id | role (bemor/radiolog/operator) | full_name | phone | dob | gender | created_at
applications jadval
id | ariza_number | user_id | status | scan_type | organ | urgency | service_type | price | created_at | updated_at
files jadval
id | application_id | file_type | s3_key | original_name | size_bytes | uploaded_at
anamnez jadval
id | application_id | complaint | duration | pain_level | previous_treatment | medications | allergies
conclusions jadval
id | application_id | radiolog_id | description | findings | impression | recommendations | pdf_s3_key | signed_at
payments jadval
id | application_id | amount | provider (payme/click/uzum) | provider_transaction_id | status | paid_at
contracts jadval
id | application_id | accepted_at | ip_address | telegram_user_id | pdf_s3_key

6. ASOSIY API ENDPOINTLAR
POST /auth/telegram	Telegram initData verifikatsiya, JWT qaytaradi
GET /user/profile	Foydalanuvchi profili
PUT /user/profile	Profil yangilash
POST /applications	Yangi ariza yaratish
GET /applications/:id	Ariza tafsilotlari
GET /applications/my	Bemorning o'z arizalari
POST /applications/:id/files	Fayl yuklash (multipart)
POST /applications/:id/contract	Shartnoma tasdiqlash
POST /payments/create	To'lov so'rovi yaratish
POST /payments/webhook	Payme/Click webhook
GET /radiolog/queue	Radiolog arizalar navbati
POST /radiolog/applications/:id/accept	Arizani qabul qilish
POST /radiolog/applications/:id/conclusion	Xulosa yuborish
POST /radiolog/applications/:id/refer	Mutaxassisga yuborish
GET /admin/dashboard	Operator statistika
POST /admin/applications/:id/request-info	Bemordan ma'lumot so'rash
POST /admin/payments/:id/refund	To'lovni qaytarish

7. MVP BOSQICHLARI VA XARAJATLAR
Bosqich 1 — MVP (4-6 hafta)
•	Bemor ro'yxat + profil
•	Fayl yuklash (JPG/PDF, DICOM keyinroq)
•	Shikoyat + xizmat tanlash
•	Shartnoma (oddiy checkbox)
•	Payme integratsiya
•	Radiolog paneli — ariza ko'rish + xulosa yuborish
•	Telegram bildirishnomalar
Taxminiy xarajat:  $800 — $1,500 (bir martalik) + $10-20/oy hosting

Bosqich 2 — To'liq versiya (2-3 oy)
•	DICOM viewer (Cornerstone.js)
•	AI integratsiya (GPT-4 Vision)
•	Operator paneli to'liq
•	Click + Uzum to'lov
•	PDF xulosa avtogeneratsiya
•	Mutaxassislar konsultatsiya oqimi
•	Statistika va hisobotlar
Taxminiy xarajat:  $2,000 — $4,000 (qo'shimcha) + $30-50/oy hosting

8. MUHIM TALABLAR VA ESLATMALAR
⚠️  YaTT yoki MChJ ro'yxatdan o'tmasdan Payme/Click integratsiya imkonsiz
⚠️  DICOM fayllar shifrlanmagan serverda saqlanishi PDPL 2019 qonunini buzadi
⚠️  AI xulosasi hech qachon bemorda to'g'ridan-to'g'ri ko'rsatilmasligi kerak — faqat radiolog uchun
💡 MVP uchun DICOM viewer o'rniga oddiy rasm va PDF yuklash yetarli — bu xarajatni 40% ga kamaytiradi
💡 Telegram WebApp API limits: fayl yuklash max 20MB. Katta DICOM uchun to'g'ridan-to'g'ri S3 presigned URL ishlatiladi
💡 Radiolog va Operator rollari uchun alohida Telegram Bot (admin bot) ham parallel ishlashi mumkin


Hujjat tayyor. Dasturchi ushbu TT asosida loyihani boshdan oxirigacha amalga oshirishi mumkin.
