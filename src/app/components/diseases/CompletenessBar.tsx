import React from 'react';
import { Progress } from '../ui/progress';
import type { DiseaseBlock } from '../../types/api/disease';

interface Props {
  blocks: DiseaseBlock[];
}

/** Shows L1-block completeness as a thin progress bar. */
export function CompletenessBar({ blocks }: Props) {
  const l1Blocks = blocks.filter((b) => b.level === 'L1');
  const published = l1Blocks.filter((b) => b.status === 'PUBLISHED').length;
  const total = l1Blocks.length;
  const pct = total === 0 ? 0 : Math.round((published / total) * 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Ma'lumot to'liqligi</span>
        <span className="text-[11px] font-medium text-muted-foreground">{pct}%</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
