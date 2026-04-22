import { createHmac } from 'crypto';
import { verifyInitData } from '../src/verify';

const BOT_TOKEN = '123456:test-token-abc';

function signInitData(
  fields: Record<string, string>,
  botToken = BOT_TOKEN,
): string {
  const entries = Object.entries(fields).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  const params = new URLSearchParams(fields);
  params.append('hash', hash);
  return params.toString();
}

describe('verifyInitData', () => {
  it('valid payload → ok', () => {
    const initData = signInitData({
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 42, first_name: 'Ali' }),
    });
    const res = verifyInitData(initData, BOT_TOKEN);
    expect(res.ok).toBe(true);
    expect(res.user?.id).toBe(42);
  });

  it('no hash → no_hash', () => {
    const res = verifyInitData('auth_date=1', BOT_TOKEN);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('no_hash');
  });

  it('wrong token → hash_mismatch', () => {
    const initData = signInitData({
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify({ id: 42, first_name: 'Ali' }),
    });
    const res = verifyInitData(initData, 'wrong-token');
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('hash_mismatch');
  });

  it('eski auth_date → expired', () => {
    const initData = signInitData({
      auth_date: String(Math.floor(Date.now() / 1000) - 7200),
      user: JSON.stringify({ id: 42, first_name: 'Ali' }),
    });
    const res = verifyInitData(initData, BOT_TOKEN, 3600);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('expired');
  });

  it('bad user JSON → bad_user_json', () => {
    const initData = signInitData({
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: '{ not json',
    });
    const res = verifyInitData(initData, BOT_TOKEN);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('bad_user_json');
  });
});
