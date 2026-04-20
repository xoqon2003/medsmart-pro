/**
 * Bootstrap seed — Triage catalogue + Clinical Tools (GAP-05d).
 *
 * Historically this file mirrored `src/app/lib/red-flag-engine.ts` +
 * `src/app/calculators/*.ts` only. With the universal `ClinicalTool`
 * refactor (docs/analysis/tz-clinical-tools-expansion.md §4), it now
 * also seeds the first wave of cross-category tools:
 *
 *   Wave 1 (ship MVP):
 *     SCORE         — SCORE2, CHA₂DS₂-VASc, HAS-BLED, CKD-EPI 2021, CURB-65
 *     QUESTIONNAIRE — PHQ-9, GAD-7
 *     CRITERIA      — (deferred: Light's, Wells — Wave 2)
 *     DOSE          — (deferred: Wave 3, gated by engineering safety review)
 *     STAGING       — (deferred: NYHA, Child-Pugh — Wave 2)
 *
 * Duplicating shape constants rather than importing from `/src`:
 *   1. The NestJS build has no path into the SPA source tree.
 *   2. The seed is an initial *snapshot*. After bootstrap, medical editors
 *      tune metadata via the admin API. Re-running the seed upserts the
 *      immutable fields (formulaKey, inputs) but does NOT reset editor-
 *      tuned fields (scope, audience/role gating, isActive) — that would
 *      undo clinic-level deactivation decisions.
 *
 * Trust boundary:
 *   `formulaKey` names a whitelisted compute function on the client. No
 *   arbitrary code runs from DB. Formula changes require an engineering
 *   PR, not an editor action.
 *
 * Usage:
 *   import { seedTriageCatalogue } from './seeds/triage-catalogue';
 *   await seedTriageCatalogue(prisma);
 */
import { Prisma } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

// ─── Types — minimal backend mirrors of the FE shapes ───────────────────────

type AnswerValue = 'YES' | 'NO' | 'UNKNOWN';

type RuleCondition =
  | { kind: 'symptom'; code: string; answer?: AnswerValue }
  | { kind: 'and'; conditions: RuleCondition[] }
  | { kind: 'or'; conditions: RuleCondition[] };

type Severity = 'CRITICAL' | 'HIGH' | 'MODERATE';
type ToolType = 'SCORE' | 'QUESTIONNAIRE' | 'CRITERIA' | 'DOSE' | 'STAGING';
type EvidenceLevel = 'A' | 'B' | 'C' | 'D';
/// AudienceMode enum qiymatlari (schema.prisma'dan). FE-dagi L1/L2/L3
/// oqimi `showFormulaForAudience` string maydonida qoladi — ular rol
/// emas, balki kontent chuqurligi (ContentLevel enum).
type Audience = 'PATIENT' | 'STUDENT' | 'NURSE' | 'DOCTOR' | 'SPECIALIST' | 'MIXED';
/// UserRole enum qiymatlari (schema.prisma'dan). DOSE tooltype uchun
/// odatda [DOCTOR, SPECIALIST, NURSE] bilan cheklanadi.
type Role =
  | 'PATIENT'
  | 'RADIOLOG'
  | 'DOCTOR'
  | 'SPECIALIST'
  | 'OPERATOR'
  | 'ADMIN'
  | 'KASSIR'
  | 'STUDENT'
  | 'NURSE'
  | 'EDITOR'
  | 'MEDICAL_EDITOR';
/// String enum for the narrative "show formula for" toggle — stored as
/// String? in DB (it's ContentLevel + 'PATIENT', not a true enum).
type FormulaVisibility = 'PATIENT' | 'L1' | 'L2' | 'L3';

interface RedFlagRuleSeed {
  ruleKey: string;
  nameKey: string;
  actionKey: string;
  severity: Severity;
  applicableCategories?: string[];
  applicableIcd10Prefixes?: string[];
  condition: RuleCondition;
  sourceCitation?: string;
}

