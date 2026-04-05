import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nameRu?: string;

  @IsString()
  organization: string;

  @IsString()
  direction: string;

  @IsNumber()
  @Min(1950)
  year: number;

  @IsOptional()
  @IsString()
  certificateNum?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
