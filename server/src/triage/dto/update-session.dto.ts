import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export type MatchSessionStatusValue = 'ACTIVE' | 'ARCHIVED' | 'EXPIRED';

export class UpdateSessionDto {
  @ApiPropertyOptional({ enum: ['ACTIVE', 'ARCHIVED', 'EXPIRED'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'ARCHIVED', 'EXPIRED'])
  status?: MatchSessionStatusValue;

  /**
   * Simptom javoblarini DB ga saqlaydi.
   * Kalit — symptom kodi (masalan, "FEVER"), qiymat — AnswerValue.
   * Debounced frontend sync tomonidan yuboriladi.
   */
  @ApiPropertyOptional({
    description: 'Simptom javoblari (code → YES/NO/SOMETIMES/UNKNOWN)',
    example: { FEVER: 'YES', COUGH: 'NO' },
  })
  @IsOptional()
  @IsObject()
  userAnswers?: Record<string, string>;

  /**
   * Shifokorning tavsiyasi / izohi (faqat DOCTOR rolida).
   * Bemorga ko'rsatiladigan matn xabar.
   */
  @ApiPropertyOptional({
    description: "Shifokorning tavsiyasi (markdown, max 2000 belgi)",
    example: "Qo'shimcha tekshiruvlar kerak: EKG, qon tahlili. Kasalxonaga yotqizish tavsiya qilinadi.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  doctorNote?: string;
}
