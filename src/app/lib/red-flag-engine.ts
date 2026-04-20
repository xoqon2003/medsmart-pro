import type { AnswerValue } from '../types/api/triage';
import type { EmergencySeverity } from '../components/diseases/blocks/EmergencyBanner';
import type { TranslationKey } from './i18n';

/**
 * Frontend red-flag rule engine (GAP-04, TZ §3.4.3).
 *
 * Runs locally over the current wizard answers so the emergency banner
 * appears the instant a dangerous symptom is confirmed, without a server
 * round-trip. Once the `RedFlagRule` table ships, the rule list can be
 * fetched from `/api/v1/triage/red-flag-rules` and fed into `evaluate`
 * unchanged.
 *
 * Design:
 *   - Rules are boolean AND/OR trees over symptom codes.
 *   - A rule hit yields severity + an action key + the triggering symptom
 *     codes so UI can cite evidence.
 *   - Sensitivity over specificity: we prefer false positives (over-
 *     escalation) since the cost of missing a hypertensive crisis
 *     dominates the cost of showing one extra banner.
 */

export type RuleCondition =
  | { kind: 'symptom'; code: string; answer?: AnswerValue }
  | { kind: 'and'; conditions: RuleCondition[] }
  | { kind: 'or'; conditions: RuleCondition[] };

export interface RedFlagRule {
  id: string;
  nameKey: TranslationKey;
  /**
   * Broad category filter (matched against `disease.category`). If omitted
   * or empty, the rule is global and evaluates on every disease.
   * Mirrors `CalculatorSchema.applicableCategories` for consistency.
   */
  applicableCategories?: string[];
  /**
   * Narrow ICD-10 prefix filter. When set, the rule only evaluates on
   * diseases whose ICD-10 starts with one of the prefixes (e.g. `['I48']`
   * for AF-only rules, `['E10', 'E11']` for diabetes-only rules).
   *
   * DESIGN NOTE: leaving both `applicableCategories` and `applicableIcd10Prefixes`
   * unset makes a rule GLOBAL — appropriate for rules like suspected stroke
   * whose triggering symptoms (focal weakness, slurred speech) warrant an
   * alert regardless of which disease card the patient is on.
   */
  applicableIcd10Prefixes?: string[];
  severity: EmergencySeverity;
  /** i18n key for the CTA/action message. */
  actionKey: TranslationKey;
  condition: RuleCondition;
}

export interface RedFlagHit {
  rule: RedFlagRule;
  triggeredBy: string[];
}

function evaluateCondition(
  condition: RuleCondition,
  answers: Map<string, AnswerValue>,
  triggered: Set<string>,
): boolean {
  if (condition.kind === 'symptom') {
    const ans = answers.get(condition.code);
    if (!ans) return false;
    const matches = (condition.answer ?? 'YES') === ans;
    if (matches) triggered.add(condition.code);
    return matches;
  }
  if (condition.kind === 'and') {
    return condition.conditions.every((c) =>
      evaluateCondition(c, answers, triggered),
    );
  }
  // or
  return condition.conditions.some((c) =>
    evaluateCondition(c, answers, triggered),
  );
}

/**
 * Evaluate all rules against the current answer set and return every hit,
 * sorted by severity (CRITICAL → MODERATE).
 */
export function evaluateRedFlags(
  rules: RedFlagRule[],
  answers: Map<string, AnswerValue>,
): RedFlagHit[] {
  const hits: RedFlagHit[] = [];
  for (const rule of rules) {
    const triggered = new Set<string>();
    if (evaluateCondition(rule.condition, answers, triggered)) {
      hits.push({ rule, triggeredBy: Array.from(triggered) });
    }
  }
  const order: Record<EmergencySeverity, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MODERATE: 2,
  };
  hits.sort((a, b) => order[a.rule.severity] - order[b.rule.severity]);
  return hits;
}

/** Top severity across all hits — useful to pick a single banner variant. */
export function peakSeverity(hits: RedFlagHit[]): EmergencySeverity | null {
  if (hits.length === 0) return null;
  return hits[0].rule.severity; // already sorted
}

