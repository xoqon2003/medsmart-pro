import { uz } from './uz';
import { ru } from './ru';
import { en } from './en';
export type { Locale, TranslationKey } from './types';

export const translations = { uz, ru, en } as const;

export function t(locale: import('./types').Locale, key: import('./types').TranslationKey): string {
  return (translations[locale] as Record<string, string>)[key]
    ?? (translations['uz'] as Record<string, string>)[key]
    ?? key;
}
