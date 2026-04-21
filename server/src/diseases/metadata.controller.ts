import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DiseasesService } from './diseases.service';
import { CreateScientistDto, UpdateScientistDto } from './dto/scientist.dto';
import { CreateResearchDto, UpdateResearchDto } from './dto/research.dto';
import { CreateGeneticDto, UpdateGeneticDto } from './dto/genetic.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';

type AuthedReq = { user: { sub: number; role: string } };
type MaybeAuthedReq = { user?: { sub: number; role: string } };

/**
 * Disease KB v2 metadata — scientists, research, genetics CRUD.
 *
 * Public GET: `/diseases/:slug/{scientists|research|genetics}` — PUBLISHED
 * kasalliklar uchun ochiq. Admin (MEDICAL_EDITOR) nashr etilmagan kasallikning
 * metadatasini ham ko'ra oladi.
 *
 * Mutate: JwtGuard + RolesGuard, EDITOR+ talab qilinadi. `:id` — disease UUID.
 */
@ApiTags('disease-metadata')
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@UseGuards(FeatureFlagGuard)
@Controller('diseases')
export class MetadataController {
  constructor(private readonly service: DiseasesService) {}

  // ═══ Scientists ═══════════════════════════════════════════════════════════

  @Get(':slug/scientists')
  @ApiOperation({ summary: "Kasallik olimlari ro'yxati" })
  @ApiParam({ name: 'slug', description: 'Disease slug yoki UUID' })
  async listScientists(@Param('slug') slug: string, @Req() req: MaybeAuthedReq) {
    const caller = req.user ? { id: req.user.sub, role: req.user.role } : null;
    return this.service.listScientists(slug, caller);
  }

  @Post(':id/scientists')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi olim qo\'shish (EDITOR+)' })
  @ApiParam({ name: 'id', description: 'Disease UUID' })
  @ApiResponse({ status: 201 })
  async createScientist(
    @Param('id') diseaseId: string,
    @Body() dto: CreateScientistDto,
    @Req() req: AuthedReq,
  ) {
    return this.service.createScientist(diseaseId, { ...dto }, {
      id: req.user.sub,
      role: req.user.role,
    });
  }

  @Patch(':id/scientists/:scientistId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Olimni yangilash (EDITOR+)' })
  async updateScientist(
    @Param('id') diseaseId: string,
    @Param('scientistId') scientistId: string,
    @Body() dto: UpdateScientistDto,
    @Req() req: AuthedReq,
  ) {
    return this.service.updateScientist(diseaseId, scientistId, { ...dto }, {
      id: req.user.sub,
      role: req.user.role,
    });
  }

  @Delete(':id/scientists/:scientistId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Olimni o\'chirish (EDITOR+)' })
  async deleteScientist(
    @Param('id') diseaseId: string,
    @Param('scientistId') scientistId: string,
    @Req() req: AuthedReq,
  ) {
    return this.service.deleteScientist(diseaseId, scientistId, {
      id: req.user.sub,
      role: req.user.role,
    });
  }

  // ═══ Research ═════════════════════════════════════════════════════════════

  @Get(':slug/research')
  @ApiOperation({ summary: "Kasallikning tadqiqotlar ro'yxati" })
  async listResearch(@Param('slug') slug: string, @Req() req: MaybeAuthedReq) {
    const caller = req.user ? { id: req.user.sub, role: req.user.role } : null;
    return this.service.listResearch(slug, caller);
  }

  @Post(':id/research')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi tadqiqot qo\'shish (EDITOR+)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409, description: 'DOI ziddiyat (kasallik ichida takrorlangan)' })
  async createResearch(
    @Param('id') diseaseId: string,
    @Body() dto: CreateResearchDto,
    @Req() req: AuthedReq,
  ) {
    return this.service.createResearch(diseaseId, { ...dto }, {
      id: req.user.sub,
      role: req.user.role,
    });
  }

  @Patch(':id/research/:researchId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tadqiqotni yangilash (EDITOR+)' })
  async updateResearch(
    @Param('id') diseaseId: string,
    @Param('researchId') researchId: string,
    @Body() dto: UpdateResearchDto,
    @Req() req: AuthedReq,
  ) {
    return this.service.updateResearch(diseaseId, researchId, { ...dto }, {
      id: req.user.sub,
      role: req.user.role,
    });
  }

  @Delete(':id/research/:researchId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tadqiqotni o\'chirish (EDITOR+)' })
  async deleteResearch(
    @Param('id') diseaseId: string,
    @Param('researchId') researchId: string,
    @Req() req: AuthedReq,
  ) {
    return this.service.deleteResearch(diseaseId, researchId, {
      id: req.user.sub,
      role: req.user.role,
    });
  }

  // ═══ Genetics ═════════════════════════════════════════════════════════════

  @Get(':slug/genetics')
  @ApiOperation({ summary: 'Kasallikning genetik profili' })
  async listGenetics(@Param('slug') slug: string, @Req() req: MaybeAuthedReq) {
    const caller = req.user ? { id: req.user.sub, role: req.user.role } : null;
    return this.service.listGenetics(slug, caller);
  }

  @Post(':id/genetics')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi genetik yozuv qo\'shish (EDITOR+)' })
  @ApiResponse({ status: 201 })
  async createGenetic(
    @Param('id') diseaseId: string,
    @Body() dto: CreateGeneticDto,
    @Req() req: AuthedReq,
  ) {
    return this.service.createGenetic(diseaseId, { ...dto }, {
      id: req.user.sub,
      role: req.user.role,
    });
  }

  @Patch(':id/genetics/:geneticId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Genetik yozuvni yangilash (EDITOR+)' })
  async updateGenetic(
    @Param('id') diseaseId: string,
    @Param('geneticId') geneticId: string,
    @Body() dto: UpdateGeneticDto,
    @Req() req: AuthedReq,
  ) {
    return this.service.updateGenetic(diseaseId, geneticId, { ...dto }, {
      id: req.user.sub,
      role: req.user.role,
    });
  }

  @Delete(':id/genetics/:geneticId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Genetik yozuvni o\'chirish (EDITOR+)' })
  async deleteGenetic(
    @Param('id') diseaseId: string,
    @Param('geneticId') geneticId: string,
    @Req() req: AuthedReq,
  ) {
    return this.service.deleteGenetic(diseaseId, geneticId, {
      id: req.user.sub,
      role: req.user.role,
    });
  }
}
