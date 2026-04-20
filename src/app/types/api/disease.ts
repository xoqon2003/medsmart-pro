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
