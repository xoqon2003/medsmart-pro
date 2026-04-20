import React from 'react';
import { FlaskConical } from 'lucide-react';
import type { DiseaseBlock } from '../../../types/api/disease';

interface Props {
  block: DiseaseBlock;
}

interface RefEntry {
  label: string;
  url: string | null;
}

/**
 * L3 — Ilmiy adabiyotlar bloki.
 * Mutaxassis/student uchun: PubMed, WHO, klinik tadqiqotlar.
 * Format: har qator bir manba; `[Matn](URL)` markdown link bo'lsa — bosiladi.
 */
function parseRefs(md: string): RefEntry[] {
  return md
    .split('\n')
    .map((line) => line.replace(/^[-*\d.]\s*/, '').trim())
    .filter(Boolean)
    .map((line) => {
      // Match `[label](url)` pattern
      const match = /^\[(.+)\]\((https?:\/\/[^)]+)\)/.exec(line);
      if (match) {
        return { label: match[1], url: match[2] };
      }
      return { label: line, url: null };
    });
}

export function ScientificReferencesBlock({ block }: Props) {
  const refs = parseRefs(block.contentMd ?? '');

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/30 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-violet-100/50 border-b border-violet-200">
        <FlaskConical className="w-4 h-4 text-violet-600" aria-hidden="true" />
        <span className="inline-flex items-center rounded-md border border-violet-300 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
          Mutaxassis uchun
        </span>
        <span className="text-xs text-violet-600 opacity-70">L3 · Ilmiy adabiyotlar</span>
      </div>

      <div className="px-4 py-4">
        {refs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ilmiy manbalar hali kiritilmagan.</p>
        ) : (
          <ol className="space-y-2">
            {refs.map((ref, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
              >
                <span className="shrink-0 font-mono font-medium text-violet-600 text-xs">
                  {idx + 1}.
                </span>
                {ref.url ? (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-700 hover:text-violet-900 underline underline-offset-2 transition-colors"
                  >
                    {ref.label}
                  </a>
                ) : (
                  <span>{ref.label}</span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
