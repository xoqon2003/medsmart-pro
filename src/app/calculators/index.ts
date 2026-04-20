import type { CalculatorSchema } from '../types/api/calculator';
import { SCORE2_SCHEMA } from './score2';
import { CKD_EPI_2021_SCHEMA } from './ckd-epi-2021';
import { CHADS_VASC_SCHEMA } from './chads-vasc';
import { HAS_BLED_SCHEMA } from './has-bled';

/**
 * Central registry for clinical calculators (GAP-05).
 *
 * Add new schemas here; the disease card automatically shows calculators
 * whose `applicableCategories` AND/OR `applicableIcd10Prefixes` match the
 * current disease.
 */
export const CALCULATORS: readonly CalculatorSchema[] = [
  SCORE2_SCHEMA,
  CKD_EPI_2021_SCHEMA,
  CHADS_VASC_SCHEMA,
  HAS_BLED_SCHEMA,
] as const;

/**
 * Disease categories in the DB are currently stored as Uzbek slugs
 * (`yurak-qon-tomir`, `nafas-yollari`, `endokrin`, ...). Calculator schemas
 * use the canonical English taxonomy so they stay readable for clinicians
 * and align with ICD chapters. This map bridges the two until the backend
 * `DiseaseCategory` table ships with a stable canonical id.
 */
const CATEGORY_ALIASES: Record<string, string[]> = {
  cardiology: ['cardiology', 'yurak-qon-tomir', 'yurak', 'kardiologiya'],
  nephrology: ['nephrology', 'nefrologiya', 'buyrak'],
  endocrinology: ['endocrinology', 'endokrin', 'endokrinologiya'],
  pulmonology: ['pulmonology', 'nafas-yollari', 'pulmonologiya'],
  neurology: ['neurology', 'nerv-tizimi', 'nevrologiya'],
  gastroenterology: ['gastroenterology', 'hazm', 'gastroenterologiya'],
};

function matchesCategory(
  applicable: readonly string[] | undefined,
  category: string | undefined,
): boolean {
  if (!applicable || applicable.length === 0) return true; // no filter = open
  if (!category) return false;
  const cat = category.toLowerCase();
  return applicable.some((raw) => {
    const key = raw.toLowerCase();
    if (key === cat) return true;
    const aliases = CATEGORY_ALIASES[key];
    return aliases ? aliases.includes(cat) : false;
  });
}

function matchesIcd10(
  prefixes: readonly string[] | undefined,
  icd10: string | undefined,
): boolean {
  if (!prefixes || prefixes.length === 0) return true; // no filter = open
  if (!icd10) return false;
  const code = icd10.toLowerCase().replace(/^icd10:/, '').trim();
  return prefixes.some((raw) => code.startsWith(raw.toLowerCase()));
}

/**
 * A disease-lite shape so callers don't have to pass the full DiseaseDetail
 * (circular import hazard). Anything with `category` and `icd10` satisfies it.
 */
export interface CalculatorMatchTarget {
  category?: string;
  icd10?: string;
}

/**
 * Return the calculators that apply to a given disease. Both filters must
 * pass (AND semantics):
 *
 *   - `applicableCategories` — gate by broad medical category (open if unset)
 *   - `applicableIcd10Prefixes` — narrow to specific ICD-10 codes (open if unset)
 *
 * Rationale: SCORE2 is a cardiology-wide primary-prevention tool, but
 * CHA₂DS₂-VASc / HAS-BLED only make sense for atrial fibrillation (I48).
 * A category-only filter would show AF-specific calculators on every
 * cardiology card, which is a clinical error we must not tolerate.
 */
export function getApplicableCalculators(
  target: CalculatorMatchTarget,
): CalculatorSchema[] {
  return CALCULATORS.filter(
    (c) =>
      matchesCategory(c.applicableCategories, target.category) &&
      matchesIcd10(c.applicableIcd10Prefixes, target.icd10),
  );
}

/**
 * @deprecated Use `getApplicableCalculators({ category, icd10 })`. This
 * wrapper exists only so call-sites that don't have ICD-10 yet (legacy)
 * keep compiling; they will MISS disease-specific calculators because
 * they can't evaluate `applicableIcd10Prefixes`.
 */
export function getCalculatorsForCategory(
  category: string | undefined,
): CalculatorSchema[] {
  if (!category) return [];
  return CALCULATORS.filter(
    (c) =>
      matchesCategory(c.applicableCategories, category) &&
      // If a calculator is ICD-gated we must NOT surface it here — the
      // caller lacks the info to decide.
      (!c.applicableIcd10Prefixes || c.applicableIcd10Prefixes.length === 0),
  );
}

export {
  SCORE2_SCHEMA,
  CKD_EPI_2021_SCHEMA,
  CHADS_VASC_SCHEMA,
  HAS_BLED_SCHEMA,
};
