import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class AddClinicDto {
  @IsUUID()
  clinicId: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  cabinet?: string;

  @IsOptional()
  @IsNumber()
  floor?: number;
}
