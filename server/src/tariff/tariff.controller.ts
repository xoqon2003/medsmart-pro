import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TariffService } from './tariff.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateTariffDto } from './dto';

@Controller('tariffs')
export class TariffController {
  constructor(private service: TariffService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() dto: CreateTariffDto, @Request() req: any) {
    return this.service.create(dto, req.user.role);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateTariffDto>, @Request() req: any) {
    return this.service.update(id, dto, req.user.role);
  }

  // Boshlang'ich tariflarni DB ga yozish (bir martalik)
  @UseGuards(JwtGuard)
  @Post('seed')
  seed(@Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      return { error: 'Faqat admin' };
    }
    return this.service.seed();
  }
}
