-- Migration: add_triage_and_clinical_tools
-- PR: GAP-04c + GAP-05c + GAP-05d (consolidated before first ship)
-- Reference: docs/analysis/tz-clinical-tools-expansion.md §4 (architecture)
-- Scope:
--   * Red-flag rule catalogue (GAP-04c) — persists the FE rule engine.
--   * Red-flag audit log (GAP-04c) — immutable event trail on every fire.
--   * Universal ClinicalTool catalogue (GAP-05d) — replaces the initial
--     narrow ClinicalCalculator idea with a 5-toolType model (SCORE /
--     QUESTIONNAIRE / CRITERIA / DOSE / STAGING) plus 4-layer admin
--     gating: isActive, allowedAudiences, requiredRoles, clinicOverridesJson.
--   * Clinical tool usage log (GAP-05d) — adoption analytics without PHI.
--
-- Consolidation note:
--   An earlier draft of this feature shipped as two migrations
--   (add_triage_catalogue + refactor_calculator_to_clinical_tool).
--   Neither was deployed anywhere. We squashed pre-ship so fresh DBs
--   don't create-then-drop the intermediate ClinicalCalculator table,
--   and to keep migration history readable. Post-ship migrations will
--   follow the strict one-per-change rule (CLAUDE.md §Loyiha qoidalari.2).
--
-- Design notes:
--   * conditionJson / inputsJson / outputSchemaJson mirror FE shapes
--     exactly. The server is source-of-truth for DATA; the client stays
--     source-of-truth for COMPUTE (`formulaKey` names a whitelisted
--     function — no arbitrary code in the DB).
--   * Scope fields (applicableCategories, applicableIcd10Prefixes) use
--     AND semantics when set; unset field = open; both unset = GLOBAL.
--   * RedFlagEvent → RedFlagRule uses ON DELETE RESTRICT so audit rows
--     survive a catalogue cleanup (rules must be deactivated, not deleted).
--   * ClinicalToolUsageLog → ClinicalTool uses ON DELETE CASCADE because
--     the log is adoption analytics, not a clinical audit trail.
--   * DOSE toolType requires requiredRoles ⊇ {DOCTOR|SPECIALIST|NURSE} —
--     enforced at the service layer, not here, because the constraint is
--     a business rule that may relax for specific tools in future.

-- ── Enums ──────────────────────────────────────────────────────────────
CREATE TYPE "EmergencySeverity" AS ENUM ('CRITICAL', 'HIGH', 'MODERATE');
CREATE TYPE "CalculatorInputType" AS ENUM ('NUMBER', 'BOOLEAN', 'SELECT');
CREATE TYPE "ClinicalToolType" AS ENUM ('SCORE', 'QUESTIONNAIRE', 'CRITERIA', 'DOSE', 'STAGING');

-- ── Tables: red-flag catalogue ─────────────────────────────────────────
CREATE TABLE "RedFlagRule" (
    "id" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "severity" "EmergencySeverity" NOT NULL,
    "applicableCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableIcd10Prefixes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conditionJson" JSONB NOT NULL,
    "sourceCitation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedFlagRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RedFlagEvent" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "matchSessionId" TEXT,
    "triggeredBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "severityAtFire" "EmergencySeverity" NOT NULL,
    "shownToUser" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedFlagEvent_pkey" PRIMARY KEY ("id")
);

