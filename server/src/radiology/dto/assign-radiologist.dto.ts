import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRadiologistDto {
  @ApiProperty() @IsInt() @Min(1)
  radiologistId!: number;
}
