import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis;
  private isConnected = false;

  // TTL sozlamalari (sekundlarda)
  static readonly TTL = {
    USER: 3600,        // 1 soat
    DOCTOR: 3600,      // 1 soat
    TARIFF: 86400,     // 24 soat
    SPECIALTIES: 86400, // 24 soat
    GEO: 86400,        // 24 soat
    SHORT: 300,        // 5 daqiqa
    MEDIUM: 1800,      // 30 daqiqa
  } as const;

  // Cache key prefikslari
  static readonly PREFIX = {
    USER: 'user:',
    DOCTOR: 'doctor:',
    TARIFF: 'tariff:',
    SPECIALTIES: 'specialties',
    GEO: 'geo',
    SLOTS: 'slots:',
    CENTERS: 'centers:',
  } as const;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 10) return null; // stop retrying
        return Math.min(times * 200, 5000);
      },
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.warn(`Redis error: ${err.message}`);
    });

    this.client.on('close', () => {
      this.isConnected = false;
    });

    this.client.connect().catch((err) => {
      this.logger.warn(`Redis connection failed: ${err.message}. Cache will be disabled.`);
    });
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }

  /**
   * Cache dan qiymat olish
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Cache ga qiymat yozish
   */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // Cache xatosi tizim ishini to'xtatmasligi kerak
    }
  }

  /**
   * Cache dan qiymat o'chirish
   */
  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch {
      // ignore
    }
  }

  /**
   * Pattern bo'yicha barcha cache larni o'chirish
   */
  async delByPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch {
      // ignore
    }
  }

  // === Qulaylik metodlari ===

  async getUser<T>(userId: number): Promise<T | null> {
    return this.get<T>(`${CacheService.PREFIX.USER}${userId}`);
  }

  async setUser(userId: number, data: unknown): Promise<void> {
    await this.set(`${CacheService.PREFIX.USER}${userId}`, data, CacheService.TTL.USER);
  }

  async invalidateUser(userId: number): Promise<void> {
    await this.del(`${CacheService.PREFIX.USER}${userId}`);
  }

  async getDoctor<T>(doctorId: number): Promise<T | null> {
    return this.get<T>(`${CacheService.PREFIX.DOCTOR}${doctorId}`);
  }

  async setDoctor(doctorId: number, data: unknown): Promise<void> {
    await this.set(`${CacheService.PREFIX.DOCTOR}${doctorId}`, data, CacheService.TTL.DOCTOR);
  }

  async invalidateDoctor(doctorId: number): Promise<void> {
    await this.del(`${CacheService.PREFIX.DOCTOR}${doctorId}`);
  }

  async getTariffs<T>(): Promise<T | null> {
    return this.get<T>(`${CacheService.PREFIX.TARIFF}all`);
  }

  async setTariffs(data: unknown): Promise<void> {
    await this.set(`${CacheService.PREFIX.TARIFF}all`, data, CacheService.TTL.TARIFF);
  }

  async invalidateTariffs(): Promise<void> {
    await this.delByPattern(`${CacheService.PREFIX.TARIFF}*`);
  }

  async getSpecialties<T>(): Promise<T | null> {
    return this.get<T>(CacheService.PREFIX.SPECIALTIES);
  }

  async setSpecialties(data: unknown): Promise<void> {
    await this.set(CacheService.PREFIX.SPECIALTIES, data, CacheService.TTL.SPECIALTIES);
  }

  async getGeo<T>(): Promise<T | null> {
    return this.get<T>(CacheService.PREFIX.GEO);
  }

  async setGeo(data: unknown): Promise<void> {
    await this.set(CacheService.PREFIX.GEO, data, CacheService.TTL.GEO);
  }
}
