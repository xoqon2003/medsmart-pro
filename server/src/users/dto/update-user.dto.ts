import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum GenderEnum {
  MALE   = 'MALE',
  FEMALE = 'FEMALE',
}

enum LanguageEnum {
  UZ = 'UZ',
  RU = 'RU',
  EN = 'EN',
}

/**
 * Foydalanuvchi profil yangilash uchun DTO.
 *
 * Quyidagi maydonlar FAQAT tizim tomonidan o'zgartiriladi va
 * bu DTO orqali qabul qilinmaydi: id, telegramId, username, pin,
 * role, isActive, rating, totalConclusions, isOnline, lastSeenAt,
 * verificationStatus, createdAt.
 */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Karimov Aziz Baxtiyorovich' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  fullName?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, { message: 'Telefon raqami noto\'g\'ri formatda' })
  phone?: string;

  @ApiPropertyOptional({ enum: GenderEnum })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @ApiPropertyOptional({ example: '1990-05-15' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'birthDate YYYY-MM-DD formatida bo\'lishi kerak' })
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Toshkent' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  city?: string;

  @ApiPropertyOptional({ example: 'Gipertoniya, diabet' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  chronicDiseases?: string;

  @ApiPropertyOptional({ enum: LanguageEnum })
  @IsOptional()
  @IsEnum(LanguageEnum)
  language?: LanguageEnum;

  @ApiPropertyOptional({ example: 'AK' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  avatar?: string;

  // ── Shifokor uchun ────────────────────────────────────────────────────────

  @ApiPropertyOptional({ example: 'UZ-RAD-2023-0042' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  license?: string;

  @ApiPropertyOptional({ example: 'MRT, MSKT, Rentgenologiya' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  specialty?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  experience?: number;

  @ApiPropertyOptional({ example: 'dr-aziz-karimov' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]{3,64}$/, { message: 'profileUrl faqat kichik harf, raqam va "-" bo\'lishi mumkin' })
  profileUrl?: string;
}
