import { useNavigate } from 'react-router';
import { ChevronRightIcon } from 'lucide-react';
import { useDiseasesList } from '../../hooks/useDiseases';
import { getCategoryEmoji, getCategoryLabel } from '../../constants/disease-categories';
import { useLocale } from '../../store/LocaleContext';

interface RelatedDiseasesWidgetProps {
  /** Current disease slug — excluded from results */
  currentSlug: string;
  /** Current disease category — used to filter related diseases */
  category: string;
}

/**
 * Shows up to 5 diseases from the same category, excluding the current one.
 * Renders nothing if there are no related diseases.
 */
export function RelatedDiseasesWidget({ currentSlug, category }: RelatedDiseasesWidgetProps) {
  const navigate = useNavigate();
  const { t } = useLocale();

  // Fetch a small batch from the same category (fetch 6, then strip current)
  const { data } = useDiseasesList({ category, limit: 6 });

  const related = (data?.items ?? [])
    .filter((d) => d.slug !== currentSlug)
    .slice(0, 5);

  if (related.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base" aria-hidden="true">
          {getCategoryEmoji(category)}
        </span>
        <h2 className="text-sm font-semibold text-foreground">
          {t('diseases.related')}
        </h2>
        <span className="text-xs text-muted-foreground">
          — {getCategoryLabel(category)}
        </span>
      </div>

      <div className="space-y-2">
        {related.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => navigate(`/kasalliklar/${d.slug}`)}
            className="w-full text-left bg-muted/40 hover:bg-accent/60 border border-border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors active:scale-[0.99]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{d.nameUz}</p>
              {d.nameLat && (
                <p className="text-xs text-muted-foreground truncate italic">{d.nameLat}</p>
              )}
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{d.icd10}</p>
            </div>
            <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </section>
  );
}
