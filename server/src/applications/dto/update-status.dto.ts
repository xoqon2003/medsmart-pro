import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AppStatusDto {
  NEW             = 'NEW',
  PAID_PENDING    = 'PAID_PENDING',
  ACCEPTED        = 'ACCEPTED',
  IN_PROGRESS     = 'IN_PROGRESS',
  DONE            = 'DONE',
  REJECTED        = 'REJECTED',
  CANCELLED       = 'CANCELLED',
  HV_REQUESTED    = 'HV_REQUESTED',
  HV_ACCEPTED     = 'HV_ACCEPTED',
  HV_EN_ROUTE     = 'HV_EN_ROUTE',
  HV_ARRIVED      = 'HV_ARRIVED',
}

export class UpdateStatusDto {
  @ApiProperty({ enum: AppStatusDto })
  @IsEnum(AppStatusDto)
  @IsNotEmpty()
  status: AppStatusDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
