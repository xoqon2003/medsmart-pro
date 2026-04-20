-- Migration: add_disease_content
-- PR: PR-03
-- Reference: docs/analysis/implementation-plan.md#pr-03-prisma-schema-blocks-stages-meds-labtests-cases
-- Scope: DiseaseBlock, DiseaseStage, DiseaseMedication, DiseaseLabTest (dictionary ref, not FK to LabTest),
--        ClinicalCase + 4 enums. Extend existing Medicine (rxnormCode, innName) and LabTest (loincCode).

-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('EARLY', 'EXPANDED', 'LATE');

-- CreateEnum
CREATE TYPE "MedicationVisibility" AS ENUM ('PATIENT', 'STUDENT', 'DOCTOR');

-- CreateEnum
CREATE TYPE "LabTestPriority" AS ENUM ('MINIMUM', 'EXTENDED');

-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('AUTO', 'REVIEWED', 'VERIFIED', 'PENDING');

-- AlterTable (Medicine) — add RxNorm + INN nullable columns
ALTER TABLE "Medicine" ADD COLUMN "rxnormCode" TEXT;
ALTER TABLE "Medicine" ADD COLUMN "innName" TEXT;

-- AlterTable (LabTest) — add LOINC nullable column
ALTER TABLE "LabTest" ADD COLUMN "loincCode" TEXT;

-- CreateTable
CREATE TABLE "DiseaseBlock" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "marker" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "level" "ContentLevel" NOT NULL DEFAULT 'L1',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "audiencePriority" JSONB,
    "contentMd" TEXT NOT NULL,
    "contentJson" JSONB,
    "translationStatusUz" "TranslationStatus" NOT NULL DEFAULT 'VERIFIED',
    "translationStatusRu" "TranslationStatus" NOT NULL DEFAULT 'PENDING',
    "translationStatusEn" "TranslationStatus" NOT NULL DEFAULT 'PENDING',
    "evidenceLevel" "EvidenceLevel" NOT NULL DEFAULT 'C',
    "status" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "lastEditedBy" INTEGER,
    "lastEditedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiseaseBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseStage" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "stageType" "StageType" NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "titleUz" TEXT NOT NULL,
    "descriptionMd" TEXT NOT NULL,
    "imageKey" TEXT,
    "clinicalSigns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiseaseStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseMedication" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "averageDose" TEXT NOT NULL,
    "dosageNotes" TEXT,
    "contraindications" TEXT,
    "interactions" JSONB,
    "evidenceLevel" "EvidenceLevel" NOT NULL DEFAULT 'C',
    "audienceVisibility" "MedicationVisibility" NOT NULL DEFAULT 'DOCTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiseaseMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable (dictionary ref — NOT FK to per-patient LabTest; see schema comment)
CREATE TABLE "DiseaseLabTest" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "labTestCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "loincCode" TEXT,
    "priority" "LabTestPriority" NOT NULL DEFAULT 'MINIMUM',
    "fastingRequired" BOOLEAN NOT NULL DEFAULT false,
    "timingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiseaseLabTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalCase" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "anamnesisMd" TEXT NOT NULL,
    "diagnosisResultMd" TEXT NOT NULL,
    "treatmentMd" TEXT NOT NULL,
    "outcomeMd" TEXT NOT NULL,
    "publishedBy" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "consentObtained" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiseaseBlock_diseaseId_idx" ON "DiseaseBlock"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseBlock_marker_idx" ON "DiseaseBlock"("marker");

-- CreateIndex
CREATE INDEX "DiseaseBlock_status_idx" ON "DiseaseBlock"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseBlock_diseaseId_marker_key" ON "DiseaseBlock"("diseaseId", "marker");

-- CreateIndex
CREATE INDEX "DiseaseStage_diseaseId_idx" ON "DiseaseStage"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseStage_stageType_idx" ON "DiseaseStage"("stageType");

-- CreateIndex
CREATE INDEX "DiseaseMedication_diseaseId_idx" ON "DiseaseMedication"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseMedication_medicineId_idx" ON "DiseaseMedication"("medicineId");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseMedication_diseaseId_medicineId_group_key" ON "DiseaseMedication"("diseaseId", "medicineId", "group");

-- CreateIndex
CREATE INDEX "DiseaseLabTest_diseaseId_idx" ON "DiseaseLabTest"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseLabTest_labTestCode_idx" ON "DiseaseLabTest"("labTestCode");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseLabTest_diseaseId_labTestCode_key" ON "DiseaseLabTest"("diseaseId", "labTestCode");

-- CreateIndex
CREATE INDEX "ClinicalCase_diseaseId_idx" ON "ClinicalCase"("diseaseId");

-- CreateIndex
CREATE INDEX "ClinicalCase_publishedBy_idx" ON "ClinicalCase"("publishedBy");

-- AddForeignKey
ALTER TABLE "DiseaseBlock" ADD CONSTRAINT "DiseaseBlock_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseStage" ADD CONSTRAINT "DiseaseStage_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseMedication" ADD CONSTRAINT "DiseaseMedication_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseMedication" ADD CONSTRAINT "DiseaseMedication_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseLabTest" ADD CONSTRAINT "DiseaseLabTest_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalCase" ADD CONSTRAINT "ClinicalCase_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalCase" ADD CONSTRAINT "ClinicalCase_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
