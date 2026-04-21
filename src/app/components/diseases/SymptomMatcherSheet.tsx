import { useEffect, useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  Loader2,
  Send,
  BookmarkPlus,
  ArrowLeft,
  ArrowRight,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSymptomMatcher } from '../../hooks/useSymptomMatcher';
import { useDiseaseSymptoms, useDiseasesList } from '../../hooks/useDiseases';
import { useMatcherWizard } from '../../hooks/useMatcherWizard';
import { saveTriageNote } from '../../api/triage';
import { exportTriageToPdf } from '../../lib/triage-pdf-export';
import { MatcherWizardStepper } from './matcher/MatcherWizardStepper';
import { MatcherStep1Symptoms } from './matcher/MatcherStep1Symptoms';
import { MatcherStep2RiskFactors } from './matcher/MatcherStep2RiskFactors';
import { MatcherStep3Timeline } from './matcher/MatcherStep3Timeline';
import { MatcherStep4Summary } from './matcher/MatcherStep4Summary';
import { SendToDoctorDialog } from './SendToDoctorDialog';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';
import { EmergencyCallBanner } from '../common/EmergencyCallBanner';
import { useLocale } from '../../store/LocaleContext';
import type { RedFlagRule as BannerRule } from '../common/EmergencyCallBanner';
import {
  evaluateRedFlags,
  getApplicableRedFlagRules,
} from '../../lib/red-flag-engine';
import type { DiseaseDetail } from '../../types/api/disease';
import type { TranslationKey } from '../../lib/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  disease: DiseaseDetail;
}

/**
 * 4-step symptom-matcher wizard (GAP-01 + GAP-03).
 *
 * Step 1 reuses the existing `useSymptomMatcher` (server round-trips);
 * Steps 2-3 are client-side and will sync to the backend
 * `SymptomMatchSession.userAnswers` once the PATCH endpoint ships.
 * Step 4 renders scores and a DDx list (GAP-03) based on the nearest
 * candidate diseases.
 */
