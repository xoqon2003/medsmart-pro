import { createHmac } from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface VerifyResult {
  ok: boolean;
  user?: TelegramUser;
  authDate?: number;
  reason?:
    | 'no_hash'
    | 'hash_mismatch'
    | 'no_auth_date'
    | 'expired'
    | 'bad_user_json';
}

/**
 * Telegram Mini-App initData'ni HMAC-SHA256 orqali tekshiradi.
 *
 * Algoritm (Telegram rasmiy hujjati):
 *   secret_key = HMAC_SHA256("WebAppData", bot_token)
 *   computed_hash = hex(HMAC_SHA256(secret_key, data_check_string))
 *   where data_check_string = key1=val1\nkey2=val2 (lexicographically sorted, hash excluded)
 *
 * @param initData  window.Telegram.WebApp.initData raw string
 * @param botToken  Telegram bot tokeni (faqat backend'da!)
 * @param maxAgeSec TTL sekundda (default 3600 = 1 soat)
 */
export function verifyInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 3600,
): VerifyResult {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'no_hash' };
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  if (computed !== hash) return { ok: false, reason: 'hash_mismatch' };

  const authDateStr = params.get('auth_date');
  if (!authDateStr) return { ok: false, reason: 'no_auth_date' };
  const authDate = Number(authDateStr);
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) {
    return { ok: false, reason: 'expired' };
  }

  let user: TelegramUser | undefined;
  const userJson = params.get('user');
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      return { ok: false, reason: 'bad_user_json' };
    }
  }

  return { ok: true, user, authDate };
}
