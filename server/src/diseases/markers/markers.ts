/**
 * Kasalliklar bazasi — canonical marker ro'yxati.
 * `DiseaseBlock.marker` faqat shu ro'yxatdan qiymat qabul qiladi (422 aks holda).
 * Ro'yxat `docs/analysis/feature-analysis.md §10` dan olingan; kengaytirilsa
 * migratsiya + seed yangilanishi kerak.
 */
export const CANONICAL_MARKERS = [
  'etiology',
  'pathogenesis',
  'symptoms',
  'diagnosis',
  'treatment',
  'stages',
  'classification',
  'epidemiology',
  'risk_factors',
  'prevention',
  'prognosis',
  'complications',
  'differential',
  'referral',
  'rehabilitation',
  'diet',
  'lifestyle',
  'red_flags',
  'emergency',
  'patient_education',
  'specialists',
  'labs',
  'imaging',
  'medications',
  'procedures',
  'monitoring',
  'follow_up',
  'clinical_cases',
  'faq',
  'references',
  'icd_codes',
  'synonyms',
  'overview',
  'anatomy',
  'physiology',
  'definition',
  'history',
  'guidelines',
] as const;

export type MarkerId = (typeof CANONICAL_MARKERS)[number];

export function isCanonicalMarker(value: string): value is MarkerId {
  return (CANONICAL_MARKERS as readonly string[]).includes(value);
}
