import { IsString, IsEnum, IsOptional, IsInt, Min, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ServiceTypeDto {
  AI_RADIOLOG         = 'AI_RADIOLOG',
  RADIOLOG_ONLY       = 'RADIOLOG_ONLY',
  RADIOLOG_SPECIALIST = 'RADIOLOG_SPECIALIST',
  CONSULTATION        = 'CONSULTATION',
  HOME_VISIT          = 'HOME_VISIT',
}

export enum UrgencyDto {
  NORMAL    = 'NORMAL',
  URGENT    = 'URGENT',
  EMERGENCY = 'EMERGENCY',
}

export class CreateApplicationDto {
  @ApiProperty({ enum: ServiceTypeDto })
  @IsEnum(ServiceTypeDto)
  serviceType: ServiceTypeDto;

  @ApiPropertyOptional({ enum: UrgencyDto })
  @IsOptional()
  @IsEnum(UrgencyDto)
  urgency?: UrgencyDto;

  @ApiPropertyOptional({ example: 'MRT' })
  @IsOptional()
  @IsString()
  scanType?: string;

  @ApiPropertyOptional({ example: 'Bosh miya' })
  @IsOptional()
  @IsString()
  organ?: string;

  @ApiPropertyOptional({ example: '2026-04-20' })
  @IsOptional()
  @IsString()
  scanDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  patientId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  radiologId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
