/**
 * Oddiy slug generator — kirilcha/lotin harflar, raqamlar va tire qoldiradi,
 * boshqa belgilarni `-` bilan almashtiradi, chekkalardagi tirelar olib
 * tashlanadi. Disease slug uchun: `slugify(nameUz) + '-' + icd10.toLowerCase().replace('.', '')`.
 */
export function slugify(input: string): string {
  if (!input) return '';

  // O'zbek lotin yozuvidagi maxsus belgilarni oddiylashtirish
  const replacements: Record<string, string> = {
    "'": '',
    '`': '',
    '’': '',
    ʻ: '',
    ʼ: '',
    ʽ: '',
  };

  let out = input.toLowerCase();
  for (const [from, to] of Object.entries(replacements)) {
    out = out.split(from).join(to);
  }

  // Unicode letter/digit qoldiramiz, qolganini `-` ga
  out = out
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // diakritiklar
    .replace(/[^a-z0-9\u0400-\u04ff]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return out;
}

/**
 * Disease uchun slug: `slugify(nameUz) + '-' + icd10 (lowercased, nuqtasiz)`.
 * Masalan: `('Gipertoniya', 'I10')` -> `gipertoniya-i10`.
 */
export function diseaseSlug(nameUz: string, icd10: string): string {
  const base = slugify(nameUz || '');
  const code = (icd10 || '').toLowerCase().replace(/\./g, '');
  if (!base && !code) return '';
  if (!base) return code;
  if (!code) return base;
  return `${base}-${code}`;
}
