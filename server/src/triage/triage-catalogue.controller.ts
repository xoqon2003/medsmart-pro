import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/jwt.guard';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';
import { TriageCatalogueService } from './triage-catalogue.service';
import { RedFlagRuleDto } from './dto/red-flag-rule.dto';
import { CatalogueQueryDto } from './dto/catalogue-query.dto';

/**
 * REST API for the triage red-flag rule catalogue (GAP-04c).
 *
 * Calculators + broader clinical tools migrated to `/clinical-tools`
 * (`ClinicalToolsController`) in GAP-05d — this controller is
 * red-flag-only now.
 *
 * Gated behind `APP_FEATURE_DISEASE_KB` per CLAUDE.md §Loyiha qoidalari.5.
 */
@ApiTags('triage-catalogue')
@ApiBearerAuth()
@UseGuards(JwtGuard, FeatureFlagGuard)
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@Controller('triage')
export class TriageCatalogueController {
  constructor(private readonly service: TriageCatalogueService) {}

  @Get('red-flag-rules')
  @ApiOperation({
    summary: 'List active red-flag rules (optionally scoped by disease).',
    description:
      'When `category` and/or `icd10` are passed, only rules whose scope '
      + 'matches (AND semantics, plus the GLOBAL rules) are returned. Unscoped '
      + 'calls return every active rule, useful for the admin UI.',
  })
  @ApiOkResponse({ type: [RedFlagRuleDto] })
  listRules(@Query() query: CatalogueQueryDto): Promise<RedFlagRuleDto[]> {
    return this.service.listRules(query);
  }

  @Get('red-flag-rules/:ruleKey')
  @ApiOperation({ summary: 'Fetch a single red-flag rule by its stable key.' })
  @ApiParam({ name: 'ruleKey', example: 'rule.unstable-af' })
  @ApiOkResponse({ type: RedFlagRuleDto })
  getRule(@Param('ruleKey') ruleKey: string): Promise<RedFlagRuleDto> {
    return this.service.getRuleByKey(ruleKey);
  }
}
