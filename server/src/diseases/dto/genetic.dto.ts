import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const INHERITANCE_PATTERNS = [
  'AUTOSOMAL_DOMINANT',
  'AUTOSOMAL_RECESSIVE',
  'X_LINKED_DOMINANT',
  'X_LINKED_RECESSIVE',
  'MITOCHONDRIAL',
  'COMPLEX',
  'SPORADIC',
] as const;
export type InheritancePatternType = (typeof INHERITANCE_PATTERNS)[number];

export const BLOOD_GROUPS = [
  'A_POS',
  'A_NEG',
  'B_POS',
  'B_NEG',
  'AB_POS',
  'AB_NEG',
  'O_POS',
  'O_NEG',
] as const;
export type BloodGroupType = (typeof BLOOD_GROUPS)[number];

/**
 * `POST /api/v1/diseases/:id/genetics` — yangi genetik profil (ADMIN/EDITOR).
 * Barcha maydonlar optional — model metadata-heavy.
 */
export class CreateGeneticDto {
  @ApiPropertyOptional({ description: 'Gen nomi', example: 'HLA-B27' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  geneSymbol?: string;

  @ApiPropertyOptional({
    description: 'Variant turi',
    example: 'Missense mutation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  variantType?: string;

  @ApiPropertyOptional({
    description: 'Nasl qoldirish pattern',
    enum: INHERITANCE_PATTERNS,
  })
  @IsOptional()
  @IsEnum(INHERITANCE_PATTERNS)
  inheritancePattern?: InheritancePatternType;

  @ApiPropertyOptional({ description: 'Penetrans (0.000 – 1.000)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(1)
  penetrance?: number;

  @ApiPropertyOptional({
    description: 'Qon guruh riski',
    enum: BLOOD_GROUPS,
  })
  @IsOptional()
  @IsEnum(BLOOD_GROUPS)
  bloodGroupRisk?: BloodGroupType;

  @ApiPropertyOptional({ description: 'Populyatsiya izohi (Markdown)' })
  @IsOptional()
  @IsString()
  populationNoteMd?: string;
}

/** `PATCH /api/v1/diseases/:id/genetics/:geneticId` — hamma maydonlar ixtiyoriy. */
export class UpdateGeneticDto extends PartialType(CreateGeneticDto) {}
