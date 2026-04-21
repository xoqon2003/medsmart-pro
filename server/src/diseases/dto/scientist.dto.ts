import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const SCIENTIST_ROLES = [
  'DISCOVERER',
  'CLASSIFIER',
  'CONTRIBUTOR',
  'RESEARCHER',
  'EDITOR',
] as const;
export type ScientistRoleType = (typeof SCIENTIST_ROLES)[number];

/**
 * `POST /api/v1/diseases/:id/scientists` — yangi olim qo'shish (ADMIN/EDITOR).
 */
export class CreateScientistDto {
  @ApiProperty({ description: "Olim to'liq ismi", example: 'Scipione Riva-Rocci' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({ description: 'Roli', enum: SCIENTIST_ROLES, example: 'DISCOVERER' })
  @IsEnum(SCIENTIST_ROLES)
  role!: ScientistRoleType;

  @ApiPropertyOptional({ description: 'Davlat', example: 'Italiya' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Tug\'ilgan yil', example: 1863 })
  @IsOptional()
  @IsInt()
  @Min(1000)
  birthYear?: number;

  @ApiPropertyOptional({ description: 'Vafot etgan yil', example: 1937 })
  @IsOptional()
  @IsInt()
  @Min(1000)
  deathYear?: number;

  @ApiPropertyOptional({ description: 'Biografiya (Markdown)' })
  @IsOptional()
  @IsString()
  bioMd?: string;

  @ApiPropertyOptional({ description: 'Hissasi (Markdown)' })
  @IsOptional()
  @IsString()
  contributionsMd?: string;

  @ApiPropertyOptional({ description: 'Rasm URL' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Tartib indeksi', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}

/** `PATCH /api/v1/diseases/:id/scientists/:scientistId` — hamma maydonlar ixtiyoriy. */
export class UpdateScientistDto extends PartialType(CreateScientistDto) {}
