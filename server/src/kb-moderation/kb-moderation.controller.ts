import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { KbModerationService } from './kb-moderation.service';
import { SubmitReviewDto } from './dto/submit-review.dto';
import { ApproveDto } from './dto/approve.dto';
import { RejectDto } from './dto/reject.dto';
import { ReviewQueueQueryDto } from './dto/review-queue-query.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';

interface ReqUser {
  user?: { sub: number; role: string };
}

@ApiTags('kb-moderation')
@ApiBearerAuth()
@FeatureFlag('APP_FEATURE_DISEASE_KB')
@UseGuards(FeatureFlagGuard, JwtGuard, RolesGuard)
@Controller('kb')
export class KbModerationController {
  constructor(private readonly service: KbModerationService) {}

  private caller(req: ReqUser) {
    if (!req.user) {
      throw new Error('JwtGuard did not populate user');
    }
    return { id: req.user.sub, role: req.user.role };
  }

  // ── Transitions ──────────────────────────────────────────────────────────

  @Post('blocks/:id/submit-review')
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiOperation({ summary: 'Blokni ko\'rib chiqishga yuborish (DRAFT/REJECTED → REVIEW)' })
  @ApiResponse({ status: 201 })
  async submitReview(
    @Param('id') id: string,
    @Body() dto: SubmitReviewDto,
    @Req() req: ReqUser,
  ) {
    return this.service.submitReview(id, this.caller(req), dto.note);
  }

  @Post('blocks/:id/approve')
  @Roles('MEDICAL_EDITOR', 'ADMIN')
  @ApiOperation({ summary: 'Blokni tasdiqlash (REVIEW → APPROVED)' })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveDto,
    @Req() req: ReqUser,
  ) {
    return this.service.approve(id, this.caller(req), dto.signature);
  }

  @Post('blocks/:id/reject')
  @Roles('MEDICAL_EDITOR', 'ADMIN')
  @ApiOperation({ summary: 'Blokni rad etish (REVIEW → REJECTED)' })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectDto,
    @Req() req: ReqUser,
  ) {
    return this.service.reject(id, this.caller(req), dto.reason);
  }

  @Post('blocks/:id/publish')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Blokni chop etish (APPROVED → PUBLISHED)' })
  async publish(@Param('id') id: string, @Req() req: ReqUser) {
    return this.service.publish(id, this.caller(req));
  }

  @Post('blocks/:id/archive')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Blokni arxivlash (→ ARCHIVED)' })
  async archive(@Param('id') id: string, @Req() req: ReqUser) {
    return this.service.archive(id, this.caller(req));
  }

  // ── Queries ──────────────────────────────────────────────────────────────

  @Get('review-queue')
  @Roles('MEDICAL_EDITOR', 'ADMIN')
  @ApiOperation({ summary: 'REVIEW statusidagi bloklar navbati' })
  async reviewQueue(@Query() q: ReviewQueueQueryDto) {
    return this.service.getReviewQueue(q.page ?? 1, q.limit ?? 20);
  }

  @Get('history/:blockId')
  @Roles('EDITOR', 'MEDICAL_EDITOR', 'ADMIN')
  @ApiOperation({ summary: 'Blok uchun tahrir tarixi' })
  async history(@Param('blockId') blockId: string) {
    return this.service.getHistory(blockId);
  }

  // ── Admin tools ──────────────────────────────────────────────────────────

  @Post('admin/lifecycle-scan')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lifecycle scan manual trigger (12 oy lik stale bloklarni topadi)' })
  async lifecycleScan() {
    return this.service.runLifecycleScan(12);
  }
}
