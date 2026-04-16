import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { ErrorBoundary } from './app/components/ErrorBoundary.tsx';
import './styles/index.css';

// Unhandled Promise rejection lari uchun global handler.
// React ErrorBoundary faqat render xatolarini ushlab qoladi —
// async xatolar (fetch, setTimeout ichidagi throw) bu yerda ushlanadi.
window.addEventListener('unhandledrejection', (event) => {
  // eslint-disable-next-line no-console
  console.error('[UnhandledRejection]', event.reason);
  // TODO: production'da Sentry yoki boshqa monitoring ga yuborish:
  // Sentry.captureException(event.reason);
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
