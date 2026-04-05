import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  organizationName: string;

  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsNumber()
  @Min(1950)
  startYear: number;

  @IsOptional()
  @IsNumber()
  @Min(1950)
  endYear?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
