import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveDto {
  @ApiPropertyOptional({ description: 'Tasdiqlovchi imzosi (matn)', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  signature?: string;
}
