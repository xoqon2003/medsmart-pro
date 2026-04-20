import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateSymptomDto {
  @ApiProperty({ description: "Simptom kodi (unique)", example: 'SYM-001' })
  @IsString()
  @Matches(/^[A-Z0-9_-]+$/i, { message: "Kod faqat harf/raqam/tire/pastki chiziq" })
  @Length(2, 64)
  code!: string;

  @ApiProperty({ description: 'Simptom nomi (uz)' })
  @IsString()
  @MinLength(2)
  nameUz!: string;

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

  @ApiProperty({ description: 'Kategoriya', example: 'general' })
  @IsString()
  @MinLength(2)
  category!: string;

  @ApiPropertyOptional({ description: 'Tana zonasi' })
  @IsOptional()
  @IsString()
  bodyZone?: string;

  @ApiPropertyOptional({
    description: "Og'irligi",
    enum: ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'],
  })
  @IsOptional()
  @IsEnum(['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'])
  severity?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  synonyms?: string[];

  @ApiPropertyOptional({ description: "Red-flag simptom" })
  @IsOptional()
  @IsBoolean()
  isRedFlag?: boolean;
}
