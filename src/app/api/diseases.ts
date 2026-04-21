import { apiFetch } from './http';
import type {
  DiseaseListResponse,
  DiseaseDetail,
  DiseaseSearchParams,
  DiseaseListItem,
  DiseaseScientist,
  DiseaseResearch,
  DiseaseGenetic,
  ScientistRole,
  ResearchType,
  InheritancePattern,
  BloodGroup,
} from '../types/api/disease';
import type { DiseaseSymptomWithWeight } from '../types/api/symptom';
import {
  mockListDiseases,
  mockGetDisease,
  mockGetDiseaseSymptoms,
  mockLookupByIcd,
  mockSemanticSearch,
  mockGetDiseaseScientists,
  mockGetDiseaseResearch,
  mockGetDiseaseGenetics,
  mockCreateScientist,
  mockUpdateScientist,
  mockDeleteScientist,
  mockCreateResearch,
  mockUpdateResearch,
  mockDeleteResearch,
  mockCreateGenetic,
  mockUpdateGenetic,
  mockDeleteGenetic,
} from './diseases.mock';

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';

export const listDiseases = (params: DiseaseSearchParams): Promise<DiseaseListResponse> => {
  if (!USE_REAL_API) return mockListDiseases(params);
  return apiFetch<DiseaseListResponse>('/diseases', {
    params: params as Record<string, string | number | undefined>,
  });
};

export const getDisease = (slug: string, level?: 'L1' | 'L2' | 'L3'): Promise<DiseaseDetail> => {
  if (!USE_REAL_API) return mockGetDisease(slug);
  return apiFetch<DiseaseDetail>(`/diseases/${slug}`, {
    params: level ? { level } : undefined,
  });
};

export const getDiseaseSymptoms = (slug: string): Promise<DiseaseSymptomWithWeight[]> => {
  if (!USE_REAL_API) return mockGetDiseaseSymptoms(slug);
  return apiFetch<DiseaseSymptomWithWeight[]>(`/diseases/${slug}/symptoms`);
};

export const lookupByIcd = (code: string): Promise<{ slug: string; id: string; icd10: string }> => {
  if (!USE_REAL_API) return mockLookupByIcd(code);
  return apiFetch<{ slug: string; id: string; icd10: string }>(`/icd/${code}`);
};

/**
 * Semantik (vektor) qidiruv — FTS dan farqli, ma'no bo'yicha qidiradi.
 * Backend: `GET /api/v1/diseases/semantic-search?q=...&limit=...`
 */
export const semanticSearch = (q: string, limit = 10): Promise<DiseaseListItem[]> => {
  if (!USE_REAL_API) return mockSemanticSearch(q, limit);
  return apiFetch<DiseaseListItem[]>(
    `/diseases/semantic-search?q=${encodeURIComponent(q)}&limit=${limit}`,
  );
};

// ── KB v2 metadata reads (PR-14/15) ─────────────────────────────────────────

export const getDiseaseScientists = (slug: string): Promise<DiseaseScientist[]> => {
  if (!USE_REAL_API) return mockGetDiseaseScientists(slug);
  return apiFetch<DiseaseScientist[]>(`/diseases/${slug}/scientists`);
};

export const getDiseaseResearch = (slug: string): Promise<DiseaseResearch[]> => {
  if (!USE_REAL_API) return mockGetDiseaseResearch(slug);
  return apiFetch<DiseaseResearch[]>(`/diseases/${slug}/research`);
};

export const getDiseaseGenetics = (slug: string): Promise<DiseaseGenetic[]> => {
  if (!USE_REAL_API) return mockGetDiseaseGenetics(slug);
  return apiFetch<DiseaseGenetic[]>(`/diseases/${slug}/genetics`);
};

// ── KB v2 metadata mutations — admin UI uchun (PR-15 backend) ──────────────
//
// Backend write endpointlari `:id` (disease UUID) bo'yicha, read endpointlari
// esa `:slug` bo'yicha — shuning uchun yozuv funksiyalarida `diseaseId`
// parametri ishlatilgan.

