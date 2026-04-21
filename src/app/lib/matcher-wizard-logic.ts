/**
 * matcher-wizard-logic.ts — pure computation functions for the symptom
 * matcher wizard (useMatcherWizard hook).
 *
 * Extracted into a standalone module so the functions are independently
 * unit-testable without a DOM / React environment.
 */

import type {
  DifferentialDiagnosisRow,
  MatchScores,
  RiskFactorAnswer,
} from '../types/api/matcher-wizard';
import type { AnswerValue } from '../types/api/triage';
import type { DiseaseSymptomWithWeight } from '../types/api/symptom';
import type { DiseaseDetail, DiseaseListItem } from '../types/api/disease';

// ── Risk tier ──────────────────────────────────────────────────────────────────

/**
 * Computes the risk tier based on how many risk-factor answers are YES.
 * Thresholds: ≥6 → VERY_HIGH, ≥4 → HIGH, ≥2 → MODERATE, else → LOW.
 */
export function computeRiskTier(
  riskFactors: Map<string, RiskFactorAnswer>,
): MatchScores['risk'] {
  let yes = 0;
  riskFactors.forEach((rf) => {
    if (rf.value === 'YES') yes++;
  });
  if (yes >= 6) return 'VERY_HIGH';
  if (yes >= 4) return 'HIGH';
  if (yes >= 2) return 'MODERATE';
  return 'LOW';
}

// ── Answered ratio ─────────────────────────────────────────────────────────────

/**
 * Fraction of symptoms that have a non-UNKNOWN answer (0..1).
 */
export function computeAnsweredRatio(
  symptoms: DiseaseSymptomWithWeight[],
  answers: Map<string, AnswerValue>,
): number {
  if (symptoms.length === 0) return 0;
  let count = 0;
  for (const sym of symptoms) {
    const ans = answers.get(sym.code);
    if (ans && ans !== 'UNKNOWN') count++;
  }
  return count / symptoms.length;
}

// ── Red-flag count ─────────────────────────────────────────────────────────────

/**
 * Number of red-flag symptoms answered YES.
 */
export function computeRedFlagCount(
  symptoms: DiseaseSymptomWithWeight[],
  answers: Map<string, AnswerValue>,
): number {
  let count = 0;
  for (const sym of symptoms) {
    if (sym.isRedFlag && answers.get(sym.code) === 'YES') count++;
  }
  return count;
}

// ── DDx list ───────────────────────────────────────────────────────────────────

/**
 * Builds the differential-diagnosis list for the summary step.
 *
 * The primary disease always appears first; up to 4 candidates fill the rest.
 * Candidate scores are smoothly decreasing from baseScore so the UI visibly
 * orders them (real backend score available after `POST /triage/match` scan).
 */
export function computeDdx(
  primaryDisease: Pick<DiseaseDetail, 'id' | 'slug' | 'nameUz' | 'icd10'>,
  candidateDiseases: Pick<DiseaseListItem, 'id' | 'slug' | 'nameUz' | 'icd10'>[],
  baseScore: number,
  redFlagCount: number,
): DifferentialDiagnosisRow[] {
  const primaryRow: DifferentialDiagnosisRow = {
    diseaseId: primaryDisease.id,
    slug: primaryDisease.slug,
    nameUz: primaryDisease.nameUz,
    icd10: primaryDisease.icd10,
    matchScore: baseScore,
    confidence: 0.5,
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
      matchScore: Math.max(0.15, baseScore * (0.75 - idx * 0.12)),
      confidence: 0.3,
      deltaFromTop: baseScore - baseScore * (0.75 - idx * 0.12),
      redFlag: false,
    }));

  return [...[primaryRow, ...others]]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

// ── Confidence ─────────────────────────────────────────────────────────────────

/**
 * Gap between the top-scoring and second-scoring DDx entries, normalised to
 * the top score. Returns 0 when there are fewer than 2 entries or top score
 * is 0.
 */
export function computeConfidence(ddx: DifferentialDiagnosisRow[]): number {
  if (ddx.length < 2) return 0;
  const top = ddx[0].matchScore;
  const next = ddx[1].matchScore;
  if (top === 0) return 0;
  return Math.max(0, Math.min(1, (top - next) / top));
}
