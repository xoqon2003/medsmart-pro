import { Loader2 } from 'lucide-react';
import { SymptomChipRow } from '../SymptomChipRow';
import { useLocale } from '../../../store/LocaleContext';
import type { AnswerValue } from '../../../types/api/triage';
import type { DiseaseSymptomWithWeight } from '../../../types/api/symptom';

interface Props {
  symptoms: DiseaseSymptomWithWeight[];
  answers: Map<string, AnswerValue>;
  onAnswer: (code: string, value: AnswerValue) => void;
  isLoading: boolean;
  validationError?: string;
}

/**
 * Step 1 of GAP-01 wizard — symptom checklist with 4-way answer.
 * Delegates chip rendering to the existing SymptomChipRow (no visual change).
 */
export function MatcherStep1Symptoms({
  symptoms,
  answers,
  onAnswer,
  isLoading,
  validationError,
}: Props) {
  const { t } = useLocale();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">{t('triage.loading')}</span>
      </div>
    );
  }

  if (symptoms.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        {t('triage.noSymptoms')}
      </div>
    );
  }

  return (
    <div className="pb-4">
      <p className="text-xs text-muted-foreground mb-3">
        {t('wizard.step1.subtitle')}
      </p>
      {symptoms.map((sym) => (
        <SymptomChipRow
          key={sym.code}
          symptom={sym}
          answer={answers.get(sym.code)}
          onChange={onAnswer}
        />
      ))}
      {validationError && (
        <p
          role="alert"
          className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {validationError}
        </p>
      )}
    </div>
  );
}
