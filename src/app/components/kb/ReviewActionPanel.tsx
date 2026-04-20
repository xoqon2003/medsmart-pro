import React, { useState } from 'react';
import { Check, X, Send, Eye, Loader2, GitCompare } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';
import { renderMarkdown } from '../../lib/marker-parser';
import { useApproveBlock, useRejectBlock, usePublishBlock } from '../../hooks/useKBDiseases';
import type { ReviewQueueItem } from '../../hooks/useKBDiseases';

// ── Helpers ────────────────────────────────────────────────────────────────

type DiffLine =
  | { kind: 'same'; text: string }
  | { kind: 'removed'; text: string }
  | { kind: 'added'; text: string };

/**
 * Minimal line-level diff: walks through before/after line arrays and
 * produces a flat array of annotated lines suitable for rendering.
 * Uses a greedy LCS-lite approach (good enough for MD blocks, not O(n²)).
 */
function lineDiff(beforeMd: string, afterMd: string): DiffLine[] {
  const aLines = beforeMd.split('\n');
  const bLines = afterMd.split('\n');
  const result: DiffLine[] = [];

  let ai = 0;
  let bi = 0;
  while (ai < aLines.length || bi < bLines.length) {
    const a = aLines[ai];
    const b = bLines[bi];
    if (ai >= aLines.length) {
      result.push({ kind: 'added', text: b });
      bi++;
    } else if (bi >= bLines.length) {
      result.push({ kind: 'removed', text: a });
      ai++;
    } else if (a === b) {
      result.push({ kind: 'same', text: a });
      ai++;
      bi++;
    } else {
      // Lookahead (up to 3) to find a matching line and decide add vs remove
      const aLook = aLines.slice(ai + 1, ai + 4).findIndex((l) => l === b);
      const bLook = bLines.slice(bi + 1, bi + 4).findIndex((l) => l === a);
      if (aLook !== -1 && (bLook === -1 || aLook <= bLook)) {
        // The old line disappeared — mark it removed
        result.push({ kind: 'removed', text: a });
        ai++;
      } else if (bLook !== -1) {
        // A new line was inserted — mark it added
        result.push({ kind: 'added', text: b });
        bi++;
      } else {
        // Changed in place
        result.push({ kind: 'removed', text: a });
        result.push({ kind: 'added', text: b });
        ai++;
        bi++;
      }
    }
  }
  return result;
}

type TabId = 'preview' | 'diff';

interface ReviewActionPanelProps {
  block: ReviewQueueItem;
  open: boolean;
  onClose: () => void;
}

