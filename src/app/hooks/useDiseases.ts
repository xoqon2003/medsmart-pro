import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listDiseases,
  getDisease,
  getDiseaseSymptoms,
  semanticSearch,
  getDiseaseScientists,
  getDiseaseResearch,
  getDiseaseGenetics,
  createScientist,
  updateScientist,
  deleteScientist,
  createResearch,
  updateResearch,
  deleteResearch,
  createGenetic,
  updateGenetic,
  deleteGenetic,
  type CreateScientistInput,
  type UpdateScientistInput,
  type CreateResearchInput,
  type UpdateResearchInput,
  type CreateGeneticInput,
  type UpdateGeneticInput,
} from '../api/diseases';
import type { DiseaseSearchParams } from '../types/api/disease';

export const useDiseasesList = (params: DiseaseSearchParams) =>
  useQuery({
    queryKey: ['diseases', params],
    queryFn: () => listDiseases(params),
    placeholderData: (prev) => prev,
  });

export const useDiseaseDetail = (slug: string, level?: 'L1' | 'L2' | 'L3') =>
  useQuery({
    queryKey: ['disease', slug, level],
    queryFn: () => getDisease(slug, level),
    enabled: !!slug,
  });

export const useDiseaseSymptoms = (slug: string) =>
  useQuery({
    queryKey: ['disease-symptoms', slug],
    queryFn: () => getDiseaseSymptoms(slug),
    enabled: !!slug,
  });

/**
 * Semantik (pgvector) qidiruv hook.
 * 3 belgidan ko'p bo'lganda so'rov yuboriladi.
 * staleTime: 2 daqiqa (vektorlar keshda saqlanadi).
 */
export const useSemanticSearch = (query: string, limit = 10) =>
  useQuery({
    queryKey: ['diseases', 'semantic', query, limit],
    queryFn: () => semanticSearch(query, limit),
    enabled: query.length > 3,
    staleTime: 2 * 60 * 1000,
  });

// ── KB v2 metadata (PR-14/15) ───────────────────────────────────────────────
//
// Scientists / Research / Genetics — DiseaseCard sahifa uchun alohida
// query'lar (asosiy detail query'ni bloklash o'rniga, lazy yuklash).
// staleTime: 5 daqiqa — metadata kamdan-kam o'zgaradi.

export const useDiseaseScientists = (slug: string) =>
  useQuery({
    queryKey: ['disease', slug, 'scientists'],
    queryFn: () => getDiseaseScientists(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

export const useDiseaseResearch = (slug: string) =>
  useQuery({
    queryKey: ['disease', slug, 'research'],
    queryFn: () => getDiseaseResearch(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

export const useDiseaseGenetics = (slug: string) =>
  useQuery({
    queryKey: ['disease', slug, 'genetics'],
    queryFn: () => getDiseaseGenetics(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

// ── Metadata mutations (Admin UI) ──────────────────────────────────────────
//
// Invalidatsiya strategiyasi: har mutation `['disease', slug, 'scientists'|
// 'research'|'genetics']` query'ni yangilaydi. Slug va diseaseId ikkalasi
// ham invalidatsiyaga kiritilgan — sahifa ikkisining birini ishlatishi mumkin.

function useInvalidateMeta(
  kind: 'scientists' | 'research' | 'genetics',
  slug: string,
  diseaseId: string,
) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['disease', slug, kind] });
    if (diseaseId && diseaseId !== slug) {
      qc.invalidateQueries({ queryKey: ['disease', diseaseId, kind] });
    }
  };
}

// Scientists

export const useCreateScientist = (slug: string, diseaseId: string) => {
  const invalidate = useInvalidateMeta('scientists', slug, diseaseId);
  return useMutation({
    mutationFn: (input: CreateScientistInput) => createScientist(diseaseId, input),
    onSuccess: invalidate,
  });
};

export const useUpdateScientist = (slug: string, diseaseId: string) => {
  const invalidate = useInvalidateMeta('scientists', slug, diseaseId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateScientistInput }) =>
      updateScientist(diseaseId, id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteScientist = (slug: string, diseaseId: string) => {
  const invalidate = useInvalidateMeta('scientists', slug, diseaseId);
  return useMutation({
    mutationFn: (id: string) => deleteScientist(diseaseId, id),
    onSuccess: invalidate,
  });
};

// Research

export const useCreateResearch = (slug: string, diseaseId: string) => {
  const invalidate = useInvalidateMeta('research', slug, diseaseId);
  return useMutation({
    mutationFn: (input: CreateResearchInput) => createResearch(diseaseId, input),
    onSuccess: invalidate,
  });
};

export const useUpdateResearch = (slug: string, diseaseId: string) => {
  const invalidate = useInvalidateMeta('research', slug, diseaseId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateResearchInput }) =>
      updateResearch(diseaseId, id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteResearch = (slug: string, diseaseId: string) => {
  const invalidate = useInvalidateMeta('research', slug, diseaseId);
  return useMutation({
    mutationFn: (id: string) => deleteResearch(diseaseId, id),
    onSuccess: invalidate,
  });
};

// Genetics

export const useCreateGenetic = (slug: string, diseaseId: string) => {
  const invalidate = useInvalidateMeta('genetics', slug, diseaseId);
  return useMutation({
    mutationFn: (input: CreateGeneticInput) => createGenetic(diseaseId, input),
    onSuccess: invalidate,
  });
};

export const useUpdateGenetic = (slug: string, diseaseId: string) => {
  const invalidate = useInvalidateMeta('genetics', slug, diseaseId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGeneticInput }) =>
      updateGenetic(diseaseId, id, input),
    onSuccess: invalidate,
  });
};

export const useDeleteGenetic = (slug: string, diseaseId: string) => {
  const invalidate = useInvalidateMeta('genetics', slug, diseaseId);
  return useMutation({
    mutationFn: (id: string) => deleteGenetic(diseaseId, id),
    onSuccess: invalidate,
  });
};
