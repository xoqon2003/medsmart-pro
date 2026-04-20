import { describe, it, expect } from 'vitest';
import {
  evaluateRedFlags,
  getApplicableRedFlagRules,
  peakSeverity,
  HYPERTENSION_RULES,
  AF_RULES,
  DIABETES_RULES,
  ALL_RED_FLAG_RULES,
  type RedFlagRule,
  type RuleCondition,
} from './red-flag-engine';
import type { AnswerValue } from '../types/api/triage';

/**
 * Red-flag engine unit tests (GAP-04, GAP-04b).
 *
 * We cover the three primitives independently:
 *   1. evaluateRedFlags    — boolean tree evaluation + hit collection
 *   2. getApplicableRedFlagRules — category + ICD scoping
 *   3. peakSeverity        — sort-order invariant
 *
 * Each public rule set (`HYPERTENSION_RULES`, `AF_RULES`, `DIABETES_RULES`)
 * gets at least one "real" scenario test so we catch regressions when the
 * rule catalogue inevitably grows.
 */

const answers = (pairs: Record<string, AnswerValue>): Map<string, AnswerValue> =>
  new Map(Object.entries(pairs));

/** Helper so tests read closer to clinical narratives. */
const symptomRule = (
  id: string,
  code: string,
  severity: RedFlagRule['severity'] = 'CRITICAL',
  extra: Partial<RedFlagRule> = {},
): RedFlagRule => ({
  id,
  nameKey: 'redflag.hypertensiveCrisis',
  severity,
  actionKey: 'emergency.critical.action',
  condition: { kind: 'symptom', code },
  ...extra,
});

describe('evaluateRedFlags — leaf (symptom) condition', () => {
  it('returns no hits when answers is empty', () => {
    const hits = evaluateRedFlags(
      [symptomRule('r1', 'chest-pain')],
      new Map(),
    );
    expect(hits).toEqual([]);
  });

  it('matches when symptom answer = YES (default)', () => {
    const hits = evaluateRedFlags(
      [symptomRule('r1', 'chest-pain')],
      answers({ 'chest-pain': 'YES' }),
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].rule.id).toBe('r1');
    expect(hits[0].triggeredBy).toEqual(['chest-pain']);
  });

  it('does not match when symptom answer = NO', () => {
    const hits = evaluateRedFlags(
      [symptomRule('r1', 'chest-pain')],
      answers({ 'chest-pain': 'NO' }),
    );
    expect(hits).toEqual([]);
  });

  it('honours an explicit `answer` on the leaf (e.g. NO triggers denial rules)', () => {
    const rule: RedFlagRule = {
      id: 'r-no-ecg',
      nameKey: 'redflag.hypertensiveCrisis',
      severity: 'HIGH',
      actionKey: 'emergency.high.action',
      condition: { kind: 'symptom', code: 'ecg-done', answer: 'NO' },
    };
    expect(evaluateRedFlags([rule], answers({ 'ecg-done': 'NO' }))).toHaveLength(1);
    expect(evaluateRedFlags([rule], answers({ 'ecg-done': 'YES' }))).toEqual([]);
  });
});

