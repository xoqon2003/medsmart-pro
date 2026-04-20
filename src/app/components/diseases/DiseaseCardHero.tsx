import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';
import { CompletenessBar } from './CompletenessBar';
import { LocaleSwitcher } from '../common/LocaleSwitcher';
import { useLocale } from '../../store/LocaleContext';
import type { DiseaseDetail } from '../../types/api/disease';

interface Props {
  disease: DiseaseDetail;
  onCheckClick?: () => void;
}

const EVIDENCE_LABEL: Record<string, string> = {
  A: 'Kuchli dalil (A)',
  B: 'O\'rtacha dalil (B)',
  C: 'Zaif dalil (C)',
  D: 'Ekspert fikri (D)',
};

const EVIDENCE_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  A: 'default',
  B: 'secondary',
  C: 'outline',
  D: 'outline',
};

export function DiseaseCardHero({ disease, onCheckClick }: Props) {
  const [synonymsOpen, setSynonymsOpen] = useState(false);
  const { t } = useLocale();

  // Find the top evidence level from published blocks
  const topEvidence = disease.blocks
    .filter((b) => b.status === 'PUBLISHED' && b.evidenceLevel)
    .sort((a, b) => a.evidenceLevel.localeCompare(b.evidenceLevel))[0]?.evidenceLevel;

  const latestBlock = disease.blocks
    .filter((b) => b.publishedAt)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))[0];

  return (
    <div className="pt-4 pb-2 space-y-3">
      {/* Til almashtirish */}
      <div className="flex justify-end">
        <LocaleSwitcher />
      </div>

      {/* ICD-10 badge + name */}
      <div className="flex items-start gap-2 flex-wrap">
        <Badge variant="outline" className="font-mono text-xs shrink-0">
          {disease.icd10}
        </Badge>
        {topEvidence && (
          <Badge variant={EVIDENCE_VARIANT[topEvidence] ?? 'outline'} className="text-xs shrink-0">
            {EVIDENCE_LABEL[topEvidence] ?? topEvidence}
          </Badge>
        )}
      </div>

      <h1 className="text-2xl font-bold leading-tight text-foreground">{disease.nameUz}</h1>

      {disease.nameLat && (
        <p className="text-sm italic text-muted-foreground">{disease.nameLat}</p>
      )}

      {/* Synonyms — collapsible */}
      {disease.synonyms?.length > 0 && (
        <div>
          <button
            onClick={() => setSynonymsOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('disease.synonyms')} ({disease.synonyms.length})
            {synonymsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {synonymsOpen && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {disease.synonyms.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completeness bar */}
      <CompletenessBar blocks={disease.blocks} />

      {/* Last updated */}
      {latestBlock?.publishedAt && (
        <p className="text-[11px] text-muted-foreground">
          {t('disease.lastUpdated')}: {new Date(latestBlock.publishedAt).toLocaleDateString('uz-UZ')}
        </p>
      )}

      {/* CTA */}
      <Button
        variant="secondary"
        size="sm"
        className="gap-2 mt-1"
        onClick={onCheckClick}
      >
        <Stethoscope className="w-4 h-4" />
        {t('disease.checkMe')}
      </Button>
    </div>
  );
}
