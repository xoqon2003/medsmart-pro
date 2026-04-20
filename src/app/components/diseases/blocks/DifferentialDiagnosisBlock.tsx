import React from 'react';
import { GitBranch } from 'lucide-react';
import { renderMarkdown } from '../../../lib/marker-parser';
import type { DiseaseBlock } from '../../../types/api/disease';

interface Props {
  block: DiseaseBlock;
}

/**
 * L3 — Differensial tashxis bloki.
 * Mutaxassis/student uchun: o'xshash kasalliklarni farqlash mezonlari.
 */
export function DifferentialDiagnosisBlock({ block }: Props) {
  const html = renderMarkdown(block.contentMd ?? '');

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/30 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-violet-100/50 border-b border-violet-200">
        <GitBranch className="w-4 h-4 text-violet-600" aria-hidden="true" />
        <span className="inline-flex items-center rounded-md border border-violet-300 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
          Mutaxassis uchun
        </span>
        <span className="text-xs text-violet-600 opacity-70">L3 · Differensial tashxis</span>
      </div>
      <div
        className="px-4 py-4 prose prose-sm max-w-none text-foreground"
        /* eslint-disable-next-line react/no-danger */
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
