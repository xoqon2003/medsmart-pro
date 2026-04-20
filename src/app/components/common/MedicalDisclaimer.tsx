import React from 'react';
import { Info } from 'lucide-react';
import { MEDICAL_COPY } from '../../lib/medical-copy';
import { useLocale } from '../../store/LocaleContext';

interface MedicalDisclaimerProps {
  variant?: 'inline' | 'banner';
}

/**
 * Tibbiy ogohlantirish komponenti.
 * - `inline` — 1 qator, border-left uslubida (DiseaseCard ichida, Sheet pastida)
 * - `banner` — to'liq matn, amber fon (sahifa pastida)
 */
export function MedicalDisclaimer({ variant = 'inline' }: MedicalDisclaimerProps) {
  const { t } = useLocale();

  if (variant === 'banner') {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              {t('disclaimer.title')}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed whitespace-pre-line">
              {t('disclaimer.body')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // inline variant
  return (
    <div className="border-l-2 border-muted pl-2 flex items-center gap-1.5">
      <Info className="w-3 h-3 text-muted-foreground shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        {t('disclaimer.triage')}
      </p>
    </div>
  );
}

// MEDICAL_COPY hali boshqa komponentlarda ishlatilishi uchun re-export
export { MEDICAL_COPY };
