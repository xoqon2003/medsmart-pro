import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export type AnswerValue = 'YES' | 'NO' | 'UNKNOWN' | 'SOMETIMES';
const ANSWER_VALUES: AnswerValue[] = ['YES', 'NO', 'UNKNOWN', 'SOMETIMES'];

export class SymptomAnswerDto {
  @ApiProperty({ example: 'HEADACHE' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: ANSWER_VALUES })
  @IsIn(ANSWER_VALUES)
  answer!: AnswerValue;
}

export class MatchRequestDto {
  @ApiProperty({ type: [SymptomAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SymptomAnswerDto)
  userSymptoms!: SymptomAnswerDto[];

  @ApiPropertyOptional({
    description: 'Specific disease ID to match against. If omitted, scans all PUBLISHED diseases.',
  })
  @IsOptional()
  @IsString()
  diseaseId?: string;
}
