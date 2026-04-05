import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export class AddOperationTypeDto {
  @IsString()
  operationCode: string;

  @IsString()
  operationName: string;

  @IsOptional()
  @IsString()
  operationNameRu?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsEnum(['SIMPLE', 'MEDIUM', 'COMPLEX', 'VERY_COMPLEX'])
  complexity?: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'VERY_COMPLEX';

  @IsOptional()
  @IsNumber()
  @Min(1)
  avgDurationMin?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
