import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL ?? '/api/v1';

export function useTelegramAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    const initDataRaw: string | undefined = tg?.initData;

    if (\!initDataRaw) {
      setError('no_init_data (Telegram WebApp tashqarisida ochilgan?)');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/tg-auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: initDataRaw }),
        });
        if (\!res.ok) {
          const body = await res.text();
          throw new Error(`auth_failed_${res.status}: ${body}`);
        }
        const data = await res.json();
        setToken(data.token);
        // token'ni sessionga saqlash (localStorage WebApp'da ishlaydi):
        try {
          sessionStorage.setItem('medsmart_jwt', data.token);
        } catch {
          /* ignore */
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { token, error, loading };
}
