import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nameRu?: string;

  @IsString()
  group: string; // SCIENTIFIC, PRACTICAL, ORGANIZATIONAL, INTERNATIONAL, STATE

  @IsNumber()
  @Min(1950)
  year: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  stickerType?: string; // GOLD, SILVER, BRONZE, SPECIAL
}
