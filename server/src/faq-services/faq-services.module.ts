import { Module } from '@nestjs/common';
import { FaqServicesController } from './faq-services.controller';
import { FaqServicesService } from './faq-services.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FaqServicesController],
  providers: [FaqServicesService],
  exports: [FaqServicesService],
})
export class FaqServicesModule {}
