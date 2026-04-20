import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '../ui/dialog';
import { apiFetch } from '../../api/http';

interface Reference {
  id: string;
  title: string;
  authors?: string;
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
}

interface ReferencePickerDialogProps {
  open: boolean;
  onClose: () => void;
  diseaseSlug: string;
  blockId: string;
  onAdded: () => void;
}

export function ReferencePickerDialog({
  open,
  onClose,
  diseaseSlug,
  blockId,
  onAdded,
}: ReferencePickerDialogProps) {
  const [query, setQuery]           = useState('');
  const [search, setSearch]         = useState('');
  const [selectedRef, setSelectedRef] = useState<Reference | null>(null);
  const [evidence, setEvidence]     = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [adding, setAdding]         = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['references', search],
    queryFn: () => apiFetch<{ items: Reference[] }>(`/references?q=${encodeURIComponent(search)}`),
    enabled: search.length >= 3,
  });

  const handleSearch = () => setSearch(query.trim());

  const handleAdd = async () => {
    if (!selectedRef) { toast.error("Manba tanlang"); return; }
    setAdding(true);
    try {
      await apiFetch(
        `/diseases/${diseaseSlug}/blocks/${blockId}/references`,
        {
          method: 'POST',
          body: JSON.stringify({ referenceId: selectedRef.id, evidenceLevel: evidence }),
        },
      );
      toast.success("Manba qo'shildi");
      onAdded();
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Manba qidirish
          </DialogTitle>
        </DialogHeader>

        {/* Qidiruv */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="DOI, PubMed ID yoki sarlavha..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-colors"
          >
            Qidirish
          </button>
        </div>

        {/* Natijalar */}
        <div className="min-h-[160px] max-h-64 overflow-y-auto space-y-1.5">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
            </div>
          )}
          {!isLoading && search && (!data?.items || data.items.length === 0) && (
            <p className="text-center py-8 text-slate-500 text-sm">Manba topilmadi</p>
          )}
          {data?.items.map(ref => (
            <button
              key={ref.id}
              onClick={() => setSelectedRef(ref)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                selectedRef?.id === ref.id
                  ? 'bg-indigo-600/20 border-indigo-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
            >
              <p className="text-sm text-white font-medium leading-snug">{ref.title}</p>
              {ref.authors && <p className="text-xs text-slate-400 mt-0.5">{ref.authors}</p>}
              <div className="flex gap-3 mt-1 text-[11px] text-slate-500">
                {ref.journal && <span>{ref.journal}</span>}
                {ref.year    && <span>{ref.year}</span>}
                {ref.doi     && <span className="font-mono">DOI: {ref.doi}</span>}
              </div>
            </button>
          ))}
        </div>

        {/* Evidence level */}
        {selectedRef && (
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-slate-400">Dalil darajasi:</span>
            {(['A', 'B', 'C', 'D'] as const).map(e => (
              <button
                key={e}
                onClick={() => setEvidence(e)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  evidence === e ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedRef || adding}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm disabled:opacity-50 transition-colors"
          >
            {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Qo'shish
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
