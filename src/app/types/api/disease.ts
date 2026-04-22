export interface DiseaseListItem {
  id: string;
  slug: string;
  icd10: string;
  nameUz: string;
  nameRu?: string;
  nameEn?: string;
  nameLat?: string;
  category: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  audienceLevels: string[];
  updatedAt: string;
}

export interface DiseaseBlock {
  id: string;
  marker: string;
  label: string;
  level: 'L1' | 'L2' | 'L3';
  orderIndex: number;
  contentMd: string;
  /**
   * Structured block metadata. Backend returns an opaque JSON object that
   * consumers narrow via type assertions (see EmergencyBanner severity).
   * Kept `unknown`-typed here because shape varies per block `marker`.
   */
  contentJson?: Record<string, unknown> | null;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  status: string;
  publishedAt?: string;
}

export interface DiseaseDetail extends DiseaseListItem {
  synonyms: string[];
  severityLevels: string[];
  protocolSources: string[];
  blocks: DiseaseBlock[];
}

export interface DiseaseListResponse {
  items: DiseaseListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface DiseaseSearchParams {
  q?: string;
  icd?: string;
  category?: string;
  page?: number;
  limit?: number;
  audience?: string;
  locale?: string;
}

// ── KB v2 metadata (PR-14/15) ───────────────────────────────────────────────

export type ScientistRole =
  | 'DISCOVERER'
  | 'CLASSIFIER'
  | 'CONTRIBUTOR'
  | 'RESEARCHER'
  | 'EDITOR';

export interface DiseaseScientist {
  id: string;
  diseaseId: string;
  fullName: string;
  role: ScientistRole;
  country: string | null;
  birthYear: number | null;
  deathYear: number | null;
  bioMd: string | null;
  contributionsMd: string | null;
  photoUrl: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export type ResearchType =
  | 'RCT'
  | 'META_ANALYSIS'
  | 'SYSTEMATIC_REVIEW'
  | 'COHORT'
  | 'CASE_CONTROL'
  | 'CASE_SERIES'
  | 'CASE_REPORT'
  | 'GUIDELINE';

export interface DiseaseResearch {
  id: string;
  diseaseId: string;
  title: string;
  authors: string;
  journal: string | null;
  year: number;
  doi: string | null;
  pubmedId: string | null;
  nctId: string | null;
  type: ResearchType;
  summaryMd: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  isLandmark: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InheritancePattern =
  | 'AUTOSOMAL_DOMINANT'
  | 'AUTOSOMAL_RECESSIVE'
  | 'X_LINKED_DOMINANT'
  | 'X_LINKED_RECESSIVE'
  | 'MITOCHONDRIAL'
  | 'COMPLEX'
  | 'SPORADIC';

export type BloodGroup =
  | 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG'
  | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';

export interface DiseaseGenetic {
  id: string;
  diseaseId: string;
  geneSymbol: string | null;
  variantType: string | null;
  inheritancePattern: InheritancePattern | null;
  /** Decimal(4,3) — server string sifatida qaytaradi */
  penetrance: string | number | null;
  bloodGroupRisk: BloodGroup | null;
  populationNoteMd: string | null;
  createdAt: string;
  updatedAt: string;
}
