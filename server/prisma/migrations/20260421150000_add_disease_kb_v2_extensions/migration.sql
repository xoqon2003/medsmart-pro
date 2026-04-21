-- Migration: add_disease_kb_v2_extensions
-- PR: PR-14
-- Reference: docs/09-modules/TT-DISEASE-KB-MODULE-v2.md#62-data-model-extensions
-- Scope: DiseaseScientist, DiseaseResearch, DiseaseGenetic (v2 metadata tables)
--        + ScientistRole, ResearchType, InheritancePattern, BloodGroup enums.

-- CreateEnum
CREATE TYPE "ScientistRole" AS ENUM ('DISCOVERER', 'CLASSIFIER', 'CONTRIBUTOR', 'RESEARCHER', 'EDITOR');

-- CreateEnum
CREATE TYPE "ResearchType" AS ENUM ('RCT', 'META_ANALYSIS', 'SYSTEMATIC_REVIEW', 'COHORT', 'CASE_CONTROL', 'CASE_SERIES', 'CASE_REPORT', 'GUIDELINE');

-- CreateEnum
CREATE TYPE "InheritancePattern" AS ENUM ('AUTOSOMAL_DOMINANT', 'AUTOSOMAL_RECESSIVE', 'X_LINKED_DOMINANT', 'X_LINKED_RECESSIVE', 'MITOCHONDRIAL', 'COMPLEX', 'SPORADIC');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- CreateTable
CREATE TABLE "DiseaseScientist" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "ScientistRole" NOT NULL,
    "country" TEXT,
    "birthYear" INTEGER,
    "deathYear" INTEGER,
    "bioMd" TEXT,
    "contributionsMd" TEXT,
    "photoUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiseaseScientist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseResearch" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "journal" TEXT,
    "year" INTEGER NOT NULL,
    "doi" TEXT,
    "pubmedId" TEXT,
    "nctId" TEXT,
    "type" "ResearchType" NOT NULL,
    "summaryMd" TEXT NOT NULL,
    "evidenceLevel" "EvidenceLevel" NOT NULL DEFAULT 'C',
    "isLandmark" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiseaseResearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseGenetic" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "geneSymbol" TEXT,
    "variantType" TEXT,
    "inheritancePattern" "InheritancePattern",
    "penetrance" DECIMAL(4,3),
    "bloodGroupRisk" "BloodGroup",
    "populationNoteMd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiseaseGenetic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiseaseScientist_diseaseId_idx" ON "DiseaseScientist"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseScientist_role_idx" ON "DiseaseScientist"("role");

-- CreateIndex
CREATE INDEX "DiseaseResearch_diseaseId_idx" ON "DiseaseResearch"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseResearch_year_idx" ON "DiseaseResearch"("year");

-- CreateIndex
CREATE INDEX "DiseaseResearch_type_idx" ON "DiseaseResearch"("type");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseResearch_diseaseId_doi_key" ON "DiseaseResearch"("diseaseId", "doi");

-- CreateIndex
CREATE INDEX "DiseaseGenetic_diseaseId_idx" ON "DiseaseGenetic"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseGenetic_geneSymbol_idx" ON "DiseaseGenetic"("geneSymbol");

-- AddForeignKey
ALTER TABLE "DiseaseScientist" ADD CONSTRAINT "DiseaseScientist_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseResearch" ADD CONSTRAINT "DiseaseResearch_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseGenetic" ADD CONSTRAINT "DiseaseGenetic_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