export type CreateScientistInput = {
  fullName: string;
  role: ScientistRole;
  country?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  bioMd?: string | null;
  contributionsMd?: string | null;
  photoUrl?: string | null;
  orderIndex?: number;
};
export type UpdateScientistInput = Partial<CreateScientistInput>;

export type CreateResearchInput = {
  title: string;
  authors: string;
  journal?: string | null;
  year: number;
  doi?: string | null;
  pubmedId?: string | null;
  nctId?: string | null;
  type: ResearchType;
  summaryMd: string;
  evidenceLevel?: 'A' | 'B' | 'C' | 'D';
  isLandmark?: boolean;
};
export type UpdateResearchInput = Partial<CreateResearchInput>;

export type CreateGeneticInput = {
  geneSymbol?: string | null;
  variantType?: string | null;
  inheritancePattern?: InheritancePattern | null;
  penetrance?: string | number | null;
  bloodGroupRisk?: BloodGroup | null;
  populationNoteMd?: string | null;
};
export type UpdateGeneticInput = Partial<CreateGeneticInput>;

// Scientists

export const createScientist = (
  diseaseId: string,
  input: CreateScientistInput,
): Promise<DiseaseScientist> => {
  if (!USE_REAL_API) return mockCreateScientist(diseaseId, input);
  return apiFetch<DiseaseScientist>(`/diseases/${diseaseId}/scientists`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const updateScientist = (
  diseaseId: string,
  scientistId: string,
  input: UpdateScientistInput,
): Promise<DiseaseScientist> => {
  if (!USE_REAL_API) return mockUpdateScientist(diseaseId, scientistId, input);
  return apiFetch<DiseaseScientist>(`/diseases/${diseaseId}/scientists/${scientistId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
};

export const deleteScientist = (
  diseaseId: string,
  scientistId: string,
): Promise<{ ok: true }> => {
  if (!USE_REAL_API) return mockDeleteScientist(diseaseId, scientistId);
  return apiFetch<{ ok: true }>(`/diseases/${diseaseId}/scientists/${scientistId}`, {
    method: 'DELETE',
  });
};

// Research

export const createResearch = (
  diseaseId: string,
  input: CreateResearchInput,
): Promise<DiseaseResearch> => {
  if (!USE_REAL_API) return mockCreateResearch(diseaseId, input);
  return apiFetch<DiseaseResearch>(`/diseases/${diseaseId}/research`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const updateResearch = (
  diseaseId: string,
  researchId: string,
  input: UpdateResearchInput,
): Promise<DiseaseResearch> => {
  if (!USE_REAL_API) return mockUpdateResearch(diseaseId, researchId, input);
  return apiFetch<DiseaseResearch>(`/diseases/${diseaseId}/research/${researchId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
};

export const deleteResearch = (
  diseaseId: string,
  researchId: string,
): Promise<{ ok: true }> => {
  if (!USE_REAL_API) return mockDeleteResearch(diseaseId, researchId);
  return apiFetch<{ ok: true }>(`/diseases/${diseaseId}/research/${researchId}`, {
    method: 'DELETE',
  });
};

// Genetics

export const createGenetic = (
  diseaseId: string,
  input: CreateGeneticInput,
): Promise<DiseaseGenetic> => {
  if (!USE_REAL_API) return mockCreateGenetic(diseaseId, input);
  return apiFetch<DiseaseGenetic>(`/diseases/${diseaseId}/genetics`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const updateGenetic = (
  diseaseId: string,
  geneticId: string,
  input: UpdateGeneticInput,
): Promise<DiseaseGenetic> => {
  if (!USE_REAL_API) return mockUpdateGenetic(diseaseId, geneticId, input);
  return apiFetch<DiseaseGenetic>(`/diseases/${diseaseId}/genetics/${geneticId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
};

export const deleteGenetic = (
  diseaseId: string,
  geneticId: string,
): Promise<{ ok: true }> => {
  if (!USE_REAL_API) return mockDeleteGenetic(diseaseId, geneticId);
  return apiFetch<{ ok: true }>(`/diseases/${diseaseId}/genetics/${geneticId}`, {
    method: 'DELETE',
  });
};
