/**
 * PR-02 — Disease core Prisma smoke test.
 *
 * NOTE: This suite hits a real PostgreSQL database via PrismaService.
 * It is intentionally NOT mocked — the point is to verify the migration
 * + generated client at runtime. CI will run it with DATABASE_URL pointing
 * to a throwaway test DB (e.g. @testcontainers/postgresql).
 *
 * Until the DB is available, this file is a no-op in local dev. Skip with
 * `SKIP_DB_CONNECT=true` and Jest's `--testPathIgnorePatterns`.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/config/prisma.service';

describe('PR-02 — Disease core (Prisma smoke)', () => {
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
    // Clean slate: cascade covers DiseaseSymptom / DiseaseReference.
    await prisma.diseaseSymptom.deleteMany({});
    await prisma.diseaseReference.deleteMany({});
    await prisma.symptom.deleteMany({});
    await prisma.reference.deleteMany({});
    await prisma.disease.deleteMany({});
  });

  it('creates a Disease and finds it by slug', async () => {
    const disease = await prisma.disease.create({
      data: {
        slug: 'gipertoniya-i10',
        icd10: 'I10',
        nameUz: 'Gipertoniya',
        nameRu: 'Гипертония',
        category: 'cardiology',
        synonyms: ['yuqori bosim', 'arterial gipertenziya'],
      },
    });

    expect(disease.id).toBeDefined();
    expect(disease.status).toBe('DRAFT');

    const found = await prisma.disease.findUnique({ where: { slug: 'gipertoniya-i10' } });
    expect(found?.icd10).toBe('I10');
  });

  it('creates a Symptom with unique code', async () => {
    const symptom = await prisma.symptom.create({
      data: {
        code: 'SYM-HEAD-001',
        nameUz: "Bosh og'rigʻi",
        category: 'neurological',
        bodyZone: 'head',
        severity: 'MODERATE',
        synonyms: ['bosh ogirishi'],
      },
    });

    expect(symptom.code).toBe('SYM-HEAD-001');

    // Unique violation on duplicate code
    await expect(
      prisma.symptom.create({
        data: {
          code: 'SYM-HEAD-001',
          nameUz: 'Dubl',
          category: 'x',
        },
      }),
    ).rejects.toThrow();
  });

  it('links Disease ↔ Symptom via DiseaseSymptom with weight', async () => {
    const disease = await prisma.disease.create({
      data: {
        slug: 'migren-g43',
        icd10: 'G43',
        nameUz: 'Migren',
        category: 'neurology',
      },
    });
    const symptom = await prisma.symptom.create({
      data: { code: 'SYM-HEAD-001', nameUz: 'Bosh', category: 'neurological' },
    });

    const link = await prisma.diseaseSymptom.create({
      data: {
        diseaseId: disease.id,
        symptomId: symptom.id,
        weight: '0.850',
        isRequired: true,
      },
      include: { disease: true, symptom: true },
    });

    expect(link.disease.slug).toBe('migren-g43');
    expect(link.symptom.code).toBe('SYM-HEAD-001');
  });

  it('cascades delete: removing Disease wipes DiseaseSymptom rows', async () => {
    const disease = await prisma.disease.create({
      data: { slug: 'to-delete', icd10: 'Z00', nameUz: 'X', category: 'x' },
    });
    const symptom = await prisma.symptom.create({
      data: { code: 'SYM-DEL-001', nameUz: 'X', category: 'x' },
    });
    await prisma.diseaseSymptom.create({
      data: { diseaseId: disease.id, symptomId: symptom.id },
    });

    await prisma.disease.delete({ where: { id: disease.id } });

    const remaining = await prisma.diseaseSymptom.findMany({ where: { diseaseId: disease.id } });
    expect(remaining).toHaveLength(0);

    // Symptom itself survives — dictionary data.
    const sym = await prisma.symptom.findUnique({ where: { id: symptom.id } });
    expect(sym).not.toBeNull();
  });
});
