-- Migration: add_disease_operations
-- PR: PR-04
-- Reference: docs/analysis/implementation-plan.md#pr-04-prisma-schema-operational-models-notes-sessions-audit
-- Scope: UserDiseaseNote, AITriageSession (new — not present in schema),
--        SymptomMatchSession, DiseaseEditLog, RegionEpidemiology, DiseaseSpecialty M2M
--        + SymptomAnswer, MatchSessionStatus, EditLogType enums.

-- CreateEnum
CREATE TYPE "SymptomAnswer" AS ENUM ('YES', 'NO', 'UNKNOWN', 'SOMETIMES');

-- CreateEnum
CREATE TYPE "MatchSessionStatus" AS ENUM ('ACTIVE', 'SENT_TO_DOCTOR', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EditLogType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE');

-- CreateTable
CREATE TABLE "UserDiseaseNote" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "noteMd" TEXT,
    "symptomAnswers" JSONB,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDiseaseNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AITriageSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "anonymousId" TEXT,
    "symptoms" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AITriageSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomMatchSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "anonymousId" TEXT,
    "aiTriageSessionId" TEXT,
    "diseaseId" TEXT NOT NULL,
    "matchScore" DECIMAL(5,3) NOT NULL DEFAULT 0.000,
    "matchedSymptoms" JSONB NOT NULL,
    "missingSymptoms" JSONB NOT NULL,
    "userAnswers" JSONB NOT NULL,
    "status" "MatchSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "sentToDoctorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SymptomMatchSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseEditLog" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "blockId" TEXT,
    "editorId" INTEGER NOT NULL,
    "editType" "EditLogType" NOT NULL,
    "diffJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseEditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionEpidemiology" (
    "id" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "prevalence" DECIMAL(10,6),
    "incidence" DECIMAL(10,6),
    "mortality" DECIMAL(10,6),
    "sourceRefId" TEXT,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegionEpidemiology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseSpecialty" (
    "id" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "diseaseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseaseSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserDiseaseNote_userId_idx" ON "UserDiseaseNote"("userId");

-- CreateIndex
CREATE INDEX "UserDiseaseNote_diseaseId_idx" ON "UserDiseaseNote"("diseaseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDiseaseNote_userId_diseaseId_key" ON "UserDiseaseNote"("userId", "diseaseId");

-- CreateIndex
CREATE INDEX "AITriageSession_userId_idx" ON "AITriageSession"("userId");

-- CreateIndex
CREATE INDEX "AITriageSession_anonymousId_idx" ON "AITriageSession"("anonymousId");

-- CreateIndex
CREATE INDEX "AITriageSession_expiresAt_idx" ON "AITriageSession"("expiresAt");

-- CreateIndex
CREATE INDEX "SymptomMatchSession_userId_idx" ON "SymptomMatchSession"("userId");

-- CreateIndex
CREATE INDEX "SymptomMatchSession_diseaseId_idx" ON "SymptomMatchSession"("diseaseId");

-- CreateIndex
CREATE INDEX "SymptomMatchSession_status_idx" ON "SymptomMatchSession"("status");

-- CreateIndex
CREATE INDEX "SymptomMatchSession_expiresAt_idx" ON "SymptomMatchSession"("expiresAt");

-- CreateIndex
CREATE INDEX "DiseaseEditLog_diseaseId_idx" ON "DiseaseEditLog"("diseaseId");

-- CreateIndex
CREATE INDEX "DiseaseEditLog_blockId_idx" ON "DiseaseEditLog"("blockId");

-- CreateIndex
CREATE INDEX "DiseaseEditLog_editorId_idx" ON "DiseaseEditLog"("editorId");

-- CreateIndex
CREATE INDEX "DiseaseEditLog_createdAt_idx" ON "DiseaseEditLog"("createdAt");

-- CreateIndex
CREATE INDEX "RegionEpidemiology_diseaseId_idx" ON "RegionEpidemiology"("diseaseId");

-- CreateIndex
CREATE INDEX "RegionEpidemiology_region_idx" ON "RegionEpidemiology"("region");

-- CreateIndex
CREATE UNIQUE INDEX "RegionEpidemiology_diseaseId_region_period_key" ON "RegionEpidemiology"("diseaseId", "region", "period");

-- CreateIndex
CREATE INDEX "DiseaseSpecialty_doctorProfileId_idx" ON "DiseaseSpecialty"("doctorProfileId");

-- CreateIndex
CREATE INDEX "DiseaseSpecialty_diseaseId_idx" ON "DiseaseSpecialty"("diseaseId");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseSpecialty_doctorProfileId_diseaseId_key" ON "DiseaseSpecialty"("doctorProfileId", "diseaseId");

-- AddForeignKey
ALTER TABLE "UserDiseaseNote" ADD CONSTRAINT "UserDiseaseNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDiseaseNote" ADD CONSTRAINT "UserDiseaseNote_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITriageSession" ADD CONSTRAINT "AITriageSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomMatchSession" ADD CONSTRAINT "SymptomMatchSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomMatchSession" ADD CONSTRAINT "SymptomMatchSession_sentToDoctorId_fkey" FOREIGN KEY ("sentToDoctorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomMatchSession" ADD CONSTRAINT "SymptomMatchSession_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomMatchSession" ADD CONSTRAINT "SymptomMatchSession_aiTriageSessionId_fkey" FOREIGN KEY ("aiTriageSessionId") REFERENCES "AITriageSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseEditLog" ADD CONSTRAINT "DiseaseEditLog_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseEditLog" ADD CONSTRAINT "DiseaseEditLog_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "DiseaseBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseEditLog" ADD CONSTRAINT "DiseaseEditLog_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionEpidemiology" ADD CONSTRAINT "RegionEpidemiology_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionEpidemiology" ADD CONSTRAINT "RegionEpidemiology_sourceRefId_fkey" FOREIGN KEY ("sourceRefId") REFERENCES "Reference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSpecialty" ADD CONSTRAINT "DiseaseSpecialty_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseaseSpecialty" ADD CONSTRAINT "DiseaseSpecialty_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
