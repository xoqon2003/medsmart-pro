# Demo Ma'lumotlari va Test Stsenariylari

> **Hujjat ID:** PRC-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Demo kirish ma'lumotlari

### Web Platform (https://medsmart-pro.vercel.app/web)

| Rol | Telefon | PIN | User ID | To'liq ism |
|-----|---------|-----|---------|-----------|
| Admin | +998903333333 | 000000 | 4 | Dilshod Rahimov |
| Operator | +998902222222 | 654321 | 3 | Madina Karimova |
| Kassir | +998908888888 | 222222 | 9 | Gulnora Toshmatova |
| Radiolog | +998901111111 | 123456 | 2 | Jasur Yusupov |
| Mutaxassis | +998906666666 | 111111 | 7 | Sarvar Umarov |
| Shifokor | +998907777777 | 777777 | 8 | Eldor Mamatov |

### Mini App (https://medsmart-pro.vercel.app/)
- Rol tanlash ekranida istalgan rolni tanlash mumkin
- Bemor: Aziz Karimov (User ID: 1)

## Test stsenariylari

### 1. Bemor ariza topshirish

1. Mini App ochish → Rol: "Bemor"
2. "Yangi ariza" tugmasini bosish
3. Tasvir yuklash (JPG fayl)
4. Anamnez to'ldirish (shikoyat, og'riq, allergiya)
5. Xizmat: "AI + Radiolog" → Narx: 150,000 so'm
6. Shartnomani qabul qilish (3 checkbox)
7. To'lov usuli tanlash → "Payme"
8. Ariza holatini kuzatish

### 2. Web Panel - Admin

1. Web Panel ochish → Login: +998903333333 / 000000
2. KPI kartalarni ko'rish (arizalar soni, daromad, foydalanuvchilar)
3. Haftalik grafik ko'rish
4. Xizmat taqsimoti (pie chart)
5. Tizim holati (DB, API, Payment gateway)

### 3. Kassir smenasi

1. Web Panel → Login: +998908888888 / 222222
2. Smena ochish (boshlang'ich qoldiq kiritish)
3. To'lovlarni ko'rish va qabul qilish
4. Statistika: naqd / karta / onlayn taqsimoti
5. Smena yopish (jami hisob-kitob)

### 4. Radiolog xulosa yozish

1. Mini App → Rol: "Radiolog"
2. Yangi arizalar ro'yxatini ko'rish
3. Arizani ochish → Bemor ma'lumotlari va tasvirlarni ko'rish
4. "Qabul qilish" tugmasi
5. Xulosa yozish (tavsif, topilmalar, tavsiyalar)
6. "Tasdiqlash" → PDF generatsiya

### 5. Cross-platform sinxronizatsiya

1. Mini App dan ariza topshirish (Bemor)
2. Web Panel da o'sha ariza ko'rinishini tekshirish (Operator)
3. Web Panel dan javob berish (Radiolog)
4. Mini App da xulosa ko'rinishini tekshirish (Bemor)

## Mock ma'lumotlar

Mock ma'lumotlar `src/app/data/mockData.ts` faylida:
- 10+ foydalanuvchi (barcha rollar)
- 20+ ariza (turli holatlarda)
- Bildirishnomalar
- Kassir to'lovlari
- Narx konfiguratsiyasi
