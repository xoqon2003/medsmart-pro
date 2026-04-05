import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  institutionName: string;

  @IsOptional()
  @IsString()
  faculty?: string;

  @IsString()
  degree: string; // BACHELOR, MASTER, PHD, DSC, RESIDENCY, ORDINATURA

  @IsNumber()
  @Min(1950)
  startYear: number;

  @IsOptional()
  @IsNumber()
  @Min(1950)
  endYear?: number;

  @IsOptional()
  @IsString()
  diplomaNumber?: string;
}
