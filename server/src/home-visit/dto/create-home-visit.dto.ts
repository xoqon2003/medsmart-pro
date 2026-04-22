import { IsString, IsOptional, IsIn, IsNumber, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Urgency } from '@prisma/client';

const URGENCY_VALUES = Object.values(Urgency);

export class CreateHomeVisitDto {
  @ApiProperty() @IsString() @MinLength(5)
  hvAddress!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  hvClinicName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  hvDoctorName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  hvDoctorSpeciality?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  hvVisitDay?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  hvTimeSlot?: string;

  @ApiProperty() @IsNumber() @Min(0)
  price!: number;

  @ApiPropertyOptional({ enum: Urgency })
  @IsOptional() @IsIn(URGENCY_VALUES)
  urgency?: Urgency;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;
}
