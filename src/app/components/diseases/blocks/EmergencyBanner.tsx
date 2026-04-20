import { AlertTriangle, Phone, Calendar } from 'lucide-react';
import type { DiseaseBlock } from '../../../types/api/disease';
import { useLocale } from '../../../store/LocaleContext';
import type { TranslationKey } from '../../../lib/i18n';

export type EmergencySeverity = 'CRITICAL' | 'HIGH' | 'MODERATE';

interface Props {
  block: DiseaseBlock;
}

/**
 * Resolves severity from block metadata or marker heuristics (GAP-04).
 *
 * Priority:
 *   1. block.contentJson.severity — authored explicitly
 *   2. marker "emergency" → CRITICAL, "red_flags" → HIGH, else MODERATE
 *
 * This keeps legacy content working while letting new content declare severity
 * precisely. Once the RedFlagRule backend table ships, severity will come from
 * the triage engine response instead.
 */
function resolveSeverity(block: DiseaseBlock): EmergencySeverity {
  const authored = (block.contentJson as { severity?: string } | null | undefined)?.severity;
  if (authored === 'CRITICAL' || authored === 'HIGH' || authored === 'MODERATE') {
    return authored;
  }
  if (block.marker === 'emergency') return 'CRITICAL';
  if (block.marker === 'red_flags') return 'HIGH';
  return 'MODERATE';
}

interface SeverityStyle {
  container: string;
  icon: string;
  titleKey: TranslationKey;
  actionKey: TranslationKey;
  primaryButton: string;
}

const SEVERITY_STYLES: Record<EmergencySeverity, SeverityStyle> = {
  CRITICAL: {
    container: 'bg-red-50 border-red-300 text-red-900',
    icon: 'text-red-600',
    titleKey: 'emergency.critical.title',
    actionKey: 'emergency.critical.action',
    primaryButton: 'bg-red-600 hover:bg-red-700',
  },
  HIGH: {
    container: 'bg-orange-50 border-orange-300 text-orange-900',
    icon: 'text-orange-600',
    titleKey: 'emergency.high.title',
    actionKey: 'emergency.high.action',
    primaryButton: 'bg-orange-600 hover:bg-orange-700',
  },
  MODERATE: {
    container: 'bg-amber-50 border-amber-300 text-amber-900',
    icon: 'text-amber-600',
    titleKey: 'emergency.moderate.title',
    actionKey: 'emergency.moderate.action',
    primaryButton: 'bg-amber-600 hover:bg-amber-700',
  },
};

export function EmergencyBanner({ block }: Props) {
  const { t } = useLocale();
  const severity = resolveSeverity(block);
  const style = SEVERITY_STYLES[severity];

  return (
    <div
      role={severity === 'CRITICAL' ? 'alert' : 'status'}
      aria-live={severity === 'CRITICAL' ? 'assertive' : 'polite'}
      className={`rounded-xl border p-4 space-y-3 ${style.container}`}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{block.label || t(style.titleKey)}</p>
          <p className="text-xs opacity-80 mt-0.5">{t(style.actionKey)}</p>
        </div>
      </div>

      {block.contentMd && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{block.contentMd}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {severity === 'CRITICAL' && (
          <a
            href="tel:103"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-semibold transition-colors ${style.primaryButton}`}
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            {t('emergency.critical.action')}
          </a>
        )}
        {severity === 'HIGH' && (
          <a
            href="/kabinet/applications/new"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-semibold transition-colors ${style.primaryButton}`}
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            {t('emergency.bookButton')}
          </a>
        )}
      </div>
    </div>
  );
}
