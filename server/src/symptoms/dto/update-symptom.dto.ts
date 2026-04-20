import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

/** Qo'l bilan yozilgan partial (no `@nestjs/mapped-types`). */
export class UpdateSymptomDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9_-]+$/i)
  @Length(2, 64)
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyZone?: string;

  @ApiPropertyOptional({ enum: ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'] })
  @IsOptional()
  @IsEnum(['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'])
  severity?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  synonyms?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRedFlag?: boolean;
}
