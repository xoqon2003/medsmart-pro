import {
  buildQuestionnaireResponse,
  TriageFhirInput,
} from '../../common/fhir/questionnaire-response.builder';

const BASE_INPUT: TriageFhirInput = {
  sessionId: 'sess-001',
  userId: null,
  diseaseSlug: 'gripp',
  diseaseIcd10: 'J11',
  matchScore: 0.82,
  matchedSymptoms: ['FEVER', 'COUGH'],
  totalSymptoms: 5,
  redFlagHit: false,
  excludingHit: false,
  symptomAnswers: [
    { code: 'FEVER', nameUz: 'Isitma', answer: 'YES' },
    { code: 'COUGH', nameUz: 'Yo\'tal', answer: 'SOMETIMES' },
  ],
  authored: new Date('2026-04-17T10:00:00.000Z'),
};

describe('buildQuestionnaireResponse', () => {
  it('1. userId = 1 → subject reference is Patient/1', () => {
    const result = buildQuestionnaireResponse({ ...BASE_INPUT, userId: 1 });
    expect(result.subject.reference).toBe('Patient/1');
  });

  it('2. userId = null → subject reference is AnonymousPatient/...', () => {
    const result = buildQuestionnaireResponse({
      ...BASE_INPUT,
      userId: null,
      anonymousId: 'anon-abc',
    });
    expect(result.subject.reference).toMatch(/^AnonymousPatient\//);
  });

  it('3. item[0].answer[0].valueCoding.system === "medsmart:answer"', () => {
    const result = buildQuestionnaireResponse(BASE_INPUT);
    expect(result.item[0].answer[0].valueCoding.system).toBe('medsmart:answer');
  });
});