describe('evaluateRedFlags — AND/OR composition', () => {
  const acsRule: RedFlagRule = {
    id: 'rule.acs',
    nameKey: 'redflag.suspectedACS',
    severity: 'CRITICAL',
    actionKey: 'emergency.critical.action',
    condition: {
      kind: 'and',
      conditions: [
        { kind: 'symptom', code: 'chest-pain' },
        {
          kind: 'or',
          conditions: [
            { kind: 'symptom', code: 'dyspnea' },
            { kind: 'symptom', code: 'sweating' },
          ],
        },
      ],
    },
  };

  it('AND — chest-pain alone does NOT fire', () => {
    expect(
      evaluateRedFlags([acsRule], answers({ 'chest-pain': 'YES' })),
    ).toEqual([]);
  });

  it('AND + OR left branch — chest-pain + dyspnea fires', () => {
    const hits = evaluateRedFlags(
      [acsRule],
      answers({ 'chest-pain': 'YES', dyspnea: 'YES' }),
    );
    expect(hits).toHaveLength(1);
    // triggeredBy collects ONLY leaves that resolved true. Order is insertion
    // order from the Set, which mirrors evaluation order.
    expect(hits[0].triggeredBy).toEqual(['chest-pain', 'dyspnea']);
  });

  it('AND + OR right branch — chest-pain + sweating also fires', () => {
    const hits = evaluateRedFlags(
      [acsRule],
      answers({ 'chest-pain': 'YES', sweating: 'YES' }),
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].triggeredBy).toContain('sweating');
  });

  it('nested OR with short-circuit — only the first satisfied leaf is collected', () => {
    // The `.some()` in `or` short-circuits, so if chest-pain/dyspnea is true,
    // sweating is never visited. This is a deliberate performance guarantee.
    const hits = evaluateRedFlags(
      [acsRule],
      answers({ 'chest-pain': 'YES', dyspnea: 'YES', sweating: 'YES' }),
    );
    expect(hits[0].triggeredBy).not.toContain('sweating');
  });
});

describe('evaluateRedFlags — multiple rules & severity sort', () => {
  const critical = symptomRule('r-crit', 'code-a', 'CRITICAL');
  const high = symptomRule('r-high', 'code-b', 'HIGH');
  const moderate = symptomRule('r-mod', 'code-c', 'MODERATE');

  it('returns hits ordered CRITICAL → HIGH → MODERATE regardless of input order', () => {
    const hits = evaluateRedFlags(
      [moderate, high, critical],
      answers({ 'code-a': 'YES', 'code-b': 'YES', 'code-c': 'YES' }),
    );
    expect(hits.map((h) => h.rule.severity)).toEqual([
      'CRITICAL',
      'HIGH',
      'MODERATE',
    ]);
  });

  it('peakSeverity matches the first element of evaluateRedFlags', () => {
    const hits = evaluateRedFlags(
      [moderate, high],
      answers({ 'code-b': 'YES', 'code-c': 'YES' }),
    );
    expect(peakSeverity(hits)).toBe('HIGH');
  });

  it('peakSeverity returns null when there are no hits', () => {
    expect(peakSeverity([])).toBeNull();
  });
});

describe('HYPERTENSION_RULES — seed catalogue', () => {
  it('hypertensive-crisis fires on bp-sbp-180 alone', () => {
    const hits = evaluateRedFlags(
      HYPERTENSION_RULES,
      answers({ 'bp-sbp-180': 'YES' }),
    );
    expect(hits.map((h) => h.rule.id)).toContain('rule.hypertensive-crisis');
  });

  it('intracranial-htn requires BOTH severe headache and vomiting', () => {
    expect(
      evaluateRedFlags(
        HYPERTENSION_RULES,
        answers({ 'headache-severe': 'YES' }),
      ).find((h) => h.rule.id === 'rule.intracranial-htn'),
    ).toBeUndefined();

    expect(
      evaluateRedFlags(
        HYPERTENSION_RULES,
        answers({ 'headache-severe': 'YES', vomiting: 'YES' }),
      ).find((h) => h.rule.id === 'rule.intracranial-htn'),
    ).toBeDefined();
  });
});

describe('AF_RULES — catalogue', () => {
  it('unstable-af fires on palpitations-rapid + syncope', () => {
    const hits = evaluateRedFlags(
      AF_RULES,
      answers({ 'palpitations-rapid': 'YES', syncope: 'YES' }),
    );
    expect(hits.map((h) => h.rule.id)).toContain('rule.unstable-af');
  });

  it('unstable-af stays silent when only palpitations-rapid is YES', () => {
    const hits = evaluateRedFlags(
      AF_RULES,
      answers({ 'palpitations-rapid': 'YES' }),
    );
    expect(hits.map((h) => h.rule.id)).not.toContain('rule.unstable-af');
  });

  it('oac-bleed fires on anticoagulant + any bleed symptom', () => {
    const hits = evaluateRedFlags(
      AF_RULES,
      answers({ 'on-anticoagulant': 'YES', 'gi-bleed': 'YES' }),
    );
    expect(hits.map((h) => h.rule.id)).toContain('rule.oac-bleed');
  });
});

