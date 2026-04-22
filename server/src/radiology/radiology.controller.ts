import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';
import { RadiologyService } from './radiology.service';
import { CreateRadiologyDto } from './dto/create-radiology.dto';
import { AssignRadiologistDto } from './dto/assign-radiologist.dto';
import { UploadStudyDto } from './dto/upload-study.dto';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user: { sub: number; role: string };
}

@ApiTags('radiology')
@ApiBearerAuth()
@UseGuards(JwtGuard, FeatureFlagGuard)
@FeatureFlag('APP_FEATURE_RADIOLOGY')
@Controller('radiology')
export class RadiologyController {
  constructor(private readonly svc: RadiologyService) {}

  @Post()
  @ApiOperation({ summary: 'Radiologik ariza yaratish' })
  create(@Body() dto: CreateRadiologyDto, @Req() req: AuthRequest) {
    return this.svc.create(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Radiologik arizalar ro\'yxati (paginated)' })
  list(
    @Query('status') status: string | undefined,
    @Query('skip') skip: string | undefined,
    @Query('take') take: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.svc.list(
      req.user.sub,
      req.user.role,
      status,
      skip ? Number(skip) : 0,
      take ? Number(take) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Radiologik ariza tafsilotlari' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.svc.findOne(id, req.user.sub, req.user.role);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Radiologni tayinlash' })
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRadiologistDto,
    @Req() req: AuthRequest,
  ) {
    return this.svc.assign(id, dto, req.user.sub, req.user.role);
  }

  @Patch(':id/study')
  @ApiOperation({ summary: 'Tekshiruv ma\'lumotlarini yuklash' })
  uploadStudy(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UploadStudyDto,
    @Req() req: AuthRequest,
  ) {
    return this.svc.uploadStudy(id, dto, req.user.sub, req.user.role);
  }
}
