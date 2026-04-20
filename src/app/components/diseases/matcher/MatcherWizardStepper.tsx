import { Check } from 'lucide-react';
import { useLocale } from '../../../store/LocaleContext';
import type { WizardStep } from '../../../types/api/matcher-wizard';
import type { TranslationKey } from '../../../lib/i18n';

interface Props {
  current: WizardStep;
  totalSteps?: 4;
}

const STEP_LABEL_KEYS: Record<WizardStep, TranslationKey> = {
  1: 'wizard.step1.title',
  2: 'wizard.step2.title',
  3: 'wizard.step3.title',
  4: 'wizard.step4.title',
};

/**
 * 4-step progress indicator (GAP-01, TZ §3.1.3).
 *
 * A11y: conveys current step via `aria-current="step"` on the active item
 * and a live announcement such as "Bosqich 2 dan 4".
 */
export function MatcherWizardStepper({ current, totalSteps = 4 }: Props) {
  const { t } = useLocale();
  const steps: WizardStep[] = [1, 2, 3, 4];

  return (
    <nav
      aria-label={`${t('wizard.step')} ${current} ${t('wizard.of')} ${totalSteps}`}
      className="px-5 py-3"
    >
      <ol className="flex items-center gap-2" role="list">
        {steps.map((step, idx) => {
          const isDone = step < current;
          const isActive = step === current;
          const stateClass = isDone
            ? 'bg-primary text-primary-foreground border-primary'
            : isActive
              ? 'bg-primary/15 text-primary border-primary'
              : 'bg-muted text-muted-foreground border-border';

          return (
            <li
              key={step}
              className="flex items-center flex-1 last:flex-none gap-2"
              aria-current={isActive ? 'step' : undefined}
            >
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${stateClass}`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-[11px] font-medium hidden sm:inline whitespace-nowrap ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t(STEP_LABEL_KEYS[step])}
              </span>
              {idx < steps.length - 1 && (
                <span
                  className={`flex-1 h-px ml-1 ${
                    step < current ? 'bg-primary' : 'bg-border'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {t('wizard.step')} {current} {t('wizard.of')} {totalSteps}
      </p>
    </nav>
  );
}
