// Dev rejimida ishlatiladi — mock ma'lumotlar bilan.
// Production build'da vite.config.ts aliasi bu faylni core-switch.prod.ts bilan almashtiradi,
// natijada mockData.ts (858 sat) production bundle'dan chiqariladi.
export * from './mock';
