import { describe, it, expect } from 'vitest';
import {
  computeRiskTier,
  computeAnsweredRatio,
  computeRedFlagCount,
  computeDdx,
  computeConfidence,
} from './matcher-wizard-logic';
import type { RiskFactorAnswer } from '../types/api/matcher-wizard';
import type { AnswerValue } from '../types/api/triage';
import type { DiseaseSymptomWithWeight } from '../types/api/symptom';

// ── Helpers ────────────────────────────────────────────────────────────────────

function rf(id: string, value: RiskFactorAnswer['value']): [string, RiskFactorAnswer] {
  const [group] = id.split('.');
  return [id, { id, group: group as RiskFactorAnswer['group'], value }];
}

function sym(
  code: string,
  weight = 1,
  opts: { isRedFlag?: boolean; isExcluding?: boolean } = {},
): DiseaseSymptomWithWeight {
  return {
    code,
    weight,
    isRedFlag: opts.isRedFlag ?? false,
    isExcluding: opts.isExcluding ?? false,
    nameUz: code,
    nameRu: null,
    isRequired: false,
    description: null,
  };
}

function ans(pairs: Record<string, AnswerValue>): Map<string, AnswerValue> {
  return new Map(Object.entries(pairs));
}

// ── computeRiskTier ────────────────────────────────────────────────────────────

describe('computeRiskTier', () => {
  it('0 YES → LOW', () => {
    expect(computeRiskTier(new Map())).toBe('LOW');
  });

  it('1 YES → LOW', () => {
    const m = new Map([rf('age.over60', 'YES')]);
    expect(computeRiskTier(m)).toBe('LOW');
  });

  it('2 YES → MODERATE', () => {
    const m = new Map([rf('a.1', 'YES'), rf('a.2', 'YES')]);
    expect(computeRiskTier(m)).toBe('MODERATE');
  });

  it('4 YES → HIGH', () => {
    const m = new Map([
      rf('a.1', 'YES'), rf('a.2', 'YES'), rf('a.3', 'YES'), rf('a.4', 'YES'),
    ]);
    expect(computeRiskTier(m)).toBe('HIGH');
  });

  it('6 YES → VERY_HIGH', () => {
    const m = new Map([
      rf('a.1', 'YES'), rf('a.2', 'YES'), rf('a.3', 'YES'),
      rf('a.4', 'YES'), rf('a.5', 'YES'), rf('a.6', 'YES'),
    ]);
    expect(computeRiskTier(m)).toBe('VERY_HIGH');
  });

  it('NO/UNKNOWN answers do not count', () => {
    const m = new Map([
      rf('a.1', 'NO'), rf('a.2', 'UNKNOWN'), rf('a.3', 'YES'),
    ]);
    expect(computeRiskTier(m)).toBe('LOW'); // only 1 YES
  });
});

// ── computeAnsweredRatio ───────────────────────────────────────────────────────

describe('computeAnsweredRatio', () => {
  const symptoms = [sym('FEVER'), sym('COUGH'), sym('HEADACHE'), sym('NAUSEA')];

  it('empty symptoms → 0', () => {
    expect(computeAnsweredRatio([], ans({ FEVER: 'YES' }))).toBe(0);
  });

  it('no answers → 0', () => {
    expect(computeAnsweredRatio(symptoms, new Map())).toBe(0);
  });

  it('all answered YES → 1', () => {
    expect(
      computeAnsweredRatio(
        symptoms,
        ans({ FEVER: 'YES', COUGH: 'YES', HEADACHE: 'YES', NAUSEA: 'YES' }),
      ),
    ).toBe(1);
  });

  it('UNKNOWN answers do NOT count', () => {
    expect(
      computeAnsweredRatio(symptoms, ans({ FEVER: 'YES', COUGH: 'UNKNOWN' })),
    ).toBe(0.25); // 1 out of 4
  });

  it('NO counts as answered', () => {
    expect(
      computeAnsweredRatio(symptoms, ans({ FEVER: 'NO', COUGH: 'NO' })),
    ).toBe(0.5);
  });
});

// ── computeRedFlagCount ────────────────────────────────────────────────────────

describe('computeRedFlagCount', () => {
  const symptoms = [
    sym('CHEST_PAIN', 1, { isRedFlag: true }),
    sym('SYNCOPE', 1, { isRedFlag: true }),
    sym('COUGH', 1),
  ];

  it('no answers → 0', () => {
    expect(computeRedFlagCount(symptoms, new Map())).toBe(0);
  });

  it('only non-red-flag YES → 0', () => {
    expect(computeRedFlagCount(symptoms, ans({ COUGH: 'YES' }))).toBe(0);
  });

  it('one red-flag YES → 1', () => {
    expect(computeRedFlagCount(symptoms, ans({ CHEST_PAIN: 'YES' }))).toBe(1);
  });

  it('both red-flags YES → 2', () => {
    expect(
      computeRedFlagCount(symptoms, ans({ CHEST_PAIN: 'YES', SYNCOPE: 'YES' })),
    ).toBe(2);
  });

  it('red-flag with SOMETIMES/NO/UNKNOWN → 0', () => {
    expect(
      computeRedFlagCount(
        symptoms,
        ans({ CHEST_PAIN: 'SOMETIMES', SYNCOPE: 'NO' }),
      ),
    ).toBe(0);
  });
});

