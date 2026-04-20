import { useState } from 'react';
import { DiseaseModalPreview } from './DiseaseModalPreview';
import { lookupByIcd } from '../../api/diseases';

interface DiseaseChipBySlug {
  slug: string;
  label: string;
  icd?: string;
}

interface DiseaseChipByIcd {
  icd: string;
  slug?: never;
  label?: string;
}

type DiseaseChipProps = DiseaseChipBySlug | DiseaseChipByIcd;

/**
 * DiseaseChip — kichik chip tugma, bosilganda DiseaseModalPreview ochadi.
 *
 * Ishlatish:
 *   <DiseaseChip icd="I10" />
 *   <DiseaseChip slug="gipertoniya-i10" label="Gipertoniya" icd="I10" />
 */
export function DiseaseChip(props: DiseaseChipProps) {
  const [open, setOpen] = useState(false);
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(
    'slug' in props && props.slug ? props.slug : null,
  );
  const [loading, setLoading] = useState(false);

  // icd-only mode: slug'ni backend dan olish kerak
  async function resolveAndOpen() {
    if (resolvedSlug) {
      setOpen(true);
      return;
    }
    if (!('icd' in props) || !props.icd) return;
    setLoading(true);
    try {
      const result = await lookupByIcd(props.icd);
      setResolvedSlug(result.slug);
      setOpen(true);
    } catch {
      // ICD topilmasa chip uchun modal ochmaymiz
    } finally {
      setLoading(false);
    }
  }

  const displayLabel =
    'label' in props && props.label
      ? props.label
      : 'icd' in props
      ? props.icd
      : props.slug;

  const icdDisplay = 'icd' in props && props.icd
    ? props.icd
    : null;

  return (
    <>
      <button
        onClick={resolveAndOpen}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800 hover:bg-blue-100 transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        <span>{displayLabel}</span>
        {icdDisplay && displayLabel !== icdDisplay && (
          <>
            <span className="text-blue-400">•</span>
            <span className="font-mono text-[10px] text-blue-600">{icdDisplay}</span>
          </>
        )}
      </button>

      {resolvedSlug && (
        <DiseaseModalPreview
          slug={resolvedSlug}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
