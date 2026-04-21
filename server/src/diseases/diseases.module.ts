import { Module } from '@nestjs/common';
import { DiseasesController } from './diseases.controller';
import { IcdController } from './icd.controller';
import { MetadataController } from './metadata.controller';
import { DiseasesService } from './diseases.service';
import { DiseasesRepository } from './diseases.repository';
import { EmbeddingService } from './embedding.service';
import { FeatureFlagGuard } from '../common/feature-flag.guard';

/**
 * PrismaModule va AuthModule — global (DI'dan avtomatik). Ichki import kerak emas.
 * EmbeddingService — pgvector semantik qidiruv uchun (MVP: deterministik mock).
 * MetadataController — Disease KB v2 scientists/research/genetics CRUD.
 */
@Module({
  controllers: [DiseasesController, IcdController, MetadataController],
  providers: [DiseasesService, DiseasesRepository, EmbeddingService, FeatureFlagGuard],
  exports: [DiseasesService, DiseasesRepository, EmbeddingService],
})
export class DiseasesModule {}
