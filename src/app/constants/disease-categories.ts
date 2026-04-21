/**
 * Kasalliklar kategoriyalari — mock va real backend uchun yagona manba.
 * `value` ni mock ma'lumotlar bazasidagi `category` field bilan mos bo'lishi SHART.
 */

export interface DiseaseCategory {
  value: string;
  labelUz: string;
  /** Unicode emoji ikon — filter chip va list badge uchun */
  emoji: string;
}

export const DISEASE_CATEGORIES: DiseaseCategory[] = [
  { value: 'yurak-qon-tomir', labelUz: 'Yurak-qon tomir',     emoji: '❤️' },
  { value: 'nafas-yollari',   labelUz: 'Nafas yo\'llari',      emoji: '🫁' },
  { value: 'endokrin',        labelUz: 'Endokrin',              emoji: '🦋' },
  { value: 'hazm',            labelUz: 'Hazm tizimi',           emoji: '🫃' },
  { value: 'nerv-tizimi',     labelUz: 'Nerv tizimi',          emoji: '🧠' },
  { value: 'tayanch-harakat', labelUz: 'Tayanch-harakat',      emoji: '🦴' },
  { value: 'buyrak-siydik',   labelUz: 'Buyrak-siydik',        emoji: '🫘' },
  { value: 'qon',             labelUz: 'Qon kasalliklari',      emoji: '🩸' },
  { value: 'onkologiya',      labelUz: 'Onkologiya',            emoji: '🔬' },
  { value: 'yuqumli',         labelUz: 'Yuqumli kasalliklar',   emoji: '🦠' },
  { value: 'teri',            labelUz: 'Teri kasalliklari',     emoji: '🧬' },
];

/** Barcha kategoriyalar: "Barchasi" + individual */
export const ALL_CATEGORY_OPTION: DiseaseCategory = {
  value: '',
  labelUz: 'Barchasi',
  emoji: '📋',
};

/** `value` bo'yicha UZ label topish (topilmasa value'ni qaytaradi) */
export function getCategoryLabel(value: string): string {
  const found = DISEASE_CATEGORIES.find((c) => c.value === value);
  return found ? found.labelUz : value;
}

/** `value` bo'yicha emoji topish */
export function getCategoryEmoji(value: string): string {
  const found = DISEASE_CATEGORIES.find((c) => c.value === value);
  return found ? found.emoji : '🏥';
}
