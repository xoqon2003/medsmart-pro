import React from 'react';
import { useLocale } from '../../store/LocaleContext';
import type { Locale } from '../../lib/i18n';

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'uz', label: 'UZ' },
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
];

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className = '' }: LocaleSwitcherProps) {
  const { locale, setLocale } = useLocale();

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {LOCALES.map(({ value, label }, idx) => (
        <React.Fragment key={value}>
          <button
            onClick={() => setLocale(value)}
            className={[
              'text-xs font-medium px-1.5 py-0.5 rounded transition-colors',
              locale === value
                ? 'text-foreground font-bold underline underline-offset-2'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
            aria-pressed={locale === value}
            aria-label={`Tilni ${label} ga o'zgartirish`}
          >
            {label}
          </button>
          {idx < LOCALES.length - 1 && (
            <span className="text-muted-foreground/40 text-xs select-none">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
