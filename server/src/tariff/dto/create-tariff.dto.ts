import { IsString, IsOptional, IsNumber, IsObject, IsEnum, Min } from 'class-validator';
import { TariffCode } from '@prisma/client';

export class CreateTariffDto {
  @IsString()
  name: string;

  @IsEnum(TariffCode)
  code: TariffCode;

  @IsNumber()
  @Min(0)
  price: number;

  @IsObject()
  features: object;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
