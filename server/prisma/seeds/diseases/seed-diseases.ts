/**
 * Disease KB — seed orchestrator
 *
 * Bu skript `fixtures.ts` dan 5 ta to'liq kasallik va 20 stub kasallikni
 * DB ga upsert qiladi. Idempotent: bir necha marta ishlatilsa xato bermaydi.
 *
 * Ishlatish:
 *   pnpm --dir server db:seed:diseases
 *   yoki
 *   cd server && npx ts-node prisma/seeds/diseases/seed-diseases.ts
 *
 * DIQQAT: Bu skript va `scripts/seed-diseases.ts` ni birgalikda ishlatmang —
 * icd10 unique constraint ziddiyatlari yuzaga keladi (masalan, I10).
 */

import {
  PrismaClient,
  ApprovalStatus,
  EvidenceLevel,
  ContentLevel,
  AudienceMode,
  SymptomSeverity,
  TranslationStatus,
} from '@prisma/client';
import {
  migren, gipertoniya, gastrit, pnevmoniya, bexterev,
  diabet2, bronxialAstma, depressiya, gipotiroidizm,
  revmatoidArtrit, insult, buyrakToshlari, yurakEtishmovchiligi,
  stubs,
} from './fixtures';
import type { DiseaseFixture, StubFixture } from './fixtures';

const prisma = new PrismaClient();

// ── Evidence level converter ───────────────────────────────────────────────────

const toEvidenceLevel: Record<'A' | 'B' | 'C', EvidenceLevel> = {
  A: EvidenceLevel.A,
  B: EvidenceLevel.B,
  C: EvidenceLevel.C,
};

const toContentLevel: Record<'L1' | 'L2' | 'L3', ContentLevel> = {
  L1: ContentLevel.L1,
  L2: ContentLevel.L2,
  L3: ContentLevel.L3,
};

// ── To'liq kasallik (bloklar + simptomlar bilan) ──────────────────────────────

async function seedFullDisease(fixture: DiseaseFixture): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1 ── Disease upsert ─────────────────────────────────────────────────────
    const disease = await tx.disease.upsert({
      where: { slug: fixture.slug },
      update: {
        nameUz: fixture.nameUz,
        nameRu: fixture.nameRu ?? null,
        nameEn: fixture.nameEn ?? null,
        nameLat: fixture.nameLat ?? null,
        synonyms: fixture.synonyms,
        protocolSources: fixture.protocolSources,
        // Agar mavjud bo'lsa statusni o'zgartirmaymiz — faqat metani yangilaymiz
      },
      create: {
        slug: fixture.slug,
        icd10: fixture.icd10,
        nameUz: fixture.nameUz,
        nameRu: fixture.nameRu ?? null,
        nameEn: fixture.nameEn ?? null,
        nameLat: fixture.nameLat ?? null,
        synonyms: fixture.synonyms,
        category: fixture.category,
        audienceLevels: [AudienceMode.PATIENT, AudienceMode.STUDENT],
        severityLevels: [],
        protocolSources: fixture.protocolSources,
        status: ApprovalStatus.PUBLISHED,
      },
    });

    // 2 ── DiseaseBlock upsert ────────────────────────────────────────────────
    for (const block of fixture.blocks) {
      await tx.diseaseBlock.upsert({
        where: {
          diseaseId_marker: {
            diseaseId: disease.id,
            marker: block.marker,
          },
        },
        update: {
          label: block.label,
          contentMd: block.contentMd,
          evidenceLevel: toEvidenceLevel[block.evidenceLevel],
          level: toContentLevel[block.level],
          orderIndex: block.orderIndex,
        },
        create: {
          diseaseId: disease.id,
          marker: block.marker,
          label: block.label,
          level: toContentLevel[block.level],
          orderIndex: block.orderIndex,
          contentMd: block.contentMd,
          evidenceLevel: toEvidenceLevel[block.evidenceLevel],
          status: ApprovalStatus.PUBLISHED,
          publishedAt: new Date(),
          translationStatusUz: TranslationStatus.VERIFIED,
          translationStatusRu: TranslationStatus.PENDING,
          translationStatusEn: TranslationStatus.PENDING,
          audiencePriority: { patient: 1, student: 2 },
        },
      });
    }

    // 3 ── Symptom + DiseaseSymptom upsert ───────────────────────────────────
    for (const sym of fixture.symptoms) {
      const symptom = await tx.symptom.upsert({
        where: { code: sym.code },
        update: {
          nameUz: sym.nameUz,
          isRedFlag: sym.isRedFlag,
          category: sym.category,
          bodyZone: sym.bodyZone ?? null,
        },
        create: {
          code: sym.code,
          nameUz: sym.nameUz,
          category: sym.category,
          bodyZone: sym.bodyZone ?? null,
          isRedFlag: sym.isRedFlag,
          severity: sym.isRedFlag
            ? SymptomSeverity.SEVERE
            : SymptomSeverity.MILD,
        },
      });

      await tx.diseaseSymptom.upsert({
        where: {
          diseaseId_symptomId: {
            diseaseId: disease.id,
            symptomId: symptom.id,
          },
        },
        update: {
          weight: sym.weight,
          isRequired: sym.isRequired,
          isExcluding: sym.isExcluding,
        },
        create: {
          diseaseId: disease.id,
          symptomId: symptom.id,
          weight: sym.weight,
          isRequired: sym.isRequired,
          isExcluding: sym.isExcluding,
        },
      });
    }
  });

  process.stdout.write(
    `  [full]  ${fixture.icd10.padEnd(8)} ${fixture.nameUz.padEnd(30)} ` +
      `${fixture.blocks.length} blok, ${fixture.symptoms.length} simptom\n`,
  );
}

