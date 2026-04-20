import React from 'react';
import { Progress } from '../ui/progress';
import { CANONICAL_MARKERS } from '../../lib/canonical-markers';
import type { DiseaseBlock } from '../../types/api/disease';

interface CompletenessIndicatorProps {
  blocks: DiseaseBlock[];
}

const TOTAL = CANONICAL_MARKERS.length;

export function CompletenessIndicator({ blocks }: CompletenessIndicatorProps) {
  const publishedByLevel = (level: 'L1' | 'L2' | 'L3') =>
    blocks.filter(b => b.level === level && b.status === 'PUBLISHED').length;

  const existsByLevel = (level: 'L1' | 'L2' | 'L3') =>
    blocks.filter(b => b.level === level).length;

  const levels: { key: 'L1' | 'L2' | 'L3'; color: string; label: string }[] = [
    { key: 'L1', color: 'bg-emerald-500', label: 'L1 (Asosiy)' },
    { key: 'L2', color: 'bg-blue-500',    label: 'L2 (Kengaytirilgan)' },
    { key: 'L3', color: 'bg-purple-500',  label: 'L3 (Ekspert)' },
  ];

  return (
    <div className="space-y-2">
      {levels.map(({ key, color, label }) => {
        const published = publishedByLevel(key);
        const exists    = existsByLevel(key);
        const pct       = Math.round((published / TOTAL) * 100);
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">{label}</span>
              <span className="text-xs text-slate-500">
                {published}/{TOTAL} nashr ({exists} mavjud)
              </span>
            </div>
            <Progress
              value={pct}
              className="h-1.5 bg-slate-700"
              style={{ ['--progress-color' as string]: color }}
            />
          </div>
        );
      })}
    </div>
  );
}
