import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { BlockRenderer } from './BlockRenderer';
import { useLocale } from '../../store/LocaleContext';
import {
  DISEASE_TABS,
  getTabForMarker,
  isTabVisibleForAudience,
  type DiseaseTabKey,
  type DiseaseTabSpec,
  type AudienceLevel,
} from '../../constants/disease-tabs';
import type { DiseaseBlock } from '../../types/api/disease';

interface Props {
  blocks: DiseaseBlock[];
  audience: AudienceLevel;
}

/**
 * Groups published blocks into their mapped tab buckets (GAP-02).
 * Empty tabs are kept so the navigation stays stable across audiences.
 */
function groupBlocksByTab(
  blocks: DiseaseBlock[],
): Record<DiseaseTabKey, DiseaseBlock[]> {
  const grouped: Record<DiseaseTabKey, DiseaseBlock[]> = {
    overview: [],
    diagnostics: [],
    treatment: [],
    stages: [],
    complications: [],
    advice: [],
    faq: [],
    sources: [],
  };
  for (const block of blocks) {
    const key = getTabForMarker(block.marker);
    grouped[key].push(block);
  }
  return grouped;
}

/**
 * 8-tab navigation for a disease card. Tab state is mirrored into the URL
 * (?tab=diagnostics) so deep links and back/forward work as expected.
 *
 * Audience filter: L1 hides specialist-only tabs (none yet, but the hook is
 * wired so we can narrow per-audience without touching this component).
 */
export function DiseaseCardTabs({ blocks, audience }: Props) {
  const { t } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  const grouped = useMemo(() => groupBlocksByTab(blocks), [blocks]);

  const visibleTabs = useMemo<DiseaseTabSpec[]>(
    () => DISEASE_TABS.filter((tab) => isTabVisibleForAudience(tab, audience)),
    [audience],
  );

  const fallbackTab: DiseaseTabKey =
    visibleTabs.find((tab) => grouped[tab.key].length > 0)?.key ??
    visibleTabs[0]?.key ??
    'overview';

  const urlTab = searchParams.get('tab') as DiseaseTabKey | null;
  const activeTab: DiseaseTabKey =
    urlTab && visibleTabs.some((t) => t.key === urlTab) ? urlTab : fallbackTab;

  const handleTabChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams);
      params.set('tab', next);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <div className="sticky top-10 z-[5] -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <TabsList
          aria-label={t('disease.tabs.ariaLabel')}
          className="flex w-full h-auto overflow-x-auto snap-x scrollbar-thin justify-start md:justify-center gap-1 bg-muted/60"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const count = grouped[tab.key].length;
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="snap-start flex-none md:flex-1 min-w-[96px] gap-1.5"
                aria-label={t(tab.labelKey)}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="text-xs md:text-sm">{t(tab.labelKey)}</span>
                {count > 0 && (
                  <span
                    className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold min-w-[1.25rem] h-5 px-1"
                    aria-label={`${count}`}
                  >
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {visibleTabs.map((tab) => {
        const tabBlocks = grouped[tab.key];
        return (
          <TabsContent
            key={tab.key}
            value={tab.key}
            className="mt-4 space-y-6 focus-visible:outline-none"
          >
            {tabBlocks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('disease.tabs.empty')}
                </p>
              </div>
            ) : (
              tabBlocks
                .slice()
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((block) => <BlockRenderer key={block.id} block={block} />)
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
