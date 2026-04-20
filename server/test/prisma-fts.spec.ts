/**
 * PR-06 — Postgres FTS smoke test.
 *
 * Seeds 3 diseases, runs a to_tsquery search via $queryRaw, and asserts
 * at least one match. Requires pg_trgm + unaccent extensions (created in
 * migration 20260417120400_add_fts_indexes). Skipped locally without DB.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/config/prisma.service';

interface DiseaseRow {
  id: string;
  slug: string;
  nameUz: string;
  rank: number;
}

describe('PR-06 — FTS search (Prisma smoke)', () => {
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
    await prisma.disease.deleteMany({});
  });

  it('finds a Disease via tsvector @@ to_tsquery', async () => {
    await prisma.disease.createMany({
      data: [
        {
          slug: 'gipertoniya-i10',
          icd10: 'I10',
          nameUz: 'Gipertoniya',
          nameRu: 'Гипертония',
          category: 'cardiology',
          synonyms: ['yuqori qon bosim'],
        },
        {
          slug: 'migren-g43',
          icd10: 'G43',
          nameUz: 'Migren',
          category: 'neurology',
          synonyms: ['bosh ogrigi'],
        },
        {
          slug: 'astma-j45',
          icd10: 'J45',
          nameUz: 'Astma',
          category: 'pulmonology',
          synonyms: [],
        },
      ],
    });

    const hits = await prisma.$queryRaw<DiseaseRow[]>`
      SELECT
        "id",
        "slug",
        "nameUz",
        ts_rank("searchVector", to_tsquery('simple', 'gipert:*')) AS rank
      FROM "Disease"
      WHERE "searchVector" @@ to_tsquery('simple', 'gipert:*')
      ORDER BY rank DESC;
    `;

    expect(hits.length).toBeGreaterThanOrEqual(1);
    expect(hits[0].slug).toBe('gipertoniya-i10');
  });

  it('trigram similarity finds near-matches on misspelled queries', async () => {
    await prisma.disease.create({
      data: { slug: 'migren-g43b', icd10: 'G43.1', nameUz: 'Migren', category: 'neurology' },
    });

    const hits = await prisma.$queryRaw<DiseaseRow[]>`
      SELECT "id", "slug", "nameUz", similarity("nameUz", 'migran') AS rank
      FROM "Disease"
      WHERE "nameUz" % 'migran'
      ORDER BY rank DESC;
    `;

    expect(hits.length).toBeGreaterThanOrEqual(1);
  });
});
