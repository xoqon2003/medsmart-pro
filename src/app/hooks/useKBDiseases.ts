import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDiseases } from '../api/diseases';
import { apiFetch } from '../api/http';

export const useKBDiseasesList = (params?: Record<string, string | number | undefined>) =>
  useQuery({
    queryKey: ['kb-diseases', params],
    queryFn: () => listDiseases({ ...params, limit: 100 }),
  });

// Moderation actions
export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) =>
      apiFetch(`/kb/blocks/${blockId}/submit-review`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kb-diseases'] }),
  });
};

export const useApproveBlock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, signature }: { blockId: string; signature?: string }) =>
      apiFetch(`/kb/blocks/${blockId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ signature }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-queue'] });
      qc.invalidateQueries({ queryKey: ['kb-diseases'] });
    },
  });
};

export const useRejectBlock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, reason }: { blockId: string; reason: string }) =>
      apiFetch(`/kb/blocks/${blockId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['review-queue'] }),
  });
};

export const usePublishBlock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) =>
      apiFetch(`/kb/blocks/${blockId}/publish`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-queue'] });
      qc.invalidateQueries({ queryKey: ['kb-diseases'] });
    },
  });
};

export const useReviewQueue = () =>
  useQuery({
    queryKey: ['review-queue'],
    queryFn: () => apiFetch<{ items: ReviewQueueItem[]; total: number }>('/kb/review-queue'),
  });

export interface ReviewQueueEditLog {
  diffJson: unknown;
  createdAt: string;
  editor?: { id: number; fullName: string | null };
}

export interface ReviewQueueItem {
  id: string;
  marker: string;
  label: string;
  contentMd: string;
  status: string;
  evidenceLevel?: string;
  level?: string;
  submittedAt?: string;
  submittedBy?: string;
  submittedByName?: string;
  disease?: {
    id: string;
    slug: string;
    nameUz: string;
    icd10: string;
  };
  /** Last UPDATE-type edit log — used by diff viewer */
  editLogs?: ReviewQueueEditLog[];
}
