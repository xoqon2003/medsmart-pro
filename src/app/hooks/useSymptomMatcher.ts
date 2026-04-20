import { useState, useCallback, useRef } from 'react';
import { matchTriage, updateSessionAnswers } from '../api/triage';
import type { AnswerValue, TriageMatchResult } from '../types/api/triage';
import type { DiseaseSymptomWithWeight } from '../types/api/symptom';

export type MatcherStatus = 'idle' | 'matching' | 'ready' | 'sending';

interface UseSymptomMatcherReturn {
  answers: Map<string, AnswerValue>;
  score: number;
  sessionId: string | null;
  status: MatcherStatus;
  matchResult: TriageMatchResult | null;
  setAnswer: (code: string, answer: AnswerValue) => void;
  initSession: (diseaseId: string, symptoms: DiseaseSymptomWithWeight[]) => Promise<void>;
  reset: () => void;
}

/**
 * Frontend match-engine — mirrors backend algorithm (approximate, for optimistic UI).
 * YES=1, SOMETIMES=0.5, UNKNOWN=0, NO=-0.5
 * redFlag hit adds +0.2 bonus, excluding symptom multiplied by 0.5
 */
function computeScore(
  answers: Map<string, AnswerValue>,
  symptoms: DiseaseSymptomWithWeight[],
): number {
  if (symptoms.length === 0) return 0;

  let totalWeight = 0;
  let earnedScore = 0;

  for (const sym of symptoms) {
    const answer = answers.get(sym.code);
    const weight = sym.isExcluding ? sym.weight * 0.5 : sym.weight;
    totalWeight += weight;

    if (!answer || answer === 'UNKNOWN') {
      // contributes 0
      continue;
    }

    let base = 0;
    if (answer === 'YES') base = 1;
    else if (answer === 'SOMETIMES') base = 0.5;
    else if (answer === 'NO') base = -0.5;

    // Red flag bonus
    const bonus = sym.isRedFlag && answer === 'YES' ? 0.2 : 0;
    earnedScore += weight * (base + bonus);
  }

  if (totalWeight === 0) return 0;
  const raw = earnedScore / totalWeight;
  // Clamp to [0, 1]
  return Math.min(1, Math.max(0, raw));
}

export function useSymptomMatcher(): UseSymptomMatcherReturn {
  const [answers, setAnswers] = useState<Map<string, AnswerValue>>(new Map());
  const [score, setScore] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<MatcherStatus>('idle');
  const [matchResult, setMatchResult] = useState<TriageMatchResult | null>(null);

  // Keep symptoms ref for score recomputation
  const symptomsRef = useRef<DiseaseSymptomWithWeight[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initSession = useCallback(
    async (diseaseId: string, symptoms: DiseaseSymptomWithWeight[]) => {
      symptomsRef.current = symptoms;
      setStatus('matching');
      try {
        // Build initial answers array from current state (empty on first call)
        const userSymptoms = Array.from(answers.entries()).map(([code, answer]) => ({
          code,
          answer,
        }));
        const result = await matchTriage({ userSymptoms, diseaseId });
        setSessionId(result.sessionId);
        setMatchResult(result);
        setScore(result.score);
        setStatus('ready');
      } catch {
        setStatus('idle');
      }
    },
    [answers],
  );

  const setAnswer = useCallback(
    (code: string, answer: AnswerValue) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(code, answer);
        // Recompute local score immediately
        const localScore = computeScore(next, symptomsRef.current);
        setScore(localScore);
        return next;
      });

      // Debounced server sync — PATCH existing session, do NOT create new one
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        // Fire-and-forget; errors swallowed intentionally (optimistic UI).
        // Uses setAnswers functional form to get the latest state from React.
        setAnswers((current) => {
          if (sessionId) {
            const answersObj = Object.fromEntries(current) as Record<string, AnswerValue>;
            updateSessionAnswers(sessionId, answersObj).catch(() => {});
          }
          return current;
        });
      }, 600);
    },
    [sessionId],
  );

  const reset = useCallback(() => {
    setAnswers(new Map());
    setScore(0);
    setSessionId(null);
    setStatus('idle');
    setMatchResult(null);
    symptomsRef.current = [];
  }, []);

  return { answers, score, sessionId, status, matchResult, setAnswer, initSession, reset };
}
