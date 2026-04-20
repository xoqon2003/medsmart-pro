import { BadRequestException, ForbiddenException } from '@nestjs/common';

/**
 * KB blok moderatsiyasi state-machine.
 *
 * Statuslar (Prisma `ApprovalStatus`):
 *   DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED
 *                ↘ REJECTED ↗
 *
 * Transitsiyalar matritsasi ikki o'lchovli:
 *   - currentStatus (state)
 *   - action (submit-review | approve | reject | publish | archive)
 *   har action uchun talab qilingan rollar.
 */

export type KbStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export type KbAction =
  | 'submit-review'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'archive';

interface Transition {
  from: KbStatus[];
  to: KbStatus;
  roles: string[];
}

const TRANSITIONS: Record<KbAction, Transition> = {
  'submit-review': {
    from: ['DRAFT', 'REJECTED'],
    to: 'REVIEW',
    roles: ['EDITOR', 'MEDICAL_EDITOR', 'ADMIN'],
  },
  approve: {
    from: ['REVIEW'],
    to: 'APPROVED',
    roles: ['MEDICAL_EDITOR', 'ADMIN'],
  },
  reject: {
    from: ['REVIEW'],
    to: 'REJECTED',
    roles: ['MEDICAL_EDITOR', 'ADMIN'],
  },
  publish: {
    from: ['APPROVED'],
    to: 'PUBLISHED',
    roles: ['ADMIN'],
  },
  archive: {
    from: ['PUBLISHED', 'APPROVED', 'REJECTED'],
    to: 'ARCHIVED',
    roles: ['ADMIN'],
  },
};

/**
 * Pure funksiya: joriy statusdan action yordamida keyingi statusni hisoblaydi.
 * Noto'g'ri kombinatsiya — `BadRequestException`, rol noto'g'ri — `ForbiddenException`.
 */
export function nextStatus(
  current: KbStatus,
  action: KbAction,
  role: string,
): KbStatus {
  const t = TRANSITIONS[action];
  if (!t) {
    throw new BadRequestException(`Noma'lum action: ${action}`);
  }
  if (!t.roles.includes(role)) {
    throw new ForbiddenException(
      `${action} uchun ${t.roles.join(' yoki ')} roli kerak`,
    );
  }
  if (!t.from.includes(current)) {
    throw new BadRequestException(
      `${current} holatidan ${action} bajarib bo'lmaydi (faqat ${t.from.join(', ')})`,
    );
  }
  return t.to;
}

/**
 * Ichki foydalanish uchun — jadvalni boshqa qatlamlarga ochib berish.
 */
export function getTransitions(): Record<KbAction, Transition> {
  return TRANSITIONS;
}
