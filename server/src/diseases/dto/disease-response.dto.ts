import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Disease javobi uchun Swagger DTO. Haqiqiy service Prisma Disease tipini
 * qaytaradi; bu DTO faqat OpenAPI generatsiyasi uchun "shape" hujjati.
 */
export class DiseaseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  icd10!: string;

  @ApiPropertyOptional({ nullable: true })
  icd11?: string | null;

  @ApiProperty()
  nameUz!: string;

  @ApiPropertyOptional({ nullable: true })
  nameRu?: string | null;

  @ApiPropertyOptional({ nullable: true })
  nameEn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  nameLat?: string | null;

  @ApiProperty({ type: [String] })
  synonyms!: string[];

  @ApiProperty()
  category!: string;

  @ApiProperty({ type: [String] })
  audienceLevels!: string[];

  @ApiProperty({ type: [String] })
  severityLevels!: string[];

  @ApiProperty({ type: [String] })
  protocolSources!: string[];

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  editorId?: number | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class DiseaseListResponseDto {
  @ApiProperty({ type: [DiseaseResponseDto] })
  items!: DiseaseResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}

export class IcdLookupResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  icd10!: string;
}
