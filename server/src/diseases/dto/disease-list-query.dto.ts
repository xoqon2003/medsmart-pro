import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * `GET /diseases` query parametrlar.
 * `status` — `PUBLISHED` default (public). Admin token bilan `ALL` yoki boshqa
 * status'larni so'rash mumkin (servicede rol asosida tekshiriladi).
 */
export class DiseaseListQueryDto {
  @ApiPropertyOptional({ description: 'To\'liq matn qidiruv (FTS)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'ICD-10/11 kod boshlanishi bilan filter' })
  @IsOptional()
  @IsString()
  icd?: string;

  @ApiPropertyOptional({ description: 'Kategoriya filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Sahifa raqami', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Sahifa hajmi', default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Auditoriya filtri',
    enum: ['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST', 'MIXED'],
  })
  @IsOptional()
  @IsEnum(['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST', 'MIXED'])
  audience?: string;

  @ApiPropertyOptional({ description: 'Til (uz/ru/en)', default: 'uz' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({
    description:
      "Status filtri (admin uchun). Public holatda default PUBLISHED. 'ALL' barchasini ko'rsatadi.",
    enum: ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'],
  })
  @IsOptional()
  @IsEnum(['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'])
  status?: string;
}
