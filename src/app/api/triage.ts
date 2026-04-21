import { apiFetch } from './http';
import type { TriageMatchRequest, TriageMatchResult, AnswerValue } from '../types/api/triage';

// ─── Doctor inbox ─────────────────────────────────────────────────────────────

export interface InboxSession {
  id: string;
  matchScore: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  matchedSymptomCount: number;
  missingSymptomCount: number;
  disease: {
    id: string;
    slug: string;
    icd10: string;
    nameUz: string;
    nameRu: string | null;
  } | null;
  patient: { id: number | null; displayName: string } | null;
}

export interface InboxPage {
  items: InboxSession[];
  total: number;
  page: number;
  limit: number;
}

export interface InboxQuery {
  doctorId?: string;
  status?: 'ACTIVE' | 'SENT_TO_DOCTOR' | 'EXPIRED' | 'ARCHIVED';
  page?: number;
  limit?: number;
}

export const listDoctorInbox = (query: InboxQuery = {}) =>
  apiFetch<InboxPage>('/triage/sessions', { params: query as Record<string, string | number | undefined> });

export const getTriageSession = (sessionId: string) =>
  apiFetch<Record<string, unknown>>(`/triage/sessions/${sessionId}`);

export const matchTriage = (dto: TriageMatchRequest) =>
  apiFetch<TriageMatchResult>('/triage/match', {
    method: 'POST',
    body: JSON.stringify(dto),
  });

export const sendTriageToDoctor = (
  sessionId: string,
  dto: { doctorId: number; anonymousMode?: boolean; note?: string },
) =>
  apiFetch(`/triage/sessions/${sessionId}/send-to-doctor`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });

export const saveTriageNote = (sessionId: string, noteMd: string) =>
  apiFetch(`/triage/sessions/${sessionId}/save-note`, {
    method: 'POST',
    body: JSON.stringify({ noteMd }),
  });

/**
 * Update triage session status (doctor side: archive after review).
 * PATCH-like: POST /triage/sessions/:id/update
 */
export const updateTriageSession = (
  sessionId: string,
  status: 'ACTIVE' | 'ARCHIVED' | 'EXPIRED',
) =>
  apiFetch(`/triage/sessions/${sessionId}/update`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });

/**
 * Debounced answer sync — persists the current symptom answers to the session.
 * Called on every answer change with a 600 ms debounce so the DB stays in sync
 * even if the user leaves before clicking "Shifokorga yuborish".
 */
export const updateSessionAnswers = (
  sessionId: string,
  userAnswers: Record<string, AnswerValue>,
): Promise<void> =>
  apiFetch(`/triage/sessions/${sessionId}/update`, {
    method: 'POST',
    body: JSON.stringify({ userAnswers }),
  });
