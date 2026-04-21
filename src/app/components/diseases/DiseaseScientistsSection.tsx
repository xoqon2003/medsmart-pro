import { Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useDiseaseScientists } from '../../hooks/useDiseases';
import { useLocale } from '../../store/LocaleContext';
import type { DiseaseScientist, ScientistRole } from '../../types/api/disease';
import type { TranslationKey } from '../../lib/i18n';

interface Props {
  slug: string;
}

/**
 * Disease KB v2 — Scientists/History block (PR-14/15).
 *
 * Olim-klassifikator-kashfiyotchilar ro'yxati; server `orderIndex` bo'yicha
 * saralaydi. Bosh-og'ir loading state bermaymiz — `useDiseaseDetail` allaqachon
 * Hero'ni chizadi, bu yerda sekin kelsa skeleton emas, oddiy placeholder.
 */
export function DiseaseScientistsSection({ slug }: Props) {
  const { t } = useLocale();
  const { data, isLoading, isError } = useDiseaseScientists(slug);

  if (isLoading || isError) return null;
  if (!data || data.length === 0) return null;

  return (
    <section className="mt-6 space-y-3" aria-labelledby="disease-scientists-heading">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" aria-hidden="true" />
        <h2 id="disease-scientists-heading" className="text-base font-semibold">
          {t('disease.scientists.title')}
        </h2>
      </div>

      <ul className="space-y-3">
        {data.map((s) => (
          <ScientistCard key={s.id} scientist={s} t={t} />
        ))}
      </ul>
    </section>
  );
}

function ScientistCard({
  scientist,
  t,
}: {
  scientist: DiseaseScientist;
  t: (k: TranslationKey) => string;
}) {
  const years = [scientist.birthYear, scientist.deathYear]
    .filter((y): y is number => y !== null)
    .join('–');

  const roleKey = `disease.scientists.role.${scientist.role}` as TranslationKey;

  return (
    <li className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm text-foreground truncate">
            {scientist.fullName}
          </div>
          {(scientist.country || years) && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {[scientist.country, years].filter(Boolean).join(' • ')}
            </div>
          )}
        </div>
        <Badge variant="secondary" className="text-[10px] shrink-0">
          {t(roleKey)}
        </Badge>
      </div>

      {scientist.bioMd && (
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {stripMarkdown(scientist.bioMd)}
        </p>
      )}

      {scientist.contributionsMd && (
        <div className="text-xs">
          <span className="font-medium text-foreground">
            {t('disease.scientists.contributions')}:
          </span>{' '}
          <span className="text-muted-foreground">
            {stripMarkdown(scientist.contributionsMd)}
          </span>
        </div>
      )}
    </li>
  );
}

/** Minimal markdown guard — faqat ** va __ ni tozalaydi, block-level yo'q. */
function stripMarkdown(md: string): string {
  return md.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1');
}

// Explicit unused-import guard — ScientistRole tipini export qilamiz kelajakda
// form/filter uchun kerak bo'lsa.
export type { ScientistRole };
