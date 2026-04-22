import { Module } from '@nestjs/common';
import { HomeVisitController } from './home-visit.controller';
import { HomeVisitService } from './home-visit.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [HomeVisitController],
  providers: [HomeVisitService],
  exports: [HomeVisitService],
})
export class HomeVisitModule {}
