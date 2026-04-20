import React from 'react';
import { format } from 'date-fns';
import type { ChatMessage } from '../../hooks/useChat';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

/**
 * ChatBubble — bitta xabar qabarchugi.
 *
 * - O'z xabari: o'ngda, ko'k fon
 * - Boshqaning: chapda, kulrang fon
 * - TRIAGE_RESULT: sariq border bilan ajratilgan
 */
export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const isTriageResult = message.type === 'TRIAGE_RESULT';

  const time = (() => {
    try {
      return format(new Date(message.createdAt), 'HH:mm');
    } catch {
      return '';
    }
  })();

  if (isTriageResult) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className="max-w-[85%] rounded-2xl border-2 border-amber-400 bg-amber-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-amber-600 text-xs font-medium">
              Triage natijasi
            </span>
          </div>
          <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
          <div className={`mt-1 flex items-center gap-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {!isOwn && (
              <span className="text-gray-400 text-xs">{message.senderName}</span>
            )}
            <span className="text-gray-400 text-xs">{time}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isOwn
            ? 'bg-sky-600 text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
        }`}
      >
        {!isOwn && (
          <p className="text-sky-600 text-xs font-medium mb-0.5">
            {message.senderName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
          {message.content}
        </p>
        <p
          className={`text-xs mt-1 ${
            isOwn ? 'text-white/60 text-right' : 'text-gray-400'
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