type InputSpec =
  | {
      id: string;
      type: 'number';
      labelKey: string;
      unit?: string;
      min?: number;
      max?: number;
      step?: number;
      required?: boolean;
      defaultValue?: number;
      helpKey?: string;
    }
  | {
      id: string;
      type: 'boolean';
      labelKey: string;
      defaultValue?: boolean;
      helpKey?: string;
    }
  | {
      id: string;
      type: 'select';
      labelKey: string;
      required?: boolean;
      defaultValue?: string | number;
      options: Array<{ value: string | number; labelKey: string }>;
      helpKey?: string;
    };

interface ClinicalToolSeed {
  toolKey: string;
  toolType: ToolType;
  nameKey: string;
  descriptionKey?: string;
  source: string;
  sourceUrl?: string;
  evidenceLevel?: EvidenceLevel;
  formulaKey: string;
  inputs: InputSpec[];
  outputSchema?: Record<string, unknown>;
  showFormulaForAudience?: FormulaVisibility;
  applicableCategories?: string[];
  applicableIcd10Prefixes?: string[];
  allowedAudiences?: Audience[];
  requiredRoles?: Role[];
  regionFitness?: 'HIGH' | 'MEDIUM' | 'LOW';
  priorityWeight?: number;
}

// ─── Red-flag rules (snapshot of src/app/lib/red-flag-engine.ts) ─────────────

const RED_FLAG_RULES: RedFlagRuleSeed[] = [
  // Hypertension / cardiology-wide
  {
    ruleKey: 'rule.hypertensive-crisis',
    nameKey: 'redflag.hypertensiveCrisis',
    actionKey: 'emergency.critical.action',
    severity: 'CRITICAL',
    applicableCategories: ['cardiology'],
    condition: { kind: 'symptom', code: 'bp-sbp-180' },
    sourceCitation: 'ACC/AHA 2017; ESC 2018',
  },
  {
    ruleKey: 'rule.suspected-acs',
    nameKey: 'redflag.suspectedACS',
    actionKey: 'emergency.critical.action',
    severity: 'CRITICAL',
    applicableCategories: ['cardiology'],
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
    sourceCitation: 'ESC 2023 ACS Guidelines',
  },
  {
    // GLOBAL — FAST signs fire regardless of disease context.
    ruleKey: 'rule.suspected-stroke',
    nameKey: 'redflag.suspectedStroke',
    actionKey: 'emergency.critical.action',
    severity: 'CRITICAL',
    condition: {
      kind: 'or',
      conditions: [
        { kind: 'symptom', code: 'focal-weakness' },
        { kind: 'symptom', code: 'slurred-speech' },
        { kind: 'symptom', code: 'sudden-vision-loss' },
      ],
    },
    sourceCitation: 'AHA/ASA 2019 Stroke Guideline',
  },
  {
    ruleKey: 'rule.intracranial-htn',
    nameKey: 'redflag.intracranialHTN',
    actionKey: 'emergency.high.action',
    severity: 'HIGH',
    applicableCategories: ['cardiology', 'neurology'],
    condition: {
      kind: 'and',
      conditions: [
        { kind: 'symptom', code: 'headache-severe' },
        { kind: 'symptom', code: 'vomiting' },
      ],
    },
  },

  // Atrial fibrillation (I48)
  {
    ruleKey: 'rule.unstable-af',
    nameKey: 'redflag.unstableAf',
    actionKey: 'emergency.critical.action',
    severity: 'CRITICAL',
    applicableIcd10Prefixes: ['I48'],
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
    sourceCitation: 'ESC 2020 AF §7',
  },
  {
    ruleKey: 'rule.oac-bleed',
    nameKey: 'redflag.oacBleed',
    actionKey: 'emergency.critical.action',
    severity: 'CRITICAL',
    applicableIcd10Prefixes: ['I48'],
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
    sourceCitation: 'ESC 2020 AF §11 (bleed management)',
  },

  // Diabetes (E10 / E11)
  {
    ruleKey: 'rule.dka',
    nameKey: 'redflag.dka',
    actionKey: 'emergency.critical.action',
    severity: 'CRITICAL',
    applicableIcd10Prefixes: ['E10', 'E11'],
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
    sourceCitation: 'ADA 2024 Standards of Care',
  },
  {
    ruleKey: 'rule.severe-hypoglycemia',
    nameKey: 'redflag.severeHypoglycemia',
    actionKey: 'emergency.critical.action',
    severity: 'CRITICAL',
    applicableIcd10Prefixes: ['E10', 'E11'],
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
    sourceCitation: 'ADA 2024 Standards of Care §6',
  },
];

