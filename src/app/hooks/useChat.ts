import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// ── Tiplar ────────────────────────────────────────────────────────────────────

export type ChatMessageType = 'TEXT' | 'TRIAGE_RESULT' | 'FILE';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: number;
  senderName: string;
  content: string;
  type: ChatMessageType;
  createdAt: string;
}

export interface TypingIndicator {
  roomId: string;
  userId: number;
  userName: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  typingUser: string | null; // "Dr. Aliyev yozmoqda..."
  connected: boolean;
  sendMessage: (content: string, type?: ChatMessageType) => void;
  sendTyping: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useChat — Socket.io orqali real-time chat.
 *
 * @param roomId - xona identifikatori: "consultation_42", "visit_7", va h.k.
 *
 * Lifecycle:
 *  - mount: socket.io ulanishi yaratiladi, join_room yuboriladi
 *  - unmount: socket.disconnect() chaqiriladi
 *
 * Auth: localStorage-dagi "token" JWT orqali.
 */
export function useChat(roomId: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const apiUrl = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '';

    const socket = io(`${apiUrl}/chat`, {
      auth: { token: localStorage.getItem('token') ?? '' },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_room', roomId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('room_history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('receive_message', (msg: ChatMessage) => {
      setMessages((prev) => {
        // Takrorlanishning oldini olish
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('typing_indicator', (indicator: TypingIndicator) => {
      setTypingUser(`${indicator.userName} yozmoqda...`);

      // 3 soniyadan keyin tozalaymiz
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingUser(null), 3000);
    });

    socket.on('error', (err: { message: string }) => {
      console.error('[useChat] socket error:', err.message);
    });

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (content: string, type: ChatMessageType = 'TEXT') => {
      const socket = socketRef.current;
      if (!socket || !content.trim()) return;

      socket.emit('send_message', { roomId, content: content.trim(), type });
    },
    [roomId],
  );

  const sendTyping = useCallback(() => {
    socketRef.current?.emit('typing', roomId);
  }, [roomId]);

  return { messages, typingUser, connected, sendMessage, sendTyping };
}
