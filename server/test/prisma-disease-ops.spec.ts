/**
 * PR-04 — Disease operational models Prisma smoke test.
 *
 * Covers SymptomMatchSession TTL, UserDiseaseNote cascade, AITriageSession creation.
 * Hits a real Postgres; skipped locally without DATABASE_URL.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/config/prisma.service';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

describe('PR-04 — Disease operations (Prisma smoke)', () => {
  let prisma: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();
    prisma = module.get(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    await prisma.symptomMatchSession.deleteMany({});
    await prisma.aITriageSession.deleteMany({});
    await prisma.userDiseaseNote.deleteMany({});
    await prisma.diseaseEditLog.deleteMany({});
    await prisma.regionEpidemiology.deleteMany({});
    await prisma.diseaseSpecialty.deleteMany({});
    await prisma.disease.deleteMany({});
  });

  const mkDisease = () =>
    prisma.disease.create({
      data: { slug: `ops-${Date.now()}`, icd10: `X${Date.now() % 100000}`, nameUz: 'X', category: 'x' },
    });

  it('creates a SymptomMatchSession with a 7-day expiresAt', async () => {
    const disease = await mkDisease();
    const expiresAt = new Date(Date.now() + SEVEN_DAYS_MS);

    const session = await prisma.symptomMatchSession.create({
      data: {
        anonymousId: 'anon-abc',
        diseaseId: disease.id,
        matchScore: '0.820',
        matchedSymptoms: [{ code: 'SYM-1', answer: 'YES' }],
        missingSymptoms: [],
        userAnswers: { 'SYM-1': 'YES' },
        expiresAt,
      },
    });

    expect(session.status).toBe('ACTIVE');
    expect(session.expiresAt.getTime() - Date.now()).toBeGreaterThan(SEVEN_DAYS_MS - 2_000);
  });

  it('creates an AITriageSession and links it from SymptomMatchSession', async () => {
    const disease = await mkDisease();
    const ai = await prisma.aITriageSession.create({
      data: {
        anonymousId: 'anon-xyz',
        symptoms: [{ code: 'SYM-1' }, { code: 'SYM-2' }],
        expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
      },
    });

    const match = await prisma.symptomMatchSession.create({
      data: {
        anonymousId: 'anon-xyz',
        aiTriageSessionId: ai.id,
        diseaseId: disease.id,
        matchedSymptoms: [],
        missingSymptoms: [],
        userAnswers: {},
        expiresAt: new Date(Date.now() + SEVEN_DAYS_MS),
      },
      include: { aiTriageSession: true },
    });

    expect(match.aiTriageSession?.id).toBe(ai.id);
  });

  it('cascade-deletes UserDiseaseNote when the Disease is deleted', async () => {
    const user = await prisma.user.create({
      data: { phone: `+99890${Date.now() % 10_000_000}`, fullName: 'T U', role: 'PATIENT' },
    });
    const disease = await mkDisease();

    await prisma.userDiseaseNote.create({
      data: { userId: user.id, diseaseId: disease.id, noteMd: 'hi' },
    });

    await prisma.disease.delete({ where: { id: disease.id } });

    const remaining = await prisma.userDiseaseNote.findMany({ where: { userId: user.id } });
    expect(remaining).toHaveLength(0);

    await prisma.user.delete({ where: { id: user.id } });
  });
});
