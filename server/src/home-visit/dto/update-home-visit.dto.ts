import { IsString, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppStatus } from '@prisma/client';

const STATUS_VALUES = Object.values(AppStatus);

export class UpdateHomeVisitDto {
  @ApiPropertyOptional({ enum: AppStatus })
  @IsOptional() @IsIn(STATUS_VALUES)
  status?: AppStatus;

  @ApiPropertyOptional() @IsOptional() @IsString()
  hvVisitDay?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  hvTimeSlot?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  hvAddress?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(5)
  rating?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  ratingComment?: string;
}