/**
 * Seed rule set for the hypertension category (ACC/AHA 2017 + ESC 2018).
 * When the backend catalogue ships, this becomes the bootstrap fixture for
 * integration tests.
 */
export const HYPERTENSION_RULES: RedFlagRule[] = [
  {
    id: 'rule.hypertensive-crisis',
    nameKey: 'redflag.hypertensiveCrisis',
    applicableCategories: ['cardiology'],
    severity: 'CRITICAL',
    actionKey: 'emergency.critical.action',
    condition: {
      kind: 'symptom',
      code: 'bp-sbp-180',
    },
  },
  {
    id: 'rule.suspected-acs',
    nameKey: 'redflag.suspectedACS',
    applicableCategories: ['cardiology'],
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
  },
  {
    // Stroke signs are a GLOBAL red flag — they override disease context
    // (patient may be on the AF card when FAST symptoms develop).
    id: 'rule.suspected-stroke',
    nameKey: 'redflag.suspectedStroke',
    severity: 'CRITICAL',
    actionKey: 'emergency.critical.action',
    condition: {
      kind: 'or',
      conditions: [
        { kind: 'symptom', code: 'focal-weakness' },
        { kind: 'symptom', code: 'slurred-speech' },
        { kind: 'symptom', code: 'sudden-vision-loss' },
      ],
    },
  },
  {
    id: 'rule.intracranial-htn',
    nameKey: 'redflag.intracranialHTN',
    applicableCategories: ['cardiology', 'neurology'],
    severity: 'HIGH',
    actionKey: 'emergency.high.action',
    condition: {
      kind: 'and',
      conditions: [
        { kind: 'symptom', code: 'headache-severe' },
        { kind: 'symptom', code: 'vomiting' },
      ],
    },
  },
];

/**
 * Atrial fibrillation rule set (ESC 2020 AF §7).
 * Gated by ICD-10 I48 so we don't surface AF-specific alerts on, say, a
 * migraine card where the wizard doesn't even collect these symptoms.
 */
export const AF_RULES: RedFlagRule[] = [
  {
    // Rapid AF with hemodynamic instability — ED disposition per ESC 2020.
    id: 'rule.unstable-af',
    nameKey: 'redflag.unstableAf',
    applicableIcd10Prefixes: ['I48'],
    severity: 'CRITICAL',
    actionKey: 'emergency.critical.action',
    condition: {
      kind: 'and',
      conditions: [
        { kind: 'symptom', code: 'palpitations-rapid' },
        {
          kind: 'or',
          conditions: [
            { kind: 'symptom', code: 'syncope' },
            { kind: 'symptom', code: 'hypotension' },
            { kind: 'symptom', code: 'chest-pain' },
          ],
        },
      ],
    },
  },
  {
    // OAC-related major bleed — bleed trumps stroke prophylaxis in ED.
    id: 'rule.oac-bleed',
    nameKey: 'redflag.oacBleed',
    applicableIcd10Prefixes: ['I48'],
    severity: 'CRITICAL',
    actionKey: 'emergency.critical.action',
    condition: {
      kind: 'and',
      conditions: [
        { kind: 'symptom', code: 'on-anticoagulant' },
        {
          kind: 'or',
          conditions: [
            { kind: 'symptom', code: 'gi-bleed' },
            { kind: 'symptom', code: 'hematuria' },
            { kind: 'symptom', code: 'headache-severe' },
          ],
        },
      ],
    },
  },
];

/**
 * Diabetes rule set — DKA (ADA 2024) and severe hypoglycemia.
 * Gated by ICD-10 E10/E11 (type 1/2 diabetes).
 */
