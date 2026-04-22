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
import { HomeVisitService } from './home-visit.service';
import { CreateHomeVisitDto } from './dto/create-home-visit.dto';
import { UpdateHomeVisitDto } from './dto/update-home-visit.dto';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user: { sub: number; role: string };
}

@ApiTags('home-visit')
@ApiBearerAuth()
@UseGuards(JwtGuard, FeatureFlagGuard)
@FeatureFlag('APP_FEATURE_HOME_VISIT')
@Controller('home-visit')
export class HomeVisitController {
  constructor(private readonly svc: HomeVisitService) {}

  @Post()
  @ApiOperation({ summary: 'Uy-vizit arizasi yaratish' })
  create(@Body() dto: CreateHomeVisitDto, @Req() req: AuthRequest) {
    return this.svc.create(dto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Uy-vizit arizalari ro\'yxati (paginated)' })
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
  @ApiOperation({ summary: 'Bitta uy-vizit tafsilotlari' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.svc.findOne(id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Uy-vizitni yangilash' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHomeVisitDto,
    @Req() req: AuthRequest,
  ) {
    return this.svc.update(id, dto, req.user.sub, req.user.role);
  }
}
