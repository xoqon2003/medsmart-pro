import { Module } from '@nestjs/common';
import { ConclusionsController } from './conclusions.controller';
import { ConclusionsService } from './conclusions.service';

@Module({
  controllers: [ConclusionsController],
  providers: [ConclusionsService],
})
export class ConclusionsModule {}
