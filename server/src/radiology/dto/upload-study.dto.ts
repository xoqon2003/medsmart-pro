import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadStudyDto {
  @ApiProperty() @IsString() bucket!: string;
  @ApiProperty() @IsString() path!: string;
  @ApiProperty() @IsString() mimeType!: string;
  @ApiProperty() @IsInt() @Min(1) sizeBytes!: number;
  @ApiProperty() @IsString() originalName!: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  scanDate?: string;
}
