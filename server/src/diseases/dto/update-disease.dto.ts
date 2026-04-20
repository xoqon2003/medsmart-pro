import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

/**
 * PATCH uchun — barcha maydonlar ixtiyoriy. `@nestjs/mapped-types`
 * `PartialType` ishlatilmaydi, chunki paket mavjud emas; qo'lda yozilgan.
 */
export class UpdateDiseaseDto {
  @ApiPropertyOptional({ description: 'ICD-10 kodi' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]\d{2}(\.\d{1,3})?$/, {
    message: "ICD-10 kodi noto'g'ri formatda",
  })
  icd10?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icd11?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @Length(2, 255)
  nameUz?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameRu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameLat?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  synonyms?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  category?: string;

  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST', 'MIXED'], { each: true })
  audienceLevels?: string[];

  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'], { each: true })
  severityLevels?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  protocolSources?: string[];

  @ApiPropertyOptional({
    enum: ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'],
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  editorId?: number;
}
