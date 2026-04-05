import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

@Injectable()
export class TelegramValidator {
  private readonly botToken: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
  }

  /**
   * Telegram WebApp.initData ni tekshirish
   * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
   */
  validate(initData: string): TelegramUser {
    if (!this.botToken) {
      throw new UnauthorizedException('Telegram bot token sozlanmagan');
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      throw new UnauthorizedException('Telegram hash topilmadi');
    }

    // hash ni olib tashlab, qolgan parametrlarni saralash
    params.delete('hash');
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // HMAC-SHA256 orqali tekshirish
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(this.botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      throw new UnauthorizedException("Telegram initData imzosi noto'g'ri");
    }

    // auth_date tekshiruvi (24 soatdan oshmasligi kerak)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      throw new UnauthorizedException('Telegram sessiya muddati tugagan');
    }

    // User ma'lumotlarini olish
    const userStr = params.get('user');
    if (!userStr) {
      throw new UnauthorizedException('Telegram user ma\'lumoti topilmadi');
    }

    try {
      return JSON.parse(userStr) as TelegramUser;
    } catch {
      throw new UnauthorizedException('Telegram user ma\'lumoti buzilgan');
    }
  }
}
