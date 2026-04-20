import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { nextStatus, KbStatus, KbAction } from '../state-machine';

describe('KB Moderation — state machine', () => {
  describe('submit-review', () => {
    it('DRAFT → REVIEW (EDITOR)', () => {
      expect(nextStatus('DRAFT', 'submit-review', 'EDITOR')).toBe('REVIEW');
    });

    it('REJECTED → REVIEW (qayta yuborish)', () => {
      expect(nextStatus('REJECTED', 'submit-review', 'EDITOR')).toBe('REVIEW');
    });

    it('PUBLISHED → submit-review taqiqlanadi', () => {
      expect(() => nextStatus('PUBLISHED', 'submit-review', 'EDITOR')).toThrow(
        BadRequestException,
      );
    });

    it('PATIENT roli — ForbiddenException', () => {
      expect(() => nextStatus('DRAFT', 'submit-review', 'PATIENT')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('approve', () => {
    it('REVIEW → APPROVED (MEDICAL_EDITOR)', () => {
      expect(nextStatus('REVIEW', 'approve', 'MEDICAL_EDITOR')).toBe('APPROVED');
    });

    it('DRAFT → approve taqiqlanadi', () => {
      expect(() => nextStatus('DRAFT', 'approve', 'MEDICAL_EDITOR')).toThrow(
        BadRequestException,
      );
    });

    it('EDITOR roli approve qila olmaydi', () => {
      expect(() => nextStatus('REVIEW', 'approve', 'EDITOR')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('reject', () => {
    it('REVIEW → REJECTED (MEDICAL_EDITOR)', () => {
      expect(nextStatus('REVIEW', 'reject', 'MEDICAL_EDITOR')).toBe('REJECTED');
    });

    it('APPROVED → reject taqiqlanadi', () => {
      expect(() => nextStatus('APPROVED', 'reject', 'MEDICAL_EDITOR')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('publish', () => {
    it('APPROVED → PUBLISHED (ADMIN)', () => {
      expect(nextStatus('APPROVED', 'publish', 'ADMIN')).toBe('PUBLISHED');
    });

    it('REVIEW → publish taqiqlanadi', () => {
      expect(() => nextStatus('REVIEW', 'publish', 'ADMIN')).toThrow(
        BadRequestException,
      );
    });

    it('MEDICAL_EDITOR publish qila olmaydi', () => {
      expect(() => nextStatus('APPROVED', 'publish', 'MEDICAL_EDITOR')).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('archive', () => {
    it.each<[KbStatus]>([['PUBLISHED'], ['APPROVED'], ['REJECTED']])(
      '%s → ARCHIVED (ADMIN)',
      (from) => {
        expect(nextStatus(from, 'archive', 'ADMIN')).toBe('ARCHIVED');
      },
    );

    it('DRAFT → archive taqiqlanadi', () => {
      expect(() => nextStatus('DRAFT', 'archive', 'ADMIN')).toThrow(
        BadRequestException,
      );
    });
  });

  describe('noma\'lum action', () => {
    it('BadRequestException', () => {
      expect(() =>
        nextStatus('DRAFT', 'launch' as KbAction, 'ADMIN'),
      ).toThrow(BadRequestException);
    });
  });
});
