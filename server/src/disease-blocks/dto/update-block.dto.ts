import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CANONICAL_MARKERS, MarkerId } from '../../diseases/markers/markers';

export class UpdateBlockDto {
  @ApiPropertyOptional({ enum: [...CANONICAL_MARKERS] })
  @IsOptional()
  @IsEnum([...CANONICAL_MARKERS])
  marker?: MarkerId;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  label?: string;

  @ApiPropertyOptional({ enum: ['L1', 'L2', 'L3'] })
  @IsOptional()
  @IsEnum(['L1', 'L2', 'L3'])
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  audiencePriority?: Record<string, number>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contentMd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  contentJson?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ['A', 'B', 'C', 'D'] })
  @IsOptional()
  @IsEnum(['A', 'B', 'C', 'D'])
  evidenceLevel?: string;

  @ApiPropertyOptional({
    enum: ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'],
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'])
  status?: string;
}
