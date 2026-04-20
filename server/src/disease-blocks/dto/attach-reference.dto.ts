import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AttachReferenceDto {
  @ApiProperty({ description: 'Reference ID (uuid)' })
  @IsUUID()
  referenceId!: string;

  @ApiPropertyOptional({ description: 'Izoh' })
  @IsOptional()
  @IsString()
  note?: string;
}