// ─── Clinical tools (Wave 1) ────────────────────────────────────────────────

// PHQ-9 / GAD-7 Likert options (0 = "Not at all" … 3 = "Nearly every day")
const PHQ_LIKERT = [
  { value: 0, labelKey: 'tool.likert.notAtAll' },
  { value: 1, labelKey: 'tool.likert.severalDays' },
  { value: 2, labelKey: 'tool.likert.moreThanHalf' },
  { value: 3, labelKey: 'tool.likert.nearlyEveryDay' },
];

const PHQ9_ITEMS: InputSpec[] = Array.from({ length: 9 }, (_, i) => ({
  id: `q${i + 1}`,
  type: 'select' as const,
  labelKey: `tool.phq9.q${i + 1}`,
  required: true,
  defaultValue: 0,
  options: PHQ_LIKERT,
}));

const GAD7_ITEMS: InputSpec[] = Array.from({ length: 7 }, (_, i) => ({
  id: `q${i + 1}`,
  type: 'select' as const,
  labelKey: `tool.gad7.q${i + 1}`,
  required: true,
  defaultValue: 0,
  options: PHQ_LIKERT,
}));

const CLINICAL_TOOLS: ClinicalToolSeed[] = [
  // ─── SCORE ─────────────────────────────────────────────────────────────
  {
    toolKey: 'score2',
    toolType: 'SCORE',
    nameKey: 'calc.score2.name',
    descriptionKey: 'calc.score2.description',
    source: 'ESC 2021 CVD Prevention Guidelines',
    sourceUrl: 'https://doi.org/10.1093/eurheartj/ehab484',
    evidenceLevel: 'A',
    formulaKey: 'score2',
    applicableCategories: ['cardiology'],
    showFormulaForAudience: 'L2',
    regionFitness: 'MEDIUM', // "very high risk" region kalibrovkasi O'zbekiston uchun indikativ
    priorityWeight: 20,
    inputs: [
      { id: 'age', type: 'number', labelKey: 'calc.score2.age', unit: 'yil',
        min: 40, max: 69, step: 1, required: true, defaultValue: 55 },
      { id: 'sex', type: 'select', labelKey: 'calc.score2.sex', required: true,
        defaultValue: 'male',
        options: [
          { value: 'male', labelKey: 'calc.common.sex.male' },
          { value: 'female', labelKey: 'calc.common.sex.female' },
        ] },
      { id: 'smoking', type: 'boolean', labelKey: 'calc.score2.smoking',
        defaultValue: false },
      { id: 'sbp', type: 'number', labelKey: 'calc.score2.sbp', unit: 'mm Hg',
        min: 90, max: 220, step: 1, required: true, defaultValue: 140 },
      { id: 'nonHdl', type: 'number', labelKey: 'calc.score2.nonHdl',
        unit: 'mmol/L', min: 2, max: 10, step: 0.1, required: true,
        defaultValue: 4.0 },
      { id: 'region', type: 'select', labelKey: 'calc.score2.region',
        required: true, defaultValue: 'very_high',
        options: [
          { value: 'low', labelKey: 'calc.score2.region.low' },
          { value: 'moderate', labelKey: 'calc.score2.region.moderate' },
          { value: 'high', labelKey: 'calc.score2.region.high' },
          { value: 'very_high', labelKey: 'calc.score2.region.very_high' },
        ] },
    ],
  },
  {
    toolKey: 'ckd-epi-2021',
    toolType: 'SCORE',
    nameKey: 'calc.gfr.name',
    descriptionKey: 'calc.gfr.description',
    source: 'CKD-EPI 2021 · KDIGO',
    sourceUrl: 'https://doi.org/10.1056/NEJMoa2102953',
    evidenceLevel: 'A',
    formulaKey: 'ckd-epi-2021',
    applicableCategories: ['nephrology', 'cardiology', 'endocrinology'],
    showFormulaForAudience: 'L2',
    regionFitness: 'HIGH',
    priorityWeight: 10,
    inputs: [
      { id: 'creatinine', type: 'number', labelKey: 'calc.gfr.creatinine',
        unit: 'mg/dL', min: 0.3, max: 15, step: 0.1, required: true,
        defaultValue: 1.0 },
      { id: 'age', type: 'number', labelKey: 'calc.gfr.age', unit: 'yil',
        min: 18, max: 110, step: 1, required: true, defaultValue: 50 },
      { id: 'sex', type: 'select', labelKey: 'calc.gfr.sex', required: true,
        defaultValue: 'male',
        options: [
          { value: 'male', labelKey: 'calc.common.sex.male' },
          { value: 'female', labelKey: 'calc.common.sex.female' },
        ] },
    ],
  },
  {
    toolKey: 'chads-vasc',
    toolType: 'SCORE',
    nameKey: 'calc.chadsVasc.name',
    descriptionKey: 'calc.chadsVasc.description',
    source: 'ESC 2020 AF Guidelines',
    sourceUrl: 'https://doi.org/10.1093/eurheartj/ehaa612',
    evidenceLevel: 'A',
    formulaKey: 'chads-vasc',
    applicableCategories: ['cardiology'],
    applicableIcd10Prefixes: ['I48'],
    showFormulaForAudience: 'L2',
    regionFitness: 'HIGH',
    priorityWeight: 15,
    inputs: [
      { id: 'age', type: 'number', labelKey: 'calc.chadsVasc.age', unit: 'yil',
        min: 18, max: 110, step: 1, required: true, defaultValue: 70 },
      { id: 'sex', type: 'select', labelKey: 'calc.chadsVasc.sex', required: true,
        defaultValue: 'male',
        options: [
          { value: 'male', labelKey: 'calc.common.sex.male' },
          { value: 'female', labelKey: 'calc.common.sex.female' },
        ] },
      { id: 'chf', type: 'boolean', labelKey: 'calc.chadsVasc.chf',
        defaultValue: false },
      { id: 'htn', type: 'boolean', labelKey: 'calc.chadsVasc.htn',
        defaultValue: false },
      { id: 'diabetes', type: 'boolean', labelKey: 'calc.chadsVasc.diabetes',
        defaultValue: false },
      { id: 'stroke', type: 'boolean', labelKey: 'calc.chadsVasc.stroke',
        helpKey: 'calc.chadsVasc.stroke.help', defaultValue: false },
      { id: 'vascular', type: 'boolean', labelKey: 'calc.chadsVasc.vascular',
        helpKey: 'calc.chadsVasc.vascular.help', defaultValue: false },
    ],
  },
  {
    toolKey: 'has-bled',
    toolType: 'SCORE',
    nameKey: 'calc.hasBled.name',
    descriptionKey: 'calc.hasBled.description',
    source: 'ESC 2020 AF Guidelines',
    sourceUrl: 'https://doi.org/10.1093/eurheartj/ehaa612',
    evidenceLevel: 'A',
    formulaKey: 'has-bled',
    applicableCategories: ['cardiology'],
    applicableIcd10Prefixes: ['I48'],
    showFormulaForAudience: 'L2',
    regionFitness: 'HIGH',
    priorityWeight: 16,
    inputs: [
      { id: 'htn', type: 'boolean', labelKey: 'calc.hasBled.htn',
        helpKey: 'calc.hasBled.htn.help', defaultValue: false },
      { id: 'renal', type: 'boolean', labelKey: 'calc.hasBled.renal',
        helpKey: 'calc.hasBled.renal.help', defaultValue: false },
      { id: 'liver', type: 'boolean', labelKey: 'calc.hasBled.liver',
        helpKey: 'calc.hasBled.liver.help', defaultValue: false },
      { id: 'stroke', type: 'boolean', labelKey: 'calc.hasBled.stroke',
        defaultValue: false },
      { id: 'bleeding', type: 'boolean', labelKey: 'calc.hasBled.bleeding',
        helpKey: 'calc.hasBled.bleeding.help', defaultValue: false },
      { id: 'labileInr', type: 'boolean', labelKey: 'calc.hasBled.labileInr',
        helpKey: 'calc.hasBled.labileInr.help', defaultValue: false },
      { id: 'elderly', type: 'boolean', labelKey: 'calc.hasBled.elderly',
        defaultValue: false },
      { id: 'drugs', type: 'boolean', labelKey: 'calc.hasBled.drugs',
        helpKey: 'calc.hasBled.drugs.help', defaultValue: false },
      { id: 'alcohol', type: 'boolean', labelKey: 'calc.hasBled.alcohol',
        helpKey: 'calc.hasBled.alcohol.help', defaultValue: false },
    ],
  },
  {
    // Wave 1 NEW: CAP severity triage (J13-J18)
    toolKey: 'curb-65',
    toolType: 'SCORE',
    nameKey: 'tool.curb65.name',
    descriptionKey: 'tool.curb65.description',
    source: 'BTS 2009 (Lim et al., Thorax 2003)',
    sourceUrl: 'https://doi.org/10.1136/thorax.58.5.377',
    evidenceLevel: 'A',
    formulaKey: 'curb-65',
    applicableCategories: ['pulmonology', 'internal-medicine'],
    applicableIcd10Prefixes: ['J13', 'J14', 'J15', 'J16', 'J17', 'J18'],
    showFormulaForAudience: 'L1',
    regionFitness: 'HIGH',
    priorityWeight: 12,
    // Klinisist-target asbob: bemor o'zi yakka ishlatmaydi, chunki BP
    // va urea'ni bilmaydi. NURSE triaj vaqtida ishlatishi mumkin.
    allowedAudiences: ['STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST'],
    outputSchema: {
      bands: [
        { band: 'low', min: 0, max: 1, adviceKey: 'tool.curb65.band.low' },
        { band: 'moderate', min: 2, max: 2, adviceKey: 'tool.curb65.band.moderate' },
        { band: 'high', min: 3, max: 5, adviceKey: 'tool.curb65.band.high' },
      ],
    },
    inputs: [
      { id: 'confusion', type: 'boolean', labelKey: 'tool.curb65.confusion',
        helpKey: 'tool.curb65.confusion.help', defaultValue: false },
      { id: 'urea', type: 'boolean', labelKey: 'tool.curb65.urea',
        helpKey: 'tool.curb65.urea.help', defaultValue: false },
      { id: 'respRate', type: 'boolean', labelKey: 'tool.curb65.respRate',
        helpKey: 'tool.curb65.respRate.help', defaultValue: false },
      { id: 'bp', type: 'boolean', labelKey: 'tool.curb65.bp',
        helpKey: 'tool.curb65.bp.help', defaultValue: false },
      { id: 'age65', type: 'boolean', labelKey: 'tool.curb65.age65',
        defaultValue: false },
    ],
  },

  // ─── QUESTIONNAIRE ─────────────────────────────────────────────────────
  {
    toolKey: 'phq-9',
    toolType: 'QUESTIONNAIRE',
    nameKey: 'tool.phq9.name',
    descriptionKey: 'tool.phq9.description',
    source: 'Kroenke, Spitzer, Williams — JAMA 1999',
    sourceUrl: 'https://doi.org/10.1046/j.1525-1497.2001.016009606.x',
    evidenceLevel: 'A',
    formulaKey: 'phq-9',
    // Ommaviy skrining — FE'da kategoriyaga bog'lanmaydi, BUT L1 konsultatsiyada
    // ham tavsiya etiladi. Shuning uchun keng scope qoldiramiz.
    applicableCategories: ['psychiatry', 'primary-care', 'endocrinology', 'cardiology'],
    applicableIcd10Prefixes: ['F32', 'F33', 'E10', 'E11', 'I25'],
    // PHQ-9 / GAD-7 — validated for patient self-report; NURSE/STUDENT/DOCTOR
    // ham ishlatishi mumkin (MIXED audience kerak emas, explicit ro'yxat).
    allowedAudiences: ['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST'],
    showFormulaForAudience: 'L1',
    regionFitness: 'HIGH',
    priorityWeight: 5, // eng yuqori (Wave 1 flagship)
    outputSchema: {
      bands: [
        { band: 'minimal', min: 0, max: 4, adviceKey: 'tool.phq9.band.minimal' },
        { band: 'mild', min: 5, max: 9, adviceKey: 'tool.phq9.band.mild' },
        { band: 'moderate', min: 10, max: 14, adviceKey: 'tool.phq9.band.moderate' },
        { band: 'moderately_severe', min: 15, max: 19, adviceKey: 'tool.phq9.band.moderatelySevere' },
        { band: 'severe', min: 20, max: 27, adviceKey: 'tool.phq9.band.severe' },
      ],
      // Q9 (suicidal ideation) ≥ 1 holida FE "escalate" banner chiqaradi.
      escalate: { when: { q9: { gte: 1 } }, actionKey: 'tool.phq9.escalate' },
    },
    inputs: PHQ9_ITEMS,
  },
  {
    toolKey: 'gad-7',
    toolType: 'QUESTIONNAIRE',
    nameKey: 'tool.gad7.name',
    descriptionKey: 'tool.gad7.description',
    source: 'Spitzer et al. — Arch Intern Med 2006',
    sourceUrl: 'https://doi.org/10.1001/archinte.166.10.1092',
    evidenceLevel: 'A',
    formulaKey: 'gad-7',
    applicableCategories: ['psychiatry', 'primary-care', 'cardiology'],
    applicableIcd10Prefixes: ['F41'],
    // PHQ-9 / GAD-7 — validated for patient self-report; NURSE/STUDENT/DOCTOR
    // ham ishlatishi mumkin (MIXED audience kerak emas, explicit ro'yxat).
    allowedAudiences: ['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST'],
    showFormulaForAudience: 'L1',
    regionFitness: 'HIGH',
    priorityWeight: 6,
    outputSchema: {
      bands: [
        { band: 'minimal', min: 0, max: 4, adviceKey: 'tool.gad7.band.minimal' },
        { band: 'mild', min: 5, max: 9, adviceKey: 'tool.gad7.band.mild' },
        { band: 'moderate', min: 10, max: 14, adviceKey: 'tool.gad7.band.moderate' },
        { band: 'severe', min: 15, max: 21, adviceKey: 'tool.gad7.band.severe' },
      ],
    },
    inputs: GAD7_ITEMS,
  },
];

