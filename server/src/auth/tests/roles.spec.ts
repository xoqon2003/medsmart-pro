import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { ROLES_KEY } from '../roles.decorator';
import { USER_ROLE, USER_ROLES, isUserRole } from '../dto/user-role';

function mockContext(user: { role?: string } | null, requiredRoles?: string[]): {
  ctx: ExecutionContext;
  reflector: Reflector;
} {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
  } as unknown as Reflector;

  const ctx = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: () => ({}),
    }),
  } as unknown as ExecutionContext;

  return { ctx, reflector };
}

describe('Auth — USER_ROLES', () => {
  it('11 ta rolni o\'z ichiga oladi (eskilari + 4 ta yangi)', () => {
    expect(USER_ROLES).toHaveLength(11);
    expect(USER_ROLES).toContain('EDITOR');
    expect(USER_ROLES).toContain('MEDICAL_EDITOR');
    expect(USER_ROLES).toContain('STUDENT');
    expect(USER_ROLES).toContain('NURSE');
  });

  it('isUserRole() haqiqiy qiymat uchun true', () => {
    expect(isUserRole('EDITOR')).toBe(true);
    expect(isUserRole('PATIENT')).toBe(true);
  });

  it('isUserRole() noma\'lum qiymat uchun false', () => {
    expect(isUserRole('SUPERUSER')).toBe(false);
    expect(isUserRole('')).toBe(false);
  });
});

describe('RolesGuard — yangi KB rollari', () => {
  it('requiredRoles bo\'lmasa — ruxsat beradi', () => {
    const { ctx, reflector } = mockContext({ role: 'PATIENT' }, undefined);
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('EDITOR roli /kb submit-review endpointga kira oladi', () => {
    const { ctx, reflector } = mockContext(
      { role: USER_ROLE.EDITOR },
      [USER_ROLE.EDITOR, USER_ROLE.MEDICAL_EDITOR, USER_ROLE.ADMIN],
    );
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('PATIENT /kb submit-review endpointga kira olmaydi', () => {
    const { ctx, reflector } = mockContext(
      { role: USER_ROLE.PATIENT },
      [USER_ROLE.EDITOR, USER_ROLE.MEDICAL_EDITOR, USER_ROLE.ADMIN],
    );
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('MEDICAL_EDITOR approve qila oladi', () => {
    const { ctx, reflector } = mockContext(
      { role: USER_ROLE.MEDICAL_EDITOR },
      [USER_ROLE.MEDICAL_EDITOR, USER_ROLE.ADMIN],
    );
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('EDITOR approve qila olmaydi', () => {
    const { ctx, reflector } = mockContext(
      { role: USER_ROLE.EDITOR },
      [USER_ROLE.MEDICAL_EDITOR, USER_ROLE.ADMIN],
    );
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('STUDENT role tokeni mavjud', () => {
    const { ctx, reflector } = mockContext(
      { role: USER_ROLE.STUDENT },
      [USER_ROLE.STUDENT, USER_ROLE.NURSE, USER_ROLE.DOCTOR],
    );
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('user yo\'q — ForbiddenException', () => {
    const { ctx, reflector } = mockContext(null, [USER_ROLE.ADMIN]);
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
