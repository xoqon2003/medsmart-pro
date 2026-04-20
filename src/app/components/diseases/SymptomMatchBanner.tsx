import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/http';
import { CheckCircle2, X } from 'lucide-react';
import type { TriageSession } from '../../types/api/triage';

interface Props {
  sessionId: string;
  diseaseId: string;
}

interface SessionWithScore extends TriageSession {
  matchScore: number;
  matchedCount: number;
  totalCount: number;
}

/**
 * Banner shown only when a triage session id is present in the URL.
 * Fetches session data lazily and shows match score.
 */
export function SymptomMatchBanner({ sessionId, diseaseId }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['triage-session', sessionId, diseaseId],
    queryFn: () =>
      apiFetch<SessionWithScore>(`/triage/sessions/${sessionId}`),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="mb-4 h-12 rounded-xl bg-muted animate-pulse" />
    );
  }

  if (isError || !data) return null;

  const pct = Math.round(data.matchScore * 100);
  const matched = data.matchedCount ?? 0;
  const total = data.totalCount ?? 0;

  return (
    <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-800">
          Sizning simptomlaringiz mos keldi
        </p>
        {total > 0 ? (
          <p className="text-xs text-green-700 mt-0.5">
            {total} ta simptomdan {matched} tasi mos keldi ({pct}%)
          </p>
        ) : (
          <p className="text-xs text-green-700 mt-0.5">Mos kelish: {pct}%</p>
        )}
      </div>
    </div>
  );
}
