/**
 * UserRole konstantalar — `server/prisma/schema.prisma` `enum UserRole` bilan sinxron.
 *
 * Kodda stringlarning o'rniga shu ro'yxatdan foydalanish — tipograf xatolarni oldini oladi
 * (`@Roles(USER_ROLE.EDITOR)` vs `@Roles('EDITOR')`). RolesGuard string qiymatlar bilan
 * ishlaydi, shuning uchun konstantalar `as const` bilan narrow literal tip beradi.
 *
 * PR-05 (20260417120300_add_user_roles) da 4 ta yangi rol qo'shilgan:
 * STUDENT, NURSE, EDITOR, MEDICAL_EDITOR.
 */

export const USER_ROLES = [
  'PATIENT',
  'RADIOLOG',
  'DOCTOR',
  'SPECIALIST',
  'OPERATOR',
  'ADMIN',
  'KASSIR',
  'STUDENT',
  'NURSE',
  'EDITOR',
  'MEDICAL_EDITOR',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE = {
  PATIENT: 'PATIENT',
  RADIOLOG: 'RADIOLOG',
  DOCTOR: 'DOCTOR',
  SPECIALIST: 'SPECIALIST',
  OPERATOR: 'OPERATOR',
  ADMIN: 'ADMIN',
  KASSIR: 'KASSIR',
  STUDENT: 'STUDENT',
  NURSE: 'NURSE',
  EDITOR: 'EDITOR',
  MEDICAL_EDITOR: 'MEDICAL_EDITOR',
} as const satisfies Record<UserRole, UserRole>;

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}
