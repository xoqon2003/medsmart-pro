import { Controller, Get, Post, Param, Body, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ConclusionsService } from './conclusions.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('applications/:appId/conclusions')
export class ConclusionsController {
  constructor(private service: ConclusionsService) {}

  @Get()
  async findByApplication(@Param('appId', ParseIntPipe) appId: number) {
    return this.service.findByApplication(appId);
  }

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Param('appId', ParseIntPipe) appId: number,
    @Body() data: any,
    @Request() req,
  ) {
    return this.service.create(appId, { ...data, authorId: data.authorId || req.user.sub });
  }
}
