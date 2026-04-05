import { CacheService } from '../src/cache/cache.service';

describe('CacheService', () => {
  describe('TTL constants', () => {
    it('TTL qiymatlari to\'g\'ri sozlangan bo\'lishi kerak', () => {
      expect(CacheService.TTL.USER).toBe(3600);
      expect(CacheService.TTL.DOCTOR).toBe(3600);
      expect(CacheService.TTL.TARIFF).toBe(86400);
      expect(CacheService.TTL.SPECIALTIES).toBe(86400);
      expect(CacheService.TTL.SHORT).toBe(300);
      expect(CacheService.TTL.MEDIUM).toBe(1800);
    });
  });

  describe('PREFIX constants', () => {
    it('prefix qiymatlari to\'g\'ri sozlangan bo\'lishi kerak', () => {
      expect(CacheService.PREFIX.USER).toBe('user:');
      expect(CacheService.PREFIX.DOCTOR).toBe('doctor:');
      expect(CacheService.PREFIX.TARIFF).toBe('tariff:');
    });
  });
});
