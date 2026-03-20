

ARXITEKTURA, MODULLAR
va QO'SHIMCHA FUNKSIONALLAR
Radiologik Konsultatsiya — Telegram Mini App
Minimal xato, maksimal natija uchun to'liq yo'riqnoma
Hujjat maqsadi	Loyiha arxitekturasini to'g'ri tashkil etish, kerakli barcha modullarni aniqlash
Yo'nalish	Shunga o'xshash tibbiy, telemedisin va to'lov platformalarida mavjud funksionallar
Natija	1 dasturchi bilan 4–8 haftada ishlaydigan MVP + o'sish yo'li aniq
Versiya	2.0 — Kengaytirilgan (avvalgi TT ning davomi)


  QISM 1 — ARXITEKTURA QARORLARI (ADR)  

1.1. Monolitmi yoki Mikroservismi?
Boshlang'ich bosqich uchun aniq javob:
Variant	Tavsif va qaror
✅ Monolit (tanlov)	1 backend server, 1 DB. MVP uchun ideal. Keyinchalik bo'laklarga ajratiladi.
❌ Mikroservis	Murakkab, qimmat, boshlang'ich uchun ortiqcha. Faqat 10 000+ foydalanuvchidan keyin.

1.2. Real vaqt xabarlar — WebSocket yoki Polling?
Variant	Holat kuzatish uchun (ariza statusi)
✅ Smart Polling (tanlov)	Har 15 soniyada so'rov. Oddiy, ishonchli. MVP uchun yetarli.
Keyinchalik	Server-Sent Events (SSE) → WebSocket (Socket.io). Foydalanuvchi 1000+ bo'lganda.

1.3. Holat boshqarish (Frontend State)
Nima uchun Zustand	Redux dan 10x oddiy. Boilerplate yo'q. TypeScript bilan yaxshi ishlaydi.
Global store	auth (foydalanuvchi), app (joriy ariza draft), ui (loading, toast)
Server state	React Query (TanStack Query) — API cacheing, polling, optimistic updates
Forma	React Hook Form + Zod validation — minimal qayta render, kuchli validatsiya

