import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ExtrasService } from './extras.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('extras')
export class ExtrasController {
  constructor(private service: ExtrasService) {}

  // ─── Anonymous Number ───────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('anonymous-number')
  getAnonymousNumber(@Request() req: any) {
    return this.service.getAnonymousNumber(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Post('anonymous-number')
  upsertAnonymousNumber(@Request() req: any, @Body() data: any) {
    return this.service.upsertAnonymousNumber(req.user.sub, data);
  }

  // ─── Call Schedule ──────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('call-schedule')
  getCallSchedule(@Request() req: any) {
    return this.service.getCallSchedule(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Post('call-schedule')
  upsertCallSchedule(@Request() req: any, @Body() data: any) {
    return this.service.upsertCallSchedule(req.user.sub, data);
  }

  // ─── Telegram Bot ───────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('telegram-bot')
  getTelegramBot(@Request() req: any) {
    return this.service.getTelegramBot(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Post('telegram-bot')
  upsertTelegramBot(@Request() req: any, @Body() data: any) {
    return this.service.upsertTelegramBot(req.user.sub, data);
  }

  // ─── Ad Settings ────────────────────────────────────────────────────────────

  @UseGuards(JwtGuard)
  @Get('ad-settings')
  getAdSettings(@Request() req: any) {
    return this.service.getAdSettings(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Post('ad-settings')
  upsertAdSettings(@Request() req: any, @Body() data: any) {
    return this.service.upsertAdSettings(req.user.sub, data);
  }
}
