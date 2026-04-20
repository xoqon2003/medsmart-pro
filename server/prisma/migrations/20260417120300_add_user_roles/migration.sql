-- Migration: add_user_roles
-- PR: PR-05
-- Reference: docs/analysis/implementation-plan.md#pr-05-userrole-enum-new-roles-student-nurse-editor-medical_editor
-- Scope: Extend "UserRole" enum with STUDENT, NURSE, EDITOR, MEDICAL_EDITOR.
-- IMPORTANT: Postgres requires ALTER TYPE ... ADD VALUE to run OUTSIDE a transaction
-- if the new value is used in the same transaction. This migration only adds values;
-- no subsequent statements reference them, so Prisma's wrapping transaction is fine.
-- Rollback: Postgres has no DROP VALUE. This migration is considered irreversible.

ALTER TYPE "UserRole" ADD VALUE 'STUDENT';
ALTER TYPE "UserRole" ADD VALUE 'NURSE';
ALTER TYPE "UserRole" ADD VALUE 'EDITOR';
ALTER TYPE "UserRole" ADD VALUE 'MEDICAL_EDITOR';
