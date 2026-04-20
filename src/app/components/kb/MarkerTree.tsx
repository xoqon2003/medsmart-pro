import React from 'react';
import { Plus } from 'lucide-react';
import { CANONICAL_MARKERS } from '../../lib/canonical-markers';
import type { DiseaseBlock } from '../../types/api/disease';

interface MarkerTreeProps {
  blocks: DiseaseBlock[];
  selectedMarker: string | null;
  onSelect: (markerId: string) => void;
  onNewBlock: (markerId: string) => void;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT:     { bg: 'bg-yellow-500/10', text: 'text-yellow-400',  label: 'Qoralama' },
  REVIEW:    { bg: 'bg-blue-500/10',   text: 'text-blue-400',    label: 'Tekshiruvda' },
  APPROVED:  { bg: 'bg-teal-500/10',   text: 'text-teal-400',    label: 'Tasdiqlangan' },
  PUBLISHED: { bg: 'bg-emerald-500/10',text: 'text-emerald-400', label: 'Nashr' },
  REJECTED:  { bg: 'bg-red-500/10',    text: 'text-red-400',     label: 'Rad' },
};

export function MarkerTree({ blocks, selectedMarker, onSelect, onNewBlock }: MarkerTreeProps) {
  const blockByMarker = new Map<string, DiseaseBlock[]>();
  for (const b of blocks) {
    const arr = blockByMarker.get(b.marker) ?? [];
    arr.push(b);
    blockByMarker.set(b.marker, arr);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Markerlar ({CANONICAL_MARKERS.length})
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {CANONICAL_MARKERS.map(m => {
          const markerBlocks = blockByMarker.get(m.id) ?? [];
          const topBlock     = markerBlocks[0];
          const active       = selectedMarker === m.id;
          const badge        = topBlock ? (STATUS_BADGE[topBlock.status] ?? STATUS_BADGE.DRAFT) : null;

          return (
            <div
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                active
                  ? 'bg-indigo-600/20 border-l-2 border-indigo-500'
                  : 'hover:bg-slate-800/50 border-l-2 border-transparent'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${active ? 'text-indigo-300' : 'text-slate-300'}`}>
                  {m.label}
                </p>
                <p className="text-[10px] text-slate-600 font-mono">{m.id}</p>
              </div>

              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                {badge ? (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-600">
                    Yo'q
                  </span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onNewBlock(m.id); }}
                  title="Yangi blok"
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-indigo-600 transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
