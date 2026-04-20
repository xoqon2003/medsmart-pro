import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SendToDoctorDto {
  @ApiProperty({ description: 'Doctor user ID', example: 42 })
  @IsInt()
  @Min(1)
  doctorId!: number;

  @ApiPropertyOptional({ description: 'Optional note to attach to the message' })
  @IsOptional()
  @IsString()
  note?: string;
}