// ─── Seed runner ────────────────────────────────────────────────────────────

/**
 * Upsert the full catalogue. Idempotent by design:
 *   - `ruleKey` / `toolKey` are UNIQUE; re-running replays only the
 *     immutable-intent fields (name, source, inputs, formula, outputSchema).
 *   - Admin-controlled fields (`isActive`, `allowedAudiences`, `requiredRoles`,
 *     `clinicOverridesJson`, `priorityWeight`) are written on CREATE and
 *     left untouched on UPDATE, so a redeploy never overrides a clinic's
 *     "disable this tool" decision.
 */
export async function seedTriageCatalogue(prisma: PrismaClient): Promise<{
  rulesUpserted: number;
  toolsUpserted: number;
}> {
  let rulesUpserted = 0;
  for (const r of RED_FLAG_RULES) {
    await prisma.redFlagRule.upsert({
      where: { ruleKey: r.ruleKey },
      update: {
        nameKey: r.nameKey,
        actionKey: r.actionKey,
        severity: r.severity,
        applicableCategories: r.applicableCategories ?? [],
        applicableIcd10Prefixes: r.applicableIcd10Prefixes ?? [],
        conditionJson: r.condition as unknown as Prisma.InputJsonValue,
        sourceCitation: r.sourceCitation ?? null,
      },
      create: {
        ruleKey: r.ruleKey,
        nameKey: r.nameKey,
        actionKey: r.actionKey,
        severity: r.severity,
        applicableCategories: r.applicableCategories ?? [],
        applicableIcd10Prefixes: r.applicableIcd10Prefixes ?? [],
        conditionJson: r.condition as unknown as Prisma.InputJsonValue,
        sourceCitation: r.sourceCitation ?? null,
      },
    });
    rulesUpserted++;
  }

  let toolsUpserted = 0;
  for (const t of CLINICAL_TOOLS) {
    await prisma.clinicalTool.upsert({
      where: { toolKey: t.toolKey },
      // UPDATE: faqat immutable-intent maydonlari yangilanadi. Admin tuning
      // (isActive/allowedAudiences/requiredRoles/clinicOverridesJson)
      // saqlanib qoladi — aks holda klinika admin qilgan deaktivatsiya har
      // redeploy'da tiklanib qolardi.
      update: {
        toolType: t.toolType,
        nameKey: t.nameKey,
        descriptionKey: t.descriptionKey ?? null,
        source: t.source,
        sourceUrl: t.sourceUrl ?? null,
        evidenceLevel: t.evidenceLevel ?? 'C',
        formulaKey: t.formulaKey,
        inputsJson: t.inputs as unknown as Prisma.InputJsonValue,
        outputSchemaJson:
          (t.outputSchema as Prisma.InputJsonValue | undefined) ?? Prisma.DbNull,
        showFormulaForAudience: t.showFormulaForAudience ?? null,
        applicableCategories: t.applicableCategories ?? [],
        applicableIcd10Prefixes: t.applicableIcd10Prefixes ?? [],
        regionFitness: t.regionFitness ?? null,
      },
      create: {
        toolKey: t.toolKey,
        toolType: t.toolType,
        nameKey: t.nameKey,
        descriptionKey: t.descriptionKey ?? null,
        source: t.source,
        sourceUrl: t.sourceUrl ?? null,
        evidenceLevel: t.evidenceLevel ?? 'C',
        formulaKey: t.formulaKey,
        inputsJson: t.inputs as unknown as Prisma.InputJsonValue,
        outputSchemaJson:
          (t.outputSchema as Prisma.InputJsonValue | undefined) ?? Prisma.DbNull,
        showFormulaForAudience: t.showFormulaForAudience ?? null,
        applicableCategories: t.applicableCategories ?? [],
        applicableIcd10Prefixes: t.applicableIcd10Prefixes ?? [],
        allowedAudiences: t.allowedAudiences ?? [],
        requiredRoles: t.requiredRoles ?? [],
        isActive: true,
        regionFitness: t.regionFitness ?? null,
        priorityWeight: t.priorityWeight ?? 100,
      },
    });
    toolsUpserted++;
  }

  return { rulesUpserted, toolsUpserted };
}

/** Exposed for tests / admin-UI "reset to defaults" action. */
export const TRIAGE_CATALOGUE_SEED = {
  rules: RED_FLAG_RULES,
  tools: CLINICAL_TOOLS,
} as const;
