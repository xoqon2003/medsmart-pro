# Operatsion Qo'llanma (Runbook)

> **Hujjat ID:** OPS-002 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Kunlik operatsiyalar

### Development serverni ishga tushirish
```bash
cd "Delop qilingani (Claude code)"
npm install       # birinchi marta yoki dependency o'zgarganda
npm run dev       # localhost:5173
```

### Production build
```bash
npm run build     # dist/ papkasiga
npm run preview   # build natijasini tekshirish
```

## Hodisa javob berish (Incident Response)

### Darajalar

| Daraja | Tavsif | Javob vaqti | Eskalatsiya |
|--------|--------|------------|-------------|
| **P0** | Tizim to'liq ishlamaydi | 15 daqiqa | Darhol |
| **P1** | Asosiy funksiya ishlamaydi (to'lov, ariza) | 1 soat | 2 soat ichida |
| **P2** | Qo'shimcha funksiya ishlamaydi | 4 soat | 1 ish kuni |
| **P3** | Kichik xato, UI muammo | 1 ish kuni | 3 ish kuni |

### P0 - Tizim ishlamaydi
1. Vercel Dashboard tekshirish → Deployment status
2. Build loglarni ko'rish → Error aniqlash
3. Oxirgi muvaffaqiyatli deploymentga qaytarish (rollback)
4. Jamoaga xabar berish

### P1 - Asosiy funksiya muammosi
1. Browser console tekshirish → Error message
2. Network tab → API xatolar
3. Muammoli komponentni aniqlash
4. Hotfix branch yaratish → Fix → Test → Deploy

## Umumiy muammolar va yechimlari

### Build xatosi
```bash
# Node modules tozalash
rm -rf node_modules
npm install

# TypeScript xatolarni tekshirish
npx tsc --noEmit
```

### Vercel deployment muammosi
1. `vercel.json` routing tekshirish
2. Build command to'g'ri ekanini tekshirish
3. Environment variables to'g'ri ekanini tekshirish

### Mini App Telegram da ochilmaydi
1. Bot token to'g'ri ekanini tekshirish
2. HTTPS sertifikat amal qilayotganini tekshirish
3. Telegram Bot API webhook tekshirish

## Backup va Recovery (kelajak)

| Ma'lumot | Backup chastotasi | Saqlash muddati |
|----------|-------------------|-----------------|
| Database | Har 6 soatda | 30 kun |
| Fayllar (DICOM) | Real-time (S3 replication) | 1 yil |
| Konfiguratsiya | Git (har bir commit) | Cheksiz |
