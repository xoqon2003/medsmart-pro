import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Send, Wifi, WifiOff } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ChatBubble } from './ChatBubble';

interface ChatWindowProps {
  roomId: string;
  currentUserId: number;
  className?: string;
}

/**
 * ChatWindow — to'liq chat interfeysi.
 *
 * Props:
 *  - roomId: xona ID (masalan "consultation_42")
 *  - currentUserId: joriy foydalanuvchi ID (o'z xabarlarini o'ngda ko'rsatish uchun)
 *  - className: tashqi container uchun qo'shimcha CSS
 *
 * Xususiyatlar:
 *  - Enter: yuborish, Shift+Enter: yangi qator
 *  - Yangi xabar kelganda avtomatik pastga scroll
 *  - Yozish indikatori "... yozmoqda"
 *  - Ulanish / uzilish badge
 */
export function ChatWindow({ roomId, currentUserId, className = '' }: ChatWindowProps) {
  const { messages, typingUser, connected, sendMessage, sendTyping } = useChat(roomId);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Yangi xabar kelganda pastga scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text, 'TEXT');
    setInput('');
    textareaRef.current?.focus();
  }, [input, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      sendTyping();
    },
    [sendTyping],
  );

  return (
    <div
      className={`flex flex-col bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-gray-800 text-sm font-medium">Suhbat</span>
          <span className="text-gray-400 text-xs">{roomId}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 text-xs">Ulangan</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 text-xs">Uzilgan</span>
            </>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-sky-500" />
            </div>
            <p className="text-gray-400 text-sm">Hali xabar yo'q</p>
            <p className="text-gray-300 text-xs mt-1">Birinchi bo'lib yozing!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
            />
          ))
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex justify-start mb-2">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-gray-400 text-xs">{typingUser}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Xabar yozing... (Enter — yuborish, Shift+Enter — yangi qator)"
            rows={1}
            disabled={!connected}
            className={`flex-1 border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-100 transition-colors ${
              connected
                ? 'border-gray-200 bg-white'
                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={!connected || !input.trim()}
            className="w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-700 active:bg-sky-800 transition-colors"
            aria-label="Yuborish"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
