import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('clinics')
export class ClinicController {
  constructor(private service: ClinicService) {}

  @Get()
  findAll(@Query('city') city?: string, @Query('region') region?: string) {
    return this.service.findAll(city, region);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @UseGuards(JwtGuard)
  @Post()
  create(@Body() dto: any, @Request() req: any) {
    return this.service.create(dto, req.user.role);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.service.update(id, dto, req.user.role);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/verify')
  verify(@Param('id') id: string, @Request() req: any) {
    return this.service.verify(id, req.user.sub);
  }
}
