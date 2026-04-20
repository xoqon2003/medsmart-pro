import { useQuery } from '@tanstack/react-query';
import { listDoctorInbox, getTriageSession } from '../api/triage';
import type { InboxQuery } from '../api/triage';

/**
 * Shifokor inboxidagi triage sessiyalar ro'yxati.
 * GET /triage/sessions?status=SENT_TO_DOCTOR&page=...
 */
export const useDoctorInbox = (query: InboxQuery = {}) =>
  useQuery({
    queryKey: ['doctor-inbox', query],
    queryFn: () => listDoctorInbox(query),
    placeholderData: (prev) => prev,
    refetchInterval: 30_000, // 30 sek'da bir yangilanadi (WebSocket kelgunicha)
  });

/**
 * Bitta triage sessiya tafsiloti.
 * GET /triage/sessions/:id
 */
export const useTriageSession = (sessionId: string) =>
  useQuery({
    queryKey: ['triage-session', sessionId],
    queryFn: () => getTriageSession(sessionId),
    enabled: !!sessionId,
  });
