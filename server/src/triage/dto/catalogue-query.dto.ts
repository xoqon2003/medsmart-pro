import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Query params for catalogue endpoints. Mirrors the FE scope shape
 * (`category` + `icd10`). Both are optional — when omitted, only global
 * entries (no scope) are returned; when provided, the AND semantics
 * identical to the frontend registry are applied server-side.
 */
export class CatalogueQueryDto {
  @ApiPropertyOptional({
    description:
      'Disease category (accepts Uzbek slug or English canonical name).',
    example: 'yurak-qon-tomir',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description:
      'ICD-10 code (optional "ICD10:" prefix tolerated, case-insensitive).',
    example: 'I48',
  })
  @IsOptional()
  @IsString()
  icd10?: string;
}
