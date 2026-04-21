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
import { useCreateScientist, useUpdateScientist } from '../../../hooks/useDiseases';
import { useLocale } from '../../../store/LocaleContext';
import type { DiseaseScientist, ScientistRole } from '../../../types/api/disease';
import type { TranslationKey } from '../../../lib/i18n';

const ROLES: ScientistRole[] = [
  'DISCOVERER',
  'CLASSIFIER',
  'CONTRIBUTOR',
  'RESEARCHER',
  'EDITOR',
];

interface Props {
  open: boolean;
  onClose: () => void;
  slug: string;
  diseaseId: string;
  /** Mavjud yozuv bo'lsa — edit rejimi; aks holda create. */
  scientist: DiseaseScientist | null;
}

type FormState = {
  fullName: string;
  role: ScientistRole;
  country: string;
  birthYear: string;
  deathYear: string;
  bioMd: string;
  contributionsMd: string;
  photoUrl: string;
  orderIndex: string;
};

const EMPTY: FormState = {
  fullName: '',
  role: 'CONTRIBUTOR',
  country: '',
  birthYear: '',
  deathYear: '',
  bioMd: '',
  contributionsMd: '',
  photoUrl: '',
  orderIndex: '',
};

function fromScientist(s: DiseaseScientist): FormState {
  return {
    fullName: s.fullName,
    role: s.role,
    country: s.country ?? '',
    birthYear: s.birthYear?.toString() ?? '',
    deathYear: s.deathYear?.toString() ?? '',
    bioMd: s.bioMd ?? '',
    contributionsMd: s.contributionsMd ?? '',
    photoUrl: s.photoUrl ?? '',
    orderIndex: s.orderIndex.toString(),
  };
}

export function ScientistFormDialog({ open, onClose, slug, diseaseId, scientist }: Props) {
  const { t } = useLocale();
  const [form, setForm] = useState<FormState>(EMPTY);

  const createMut = useCreateScientist(slug, diseaseId);
  const updateMut = useUpdateScientist(slug, diseaseId);
  const pending = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (open) setForm(scientist ? fromScientist(scientist) : EMPTY);
  }, [open, scientist]);

  const isEdit = !!scientist;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error(t('kb.metadata.scientist.fullNameRequired'));
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      role: form.role,
      country: form.country.trim() || null,
      birthYear: form.birthYear ? Number(form.birthYear) : null,
      deathYear: form.deathYear ? Number(form.deathYear) : null,
      bioMd: form.bioMd.trim() || null,
      contributionsMd: form.contributionsMd.trim() || null,
      photoUrl: form.photoUrl.trim() || null,
      orderIndex: form.orderIndex ? Number(form.orderIndex) : undefined,
    };

    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id: scientist!.id, input: payload });
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
              ? t('kb.metadata.scientist.editTitle')
              : t('kb.metadata.scientist.createTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={t('kb.metadata.scientist.fullName') + ' *'}>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </Field>

            <Field label={t('kb.metadata.scientist.role')}>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v as ScientistRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`disease.scientists.role.${r}` as TranslationKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t('kb.metadata.scientist.country')}>
              <Input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </Field>

            <Field label={t('kb.metadata.scientist.photoUrl')}>
              <Input
                value={form.photoUrl}
                onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </Field>

            <Field label={t('kb.metadata.scientist.birthYear')}>
              <Input
                type="number"
                value={form.birthYear}
                onChange={(e) => setForm((f) => ({ ...f, birthYear: e.target.value }))}
              />
            </Field>

            <Field label={t('kb.metadata.scientist.deathYear')}>
              <Input
                type="number"
                value={form.deathYear}
                onChange={(e) => setForm((f) => ({ ...f, deathYear: e.target.value }))}
              />
            </Field>
          </div>

          <Field label={t('kb.metadata.scientist.bio')}>
            <Textarea
              rows={3}
              value={form.bioMd}
              onChange={(e) => setForm((f) => ({ ...f, bioMd: e.target.value }))}
              placeholder="Markdown qo'llab-quvvatlanadi"
            />
          </Field>

          <Field label={t('disease.scientists.contributions')}>
            <Textarea
              rows={2}
              value={form.contributionsMd}
              onChange={(e) => setForm((f) => ({ ...f, contributionsMd: e.target.value }))}
            />
          </Field>

          <Field label={t('kb.metadata.orderIndex')}>
            <Input
              type="number"
              value={form.orderIndex}
              onChange={(e) => setForm((f) => ({ ...f, orderIndex: e.target.value }))}
              placeholder="0"
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
