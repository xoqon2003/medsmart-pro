import { Module } from '@nestjs/common';
import { RadiologyController } from './radiology.controller';
import { RadiologyService } from './radiology.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { FileStorageModule } from '../file-storage/file-storage.module';

@Module({
  imports: [NotificationsModule, FileStorageModule],
  controllers: [RadiologyController],
  providers: [RadiologyService],
  exports: [RadiologyService],
})
export class RadiologyModule {}
