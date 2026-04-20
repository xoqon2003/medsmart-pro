import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class RejectDto {
  @ApiProperty({
    description: 'Rad etish sababi (majburiy, min 10 belgi)',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  reason!: string;
}
