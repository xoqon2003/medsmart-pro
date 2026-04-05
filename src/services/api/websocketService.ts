import { getAuthToken } from './apiClient';

type EventHandler = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * WebSocket ulanishni boshlash
   */
  connect() {
    const token = getAuthToken();
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/ws?token=${token}`;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        console.log('[WS] Ulandi');
      };

      this.socket.onmessage = (event) => {
        try {
          const { event: eventName, data } = JSON.parse(event.data);
          this.emit(eventName, data);
        } catch {
          // JSON parse xatosi
        }
      };

      this.socket.onclose = () => {
        console.log('[WS] Uzildi');
        this.tryReconnect();
      };

      this.socket.onerror = () => {
        // onclose ham chaqiriladi
      };
    } catch {
      this.tryReconnect();
    }
  }

  /**
   * Qayta ulanish
   */
  private tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  /**
   * Uzilish
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.handlers.clear();
  }

  /**
   * Event ga obuna bo'lish
   */
  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Obunani bekor qilish funksiyasi
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  /**
   * Event ni ishga tushirish
   */
  private emit(event: string, data: any) {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(data));
    }
  }
}

export const wsService = new WebSocketService();
