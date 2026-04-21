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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { useCreateGenetic, useUpdateGenetic } from '../../../hooks/useDiseases';
import { useLocale } from '../../../store/LocaleContext';
import type {
  DiseaseGenetic,
  InheritancePattern,
  BloodGroup,
} from '../../../types/api/disease';
import type { TranslationKey } from '../../../lib/i18n';

const INHERITANCE: InheritancePattern[] = [
  'AUTOSOMAL_DOMINANT',
  'AUTOSOMAL_RECESSIVE',
  'X_LINKED_DOMINANT',
  'X_LINKED_RECESSIVE',
  'MITOCHONDRIAL',
  'COMPLEX',
  'SPORADIC',
];

const BLOOD_GROUPS: BloodGroup[] = [
  'A_POS', 'A_NEG', 'B_POS', 'B_NEG',
  'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG',
];

const BLOOD_LABEL: Record<BloodGroup, string> = {
  A_POS: 'A+', A_NEG: 'A−',
  B_POS: 'B+', B_NEG: 'B−',
  AB_POS: 'AB+', AB_NEG: 'AB−',
  O_POS: 'O+', O_NEG: 'O−',
};

const NONE_VALUE = '__none__';

interface Props {
  open: boolean;
  onClose: () => void;
  slug: string;
  diseaseId: string;
  genetic: DiseaseGenetic | null;
}

type FormState = {
  geneSymbol: string;
  variantType: string;
  inheritancePattern: InheritancePattern | '';
  penetrance: string;
  bloodGroupRisk: BloodGroup | '';
  populationNoteMd: string;
};

const EMPTY: FormState = {
  geneSymbol: '',
  variantType: '',
  inheritancePattern: '',
  penetrance: '',
  bloodGroupRisk: '',
  populationNoteMd: '',
};

function fromGenetic(g: DiseaseGenetic): FormState {
  return {
    geneSymbol: g.geneSymbol ?? '',
    variantType: g.variantType ?? '',
    inheritancePattern: g.inheritancePattern ?? '',
    penetrance: g.penetrance !== null && g.penetrance !== undefined ? String(g.penetrance) : '',
    bloodGroupRisk: g.bloodGroupRisk ?? '',
    populationNoteMd: g.populationNoteMd ?? '',
  };
}

export function GeneticFormDialog({ open, onClose, slug, diseaseId, genetic }: Props) {
  const { t } = useLocale();
  const [form, setForm] = useState<FormState>(EMPTY);

  const createMut = useCreateGenetic(slug, diseaseId);
  const updateMut = useUpdateGenetic(slug, diseaseId);
  const pending = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (open) setForm(genetic ? fromGenetic(genetic) : EMPTY);
  }, [open, genetic]);

  const isEdit = !!genetic;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Penetrance validatsiyasi — 0..1 oralig'ida bo'lishi kerak (Decimal(4,3)).
    const penVal = form.penetrance.trim() ? Number(form.penetrance) : null;
    if (penVal !== null && (Number.isNaN(penVal) || penVal < 0 || penVal > 1)) {
      toast.error(t('kb.metadata.genetic.penetranceRange'));
      return;
    }

    const payload = {
      geneSymbol: form.geneSymbol.trim() || null,
      variantType: form.variantType.trim() || null,
      inheritancePattern: form.inheritancePattern || null,
      penetrance: penVal,
      bloodGroupRisk: form.bloodGroupRisk || null,
      populationNoteMd: form.populationNoteMd.trim() || null,
    };

    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id: genetic!.id, input: payload });
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('kb.metadata.genetic.editTitle')
              : t('kb.metadata.genetic.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={t('disease.genetics.gene')}>
              <Input
                value={form.geneSymbol}
                onChange={(e) => setForm((f) => ({ ...f, geneSymbol: e.target.value }))}
                placeholder="TCF7L2"
                className="font-mono"
              />
            </Field>

            <Field label={t('disease.genetics.variant')}>
              <Input
                value={form.variantType}
                onChange={(e) => setForm((f) => ({ ...f, variantType: e.target.value }))}
                placeholder="SNP (rs7903146)"
              />
            </Field>

            <Field label={t('disease.genetics.inheritance')}>
              <Select
                value={form.inheritancePattern || NONE_VALUE}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    inheritancePattern: v === NONE_VALUE ? '' : (v as InheritancePattern),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>—</SelectItem>
                  {INHERITANCE.map((ip) => (
                    <SelectItem key={ip} value={ip}>
                      {t(`disease.genetics.inheritance.${ip}` as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={`${t('disease.genetics.penetrance')} (0.000–1.000)`}>
              <Input
                type="number"
                step="0.001"
                min="0"
                max="1"
                value={form.penetrance}
                onChange={(e) => setForm((f) => ({ ...f, penetrance: e.target.value }))}
                placeholder="0.150"
              />
            </Field>

            <Field label={t('disease.genetics.bloodGroup')}>
              <Select
                value={form.bloodGroupRisk || NONE_VALUE}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    bloodGroupRisk: v === NONE_VALUE ? '' : (v as BloodGroup),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>—</SelectItem>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {BLOOD_LABEL[bg]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={t('kb.metadata.genetic.populationNote')}>
            <Textarea
              rows={4}
              value={form.populationNoteMd}
              onChange={(e) =>
                setForm((f) => ({ ...f, populationNoteMd: e.target.value }))
              }
              placeholder="Markdown qo'llab-quvvatlanadi"
            />
          </Field>

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
