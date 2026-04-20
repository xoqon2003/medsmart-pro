import type { CalculatorSchema, CalculatorResult } from '../types/api/calculator';

/**
 * HAS-BLED — major bleeding risk score for patients on (or considered for)
 * oral anticoagulation in the setting of atrial fibrillation.
 *
 * Source: Pisters R et al. "A novel user-friendly score (HAS-BLED) to
 * assess 1-year risk of major bleeding in patients with atrial
 * fibrillation." Chest 2010;138:1093-100. ESC 2020 AF Guidelines endorse
 * it as the preferred bleeding-risk score (Class IIa).
 *
 * Scope: ONLY for diagnosed atrial fibrillation (ICD-10 I48.*). Paired
 * with CHA₂DS₂-VASc in the AF disease card so clinicians can weigh
 * stroke vs. bleed risk side-by-side.
 *
 * Scoring (max 9):
 *   H  Hypertension (SBP > 160)                         +1
 *   A  Abnormal renal (Cr > 200 µmol/L or dialysis)     +1
 *      Abnormal liver (cirrhosis, bili > 2×, AST > 3×)  +1
 *   S  Prior stroke                                     +1
 *   B  Prior major bleeding or predisposition           +1
 *   L  Labile INR (TTR < 60%)                           +1
 *   E  Elderly (> 65)                                   +1
 *   D  Drugs (antiplatelet/NSAID)                       +1
 *      Alcohol ≥ 8 units/week                           +1
 *
 * Interpretation:
 *   0-2 → low bleed risk       (OAC safe)
 *   ≥ 3 → high bleed risk      (address modifiable factors, don't auto-stop OAC)
 *
 * IMPORTANT: HAS-BLED does NOT substitute for CHA₂DS₂-VASc. A high
 * HAS-BLED score is a flag to correct modifiable risk (uncontrolled BP,
 * NSAID co-prescription, alcohol), not to withhold anticoagulation.
 */

function band(score: number): CalculatorResult['band'] {
  if (score <= 1) return 'low';
  if (score === 2) return 'moderate';
  if (score === 3) return 'high';
  return 'very_high';
}

function interpretationKey(
  score: number,
): CalculatorResult['interpretationKey'] {
  if (score <= 1) return 'calc.hasBled.band.low';
  if (score === 2) return 'calc.hasBled.band.moderate';
  return 'calc.hasBled.band.high';
}

export const HAS_BLED_SCHEMA: CalculatorSchema = {
  id: 'has-bled',
  nameKey: 'calc.hasBled.name',
  source: 'ESC 2020 AF Guidelines',
  applicableCategories: ['cardiology'],
  applicableIcd10Prefixes: ['I48'], // atrial fibrillation / flutter only
  inputs: [
    {
      id: 'htn',
      type: 'boolean',
      labelKey: 'calc.hasBled.htn',
      helpKey: 'calc.hasBled.htn.help',
      defaultValue: false,
    },
    {
      id: 'renal',
      type: 'boolean',
      labelKey: 'calc.hasBled.renal',
      helpKey: 'calc.hasBled.renal.help',
      defaultValue: false,
    },
    {
      id: 'liver',
      type: 'boolean',
      labelKey: 'calc.hasBled.liver',
      helpKey: 'calc.hasBled.liver.help',
      defaultValue: false,
    },
    {
      id: 'stroke',
      type: 'boolean',
      labelKey: 'calc.hasBled.stroke',
      defaultValue: false,
    },
    {
      id: 'bleeding',
      type: 'boolean',
      labelKey: 'calc.hasBled.bleeding',
      helpKey: 'calc.hasBled.bleeding.help',
      defaultValue: false,
    },
    {
      id: 'labileInr',
      type: 'boolean',
      labelKey: 'calc.hasBled.labileInr',
      helpKey: 'calc.hasBled.labileInr.help',
      defaultValue: false,
    },
    {
      id: 'elderly',
      type: 'boolean',
      labelKey: 'calc.hasBled.elderly',
      defaultValue: false,
    },
    {
      id: 'drugs',
      type: 'boolean',
      labelKey: 'calc.hasBled.drugs',
      helpKey: 'calc.hasBled.drugs.help',
      defaultValue: false,
    },
    {
      id: 'alcohol',
      type: 'boolean',
      labelKey: 'calc.hasBled.alcohol',
      defaultValue: false,
    },
  ],
  compute: (v) => {
    let score = 0;
    if (v.htn) score += 1;
    if (v.renal) score += 1;
    if (v.liver) score += 1;
    if (v.stroke) score += 1;
    if (v.bleeding) score += 1;
    if (v.labileInr) score += 1;
    if (v.elderly) score += 1;
    if (v.drugs) score += 1;
    if (v.alcohol) score += 1;

    return {
      value: score,
      unit: '',
      band: band(score),
      interpretationKey: interpretationKey(score),
      recommendationKey:
        score >= 3
          ? 'calc.hasBled.rec.reviewModifiable'
          : 'calc.hasBled.rec.oacSafe',
    };
  },
  showFormulaForAudience: 'L2',
};
