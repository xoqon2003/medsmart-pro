import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { KbModerationController } from './kb-moderation.controller';
import { KbModerationService } from './kb-moderation.service';
import {
  KbModerationProcessor,
  KB_MODERATION_QUEUE,
} from './kb-moderation.processor';
import { FeatureFlagGuard } from '../common/feature-flag.guard';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * KB moderatsiya moduli — DiseaseBlock moderatsiya workflow (PR-11).
 *
 * BullMQ connection `JobsModule.BullModule.forRoot(...)` ichida global
 * sifatida sozlangan. Bu yerda `forRoot` qayta chaqirilmaydi — faqat
 * qo'shimcha queue ro'yxatdan o'tkaziladi.
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: KB_MODERATION_QUEUE,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    }),
    NotificationsModule,
  ],
  controllers: [KbModerationController],
  providers: [KbModerationService, KbModerationProcessor, FeatureFlagGuard],
  exports: [KbModerationService],
})
export class KbModerationModule {}
