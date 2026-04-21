import { apiFetch } from './http';
import type {
  DiseaseListResponse,
  DiseaseDetail,
  DiseaseSearchParams,
  DiseaseListItem,
  DiseaseScientist,
  DiseaseResearch,
  DiseaseGenetic,
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

// ── KB v2 metadata (PR-14/15) ───────────────────────────────────────────────
//
// Uchta yangi modelga public GET endpointlar. Backend mutation'lar
// (POST/PATCH/DELETE) admin UI'da kerak bo'ladi — hozir faqat o'qish.

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
