import { Controller, Get, Post, Put, Param, Body, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { KassaService } from './kassa.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('kassa')
export class KassaController {
  constructor(private service: KassaService) {}

  @UseGuards(JwtGuard)
  @Post('smena')
  async openSmena(@Body() data: any, @Request() req) {
    return this.service.openSmena(
      req.user.sub,
      data.kassirIsmi,
      data.boshlanghichQoldiq || 0,
    );
  }

  @UseGuards(JwtGuard)
  @Put('smena/:id')
  async closeSmena(@Param('id', ParseIntPipe) id: number) {
    return this.service.closeSmena(id);
  }

  @UseGuards(JwtGuard)
  @Get('smena/active')
  async getActiveSmena(@Request() req) {
    return this.service.getActiveSmena(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Post('tolov')
  async createTolov(@Body() data: any) {
    return this.service.createTolov(data);
  }

  @Get('tolov')
  async getTolovlar(@Query('smenaId') smenaId: string) {
    return this.service.getTolovlar(+smenaId);
  }
}
