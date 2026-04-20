import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReferenceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  citation!: string;

  @ApiPropertyOptional({ nullable: true })
  url?: string | null;

  @ApiPropertyOptional({ nullable: true })
  doi?: string | null;

  @ApiPropertyOptional({ nullable: true })
  pubmedId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  whoCode?: string | null;

  @ApiPropertyOptional({ nullable: true })
  publishedAt?: Date | null;

  @ApiProperty()
  accessedAt!: Date;

  @ApiProperty()
  evidenceLevel!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ReferenceListResponseDto {
  @ApiProperty({ type: [ReferenceResponseDto] })
  items!: ReferenceResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;
}
