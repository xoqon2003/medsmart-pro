import React from 'react';
import { renderMarkdown } from '../../../lib/marker-parser';
import type { DiseaseBlock } from '../../../types/api/disease';

interface Props {
  block: DiseaseBlock;
}

/**
 * L2 — Klinik protokol bloki.
 * Jadval + markdown formatida klinik ko'rsatmalar ko'rsatadi.
 * Sarlavhada "Shifokor uchun" badge qo'shiladi.
 */
export function ClinicalProtocolBlock({ block }: Props) {
  const html = renderMarkdown(block.contentMd ?? '');

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/40 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-100/60 border-b border-blue-200">
        <span className="inline-flex items-center rounded-md border border-blue-300 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
          Shifokor uchun
        </span>
        <span className="text-xs text-blue-600 opacity-70">L2 · Klinik protokol</span>
      </div>
      <div
        className="px-4 py-4 prose prose-sm max-w-none text-foreground"
        /* eslint-disable-next-line react/no-danger */
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
