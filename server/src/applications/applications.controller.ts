import { Controller, Get, Post, Put, Patch, Param, Body, Query, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private service: ApplicationsService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
    @Query('radiologId') radiologId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      status,
      patientId: patientId ? +patientId : undefined,
      radiologId: radiologId ? +radiologId : undefined,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() data: any, @Request() req) {
    return this.service.create({ ...data, patientId: data.patientId || req.user.sub });
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Body('notes') notes: string,
    @Request() req,
  ) {
    return this.service.updateStatus(id, status, req.user.sub, req.user.role, notes);
  }
}
