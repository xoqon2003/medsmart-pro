import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ClinicalToolType } from '@prisma/client';

/**
 * Query params for the public tool list. All optional; combinable with
 * AND semantics server-side:
 *   - `category` / `icd10`    → scope filter (accepts Uzbek slug aliases)
 *   - `toolType`              → one of SCORE/QUESTIONNAIRE/CRITERIA/DOSE/STAGING
 *   - `clinicId`              → tenant filter for per-clinic overrides
 *   - `includeInactive`       → admin-only flag, rejected for non-admins
 */
export class ListToolsQueryDto {
  @ApiPropertyOptional({
    description: 'Disease category (Uzbek slug or English canonical name).',
    example: 'yurak-qon-tomir',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'ICD-10 code ("ICD10:" prefix tolerated, case-insensitive).',
    example: 'I48',
  })
  @IsOptional()
  @IsString()
  icd10?: string;

  @ApiPropertyOptional({
    enum: ClinicalToolType,
    description: 'Filter by tool type.',
  })
  @IsOptional()
  @IsEnum(ClinicalToolType)
  toolType?: ClinicalToolType;

  @ApiPropertyOptional({
    description:
      'Clinic tenant id. When present, clinic-level overrides are applied '
      + 'to isActive. Ignored for non-authenticated calls.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clinicId?: number;

  @ApiPropertyOptional({
    description:
      'ADMIN-only: include soft-deactivated tools. Silently ignored for '
      + 'non-admin callers.',
  })
  @IsOptional()
  includeInactive?: boolean;
}