describe('DIABETES_RULES — catalogue', () => {
  it('dka fires on hyperglycemia + kussmaul', () => {
    const hits = evaluateRedFlags(
      DIABETES_RULES,
      answers({ hyperglycemia: 'YES', kussmaul: 'YES' }),
    );
    expect(hits.map((h) => h.rule.id)).toContain('rule.dka');
  });

  it('dka fires via the nested AND branch (vomiting + abdominal-pain)', () => {
    const hits = evaluateRedFlags(
      DIABETES_RULES,
      answers({
        hyperglycemia: 'YES',
        vomiting: 'YES',
        'abdominal-pain': 'YES',
      }),
    );
    expect(hits.map((h) => h.rule.id)).toContain('rule.dka');
  });

  it('dka stays silent without hyperglycemia (AND root)', () => {
    const hits = evaluateRedFlags(
      DIABETES_RULES,
      answers({ kussmaul: 'YES', 'acetone-breath': 'YES' }),
    );
    expect(hits.map((h) => h.rule.id)).not.toContain('rule.dka');
  });

  it('severe-hypoglycemia needs altered mental status, not just low glucose', () => {
    expect(
      evaluateRedFlags(DIABETES_RULES, answers({ hypoglycemia: 'YES' })).find(
        (h) => h.rule.id === 'rule.severe-hypoglycemia',
      ),
    ).toBeUndefined();

    expect(
      evaluateRedFlags(
        DIABETES_RULES,
        answers({ hypoglycemia: 'YES', seizure: 'YES' }),
      ).find((h) => h.rule.id === 'rule.severe-hypoglycemia'),
    ).toBeDefined();
  });
});

describe('getApplicableRedFlagRules — scoping', () => {
  it('HTN card (category cardiology, I10) picks up HTN rules but NOT AF/DM rules', () => {
    const rules = getApplicableRedFlagRules({
      category: 'yurak-qon-tomir', // Uzbek slug must be aliased to "cardiology"
      icd10: 'I10',
    });
    const ids = rules.map((r) => r.id);
    expect(ids).toContain('rule.hypertensive-crisis');
    expect(ids).toContain('rule.suspected-acs');
    expect(ids).not.toContain('rule.unstable-af'); // ICD I48 only
    expect(ids).not.toContain('rule.dka'); // ICD E10/E11 only
  });

  it('AF card (I48) picks up BOTH cardiology-wide rules AND AF-specific rules', () => {
    const rules = getApplicableRedFlagRules({
      category: 'yurak-qon-tomir',
      icd10: 'I48',
    });
    const ids = rules.map((r) => r.id);
    expect(ids).toContain('rule.hypertensive-crisis');
    expect(ids).toContain('rule.unstable-af');
    expect(ids).toContain('rule.oac-bleed');
    expect(ids).not.toContain('rule.dka');
  });

  it('Diabetes card (E11) picks up DM rules but NOT cardiology rules', () => {
    const rules = getApplicableRedFlagRules({
      category: 'endokrin',
      icd10: 'E11',
    });
    const ids = rules.map((r) => r.id);
    expect(ids).toContain('rule.dka');
    expect(ids).toContain('rule.severe-hypoglycemia');
    expect(ids).not.toContain('rule.hypertensive-crisis');
    expect(ids).not.toContain('rule.unstable-af');
  });

  it('GLOBAL rules (no scope fields) fire everywhere — e.g. suspected-stroke', () => {
    for (const target of [
      { category: 'yurak-qon-tomir', icd10: 'I10' },
      { category: 'endokrin', icd10: 'E11' },
      { category: 'nerv-tizimi', icd10: 'G43' },
    ]) {
      const ids = getApplicableRedFlagRules(target).map((r) => r.id);
      expect(ids).toContain('rule.suspected-stroke');
    }
  });

  it('category mismatch excludes rules even when ICD is global', () => {
    // HYPERTENSION rules are category-gated to cardiology, so an endocrine
    // card must NOT evaluate them even if someone mislabels an ICD.
    const rules = getApplicableRedFlagRules({
      category: 'endokrin',
      icd10: 'I10', // nonsense combo
    });
    expect(rules.map((r) => r.id)).not.toContain('rule.hypertensive-crisis');
  });

  it('ICD prefix is matched case-insensitively and tolerates an `ICD10:` namespace', () => {
    const a = getApplicableRedFlagRules({ category: 'cardiology', icd10: 'i48' });
    const b = getApplicableRedFlagRules({
      category: 'cardiology',
      icd10: 'ICD10:I48.0',
    });
    for (const bucket of [a, b]) {
      expect(bucket.map((r) => r.id)).toContain('rule.unstable-af');
    }
  });

  it('undefined category+icd10 yields only GLOBAL rules', () => {
    const rules = getApplicableRedFlagRules({});
    expect(rules.every((r) => !r.applicableCategories && !r.applicableIcd10Prefixes)).toBe(true);
    // And the well-known global rule is among them.
    expect(rules.map((r) => r.id)).toContain('rule.suspected-stroke');
  });

  it('accepts an explicit rules list (useful for tests & backend overrides)', () => {
    const custom: RedFlagRule[] = [
      {
        id: 'custom',
        nameKey: 'redflag.hypertensiveCrisis',
        severity: 'HIGH',
        actionKey: 'emergency.high.action',
        condition: { kind: 'symptom', code: 'x' },
        applicableIcd10Prefixes: ['Z99'],
      },
    ];
    expect(
      getApplicableRedFlagRules({ icd10: 'Z99' }, custom).map((r) => r.id),
    ).toEqual(['custom']);
    expect(getApplicableRedFlagRules({ icd10: 'A00' }, custom)).toEqual([]);
  });
});

