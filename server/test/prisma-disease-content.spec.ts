/**
 * PR-03 — Disease content Prisma smoke test.
 *
 * Verifies DiseaseBlock ordering, cascade delete, and the Medicine/LabTest
 * additive columns (rxnormCode, innName, loincCode) at the generated client level.
 * Hits a real Postgres; skipped locally without DATABASE_URL.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/config/prisma.service';

describe('PR-03 — Disease content (Prisma smoke)', () => {
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
    await prisma.diseaseBlock.deleteMany({});
    await prisma.diseaseStage.deleteMany({});
    await prisma.diseaseMedication.deleteMany({});
    await prisma.diseaseLabTest.deleteMany({});
    await prisma.clinicalCase.deleteMany({});
    await prisma.disease.deleteMany({});
  });

  it('creates a Disease with 3 ordered DiseaseBlocks and returns them in orderIndex', async () => {
    const disease = await prisma.disease.create({
      data: { slug: 'ast-j45', icd10: 'J45', nameUz: 'Astma', category: 'pulmonology' },
    });

    await prisma.diseaseBlock.createMany({
      data: [
        { diseaseId: disease.id, marker: 'clinical_signs', label: 'Belgilar', orderIndex: 1, contentMd: '## Belgilar' },
        { diseaseId: disease.id, marker: 'etiology', label: 'Etiologiya', orderIndex: 0, contentMd: '## Sabablar' },
        { diseaseId: disease.id, marker: 'treatment', label: 'Davolash', orderIndex: 2, contentMd: '## Davolash' },
      ],
    });

    const blocks = await prisma.diseaseBlock.findMany({
      where: { diseaseId: disease.id },
      orderBy: { orderIndex: 'asc' },
    });

    expect(blocks).toHaveLength(3);
    expect(blocks.map((b) => b.marker)).toEqual(['etiology', 'clinical_signs', 'treatment']);
  });

  it('enforces @@unique([diseaseId, marker]) on DiseaseBlock', async () => {
    const disease = await prisma.disease.create({
      data: { slug: 'dup-j45', icd10: 'J45.1', nameUz: 'X', category: 'x' },
    });
    await prisma.diseaseBlock.create({
      data: { diseaseId: disease.id, marker: 'etiology', label: 'E', contentMd: 'x' },
    });

    await expect(
      prisma.diseaseBlock.create({
        data: { diseaseId: disease.id, marker: 'etiology', label: 'Dup', contentMd: 'y' },
      }),
    ).rejects.toThrow();
  });

  it('cascade-deletes blocks and stages when the parent Disease is removed', async () => {
    const disease = await prisma.disease.create({
      data: { slug: 'cd-j46', icd10: 'J46', nameUz: 'X', category: 'x' },
    });
    await prisma.diseaseBlock.create({
      data: { diseaseId: disease.id, marker: 'etiology', label: 'E', contentMd: 'x' },
    });
    await prisma.diseaseStage.create({
      data: { diseaseId: disease.id, stageType: 'EARLY', titleUz: 'Erta', descriptionMd: 'x' },
    });

    await prisma.disease.delete({ where: { id: disease.id } });

    expect(await prisma.diseaseBlock.findMany({ where: { diseaseId: disease.id } })).toHaveLength(0);
    expect(await prisma.diseaseStage.findMany({ where: { diseaseId: disease.id } })).toHaveLength(0);
  });

  it('Medicine accepts rxnormCode / innName and LabTest accepts loincCode', async () => {
    // Pure type/column smoke — create and read back.
    const med = await prisma.medicine.create({
      data: {
        name: 'Ibuprofen',
        category: 'NSAID',
        form: 'TABLET',
        rxnormCode: '5640',
        innName: 'ibuprofen',
      },
    });
    expect(med.rxnormCode).toBe('5640');
    expect(med.innName).toBe('ibuprofen');

    // LabTest requires a LabOrder; just verify the column exists via raw query.
    const columns = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'LabTest' AND column_name = 'loincCode';
    `;
    expect(columns).toHaveLength(1);
  });
});
