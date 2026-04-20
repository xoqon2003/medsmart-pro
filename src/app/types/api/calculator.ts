import type { TranslationKey } from '../../lib/i18n';

/**
 * Clinical calculator schema (GAP-05, TZ §3.5).
 *
 * Declarative so we can author calculators (SCORE2, CHA₂DS₂-VASc, HAS-BLED,
 * CKD-EPI 2021, …) without writing a bespoke component per calculator.
 * The `compute` function is a pure reducer: schema inputs → result.
 */

export type CalculatorInputType = 'number' | 'boolean' | 'select';

export interface CalculatorSelectOption {
  value: string;
  labelKey: TranslationKey;
}

export interface CalculatorInput {
  id: string;
  type: CalculatorInputType;
  labelKey: TranslationKey;
  helpKey?: TranslationKey;
  /** For `type: 'number'` — units shown as suffix (e.g. "mmHg"). */
  unit?: string;
  /** For `type: 'number'` — inclusive range. */
  min?: number;
  max?: number;
  step?: number;
  /** For `type: 'select'`. */
  options?: CalculatorSelectOption[];
  required?: boolean;
  /** Default value applied when the form mounts. */
  defaultValue?: number | boolean | string;
}

/** A calculator always returns one primary result + zero or more derived bands. */
export interface CalculatorResult {
  /** Numeric result, already rounded for display. */
  value: number;
  /** Short unit suffix (e.g. "%", "ml/min/1.73m²"). */
  unit?: string;
  /** Qualitative band derived from `value`. */
  band: 'low' | 'moderate' | 'high' | 'very_high';
  /** Human-readable interpretation key. */
  interpretationKey: TranslationKey;
  /** Optional clinical recommendation(s) key. */
  recommendationKey?: TranslationKey;
}

export type CalculatorInputValues = Record<string, number | boolean | string>;

export interface CalculatorSchema {
  id: string;
  nameKey: TranslationKey;
  /** Citation text ("ESC 2021", "KDIGO 2021 CKD-EPI"). */
  source: string;
  /**
   * Broad category filter (matched against `disease.category`). Acts as a
   * first-pass gate — e.g. SCORE2 is relevant anywhere in cardiology.
   * Ignored when omitted.
   */
  applicableCategories?: string[];
  /**
   * Narrow ICD-10 filter — when set, the calculator is ONLY shown on diseases
   * whose ICD-10 code starts with one of these prefixes. Use this for tools
   * that are disease-specific rather than category-wide:
   *   - CHA₂DS₂-VASc: ['I48']         (atrial fibrillation / flutter)
   *   - HAS-BLED:     ['I48']         (bleed risk before anticoagulation)
   *   - FIB-4:        ['K74', 'K76']  (liver fibrosis)
   * Case-insensitive. Leading "ICD10:" is stripped before compare.
   */
  applicableIcd10Prefixes?: string[];
  inputs: CalculatorInput[];
  compute: (values: CalculatorInputValues) => CalculatorResult;
  /**
   * When true, the formula is shown beneath the result (only useful for L2/L3).
   * The UI gates this on audience level.
   */
  showFormulaForAudience?: 'L2' | 'L3';
}
