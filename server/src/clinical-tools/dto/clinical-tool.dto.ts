import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  AudienceMode,
  ClinicalToolType,
  EvidenceLevel,
  UserRole,
} from '@prisma/client';

/**
 * OpenAPI DTO for the universal ClinicalTool catalogue (GAP-05d).
 *
 * Shape covers 5 toolTypes (SCORE, QUESTIONNAIRE, CRITERIA, DOSE, STAGING).
 * `inputsJson` / `outputSchemaJson` are returned opaquely — the FE
 * runner component knows how to render each shape based on `toolType`.
 * We deliberately do NOT lock the input schema down in Swagger to keep
 * room for future input types without a breaking API bump.
 *
 * Admin-sensitive fields (`deactivationReason`, `deactivatedBy`,
 * `clinicOverridesJson`) are surfaced only on the admin endpoints.
 * The public listing uses the slimmer view below.
 */
export class ClinicalToolInputOptionDto {
  @ApiProperty() value!: string | number;
  @ApiProperty() labelKey!: string;
}

export class ClinicalToolInputDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['number', 'boolean', 'select'] })
  type!: 'number' | 'boolean' | 'select';
  @ApiProperty() labelKey!: string;
  @ApiPropertyOptional() helpKey?: string;
  @ApiPropertyOptional() unit?: string;
  @ApiPropertyOptional() min?: number;
  @ApiPropertyOptional() max?: number;
  @ApiPropertyOptional() step?: number;
  @ApiPropertyOptional() required?: boolean;
  @ApiPropertyOptional() defaultValue?: number | boolean | string;
  @ApiPropertyOptional({ type: () => [ClinicalToolInputOptionDto] })
  options?: ClinicalToolInputOptionDto[];
}

export class ClinicalToolDto {
  @ApiProperty() id!: string;
  @ApiProperty({
    description: 'Stable slug matching the FE registry (e.g. "phq-9").',
  })
  toolKey!: string;

  @ApiProperty({
    enum: ['SCORE', 'QUESTIONNAIRE', 'CRITERIA', 'DOSE', 'STAGING'],
  })
  toolType!: ClinicalToolType;

  @ApiProperty() nameKey!: string;
  @ApiPropertyOptional() descriptionKey?: string | null;
  @ApiProperty() source!: string;
  @ApiPropertyOptional() sourceUrl?: string | null;
  @ApiProperty({ enum: ['A', 'B', 'C', 'D'] }) evidenceLevel!: EvidenceLevel;

  @ApiProperty({
    description:
      'Whitelisted compute function identifier on the client (no arbitrary code).',
  })
  formulaKey!: string;

  @ApiProperty({ type: () => [ClinicalToolInputDto] })
  inputs!: ClinicalToolInputDto[];

  @ApiPropertyOptional({
    description:
      'Optional output schema (bands, thresholds, recommendation map). Shape depends on toolType.',
  })
  outputSchema?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description:
      'Audience gate for formula-text visibility (ContentLevel string).',
  })
  showFormulaForAudience?: string | null;

  @ApiProperty({ type: [String] }) applicableCategories!: string[];
  @ApiProperty({ type: [String] }) applicableIcd10Prefixes!: string[];

  @ApiProperty({
    type: [String],
    description: 'AudienceMode values allowed to SEE this tool in the UI.',
  })
  allowedAudiences!: AudienceMode[];

  @ApiProperty({
    type: [String],
    description:
      'UserRole values allowed to actually RUN this tool (hard gate; 403 otherwise).',
  })
  requiredRoles!: UserRole[];

  @ApiProperty() isActive!: boolean;

  @ApiPropertyOptional({ description: 'Uzbekistan population fit (HIGH/MEDIUM/LOW).' })
  regionFitness?: string | null;

  @ApiProperty({ description: 'UI ordering; lower = higher priority.' })
  priorityWeight!: number;

  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

/**
 * Admin view — includes deactivation audit + clinic overrides. Only
 * returned to ADMIN / MEDICAL_EDITOR / EDITOR.
 */
export class ClinicalToolAdminDto extends ClinicalToolDto {
  @ApiPropertyOptional() deactivationReason?: string | null;
  @ApiPropertyOptional() deactivatedAt?: Date | null;
  @ApiPropertyOptional() deactivatedBy?: number | null;
  @ApiPropertyOptional({
    description:
      'Per-clinic override map. Shape: { "<clinicId>": { isActive: boolean, reason?: string, updatedAt: string } }.',
  })
  clinicOverrides?: Record<string, unknown> | null;
  @ApiPropertyOptional() createdBy?: number | null;
  @ApiPropertyOptional() updatedBy?: number | null;
}
