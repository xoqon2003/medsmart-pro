import { Module } from '@nestjs/common';
import { TriageController } from './triage.controller';
import { TriageService } from './triage.service';
import { TriageCatalogueController } from './triage-catalogue.controller';
import { TriageCatalogueService } from './triage-catalogue.service';
import { MessagesModule } from '../messages/messages.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MessagesModule, NotificationsModule],
  controllers: [TriageController, TriageCatalogueController],
  providers: [TriageService, TriageCatalogueService],
  exports: [TriageService, TriageCatalogueService],
})
export class TriageModule {}
