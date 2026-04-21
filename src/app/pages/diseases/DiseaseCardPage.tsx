import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useDiseaseDetail } from '../../hooks/useDiseases';
import { DiseaseCardHero } from '../../components/diseases/DiseaseCardHero';
import { AudienceSwitcher } from '../../components/diseases/AudienceSwitcher';
import { DiseaseCardTabs } from '../../components/diseases/DiseaseCardTabs';
import { SymptomMatchBanner } from '../../components/diseases/SymptomMatchBanner';
import { DiseaseCardSkeleton } from '../../components/diseases/DiseaseCardSkeleton';
import { SymptomMatcherSheet } from '../../components/diseases/SymptomMatcherSheet';
import { MedicalDisclaimer } from '../../components/common/MedicalDisclaimer';
import { DownloadPdfButton } from '../../components/diseases/DownloadPdfButton';
import { ClinicalCalculatorsSection } from '../../components/diseases/ClinicalCalculatorsSection';
import { DiseaseScientistsSection } from '../../components/diseases/DiseaseScientistsSection';
import { DiseaseResearchSection } from '../../components/diseases/DiseaseResearchSection';
import { DiseaseGeneticsSection } from '../../components/diseases/DiseaseGeneticsSection';
import { useLocale } from '../../store/LocaleContext';
import type { DiseaseBlock } from '../../types/api/disease';
import type { AudienceLevel } from '../../constants/disease-tabs';

/**
 * Level comparison helper.
 * String comparison works correctly for 'L1' | 'L2' | 'L3' because the literals
 * sort lexicographically in the same order as the numeric level hierarchy.
 */
function levelLte(blockLevel: string, audience: AudienceLevel): boolean {
  return blockLevel <= audience;
}

export function DiseaseCardPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  const sessionId = searchParams.get('session');
  const initialLevel = (searchParams.get('level') ?? 'L1') as AudienceLevel;
  const [audience, setAudience] = useState<AudienceLevel>(initialLevel);
  const [matcherOpen, setMatcherOpen] = useState(false);

  const { data: disease, isLoading, isError } = useDiseaseDetail(slug ?? '', audience);

  if (isLoading) return <DiseaseCardSkeleton />;

  if (isError || !disease) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6">
        <p className="text-destructive font-medium text-center">Kasallik topilmadi.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
      </div>
    );
  }

  const visibleBlocks: DiseaseBlock[] = disease.blocks
    .filter((b) => b.status === 'PUBLISHED' && levelLte(b.level, audience))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      {/* Back navigation */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/50 -mx-4 px-4 py-2 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
      </div>

      {/* Triage session match banner — shown only when ?session= param present */}
      {sessionId && (
        <SymptomMatchBanner sessionId={sessionId} diseaseId={disease.id} />
      )}

      {/* Hero section: name, ICD-10, synonyms, completeness, CTA */}
      <DiseaseCardHero disease={disease} onCheckClick={() => setMatcherOpen(true)} />

      {/* Action row: audience switcher + PDF download */}
      <div className="flex items-center justify-between flex-wrap gap-2 mt-2">
        <AudienceSwitcher value={audience} onChange={setAudience} />
        <DownloadPdfButton disease={disease} />
      </div>

      {/* 8-tab content (GAP-02) */}
      <div className="mt-6">
        <DiseaseCardTabs blocks={visibleBlocks} audience={audience} />
      </div>

      {/* Clinical calculators (GAP-05) — rendered only if applicable for this category */}
      <ClinicalCalculatorsSection
        category={disease.category}
        icd10={disease.icd10}
        audience={audience}
      />

      {/* Disease KB v2 metadata (PR-14/15/16) — scientists, research, genetics.
          Har bo'lim bo'sh bo'lsa o'zini render qilmaydi (data.length === 0). */}
      <DiseaseScientistsSection slug={disease.slug} />
      <DiseaseResearchSection slug={disease.slug} />
      <DiseaseGeneticsSection slug={disease.slug} />

      {/* Medical disclaimer */}
      <div className="mt-8">
        <MedicalDisclaimer variant="banner" />
      </div>

      {/* Symptom Matcher Sheet */}
      <SymptomMatcherSheet
        isOpen={matcherOpen}
        onClose={() => setMatcherOpen(false)}
        disease={disease}
      />
    </div>
  );
}
