import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from 'class-validator';

/** Qo'l bilan yozilgan partial. */
export class UpdateReferenceDto {
  @ApiPropertyOptional({
    enum: ['DOI', 'PUBMED', 'URL', 'WHO', 'PROTOCOL', 'BOOK', 'LOCAL_PROTOCOL'],
  })
  @IsOptional()
  @IsEnum(['DOI', 'PUBMED', 'URL', 'WHO', 'PROTOCOL', 'BOOK', 'LOCAL_PROTOCOL'])
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(4)
  citation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i)
  doi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,10}$/)
  pubmedId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whoCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D'])
  evidenceLevel?: string;
}
