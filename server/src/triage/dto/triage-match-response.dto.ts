import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UrgencyLevel } from '../red-flag-rules';

/**
 * Red-flag qoidasining API javob shakli.
 * `RedFlagRule` interfeysini aynan aks ettiradi (Swagger uchun class).
 */
export class RedFlagRuleDto {
  @ApiProperty({ example: 'RF-001' })
  id!: string;

  @ApiProperty({ type: [String], example: ['CHEST_PAIN', 'SHORTNESS_OF_BREATH'] })
  symptomMarkers!: string[];

  @ApiProperty({ example: 2 })
  minMatchCount!: number;

  @ApiProperty({ example: 'Miokard infarkti shubhasi' })
  conditionLabel!: string;

  @ApiPropertyOptional({ example: 'Подозрение на инфаркт миокарда' })
  conditionLabelRu?: string;

  @ApiProperty({ enum: ['IMMEDIATE', 'URGENT', 'SOON'], example: 'IMMEDIATE' })
  urgencyLevel!: UrgencyLevel;

  @ApiProperty({ example: true })
  callEmergency!: boolean;

  @ApiProperty({ example: 'Ko\'krak og\'rig\'i va nafas qisilishi jiddiy belgi. Darhol 103 ga qo\'ng\'iroq qiling!' })
  messageUz!: string;

  @ApiPropertyOptional({ type: [String], example: ['I21', 'I22'] })
  icd10Hints?: string[];
}

/**
 * Match natijasining bitta yozuvi (har bir kasallik uchun).
 */
export class MatchDetailDto {
  @ApiProperty({ example: 'dis-uuid-1234' })
  diseaseId!: string;

  @ApiProperty({ example: 0.87, description: '0..1 oralig\'ida mos kelish balli' })
  score!: number;

  @ApiProperty({ type: [String] })
  matchedSymptoms!: string[];

  @ApiProperty({ type: [String] })
  missingSymptoms!: string[];

  @ApiProperty({ description: 'Kasallik belgisida red-flag simptomi bor-yo\'qligi' })
  redFlagHit!: boolean;

  @ApiProperty({ description: 'Istisno simptom aniqlandi' })
  excludingHit!: boolean;
}

/**
 * POST /api/v1/triage/match — to'liq javob.
 */
export class TriageMatchResponseDto {
  @ApiProperty({ example: 'session-uuid-5678' })
  sessionId!: string;

  @ApiProperty({ example: 0.87 })
  score!: number;

  @ApiProperty({ type: [MatchDetailDto] })
  matchDetails!: MatchDetailDto[];

  @ApiProperty({
    type: [RedFlagRuleDto],
    description: 'Mos kelgan red-flag qoidalari (urgency bo\'yicha tartiblangan). Bo\'sh bo\'lishi mumkin.',
  })
  redFlags!: RedFlagRuleDto[];

  @ApiProperty({ example: 'session-uuid-5678' })
  sessionId2?: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty()
  expiresAt!: Date;
}
