import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ClickProvider {
  private readonly logger = new Logger(ClickProvider.name);
  private readonly merchantId = process.env.CLICK_MERCHANT_ID || '';
  private readonly serviceId = process.env.CLICK_SERVICE_ID || '';
  private readonly secretKey = process.env.CLICK_SECRET_KEY || '';

  /**
   * To'lov havolasini yaratish
   */
  generatePaymentUrl(orderId: string, amount: number, returnUrl?: string): string {
    const baseUrl = 'https://my.click.uz/services/pay';
    const params = new URLSearchParams({
      service_id: this.serviceId,
      merchant_id: this.merchantId,
      amount: amount.toString(),
      transaction_param: orderId,
    });

    if (returnUrl) {
      params.set('return_url', returnUrl);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Prepare webhook — Click to'lov boshlashdan oldin chaqiradi
   */
  handlePrepare(params: {
    click_trans_id: string;
    service_id: string;
    click_paydoc_id: string;
    merchant_trans_id: string;
    amount: string;
    action: string;
    sign_time: string;
    sign_string: string;
    error: string;
    error_note: string;
  }) {
    // Imzoni tekshirish
    const signString = [
      params.click_trans_id,
      params.service_id,
      this.secretKey,
      params.merchant_trans_id,
      params.amount,
      params.action,
      params.sign_time,
    ].join('');

    const expectedSign = crypto.createHash('md5').update(signString).digest('hex');

    if (expectedSign !== params.sign_string) {
      this.logger.warn(`Click prepare: noto'g'ri imzo`);
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: params.merchant_trans_id,
        merchant_prepare_id: null,
        error: -1,
        error_note: "Imzo noto'g'ri",
      };
    }

    this.logger.log(`Click prepare: order=${params.merchant_trans_id}, amount=${params.amount}`);

    return {
      click_trans_id: params.click_trans_id,
      merchant_trans_id: params.merchant_trans_id,
      merchant_prepare_id: Date.now(),
      error: 0,
      error_note: 'Success',
    };
  }

  /**
   * Complete webhook — Click to'lov tugagandan keyin chaqiradi
   */
  handleComplete(params: {
    click_trans_id: string;
    service_id: string;
    click_paydoc_id: string;
    merchant_trans_id: string;
    merchant_prepare_id: string;
    amount: string;
    action: string;
    sign_time: string;
    sign_string: string;
    error: string;
    error_note: string;
  }) {
    const signString = [
      params.click_trans_id,
      params.service_id,
      this.secretKey,
      params.merchant_trans_id,
      params.merchant_prepare_id,
      params.amount,
      params.action,
      params.sign_time,
    ].join('');

    const expectedSign = crypto.createHash('md5').update(signString).digest('hex');

    if (expectedSign !== params.sign_string) {
      this.logger.warn(`Click complete: noto'g'ri imzo`);
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: params.merchant_trans_id,
        merchant_confirm_id: null,
        error: -1,
        error_note: "Imzo noto'g'ri",
      };
    }

    this.logger.log(`Click complete: order=${params.merchant_trans_id}, amount=${params.amount}`);

    return {
      click_trans_id: params.click_trans_id,
      merchant_trans_id: params.merchant_trans_id,
      merchant_confirm_id: Date.now(),
      error: 0,
      error_note: 'Success',
    };
  }
}
