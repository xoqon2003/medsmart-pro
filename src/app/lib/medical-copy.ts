/**
 * Barcha tibbiy-huquqiy matnlar bir joyda.
 * Komponentlar faqat shu konstantadan import qiladi — matnlarni alohida o'zgartirish oson.
 */
export const MEDICAL_COPY = {
  disclaimerTitle: "Tibbiy ma'lumot haqida",
  disclaimerBody: `Bu platforma ma'lumot berish maqsadida yaratilgan bo'lib, shifokor bilan muloqotni almashtirmaydi.\nUshbu ma'lumotlar O'zbekiston tibbiyot standartlari asosida tayyorlangan (O'zDSt).\nShoshilinch tibbiy yordam uchun: 103`,

  triageDisclaimer:
    "Bu test natijasi tibbiy tashxis emas. Faqat yo'naltiruvchi ma'lumot.",

  consentText: `Men quyidagilarni tushunaman va qabul qilaman:\n1. Bu platforma tibbiy maslahat bermaydi\n2. Tashxis faqat shifokor tomonidan qo'yilishi mumkin\n3. Shoshilinch holatlarda 103 ga qo'ng'iroq qilishim kerak\n4. Shaxsiy ma'lumotlarim O'zbekiston qonunlari asosida himoyalanadi`,

  emergencyCallText: "103 ga qo'ng'iroq qiling",
  seekCareText: "Shifokorga murojaat qiling",
  selfMedicateWarning: "O'z-o'zini davolash xavfli bo'lishi mumkin",
} as const;