1.4. Ma'lumotlar bazasi strategiyasi
Connection pooling	PgBouncer yoki Railway o'zi beradi — har so'rovda yangi connection ochilmaydi
Migrations	node-pg-migrate — versiyalangan schema o'zgarishlari
Backup	Railway avtomatik daily backup. Qo'shimcha: pg_dump → B2 ga haftalik
Soft delete	is_deleted=true — hech narsa o'chirmang, faqat yashiring (tibbiy arxiv)
Audit log	Har muhim amal (xulosa, to'lov) alohida audit_logs jadvalda saqlanadi

1.5. Xatolarni qayta ishlash strategiyasi
Backend	try-catch + sentral error middleware. Har xato log ga yoziladi.
Frontend	Axios interceptor — xatoni Telegram.showAlert() orqali ko'rsatadi
Monitoring	Sentry.io (bepul tier) — real vaqt xato kuzatish. Bot ga ham xabar yuboradi.
Retry	To'lov webhook va bildirishnomalar: 3 marta urinish, eksponential kechiktirish
Circuit breaker	Tashqi xizmat (Payme, B2) ishlamasa — fallback xabar + admin ga ogohlantirish

  QISM 2 — TO'LIQ MODULLAR XARITASI  

Belgilar:  🔴 Kritik (bo'lmasa ishlamaydi)  |  🔵 Muhim (bo'lishi kerak)  |  ⚪ Ixtiyoriy (keyinroq)

MODUL 1 — AUTENTIFIKATSIYA VA FOYDALANUVCHILAR
🔐  1.1 Telegram Auth	Kritik
Telegram initData HMAC-SHA256 orqali har so'rovda foydalanuvchi tekshiriladi. JWT token 7 kunlik.
  ▸  initData verifikatsiya middleware (barcha himoyalangan routelarda)
  ▸  JWT yaratish va yangilash (access + refresh token juftligi)
  ▸  Foydalanuvchi birinchi marta kirganda avtomatik ro'yxatdan o'tkazish
  ▸  Sessiya boshqarish — bir vaqtda bir qurilmadan kirish

👥  1.2 Rol va Ruxsatlar (RBAC)	Kritik
Har foydalanuvchining roli va unga tegishli ruxsatlari aniq belgilangan.
  ▸  Rollar: patient | radiolog | operator | admin | specialist
  ▸  Middleware: requireRole(['radiolog', 'admin'])
  ▸  Har endpoint uchun ruxsat matritsasi (kim nimaga kira oladi)
  ▸  PIN kod orqali maxsus rol berish (radiolog/operator)
  ▸  Rol o'zgarganda JWT ni bekor qilish (blacklist Redis da)

👤  1.3 Profil Boshqarish	Muhim
Bemor va radiolog profillari, rasm, ma'lumotlar yangilash.
  ▸  Profil to'ldirish jarayoni (onboarding wizard)
  ▸  Ma'lumotlar validatsiyasi: telefon (O'zbekiston formati), sana, jins
  ▸  Profil to'liqlik foizi ko'rsatgichi (bemorni rag'batlantirish uchun)
  ▸  Radiolog uchun: litsenziya raqami, ixtisoslik, tajriba yillari
  ▸  Faollik tarixi: oxirgi kirish, jami arizalar soni


MODUL 2 — ARIZA VA ISH OQIMI
📋  2.1 Ariza Yaratish (Multi-step Wizard)	Kritik
Bemor arizasini bosqichma-bosqich to'ldiradi. Har bosqich validatsiya bilan. Draft avtosaqlanadi.
  ▸  Bosqich 1: Tasvir turi va organ tanlash (chip/badge UI)
  ▸  Bosqich 2: Fayllar yuklash (DICOM, JPG, PDF, ZIP) — progress bar
  ▸  Bosqich 3: Anamnez va shikoyatlar (struktura bilan)
  ▸  Bosqich 4: Xizmat turi va muhimlik (narx dinamik hisoblanadi)
  ▸  Bosqich 5: Shartnoma va rozilik (3 checkbox majburiy)
  ▸  Bosqich 6: To'lov
  ▸  Draft mexanizmi: foydalanuvchi qaytsa — kechagi kiritgan ma'lumotlar saqlanadi
  ▸  Bosqich ko'rsatgichi (progress indicator) har ekranda

⚙️  2.2 Ariza Holat Mashinasi	Kritik
Ariza holati qat'iy qoidalar asosida o'zgaradi. Ruxsatsiz holat o'zgartirish bloklanadi.
  ▸  9 holat: new → paid → accepted → in_progress → done / failed
  ▸  Har holat o'zgarishi audit_logs ga yoziladi (kim, qachon, nima sababdan)
  ▸  Holat o'zgarishi triggeri: tegishli tomonlarga avtomatik bildirishnoma
  ▸  Muddati o'tgan arizalar avtomatik aniqlash (cron job)
  ▸  Holat qayta ketish imkonsiz (masalan 'done'dan 'new'ga qaytib bo'lmaydi)

📊  2.3 Navbat Boshqarish (Queue)	Muhim
Radiolog uchun arizalar navbati — muhimlik, muddat, kelish tartibiga ko'ra.
  ▸  Avtomatik ustuvorlik hisoblash: shoshilinch × 3, tezkor × 2, oddiy × 1
  ▸  Radiolog qabul qilguncha ariza 'ochiq' — har qanday radiolog olishi mumkin
  ▸  Qabul qilgan radiologga biriktiriladi, boshqalarga ko'rinmaydi
  ▸  Muddati 2 soatdan kam qolsa: hamma radiologga ogohlantirish
  ▸  Statistika: o'rtacha bajarish vaqti, radiolog samaradorligi

❓  2.4 Qo'shimcha Ma'lumot So'rash	Muhim
Radiolog yoki operator bemordan qo'shimcha ma'lumot yoki yaxshiroq tasvir so'rashi.
  ▸  Operator savol yozadi → bemorga bildirishnoma + Mini App da banner
  ▸  Bemor javob beradi yoki yangi fayl yuklaydi
  ▸  Suhbat tarixi arizaga biriktiriladi va PDF da ko'rinadi
  ▸  Javob muddati: 48 soat. O'tsa — avtomatik eslatma, keyin to'lov qaytarilishi mumkin
  ▸  Nechta marta so'rash mumkin: maksimal 3 (suiiste'moldan himoya)


MODUL 3 — FAYL VA MEDIA BOSHQARISH
📁  3.1 Fayl Yuklash Tizimi	Kritik
Katta tibbiy fayllarni xavfsiz, tez va ishonchli yuklash. Server yuklamasdan to'g'ridan cloud ga.
  ▸  Presigned URL strategiyasi: Backend → URL → Frontend to'g'ridan B2/S3 ga yuklaydi
  ▸  Qo'llab-quvvatlanadigan formatlar: .dcm, .zip (DICOM), .jpg, .png, .pdf
  ▸  Maksimal hajm: 500 MB bitta fayl, 2 GB jami bitta ariza uchun
  ▸  Yuklash progress: real foiz (0–100%) va tezlik (MB/s)
  ▸  Xato holati: tarmoq uzilsa — Resume upload (qayta boshlamasdan davom etish)
  ▸  MIME type tekshiruv: faqat ruxsat etilgan turlar (backend va frontend ikkalasida)
  ▸  Virus skan: ClamAV yoki cloud antivirus (ixtiyoriy, keyinroq qo'shiladi)
  ▸  Thumbnail generatsiya: JPEG uchun kichik ko'rinish (preview)

🖥️  3.2 DICOM Ko'ruvchi (Viewer)	Muhim
Radiolog va bemor DICOM fayllarni brauzerda ko'ra oladi. Maxsus dastur kerak emas.
  ▸  Cornerstone.js yoki dwv (DICOM Web Viewer) — bepul, brauzerda ishlaydi
  ▸  Asosiy funksiyalar: zoom, pan, windowing (W/L), slice navigation
  ▸  Miniatura (thumbnail) ro'yxat — barcha serialar
  ▸  O'lchash vositalar: masofani o'lchash, burchak, ROI (ixtiyoriy)
  ▸  Mobile optimizatsiya: teging bilan zoom va pan
  ▸  Fallback: DICOM bo'lmasa — oddiy rasm galereyasi

🔒  3.3 Fayl Xavfsizligi va Arxiv	Kritik
Tibbiy fayllar maxfiy. Faqat tegishli shaxs ko'ra olishi kerak.
  ▸  Private bucket: to'g'ri URL bilan kirish mumkin emas
  ▸  Vaqtinchalik URL: 15 daqiqali presigned download URL (har so'rovda yangi)
  ▸  Kimga ruxsat: faqat ariza egasi (bemor) va tegishli radiolog/operator
  ▸  Fayl o'chirish: hech narsa fizik o'chirilmaydi — is_deleted=true (5 yil arxiv)
  ▸  Shifrlash: B2 server-side AES-256 shifrlash (avtomatik)


MODUL 4 — TO'LOV TIZIMI
💳  4.1 To'lov Orkestratsiyasi	Kritik
To'lovlar ishonchli, ikki tomonlama tasdiqlangan holda amalga oshiriladi.
  ▸  Idempotent to'lovlar: bir arizaga ikki marta to'lov imkonsiz
  ▸  To'lov holati: pending → paid → refunded (har holat DB da)
  ▸  Webhook ishonchlilik: bir xil webhook 2 marta kelsa — ikkinchisi e'tiborga olinmaydi
  ▸  Payme integratsiya: CheckPerform, CreateTransaction, PerformTransaction, Cancel
  ▸  Click integratsiya: prepare va complete bosqichlari
  ▸  To'lov muddati: ariza yaratilgandan 30 daqiqa. O'tsa — ariza 'expired' ga o'tadi
  ▸  Chek: to'lovdan so'ng PDF chek avtomatik Telegram ga yuboriladi

💰  4.2 Narxlash Tizimi	Muhim
Narx xizmat turi, muhimlik darajasi va boshqa omillar asosida dinamik hisoblanadi.
  ▸  Asosiy narx: admin panelda o'rnatiladi (DB da, hardcode emas)
  ▸  Muhimlik koeffitsienti: oddiy ×1.0, tezkor ×1.5, shoshilinch ×2.0
  ▸  Xizmat turi: faqat radiolog, AI+radiolog, mutaxassis+radiolog
  ▸  Chegirma: promo kod kiritish imkoniyati (ixtiyoriy)
  ▸  Soliq: 12% YaTT soliq — narxga kiritilgan yoki alohida ko'rsatilishi
  ▸  Narx tarixi: admin narxni o'zgartirsa — eski arizalar eski narx bilan qoladi

↩️  4.3 Qaytarish (Refund)	Muhim
Xizmat ko'rsatilmagan holda to'lovni qaytarish jarayoni.
  ▸  Qaytarish sabablari: sifatsiz tasvir, texnik xato, bekor qilish
  ▸  Kim boshlaydi: operator yoki admin
  ▸  Payme refund API orqali avtomatik
  ▸  Qaytarish muddati: 3–5 ish kuni (bank qarori)
  ▸  Bemorga bildirishnoma: qaytarish boshlanganligi va muddati
  ▸  Qisman qaytarish: xizmat qisman bajarilsa (ixtiyoriy)


MODUL 5 — BILDIRISHNOMALAR TIZIMI
🔔  5.1 Telegram Bildirishnomalar	Kritik
Har bir muhim voqea uchun tegishli shaxsga o'z vaqtida xabar yuboriladi.
  ▸  Bemor: ariza qabul, to'lov tasdiqlandi, qo'shimcha ma'lumot kerak, xulosa tayyor
  ▸  Radiolog: yangi ariza (muhimlikka qarab urgentligi), mutaxassis javob berdi
  ▸  Operator: to'lanmagan arizalar (30 daqiqa o'tsa), nizo, texnik xato
  ▸  Admin: kunlik statistika (har kuni soat 09:00 da)
  ▸  Inline tugmalar: har xabar bilan tegishli Mini App ekraniga o'tish tugmasi
  ▸  Xabar formatlash: HTML bold, emoji, tuzilmalangan ma'lumot

⏰  5.2 Eslatmalar va Avtomatik Xabarlar	Muhim
Tizim o'zi eslatmalar yuboradi — operator qo'lda yubormasin.
  ▸  Cron job (har 5 daqiqa): muddati o'tayotgan arizalar tekshiriladi
  ▸  To'lanmagan ariza: 15 daqiqa → eslatma 1, 25 daqiqa → eslatma 2, 30 daqiqa → arxiv
  ▸  Radiolog qabul qilmagan: 2 soat → barcha radiologga xabar
  ▸  Bemor javob bermagan (qo'shimcha ma'lumot): 24 soat → eslatma, 48 soat → operator
  ▸  Xulosa muddati: agar muddat o'tsa → operator va admin ga ogohlantirish
  ▸  Eslatma chastotasi: bir foydalanuvchiga 24 soatda maksimal 5 ta xabar (spam emas)


MODUL 6 — XULOSA VA PDF TIZIMI
✍️  6.1 Xulosa Muharrir (Editor)	Muhim
Radiolog qulay va tez xulosa yoza olishi uchun professional interfeys.
  ▸  Shablon tizimi: organ va tasvir turiga qarab avvaldan to'ldirilgan shablonlar
  ▸  Shablonlar: Bosh MRT, Ko'krak rentgen, Umurtqa MSKT, Qorin USG va b.
  ▸  Matn muharrir: rich text (qalin, kursiv, ro'yxatlar) — tibbiy atamalar uchun
  ▸  Avtoto'ldirish: tez-tez ishlatiladigan tibbiy iboralar ro'yxati
  ▸  Imlo tekshiruvi: o'zbek va rus tibbiy lug'ati asosida (ixtiyoriy)
  ▸  Qoralama saqlash: yozib bo'lmaguncha draft saqlanadi
  ▸  Ko'rinish: xulosa yozilayotganda PDF preview real vaqtda yangilanadi

📄  6.2 PDF Generatsiya	Kritik
Xulosa rasmiy tibbiy hujjat sifatida PDF ga aylantiriladi.
  ▸  Dizayn: klinika nomi, logotipi, radiolog imzosi, muhr (raqamli)
  ▸  Tarkib: bemor ma'lumotlari, tasvir ma'lumoti, xulosa, tavsiyalar, cheklov iborasi
  ▸  Xavfsizlik: PDF parol bilan himoyalanishi (ixtiyoriy, bemor telefoni)
  ▸  QR kod: PDF da ariza raqami QR kod sifatida — autentiklik tekshirish uchun
  ▸  Til: o'zbek va/yoki rus tilida (tanlash imkoniyati)
  ▸  Elektron imzo: radiolog F.I.Sh., litsenziya, timestamp — imzo sifatida
  ▸  Saqlash: S3/B2 da 5 yil. Bemor istalgan vaqt qayta yuklab olishi mumkin


MODUL 7 — ADMIN VA OPERATOR PANELI
👨‍💼  7.1 Operator Ish Oqimi	Muhim
Operator arizalarni ko'radi, muammolarni hal qiladi, bemorlar bilan muloqot qiladi.
  ▸  Dashboard: bugun/hafta/oy statistikasi (arizalar, to'lovlar, bajarilganlar)
  ▸  Arizalar filtri: holat, sana, muhimlik, to'lov holati, radiolog bo'yicha
  ▸  Qidiruv: ariza raqami, bemor ismi, telefon raqami
  ▸  Bemorga xabar: Mini App orqali savol yuborish + javobni ko'rish
  ▸  Arizani radiologga qo'lda biriktirish (agar avtomatik ishlamasa)
  ▸  To'lovni qaytarish jarayonini boshlash
  ▸  Kunlik/haftalik hisobot PDF formatida yuklab olish

⚙️  7.2 Admin Panel (Super Admin)	Muhim
Tizimni to'liq boshqarish — foydalanuvchilar, narxlar, radiologlar, hisobotlar.
  ▸  Foydalanuvchilar boshqarish: rol berish/olish, bloklash, profil ko'rish
  ▸  Narx boshqarish: har xizmat turi uchun narx o'rnatish (DB dan, kod emas)
  ▸  Radiologlar ro'yxati: kim qancha xulosa bergan, o'rtacha vaqt, baholar
  ▸  Moliyaviy hisobot: kunlik/oylik daromad, to'lovlar, qaytarishlar
  ▸  Tizim sozlamalari: xabarnoma shablonlari, muddatlar, chegirmalar
  ▸  Audit log ko'rish: kim nimani o'zgartirgan (to'liq tarix)
  ▸  Zaxira nusxa: DB backup ni qo'lda boshlash
  ▸  Tizim holati: server, DB, B2, Payme ulanishlari — health check

📈  7.3 Statistika va Tahlil	Ixtiyoriy
Biznes ko'rsatkichlari, trendlar va qarorlar uchun ma'lumotlar.
  ▸  Daromad grafigi: kunlik, haftalik, oylik (Chart.js)
  ▸  Xizmat turi bo'yicha: qaysi xizmat ko'p buyurtma qilinadi
  ▸  Organ/tasvir bo'yicha: qaysi MRT/rentgen ko'proq
  ▸  Vaqt tahlili: ariza qabul → xulosa o'rtacha vaqti
  ▸  Radiolog samaradorligi: kim tez va sifatli ishlaydi
  ▸  Bemor qaytuvchanligi: birinchi va qayta murojaatlar
  ▸  Geografiya: qaysi shahardan ko'proq murojaat


MODUL 8 — SIFAT VA BAHO TIZIMI
⭐  8.1 Xizmat Baholash	Ixtiyoriy
Bemor xulosa olgandan keyin xizmatni baholaydi. Bu radiolog va tizim sifatini oshiradi.
  ▸  5 yulduz baholash tizimi (xulosa yetkazilgandan 1 soat keyin so'raladi)
  ▸  Ixtiyoriy izoh: bemor fikrlarini yozishi mumkin
  ▸  Radiolog o'z baholarini ko'radi (dashboard da)
  ▸  Admin: past baholar (1-2 yulduz) uchun ogohlantirish oladi
  ▸  Anonim: bemor baholash ixtiyoriy va anonimdir
  ▸  Statistika: radiolog o'rtacha bahosi profiliga ko'rsatiladi

🔍  8.2 Sifat Nazorati	Ixtiyoriy
Xulosa sifatini nazorat qilish — minimal standartlarga muvofiqlik.
  ▸  Minimal uzunlik: xulosa 100 belgidan kam bo'lsa — tasdiqlash bloklanadi
  ▸  Majburiy bo'limlar: tasvir tavsifi, topilmalar, xulosa — barchasi bo'lishi shart
  ▸  Shablondan chetga chiqish ogohlantirishi (ixtiyoriy)
  ▸  Ikkinchi ko'z: muhim holatlarda boshqa radiolog ko'rib chiqishi (ixtiyoriy)
  ▸  Nizo mexanizmi: bemor xulosa bilan rozi bo'lmasa operator ga murojaati


MODUL 9 — XAVFSIZLIK VA MUVOFIQLIK
🛡️  9.1 Ma'lumotlar Himoyasi (PDPL 2019)	Kritik
O'zbekiston qonunchiligiga muvofiq shaxsiy tibbiy ma'lumotlarni himoya qilish.
  ▸  Barcha tibbiy ma'lumotlar shifrlangan (at-rest va in-transit)
  ▸  Ma'lumotlarga kirish jurnali: kim qachon qaysi bemor ma'lumotini ko'rdi
  ▸  Ma'lumotlarni o'chirish talabi: bemor so'rasa 30 kun ichida bajariladi
  ▸  Ma'lumotlarni eksport qilish: bemor o'z ma'lumotlarini JSON/PDF da olishi mumkin
  ▸  Rozi bo'lish qaydnomasi: shartnomada aniq kelishuv, elektron tasdiq saqlanadi
  ▸  Server joylashuvi: O'zbekistonda yoki GDPR mos Yevropa serveri

🔐  9.2 Xavfsizlik Tekshiruvlari	Kritik
Tizimni tashqi hujumlardan va ichki suiiste'moldan himoya qilish.
  ▸  Rate limiting: IP va user_id asosida (Express Rate Limit)
  ▸  Input sanitizatsiya: SQL injection, XSS qarshi (Helmet, validator.js)
  ▸  Fayl yuklash himoyasi: MIME tekshirish, fayl nomi tozalash, hajm cheki
  ▸  CORS: faqat frontend domenidan so'rovlar qabul qilish
  ▸  Secrets boshqaruvi: .env fayllar Git ga tushmaydi, Railway Secrets
  ▸  Penetration test: ishga tushirishdan oldin asosiy xavfsizlik tekshiruvi
  ▸  Dependency audit: npm audit — zaif kutubxonalar tekshiruvi

📊  9.3 Monitoring va Logging	Muhim
Tizim ishlayaptimi, xatolar bormi — real vaqtda bilish.
  ▸  Sentry.io: JavaScript xatolari avtomatik saqlanadi va bot ga yuboriladi
  ▸  Winston logger: barcha so'rovlar, xatolar, muhim amallar log faylda
  ▸  Health check endpoint: GET /health → {status, db, b2, payme}
  ▸  Uptime monitoring: UptimeRobot (bepul) — server tushib qolsa SMS/Telegram
  ▸  DB monitoring: sekin so'rovlar (>500ms) loglanganda ogohlantirish
  ▸  Disk/xotira: Railway o'zi ko'rsatadi, yuk oshsa bildirishnoma


MODUL 10 — QO'SHIMCHA FUNKSIONALLAR (RAQOBAT USTUNLIGI)
🤖  10.1 AI Integratsiya	Ixtiyoriy
GPT-4 Vision orqali radiologga yordamchi dastlabki tahlil. Vaqtni tejaydi.
  ▸  DICOM → JPEG konvertatsiya (dcmj2pnm yoki python-gdcm)
  ▸  OpenAI GPT-4o-mini Vision API — arzon va tez
  ▸  Prompt: 'Radiolog sifatida tasvir tahlil qiling, anomaliyalarni ro'yxatlashtiring'
  ▸  Natija: strukturlangan JSON {anomaliyalar, soha, ishonch_darajasi, izoh}
  ▸  Faqat radiologga ko'rinadi — bemorga hech qachon to'g'ridan yuborilmaydi
  ▸  AI tahlili 30 soniyadan ko'p kechiksa — radiolog kutmasdan ishlashi mumkin
  ▸  Xarajat: GPT-4o-mini ~$0.002–0.01 bitta tasvir uchun

🌐  10.2 Ko'p Tilli Qo'llab-quvvatlash	Muhim
O'zbekcha (lotin/kirill) va ruscha. Kelajakda inglizcha.
  ▸  i18next kutubxonasi: barcha matnlar JSON fayllarda
  ▸  O'zbekcha lotin (asosiy), ruscha (keng tarqalgan), o'zbekcha kirill (keksa avlod)
  ▸  Til tanlash: birinchi kirishda, keyinchalik profil sozlamalarida
  ▸  Tarjima fayli: 200–300 kalit so'z (shablon, xabar, xato matnlari)
  ▸  RTL: hozircha kerak emas, lekin arxitekturada hisobga olinishi kerak

🔄  10.3 Takroriy Foydalanuvchilar Uchun	Ixtiyoriy
Qayta murojaat qilgan bemorlar uchun tez va qulay jarayon.
  ▸  Ariza tarixi: barcha o'tgan arizalar, xulosalar bir joyda
  ▸  Tez ariza: avvalgi ariza ma'lumotlaridan nusxa olish
  ▸  Sevimli mutaxassis: avval ishlagan radiologni qayta tanlash imkoniyati
  ▸  Obuna: oylik abonement (masalan, 3 ta xulosa/oy chegirmada)
  ▸  Xulosa arxivi: barcha xulosalar, istalgan vaqt yuklab olish

🏥  10.4 Hamkor Shifokorlar Moduli	Ixtiyoriy
Radiolog xulosasini boshqa shifokorda ko'rib chiqish, konsultatsiya zanjiri.
  ▸  Mutaxassislar ro'yxati: nevrolog, ortoped, onkolog va b.
  ▸  Radiolog → Mutaxassisga yuborish: ariza va xulosa ulashish
  ▸  Mutaxassis o'z izohini qo'shadi (xulosa o'zgarmaydi, qo'shimcha izoh sifatida)
  ▸  Bemorga: ikki mutaxassis ko'rganini ko'rsatadi (ishonch oshadi)
  ▸  Haq to'lash: mutaxassisga ham to'lov bo'linishi (split payment — keyinroq)


  QISM 3 — MINIMAL XATO, MAKSIMAL NATIJA STRATEGIYASI  

3.1. Xatoliklar klassifikatsiyasi va oldini olish
Xatolik turi	Sabab	Yechim
To'lov ikki marta o'tdi	Webhook 2 marta keldi	Idempotency key — provider_tx_id UNIQUE
Fayl yuklanmadi	Tarmoq uzildi	Resume upload + retry 3 marta avtomatik
Ariza holati noto'g'ri	Race condition	DB transaction + optimistic locking
JWT eskirdi	7 kun o'tdi	Refresh token + avtomatik yangilash
Bot xabar kelmadi	Telegram API ishlamadi	BullMQ queue + 3 retry + fallback SMS
PDF generatsiya xato	Xotira yetmadi	Async queue, timeout 60s, xato → admin ga
DICOM o'qilmadi	Noto'g'ri format	Validatsiya + foydalanuvchiga aniq xabar
B2 ulanish yo'q	Internet uzildi	Circuit breaker + local buffer + retry
SQL connection yo'q	DB overload	PgBouncer + connection pool + health check

3.2. Frontend xato oldini olish
Texnika	Tavsif
Optimistic UI	To'lov bosilganda darhol 'Kutilmoqda' ko'rsatish — javob kelguncha
Skeleton loading	Yuklanayotganda bo'sh oq joy emas — skeleton animatsiya
Form validation	Foydalanuvchi yozayotganda real vaqtda tekshirish (Zod + RHF)
Error boundary	React Error Boundary — bitta komponent xato qilsa boshqalari ishlaydi
Offline detection	Navigator.onLine — tarmoq yo'q bo'lsa ogohlantirish
Double-click himoya	Tugma bosilgandan so'ng 2 soniya disabled holda qoladi
Draft saqlanishi	Sahifa yopilsa ham ma'lumotlar localStorage da qoladi

3.3. Backend mustahkamligi
Yondashuv	Amalga oshirish
Graceful shutdown	SIGTERM → aktiv so'rovlar tugashini kutish → server yopilish
Health endpoint	GET /health — DB, B2, Payme ulanishlari tekshiriladi
Request timeout	Har so'rov maksimal 30 soniya — keyin timeout xatosi
DB transactions	Pul va holat o'zgarishi har doim transaction ichida
Idempotent webhook	provider_transaction_id tekshirish — duplicate payment imkonsiz
Queue (BullMQ)	Bildirishnoma va PDF — asinxron, serverga yuk tushirmaydi
Structured logging	Winston: har log JSON formatda — Sentry ga yuboriladi

3.4. Test strategiyasi
Test turi	Nima tekshiriladi
Unit test (Jest)	Narx hisoblash, holat mashinasi, validatsiya funksiyalari
Integration test	API endpointlar, DB so'rovlar, to'lov webhook simulatsiyasi
E2E test (Playwright)	Bemor → to'lov → xulosa — to'liq oqim simulatsiyasi
Load test (k6)	100 ta bir vaqtda foydalanuvchi — server chidamlilik tekshiruvi
Manual test	Telegram real muhitida ishlatib ko'rish
Payme sandbox	Real to'lov emas, test kartalar bilan sinash

  QISM 4 — RIVOJLANISH YO'L XARITASI (ROADMAP)  

4.1. Bosqichlar va ketma-ketlik
Bosqich	Nima qilinadi	Muddat
🔴 0. Tayyorgarlik	Bot, B2, Railway, DB, .env sozlash	1-2 kun
🔴 1. Auth + Profil	Telegram auth, JWT, foydalanuvchi CRUD	3-4 kun
🔴 2. Fayl yuklash	Presigned URL, B2 integratsiya, progress	3-4 kun
🔴 3. Ariza wizard	6 bosqichli forma, draft, validatsiya	5-6 kun
🔴 4. Shartnoma + To'lov	Payme integratsiya, webhook, chek PDF	4-5 kun
🔴 5. Radiolog paneli	Dashboard, ariza ko'rish, xulosa yozish	4-5 kun
🔴 6. PDF xulosa	PDFKit, imzo, B2 yuklash, bemorga yuborish	3-4 kun
🔴 7. Bildirishnomalar	Bot xabarlar, cron job, eslatmalar	2-3 kun
🔵 8. Operator paneli	Dashboard, qidiruv, filtr, refund	3-4 kun
🔵 9. Click integratsiya	Ikkinchi to'lov tizimi	2 kun
🔵 10. DICOM viewer	Cornerstone.js, slice nav, windowing	3-5 kun
⚪ 11. AI tahlil	GPT-4 Vision, dastlabki xulosa	3-4 kun
⚪ 12. Statistika	Admin hisobotlar, grafiklar	3-4 kun
⚪ 13. Baholash	5 yulduz tizimi, radiolog baholar	2 kun

💡  🔴 Kritik (MVP uchun zarur) — 1–7 bosqichlar: taxminan 4–5 hafta
💡  🔵 Muhim (v1.1) — 8–10 bosqichlar: +2–3 hafta
💡  ⚪ Ixtiyoriy (v2.0) — 11–13 bosqichlar: +2–3 hafta

4.2. To'g'ri ishlab chiqish tartibi (muhim!)
1.	Avval DB schema va migration — bu poydevor. O'zgarsa hamma narsa o'zgaradi.
2.	Keyin auth va rol tizimi — boshqa hamma narsa shunga bog'liq.
3.	Keyin fayl yuklash — bu eng murakkab, erta hal qilinsin.
4.	Keyin to'lov — real pul bilan ishlash. Eng ko'p test talab qiladi.
5.	Oxirida UI/UX — mantiq ishlasa, interfeysi yaxshilanadi.

🔴  DICOM viewer va AI — bularni birinchi emas, oxirgi qiling. Murakkab, vaqt oladi, MVP uchun shart emas.
⚠️  Har bosqichdan keyin Telegram da real sinab ko'ring. Oxirida hammasi birlashtirganda muammo bo'lmaydi.

  QISM 5 — TEXNOLOGIYALAR TANLASH ASOSLARI  

5.1. Backend texnologiyalar
Kutubxona	Vazifasi	Alternativ
Express.js	HTTP server, routing	Fastify (tezroq, lekin murakkab)
node-postgres (pg)	PostgreSQL ulanish	Prisma ORM (lekin og'irroq)
node-pg-migrate	DB migratsiyalar	Knex, Flyway
jsonwebtoken	JWT yaratish/tekshirish	Paseto (zamonaviyroq)
BullMQ + Redis	Asinxron vazifalar navbati	Agenda, bee-queue
pdfkit	PDF generatsiya	Puppeteer (og'irroq), jsPDF
@aws-sdk/client-s3	B2/S3 fayl operatsiyalari	axios to'g'ridan (qiyinroq)
node-telegram-bot-api	Bot xabar yuborish	Grammy, Telegraf
winston	Structured logging	Pino (tezroq)
node-cron	Vaqtli vazifalar	BullMQ delayed jobs
zod	Schema validatsiya	Joi, yup
sentry/node	Xato monitoring	Bugsnag, Datadog

5.2. Frontend texnologiyalar
Kutubxona	Vazifasi	Nima uchun shu
React 18	UI framework	Eng keng tarqalgan, ko'p manba
TypeScript	Xavfsiz kod	Xatolarni kompilyatsiya vaqtida topish
Vite	Build tool	Webpack dan 10x tez, oddiy sozlash
Zustand	Global state	Redux dan 5x kam kod
TanStack Query	Server state + caching	Polling, retry, cache avtomatik
React Hook Form	Forma boshqarish	Minimal qayta render, tez
Zod	Validatsiya sxemasi	Backend bilan umumiy schema
axios	HTTP so'rovlar	Ko'p funksional, interceptors
i18next	Ko'p tillik	Eng mashhur i18n yechim
Tailwind CSS	Stil	Mini App uchun engil va tez
Cornerstone.js	DICOM viewer	Tibbiy standart, bepul

5.3. Xizmatlar va platformalar
Xizmat	Maqsad	Narx (oylik)
Railway.app	Backend hosting + PostgreSQL	~$5-15
Vercel	Frontend hosting	Bepul (hobby plan)
Backblaze B2	Fayl saqlash (DICOM, PDF)	~$0.006/GB
Payme Business	Asosiy to'lov tizimi	1.5% komissiya
Click	Qo'shimcha to'lov	1% komissiya
Sentry.io	Xato monitoring	Bepul (5000 xato/oy)
UptimeRobot	Server holati kuzatish	Bepul
GitHub	Kod saqlash + CI/CD	Bepul
OpenAI	AI tasvir tahlili	$0.002-0.01/tasvir
Jami MVP	Taxminiy oy xarajati	~$20-30/oy

  QISM 6 — DASTURCHI UCHUN MUHIM KO'RSATMALAR  

6.1. Kod sifati qoidalari
Qoida	Tavsif
DRY prinsipi	Takrorlanuvchi kod — funksiyaga chiqarilsin
Har endpoint	Input validatsiya → Biznes logika → DB → Javob (bu tartib o'zgarmasin)
Har DB so'rov	try-catch ichida, xato log ga yozilsin
Environment	Hech qanday secret kod ichida bo'lmaydi — faqat .env orqali
TypeScript	any tiplari ishlatilmasin — hamma narsa typed bo'lsin
Kodni izohlar	Murakkab logika uchun // izoh. Oddiy narsa uchun shart emas
Commit xabari	feat: to'lov webhook qo'shildi — aniq va qisqa
Branch strategiya	main (stable) + dev (ishchi) + feature/* (yangi funksiyalar)

6.2. Ma'lumotlar bazasi yozish qoidalari
✅  Har muhim amal (to'lov, xulosa, holat o'zgarishi) — transaction ichida
✅  Har jadvalda created_at va updated_at — avtomatik
✅  Hech narsa o'chirilmaydi — is_deleted=true yoki archived holat
✅  Foreign key constraints — DB darajasida ma'lumot yaxlitligi
✅  Index — tez-tez qidiriladigan ustunlar uchun (status, patient_id, created_at)
⚠️  N+1 muammo: ro'yxat uchun har element uchun alohida DB so'rov — JOIN bilan hal qilish
⚠️  Paginator: hamma ro'yxatlar LIMIT/OFFSET bilan — 10 000 yozuv bir so'rovda kelmasin

6.3. Telegram Mini App xususiyatlari
Muammo	Yechim
Viewport balandligi o'zgarishi	Telegram.WebApp.onEvent('viewportChanged') tinglansin
Sahifa scroll	CSS: html,body {height:100%;overflow:hidden} — native scroll
Orqaga tugma	BackButton.show/hide — har ekran o'zgarishida boshqarilsin
Asosiy tugma	MainButton — pastdagi katta tugma, ko'rinishi tez-tez o'zgaradi
Rangi mavzu	themeParams ishlatilsin — dark/light mode avtomatik
Fayl yuklash	<input type='file'> Telegram da ishlaydi — maxsize tekshirilsin
Tashqi havola	Telegram.WebApp.openLink() — oddiy window.open() emas
Orqaga gesture	iOS swipe orqaga — enableClosingConfirmation() bilan himoya
initData eskirishi	1 soat — refresh uchun sahifani qayta yuklash kerak

6.4. Ishga tushirishdan OLDIN tekshiruv ro'yxati
Soha	Tekshirish
✅ Xavfsizlik	initData verifikatsiya, JWT, CORS, rate limit — hammasi ishlayapti
✅ To'lov	Payme sandbox da real to'lov sinaldi — webhook ishlamoqda
✅ Fayl	DICOM, JPG, PDF — yuklash va yuklab olish sinaldi
✅ PDF	Xulosa PDF to'g'ri generatsiya qilinmoqda, imzo mavjud
✅ Bildirishnoma	Barcha xabarlar test rejimida yuborildi va qabul qilindi
✅ Cron	Eslatma va muddatlar cron job ishlayapti
✅ Xato	Sentry da xatolar ko'rinmoqda
✅ Monitoring	UptimeRobot sozlangan, health endpoint ishlayapti
✅ DB	Backup mavjud, migration to'g'ri bajarilgan
✅ Hujjat	YaTT ochiq, Payme merchant tasdiqlangan, litsenziya tayyor
✅ Shartnoma	Yurist ko'rib chiqqan shartnoma matn Bot da mavjud
✅ Test	3–5 real bemor bilan beta sinov o'tkazildi


Ushbu qo'llanma va avvalgi TT + Amalga oshirish hujjati bilan birgalikda loyiha to'liq va professional darajada qurilishi mumkin.
