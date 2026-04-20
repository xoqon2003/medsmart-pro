import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateBlockDto {
  @ApiProperty({
    description: 'Canonical marker id',
    enum: [...CANONICAL_MARKERS],
  })
  @IsEnum([...CANONICAL_MARKERS])
  marker!: MarkerId;

  @ApiProperty({ description: "Ko'rsatiladigan nom (label variant)" })
  @IsString()
  @MinLength(2)
  label!: string;

  @ApiPropertyOptional({ enum: ['L1', 'L2', 'L3'] })
  @IsOptional()
  @IsEnum(['L1', 'L2', 'L3'])
  level?: string;

  @ApiPropertyOptional({ description: 'Tartib raqami' })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ description: 'Auditoriya ustuvorligi (JSON)' })
  @IsOptional()
  @IsObject()
  audiencePriority?: Record<string, number>;

  @ApiProperty({ description: 'Markdown kontent' })
  @IsString()
  @MinLength(1)
  contentMd!: string;

  @ApiPropertyOptional({ description: 'Structured JSON kontent' })
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
