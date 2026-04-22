import { useEffect } from 'react';
import { useTelegramAuth } from './hooks/useTelegramAuth';

export function App() {
  const { token, error, loading } = useTelegramAuth();

  useEffect(() => {
    // Telegram WebApp ready signal
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Yuklanmoqda...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>Xatolik: {error}</div>;
  if (\!token) return <div style={{ padding: 16 }}>Autentifikatsiyadan o'tilmadi</div>;

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>MedSmart-Pro</h1>
      <p>Xush kelibsiz\! Siz Telegram orqali kirdingiz.</p>
      <p style={{ fontSize: 12, color: '#888', marginTop: 12 }}>
        Token: {token.slice(0, 20)}...
      </p>
      {/* TODO: routing va ekranlar */}
    </div>
  );
}