describe('ALL_RED_FLAG_RULES — catalogue invariants', () => {
  it('every rule has a stable id prefix', () => {
    for (const r of ALL_RED_FLAG_RULES) {
      expect(r.id.startsWith('rule.')).toBe(true);
    }
  });

  it('ids are unique across rule sets', () => {
    const ids = ALL_RED_FLAG_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every rule references a non-empty i18n name + action key', () => {
    for (const r of ALL_RED_FLAG_RULES) {
      expect(r.nameKey.length).toBeGreaterThan(0);
      expect(r.actionKey.length).toBeGreaterThan(0);
    }
  });

  // Sanity: the only rule without scope in the current catalogue is the
  // stroke-FAST rule. If someone ever adds a NEW global rule, this test
  // forces them to eyeball whether it really belongs to the "always fire"
  // category. Red flags are sensitivity-over-specificity, but not THAT
  // sensitive.
  it('global rules are kept to a minimum', () => {
    const globals = ALL_RED_FLAG_RULES.filter(
      (r) => !r.applicableCategories && !r.applicableIcd10Prefixes,
    );
    expect(globals.map((r) => r.id)).toEqual(['rule.suspected-stroke']);
  });
});

describe('evaluateRedFlags — type exhaustiveness', () => {
  it('passes a sentinel RuleCondition without throwing', () => {
    const cond: RuleCondition = {
      kind: 'or',
      conditions: [
        { kind: 'and', conditions: [{ kind: 'symptom', code: 'a' }] },
        { kind: 'symptom', code: 'b', answer: 'UNKNOWN' },
      ],
    };
    const rule: RedFlagRule = {
      id: 'sentinel',
      nameKey: 'redflag.hypertensiveCrisis',
      severity: 'MODERATE',
      actionKey: 'emergency.moderate.action',
      condition: cond,
    };
    expect(() => evaluateRedFlags([rule], answers({ b: 'UNKNOWN' }))).not.toThrow();
  });
});
