import { Module } from '@nestjs/common';
import { SymptomsController } from './symptoms.controller';
import { SymptomsService } from './symptoms.service';
import { FeatureFlagGuard } from '../common/feature-flag.guard';

@Module({
  controllers: [SymptomsController],
  providers: [SymptomsService, FeatureFlagGuard],
  exports: [SymptomsService],
})
export class SymptomsModule {}
