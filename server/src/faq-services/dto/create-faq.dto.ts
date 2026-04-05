import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateFaqDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsString()
  questionRu?: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsString()
  answerRu?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
