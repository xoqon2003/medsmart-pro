import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from 'class-validator';

/**
 * `POST /references` DTO.
 * - DOI: `^10\.\d{4,9}/[-._;()/:A-Z0-9]+$` (i flag)
 * - PubMed: faqat raqam, 1-10 xonali
 */
export class CreateReferenceDto {
  @ApiProperty({
    description: 'Manba turi',
    enum: ['DOI', 'PUBMED', 'URL', 'WHO', 'PROTOCOL', 'BOOK', 'LOCAL_PROTOCOL'],
  })
  @IsEnum(['DOI', 'PUBMED', 'URL', 'WHO', 'PROTOCOL', 'BOOK', 'LOCAL_PROTOCOL'])
  type!: string;

  @ApiProperty({ description: 'Iqtibos matni' })
  @IsString()
  @MinLength(4)
  citation!: string;

  @ApiPropertyOptional({ description: 'URL' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  url?: string;

  @ApiPropertyOptional({ description: 'DOI', example: '10.1038/s41586-020-2649-2' })
  @IsOptional()
  @IsString()
  @Matches(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, {
    message: "DOI formati noto'g'ri (masalan: 10.1038/s41586-020-2649-2)",
  })
  doi?: string;

  @ApiPropertyOptional({ description: 'PubMed ID', example: '32663912' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,10}$/, { message: "PubMed ID faqat raqam, 1-10 xonali" })
  pubmedId?: string;

  @ApiPropertyOptional({ description: 'WHO kod' })
  @IsOptional()
  @IsString()
  whoCode?: string;

  @ApiPropertyOptional({ description: "Nashr sanasi (ISO)" })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({
    description: 'Dalil darajasi',
    enum: ['A', 'B', 'C', 'D'],
  })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D'])
  evidenceLevel?: string;
}
