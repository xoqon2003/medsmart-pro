import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Save, Loader2, BookOpen, Database } from 'lucide-react';
import { toast } from 'sonner';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../../components/ui/resizable';
import { MarkerTree } from '../../components/kb/MarkerTree';
import { BlockEditor } from '../../components/kb/BlockEditor';
import { CompletenessIndicator } from '../../components/kb/CompletenessIndicator';
import { apiFetch } from '../../api/http';
import type { DiseaseDetail, DiseaseBlock } from '../../types/api/disease';

export function KBDiseaseEditorPage() {
  const { slug }        = useParams<{ slug: string }>();
  const navigate        = useNavigate();
  const isNew           = !slug;

  const [disease, setDisease]             = useState<Partial<DiseaseDetail> | null>(isNew ? { nameUz: '', icd10: '', blocks: [] } : null);
  const [loading, setLoading]             = useState(!isNew);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);

  // Existing disease load
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    apiFetch<DiseaseDetail>(`/diseases/${slug}?level=L3`)
      .then(d => {
        setDisease(d);
        if (d.blocks?.length) setSelectedMarker(d.blocks[0].marker);
      })
      .catch(e => {
        toast.error(e instanceof Error ? e.message : "Yuklab bo'lmadi");
        navigate('/kb/diseases');
      })
      .finally(() => setLoading(false));
  }, [slug]); // eslint-disable-line

  const blocks = (disease?.blocks ?? []) as DiseaseBlock[];

  const selectedBlock = selectedMarker
    ? blocks.find(b => b.marker === selectedMarker) ?? null
    : null;

  const handleBlockSaved = (saved: DiseaseBlock) => {
    setDisease(prev => {
      if (!prev) return prev;
      const existing = (prev.blocks ?? []) as DiseaseBlock[];
      const idx = existing.findIndex(b => b.id === saved.id);
      const updated: DiseaseBlock[] =
        idx >= 0
          ? existing.map(b => (b.id === saved.id ? saved : b))
          : [...existing, saved];
      return { ...prev, blocks: updated };
    });
  };

  const handleSaveDisease = async () => {
    if (!disease?.nameUz?.trim()) { toast.error("Kasallik nomi kiritilmagan"); return; }
    setSaving(true);
    try {
      if (isNew) {
        const created = await apiFetch<DiseaseDetail>('/diseases', {
          method: 'POST',
          body: JSON.stringify({ nameUz: disease.nameUz, icd10: disease.icd10 }),
        });
        toast.success("Kasallik yaratildi");
        navigate(`/kb/diseases/${created.slug}/edit`);
      } else {
        await apiFetch(`/diseases/${slug}`, {
          method: 'PATCH',
          body: JSON.stringify({ nameUz: disease.nameUz, icd10: disease.icd10 }),
        });
        toast.success("Saqlandi");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-800 bg-slate-900 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />

        <input
          value={disease?.nameUz ?? ''}
          onChange={e => setDisease(prev => ({ ...prev, nameUz: e.target.value }))}
          placeholder="Kasallik nomi (o'zbekcha) *"
          className="flex-1 bg-transparent text-white text-base font-semibold outline-none placeholder-slate-600 min-w-0"
        />

        <input
          value={disease?.icd10 ?? ''}
          onChange={e => setDisease(prev => ({ ...prev, icd10: e.target.value }))}
          placeholder="ICD-10"
          className="w-28 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono outline-none focus:border-indigo-500"
        />

        {!isNew && slug && (
          <button
            onClick={() => navigate(`/kb/diseases/${slug}/metadata`)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm transition-colors shrink-0"
            title="Metadata (olimlar / tadqiqotlar / genetika)"
          >
            <Database className="w-3.5 h-3.5" />
            Metadata
          </button>
        )}

        <button
          onClick={handleSaveDisease}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm disabled:opacity-50 transition-colors shrink-0"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Saqlash
        </button>
      </div>

      {/* Completeness bar */}
      <div className="px-5 py-2 bg-slate-900/50 border-b border-slate-800 shrink-0">
        <CompletenessIndicator blocks={blocks} />
      </div>

      {/* Main 2-panel layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left: MarkerTree */}
          <ResizablePanel defaultSize={28} minSize={18} maxSize={40}>
            <div className="h-full bg-slate-900 border-r border-slate-800 overflow-hidden">
              <MarkerTree
                blocks={blocks}
                selectedMarker={selectedMarker}
                onSelect={setSelectedMarker}
                onNewBlock={markerId => {
                  setSelectedMarker(markerId);
                }}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right: BlockEditor */}
          <ResizablePanel defaultSize={72}>
            <div className="h-full bg-slate-950 overflow-hidden flex flex-col">
              {selectedMarker ? (
                <BlockEditor
                  key={selectedMarker}
                  marker={selectedMarker}
                  block={selectedBlock}
                  diseaseSlug={slug ?? ''}
                  onSaved={handleBlockSaved}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600">
                  <div className="text-center">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                    <p className="text-sm">Marker tanlang yoki yangi blok yarating</p>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
