import { useCallback, useMemo, useState } from 'react';
import type {
  DifferentialDiagnosisRow,
  MatchScores,
  RiskFactorAnswer,
  RiskFactorValue,
  TimelineAnswer,
  WizardStep,
} from '../types/api/matcher-wizard';
import type { AnswerValue } from '../types/api/triage';
import type { DiseaseSymptomWithWeight } from '../types/api/symptom';
import type { DiseaseDetail, DiseaseListItem } from '../types/api/disease';

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
  const answeredRatio = useMemo(() => {
    if (symptoms.length === 0) return 0;
    let count = 0;
    for (const sym of symptoms) {
      const ans = answers.get(sym.code);
      if (ans && ans !== 'UNKNOWN') count++;
    }
    return count / symptoms.length;
  }, [symptoms, answers]);

  /** Count of YES answers on symptoms flagged isRedFlag. */
  const redFlagCount = useMemo(() => {
    let count = 0;
    for (const sym of symptoms) {
      if (sym.isRedFlag && answers.get(sym.code) === 'YES') count++;
    }
    return count;
  }, [symptoms, answers]);

  /** Risk tier from the count of YES risk answers (TZ §3.1.3 Bosqich 4). */
  const riskTier: MatchScores['risk'] = useMemo(() => {
    let yes = 0;
    riskFactors.forEach((rf) => {
      if (rf.value === 'YES') yes++;
    });
    if (yes >= 6) return 'VERY_HIGH';
    if (yes >= 4) return 'HIGH';
    if (yes >= 2) return 'MODERATE';
    return 'LOW';
  }, [riskFactors]);

  /** Builds DDx rows from nearby candidate diseases. Real backend returns this
   *  from `/triage/session/:id/ddx`; here we fake a spread around baseScore. */
  const ddx: DifferentialDiagnosisRow[] = useMemo(() => {
    const primaryRow: DifferentialDiagnosisRow = {
      diseaseId: primaryDisease.id,
      slug: primaryDisease.slug,
      nameUz: primaryDisease.nameUz,
      icd10: primaryDisease.icd10,
      matchScore: baseScore,
      confidence: 0.5, // placeholder; real engine computes delta/top
      deltaFromTop: 0,
      redFlag: redFlagCount > 0,
    };

    const others = candidateDiseases
      .filter((d) => d.id !== primaryDisease.id)
      .slice(0, 4)
      .map<DifferentialDiagnosisRow>((d, idx) => ({
        diseaseId: d.id,
        slug: d.slug,
        nameUz: d.nameUz,
        icd10: d.icd10,
        // Smoothly decreasing scores so the UI visibly orders them.
        matchScore: Math.max(0.15, baseScore * (0.75 - idx * 0.12)),
        confidence: 0.3,
        deltaFromTop: baseScore - baseScore * (0.75 - idx * 0.12),
        redFlag: false,
      }));

    return [primaryRow, ...others]
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }, [primaryDisease, candidateDiseases, baseScore, redFlagCount]);

  const confidence = useMemo(() => {
    if (ddx.length < 2) return 0;
    const top = ddx[0].matchScore;
    const next = ddx[1].matchScore;
    if (top === 0) return 0;
    return Math.max(0, Math.min(1, (top - next) / top));
  }, [ddx]);

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
