import { useQuery } from '@tanstack/react-query';
import { listDiseases, getDisease, getDiseaseSymptoms, semanticSearch } from '../api/diseases';
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
