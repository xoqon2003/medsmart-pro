import type { LucideIcon } from 'lucide-react';
import {
  Info,
  Stethoscope,
  Pill,
  Layers,
  AlertTriangle,
  Heart,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import type { TranslationKey } from '../lib/i18n';

export type AudienceLevel = 'L1' | 'L2' | 'L3';

export type DiseaseTabKey =
  | 'overview'
  | 'diagnostics'
  | 'treatment'
  | 'stages'
  | 'complications'
  | 'advice'
  | 'faq'
  | 'sources';

export interface DiseaseTabSpec {
  key: DiseaseTabKey;
  labelKey: TranslationKey;
  icon: LucideIcon;
  /** Minimal audience level required to see this tab. L1 = all. */
  audienceMin: AudienceLevel;
  /** Canonical block markers that belong under this tab. */
  blockMarkers: string[];
  /** Fallback order when a block has no explicit tab hint. */
  orderIndex: number;
}

/**
 * 8-tab Disease card structure (GAP-02, TZ §3.2).
 *
 * Maps existing DiseaseBlock.marker values to logical clinical sections.
 * Markers not listed here fall back to "overview". This keeps backward
 * compatibility with content authored before the tab refactor.
 */
export const DISEASE_TABS: readonly DiseaseTabSpec[] = [
  {
    key: 'overview',
    labelKey: 'disease.tabs.overview',
    icon: Info,
    audienceMin: 'L1',
    blockMarkers: [
      'overview',
      'about',
      'definition',
      'epidemiology',
      'etiology',
      'pathogenesis',
      'risk_factors',
      'risk-factors',
      'symptoms',
      'symptoms_list',
      'causes',
      'media',
      'scientists',
    ],
    orderIndex: 1,
  },
  {
    key: 'diagnostics',
    labelKey: 'disease.tabs.diagnostics',
    icon: Stethoscope,
    audienceMin: 'L1',
    blockMarkers: [
      'complaints',
      'anamnesis',
      'examination',
      'bp_measurement',
      'bp-measurement',
      'classification',
      'diagnostic_criteria',
      'labs',
      'imaging',
      'instrumental',
      'risk_stratification',
      'risk-stratification',
      'secondary_htn',
      'secondary-htn',
      'differential',
      'differential_diagnosis',
    ],
    orderIndex: 2,
  },
  {
    key: 'treatment',
    labelKey: 'disease.tabs.treatment',
    icon: Pill,
    audienceMin: 'L1',
    blockMarkers: [
      'goals',
      'treatment',
      'treatment_overview',
      'treatment_goals',
      'lifestyle',
      'algorithm',
      'medications',
      'procedures',
      'guidelines',
      'special_populations',
      'special-populations',
      'resistant',
    ],
    orderIndex: 3,
  },
  {
    key: 'stages',
    labelKey: 'disease.tabs.stages',
    icon: Layers,
    audienceMin: 'L1',
    blockMarkers: ['stages', 'crisis', 'stage_1', 'stage_2', 'stage_3'],
    orderIndex: 4,
  },
  {
    key: 'complications',
    labelKey: 'disease.tabs.complications',
    icon: AlertTriangle,
    audienceMin: 'L1',
    blockMarkers: [
      'complications',
      'red_flags',
      'emergency',
      'organ_damage',
      'heart',
      'brain',
      'kidney',
      'eye',
      'peripheral',
    ],
    orderIndex: 5,
  },
  {
    key: 'advice',
    labelKey: 'disease.tabs.advice',
    icon: Heart,
    audienceMin: 'L1',
    blockMarkers: [
      'advice',
      'patient_advice',
      'lifestyle_advice',
      'when_to_call',
      'when_to_seek_care',
      'self_monitoring',
      'monitoring',
      'follow_up',
    ],
    orderIndex: 6,
  },
  {
    key: 'faq',
    labelKey: 'disease.tabs.faq',
    icon: HelpCircle,
    audienceMin: 'L1',
    blockMarkers: ['faq', 'questions'],
    orderIndex: 7,
  },
  {
    key: 'sources',
    labelKey: 'disease.tabs.sources',
    icon: BookOpen,
    audienceMin: 'L1',
    blockMarkers: [
      'sources',
      'references',
      'scientific_references',
      'scientists',
      'clinical_cases',
    ],
    orderIndex: 8,
  },
] as const;

const MARKER_TO_TAB: Record<string, DiseaseTabKey> = (() => {
  const map: Record<string, DiseaseTabKey> = {};
  for (const tab of DISEASE_TABS) {
    for (const marker of tab.blockMarkers) {
      map[marker.toLowerCase()] = tab.key;
    }
  }
  return map;
})();

/**
 * Resolve which tab a given block marker belongs to.
 * Lookup is case-insensitive so both `DEFINITION` and `definition` work.
 * Unknown markers default to "overview" so legacy content stays visible.
 */
export function getTabForMarker(marker: string): DiseaseTabKey {
  return MARKER_TO_TAB[marker.toLowerCase()] ?? 'overview';
}

const AUDIENCE_ORDER: Record<AudienceLevel, number> = { L1: 1, L2: 2, L3: 3 };

/** True if the current audience has at least the tab's minimum level. */
export function isTabVisibleForAudience(
  tab: DiseaseTabSpec,
  audience: AudienceLevel,
): boolean {
  return AUDIENCE_ORDER[audience] >= AUDIENCE_ORDER[tab.audienceMin];
}
