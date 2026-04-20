import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  Max,
} from 'class-validator';
import {
  AudienceMode,
  ClinicalToolType,
  EvidenceLevel,
  UserRole,
} from '@prisma/client';

/**
 * CREATE payload (admin API). Mutable metadata only — `formulaKey` names a
 * whitelisted compute function on the client, so while an editor CAN set it
 * on create, the actual compute code lives in the FE repo. Unknown
 * formulaKeys will render as "unsupported tool" in the UI (safe failure).
 *
 * Design: we split mutable-by-editor vs code-controlled fields. Everything
 * in `UpdateClinicalToolDto` is editor-controlled. `formulaKey` + `inputs`
 * are technically mutable on create but almost never on update (changing
 * them silently breaks active runs).
 */
export class CreateClinicalToolDto {
  @ApiProperty({ example: 'phq-9' })
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{1,63}$/, {
    message:
      'toolKey must be lowercase alphanumeric with hyphens (1-64 chars)',
  })
  toolKey!: string;

  @ApiProperty({ enum: ClinicalToolType })
  @IsEnum(ClinicalToolType)
  toolType!: ClinicalToolType;

  @ApiProperty() @IsString() nameKey!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() descriptionKey?: string;

  @ApiProperty() @IsString() source!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sourceUrl?: string;

  @ApiPropertyOptional({ enum: EvidenceLevel, default: 'C' })
  @IsOptional()
  @IsEnum(EvidenceLevel)
  evidenceLevel?: EvidenceLevel;

  @ApiProperty({
    description:
      'Whitelisted compute function identifier. Unknown keys render as '
      + '"unsupported" on the client.',
  })
  @IsString()
  formulaKey!: string;

  @ApiProperty({
    description:
      'Input schema (CalculatorInput[] or QuestionnaireItem[]). Shape '
      + 'validated at the runtime layer, not here.',
  })
  inputs!: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  outputSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'ContentLevel string for formula-text gate ("L1"/"L2"/"L3").',
  })
  @IsOptional()
  @IsString()
  showFormulaForAudience?: string;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategories?: string[];

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableIcd10Prefixes?: string[];

  @ApiPropertyOptional({ enum: AudienceMode, isArray: true, default: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(AudienceMode, { each: true })
  allowedAudiences?: AudienceMode[];

  @ApiPropertyOptional({ enum: UserRole, isArray: true, default: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  requiredRoles?: UserRole[];

  @ApiPropertyOptional({ description: 'Region fitness: HIGH/MEDIUM/LOW.' })
  @IsOptional()
  @IsString()
  regionFitness?: string;

  @ApiPropertyOptional({ default: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  priorityWeight?: number;
}

/**
 * UPDATE payload — all fields optional so a single PATCH can tune one
 * attribute (e.g. flip isActive). Whitelisted fields only; the formulaKey
 * / toolKey / toolType are frozen after creation to prevent silent drift.
 */
export class UpdateClinicalToolDto {
  @ApiPropertyOptional() @IsOptional() @IsString() nameKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descriptionKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sourceUrl?: string;

  @ApiPropertyOptional({ enum: EvidenceLevel })
  @IsOptional()
  @IsEnum(EvidenceLevel)
  evidenceLevel?: EvidenceLevel;

  @ApiPropertyOptional()
  @IsOptional()
  inputs?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  outputSchema?: Record<string, unknown>;

  @ApiPropertyOptional() @IsOptional() @IsString() showFormulaForAudience?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategories?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableIcd10Prefixes?: string[];

  @ApiPropertyOptional({ enum: AudienceMode, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(AudienceMode, { each: true })
  allowedAudiences?: AudienceMode[];

  @ApiPropertyOptional({ enum: UserRole, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  requiredRoles?: UserRole[];

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Required when flipping isActive=false so admins can audit who/why.',
  })
  @IsOptional()
  @IsString()
  deactivationReason?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() regionFitness?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  priorityWeight?: number;
}

/**
 * Clinic-level override payload — a clinic admin can DEACTIVATE (or
 * re-activate) a tool for their own tenant without touching the global
 * catalogue. System admins can set the override for any clinic; clinic
 * admins are restricted to their own clinicId (enforced in the service).
 */
export class ClinicOverrideDto {
  @ApiProperty({ description: 'Clinic tenant id.' })
  @IsInt()
  clinicId!: number;

  @ApiProperty({
    description:
      'true = enable for this clinic, false = disable. Overrides the global '
      + '`isActive` flag for this tenant only.',
  })
  @IsBoolean()
  isActive!: boolean;

  @ApiPropertyOptional({
    description: 'Audit note — shown in the admin UI.',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
