import type { CalculatorSchema, CalculatorResult } from '../types/api/calculator';

/**
 * CKD-EPI 2021 (race-free) — Estimated glomerular filtration rate (eGFR).
 *
 * Source: Inker LA et al. "New Creatinine- and Cystatin C–Based Equations
 * to Estimate GFR without Race." NEJM 2021;385:1737-49 (doi:10.1056/NEJMoa2102953).
 *
 * Formula (creatinine-only variant):
 *   eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^age
 *        × (1.012 if female)
 *
 * Where:
 *   - Scr: serum creatinine in mg/dL
 *   - κ = 0.7 (F), 0.9 (M)
 *   - α = -0.241 (F), -0.302 (M)
 *
 * KDIGO 2024 categories by eGFR:
 *   G1  ≥90   — normal / high
 *   G2  60-89 — mildly decreased
 *   G3a 45-59 — mild-moderate ↓
 *   G3b 30-44 — moderate-severe ↓
 *   G4  15-29 — severely decreased
 *   G5  <15   — kidney failure
 */

function bandFromEgfr(egfr: number): CalculatorResult['band'] {
  if (egfr >= 90) return 'low'; // normal
  if (egfr >= 60) return 'moderate';
  if (egfr >= 30) return 'high';
  return 'very_high';
}

function interpretationKey(
  egfr: number,
): CalculatorResult['interpretationKey'] {
  if (egfr >= 90) return 'calc.gfr.band.g1';
  if (egfr >= 60) return 'calc.gfr.band.g2';
  if (egfr >= 45) return 'calc.gfr.band.g3a';
  if (egfr >= 30) return 'calc.gfr.band.g3b';
  if (egfr >= 15) return 'calc.gfr.band.g4';
  return 'calc.gfr.band.g5';
}

export const CKD_EPI_2021_SCHEMA: CalculatorSchema = {
  id: 'ckd-epi-2021',
  nameKey: 'calc.gfr.name',
  source: 'CKD-EPI 2021 · KDIGO',
  applicableCategories: ['nephrology', 'cardiology', 'endocrinology'],
  inputs: [
    {
      id: 'creatinine',
      type: 'number',
      labelKey: 'calc.gfr.creatinine',
      unit: 'mg/dL',
      min: 0.2,
      max: 15,
      step: 0.01,
      required: true,
      defaultValue: 1.0,
    },
    {
      id: 'age',
      type: 'number',
      labelKey: 'calc.gfr.age',
      unit: 'yil',
      min: 18,
      max: 110,
      step: 1,
      required: true,
      defaultValue: 55,
    },
    {
      id: 'sex',
      type: 'select',
      labelKey: 'calc.gfr.sex',
      required: true,
      defaultValue: 'male',
      options: [
        { value: 'male', labelKey: 'calc.common.sex.male' },
        { value: 'female', labelKey: 'calc.common.sex.female' },
      ],
    },
  ],
  compute: (v) => {
    const scr = Number(v.creatinine);
    const age = Number(v.age);
    const isFemale = v.sex === 'female';

    const kappa = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const ratio = scr / kappa;

    const egfr =
      142 *
      Math.pow(Math.min(ratio, 1), alpha) *
      Math.pow(Math.max(ratio, 1), -1.2) *
      Math.pow(0.9938, age) *
      (isFemale ? 1.012 : 1);

    const rounded = Math.round(egfr);
    return {
      value: rounded,
      unit: 'ml/min/1.73m²',
      band: bandFromEgfr(rounded),
      interpretationKey: interpretationKey(rounded),
      recommendationKey: 'calc.gfr.recommendation',
    };
  },
  showFormulaForAudience: 'L2',
};
