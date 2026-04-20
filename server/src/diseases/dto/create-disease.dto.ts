import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
 * Disease yaratish uchun DTO — majburiy maydonlar: `icd10`, `nameUz`, `category`.
 * `slug` backendda avtomatik yaratiladi (slugify(nameUz) + '-' + icd10).
 * `status` ko'rsatilmasa `DRAFT` qabul qilinadi.
 */
export class CreateDiseaseDto {
  @ApiProperty({ description: 'ICD-10 kodi', example: 'I10' })
  @IsString()
  @Matches(/^[A-Z]\d{2}(\.\d{1,3})?$/, {
    message: "ICD-10 kodi noto'g'ri formatda (masalan: I10, J45.0)",
  })
  icd10!: string;

  @ApiPropertyOptional({ description: 'ICD-11 kodi' })
  @IsOptional()
  @IsString()
  icd11?: string;

  @ApiProperty({ description: "Kasallik nomi (uz)", example: 'Gipertoniya' })
  @IsString()
  @MinLength(2)
  @Length(2, 255)
  nameUz!: string;

  @ApiPropertyOptional({ description: "Kasallik nomi (ru)" })
  @IsOptional()
  @IsString()
  nameRu?: string;

  @ApiPropertyOptional({ description: "Kasallik nomi (en)" })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: "Lotin tilidagi nomi" })
  @IsOptional()
  @IsString()
  nameLat?: string;

  @ApiPropertyOptional({ description: 'Sinonimlar', type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  synonyms?: string[];

  @ApiProperty({ description: 'Kategoriya', example: 'cardiology' })
  @IsString()
  @MinLength(2)
  category!: string;

  @ApiPropertyOptional({
    description: 'Auditoriya darajalari',
    enum: ['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST', 'MIXED'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['PATIENT', 'STUDENT', 'NURSE', 'DOCTOR', 'SPECIALIST', 'MIXED'], { each: true })
  audienceLevels?: string[];

  @ApiPropertyOptional({
    description: 'Kasallik og\'irligi darajalari',
    enum: ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'], { each: true })
  severityLevels?: string[];

  @ApiPropertyOptional({ description: 'Protokol manbalari', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  protocolSources?: string[];

  @ApiPropertyOptional({
    description: 'Tasdiqlash statusi',
    enum: ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'],
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'])
  status?: string;

  @ApiPropertyOptional({ description: "Tahrirchi user ID (server o'rnatadi)" })
  @IsOptional()
  @IsInt()
  editorId?: number;
}
