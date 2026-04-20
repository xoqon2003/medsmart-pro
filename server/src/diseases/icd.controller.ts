import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DiseasesService } from './diseases.service';
import { IcdLookupResponseDto } from './dto/disease-response.dto';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';

/**
 * `/api/v1/icd/:code` — ICD kod orqali kasallik slug/id qaytaradi.
 * Alohida controller'da, chunki URL path prefix `/icd/` — `/diseases/` emas.
 */
@ApiTags('diseases')
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@UseGuards(FeatureFlagGuard)
@Controller('icd')
export class IcdController {
  constructor(private readonly service: DiseasesService) {}

  @Get(':code')
  @ApiOperation({ summary: 'ICD kod bo\'yicha kasallik qidirish' })
  @ApiParam({ name: 'code', example: 'I10' })
  @ApiResponse({ status: 200, type: IcdLookupResponseDto })
  @ApiResponse({ status: 404, description: 'ICD kod topilmadi yoki feature disabled' })
  async lookup(@Param('code') code: string) {
    return this.service.findByIcd(code);
  }
}
