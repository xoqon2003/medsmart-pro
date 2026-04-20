import React from 'react';
import { motion } from 'motion/react';
import { useLocale } from '../../store/LocaleContext';

interface Props {
  score: number; // 0..1
}

type ScoreColorKey = 'triage.score.low' | 'triage.score.medium' | 'triage.score.high';

function getColorMeta(pct: number): { bar: string; text: string; labelKey: ScoreColorKey } {
  if (pct < 30) return { bar: 'bg-red-500', text: 'text-red-600', labelKey: 'triage.score.low' };
  if (pct < 60) return { bar: 'bg-yellow-400', text: 'text-yellow-600', labelKey: 'triage.score.medium' };
  return { bar: 'bg-green-500', text: 'text-green-600', labelKey: 'triage.score.high' };
}

export function MatchScoreIndicator({ score }: Props) {
  const pct = Math.round(Math.min(1, Math.max(0, score)) * 100);
  const { bar, text, labelKey } = getColorMeta(pct);
  const { t } = useLocale();

  return (
    <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{t('triage.matchLevel')}</span>
        <span className={`text-lg font-bold tabular-nums ${text}`}>{pct}%</span>
      </div>

      {/* Animated progress bar */}
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <p className={`text-xs font-medium ${text}`}>{t(labelKey)}</p>
    </div>
  );
}
