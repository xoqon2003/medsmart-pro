import { useMemo } from 'react';
import { useLocale } from '../../../store/LocaleContext';
import {
  RISK_FACTORS,
  RISK_FACTOR_GROUPS,
  groupRiskFactors,
} from '../../../constants/risk-factors';
import type {
  RiskFactorAnswer,
  RiskFactorValue,
} from '../../../types/api/matcher-wizard';
import type { TranslationKey } from '../../../lib/i18n';

interface Props {
  answers: Map<string, RiskFactorAnswer>;
  onAnswer: (id: string, value: RiskFactorValue) => void;
}

const VALUE_ORDER: RiskFactorValue[] = ['YES', 'NO', 'UNKNOWN'];
const VALUE_STYLES: Record<RiskFactorValue, string> = {
  YES: 'bg-red-100 text-red-800 border-red-300',
  NO: 'bg-green-100 text-green-800 border-green-300',
  UNKNOWN: 'bg-gray-100 text-gray-600 border-gray-300',
};
const VALUE_LABEL_KEYS: Record<RiskFactorValue, TranslationKey> = {
  YES: 'wizard.risk.yes',
  NO: 'wizard.risk.no',
  UNKNOWN: 'wizard.risk.unknown',
};

/**
 * Step 2 of GAP-01 wizard — risk-factor cycling toggles grouped into
 * lifestyle / genetic / comorbid / medications (TZ §3.1.3 Bosqich 2).
 *
 * The user cycles YES → NO → UNKNOWN. Default is UNKNOWN so nothing is
 * implied until the user explicitly answers.
 */
export function MatcherStep2RiskFactors({ answers, onAnswer }: Props) {
  const { t } = useLocale();
  const grouped = useMemo(() => groupRiskFactors(), []);

  void RISK_FACTORS; // ensures tree-shaking keeps the catalog referenced

  return (
    <div className="space-y-5 pb-4">
      <p className="text-xs text-muted-foreground">
        {t('wizard.step2.subtitle')}
      </p>

      {RISK_FACTOR_GROUPS.map((group) => (
        <section key={group.key} aria-labelledby={`risk-group-${group.key}`}>
          <h3
            id={`risk-group-${group.key}`}
            className="text-sm font-semibold text-foreground mb-2"
          >
            {t(group.titleKey)}
          </h3>
          <ul className="space-y-1.5" role="list">
            {grouped[group.key].map((rf) => {
              const current = answers.get(rf.id)?.value ?? 'UNKNOWN';
              return (
                <li
                  key={rf.id}
                  className="flex items-center justify-between gap-3 py-1.5"
                >
                  <span className="text-sm text-foreground leading-snug flex-1 min-w-0">
                    {t(rf.labelKey)}
                  </span>
                  <div
                    role="radiogroup"
                    aria-label={t(rf.labelKey)}
                    className="flex gap-1 shrink-0"
                  >
                    {VALUE_ORDER.map((val) => {
                      const selected = current === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => onAnswer(rf.id, val)}
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
                            selected
                              ? VALUE_STYLES[val]
                              : 'bg-background text-muted-foreground border-border hover:bg-muted'
                          }`}
                        >
                          {t(VALUE_LABEL_KEYS[val])}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
