import { useRegisterSW } from 'virtual:pwa-register/react';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-card border rounded-lg shadow-lg p-4 flex items-center justify-between gap-3 max-w-sm mx-auto">
      <p className="text-sm">Yangi versiya mavjud!</p>
      <div className="flex gap-2">
        <button
          onClick={() => setNeedRefresh(false)}
          className="text-xs text-muted-foreground"
        >
          Keyinroq
        </button>
        <button
          onClick={() => updateServiceWorker(true)}
          className="text-xs font-medium text-primary"
        >
          Yangilash
        </button>
      </div>
    </div>
  );
}
