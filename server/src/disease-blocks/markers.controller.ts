import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CANONICAL_MARKERS } from '../diseases/markers/markers';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';

/**
 * `GET /api/v1/markers` — canonical marker ro'yxati (static).
 * Frontend blok tanlash formasida ishlatadi.
 */
@ApiTags('disease-blocks')
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@UseGuards(FeatureFlagGuard)
@Controller('markers')
export class MarkersController {
  @Get()
  @ApiOperation({ summary: "Canonical marker ro'yxati" })
  @ApiResponse({ status: 200, schema: { example: { items: [...CANONICAL_MARKERS] } } })
  list() {
    return { items: [...CANONICAL_MARKERS] };
  }
}
