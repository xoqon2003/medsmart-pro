# Vizyon va Doira

> **Hujjat ID:** BIZ-001 | **Versiya:** 1.0 | **Sana:** 2026-03-25

## Loyiha vizyoni

MedSmart-Pro - O'zbekistondagi birinchi to'liq raqamli tibbiy diagnostika platformasi. Bemorlar uyidan chiqmasdan radiologik tasvirlarni mutaxassislarga yuborib, professional xulosa olishlari mumkin.

## Muammo

| Hozirgi holat | Maqsadli holat |
|---------------|----------------|
| Bemor klinikaga borib, navbat kutadi | Telegram orqali ariza topshiradi |
| Xulosa qog'ozda, yo'qolishi mumkin | Raqamli xulosa, PDF yuklab olish |
| Faqat bitta mutaxassis ko'radi | AI + Radiolog + Mutaxassis zanjiri |
| To'lov faqat naqd | 6+ onlayn to'lov usuli |
| Ma'lumot biror joyda saqlanmaydi | To'liq audit log va tarix |

## Doira (Scope)

### MVP doirasi (hozirgi)

#### Bemor xizmatlari
1. **Radiologik tahlil** - DICOM/JPG tasvirlarni yuklash, AI + mutaxassis xulosasi
2. **Konsultatsiya** - Onlayn (video/telefon/chat) va oflayn (klinika/uy/sanatoriy)
3. **Tekshiruv** - Laboratoriya, UZI, rentgen markazlariga yozilish
4. **Uyga chaqirish** - Shifokorni uyga chaqirish xizmati

#### Professional panellar
5. **Radiolog paneli** - Arizalarni qabul qilish, xulosa yozish
6. **Shifokor paneli** - Bemorlar ro'yxati, konsultatsiya
7. **Mutaxassis paneli** - Qo'shimcha xulosa berish
8. **Operator paneli** - Arizalar oqimini boshqarish
9. **Kassir paneli** - To'lovlarni qayd qilish, smena boshqaruvi
10. **Admin paneli** - KPI, statistika, tizim monitoring

#### Platformalar
11. **Mini App** - Telegram bot orqali mobil interfeys
12. **Web Platform** - Desktop professional panel

### Kelajakdagi doira (v2.0+)
- Real backend API (NestJS + PostgreSQL)
- WebSocket real-time yangilanishlar
- S3/MinIO fayl saqlash
- SMS/Email bildirishnomalar
- To'lov provayderlar integratsiyasi (real)
- HL7 FHIR interoperability
- Mikroservis arxitekturasi

## Biznes maqsadlari

| # | Maqsad | KPI | Muddat |
|---|--------|-----|--------|
| BG-01 | Onlayn ariza topshirish | 100+ ariza/oy | Q2 2026 |
| BG-02 | Xulosa berish vaqtini qisqartirish | < 24 soat | Q2 2026 |
| BG-03 | To'lov muvaffaqiyat darajasi | > 95% | Q3 2026 |
| BG-04 | Foydalanuvchilar soni | 1000+ bemor | Q4 2026 |
| BG-05 | Tibbiy xodimlar | 50+ mutaxassis | Q4 2026 |

## Cheklovlar

1. **Texnik:** Hozirda mock backend - real API kerak
2. **Huquqiy:** Shaxsiy tibbiy ma'lumotlar himoyasi (kelajakda HIPAA ga mos)
3. **Moliyaviy:** To'lov provayderlari bilan shartnoma kerak
4. **Kadrlar:** Tibbiy mutaxassislarni jalb qilish
