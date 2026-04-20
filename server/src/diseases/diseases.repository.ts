import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

/**
 * Prisma wrapper. Servicedagi murakkab query'lar uchun ingichka qatlam.
 *
 * IZOH: Prisma client hozircha `Disease*` modellari uchun generate qilinmagan
 * (PR-02/06 migratsiyalaridan keyin `prisma generate` ishlatilgani kutilyapti).
 * Shu sabab tiplar `any` sifatida yozilgan — client regenerate qilingandan keyin
 * mos keladi, kod o'zgarishsiz ishlaydi. Static tahlil uchun `as unknown as ...`.
 */
type PrismaAny = PrismaService & {
  disease: {
    findMany: (args: unknown) => Promise<unknown[]>;
    count: (args: unknown) => Promise<number>;
    findUnique: (args: unknown) => Promise<unknown>;
    findFirst: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
  };
};

@Injectable()
export class DiseasesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get p(): PrismaAny {
    return this.prisma as unknown as PrismaAny;
  }

  findMany(args: unknown): Promise<unknown[]> {
    return this.p.disease.findMany(args);
  }

  count(args: unknown): Promise<number> {
    return this.p.disease.count(args);
  }

  findUnique(args: unknown): Promise<unknown> {
    return this.p.disease.findUnique(args);
  }

  findFirst(args: unknown): Promise<unknown> {
    return this.p.disease.findFirst(args);
  }

  create(args: unknown): Promise<unknown> {
    return this.p.disease.create(args);
  }

  update(args: unknown): Promise<unknown> {
    return this.p.disease.update(args);
  }

  delete(args: unknown): Promise<unknown> {
    return this.p.disease.delete(args);
  }
}
