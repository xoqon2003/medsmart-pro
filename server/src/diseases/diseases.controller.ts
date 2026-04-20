import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DiseasesService } from './diseases.service';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';
import { DiseaseListQueryDto } from './dto/disease-list-query.dto';
import {
  DiseaseListResponseDto,
  DiseaseResponseDto,
} from './dto/disease-response.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';
import { USER_ROLE } from '../auth/dto/user-role';

/**
 * `/api/v1/diseases` — kasalliklar CRUD + FTS qidiruv.
 * Feature flag: `APP_FEATURE_DISEASE_KB=true` bo'lmasa butun controller 404.
 */
@ApiTags('diseases')
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@UseGuards(FeatureFlagGuard)
@Controller('diseases')
export class DiseasesController {
  constructor(private readonly service: DiseasesService) {}

  // ── Public: list / search ─────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: "Kasalliklar ro'yxati va qidiruv" })
  @ApiResponse({ status: 200, type: DiseaseListResponseDto })
  @ApiResponse({ status: 404, description: 'Feature disabled' })
  async list(@Query() query: DiseaseListQueryDto, @Req() req: { user?: { sub: number; role: string } }) {
    const caller = req.user ? { id: req.user.sub, role: req.user.role } : null;
    return this.service.findAll(query, caller);
  }

  // ── Public: single by slug ────────────────────────────────────────────────

  @Get(':slug')
  @ApiOperation({ summary: 'Bitta kasallik (slug bo\'yicha)' })
  @ApiParam({ name: 'slug' })
  @ApiQuery({ name: 'level', enum: ['L1', 'L2', 'L3'], required: false })
  @ApiResponse({ status: 200, type: DiseaseResponseDto })
  @ApiResponse({ status: 404, description: 'Topilmadi yoki feature disabled' })
  async getOne(
    @Param('slug') slug: string,
    @Query('level') level: 'L1' | 'L2' | 'L3' = 'L1',
    @Req() req: { user?: { sub: number; role: string } },
  ) {
    const caller = req.user ? { id: req.user.sub, role: req.user.role } : null;
    return this.service.findBySlug(slug, level, caller);
  }

  // ── Public: symptoms for disease ──────────────────────────────────────────

  @Get(':slug/symptoms')
  @ApiOperation({ summary: 'Kasallikning simptomlari (weight bilan)' })
  @ApiParam({ name: 'slug' })
  async symptoms(
    @Param('slug') slug: string,
    @Req() req: { user?: { sub: number; role: string } },
  ) {
    const caller = req.user ? { id: req.user.sub, role: req.user.role } : null;
    return this.service.findSymptomsForSlug(slug, caller);
  }

  // ── Semantic search (pgvector) ────────────────────────────────────────────

  @Get('semantic-search')
  @ApiOperation({ summary: 'Semantik qidiruv (vektor asosida, ma\'no bo\'yicha)' })
  @ApiQuery({ name: 'q', required: true, description: 'Qidiruv matni' })
  @ApiQuery({ name: 'limit', required: false, description: 'Natijalar soni (default: 10)' })
  @ApiResponse({ status: 200, description: 'Semantik jihatdan yaqin kasalliklar ro\'yxati' })
  semanticSearch(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.service.semanticSearch(q, isNaN(parsedLimit) ? 10 : parsedLimit);
  }

  @Post(':id/index-embedding')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(USER_ROLE.ADMIN, USER_ROLE.EDITOR, USER_ROLE.MEDICAL_EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kasallik embedding indeksini yangilash (ADMIN/EDITOR)' })
  @ApiParam({ name: 'id', description: 'Disease UUID' })
  @ApiResponse({ status: 200, description: '{ ok: true }' })
  indexEmbedding(@Param('id') id: string) {
    return this.service.indexDiseaseEmbedding(id);
  }

  // ── Mutate: EDITOR+ ───────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi kasallik yaratish' })
  @ApiResponse({ status: 201, type: DiseaseResponseDto })
  async create(
    @Body() dto: CreateDiseaseDto,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.create(dto, { id: req.user.sub, role: req.user.role });
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kasallikni yangilash' })
  @ApiResponse({ status: 200, type: DiseaseResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDiseaseDto,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.update(id, dto, { id: req.user.sub, role: req.user.role });
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kasallikni arxivlash (soft delete)' })
  @ApiResponse({ status: 200 })
  async remove(
    @Param('id') id: string,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.remove(id, { id: req.user.sub, role: req.user.role });
  }
}
