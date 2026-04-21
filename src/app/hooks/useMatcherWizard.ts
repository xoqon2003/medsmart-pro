import { useCallback, useMemo, useState } from 'react';
import type {
  MatchScores,
  RiskFactorAnswer,
  RiskFactorValue,
  TimelineAnswer,
  WizardStep,
} from '../types/api/matcher-wizard';
import type { AnswerValue } from '../types/api/triage';
import type { DiseaseSymptomWithWeight } from '../types/api/symptom';
import type { DiseaseDetail, DiseaseListItem } from '../types/api/disease';
import {
  computeRiskTier,
  computeAnsweredRatio,
  computeRedFlagCount,
  computeDdx,
  computeConfidence,
} from '../lib/matcher-wizard-logic';

/**
 * Wizard-level state (GAP-01). Bridges the existing `useSymptomMatcher`
 * (step 1 score) with the new risk-factor, timeline, and DDx data.
 *
 * The hook is deliberately backend-free for now — every field is a pure
 * reduction over in-memory state. When the SymptomMatchSession migration
 * lands, replace `persistStep` with a real PATCH call.
 */
export function useMatcherWizard(opts: {
  symptoms: DiseaseSymptomWithWeight[];
  answers: Map<string, AnswerValue>;
  primaryDisease: DiseaseDetail;
  candidateDiseases: DiseaseListItem[];
  baseScore: number;
}) {
  const { symptoms, answers, primaryDisease, candidateDiseases, baseScore } = opts;

  const [step, setStep] = useState<WizardStep>(1);
  const [riskFactors, setRiskFactors] = useState<Map<string, RiskFactorAnswer>>(
    new Map(),
  );
  const [timeline, setTimeline] = useState<TimelineAnswer>({});
  const [validationError, setValidationError] = useState<string | undefined>();

  const setRiskFactor = useCallback((id: string, value: RiskFactorValue) => {
    setRiskFactors((prev) => {
      const next = new Map(prev);
      const [group] = id.split('.');
      next.set(id, {
        id,
        group: group as RiskFactorAnswer['group'],
        value,
      });
      return next;
    });
  }, []);

  const updateTimeline = useCallback((next: TimelineAnswer) => {
    setTimeline(next);
  }, []);

  /** Number of symptoms with any non-UNKNOWN answer / total. */
  const answeredRatio = useMemo(
    () => computeAnsweredRatio(symptoms, answers),
    [symptoms, answers],
  );

  /** Count of YES answers on symptoms flagged isRedFlag. */
  const redFlagCount = useMemo(
    () => computeRedFlagCount(symptoms, answers),
    [symptoms, answers],
  );

  /** Risk tier from the count of YES risk answers (TZ §3.1.3 Bosqich 4). */
  const riskTier: MatchScores['risk'] = useMemo(
    () => computeRiskTier(riskFactors),
    [riskFactors],
  );

  /** Builds DDx rows from nearby candidate diseases. */
  const ddx = useMemo(
    () => computeDdx(primaryDisease, candidateDiseases, baseScore, redFlagCount),
    [primaryDisease, candidateDiseases, baseScore, redFlagCount],
  );

  const confidence = useMemo(() => computeConfidence(ddx), [ddx]);

  const scores: MatchScores = useMemo(
    () => ({
      match: baseScore,
      answered: answeredRatio,
      risk: riskTier,
      redFlagCount,
      confidence,
    }),
    [baseScore, answeredRatio, riskTier, redFlagCount, confidence],
  );

  const canProceed = useCallback((): boolean => {
    if (step === 1) {
      let yesCount = 0;
      for (const val of answers.values()) {
        if (val === 'YES') yesCount++;
      }
      return yesCount >= 1;
    }
    return true;
  }, [step, answers]);

  const goNext = useCallback(() => {
    if (!canProceed()) {
      setValidationError('wizard.step1.errorMinSymptoms');
      return false;
    }
    setValidationError(undefined);
    setStep((s) => (s < 4 ? ((s + 1) as WizardStep) : s));
    return true;
  }, [canProceed]);

  const goBack = useCallback(() => {
    setValidationError(undefined);
    setStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s));
  }, []);

  const resetWizard = useCallback(() => {
    setStep(1);
    setRiskFactors(new Map());
    setTimeline({});
    setValidationError(undefined);
  }, []);

  return {
    step,
    riskFactors,
    timeline,
    ddx,
    scores,
    validationError,
    setRiskFactor,
    updateTimeline,
    goNext,
    goBack,
    resetWizard,
  };
}
