import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateMedicalServiceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nameRu?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  priceFrom?: number;

  @IsOptional()
  @IsNumber()
  priceTo?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionRu?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  preparation?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
