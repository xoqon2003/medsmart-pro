import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';
import { ClinicalToolsService } from './clinical-tools.service';
import { ClinicalToolAdminDto } from './dto/clinical-tool.dto';
import {
  ClinicOverrideDto,
  CreateClinicalToolDto,
  UpdateClinicalToolDto,
} from './dto/upsert-clinical-tool.dto';

/**
 * Admin API for the ClinicalTool catalogue (GAP-05d §admin gating).
 *
 * Roles:
 *   • ADMIN / MEDICAL_EDITOR / EDITOR — full CRUD on the global catalogue
 *     + clinic overrides for any clinic.
 *   • DOCTOR (as clinic admin) — restricted to /clinic-override endpoint
 *     for their own clinicId. Enforced inside the service layer.
 *
 * Every write records `createdBy` / `updatedBy` so the admin UI can show
 * "last changed by <name>". Deactivations additionally stamp
 * `deactivatedAt` + `deactivatedBy` + `deactivationReason`.
 */
@ApiTags('clinical-tools-admin')
@ApiBearerAuth()
@UseGuards(JwtGuard, FeatureFlagGuard)
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@Controller('admin/clinical-tools')
export class ClinicalToolsAdminController {
  constructor(private readonly service: ClinicalToolsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MEDICAL_EDITOR', 'EDITOR')
  @ApiOperation({
    summary: 'List ALL tools (including inactive) with admin metadata.',
  })
  @ApiOkResponse({ type: [ClinicalToolAdminDto] })
  list(): Promise<ClinicalToolAdminDto[]> {
    return this.service.adminList();
  }

  @Get(':toolKey')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MEDICAL_EDITOR', 'EDITOR')
  @ApiOperation({ summary: 'Fetch a single tool (admin view, includes audit).' })
  @ApiParam({ name: 'toolKey', example: 'phq-9' })
  @ApiOkResponse({ type: ClinicalToolAdminDto })
  get(@Param('toolKey') toolKey: string): Promise<ClinicalToolAdminDto> {
    return this.service.adminGet(toolKey);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MEDICAL_EDITOR')
  @ApiOperation({
    summary: 'Create a new tool. Restricted to medical editors + system admins.',
  })
  @ApiOkResponse({ type: ClinicalToolAdminDto })
  create(
    @Body() dto: CreateClinicalToolDto,
    @Req() req: Request,
  ): Promise<ClinicalToolAdminDto> {
    return this.service.adminCreate(dto, userIdFromReq(req));
  }

  @Patch(':toolKey')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MEDICAL_EDITOR', 'EDITOR')
  @ApiOperation({
    summary: 'Update mutable metadata. Flip isActive to enable/disable globally.',
    description:
      'When `isActive=false`, a `deactivationReason` is required. Writes are '
      + 'audited via `updatedBy` / `deactivatedBy`.',
  })
  @ApiParam({ name: 'toolKey' })
  @ApiOkResponse({ type: ClinicalToolAdminDto })
  update(
    @Param('toolKey') toolKey: string,
    @Body() dto: UpdateClinicalToolDto,
    @Req() req: Request,
  ): Promise<ClinicalToolAdminDto> {
    return this.service.adminUpdate(toolKey, dto, userIdFromReq(req));
  }

  @Delete(':toolKey')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MEDICAL_EDITOR', 'EDITOR')
  @ApiOperation({
    summary: 'Soft-disable a tool (alias of PATCH with isActive=false).',
  })
  @ApiParam({ name: 'toolKey' })
  @ApiOkResponse({ type: ClinicalToolAdminDto })
  softDelete(
    @Param('toolKey') toolKey: string,
    @Body('reason') reason: string,
    @Req() req: Request,
  ): Promise<ClinicalToolAdminDto> {
    return this.service.adminUpdate(
      toolKey,
      { isActive: false, deactivationReason: reason },
      userIdFromReq(req),
    );
  }

  @Put(':toolKey/clinic-override')
  @UseGuards(RolesGuard)
  // DOCTOR included so that clinic admins (DOCTOR + clinicId binding) can
  // disable a tool for their own tenant; the service layer gates against
  // setting another clinic's override.
  @Roles('ADMIN', 'MEDICAL_EDITOR', 'DOCTOR')
  @ApiOperation({
    summary: 'Set per-clinic activation override (tenant-local toggle).',
    description:
      'Clinic admins may only override tools for their own clinicId. System '
      + 'admins may target any clinic.',
  })
  @ApiParam({ name: 'toolKey' })
  @ApiOkResponse({ type: ClinicalToolAdminDto })
  setClinicOverride(
    @Param('toolKey') toolKey: string,
    @Body() dto: ClinicOverrideDto,
    @Req() req: Request,
  ): Promise<ClinicalToolAdminDto> {
    const user = (req as Request & {
      user?: { sub?: number; role?: string; clinicId?: number };
    }).user;
    return this.service.setClinicOverride(
      toolKey,
      dto,
      user?.sub ?? 0,
      (user?.role ?? 'ADMIN') as UserRole,
      user?.clinicId,
    );
  }
}

function userIdFromReq(req: Request): number {
  const user = (req as Request & { user?: { sub?: number } }).user;
  return user?.sub ?? 0;
}
