export type AnswerValue = 'YES' | 'NO' | 'UNKNOWN' | 'SOMETIMES';

export interface DiseaseSymptomRef {
  code: string;
  weight: number;
  isRequired: boolean;
  isExcluding: boolean;
  isRedFlag: boolean;
}

export interface MatchDetail {
  diseaseId: string;
  score: number; // 0..1
  matchedSymptoms: string[];
  missingSymptoms: string[];
  redFlagHit: boolean;
  excludingHit: boolean;
}

const MULTIPLIERS: Record<AnswerValue, number> = {
  YES: 1.0,
  SOMETIMES: 0.5,
  UNKNOWN: 0.0,
  NO: -0.5,
};

export function scoreMatch(
  userAnswers: Map<string, AnswerValue>,
  diseaseId: string,
  diseaseSymptoms: DiseaseSymptomRef[],
): MatchDetail {
  let weightedSum = 0;
  let totalWeight = 0;
  const matched: string[] = [];
  const missing: string[] = [];
  let redFlagHit = false;
  let excludingHit = false;

  for (const ds of diseaseSymptoms) {
    const answer = userAnswers.get(ds.code) ?? 'UNKNOWN';
    const mult = MULTIPLIERS[answer];
    weightedSum += ds.weight * mult;
    totalWeight += ds.weight;
    if (answer === 'YES' || answer === 'SOMETIMES') {
      matched.push(ds.code);
      if (ds.isRedFlag) redFlagHit = true;
      if (ds.isExcluding) excludingHit = true;
    } else if (ds.isRequired) {
      missing.push(ds.code);
    }
  }

  const base = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const bonus = redFlagHit ? 0.2 : 0;
  const excMul = excludingHit ? 0.5 : 1;
  const reqPenalty = missing.length * 0.1;
  const final = Math.max(0, Math.min(1, (base + bonus - reqPenalty) * excMul));

  return {
    diseaseId,
    score: Number(final.toFixed(3)),
    matchedSymptoms: matched,
    missingSymptoms: missing,
    redFlagHit,
    excludingHit,
  };
}
