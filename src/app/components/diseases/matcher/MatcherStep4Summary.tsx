import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { useLocale } from '../../../store/LocaleContext';
import type {
  DifferentialDiagnosisRow,
  MatchScores,
} from '../../../types/api/matcher-wizard';
import type { TranslationKey } from '../../../lib/i18n';

interface Props {
  scores: MatchScores;
  ddx: DifferentialDiagnosisRow[];
}

interface GaugeProps {
  labelKey: TranslationKey;
  /** 0..1 fill, or undefined for numeric-only gauges. */
  value: number;
  display: string;
  tone: 'primary' | 'warn' | 'danger' | 'muted';
}

const TONE_COLOR: Record<GaugeProps['tone'], string> = {
  primary: 'stroke-primary',
  warn: 'stroke-amber-500',
  danger: 'stroke-red-500',
  muted: 'stroke-muted-foreground',
};

function Gauge({ labelKey, value, display, tone }: GaugeProps) {
  const { t } = useLocale();
  const pct = Math.max(0, Math.min(1, value));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = pct * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            className="fill-none stroke-muted"
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            className={`fill-none ${TONE_COLOR[tone]}`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
          {display}
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">
        {t(labelKey)}
      </span>
    </div>
  );
}

const RISK_TONE: Record<MatchScores['risk'], GaugeProps['tone']> = {
  LOW: 'primary',
  MODERATE: 'warn',
  HIGH: 'danger',
  VERY_HIGH: 'danger',
};

const RISK_DISPLAY: Record<MatchScores['risk'], string> = {
  LOW: 'L',
  MODERATE: 'M',
  HIGH: 'H',
  VERY_HIGH: 'VH',
};

const RISK_FILL: Record<MatchScores['risk'], number> = {
  LOW: 0.25,
  MODERATE: 0.5,
  HIGH: 0.75,
  VERY_HIGH: 1,
};

/**
 * Step 4 — summary gauges + live DDx list (GAP-01 §3.1.3 Bosqich 4, GAP-03).
 */
export function MatcherStep4Summary({ scores, ddx }: Props) {
  const { t } = useLocale();

  return (
    <div className="space-y-5 pb-4">
      <p className="text-xs text-muted-foreground">
        {t('wizard.step4.subtitle')}
      </p>

      {/* 5 mini gauges */}
      <div className="grid grid-cols-5 gap-2">
        <Gauge
          labelKey="wizard.step4.gauge.match"
          value={scores.match}
          display={`${Math.round(scores.match * 100)}%`}
          tone={scores.match >= 0.7 ? 'primary' : scores.match >= 0.4 ? 'warn' : 'muted'}
        />
        <Gauge
          labelKey="wizard.step4.gauge.answered"
          value={scores.answered}
          display={`${Math.round(scores.answered * 100)}%`}
          tone="primary"
        />
        <Gauge
          labelKey="wizard.step4.gauge.risk"
          value={RISK_FILL[scores.risk]}
          display={RISK_DISPLAY[scores.risk]}
          tone={RISK_TONE[scores.risk]}
        />
        <Gauge
          labelKey="wizard.step4.gauge.redFlag"
          value={scores.redFlagCount > 0 ? 1 : 0}
          display={String(scores.redFlagCount)}
          tone={scores.redFlagCount > 0 ? 'danger' : 'muted'}
        />
        <Gauge
          labelKey="wizard.step4.gauge.confidence"
          value={scores.confidence}
          display={`${Math.round(scores.confidence * 100)}%`}
          tone={scores.confidence >= 0.5 ? 'primary' : 'warn'}
        />
      </div>

      {/* DDx list */}
      <section aria-labelledby="ddx-title">
        <h3 id="ddx-title" className="text-sm font-semibold text-foreground mb-2">
          {t('wizard.step4.ddx.title')}
        </h3>
        {ddx.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {t('wizard.step4.ddx.empty')}
          </p>
        ) : (
          <ul className="space-y-1.5" role="list">
            {ddx.map((row) => {
              const pct = Math.round(row.matchScore * 100);
              const tone =
                row.matchScore >= 0.8
                  ? 'bg-green-50 border-green-300'
                  : row.matchScore >= 0.6
                    ? 'bg-amber-50 border-amber-300'
                    : 'bg-muted border-border';
              return (
                <li key={row.diseaseId}>
                  <Link
                    to={`/kasalliklar/${row.slug}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:bg-muted/80 ${tone}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground truncate">
                          {row.nameUz}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {row.icd10}
                        </span>
                        {row.redFlag && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] text-red-700 bg-red-100 border border-red-200 rounded-full px-1.5 py-0.5"
                            aria-label={t('wizard.step4.ddx.redFlag')}
                          >
                            <AlertTriangle className="w-2.5 h-2.5" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-foreground tabular-nums shrink-0">
                      {pct}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
