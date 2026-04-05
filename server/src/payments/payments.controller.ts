import { Controller, Post, Get, Param, Body, Headers, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtGuard } from '../auth/jwt.guard';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  /**
   * To'lov yaratish va provider ga yo'naltirish
   * POST /api/v1/payments/initiate
   */
  @UseGuards(JwtGuard)
  @Post('initiate')
  async initiate(@Body() data: { applicationId: number; amount: number; provider: string; returnUrl?: string }) {
    return this.service.initiate(data);
  }

  /**
   * To'lovni qo'lda tasdiqlash (naqd/karta)
   * POST /api/v1/payments/:id/confirm
   */
  @UseGuards(JwtGuard)
  @Post(':id/confirm')
  async confirm(@Param('id', ParseIntPipe) id: number) {
    return this.service.confirm(id);
  }

  /**
   * To'lovni qaytarish
   * POST /api/v1/payments/:id/refund
   */
  @UseGuards(JwtGuard)
  @Post(':id/refund')
  async refund(@Param('id', ParseIntPipe) id: number, @Body('reason') reason?: string) {
    return this.service.refund(id, reason);
  }

  /**
   * To'lov ma'lumotini olish
   * GET /api/v1/payments/:id
   */
  @UseGuards(JwtGuard)
  @Get(':id')
  async getPayment(@Param('id', ParseIntPipe) id: number) {
    return this.service.getPayment(id);
  }

  /**
   * Ariza bo'yicha to'lovni olish
   * GET /api/v1/payments/application/:applicationId
   */
  @UseGuards(JwtGuard)
  @Get('application/:applicationId')
  async getByApplication(@Param('applicationId', ParseIntPipe) applicationId: number) {
    return this.service.getByApplication(applicationId);
  }

  // ── Webhooks (tashqi providerlar chaqiradi) ───────────────────────────

  /**
   * Payme webhook (JSON-RPC)
   * POST /api/v1/payments/payme/webhook
   */
  @SkipThrottle()
  @Post('payme/webhook')
  async paymeWebhook(@Headers('authorization') auth: string, @Body() body: any) {
    return this.service.handlePaymeWebhook(auth, body);
  }

  /**
   * Click prepare webhook
   * POST /api/v1/payments/click/prepare
   */
  @SkipThrottle()
  @Post('click/prepare')
  async clickPrepare(@Body() body: any) {
    return this.service.handleClickPrepare(body);
  }

  /**
   * Click complete webhook
   * POST /api/v1/payments/click/complete
   */
  @SkipThrottle()
  @Post('click/complete')
  async clickComplete(@Body() body: any) {
    return this.service.handleClickComplete(body);
  }

  /**
   * Uzum Bank webhook
   * POST /api/v1/payments/uzum/webhook
   */
  @SkipThrottle()
  @Post('uzum/webhook')
  async uzumWebhook(@Body() body: any) {
    return this.service.handleUzumWebhook(body);
  }
}