export function SymptomMatcherSheet({ isOpen, onClose, disease }: Props) {
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useLocale();

  const { data: symptoms = [], isLoading: symptomsLoading } = useDiseaseSymptoms(
    disease.slug,
  );

  // Candidate pool for DDx — same category as the primary disease.
  const { data: candidateList } = useDiseasesList({
    category: disease.category,
    limit: 6,
  });
  const candidateDiseases = candidateList?.items ?? [];

  const {
    answers,
    score,
    sessionId,
    status,
    setAnswer,
    initSession,
    reset,
  } = useSymptomMatcher();

  const wizard = useMatcherWizard({
    symptoms,
    answers,
    primaryDisease: disease,
    candidateDiseases,
    baseScore: score,
  });

  /**
   * Red-flag evaluation runs live on every answer change (GAP-04).
   * Rules are scoped by disease.category + icd10 so an AF card only
   * evaluates AF rules, not HTN-specific ones (and vice versa).
   */
  const applicableRules = useMemo(
    () =>
      getApplicableRedFlagRules({
        category: disease.category,
        icd10: disease.icd10,
      }),
    [disease.category, disease.icd10],
  );
  const redFlagHits = useMemo(
    () => evaluateRedFlags(applicableRules, answers),
    [applicableRules, answers],
  );

  /** Adapt engine hits to the legacy EmergencyCallBanner prop shape. */
  const bannerRules: BannerRule[] = useMemo(
    () =>
      redFlagHits.map((hit) => ({
        conditionLabel: t(hit.rule.nameKey),
        urgencyLevel:
          hit.rule.severity === 'CRITICAL'
            ? 'IMMEDIATE'
            : hit.rule.severity === 'HIGH'
              ? 'URGENT'
              : 'SOON',
        messageUz: t(hit.rule.actionKey),
        callEmergency: hit.rule.severity === 'CRITICAL',
      })),
    [redFlagHits, t],
  );

  // Initialize session when sheet opens and symptoms are loaded.
  useEffect(() => {
    if (isOpen && symptoms.length > 0 && status === 'idle') {
      initSession(disease.id, symptoms).catch(() => {
        // Network error — still allow local scoring
      });
    }
    if (!isOpen) {
      reset();
      wizard.resetWizard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, symptoms.length]);

  const handleSave = async () => {
    if (!sessionId) {
      toast.error(t('triage.sessionError'));
      return;
    }
    setSaving(true);
    try {
      const noteLines = Array.from(answers.entries()).map(
        ([code, ans]) => `- ${code}: ${ans}`,
      );
      const noteMd = `## ${disease.nameUz} — Simptom tahlili\n\nMoslik: ${Math.round(score * 100)}%\n\n${noteLines.join('\n')}`;
      await saveTriageNote(sessionId, noteMd);
      toast.success(t('triage.saveSuccess'));
    } catch {
      toast.error(t('triage.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      await exportTriageToPdf({
        disease,
        scores: wizard.scores,
        ddx: wizard.ddx,
        redFlagLabels: bannerRules.map((r) => r.conditionLabel),
        answers,
        timeline: wizard.timeline,
      });
    } catch {
      toast.error(t('triage.saveError'));
    }
  };

  const isReady = status === 'ready' || status === 'idle';
  const isFinalStep = wizard.step === 4;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="bottom"
          className="sm:side-right h-[92dvh] sm:h-full sm:max-w-md sm:inset-y-0 sm:right-0 sm:bottom-auto flex flex-col p-0 rounded-t-2xl sm:rounded-none"
        >
          <SheetHeader className="px-5 pt-5 pb-2 shrink-0">
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-3 sm:hidden" />
            <SheetTitle className="text-base">
              {t('triage.title')}
            </SheetTitle>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {disease.nameUz} — {t('triage.subtitle')}
            </p>
          </SheetHeader>

          <MatcherWizardStepper current={wizard.step} />

          <Separator className="my-1 shrink-0" />

          <ScrollArea className="flex-1 px-5">
            {status === 'matching' ? (
              <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{t('triage.loading')}</span>
              </div>
            ) : wizard.step === 1 ? (
              <MatcherStep1Symptoms
                symptoms={symptoms}
                answers={answers}
                onAnswer={setAnswer}
                isLoading={symptomsLoading}
                validationError={
                  wizard.validationError
                    ? t(wizard.validationError as TranslationKey)
                    : undefined
                }
              />
            ) : wizard.step === 2 ? (
              <MatcherStep2RiskFactors
                answers={wizard.riskFactors}
                onAnswer={wizard.setRiskFactor}
              />
            ) : wizard.step === 3 ? (
              <MatcherStep3Timeline
                value={wizard.timeline}
                onChange={wizard.updateTimeline}
              />
            ) : (
              <MatcherStep4Summary scores={wizard.scores} ddx={wizard.ddx} />
            )}
          </ScrollArea>

          {/* Red-flag bannerlar — live-evaluated by the frontend engine (GAP-04) */}
          {bannerRules.length > 0 && (
            <div className="px-5 pb-2 shrink-0">
              <EmergencyCallBanner rules={bannerRules} />
            </div>
          )}

          <SheetFooter className="px-5 py-3 border-t border-border shrink-0 flex-col gap-2">
            <div className="flex w-full gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-1.5"
                disabled={wizard.step === 1}
                onClick={wizard.goBack}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                {t('wizard.back')}
              </Button>
              {!isFinalStep ? (
                <Button
                  type="button"
                  className="flex-1 gap-1.5"
                  onClick={() => wizard.goNext()}
                >
                  {t('wizard.next')}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="flex-1 gap-1.5"
                  disabled={!isReady || !sessionId || symptoms.length === 0}
                  onClick={() => setSendDialogOpen(true)}
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  {t('triage.sendToDoctor')}
                </Button>
              )}
            </div>

            {isFinalStep && (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                disabled={!sessionId || saving}
                onClick={handleSave}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
                {t('triage.save')}
              </Button>
            )}

            {isFinalStep && (
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2 text-muted-foreground"
                onClick={handleExportPdf}
              >
                <Download className="w-4 h-4" />
                {t('triage.exportPdf')}
              </Button>
            )}

            <MedicalDisclaimer variant="inline" />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {sessionId && (
        <SendToDoctorDialog
          isOpen={sendDialogOpen}
          onClose={() => setSendDialogOpen(false)}
          sessionId={sessionId}
          score={score}
          diseaseName={disease.nameUz}
        />
      )}
    </>
  );
}
