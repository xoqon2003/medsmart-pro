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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DiseaseBlocksService } from './disease-blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { AttachReferenceDto } from './dto/attach-reference.dto';
import { BlockListQueryDto } from './dto/block-list-query.dto';
import { BlockResponseDto } from './dto/block-response.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';

/**
 * URL prefiks `diseases` — bloklar kasallikka tegishli. Endpointlar:
 * `/diseases/:slug/blocks`, `/diseases/:slug/blocks/:marker`, va h.k.
 */
@ApiTags('disease-blocks')
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@UseGuards(FeatureFlagGuard)
@Controller('diseases/:slug/blocks')
export class DiseaseBlocksController {
  constructor(private readonly service: DiseaseBlocksService) {}

  @Get()
  @ApiOperation({ summary: 'Kasallik bloklarini olish' })
  @ApiParam({ name: 'slug' })
  @ApiResponse({ status: 200, type: [BlockResponseDto] })
  async list(
    @Param('slug') slug: string,
    @Query() query: BlockListQueryDto,
    @Req() req: { user?: { sub: number; role: string } },
  ) {
    const caller = req.user ? { id: req.user.sub, role: req.user.role } : null;
    return this.service.listForDisease(slug, query, caller);
  }

  @Get(':marker')
  @ApiOperation({ summary: 'Bitta blok (marker bo\'yicha, lazy-load)' })
  @ApiParam({ name: 'slug' })
  @ApiParam({ name: 'marker' })
  @ApiResponse({ status: 200, type: BlockResponseDto })
  async byMarker(
    @Param('slug') slug: string,
    @Param('marker') marker: string,
    @Req() req: { user?: { sub: number; role: string } },
  ) {
    const caller = req.user ? { id: req.user.sub, role: req.user.role } : null;
    return this.service.findByMarker(slug, marker, caller);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi blok yaratish' })
  @ApiResponse({ status: 201, type: BlockResponseDto })
  async create(
    @Param('slug') slug: string,
    @Body() dto: CreateBlockDto,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.create(slug, dto, { id: req.user.sub, role: req.user.role });
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Blokni yangilash' })
  @ApiResponse({ status: 200, type: BlockResponseDto })
  async update(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: UpdateBlockDto,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.update(slug, id, dto, { id: req.user.sub, role: req.user.role });
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Blokni o'chirish" })
  async remove(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.remove(slug, id, { id: req.user.sub, role: req.user.role });
  }

  @Post(':id/references')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manbani blokka bog\'lash' })
  async attachRef(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: AttachReferenceDto,
    @Req() req: { user: { sub: number; role: string } },
  ) {
    return this.service.attachReference(slug, id, dto, {
      id: req.user.sub,
      role: req.user.role,
    });
  }
}
