import React from 'react';
import type { DiseaseBlock } from '../../../types/api/disease';

interface Props {
  block: DiseaseBlock;
}

/**
 * Parses contentMd where each line starting with "- " or "* " is a stage/step.
 * Falls back to plain text if no list items are found.
 */
export function StagesStepper({ block }: Props) {
  const lines = (block.contentMd ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- ') || l.startsWith('* '));

  const stages = lines.map((l) => l.slice(2).trim());

  if (stages.length === 0) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {block.contentMd}
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {stages.map((stage, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
            {idx + 1}
          </span>
          <p className="text-sm leading-relaxed text-foreground pt-0.5">{stage}</p>
        </li>
      ))}
    </ol>
  );
}
