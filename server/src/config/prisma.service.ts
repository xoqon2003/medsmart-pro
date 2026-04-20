import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // OpenAPI codegen yoki boshqa static tahlil holatlarida DB ga ulanmaymiz.
    // Script: SKIP_DB_CONNECT=true ts-node scripts/generate-openapi.ts
    if (process.env.SKIP_DB_CONNECT === 'true') {
      this.logger.warn('SKIP_DB_CONNECT=true — Prisma client initialized without DB connection');
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    if (process.env.SKIP_DB_CONNECT === 'true') return;
    await this.$disconnect();
  }
}