-- ── Tables: universal clinical tools ───────────────────────────────────
CREATE TABLE "ClinicalTool" (
    "id" TEXT NOT NULL,
    "toolKey" TEXT NOT NULL,
    "toolType" "ClinicalToolType" NOT NULL,
    "nameKey" TEXT NOT NULL,
    "descriptionKey" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "evidenceLevel" "EvidenceLevel" NOT NULL DEFAULT 'C',
    "formulaKey" TEXT NOT NULL,
    "inputsJson" JSONB NOT NULL,
    "outputSchemaJson" JSONB,
    "showFormulaForAudience" TEXT,
    "applicableCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "applicableIcd10Prefixes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedAudiences" "AudienceMode"[] DEFAULT ARRAY[]::"AudienceMode"[],
    "requiredRoles" "UserRole"[] DEFAULT ARRAY[]::"UserRole"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivationReason" TEXT,
    "deactivatedAt" TIMESTAMP(3),
    "deactivatedBy" INTEGER,
    "clinicOverridesJson" JSONB,
    "regionFitness" TEXT,
    "priorityWeight" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "ClinicalTool_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClinicalToolUsageLog" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "toolType" "ClinicalToolType" NOT NULL,
    "diseaseId" TEXT,
    "matchSessionId" TEXT,
    "clinicId" INTEGER,
    "invokedByRole" "UserRole",
    "band" TEXT,
    "numericValue" DECIMAL(12,3),
    "booleanValue" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalToolUsageLog_pkey" PRIMARY KEY ("id")
);

-- ── Indexes: RedFlagRule ───────────────────────────────────────────────
CREATE UNIQUE INDEX "RedFlagRule_ruleKey_key" ON "RedFlagRule"("ruleKey");
CREATE INDEX "RedFlagRule_severity_idx" ON "RedFlagRule"("severity");
CREATE INDEX "RedFlagRule_isActive_idx" ON "RedFlagRule"("isActive");

-- ── Indexes: RedFlagEvent ──────────────────────────────────────────────
CREATE INDEX "RedFlagEvent_ruleId_idx" ON "RedFlagEvent"("ruleId");
CREATE INDEX "RedFlagEvent_matchSessionId_idx" ON "RedFlagEvent"("matchSessionId");
CREATE INDEX "RedFlagEvent_createdAt_idx" ON "RedFlagEvent"("createdAt");
CREATE INDEX "RedFlagEvent_severityAtFire_idx" ON "RedFlagEvent"("severityAtFire");

-- ── Indexes: ClinicalTool ──────────────────────────────────────────────
CREATE UNIQUE INDEX "ClinicalTool_toolKey_key" ON "ClinicalTool"("toolKey");
CREATE INDEX "ClinicalTool_toolType_idx" ON "ClinicalTool"("toolType");
CREATE INDEX "ClinicalTool_formulaKey_idx" ON "ClinicalTool"("formulaKey");
CREATE INDEX "ClinicalTool_isActive_idx" ON "ClinicalTool"("isActive");
CREATE INDEX "ClinicalTool_priorityWeight_idx" ON "ClinicalTool"("priorityWeight");

-- ── Indexes: ClinicalToolUsageLog ──────────────────────────────────────
CREATE INDEX "ClinicalToolUsageLog_toolId_idx" ON "ClinicalToolUsageLog"("toolId");
CREATE INDEX "ClinicalToolUsageLog_toolType_idx" ON "ClinicalToolUsageLog"("toolType");
CREATE INDEX "ClinicalToolUsageLog_diseaseId_idx" ON "ClinicalToolUsageLog"("diseaseId");
CREATE INDEX "ClinicalToolUsageLog_matchSessionId_idx" ON "ClinicalToolUsageLog"("matchSessionId");
CREATE INDEX "ClinicalToolUsageLog_clinicId_idx" ON "ClinicalToolUsageLog"("clinicId");
CREATE INDEX "ClinicalToolUsageLog_createdAt_idx" ON "ClinicalToolUsageLog"("createdAt");

-- ── Foreign keys ───────────────────────────────────────────────────────
ALTER TABLE "RedFlagEvent" ADD CONSTRAINT "RedFlagEvent_ruleId_fkey"
    FOREIGN KEY ("ruleId") REFERENCES "RedFlagRule"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClinicalToolUsageLog" ADD CONSTRAINT "ClinicalToolUsageLog_toolId_fkey"
    FOREIGN KEY ("toolId") REFERENCES "ClinicalTool"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