export const DIABETES_RULES: RedFlagRule[] = [
  {
    // DKA: hyperglycemia + Kussmaul breathing + acetone breath / vomiting.
    id: 'rule.dka',
    nameKey: 'redflag.dka',
    applicableIcd10Prefixes: ['E10', 'E11'],
    severity: 'CRITICAL',
    actionKey: 'emergency.critical.action',
    condition: {
      kind: 'and',
      conditions: [
        { kind: 'symptom', code: 'hyperglycemia' },
        {
          kind: 'or',
          conditions: [
            { kind: 'symptom', code: 'kussmaul' },
            { kind: 'symptom', code: 'acetone-breath' },
            {
              kind: 'and',
              conditions: [
                { kind: 'symptom', code: 'vomiting' },
                { kind: 'symptom', code: 'abdominal-pain' },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    // Severe hypoglycemia — altered mental status with low glucose.
    id: 'rule.severe-hypoglycemia',
    nameKey: 'redflag.severeHypoglycemia',
    applicableIcd10Prefixes: ['E10', 'E11'],
    severity: 'CRITICAL',
    actionKey: 'emergency.critical.action',
    condition: {
      kind: 'and',
      conditions: [
        { kind: 'symptom', code: 'hypoglycemia' },
        {
          kind: 'or',
          conditions: [
            { kind: 'symptom', code: 'altered-mental-status' },
            { kind: 'symptom', code: 'seizure' },
          ],
        },
      ],
    },
  },
];

/**
 * Master registry. When the backend `RedFlagRule` table ships, this becomes
 * the bootstrap fixture and the runtime reads from `/api/v1/triage/red-flag-rules`.
 */
export const ALL_RED_FLAG_RULES: readonly RedFlagRule[] = [
  ...HYPERTENSION_RULES,
  ...AF_RULES,
  ...DIABETES_RULES,
] as const;

/** Helper mirrors calculator scoping semantics. */
function matchesRuleCategory(
  applicable: readonly string[] | undefined,
  category: string | undefined,
): boolean {
  if (!applicable || applicable.length === 0) return true; // global
  if (!category) return false;
  const cat = category.toLowerCase();
  // Bridge Uzbek slugs used in mock data → canonical English categories.
  const aliases: Record<string, string[]> = {
    cardiology: ['cardiology', 'yurak-qon-tomir', 'yurak', 'kardiologiya'],
    neurology: ['neurology', 'nerv-tizimi', 'nevrologiya'],
    endocrinology: ['endocrinology', 'endokrin', 'endokrinologiya'],
    nephrology: ['nephrology', 'nefrologiya', 'buyrak'],
    pulmonology: ['pulmonology', 'nafas-yollari', 'pulmonologiya'],
    gastroenterology: ['gastroenterology', 'hazm', 'gastroenterologiya'],
  };
  return applicable.some((raw) => {
    const key = raw.toLowerCase();
    if (key === cat) return true;
    const pool = aliases[key];
    return pool ? pool.includes(cat) : false;
  });
}

function matchesRuleIcd10(
  prefixes: readonly string[] | undefined,
  icd10: string | undefined,
): boolean {
  if (!prefixes || prefixes.length === 0) return true; // global
  if (!icd10) return false;
  const code = icd10.toLowerCase().replace(/^icd10:/, '').trim();
  return prefixes.some((raw) => code.startsWith(raw.toLowerCase()));
}

export interface RuleMatchTarget {
  category?: string;
  icd10?: string;
}

/**
 * Return the subset of rules that apply to a given disease (category + ICD).
 * Matches the calculator registry's `getApplicableCalculators` shape, so
 * consumers don't have to learn two different scoping idioms.
 *
 * Invariants:
 *  - Rules with NO scope fields are GLOBAL (always evaluated).
 *  - Rules with `applicableCategories` require a category match.
 *  - Rules with `applicableIcd10Prefixes` require an ICD match.
 *  - When both fields are set, BOTH must match (AND) — consistent with
 *    how calculators scope. This prevents accidental leakage of an
 *    AF-specific rule onto a non-cardiology diabetic card if we ever
 *    expand the ICD prefix inadvertently.
 */
export function getApplicableRedFlagRules(
  target: RuleMatchTarget,
  rules: readonly RedFlagRule[] = ALL_RED_FLAG_RULES,
): RedFlagRule[] {
  return rules.filter(
    (r) =>
      matchesRuleCategory(r.applicableCategories, target.category) &&
      matchesRuleIcd10(r.applicableIcd10Prefixes, target.icd10),
  );
}
