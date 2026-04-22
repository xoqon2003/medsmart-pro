import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, Search, ArrowLeft, Edit3, Loader2,
  CheckCircle2, Clock, FileText, Archive, AlertCircle,
} from 'lucide-react';
import { useKBDiseasesList } from '../../hooks/useKBDiseases';
import type { DiseaseListItem } from '../../types/api/disease';

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  DRAFT:     'Qoralama',
  REVIEW:    "Ko'rib chiqilmoqda",
  APPROVED:  'Tasdiqlangan',
  PUBLISHED: 'Nashr etilgan',
  ARCHIVED:  'Arxivlangan',
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT:     'bg-slate-500/15 text-slate-400',
  REVIEW:    'bg-amber-500/15 text-amber-400',
  APPROVED:  'bg-teal-500/15 text-teal-400',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-400',
  ARCHIVED:  'bg-red-500/15 text-red-400',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  DRAFT:     <FileText   className="w-3 h-3" />,
  REVIEW:    <Clock      className="w-3 h-3" />,
  APPROVED:  <CheckCircle2 className="w-3 h-3" />,
  PUBLISHED: <CheckCircle2 className="w-3 h-3" />,
  ARCHIVED:  <Archive    className="w-3 h-3" />,
};

const FILTER_OPTIONS = [
  { value: 'ALL',       label: 'Barchasi' },
  { value: 'PUBLISHED', label: 'Nashr etilgan' },
  { value: 'REVIEW',    label: "Ko'rib chiqilmoqda" },
  { value: 'DRAFT',     label: 'Qoralama' },
  { value: 'ARCHIVED',  label: 'Arxiv' },
];

// ── HighlightText (dark admin theme) ──────────────────────────────────────────

/**
 * Wraps substrings matching `query` in a dark-theme <mark>.
 * Case-insensitive; regex special characters are escaped.
 */
function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query || query.trim() === '') return <>{text}</>;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-400/25 text-yellow-300 rounded-[2px] px-[1px] not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

// ── Page component ─────────────────────────────────────────────────────────────

export function KBDiseaseListPage() {
  const navigate = useNavigate();

  // `inputValue` — live UI value; `debouncedQ` — sent to query + used for highlight
  const [inputValue,  setInputValue]  = useState('');
  const [debouncedQ,  setDebouncedQ]  = useState('');
  const [statusFilter, setStatus]     = useState('ALL');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 300ms debounce — same as DiseaseSearchBar
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQ(inputValue), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [inputValue]);

  const queryParams: Record<string, string | number | undefined> = {
    ...(debouncedQ ? { search: debouncedQ } : {}),
    ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
    limit: 100,
  };

  const { data, isLoading, isError } = useKBDiseasesList(queryParams);
  const diseases: DiseaseListItem[] = (data?.items ?? []) as DiseaseListItem[];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
              aria-label="Orqaga"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">KB — Kasalliklar bazasi</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {data?.total ?? '…'} ta kasallik
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/kb/diseases/new')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
                       text-white text-sm font-medium rounded-xl transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Yangi kasallik
          </button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Kasallik nomi yoki ICD-10..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700
                         rounded-xl text-sm text-white placeholder-slate-500
                         outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 bg-slate-800 rounded-xl p-1 shrink-0">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={[
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  statusFilter === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-900/50
                          bg-red-950/30 px-5 py-4 text-sm text-red-400 max-w-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Kasalliklar yuklanmadi. Serverga ulanishni tekshiring.
          </div>
        )}

        {!isLoading && !isError && diseases.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {search || statusFilter !== 'ALL'
                ? "Qidiruv bo'yicha natija topilmadi"
                : 'Hali kasallik qo\'shilmagan'}
            </p>
            {!search && statusFilter === 'ALL' && (
              <button
                onClick={() => navigate('/kb/diseases/new')}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white
                           text-sm rounded-xl transition-colors"
              >
                Birinchi kasallikni yarating
              </button>
            )}
          </div>
        )}

        {!isLoading && diseases.length > 0 && (
          <div className="grid gap-3">
            {diseases.map((disease) => (
              <DiseaseRow
                key={disease.id}
                disease={disease}
                onEdit={() => navigate(`/kb/diseases/${disease.slug}/edit`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DiseaseRow sub-component ───────────────────────────────────────────────────

interface DiseaseRowProps {
  disease: DiseaseListItem;
  onEdit: () => void;
}

function DiseaseRow({ disease, onEdit }: DiseaseRowProps) {
  const status = (disease as unknown as { status?: string }).status ?? 'DRAFT';
  const totalBlocks   = (disease as unknown as { totalBlocks?: number }).totalBlocks ?? 0;
  const publishedBlocks = (disease as unknown as { publishedBlocks?: number }).publishedBlocks ?? 0;
  const completeness = totalBlocks > 0 ? Math.round((publishedBlocks / totalBlocks) * 100) : 0;

  return (
    <div className="flex items-center gap-4 bg-slate-900 border border-slate-800
                    rounded-xl px-5 py-4 hover:border-slate-600 transition-colors group">
      {/* ICD-10 chip */}
      <span className="font-mono text-xs text-slate-500 bg-slate-800 px-2.5 py-1
                       rounded-lg shrink-0 min-w-[56px] text-center">
        {disease.icd10}
      </span>

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{disease.nameUz}</p>
        {disease.nameRu && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{disease.nameRu}</p>
        )}
      </div>

      {/* Completeness bar */}
      {totalBlocks > 0 && (
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={[
                'h-full rounded-full transition-all',
                completeness >= 80 ? 'bg-emerald-500' :
                completeness >= 40 ? 'bg-amber-500' : 'bg-red-500',
              ].join(' ')}
              style={{ width: `${completeness}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 w-8">{completeness}%</span>
        </div>
      )}

      {/* Status badge */}
      <span className={[
        'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0',
        STATUS_COLOR[status] ?? STATUS_COLOR.DRAFT,
      ].join(' ')}>
        {STATUS_ICON[status]}
        {STATUS_LABEL[status] ?? status}
      </span>

      {/* Edit button */}
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/0 hover:bg-indigo-600
                   border border-indigo-600/30 hover:border-indigo-500 text-indigo-400
                   hover:text-white rounded-lg text-xs font-medium transition-colors shrink-0
                   opacity-0 group-hover:opacity-100"
        aria-label={`${disease.nameUz} ni tahrirlash`}
      >
        <Edit3 className="w-3.5 h-3.5" />
        Tahrirlash
      </button>
    </div>
  );
}
