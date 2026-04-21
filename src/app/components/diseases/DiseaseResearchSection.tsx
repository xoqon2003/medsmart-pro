import { BookOpen, Award, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useDiseaseResearch } from '../../hooks/useDiseases';
import { useLocale } from '../../store/LocaleContext';
import type { DiseaseResearch } from '../../types/api/disease';
import type { TranslationKey } from '../../lib/i18n';

interface Props {
  slug: string;
}

const EVIDENCE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  A: 'default',
  B: 'secondary',
  C: 'outline',
  D: 'outline',
};

/**
 * Disease KB v2 — Scientific research block (PR-14/15).
 *
 * Server `orderBy: [{ isLandmark: 'desc' }, { year: 'desc' }]` — muhim
 * tadqiqotlar birinchi, keyin yangi yilga saralanadi.
 */
export function DiseaseResearchSection({ slug }: Props) {
  const { t } = useLocale();
  const { data, isLoading, isError } = useDiseaseResearch(slug);

  if (isLoading || isError) return null;
  if (!data || data.length === 0) return null;

  return (
    <section className="mt-6 space-y-3" aria-labelledby="disease-research-heading">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
        <h2 id="disease-research-heading" className="text-base font-semibold">
          {t('disease.research.title')}
        </h2>
      </div>

      <ul className="space-y-3">
        {data.map((r) => (
          <ResearchCard key={r.id} research={r} t={t} />
        ))}
      </ul>
    </section>
  );
}

function ResearchCard({
  research,
  t,
}: {
  research: DiseaseResearch;
  t: (k: TranslationKey) => string;
}) {
  const typeKey = `disease.research.type.${research.type}` as TranslationKey;

  return (
    <li className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5 flex-wrap">
            {research.isLandmark && (
              <Award
                className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
                aria-label={t('disease.research.landmark')}
              />
            )}
            <h3 className="font-semibold text-sm text-foreground leading-snug">
              {research.title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {research.authors}
            {research.journal ? ` — ${research.journal}` : ''} · {research.year}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="outline" className="text-[10px]">
            {t(typeKey)}
          </Badge>
          <Badge
            variant={EVIDENCE_VARIANT[research.evidenceLevel] ?? 'outline'}
            className="text-[10px]"
            title={t('disease.research.evidence')}
          >
            {research.evidenceLevel}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed">
        {stripMarkdown(research.summaryMd)}
      </p>

      {(research.doi || research.pubmedId || research.nctId) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {research.doi && (
            <ExtLink
              href={`https://doi.org/${research.doi}`}
              label={`${t('disease.research.doi')}: ${research.doi}`}
            />
          )}
          {research.pubmedId && (
            <ExtLink
              href={`https://pubmed.ncbi.nlm.nih.gov/${research.pubmedId}/`}
              label={`${t('disease.research.pubmed')}: ${research.pubmedId}`}
            />
          )}
          {research.nctId && (
            <ExtLink
              href={`https://clinicaltrials.gov/study/${research.nctId}`}
              label={`${t('disease.research.nct')}: ${research.nctId}`}
            />
          )}
        </div>
      )}
    </li>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      {label}
      <ExternalLink className="w-3 h-3" aria-hidden="true" />
    </a>
  );
}

function stripMarkdown(md: string): string {
  return md.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1');
}
