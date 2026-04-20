import { Module } from '@nestjs/common';
import { ReferencesController } from './references.controller';
import { ReferencesService } from './references.service';
import { FeatureFlagGuard } from '../common/feature-flag.guard';

@Module({
  controllers: [ReferencesController],
  providers: [ReferencesService, FeatureFlagGuard],
  exports: [ReferencesService],
})
export class ReferencesModule {}
