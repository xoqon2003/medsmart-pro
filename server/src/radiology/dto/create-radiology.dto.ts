import { IsString, IsOptional, IsIn, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType, Urgency } from '@prisma/client';

const RADIOLOGY_TYPES: ServiceType[] = [
  ServiceType.AI_RADIOLOG,
  ServiceType.RADIOLOG_ONLY,
  ServiceType.RADIOLOG_SPECIALIST,
];
const URGENCY_VALUES = Object.values(Urgency);

export class CreateRadiologyDto {
  @ApiProperty({ example: 'CT' }) @IsString()
  scanType!: string;

  @ApiPropertyOptional({ example: 'chest' })
  @IsOptional() @IsString()
  organ?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  scanFacility?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  scanDate?: string;

  @ApiProperty() @IsNumber() @Min(0)
  price!: number;

  @ApiPropertyOptional({ enum: RADIOLOGY_TYPES })
  @IsOptional() @IsIn(RADIOLOGY_TYPES)
  serviceType?: ServiceType;

  @ApiPropertyOptional({ enum: Urgency })
  @IsOptional() @IsIn(URGENCY_VALUES)
  urgency?: Urgency;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;
}
