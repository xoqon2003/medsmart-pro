import React, { useState, useEffect } from 'react';
import { useApp } from '../../../store/appStore';
import { contactService } from '../../../../services/api/contactService';
import type { ContactRequest, ContactRequestStatus } from '../../../types';
import {
  ChevronLeft, Loader2, Mail, MailOpen, Reply, Archive,
  Phone, Clock, Send, X, MessageCircle,
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Yangi', color: 'bg-blue-100 text-blue-700' },
  READ: { label: "O'qilgan", color: 'bg-gray-100 text-gray-600' },
  REPLIED: { label: 'Javob berilgan', color: 'bg-green-100 text-green-700' },
  ARCHIVED: { label: 'Arxiv', color: 'bg-gray-100 text-gray-400' },
};

const TYPE_LABELS: Record<string, string> = {
  CONSULTATION: 'Konsultatsiya',
  COMPLAINT: 'Shikoyat',
  FOLLOW_UP: 'Takror murojaat',
  OTHER: 'Boshqa',
};

export function DoctorContactRequests() {
  const { goBack } = useApp();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const loadRequests = () => {
    setLoading(true);
    contactService.getRequests(filter || undefined)
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, [filter]);

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      await contactService.reply(selected.id, replyText);
      setSelected(null);
      setReplyText('');
      loadRequests();
    } catch {} finally {
      setReplying(false);
    }
  };

  const handleArchive = async (id: string) => {
    await contactService.updateStatus(id, 'ARCHIVED');
    loadRequests();
  };

  const handleMarkRead = async (req: ContactRequest) => {
    if (req.status === 'NEW') {
      await contactService.updateStatus(req.id, 'READ');
    }
    setSelected(req);
  };

  const filters = [
    { value: '', label: 'Barchasi' },
    { value: 'NEW', label: 'Yangi' },
    { value: 'REPLIED', label: 'Javob berilgan' },
    { value: 'ARCHIVED', label: 'Arxiv' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 flex-1">Arizalar</h1>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {requests.filter(r => r.status === 'NEW').length} yangi
        </span>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              filter === f.value ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <MessageCircle size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Arizalar yo'q</p>
          </div>
        ) : (
          requests.map(req => {
            const statusInfo = STATUS_LABELS[req.status] ?? STATUS_LABELS.NEW;
            return (
              <button
                key={req.id}
                onClick={() => handleMarkRead(req)}
                className="w-full bg-white rounded-2xl p-4 text-left hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {req.status === 'NEW'
                      ? <Mail size={16} className="text-blue-500" />
                      : <MailOpen size={16} className="text-gray-400" />
                    }
                    <span className={`font-medium text-sm ${req.status === 'NEW' ? 'text-gray-900' : 'text-gray-600'}`}>
                      {req.patientName}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <span>{TYPE_LABELS[req.requestType] ?? req.requestType}</span>
                  <span>|</span>
                  <Clock size={10} />
                  <span>{new Date(req.createdAt).toLocaleDateString('uz-UZ')}</span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{req.message}</p>
              </button>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-gray-900">Ariza tafsilotlari</h3>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-900">{selected.patientName}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Phone size={10} /> {selected.patientPhone}
                </div>
                {selected.patientEmail && (
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <Mail size={10} /> {selected.patientEmail}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Xabar:</p>
                <p className="text-sm text-gray-800 bg-blue-50 rounded-xl p-3">{selected.message}</p>
              </div>

              {selected.doctorReply && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Sizning javobingiz:</p>
                  <p className="text-sm text-gray-800 bg-green-50 rounded-xl p-3">{selected.doctorReply}</p>
                </div>
              )}

              {selected.status !== 'REPLIED' && selected.status !== 'ARCHIVED' && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Javob yozing:</p>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Javobingizni yozing..."
                  />
                </div>
              )}
            </div>

            <div className="px-4 py-4 border-t border-gray-100 flex gap-2 shrink-0">
              {selected.status !== 'ARCHIVED' && (
                <button
                  onClick={() => { handleArchive(selected.id); setSelected(null); }}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-1"
                >
                  <Archive size={14} /> Arxivlash
                </button>
              )}
              {selected.status !== 'REPLIED' && selected.status !== 'ARCHIVED' && (
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-1"
                >
                  {replying ? <Loader2 size={14} className="animate-spin" /> : <Reply size={14} />}
                  Javob berish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
