import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface PaymeTransaction {
  id: string;
  amount: number;
  state: number; // 1=created, 2=completed, -1=cancelled, -2=cancelled_after_complete
  create_time: number;
  perform_time?: number;
  cancel_time?: number;
  reason?: number;
}

@Injectable()
export class PaymeProvider {
  private readonly logger = new Logger(PaymeProvider.name);
  private readonly merchantId = process.env.PAYME_MERCHANT_ID || '';
  private readonly merchantKey = process.env.PAYME_MERCHANT_KEY || '';
  private readonly testMode = process.env.PAYME_TEST_MODE === 'true';
  private readonly baseUrl = process.env.PAYME_TEST_MODE === 'true'
    ? 'https://checkout.test.paycom.uz'
    : 'https://checkout.paycom.uz';

  /**
   * To'lov havolasini yaratish (redirect URL)
   */
  generatePaymentUrl(orderId: string, amount: number, description?: string): string {
    // Amount tiyinlarda (1 UZS = 100 tiyin)
    const amountInTiyin = amount * 100;

    const params = Buffer.from(
      `m=${this.merchantId};ac.order_id=${orderId};a=${amountInTiyin}` +
      (description ? `;ct=1000;cr=860` : ''),
    ).toString('base64');

    return `${this.baseUrl}/${params}`;
  }

  /**
   * Webhook so'rovini tekshirish (Authorization header)
   */
  verifyWebhookAuth(authHeader: string): boolean {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return false;
    }

    const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
    const [login, password] = credentials.split(':');

    return login === 'Paycom' && password === this.merchantKey;
  }

  /**
   * JSON-RPC webhook handler
   * Payme JSON-RPC 2.0 protokolidan foydalanadi
   */
  handleWebhook(method: string, params: any): any {
    switch (method) {
      case 'CheckPerformTransaction':
        return this.checkPerformTransaction(params);
      case 'CreateTransaction':
        return this.createTransaction(params);
      case 'PerformTransaction':
        return this.performTransaction(params);
      case 'CancelTransaction':
        return this.cancelTransaction(params);
      case 'CheckTransaction':
        return this.checkTransaction(params);
      default:
        throw new BadRequestException(`Unknown method: ${method}`);
    }
  }

  private checkPerformTransaction(params: any) {
    // To'lov qilish mumkinligini tekshirish
    const orderId = params.account?.order_id;
    const amount = params.amount;

    if (!orderId) {
      return { error: { code: -31050, message: { uz: 'Buyurtma raqami topilmadi' } } };
    }

    // TODO: DB dan orderni tekshirish
    return { result: { allow: true } };
  }

  private createTransaction(params: any) {
    this.logger.log(`Payme CreateTransaction: ${JSON.stringify(params)}`);
    return {
      result: {
        create_time: Date.now(),
        transaction: params.id,
        state: 1,
      },
    };
  }

  private performTransaction(params: any) {
    this.logger.log(`Payme PerformTransaction: ${params.id}`);
    return {
      result: {
        transaction: params.id,
        perform_time: Date.now(),
        state: 2,
      },
    };
  }

  private cancelTransaction(params: any) {
    this.logger.log(`Payme CancelTransaction: ${params.id}, reason: ${params.reason}`);
    return {
      result: {
        transaction: params.id,
        cancel_time: Date.now(),
        state: -1,
      },
    };
  }

  private checkTransaction(params: any) {
    return {
      result: {
        create_time: Date.now(),
        perform_time: 0,
        cancel_time: 0,
        transaction: params.id,
        state: 1,
        reason: null,
      },
    };
  }
}
