import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private eskizToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private readonly baseUrl = 'https://notify.eskiz.uz/api';
  private readonly email = process.env.ESKIZ_EMAIL || '';
  private readonly password = process.env.ESKIZ_PASSWORD || '';

  /**
   * Eskiz.uz API ga autentifikatsiya
   */
  private async authenticate(): Promise<string> {
    if (this.eskizToken && Date.now() < this.tokenExpiresAt) {
      return this.eskizToken;
    }

    if (!this.email || !this.password) {
      this.logger.warn('Eskiz.uz credentials sozlanmagan — mock rejimda ishlaydi');
      return 'mock-token';
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password }),
      });

      const data = await response.json();
      if (data.data?.token) {
        this.eskizToken = data.data.token;
        // Token 30 kunlik, lekin 29 kunda yangilaymiz
        this.tokenExpiresAt = Date.now() + 29 * 24 * 60 * 60 * 1000;
        return this.eskizToken!;
      }

      throw new Error(data.message || 'Eskiz auth xatosi');
    } catch (error) {
      this.logger.error(`Eskiz auth xatosi: ${error.message}`);
      throw error;
    }
  }

  /**
   * SMS jo'natish
   */
  async sendSms(phone: string, message: string): Promise<boolean> {
    // Mock rejim (credentials yo'q bo'lsa)
    if (!this.email || !this.password) {
      this.logger.warn(`[MOCK SMS] ${phone}: ${message}`);
      return true;
    }

    try {
      const token = await this.authenticate();

      // Telefon raqamdan + belgisini olib tashlash
      const cleanPhone = phone.replace('+', '');

      const response = await fetch(`${this.baseUrl}/message/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile_phone: cleanPhone,
          message,
          from: '4546', // Eskiz default sender
        }),
      });

      const data = await response.json();
      if (data.status === 'waiting' || data.status === 'success') {
        this.logger.log(`SMS yuborildi: ${phone}`);
        return true;
      }

      this.logger.error(`SMS xatosi: ${JSON.stringify(data)}`);
      return false;
    } catch (error) {
      this.logger.error(`SMS yuborishda xato: ${error.message}`);
      return false;
    }
  }

  /**
   * OTP SMS jo'natish
   */
  async sendOtp(phone: string, code: string): Promise<boolean> {
    const message = `MedSmart Pro: Sizning tasdiqlash kodingiz: ${code}. 5 daqiqa ichida foydalaning.`;
    return this.sendSms(phone, message);
  }
}
