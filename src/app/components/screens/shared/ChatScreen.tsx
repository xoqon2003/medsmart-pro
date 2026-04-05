import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../store/appStore';
import { messageService } from '../../../../services/api/messageService';
import type { ChatMessage } from '../../../types';
import {
  ChevronLeft, Send, Paperclip, Image, Mic, Loader2,
  Check, CheckCheck, File,
} from 'lucide-react';

interface Props {
  partnerId?: number;
  partnerName?: string;
  partnerAvatar?: string;
}

export function ChatScreen({ partnerId = 0, partnerName = 'Suhbatdosh', partnerAvatar }: Props) {
  const { goBack, currentUser } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!partnerId) { setLoading(false); return; }
    messageService.getMessages(partnerId)
      .then(msgs => setMessages(msgs.reverse()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [partnerId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !partnerId) return;
    setSending(true);
    try {
      const msg = await messageService.sendMessage({
        receiverId: partnerId,
        content: text.trim(),
        messageType: 'TEXT',
      });
      setMessages(prev => [...prev, msg]);
      setText('');
    } catch {} finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (msg: ChatMessage) => msg.senderId === currentUser?.id;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
          {partnerAvatar
            ? <img src={partnerAvatar} alt="" className="w-full h-full object-cover" />
            : <span className="text-base font-bold text-blue-600">{partnerName[0]}</span>
          }
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{partnerName}</p>
          <p className="text-[10px] text-gray-400">Onlayn</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-gray-400">Xabarlar yo'q</p>
            <p className="text-xs text-gray-300 mt-1">Birinchi xabarni yozing</p>
          </div>
        ) : (
          messages.map(msg => {
            const mine = isMyMessage(msg);
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                  mine
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md'
                }`}>
                  {/* File/Image */}
                  {msg.messageType === 'IMAGE' && msg.fileUrl && (
                    <img src={msg.fileUrl} alt="" className="rounded-xl max-w-full mb-1" />
                  )}
                  {msg.messageType === 'FILE' && msg.fileName && (
                    <div className="flex items-center gap-2 mb-1">
                      <File size={14} />
                      <span className="text-xs underline">{msg.fileName}</span>
                    </div>
                  )}

                  {/* Text */}
                  {msg.content && (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}

                  {/* Time + status */}
                  <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] ${mine ? 'text-blue-200' : 'text-gray-400'}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                    {mine && (
                      msg.isRead
                        ? <CheckCheck size={12} className="text-blue-200" />
                        : <Check size={12} className="text-blue-200" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-end gap-2 shrink-0">
        <button className="p-2 rounded-full hover:bg-gray-100 shrink-0">
          <Paperclip size={18} className="text-gray-400" />
        </button>
        <div className="flex-1 bg-gray-50 rounded-2xl px-3.5 py-2.5 border border-gray-200">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="w-full text-sm bg-transparent resize-none focus:outline-none max-h-24"
            placeholder="Xabar yozing..."
          />
        </div>
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="p-2.5 bg-blue-500 rounded-full shrink-0 disabled:opacity-50"
        >
          {sending
            ? <Loader2 size={18} className="text-white animate-spin" />
            : <Send size={18} className="text-white" />
          }
        </button>
      </div>
    </div>
  );
}
