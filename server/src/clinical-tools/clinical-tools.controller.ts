import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { UserRole } from '@prisma/client';
import { JwtGuard } from '../auth/jwt.guard';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';
import { ClinicalToolsService } from './clinical-tools.service';
import { ClinicalToolDto } from './dto/clinical-tool.dto';
import { ListToolsQueryDto } from './dto/list-tools-query.dto';

/**
 * Public read API for the universal ClinicalTool catalogue (GAP-05d).
 *
 * Gated by `APP_FEATURE_DISEASE_KB` + JWT. Filtered server-side by:
 *   • query.category + query.icd10 (AND semantics, Uzbek slug aliases)
 *   • query.toolType (SCORE / QUESTIONNAIRE / …)
 *   • query.clinicId (if set, clinic-level overrides applied)
 *   • caller's role (audience gate + admin-only inactive include)
 *
 * Admin-only CRUD lives in a sibling controller (`clinical-tools.admin`).
 */
@ApiTags('clinical-tools')
@ApiBearerAuth()
@UseGuards(JwtGuard, FeatureFlagGuard)
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@Controller('clinical-tools')
export class ClinicalToolsController {
  constructor(private readonly service: ClinicalToolsService) {}

  @Get()
  @ApiOperation({
    summary: 'List active clinical tools (optionally scoped + role-gated).',
    description:
      'Returns the subset of tools the caller may see. Applies scope '
      + '(category + icd10), toolType filter, and the soft audience gate. '
      + 'Inactive tools are hidden unless the caller is ADMIN/EDITOR and '
      + 'passes `includeInactive=true`.',
  })
  @ApiOkResponse({ type: [ClinicalToolDto] })
  list(
    @Query() query: ListToolsQueryDto,
    @Req() req: Request,
  ): Promise<ClinicalToolDto[]> {
    const callerRole = roleFromReq(req);
    return this.service.listTools(query, callerRole);
  }

  @Get(':toolKey')
  @ApiOperation({ summary: 'Fetch a single tool by its stable key.' })
  @ApiParam({ name: 'toolKey', example: 'phq-9' })
  @ApiOkResponse({ type: ClinicalToolDto })
  get(
    @Param('toolKey') toolKey: string,
    @Query('clinicId') clinicIdRaw: string | undefined,
    @Req() req: Request,
  ): Promise<ClinicalToolDto> {
    const callerRole = roleFromReq(req);
    const clinicId = clinicIdRaw ? Number(clinicIdRaw) : undefined;
    return this.service.getToolByKey(toolKey, callerRole, clinicId);
  }
}

function roleFromReq(req: Request): UserRole | undefined {
  const user = (req as Request & { user?: { role?: string } }).user;
  return user?.role as UserRole | undefined;
}
