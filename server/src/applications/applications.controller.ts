import {
  Controller, Get, Post, Put, Patch,
  Param, Body, Query, ParseIntPipe,
  UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import type { JwtPayload } from '../auth/jwt-payload.interface';

/** NestJS Request ob'ekti JWT payload bilan */
interface AuthRequest {
  user: JwtPayload;
}

@ApiTags('applications')
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
      patientId:  patientId  ? +patientId  : undefined,
      radiologId: radiologId ? +radiologId : undefined,
      page:  page  ? +page  : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() data: CreateApplicationDto,
    @Request() req: AuthRequest,
  ) {
    return this.service.create({
      ...data,
      patientId: data.patientId ?? req.user.sub,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateApplicationDto,
  ) {
    return this.service.update(id, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusDto,
    @Request() req: AuthRequest,
  ) {
    return this.service.updateStatus(
      id,
      body.status,
      req.user.sub,
      req.user.role,
      body.notes,
    );
  }
}
