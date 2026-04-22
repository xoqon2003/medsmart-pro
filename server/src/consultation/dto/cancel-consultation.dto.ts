import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelConsultationDto {
  @ApiProperty() @IsString() @MinLength(3)
  reason!: string;
}
