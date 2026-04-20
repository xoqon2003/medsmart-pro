import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReferenceListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: ['DOI', 'PUBMED', 'URL', 'WHO', 'PROTOCOL', 'BOOK', 'LOCAL_PROTOCOL'],
  })
  @IsOptional()
  @IsEnum(['DOI', 'PUBMED', 'URL', 'WHO', 'PROTOCOL', 'BOOK', 'LOCAL_PROTOCOL'])
  type?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
