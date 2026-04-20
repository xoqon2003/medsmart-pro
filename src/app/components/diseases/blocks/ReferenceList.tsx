import React from 'react';
import { BookOpen } from 'lucide-react';
import type { DiseaseBlock } from '../../../types/api/disease';

interface Props {
  block: DiseaseBlock;
}

/**
 * Numbered list of references.
 * Each non-empty line of contentMd is one reference entry.
 */
export function ReferenceList({ block }: Props) {
  const refs = (block.contentMd ?? '')
    .split('\n')
    .map((l) => l.replace(/^[-*\d.]\s*/, '').trim())
    .filter(Boolean);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <BookOpen className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Manbalar
        </span>
      </div>
      <ol className="space-y-1.5">
        {refs.map((ref, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
            <span className="shrink-0 font-mono font-medium text-primary/70">{idx + 1}.</span>
            <span>{ref}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
