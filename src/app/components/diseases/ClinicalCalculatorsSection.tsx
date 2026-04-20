import { Calculator } from 'lucide-react';
import { ClinicalCalculator } from './ClinicalCalculator';
import { getApplicableCalculators } from '../../calculators';
import { useLocale } from '../../store/LocaleContext';
import type { AudienceLevel } from '../../constants/disease-tabs';

interface Props {
  category: string | undefined;
  icd10: string | undefined;
  audience: AudienceLevel;
}

/**
 * Disease-card calculators panel (GAP-05, TZ §3.5).
 *
 * Renders every calculator whose filters match the current disease —
 * evaluates both `applicableCategories` (broad) and
 * `applicableIcd10Prefixes` (narrow). Silently collapses to null when
 * no calculator applies so we don't leave empty sections behind.
 *
 * Example: On the Gipertoniya (I10) card SCORE2 + CKD-EPI are relevant.
 * On the Fibrillatsiya predsersdiy (I48) card we additionally surface
 * CHA₂DS₂-VASc + HAS-BLED — but those never show on I10 because their
 * ICD prefix gate excludes anything outside I48.*.
 */
export function ClinicalCalculatorsSection({
  category,
  icd10,
  audience,
}: Props) {
  const { t } = useLocale();
  const calculators = getApplicableCalculators({ category, icd10 });

  if (calculators.length === 0) return null;

  return (
    <section
      className="mt-8 space-y-3"
      aria-labelledby="clinical-calculators-heading"
    >
      <div className="flex items-center gap-2">
        <Calculator className="w-4 h-4 text-primary" aria-hidden="true" />
        <h2
          id="clinical-calculators-heading"
          className="text-base font-semibold"
        >
          {t('calc.section.title')}
        </h2>
      </div>
      <div className="space-y-3">
        {calculators.map((schema) => (
          <ClinicalCalculator key={schema.id} schema={schema} audience={audience} />
        ))}
      </div>
    </section>
  );
}
