import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  category: string; // COMPLAINT, SYMPTOM, FOLLOW_UP

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
