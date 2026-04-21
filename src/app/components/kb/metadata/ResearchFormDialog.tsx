import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { useCreateResearch, useUpdateResearch } from '../../../hooks/useDiseases';
import { useLocale } from '../../../store/LocaleContext';
import type { DiseaseResearch, ResearchType } from '../../../types/api/disease';
import type { TranslationKey } from '../../../lib/i18n';

const TYPES: ResearchType[] = [
  'RCT',
  'META_ANALYSIS',
  'SYSTEMATIC_REVIEW',
  'COHORT',
  'CASE_CONTROL',
  'CASE_SERIES',
  'CASE_REPORT',
  'GUIDELINE',
];

const EVIDENCE: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

interface Props {
  open: boolean;
  onClose: () => void;
  slug: string;
  diseaseId: string;
  research: DiseaseResearch | null;
}

type FormState = {
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi: string;
  pubmedId: string;
  nctId: string;
  type: ResearchType;
  summaryMd: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  isLandmark: boolean;
};

const EMPTY: FormState = {
  title: '',
  authors: '',
  journal: '',
  year: new Date().getFullYear().toString(),
  doi: '',
  pubmedId: '',
  nctId: '',
  type: 'GUIDELINE',
  summaryMd: '',
  evidenceLevel: 'C',
  isLandmark: false,
};

function fromResearch(r: DiseaseResearch): FormState {
  return {
    title: r.title,
    authors: r.authors,
    journal: r.journal ?? '',
    year: r.year.toString(),
    doi: r.doi ?? '',
    pubmedId: r.pubmedId ?? '',
    nctId: r.nctId ?? '',
    type: r.type,
    summaryMd: r.summaryMd,
    evidenceLevel: r.evidenceLevel,
    isLandmark: r.isLandmark,
  };
}

export function ResearchFormDialog({ open, onClose, slug, diseaseId, research }: Props) {
  const { t } = useLocale();
  const [form, setForm] = useState<FormState>(EMPTY);

  const createMut = useCreateResearch(slug, diseaseId);
  const updateMut = useUpdateResearch(slug, diseaseId);
  const pending = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (open) setForm(research ? fromResearch(research) : EMPTY);
  }, [open, research]);

  const isEdit = !!research;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.authors.trim() || !form.summaryMd.trim()) {
      toast.error(t('kb.metadata.research.requiredFields'));
      return;
    }

    const payload = {
      title: form.title.trim(),
      authors: form.authors.trim(),
      journal: form.journal.trim() || null,
      year: Number(form.year),
      doi: form.doi.trim() || null,
      pubmedId: form.pubmedId.trim() || null,
      nctId: form.nctId.trim() || null,
      type: form.type,
      summaryMd: form.summaryMd.trim(),
      evidenceLevel: form.evidenceLevel,
      isLandmark: form.isLandmark,
    };

    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id: research!.id, input: payload });
        toast.success(t('common.save'));
      } else {
        await createMut.mutateAsync(payload);
        toast.success(t('kb.metadata.created'));
      }
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('kb.metadata.research.editTitle')
              : t('kb.metadata.research.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <Field label={t('kb.metadata.research.title') + ' *'}>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={t('kb.metadata.research.authors') + ' *'}>
              <Input
                value={form.authors}
                onChange={(e) => setForm((f) => ({ ...f, authors: e.target.value }))}
                required
              />
            </Field>

            <Field label={t('kb.metadata.research.journal')}>
              <Input
                value={form.journal}
                onChange={(e) => setForm((f) => ({ ...f, journal: e.target.value }))}
              />
            </Field>

            <Field label={t('kb.metadata.research.year') + ' *'}>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                required
              />
            </Field>

            <Field label={t('kb.metadata.research.type')}>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as ResearchType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((ty) => (
                    <SelectItem key={ty} value={ty}>
                      {t(`disease.research.type.${ty}` as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('disease.research.doi')}>
              <Input
                value={form.doi}
                onChange={(e) => setForm((f) => ({ ...f, doi: e.target.value }))}
                placeholder="10.xxxx/..."
              />
            </Field>

            <Field label={t('disease.research.pubmed')}>
              <Input
                value={form.pubmedId}
                onChange={(e) => setForm((f) => ({ ...f, pubmedId: e.target.value }))}
                placeholder="PMID"
              />
            </Field>

            <Field label={t('disease.research.nct')}>
              <Input
                value={form.nctId}
                onChange={(e) => setForm((f) => ({ ...f, nctId: e.target.value }))}
                placeholder="NCT00000000"
              />
            </Field>

            <Field label={t('disease.research.evidence')}>
              <Select
                value={form.evidenceLevel}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, evidenceLevel: v as 'A' | 'B' | 'C' | 'D' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVIDENCE.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={t('kb.metadata.research.summary') + ' *'}>
            <Textarea
              rows={4}
              value={form.summaryMd}
              onChange={(e) => setForm((f) => ({ ...f, summaryMd: e.target.value }))}
              placeholder="Markdown qo'llab-quvvatlanadi"
              required
            />
          </Field>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.isLandmark}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isLandmark: v }))}
              id="isLandmark"
            />
            <Label htmlFor="isLandmark" className="text-xs cursor-pointer">
              {t('disease.research.landmark')}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
