import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymeProvider } from './providers/payme.provider';
import { ClickProvider } from './providers/click.provider';
import { UzumProvider } from './providers/uzum.provider';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymeProvider, ClickProvider, UzumProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
