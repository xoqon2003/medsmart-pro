/**
 * Phase 3.1: Canonical types moved to @medsmart/types.
 * This file remains as a thin re-export stub for backward compatibility —
 * existing imports from '../../types/api/disease' keep working unchanged.
 *
 * New code should prefer:
 *   import type { DiseaseDetail } from '@medsmart/types';
 * or specifically:
 *   import type { DiseaseDetail } from '@medsmart/types/disease';
 */
export type {
  DiseaseListItem,
  DiseaseBlock,
  DiseaseDetail,
  DiseaseListResponse,
  DiseaseSearchParams,
  ScientistRole,
  DiseaseScientist,
  ResearchType,
  DiseaseResearch,
  InheritancePattern,
  BloodGroup,
  DiseaseGenetic,
} from '@medsmart/types/disease';
