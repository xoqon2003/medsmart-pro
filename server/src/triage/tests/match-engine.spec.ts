import { scoreMatch, AnswerValue, DiseaseSymptomRef } from '../match-engine';

const BASE_SYMPTOMS: DiseaseSymptomRef[] = [
  { code: 'S1', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: false },
  { code: 'S2', weight: 0.8, isRequired: true,  isExcluding: false, isRedFlag: false },
  { code: 'S3', weight: 0.6, isRequired: false, isExcluding: false, isRedFlag: false },
];

function makeAnswers(entries: [string, AnswerValue][]): Map<string, AnswerValue> {
  return new Map(entries);
}

describe('scoreMatch', () => {
  it('1. all YES → score > 0.8', () => {
    const answers = makeAnswers([['S1', 'YES'], ['S2', 'YES'], ['S3', 'YES']]);
    const result = scoreMatch(answers, 'D1', BASE_SYMPTOMS);
    expect(result.score).toBeGreaterThan(0.8);
  });

  it('2. all UNKNOWN → score === 0', () => {
    const answers = makeAnswers([['S1', 'UNKNOWN'], ['S2', 'UNKNOWN'], ['S3', 'UNKNOWN']]);
    const result = scoreMatch(answers, 'D1', BASE_SYMPTOMS);
    expect(result.score).toBe(0);
  });

  it('3. all NO (no excluding symptoms) → score === 0 (clamped)', () => {
    const symptoms: DiseaseSymptomRef[] = BASE_SYMPTOMS.map((s) => ({
      ...s,
      isExcluding: false,
    }));
    const answers = makeAnswers([['S1', 'NO'], ['S2', 'NO'], ['S3', 'NO']]);
    const result = scoreMatch(answers, 'D1', symptoms);
    expect(result.score).toBe(0);
  });

  it('4. red flag YES → score higher than without red flag', () => {
    // Base score 1.0 da cap tushganda bonus ko'rinmaydi, shuning uchun
    // bitta YES + bitta NO bilan base ~0.25 qilib, bonus ta'sirini tekshiramiz.
    const withRedFlag: DiseaseSymptomRef[] = [
      { code: 'S1', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: true },
      { code: 'S2', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: false },
    ];
    const withoutRedFlag: DiseaseSymptomRef[] = [
      { code: 'S1', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: false },
      { code: 'S2', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: false },
    ];
    const answers = makeAnswers([['S1', 'YES'], ['S2', 'NO']]);
    const withResult = scoreMatch(answers, 'D1', withRedFlag);
    const withoutResult = scoreMatch(answers, 'D1', withoutRedFlag);
    expect(withResult.score).toBeGreaterThan(withoutResult.score);
  });

  it('5. excluding YES → score * 0.5 compared to non-excluding', () => {
    const withExcluding: DiseaseSymptomRef[] = [
      { code: 'S1', weight: 1.0, isRequired: false, isExcluding: true, isRedFlag: false },
    ];
    const withoutExcluding: DiseaseSymptomRef[] = [
      { code: 'S1', weight: 1.0, isRequired: false, isExcluding: false, isRedFlag: false },
    ];
    const answers = makeAnswers([['S1', 'YES']]);
    const withResult = scoreMatch(answers, 'D1', withExcluding);
    const withoutResult = scoreMatch(answers, 'D1', withoutExcluding);
    expect(withResult.score).toBeCloseTo(withoutResult.score * 0.5, 2);
  });

  it('6. required symptom UNKNOWN/NO → penalty applies (score < all-YES)', () => {
    const symptoms: DiseaseSymptomRef[] = [
      { code: 'S1', weight: 1.0, isRequired: true, isExcluding: false, isRedFlag: false },
      { code: 'S2', weight: 0.8, isRequired: false, isExcluding: false, isRedFlag: false },
    ];
    const allYes = makeAnswers([['S1', 'YES'], ['S2', 'YES']]);
    const missingRequired = makeAnswers([['S1', 'UNKNOWN'], ['S2', 'YES']]);
    const allYesResult = scoreMatch(allYes, 'D1', symptoms);
    const penaltyResult = scoreMatch(missingRequired, 'D1', symptoms);
    expect(penaltyResult.score).toBeLessThan(allYesResult.score);
    expect(penaltyResult.missingSymptoms).toContain('S1');
  });

  it('7. empty diseaseSymptoms → score === 0', () => {
    const answers = makeAnswers([['S1', 'YES']]);
    const result = scoreMatch(answers, 'D1', []);
    expect(result.score).toBe(0);
  });
});
