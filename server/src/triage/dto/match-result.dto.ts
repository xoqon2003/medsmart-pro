import { ApiProperty } from '@nestjs/swagger';

export class MatchResultDto {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  diseaseId!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty({ type: [String] })
  matchedSymptoms!: string[];

  @ApiProperty({ type: [String] })
  missingSymptoms!: string[];

  @ApiProperty()
  redFlagHit!: boolean;

  @ApiProperty()
  excludingHit!: boolean;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  expiresAt!: Date;
}
