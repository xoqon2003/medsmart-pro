export interface TriageFhirInput {
  sessionId: string;
  userId: number | null;
  anonymousId?: string;
  diseaseSlug: string;
  diseaseIcd10: string;
  matchScore: number;
  matchedSymptoms: string[];
  totalSymptoms: number;
  redFlagHit: boolean;
  excludingHit: boolean;
  symptomAnswers: Array<{ code: string; nameUz: string; answer: string }>;
  authored: Date;
}

export function buildQuestionnaireResponse(input: TriageFhirInput) {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    subject: {
      reference: input.userId
        ? `Patient/${input.userId}`
        : `AnonymousPatient/${input.anonymousId ?? 'unknown'}`,
    },
    questionnaire: `Disease/${input.diseaseSlug}/symptoms`,
    authored: input.authored.toISOString(),
    item: input.symptomAnswers.map((a) => ({
      linkId: `symptom_${a.code}`,
      text: a.nameUz,
      answer: [{ valueCoding: { system: 'medsmart:answer', code: a.answer } }],
    })),
    meta: {
      matchScore: input.matchScore,
      matchedSymptoms: input.matchedSymptoms.length,
      totalSymptoms: input.totalSymptoms,
      diseaseSlug: input.diseaseSlug,
      diseaseIcd10: input.diseaseIcd10,
      sessionId: input.sessionId,
      redFlagHit: input.redFlagHit,
      excludingHit: input.excludingHit,
    },
  };
}
