import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SymptomResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  nameUz!: string;

  @ApiPropertyOptional({ nullable: true })
  nameRu?: string | null;

  @ApiPropertyOptional({ nullable: true })
  nameEn?: string | null;

  @ApiPropertyOptional({ nullable: true })
  nameLat?: string | null;

  @ApiProperty()
  category!: string;

  @ApiPropertyOptional({ nullable: true })
  bodyZone?: string | null;

  @ApiProperty()
  severity!: string;

  @ApiProperty({ type: [String] })
  synonyms!: string[];

  @ApiProperty()
  isRedFlag!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class SymptomListResponseDto {
  @ApiProperty({ type: [SymptomResponseDto] })
  items!: SymptomResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
