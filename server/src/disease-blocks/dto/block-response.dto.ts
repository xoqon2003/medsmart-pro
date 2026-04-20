import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BlockResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  diseaseId!: string;

  @ApiProperty()
  marker!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  level!: string;

  @ApiProperty()
  orderIndex!: number;

  @ApiPropertyOptional({ nullable: true })
  audiencePriority?: unknown;

  @ApiProperty()
  contentMd!: string;

  @ApiPropertyOptional({ nullable: true })
  contentJson?: unknown;

  @ApiProperty()
  evidenceLevel!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
