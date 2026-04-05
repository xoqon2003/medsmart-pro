import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UzumProvider {
  private readonly logger = new Logger(UzumProvider.name);
  private readonly terminalId = process.env.UZUM_TERMINAL_ID || '';
  private readonly cashId = process.env.UZUM_CASH_ID || '';
  private readonly secretKey = process.env.UZUM_SECRET_KEY || '';
  private readonly baseUrl = 'https://api.uzumbank.uz';

  /**
   * To'lov yaratish (initiate)
   */
  async createPayment(orderId: string, amount: number, description?: string): Promise<{
    paymentUrl: string;
    transactionId: string;
  }> {
    if (!this.terminalId || !this.secretKey) {
      this.logger.warn('Uzum credentials sozlanmagan — mock rejim');
      return {
        paymentUrl: `https://checkout.uzumbank.uz/mock?order=${orderId}&amount=${amount}`,
        transactionId: `uzum_mock_${Date.now()}`,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Terminal-Id': this.terminalId,
          'X-Secret-Key': this.secretKey,
        },
        body: JSON.stringify({
          terminalId: this.terminalId,
          cashId: this.cashId,
          amount: amount * 100, // tiyinlarda
          orderId,
          description: description || 'MedSmart Pro xizmati uchun to\'lov',
        }),
      });

      const data = await response.json();
      return {
        paymentUrl: data.paymentUrl || '',
        transactionId: data.transactionId || '',
      };
    } catch (error) {
      this.logger.error(`Uzum createPayment xatosi: ${error.message}`);
      throw error;
    }
  }

  /**
   * To'lov holatini tekshirish
   */
  async checkPayment(transactionId: string): Promise<{
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    amount?: number;
  }> {
    if (!this.terminalId || !this.secretKey) {
      return { status: 'pending' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/payment/status/${transactionId}`, {
        headers: {
          'X-Terminal-Id': this.terminalId,
          'X-Secret-Key': this.secretKey,
        },
      });

      const data = await response.json();
      return {
        status: data.status || 'pending',
        amount: data.amount,
      };
    } catch (error) {
      this.logger.error(`Uzum checkPayment xatosi: ${error.message}`);
      return { status: 'pending' };
    }
  }

  /**
   * Webhook handler
   */
  handleWebhook(body: any) {
    this.logger.log(`Uzum webhook: ${JSON.stringify(body)}`);

    // Webhook imzosini tekshirish
    // TODO: Uzum webhook signature verification

    return { status: 'ok' };
  }
}