// ── Stub kasallik (faqat metadata) ────────────────────────────────────────────

async function seedStub(stub: StubFixture): Promise<void> {
  await prisma.disease.upsert({
    where: { slug: stub.slug },
    update: {
      nameUz: stub.nameUz,
      nameRu: stub.nameRu ?? null,
    },
    create: {
      slug: stub.slug,
      icd10: stub.icd10,
      nameUz: stub.nameUz,
      nameRu: stub.nameRu ?? null,
      category: stub.category,
      audienceLevels: [],
      severityLevels: [],
      synonyms: [],
      protocolSources: [],
      status: ApprovalStatus.PUBLISHED,
    },
  });

  process.stdout.write(
    `  [stub]  ${stub.icd10.padEnd(8)} ${stub.nameUz}\n`,
  );
}

// ── Asosiy funksiya ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('━━━ Disease KB seed ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const fullDiseases: DiseaseFixture[] = [
    migren,
    gipertoniya,
    gastrit,
    pnevmoniya,
    bexterev,
    diabet2,
    bronxialAstma,
    depressiya,
    gipotiroidizm,
    revmatoidArtrit,
    insult,
    buyrakToshlari,
    yurakEtishmovchiligi,
  ];

  // ── To'liq kasalliklar ──
  console.log(`To'liq kasalliklar (bloklar + simptomlar): ${fullDiseases.length} ta`);
  for (const fixture of fullDiseases) {
    await seedFullDisease(fixture);
  }

  // ── Stub kasalliklar ──
  console.log(`\nStub kasalliklar (metadata only): ${stubs.length} ta`);
  for (const stub of stubs) {
    await seedStub(stub);
  }

  const totalSymptoms = fullDiseases.reduce((acc, d) => acc + d.symptoms.length, 0);
  const totalBlocks = fullDiseases.reduce((acc, d) => acc + d.blocks.length, 0);

  console.log('\n━━━ Natija ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  To'liq kasalliklar : ${fullDiseases.length}`);
  console.log(`  Stub kasalliklar   : ${stubs.length}`);
  console.log(`  Jami kasalliklar   : ${fullDiseases.length + stubs.length}`);
  console.log(`  Jami bloklar       : ${totalBlocks}`);
  console.log(`  Jami simptomlar    : ${totalSymptoms}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e: unknown) => {
    console.error('Seed xatosi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
