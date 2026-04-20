import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * OpenAPI-friendly DTOs for the red-flag rule catalogue.
 *
 * `RuleConditionDto` is an *open* schema — we document the three node kinds
 * prose-only (Swagger cannot express discriminated unions well). The
 * backend never re-evaluates the tree; it only stores/returns it for the
 * client-side `evaluateRedFlags()` to consume. Shape mismatch would be
 * caught by the frontend contract tests, not the backend validator.
 */

export class RuleConditionDto {
  @ApiProperty({
    enum: ['symptom', 'and', 'or'],
    description: 'Discriminator — leaf condition or boolean composition.',
  })
  kind!: 'symptom' | 'and' | 'or';

  @ApiPropertyOptional({ description: 'Symptom code (for leaf nodes).' })
  code?: string;

  @ApiPropertyOptional({
    enum: ['YES', 'NO', 'UNKNOWN'],
    description: 'Target answer for leaf (default YES).',
  })
  answer?: 'YES' | 'NO' | 'UNKNOWN';

  @ApiPropertyOptional({
    type: () => [RuleConditionDto],
    description: 'Child conditions (for `and`/`or` nodes).',
  })
  conditions?: RuleConditionDto[];
}

export class RedFlagRuleDto {
  @ApiProperty() id!: string;
  @ApiProperty() ruleKey!: string;
  @ApiProperty() nameKey!: string;
  @ApiProperty() actionKey!: string;
  @ApiProperty({ enum: ['CRITICAL', 'HIGH', 'MODERATE'] })
  severity!: 'CRITICAL' | 'HIGH' | 'MODERATE';

  @ApiProperty({ type: [String] })
  applicableCategories!: string[];

  @ApiProperty({ type: [String] })
  applicableIcd10Prefixes!: string[];

  @ApiProperty({ type: () => RuleConditionDto })
  condition!: RuleConditionDto;

  @ApiPropertyOptional() sourceCitation?: string | null;

  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
