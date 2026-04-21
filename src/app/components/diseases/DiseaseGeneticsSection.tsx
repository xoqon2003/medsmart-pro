import { Dna } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useDiseaseGenetics } from '../../hooks/useDiseases';
import { useLocale } from '../../store/LocaleContext';
import type { DiseaseGenetic } from '../../types/api/disease';
import type { TranslationKey } from '../../lib/i18n';

interface Props {
  slug: string;
}

const BLOOD_GROUP_LABEL: Record<string, string> = {
  A_POS: 'A+', A_NEG: 'A−',
  B_POS: 'B+', B_NEG: 'B−',
  AB_POS: 'AB+', AB_NEG: 'AB−',
  O_POS: 'O+', O_NEG: 'O−',
};

/**
 * Disease KB v2 — Genetics/populations block (PR-14/15).
 *
 * Har yozuv — alohida genetik marker yoki populyatsiya xavfi. Penetrantlik
 * decimal (0–1) tarzida keladi (server String/number), 2 kasrgacha foizga
 * keltiramiz.
 */
export function DiseaseGeneticsSection({ slug }: Props) {
  const { t } = useLocale();
  const { data, isLoading, isError } = useDiseaseGenetics(slug);

  if (isLoading || isError) return null;
  if (!data || data.length === 0) return null;

  return (
    <section className="mt-6 space-y-3" aria-labelledby="disease-genetics-heading">
      <div className="flex items-center gap-2">
        <Dna className="w-4 h-4 text-primary" aria-hidden="true" />
        <h2 id="disease-genetics-heading" className="text-base font-semibold">
          {t('disease.genetics.title')}
        </h2>
      </div>

      <ul className="space-y-3">
        {data.map((g) => (
          <GeneticCard key={g.id} genetic={g} t={t} />
        ))}
      </ul>
    </section>
  );
}

function GeneticCard({
  genetic,
  t,
}: {
  genetic: DiseaseGenetic;
  t: (k: TranslationKey) => string;
}) {
  const penetrancePct = formatPenetrance(genetic.penetrance);
  const inheritanceKey = genetic.inheritancePattern
    ? (`disease.genetics.inheritance.${genetic.inheritancePattern}` as TranslationKey)
    : null;

  return (
    <li className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-start gap-2 flex-wrap">
        {genetic.geneSymbol && (
          <Badge variant="default" className="font-mono text-xs">
            {genetic.geneSymbol}
          </Badge>
        )}
        {genetic.variantType && (
          <span className="text-xs text-muted-foreground">
            {genetic.variantType}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {inheritanceKey && (
          <>
            <dt className="text-muted-foreground">
              {t('disease.genetics.inheritance')}
            </dt>
            <dd className="text-foreground">{t(inheritanceKey)}</dd>
          </>
        )}
        {penetrancePct !== null && (
          <>
            <dt className="text-muted-foreground">
              {t('disease.genetics.penetrance')}
            </dt>
            <dd className="text-foreground font-mono">{penetrancePct}</dd>
          </>
        )}
        {genetic.bloodGroupRisk && (
          <>
            <dt className="text-muted-foreground">
              {t('disease.genetics.bloodGroup')}
            </dt>
            <dd className="text-foreground font-mono">
              {BLOOD_GROUP_LABEL[genetic.bloodGroupRisk] ?? genetic.bloodGroupRisk}
            </dd>
          </>
        )}
      </dl>

      {genetic.populationNoteMd && (
        <p className="text-sm text-foreground/90 leading-relaxed">
          {stripMarkdown(genetic.populationNoteMd)}
        </p>
      )}
    </li>
  );
}

function formatPenetrance(val: string | number | null): string | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (Number.isNaN(num)) return null;
  return `${(num * 100).toFixed(1)}%`;
}

function stripMarkdown(md: string): string {
  return md.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1');
}
