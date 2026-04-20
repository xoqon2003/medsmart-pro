import { useLocale } from '../../../store/LocaleContext';
import type {
  TimelineAnswer,
  TimelineContext,
  PriorConsult,
} from '../../../types/api/matcher-wizard';
import type { TranslationKey } from '../../../lib/i18n';

interface Props {
  value: TimelineAnswer;
  onChange: (next: TimelineAnswer) => void;
}

const ONSET_OPTIONS: Array<{
  key: NonNullable<TimelineAnswer['onsetBucket']>;
  labelKey: TranslationKey;
}> = [
  { key: 'TODAY', labelKey: 'wizard.step3.onset.today' },
  { key: 'LAST_WEEK', labelKey: 'wizard.step3.onset.lastWeek' },
  { key: 'LAST_MONTH', labelKey: 'wizard.step3.onset.lastMonth' },
  { key: 'LAST_6_MONTHS', labelKey: 'wizard.step3.onset.last6' },
  { key: 'OVER_YEAR', labelKey: 'wizard.step3.onset.overYear' },
];

const CONTEXT_OPTIONS: Array<{ key: TimelineContext; labelKey: TranslationKey }> = [
  { key: 'HOME', labelKey: 'wizard.step3.context.home' },
  { key: 'WORK', labelKey: 'wizard.step3.context.work' },
  { key: 'SPORT', labelKey: 'wizard.step3.context.sport' },
  { key: 'TRAVEL', labelKey: 'wizard.step3.context.travel' },
  { key: 'POST_MEAL', labelKey: 'wizard.step3.context.postMeal' },
  { key: 'NIGHT', labelKey: 'wizard.step3.context.night' },
];

const PRIOR_OPTIONS: Array<{ key: PriorConsult; labelKey: TranslationKey }> = [
  { key: 'GP', labelKey: 'wizard.step3.priorConsult.gp' },
  { key: 'SELF', labelKey: 'wizard.step3.priorConsult.self' },
  { key: 'NEVER', labelKey: 'wizard.step3.priorConsult.never' },
];

/**
 * Step 3 — onset bucket, context, and prior consultation history
 * (TZ §3.1.3 Bosqich 3). No body map yet; that's GAP-06, scheduled later.
 */
export function MatcherStep3Timeline({ value, onChange }: Props) {
  const { t } = useLocale();

  return (
    <div className="space-y-6 pb-4">
      <p className="text-xs text-muted-foreground">
        {t('wizard.step3.subtitle')}
      </p>

      <fieldset>
        <legend className="text-sm font-semibold text-foreground mb-2">
          {t('wizard.step3.onset')}
        </legend>
        <div className="flex flex-wrap gap-1.5" role="radiogroup">
          {ONSET_OPTIONS.map((opt) => {
            const selected = value.onsetBucket === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ ...value, onsetBucket: opt.key })}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-foreground mb-2">
          {t('wizard.step3.context')}
        </legend>
        <div className="flex flex-wrap gap-1.5" role="radiogroup">
          {CONTEXT_OPTIONS.map((opt) => {
            const selected = value.context === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ ...value, context: opt.key })}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-foreground mb-2">
          {t('wizard.step3.priorConsult')}
        </legend>
        <div className="flex flex-col gap-1.5" role="radiogroup">
          {PRIOR_OPTIONS.map((opt) => {
            const selected = value.priorConsult === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ ...value, priorConsult: opt.key })}
                className={`text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
