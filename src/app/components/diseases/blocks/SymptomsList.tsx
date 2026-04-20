import React from 'react';
import type { DiseaseBlock } from '../../../types/api/disease';

interface Props {
  block: DiseaseBlock;
}

/**
 * Renders symptom badges from contentMd.
 * Each line (optionally prefixed with "- " or "* ") is one symptom.
 */
export function SymptomsList({ block }: Props) {
  const symptoms = (block.contentMd ?? '')
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);

  if (symptoms.length === 0) {
    return <p className="text-sm text-muted-foreground">Ma'lumot yo'q</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {symptoms.map((s, idx) => (
        <span
          key={idx}
          className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
        >
          {s}
        </span>
      ))}
    </div>
  );
}
