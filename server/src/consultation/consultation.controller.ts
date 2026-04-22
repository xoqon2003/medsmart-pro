import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { CancelConsultationDto } from './dto/cancel-consultation.dto';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user: { sub: number; role: string };
}

@ApiTags('consultation')
@ApiBearerAuth()
@UseGuards(JwtGuard, FeatureFlagGuard)
@FeatureFlag('APP_FEATURE_CONSULTATION')
@Controller('consultation')
export class ConsultationController {
  constructor(private readonly svc: ConsultationService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi konsultatsiya so\'rovi yaratish' })
  create(@Body() dto: CreateConsultationDto, @Req() req: AuthRequest) {
    return this.svc.create(dto, req.user.sub, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'Foydalanuvchi konsultatsiyalar ro\'yxati (paginated)' })
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
  @ApiOperation({ summary: 'Konsultatsiya tafsilotlari' })
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.svc.findOne(id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Konsultatsiyani yangilash' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateConsultationDto,
    @Req() req: AuthRequest,
  ) {
    return this.svc.update(id, dto, req.user.sub, req.user.role);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Bekor qilish' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelConsultationDto,
    @Req() req: AuthRequest,
  ) {
    return this.svc.cancel(id, dto, req.user.sub, req.user.role);
  }
}
