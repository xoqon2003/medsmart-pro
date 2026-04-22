import { IsOptional, IsString, IsNumber, IsBoolean, IsIn, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const STATUS = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'RESCHEDULED'] as const;

export class UpdateConsultationDto {
  @ApiPropertyOptional({ enum: STATUS })
  @IsOptional() @IsIn(STATUS as unknown as string[])
  status?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  meetingUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(5)
  rating?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  comment?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isPaid?: boolean;
}