// ── computeDdx ─────────────────────────────────────────────────────────────────

const primary = { id: 'p1', slug: 'flu', nameUz: 'Gripp', icd10: 'J11' };
const candidates = [
  { id: 'c1', slug: 'cold', nameUz: 'Shamollash', icd10: 'J00' },
  { id: 'c2', slug: 'pneumonia', nameUz: "Zotiljam", icd10: 'J18' },
  { id: 'c3', slug: 'bronchitis', nameUz: 'Bronxit', icd10: 'J20' },
];

describe('computeDdx', () => {
  it('primary disease is included even with no candidates', () => {
    const ddx = computeDdx(primary, [], 0.8, 0);
    expect(ddx).toHaveLength(1);
    expect(ddx[0].diseaseId).toBe('p1');
    expect(ddx[0].matchScore).toBe(0.8);
  });

  it('primary disease excluded from candidates list', () => {
    const ddx = computeDdx(primary, [primary, ...candidates], 0.6, 0);
    const ids = ddx.map((r) => r.diseaseId);
    expect(ids.filter((id) => id === 'p1')).toHaveLength(1);
  });

  it('sorted descending by matchScore', () => {
    const ddx = computeDdx(primary, candidates, 0.9, 0);
    for (let i = 0; i < ddx.length - 1; i++) {
      expect(ddx[i].matchScore).toBeGreaterThanOrEqual(ddx[i + 1].matchScore);
    }
  });

  it('candidate scores floored at 0.15 (primary keeps its own score)', () => {
    // Very low baseScore — candidate entries should not go below 0.15,
    // but the primary disease row retains baseScore as-is.
    const ddx = computeDdx(primary, candidates, 0.05, 0);
    const others = ddx.filter((r) => r.diseaseId !== 'p1');
    for (const row of others) {
      expect(row.matchScore).toBeGreaterThanOrEqual(0.15);
    }
  });

  it('capped at 5 entries', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`, slug: `d${i}`, nameUz: `D${i}`, icd10: `Z0${i}`,
    }));
    const ddx = computeDdx(primary, many, 0.7, 0);
    expect(ddx.length).toBeLessThanOrEqual(5);
  });

  it('redFlag true on primary when redFlagCount > 0', () => {
    const ddx = computeDdx(primary, [], 0.5, 2);
    expect(ddx[0].redFlag).toBe(true);
  });

  it('redFlag false on primary when redFlagCount === 0', () => {
    const ddx = computeDdx(primary, [], 0.5, 0);
    expect(ddx[0].redFlag).toBe(false);
  });
});

// ── computeConfidence ──────────────────────────────────────────────────────────

describe('computeConfidence', () => {
  it('empty or single DDx → 0', () => {
    expect(computeConfidence([])).toBe(0);
    expect(
      computeConfidence([
        { diseaseId: 'd1', slug: 'x', nameUz: 'X', icd10: 'X', matchScore: 0.9,
          confidence: 0, deltaFromTop: 0, redFlag: false },
      ]),
    ).toBe(0);
  });

  it('identical scores → 0', () => {
    const ddx = [0.7, 0.7].map((score, i) => ({
      diseaseId: `d${i}`, slug: `s${i}`, nameUz: `N${i}`, icd10: `X${i}`,
      matchScore: score, confidence: 0, deltaFromTop: 0, redFlag: false,
    }));
    expect(computeConfidence(ddx)).toBe(0);
  });

  it('top=1.0, next=0.5 → confidence 0.5', () => {
    const ddx = [1.0, 0.5].map((score, i) => ({
      diseaseId: `d${i}`, slug: `s${i}`, nameUz: `N${i}`, icd10: `X${i}`,
      matchScore: score, confidence: 0, deltaFromTop: 0, redFlag: false,
    }));
    expect(computeConfidence(ddx)).toBeCloseTo(0.5);
  });

  it('top=0.8, next=0.2 → confidence 0.75', () => {
    const ddx = [0.8, 0.2].map((score, i) => ({
      diseaseId: `d${i}`, slug: `s${i}`, nameUz: `N${i}`, icd10: `X${i}`,
      matchScore: score, confidence: 0, deltaFromTop: 0, redFlag: false,
    }));
    expect(computeConfidence(ddx)).toBeCloseTo(0.75);
  });

  it('top=0 → 0 (no divide-by-zero)', () => {
    const ddx = [0, 0].map((score, i) => ({
      diseaseId: `d${i}`, slug: `s${i}`, nameUz: `N${i}`, icd10: `X${i}`,
      matchScore: score, confidence: 0, deltaFromTop: 0, redFlag: false,
    }));
    expect(computeConfidence(ddx)).toBe(0);
  });

  it('clamped to [0, 1] — impossible negative gap stays at 0', () => {
    // If next > top (shouldn't happen after sort, but defensive check)
    const ddx = [0.3, 0.9].map((score, i) => ({
      diseaseId: `d${i}`, slug: `s${i}`, nameUz: `N${i}`, icd10: `X${i}`,
      matchScore: score, confidence: 0, deltaFromTop: 0, redFlag: false,
    }));
    expect(computeConfidence(ddx)).toBeGreaterThanOrEqual(0);
  });
});
