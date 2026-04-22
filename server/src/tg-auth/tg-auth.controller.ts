import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FeatureFlag, FeatureFlagGuard } from '../common/feature-flag.guard';
import { TgAuthService } from './tg-auth.service';
import { TgLoginDto } from './dto/tg-login.dto';

@ApiTags('tg-auth')
@UseGuards(FeatureFlagGuard)
@FeatureFlag('APP_FEATURE_TG_AUTH')
@Controller('tg-auth')
export class TgAuthController {
  constructor(private readonly svc: TgAuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Telegram initData orqali login — JWT qaytaradi',
  })
  login(@Body() dto: TgLoginDto) {
    return this.svc.loginFromInitData(dto.initData);
  }
}
