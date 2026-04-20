import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, Loader2, RefreshCw, ClipboardList } from 'lucide-react';
import { useReviewQueue } from '../../hooks/useKBDiseases';
import { ReviewActionPanel } from '../../components/kb/ReviewActionPanel';
import type { ReviewQueueItem } from '../../hooks/useKBDiseases';

export function KBReviewQueuePage() {
  const navigate              = useNavigate();
  const { data, isLoading, refetch, isRefetching } = useReviewQueue();
  const [selected, setSelected] = useState<ReviewQueueItem | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const items: ReviewQueueItem[] = data?.items ?? [];

  const openPanel = (item: ReviewQueueItem) => {
    setSelected(item);
    setPanelOpen(true);
  };

  const LEVEL_BADGE: Record<string, string> = {
    L1: 'bg-emerald-500/10 text-emerald-400',
    L2: 'bg-blue-500/10 text-blue-400',
    L3: 'bg-purple-500/10 text-purple-400',
  };

  const EVIDENCE_BADGE: Record<string, string> = {
    A: 'bg-teal-500/10 text-teal-400',
    B: 'bg-sky-500/10 text-sky-400',
    C: 'bg-yellow-500/10 text-yellow-400',
    D: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-800 bg-slate-900">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <ClipboardList className="w-5 h-5 text-blue-400" />
        <div>
          <h1 className="font-semibold text-white">Review navbati</h1>
          <p className="text-xs text-slate-500">Tasdiqlashni kutayotgan bloklar</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {data && (
            <span className="text-xs text-slate-500">
              Jami: <span className="text-white font-medium">{data.total}</span>
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600">
            <ClipboardList className="w-12 h-12 mb-3 text-slate-700" />
            <p className="text-base">Tekshirish uchun bloklar yo'q</p>
            <p className="text-sm mt-1">Hamma narsa ko'rib chiqilgan!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => openPanel(item)}
                className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {item.disease && (
                        <span className="text-sm font-semibold text-white">
                          {item.disease.nameUz}
                        </span>
                      )}
                      {item.disease?.icd10 && (
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-600/10 px-2 py-0.5 rounded">
                          {item.disease.icd10}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 mb-1">
                      {item.label || item.marker}
                    </p>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.contentMd.slice(0, 180).replace(/[#*_]/g, '')}...
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    {item.level && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${LEVEL_BADGE[item.level] ?? 'bg-slate-700 text-slate-400'}`}>
                        {item.level}
                      </span>
                    )}
                    {item.evidenceLevel && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${EVIDENCE_BADGE[item.evidenceLevel] ?? 'bg-slate-700 text-slate-400'}`}>
                        {item.evidenceLevel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                  {item.submittedByName && (
                    <span>Yuborgan: <span className="text-slate-400">{item.submittedByName}</span></span>
                  )}
                  {item.submittedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.submittedAt).toLocaleString()}
                    </span>
                  )}
                  <span className="ml-auto text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ko'rish →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ReviewActionPanel
          block={selected}
          open={panelOpen}
          onClose={() => { setPanelOpen(false); setSelected(null); }}
        />
      )}
    </div>
  );
}
