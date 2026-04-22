/**
 * Phase 3.1: Canonical types moved to @medsmart/types.
 * See disease.ts for the migration pattern.
 */
export type {
  WizardStep,
  WizardSymptomAnswer,
  RiskFactorValue,
  RiskFactorGroup,
  RiskFactorAnswer,
  TimelineContext,
  PriorConsult,
  TimelineAnswer,
  DifferentialDiagnosisRow,
  MatchScores,
  MatcherWizardState,
} from '@medsmart/types/matcher-wizard';
