import type { CalculatorSchema, CalculatorResult } from '../types/api/calculator';

/**
 * CHA₂DS₂-VASc — stroke risk score for non-valvular atrial fibrillation.
 *
 * Source: Lip GYH et al. "Refining clinical risk stratification for
 * predicting stroke and thromboembolism in atrial fibrillation using a
 * novel risk factor-based approach." Chest 2010;137:263-72. Endorsed by
 * ESC 2020 AF Guidelines (doi:10.1093/eurheartj/ehaa612).
 *
 * Scope: ONLY for diagnosed atrial fibrillation (ICD-10 I48.*) — that's
 * why this schema ships with `applicableIcd10Prefixes: ['I48']` rather
 * than a category-wide gate. Using CHA₂DS₂-VASc outside AF is a common
 * clinical error the UI must prevent.
 *
 * Scoring (max 9):
 *   C  Congestive HF                       +1
 *   H  Hypertension                        +1
 *   A₂ Age ≥ 75                            +2  (Age 65-74 → +1)
 *   D  Diabetes                            +1
 *   S₂ Prior stroke / TIA / thromboembolism +2
 *   V  Vascular disease (MI, PAD, aortic)  +1
 *   A  Age 65-74 (handled above)           +1
 *   Sc Sex category female                 +1
 *
 * Management (ESC 2020):
 *   Men   ≥2 → oral anticoagulant recommended (Class I)
 *   Women ≥3 → oral anticoagulant recommended (Class I)
 *   Men   =1 / Women =2 → consider OAC (Class IIa) — decision-aid bias
 *                         against sex-only-1-point.
 */

function band(score: number): CalculatorResult['band'] {
  if (score <= 1) return 'low';
  if (score === 2) return 'moderate';
  if (score <= 4) return 'high';
  return 'very_high';
}

function interpretationKey(
  score: number,
): CalculatorResult['interpretationKey'] {
  if (score === 0) return 'calc.chadsVasc.band.0';
  if (score === 1) return 'calc.chadsVasc.band.1';
  if (score === 2) return 'calc.chadsVasc.band.2';
  if (score <= 4) return 'calc.chadsVasc.band.3-4';
  return 'calc.chadsVasc.band.5plus';
}

export const CHADS_VASC_SCHEMA: CalculatorSchema = {
  id: 'chads-vasc',
  nameKey: 'calc.chadsVasc.name',
  source: 'ESC 2020 AF Guidelines',
  applicableCategories: ['cardiology'],
  applicableIcd10Prefixes: ['I48'], // atrial fibrillation / flutter only
  inputs: [
    {
      id: 'age',
      type: 'number',
      labelKey: 'calc.chadsVasc.age',
      unit: 'yil',
      min: 18,
      max: 110,
      step: 1,
      required: true,
      defaultValue: 70,
    },
    {
      id: 'sex',
      type: 'select',
      labelKey: 'calc.chadsVasc.sex',
      required: true,
      defaultValue: 'male',
      options: [
        { value: 'male', labelKey: 'calc.common.sex.male' },
        { value: 'female', labelKey: 'calc.common.sex.female' },
      ],
    },
    {
      id: 'chf',
      type: 'boolean',
      labelKey: 'calc.chadsVasc.chf',
      defaultValue: false,
    },
    {
      id: 'htn',
      type: 'boolean',
      labelKey: 'calc.chadsVasc.htn',
      defaultValue: false,
    },
    {
      id: 'diabetes',
      type: 'boolean',
      labelKey: 'calc.chadsVasc.diabetes',
      defaultValue: false,
    },
    {
      id: 'stroke',
      type: 'boolean',
      labelKey: 'calc.chadsVasc.stroke',
      helpKey: 'calc.chadsVasc.stroke.help',
      defaultValue: false,
    },
    {
      id: 'vascular',
      type: 'boolean',
      labelKey: 'calc.chadsVasc.vascular',
      helpKey: 'calc.chadsVasc.vascular.help',
      defaultValue: false,
    },
  ],
  compute: (v) => {
    const age = Number(v.age);
    const isFemale = v.sex === 'female';

    let score = 0;
    if (age >= 75) score += 2;
    else if (age >= 65) score += 1;
    if (isFemale) score += 1;
    if (v.chf) score += 1;
    if (v.htn) score += 1;
    if (v.diabetes) score += 1;
    if (v.stroke) score += 2;
    if (v.vascular) score += 1;

    return {
      value: score,
      unit: '',
      band: band(score),
      interpretationKey: interpretationKey(score),
      recommendationKey:
        (isFemale ? score >= 3 : score >= 2)
          ? 'calc.chadsVasc.rec.oac'
          : score === (isFemale ? 2 : 1)
            ? 'calc.chadsVasc.rec.considerOac'
            : 'calc.chadsVasc.rec.noOac',
    };
  },
  showFormulaForAudience: 'L2',
};
