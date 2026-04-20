export type AnswerValue = 'YES' | 'NO' | 'UNKNOWN' | 'SOMETIMES';

export interface TriageMatchRequest {
  userSymptoms: Array<{ code: string; answer: AnswerValue }>;
  diseaseId?: string;
}

export interface TriageMatchResult {
  sessionId: string;
  diseaseId: string;
  score: number;
  matchedSymptoms: string[];
  missingSymptoms: string[];
  redFlagHit: boolean;
}

export interface TriageSession {
  id: string;
  diseaseId: string;
  matchScore: number;
  status: 'ACTIVE' | 'SENT_TO_DOCTOR' | 'EXPIRED' | 'ARCHIVED';
  userAnswers: Record<string, AnswerValue>;
  createdAt: string;
  expiresAt: string;
}