export function ReviewActionPanel({ block, open, onClose }: ReviewActionPanelProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [rejectOpen, setRejectOpen]     = useState(false);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [activeTab, setActiveTab]       = useState<TabId>('preview');

  const approveBlock  = useApproveBlock();
  const rejectBlock   = useRejectBlock();
  const publishBlock  = usePublishBlock();

  // Resolve last UPDATE log's beforeMd for diff
  const lastLog = block.editLogs?.[0];
  const diffJson = lastLog?.diffJson as Record<string, unknown> | undefined;
  const beforeMd =
    typeof (diffJson?.before as Record<string, unknown> | undefined)?.contentMd === 'string'
      ? ((diffJson!.before as Record<string, unknown>).contentMd as string)
      : null;
  const hasDiff = beforeMd !== null && beforeMd !== block.contentMd;
  const diffLines = hasDiff ? lineDiff(beforeMd!, block.contentMd) : [];

  const handleApprove = async () => {
    try {
      await approveBlock.mutateAsync({ blockId: block.id });
      toast.success("Blok tasdiqlandi");
      setConfirmOpen(false);
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  };

  const handleReject = async () => {
    if (rejectReason.trim().length < 10) {
      toast.error("Sabab kamida 10 ta belgi bo'lishi kerak");
      return;
    }
    try {
      await rejectBlock.mutateAsync({ blockId: block.id, reason: rejectReason });
      toast.success("Blok rad etildi");
      setRejectOpen(false);
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  };

  const handlePublish = async () => {
    try {
      await publishBlock.mutateAsync(block.id);
      toast.success("Blok nashr etildi");
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  };

  const isLoading =
    approveBlock.isPending || rejectBlock.isPending || publishBlock.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={v => !v && onClose()}>
        <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              Blok ko'rib chiqish
            </DialogTitle>
          </DialogHeader>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs">
            {block.disease && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                {block.disease.nameUz} ({block.disease.icd10})
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400">
              {block.label || block.marker}
            </span>
            {block.level && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono">
                {block.level}
              </span>
            )}
            {block.evidenceLevel && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-400 font-mono">
                Dalil: {block.evidenceLevel}
              </span>
            )}
            {block.submittedByName && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500">
                Yuborgan: {block.submittedByName}
              </span>
            )}
            {block.submittedAt && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500">
                {new Date(block.submittedAt).toLocaleString()}
              </span>
            )}
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 border-b border-slate-700 -mx-6 px-6 pb-0">
            <button
              onClick={() => setActiveTab('preview')}
              className={[
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px',
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300',
              ].join(' ')}
            >
              <Eye className="w-3.5 h-3.5" />
              Ko'rinish
            </button>
            {hasDiff && (
              <button
                onClick={() => setActiveTab('diff')}
                className={[
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px',
                  activeTab === 'diff'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300',
                ].join(' ')}
              >
                <GitCompare className="w-3.5 h-3.5" />
                O'zgarishlar
              </button>
            )}
          </div>

          {/* Content area */}
          {activeTab === 'preview' ? (
            <div className="flex-1 overflow-y-auto bg-slate-800 rounded-xl p-4 min-h-[200px]">
              <div
                className="prose-slate text-slate-200 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(block.contentMd) }}
              />
            </div>
          ) : (
            /* Diff view */
            <div className="flex-1 overflow-y-auto bg-slate-950 rounded-xl min-h-[200px] font-mono text-xs">
              {diffLines.length === 0 ? (
                <p className="p-4 text-slate-500">Avvalgi versiya yo'q yoki o'zgarish aniqlanmadi.</p>
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {diffLines.map((line, i) => {
                      const isRemoved = line.kind === 'removed';
                      const isAdded   = line.kind === 'added';
                      return (
                        <tr
                          key={i}
                          className={[
                            'leading-5',
                            isRemoved ? 'bg-red-950/60'  : '',
                            isAdded   ? 'bg-green-950/60' : '',
                          ].join(' ')}
                        >
                          <td className={[
                            'select-none w-5 text-center pr-2 pl-2 border-r',
                            isRemoved ? 'text-red-500 border-red-900'   : '',
                            isAdded   ? 'text-green-500 border-green-900' : '',
                            !isRemoved && !isAdded ? 'text-slate-700 border-slate-800' : '',
                          ].join(' ')}>
                            {isRemoved ? '−' : isAdded ? '+' : ' '}
                          </td>
                          <td className={[
                            'py-0.5 pl-3 pr-4 whitespace-pre-wrap break-all',
                            isRemoved ? 'text-red-300'   : '',
                            isAdded   ? 'text-green-300' : '',
                            !isRemoved && !isAdded ? 'text-slate-500' : '',
                          ].join(' ')}>
                            {line.text || ' '}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {lastLog?.editor?.fullName && (
                <p className="px-3 py-2 border-t border-slate-800 text-slate-600 text-xs">
                  So'nggi tahrir: {lastLog.editor.fullName}
                  {lastLog.createdAt ? ` · ${new Date(lastLog.createdAt).toLocaleString()}` : ''}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
            >
              Yopish
            </button>
            <button
              onClick={() => setRejectOpen(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-sm disabled:opacity-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Rad etish
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm disabled:opacity-50 transition-colors"
            >
              {approveBlock.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Check className="w-3.5 h-3.5" />}
              Tasdiqlash
            </button>
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm disabled:opacity-50 transition-colors"
            >
              {publishBlock.isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />}
              Nashr etish
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={v => !v && setRejectOpen(false)}>
        <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Rad etish sababi</DialogTitle>
          </DialogHeader>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Sabab kiriting (kamida 10 ta belgi)..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-red-500 resize-none"
          />
          <p className="text-xs text-slate-500">{rejectReason.length} / 10+ belgi</p>
          <DialogFooter>
            <button
              onClick={() => setRejectOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white"
            >
              Bekor
            </button>
            <button
              onClick={handleReject}
              disabled={rejectBlock.isPending || rejectReason.trim().length < 10}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm disabled:opacity-50"
            >
              {rejectBlock.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Rad etish
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={v => !v && setConfirmOpen(false)}>
        <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Tasdiqlashni tasdiqlang</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Bu blokni APPROVED holatiga o'tkazmoqchimisiz?
          </p>
          <DialogFooter>
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white"
            >
              Bekor
            </button>
            <button
              onClick={handleApprove}
              disabled={approveBlock.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm disabled:opacity-50"
            >
              {approveBlock.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Tasdiqlash
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
