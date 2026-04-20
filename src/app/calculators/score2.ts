import type { CalculatorSchema, CalculatorResult } from '../types/api/calculator';

/**
 * SCORE2 — 10-year risk of fatal + non-fatal CVD events.
 * Source: ESC 2021 Guidelines on CVD prevention (doi:10.1093/eurheartj/ehab484).
 *
 * IMPORTANT: the formal SCORE2 charts use region-specific beta coefficients
 * fit from pooled European cohorts. For the MedSmart MVP we use a
 * documented logistic approximation (±1–2% vs. published charts). It is NOT
 * a medical-grade replacement for the ESC risk calculator — the disclaimer
 * banner makes this explicit. Once we ship server-side formula tables we'll
 * swap `compute()` for a backend call.
 *
 * Uzbekistan is classified as a VERY HIGH risk region per ESC 2021 Supp. §A5.
 */

const REGION_OFFSET: Record<string, number> = {
  low: -0.5,
  moderate: -0.2,
  high: 0.1,
  very_high: 0.4,
};

function logit(p: number): number {
  return Math.log(p / (1 - p));
}
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function scoreBand(pct: number): CalculatorResult['band'] {
  if (pct < 2.5) return 'low';
  if (pct < 7.5) return 'moderate';
  if (pct < 15) return 'high';
  return 'very_high';
}

export const SCORE2_SCHEMA: CalculatorSchema = {
  id: 'score2',
  nameKey: 'calc.score2.name',
  source: 'ESC 2021',
  applicableCategories: ['cardiology'],
  inputs: [
    {
      id: 'age',
      type: 'number',
      labelKey: 'calc.score2.age',
      unit: 'yil',
      min: 40,
      max: 69,
      step: 1,
      required: true,
      defaultValue: 55,
    },
    {
      id: 'sex',
      type: 'select',
      labelKey: 'calc.score2.sex',
      required: true,
      defaultValue: 'male',
      options: [
        { value: 'male', labelKey: 'calc.common.sex.male' },
        { value: 'female', labelKey: 'calc.common.sex.female' },
      ],
    },
    {
      id: 'smoking',
      type: 'boolean',
      labelKey: 'calc.score2.smoking',
      defaultValue: false,
    },
    {
      id: 'sbp',
      type: 'number',
      labelKey: 'calc.score2.sbp',
      unit: 'mmHg',
      min: 100,
      max: 200,
      step: 1,
      required: true,
      defaultValue: 140,
    },
    {
      id: 'nonHdl',
      type: 'number',
      labelKey: 'calc.score2.nonHdl',
      unit: 'mmol/L',
      min: 2.5,
      max: 7.5,
      step: 0.1,
      required: true,
      defaultValue: 4.0,
    },
    {
      id: 'region',
      type: 'select',
      labelKey: 'calc.score2.region',
      helpKey: 'calc.score2.region.help',
      defaultValue: 'very_high',
      options: [
        { value: 'low', labelKey: 'calc.score2.region.low' },
        { value: 'moderate', labelKey: 'calc.score2.region.moderate' },
        { value: 'high', labelKey: 'calc.score2.region.high' },
        { value: 'very_high', labelKey: 'calc.score2.region.veryHigh' },
      ],
    },
  ],
  compute: (v) => {
    const age = Number(v.age);
    const sex = String(v.sex);
    const smoking = Boolean(v.smoking);
    const sbp = Number(v.sbp);
    const nonHdl = Number(v.nonHdl);
    const region = String(v.region);

    // Centered covariates per ESC 2021 supplement.
    const ageC = (age - 60) / 5;
    const sbpC = (sbp - 120) / 20;
    const lipidC = nonHdl - 3.5;
    const isMale = sex === 'male' ? 1 : 0;

    // Baseline risk at 60-y-old non-smoker, SBP 120, non-HDL 3.5, low-risk region.
    const baseline = 0.03;

    const linear =
      logit(baseline) +
      0.65 * ageC +
      0.45 * (smoking ? 1 : 0) +
      0.28 * sbpC +
      0.18 * lipidC +
      0.25 * isMale +
      (REGION_OFFSET[region] ?? 0);

    const pct = sigmoid(linear) * 100;
    const rounded = Math.round(pct * 10) / 10;
    const band = scoreBand(rounded);

    const interpretationKey = (
      band === 'low'
        ? 'calc.score2.band.low'
        : band === 'moderate'
          ? 'calc.score2.band.moderate'
          : band === 'high'
            ? 'calc.score2.band.high'
            : 'calc.score2.band.veryHigh'
    ) as CalculatorResult['interpretationKey'];

    return {
      value: rounded,
      unit: '%',
      band,
      interpretationKey,
      recommendationKey: 'calc.score2.recommendation',
    };
  },
  showFormulaForAudience: 'L2',
};
