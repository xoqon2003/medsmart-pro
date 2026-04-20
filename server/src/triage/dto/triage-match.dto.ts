import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export type AnswerValue = 'YES' | 'NO' | 'SOMETIMES' | 'UNKNOWN';
const ANSWER_VALUES: AnswerValue[] = ['YES', 'NO', 'SOMETIMES', 'UNKNOWN'];

/**
 * POST /api/v1/triage/match — yangi format DTO.
 *
 * `symptomAnswers` — marker kodlari kalitlari bo'lgan xarita.
 * Masalan: `{ "CHEST_PAIN": "YES", "FEVER": "NO" }`
 */
export class TriageMatchDto {
  @ApiProperty({
    description: 'Simptom marker → javob xaritasi',
    example: { CHEST_PAIN: 'YES', SHORTNESS_OF_BREATH: 'YES', HEADACHE: 'NO' },
    type: 'object',
    additionalProperties: { enum: ANSWER_VALUES },
  })
  @IsObject()
  symptomAnswers!: Record<string, AnswerValue>;

  @ApiPropertyOptional({
    description: 'Aniq kasallik ID si. Berilmasa — barcha PUBLISHED kasalliklar skanerlanadi.',
  })
  @IsOptional()
  @IsString()
  diseaseId?: string;
}

/**
 * Simptom javob validatsiyasi uchun yordamchi validator.
 * `TriageMatchDto.symptomAnswers` qiymatlarini tekshiradi.
 */
export function validateAnswerMap(
  answers: Record<string, AnswerValue>,
): string[] {
  return Object.entries(answers)
    .filter(([, v]) => !ANSWER_VALUES.includes(v as AnswerValue))
    .map(([k]) => k);
}

/**
 * `symptomAnswers` xaritasidan faqat 'YES' javob bergan markerlarni qaytaradi.
 */
export function extractPositiveMarkers(
  answers: Record<string, AnswerValue>,
): string[] {
  return Object.entries(answers)
    .filter(([, v]) => v === 'YES')
    .map(([k]) => k);
}

export { ANSWER_VALUES, IsIn };
