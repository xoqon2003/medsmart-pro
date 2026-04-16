import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Global ErrorBoundary — React render xatolarini ushlab qoladi.
 *
 * Foydalanish:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Unhandled promise rejection lari uchun main.tsx da
 * `window.addEventListener('unhandledrejection', ...)` ishlatiladi.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? 'Noma\'lum xato' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Production'da Sentry / analytics ga yuborilishi mumkin.
    // console.error bu yerda to'g'ri — monitoring log'i, debug emas.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800">
            Kutilmagan xato yuz berdi
          </h1>
          <p className="text-sm text-gray-500">
            Ilovada texnik muammo paydo bo'ldi. Sahifani yangilang — ko'pincha bu yordam beradi.
          </p>
          {import.meta.env.DEV && (
            <pre className="text-left text-xs bg-red-50 text-red-700 rounded-lg p-3 overflow-auto max-h-32">
              {this.state.message}
            </pre>
          )}
          <button
            onClick={this.handleReload}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Sahifani yangilash
          </button>
        </div>
      </div>
    );
  }
}
