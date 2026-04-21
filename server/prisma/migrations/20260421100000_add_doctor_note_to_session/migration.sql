-- Migration: add doctorNote + doctorRespondedAt to SymptomMatchSession
-- Allows a doctor to write a recommendation note when confirming/rejecting a triage case.

ALTER TABLE "SymptomMatchSession"
  ADD COLUMN "doctorNote"          TEXT,
  ADD COLUMN "doctorRespondedAt"   TIMESTAMP(3);
