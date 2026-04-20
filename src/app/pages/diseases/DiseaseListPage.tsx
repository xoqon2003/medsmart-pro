import { useState } from 'react';
import { DiseaseSearchBar } from '../../components/diseases/DiseaseSearchBar';
import { DiseaseCategoryFilter } from '../../components/diseases/DiseaseCategoryFilter';
import { DiseaseListItem } from '../../components/diseases/DiseaseListItem';
import { useDiseasesList, useSemanticSearch } from '../../hooks/useDiseases';
import { LocaleSwitcher } from '../../components/common/LocaleSwitcher';
import { useLocale } from '../../store/LocaleContext';

type SearchMode = 'fts' | 'semantic';

export function DiseaseListPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [searchMode, setSearchMode] = useState<SearchMode>('fts');
  const { t } = useLocale();

  const ftsResult = useDiseasesList(
    { q, category, page, limit: 20 },
  );
  const semanticResult = useSemanticSearch(q, 20);

  const isSemanticMode = searchMode === 'semantic';

  const isLoading = isSemanticMode ? semanticResult.isLoading : ftsResult.isLoading;
  const isError = isSemanticMode ? semanticResult.isError : ftsResult.isError;
  const items = isSemanticMode
    ? (semanticResult.data ?? [])
    : (ftsResult.data?.items ?? []);
  const total = isSemanticMode ? items.length : (ftsResult.data?.total ?? 0);

  const handleQueryChange = (v: string) => {
    setQ(v);
    setPage(1);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{t('diseases.title')}</h1>
        <LocaleSwitcher />
      </div>

      <DiseaseSearchBar value={q} onChange={handleQueryChange} />

      {/* FTS ↔ Semantic qidiruv toggle */}
      <div className="flex items-center gap-2 mt-3 mb-1">
        <span className="text-xs text-muted-foreground">Qidiruv turi:</span>
        <button
          type="button"
          onClick={() => setSearchMode('fts')}
          className={[
            'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
            searchMode === 'fts'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-primary/50',
          ].join(' ')}
        >
          FTS
        </button>
        <button
          type="button"
          onClick={() => setSearchMode('semantic')}
          className={[
            'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
            searchMode === 'semantic'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-primary/50',
          ].join(' ')}
        >
          Semantik
        </button>
        {isSemanticMode && (
          <span className="text-xs text-muted-foreground ml-1">(vektor asosida, ma&apos;no bo&apos;yicha)</span>
        )}
      </div>

      {!isSemanticMode && (
        <DiseaseCategoryFilter selected={category} onChange={(c) => { setCategory(c); setPage(1); }} />
      )}

      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">{t('diseases.loading')}</div>
      )}
      {isError && (
        <div className="text-center py-8 text-destructive">{t('common.error')}</div>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">{t('diseases.notFound')}</div>
      )}

      <div className="space-y-3 mt-4">
        {items.map((d) => <DiseaseListItem key={d.id} disease={d} />)}
      </div>

      {!isSemanticMode && ftsResult.data && total > page * 20 && (
        <button
          className="w-full mt-4 py-2 text-sm text-primary border border-primary/30 rounded-lg"
          onClick={() => setPage((p) => p + 1)}
        >
          {t('diseases.showMore')} ({total - page * 20} ta qoldi)
        </button>
      )}
    </div>
  );
}
