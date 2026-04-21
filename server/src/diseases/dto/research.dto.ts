import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const RESEARCH_TYPES = [
  'RCT',
  'META_ANALYSIS',
  'SYSTEMATIC_REVIEW',
  'COHORT',
  'CASE_CONTROL',
  'CASE_SERIES',
  'CASE_REPORT',
  'GUIDELINE',
] as const;
export type ResearchTypeType = (typeof RESEARCH_TYPES)[number];

export const EVIDENCE_LEVELS = ['A', 'B', 'C', 'D'] as const;
export type EvidenceLevelType = (typeof EVIDENCE_LEVELS)[number];

/**
 * `POST /api/v1/diseases/:id/research` — yangi tadqiqot qo'shish (ADMIN/EDITOR).
 */
export class CreateResearchDto {
  @ApiProperty({ description: 'Tadqiqot sarlavhasi' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title!: string;

  @ApiProperty({ description: 'Mualliflar', example: 'Smith J, Brown A, et al.' })
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  authors!: string;

  @ApiPropertyOptional({ description: 'Jurnal' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  journal?: string;

  @ApiProperty({ description: 'Nashr etilgan yil', example: 2024 })
  @IsInt()
  @Min(1800)
  @Max(2100)
  year!: number;

  @ApiPropertyOptional({ description: 'DOI', example: '10.1056/NEJMoa1511939' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  doi?: string;

  @ApiPropertyOptional({ description: 'PubMed ID' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pubmedId?: string;

  @ApiPropertyOptional({ description: 'ClinicalTrials.gov NCT ID' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nctId?: string;

  @ApiProperty({ description: 'Tadqiqot turi', enum: RESEARCH_TYPES })
  @IsEnum(RESEARCH_TYPES)
  type!: ResearchTypeType;

  @ApiProperty({ description: 'Qisqacha mazmun (Markdown)' })
  @IsString()
  @MinLength(10)
  summaryMd!: string;

  @ApiPropertyOptional({
    description: 'Dalil darajasi',
    enum: EVIDENCE_LEVELS,
    default: 'C',
  })
  @IsOptional()
  @IsEnum(EVIDENCE_LEVELS)
  evidenceLevel?: EvidenceLevelType;

  @ApiPropertyOptional({ description: 'Landmark tadqiqot', default: false })
  @IsOptional()
  @IsBoolean()
  isLandmark?: boolean;
}

/** `PATCH /api/v1/diseases/:id/research/:researchId` — hamma maydonlar ixtiyoriy. */
export class UpdateResearchDto extends PartialType(CreateResearchDto) {}
