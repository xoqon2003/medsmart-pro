import { Module } from '@nestjs/common';
import { DiseaseBlocksController } from './disease-blocks.controller';
import { MarkersController } from './markers.controller';
import { DiseaseBlocksService } from './disease-blocks.service';
import { FeatureFlagGuard } from '../common/feature-flag.guard';

@Module({
  controllers: [DiseaseBlocksController, MarkersController],
  providers: [DiseaseBlocksService, FeatureFlagGuard],
  exports: [DiseaseBlocksService],
})
export class DiseaseBlocksModule {}
