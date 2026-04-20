-- Migration: add_disease_core
-- PR: PR-02
-- Reference: docs/analysis/implementation-plan.md#pr-02-prisma-schema-disease-core-models-fts-ready
-- Scope: Disease, Symptom, DiseaseSymptom, Reference, DiseaseReference + 7 KB enums.

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EvidenceLevel" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "ContentLevel" AS ENUM ('L1', 'L2', 'L3');

-- CreateEnum
CREATE TYPE "AudienceMode" AS ENUM ('PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST', 'MIXED');

-- CreateEnum
CREATE TYPE "DiseaseSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE');

-- CreateEnum
CREATE TYPE "SymptomSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('DOI', 'PUBMED', 'URL', 'WHO', 'PROTOCOL', 'BOOK', 'LOCAL_PROTOCOL');

-- CreateTable
CREATE TABLE "Disease" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icd10" TEXT NOT NULL,
    "icd11" TEXT,
    "nameUz" TEXT NOT NULL,
    "nameRu" TEXT,
    "nameEn" TEXT,
    "nameLat" TEXT,
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT NOT NULL,
    "audienceLevels" "AudienceMode"[] DEFAULT ARRAY[]::"AudienceMode"[],
    "severityLevels" "DiseaseSeverity"[] DEFAULT ARRAY[]::"DiseaseSeverity"[],
    "protocolSources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "editorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symptom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameUz" TEXT NOT NULL,
    "nameRu" TEXT,
    "nameEn" TEXT,
    "nameLat" TEXT,
    "category" TEXT NOT NULL,
    "bodyZone" TEXT,
    "severity" "SymptomSeverity" NOT NULL DEFAULT 'MILD',
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isRedFlag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseSymptom" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "symptomId" TEXT NOT NULL,
    "weight" DECIMAL(5,3) NOT NULL DEFAULT 1.000,
    "specificity" DECIMAL(5,3),
    "sensitivity" DECIMAL(5,3),
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isExcluding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseSymptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "type" "ReferenceType" NOT NULL,
    "citation" TEXT NOT NULL,
    "url" TEXT,
    "doi" TEXT,
    "pubmedId" TEXT,
    "whoCode" TEXT,
    "publishedAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidenceLevel" "EvidenceLevel" NOT NULL DEFAULT 'C',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseReference" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "blockMarker" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Disease_slug_key" ON "Disease"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Disease_icd10_key" ON "Disease"("icd10");

-- CreateIndex
CREATE INDEX "Disease_category_idx" ON "Disease"("category");

-- CreateIndex
CREATE INDEX "Disease_updatedAt_idx" ON "Disease"("updatedAt");

-- CreateIndex
CREATE INDEX "Disease_status_idx" ON "Disease"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Symptom_code_key" ON "Symptom"("code");

-- CreateIndex
CREATE INDEX "Symptom_category_idx" ON "Symptom"("category");

-- CreateIndex
CREATE INDEX "Symptom_bodyZone_idx" ON "Symptom"("bodyZone");

-- CreateIndex
CREATE INDEX "DiseaseSymptom_diseaseId_idx" ON "DiseaseSymptom"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseSymptom_symptomId_idx" ON "DiseaseSymptom"("symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseSymptom_diseaseId_symptomId_key" ON "DiseaseSymptom"("diseaseId", "symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_doi_key" ON "Reference"("doi");

-- CreateIndex
CREATE INDEX "Reference_type_idx" ON "Reference"("type");

-- CreateIndex
CREATE INDEX "Reference_pubmedId_idx" ON "Reference"("pubmedId");

-- CreateIndex
CREATE INDEX "DiseaseReference_diseaseId_idx" ON "DiseaseReference"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseReference_referenceId_idx" ON "DiseaseReference"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseReference_diseaseId_referenceId_blockMarker_key" ON "DiseaseReference"("diseaseId", "referenceId", "blockMarker");

-- AddForeignKey
ALTER TABLE "DiseaseSymptom" ADD CONSTRAINT "DiseaseSymptom_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSymptom" ADD CONSTRAINT "DiseaseSymptom_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseReference" ADD CONSTRAINT "DiseaseReference_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseReference" ADD CONSTRAINT "DiseaseReference_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
