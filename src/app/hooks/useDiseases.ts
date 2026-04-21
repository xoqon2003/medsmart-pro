import { useQuery } from '@tanstack/react-query';
import {
  listDiseases,
  getDisease,
  getDiseaseSymptoms,
  semanticSearch,
  getDiseaseScientists,
  getDiseaseResearch,
  getDiseaseGenetics,
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
