import React, { useState } from 'react';
import { UserRound, ChevronDown, ChevronUp } from 'lucide-react';
import type { DiseaseBlock } from '../../../types/api/disease';

interface Props {
  block: DiseaseBlock;
}

/**
 * Anonymised clinical case card — collapsed by default.
 */
export function ClinicalCaseCard({ block }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-violet-50 hover:bg-violet-100 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center shrink-0">
          <UserRound className="w-4 h-4 text-violet-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-violet-900">{block.label}</p>
          <p className="text-xs text-violet-600">Anonimlaştirilgan klinik holat</p>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-violet-500" />
          : <ChevronDown className="w-4 h-4 text-violet-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3">
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {block.contentMd}
          </p>
        </div>
      )}
    </div>
  );
}
