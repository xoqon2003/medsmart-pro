import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SaveNoteDto {
  @ApiPropertyOptional({ description: 'Note in markdown format' })
  @IsOptional()
  @IsString()
  noteMd?: string;
}
