import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, EyeOff, Save, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { renderMarkdown } from '../../lib/marker-parser';
import { apiFetch } from '../../api/http';
import { useSubmitReview } from '../../hooks/useKBDiseases';
import type { DiseaseBlock } from '../../types/api/disease';

interface BlockEditorProps {
  marker: string;
  block: DiseaseBlock | null;
  diseaseSlug: string;
  onSaved: (block: DiseaseBlock) => void;
}

export function BlockEditor({ marker, block, diseaseSlug, onSaved }: BlockEditorProps) {
  const [content, setContent]         = useState(block?.contentMd ?? '');
  const [level, setLevel]             = useState<'L1' | 'L2' | 'L3'>(block?.level ?? 'L1');
  const [evidence, setEvidence]       = useState<'A' | 'B' | 'C' | 'D'>(block?.evidenceLevel ?? 'C');
  const [preview, setPreview]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [dirty, setDirty]             = useState(false);
  const autosaveTimer                 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitReview                  = useSubmitReview();

  // content o'zgarganda dirty flag
  useEffect(() => {
    if (block && content !== block.contentMd) setDirty(true);
    else if (!block && content) setDirty(true);
    else setDirty(false);
  }, [content, block]);

  // Autosave debounce — faqat draft bloklar uchun 3 soniya
  const isDraft = !block || block.status === 'DRAFT';
  const scheduledAutosave = useCallback((newContent: string) => {
    if (!isDraft) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      if (!newContent.trim()) return;
      try {
        await doSave(newContent, level, evidence, true);
      } catch {
        // autosave xatosi jimgina o'tkaziladi
      }
    }, 3000);
  }, [isDraft, level, evidence]); // eslint-disable-line

  useEffect(() => () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
  }, []);

  const handleContentChange = (val: string) => {
    setContent(val);
    scheduledAutosave(val);
  };

  async function doSave(
    md: string,
    lvl: 'L1' | 'L2' | 'L3',
    ev: 'A' | 'B' | 'C' | 'D',
    silent = false,
  ): Promise<DiseaseBlock> {
    const body = { marker, contentMd: md, level: lvl, evidenceLevel: ev };
    let saved: DiseaseBlock;
    if (block?.id) {
      saved = await apiFetch<DiseaseBlock>(
        `/diseases/${diseaseSlug}/blocks/${block.id}`,
        { method: 'PATCH', body: JSON.stringify(body) },
      );
    } else {
      saved = await apiFetch<DiseaseBlock>(
        `/diseases/${diseaseSlug}/blocks`,
        { method: 'POST', body: JSON.stringify(body) },
      );
    }
    onSaved(saved);
    if (!silent) toast.success("Blok saqlandi");
    setDirty(false);
    return saved;
  }

  const handleSave = async () => {
    if (!content.trim()) { toast.error("Kontent bo'sh bo'lishi mumkin emas"); return; }
    setSaving(true);
    try {
      await doSave(content, level, evidence);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!content.trim()) { toast.error("Avval kontentni kiriting"); return; }
    setSaving(true);
    try {
      const saved = await doSave(content, level, evidence);
      await submitReview.mutateAsync(saved.id);
      toast.success("Review'ga yuborildi");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 flex-wrap">
        {/* Level */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 mr-1">Daraja:</span>
          {(['L1', 'L2', 'L3'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                level === l ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Evidence */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 mr-1">Dalil:</span>
          {(['A', 'B', 'C', 'D'] as const).map(e => (
            <button
              key={e}
              onClick={() => setEvidence(e)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                evidence === e ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Preview toggle */}
        <button
          onClick={() => setPreview(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {preview ? 'Tahrirlash' : 'Preview'}
        </button>

        {/* Autosave indicator */}
        {isDraft && dirty && (
          <span className="text-xs text-slate-600 italic">3s da autosave...</span>
        )}
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden">
        {preview ? (
          <div
            className="h-full overflow-y-auto p-4 prose-slate text-slate-200"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <textarea
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            placeholder={`# ${marker}\n\nMarkdown formatida yozing...\n\n**Qalin**, *kursiv*, - ro'yxat`}
            className="w-full h-full resize-none bg-transparent px-4 py-3 text-sm text-slate-200 font-mono leading-relaxed outline-none placeholder-slate-700"
          />
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
        <div className="text-xs text-slate-600">
          {content.length} belgi
          {block?.publishedAt && (
            <span className="ml-3">Nashr: {new Date(block.publishedAt).toLocaleDateString()}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Draft saqlash
          </button>
          <button
            onClick={handleSubmitReview}
            disabled={saving || !content.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Review'ga yuborish
          </button>
        </div>
      </div>
    </div>
  );
}
