import type { RiskFactorGroup } from '../types/api/matcher-wizard';
import type { TranslationKey } from '../lib/i18n';

/**
 * Risk-factor catalog (GAP-01 step 2, TZ §3.1.3 Bosqich 2).
 *
 * Four clinical buckets: lifestyle, genetic/family history, comorbidities,
 * medications. IDs are stable dotted keys so the Json payload stays
 * diff-friendly when the catalog evolves.
 *
 * Kept client-side for MVP; once the RedFlagRule + RiskFactor tables ship
 * this will be fetched from `/api/v1/references/risk-factors`.
 */

export interface RiskFactorSpec {
  id: string;
  group: RiskFactorGroup;
  labelKey: TranslationKey;
  /** Visible only for the relevant audience level when we wire L2/L3 filtering. */
  audienceMin?: 'L1' | 'L2' | 'L3';
}

export const RISK_FACTORS: readonly RiskFactorSpec[] = [
  // Lifestyle (modifiable)
  { id: 'lifestyle.smoking', group: 'lifestyle', labelKey: 'risk.lifestyle.smoking' },
  { id: 'lifestyle.alcohol', group: 'lifestyle', labelKey: 'risk.lifestyle.alcohol' },
  { id: 'lifestyle.inactive', group: 'lifestyle', labelKey: 'risk.lifestyle.inactive' },
  { id: 'lifestyle.overweight', group: 'lifestyle', labelKey: 'risk.lifestyle.overweight' },
  { id: 'lifestyle.salt', group: 'lifestyle', labelKey: 'risk.lifestyle.salt' },
  { id: 'lifestyle.sleep', group: 'lifestyle', labelKey: 'risk.lifestyle.sleep' },

  // Genetic / family history
  { id: 'genetic.parent_htn', group: 'genetic', labelKey: 'risk.genetic.parentHtn' },
  { id: 'genetic.early_mi', group: 'genetic', labelKey: 'risk.genetic.earlyMi' },
  { id: 'genetic.stroke', group: 'genetic', labelKey: 'risk.genetic.stroke' },
  { id: 'genetic.diabetes', group: 'genetic', labelKey: 'risk.genetic.diabetes' },
  { id: 'genetic.kidney', group: 'genetic', labelKey: 'risk.genetic.kidney' },

  // Comorbidities
  { id: 'comorbid.ckd', group: 'comorbid', labelKey: 'risk.comorbid.ckd' },
  { id: 'comorbid.dm', group: 'comorbid', labelKey: 'risk.comorbid.dm' },
  { id: 'comorbid.hyperlipid', group: 'comorbid', labelKey: 'risk.comorbid.hyperlipid' },
  { id: 'comorbid.osa', group: 'comorbid', labelKey: 'risk.comorbid.osa' },
  { id: 'comorbid.pregnancy', group: 'comorbid', labelKey: 'risk.comorbid.pregnancy' },

  // Medications
  { id: 'medications.nsaid', group: 'medications', labelKey: 'risk.medications.nsaid' },
  { id: 'medications.ocp', group: 'medications', labelKey: 'risk.medications.ocp' },
  { id: 'medications.steroids', group: 'medications', labelKey: 'risk.medications.steroids' },
  { id: 'medications.decongestants', group: 'medications', labelKey: 'risk.medications.decongestants' },
] as const;

export const RISK_FACTOR_GROUPS: readonly {
  key: RiskFactorGroup;
  titleKey: TranslationKey;
}[] = [
  { key: 'lifestyle', titleKey: 'risk.group.lifestyle' },
  { key: 'genetic', titleKey: 'risk.group.genetic' },
  { key: 'comorbid', titleKey: 'risk.group.comorbid' },
  { key: 'medications', titleKey: 'risk.group.medications' },
] as const;

export function groupRiskFactors(): Record<RiskFactorGroup, RiskFactorSpec[]> {
  const out: Record<RiskFactorGroup, RiskFactorSpec[]> = {
    lifestyle: [],
    genetic: [],
    comorbid: [],
    medications: [],
  };
  for (const rf of RISK_FACTORS) out[rf.group].push(rf);
  return out;
}
