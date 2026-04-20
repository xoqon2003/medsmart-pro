import type { AnswerValue } from './triage';

/**
 * Matcher wizard types (GAP-01, TZ §3.1.4).
 *
 * The wizard has four steps: symptoms → risk factors → timeline → summary.
 * All answers are persisted into `SymptomMatchSession.userAnswers` (Json) on
 * the backend. Until the real schema migration lands, we keep the state
 * client-side and mirror it optimistically through the existing matchTriage
 * endpoint.
 */

export type WizardStep = 1 | 2 | 3 | 4;

/** Step-1 symptom answer (OPQRST-lite). */
export interface WizardSymptomAnswer {
  code: string;
  answer: AnswerValue;
  duration?: '1_3_DAYS' | '1_2_WEEKS' | '1_MONTH_PLUS' | '6_MONTHS_PLUS';
  onsetType?: 'ACUTE' | 'GRADUAL' | 'EPISODIC';
  frequency?: 'CONSTANT' | 'DAILY' | 'WEEKLY' | 'RARE';
  bodyZones?: string[];
  triggers?: Array<'EXERCISE' | 'STRESS' | 'FOOD' | 'MEDICATION' | 'UNKNOWN'>;
}

export type RiskFactorValue = 'YES' | 'NO' | 'UNKNOWN';

/** One of the 4 risk-factor groups. Keys double as translation keys. */
export type RiskFactorGroup =
  | 'lifestyle'
  | 'genetic'
  | 'comorbid'
  | 'medications';

/** A single risk factor toggle. `id` is a stable dotted key: "lifestyle.smoking". */
export interface RiskFactorAnswer {
  id: string;
  group: RiskFactorGroup;
  value: RiskFactorValue;
  /** Optional free-form detail, e.g. { packYears: 15 } for smoking. */
  detail?: Record<string, unknown>;
}

export type TimelineContext =
  | 'HOME'
  | 'WORK'
  | 'SPORT'
  | 'TRAVEL'
  | 'POST_MEAL'
  | 'NIGHT';

export type PriorConsult = 'GP' | 'SELF' | 'NEVER';

export interface TimelineAnswer {
  /** ISO date or relative bucket. */
  onsetBucket?:
    | 'TODAY'
    | 'LAST_WEEK'
    | 'LAST_MONTH'
    | 'LAST_6_MONTHS'
    | 'OVER_YEAR';
  context?: TimelineContext;
  priorConsult?: PriorConsult;
  notes?: string;
}

/** Differential-diagnosis row (GAP-03). */
export interface DifferentialDiagnosisRow {
  diseaseId: string;
  slug: string;
  nameUz: string;
  nameRu?: string;
  nameEn?: string;
  icd10: string;
  matchScore: number; // 0..1
  confidence: number; // 0..1 (delta / top)
  deltaFromTop: number; // 0..1
  redFlag: boolean;
}

/** 5 mini-gauge readouts shown on step 4. */
export interface MatchScores {
  match: number; // 0..1
  answered: number; // answered / total
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  redFlagCount: number;
  confidence: number; // 0..1
}

export interface MatcherWizardState {
  step: WizardStep;
  symptoms: Map<string, WizardSymptomAnswer>;
  riskFactors: Map<string, RiskFactorAnswer>;
  timeline: TimelineAnswer;
  ddx: DifferentialDiagnosisRow[];
  scores: MatchScores;
}
