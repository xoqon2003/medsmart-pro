import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { messageService } from '../../../../services/api/messageService';
import type { Conversation } from '../../../types';
import {
  ChevronLeft, MessageCircle, Loader2, Search,
} from 'lucide-react';

export function ConversationsList() {
  const { navigate, goBack } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    messageService.getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? conversations.filter(c => c.partnerName.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 flex-1">Xabarlar</h1>
        </div>
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <MessageCircle size={40} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Xabarlar yo'q</p>
          </div>
        ) : (
          filtered.map(conv => (
            <button
              key={conv.partnerId}
              onClick={() => navigate('chat_screen')}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                {conv.partnerAvatar
                  ? <img src={conv.partnerAvatar} alt="" className="w-full h-full object-cover" />
                  : <span className="text-lg font-bold text-blue-600">{conv.partnerName[0]}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 truncate">{conv.partnerName}</p>
                  <span className="text-[10px] text-gray-400 shrink-0">{formatTime(conv.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage ?? 'Xabar yo\'q'}</p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
