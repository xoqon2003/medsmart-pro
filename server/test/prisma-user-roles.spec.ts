/**
 * PR-05 — UserRole enum extension compile-time check.
 *
 * The DB migration only calls ALTER TYPE "UserRole" ADD VALUE ... Four times.
 * The post-migration client must expose the new values as string literals.
 *
 * This is a TypeScript compile-time assertion (no DB required) — if the
 * Prisma client regeneration forgot one of the new enum values, `tsc` on
 * this file will fail. That is the intent.
 */

import { UserRole } from '@prisma/client';

describe('PR-05 — UserRole enum values', () => {
  it('exposes the four new roles on the generated client', () => {
    // Access each value — TS errors here if the enum is missing them.
    const student: UserRole = 'STUDENT';
    const nurse: UserRole = 'NURSE';
    const editor: UserRole = 'EDITOR';
    const medicalEditor: UserRole = 'MEDICAL_EDITOR';

    expect([student, nurse, editor, medicalEditor]).toEqual([
      'STUDENT',
      'NURSE',
      'EDITOR',
      'MEDICAL_EDITOR',
    ]);
  });

  it('keeps the original roles intact', () => {
    const roles: UserRole[] = ['PATIENT', 'RADIOLOG', 'DOCTOR', 'SPECIALIST', 'OPERATOR', 'ADMIN', 'KASSIR'];
    expect(roles).toHaveLength(7);
  });
});
