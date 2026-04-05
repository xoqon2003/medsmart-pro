import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TariffLimitService } from './tariff-guard';

@Global()
@Module({
  providers: [PrismaService, TariffLimitService],
  exports: [PrismaService, TariffLimitService],
})
export class PrismaModule {}
