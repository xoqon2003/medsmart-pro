import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Dna } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import {
  useDiseaseGenetics,
  useDeleteGenetic,
} from '../../../hooks/useDiseases';
import { useLocale } from '../../../store/LocaleContext';
import { GeneticFormDialog } from './GeneticFormDialog';
import type { DiseaseGenetic } from '../../../types/api/disease';
import type { TranslationKey } from '../../../lib/i18n';

const BLOOD_LABEL: Record<string, string> = {
  A_POS: 'A+', A_NEG: 'A−',
  B_POS: 'B+', B_NEG: 'B−',
  AB_POS: 'AB+', AB_NEG: 'AB−',
  O_POS: 'O+', O_NEG: 'O−',
};

interface Props {
  slug: string;
  diseaseId: string;
}

export function GeneticsPanel({ slug, diseaseId }: Props) {
  const { t } = useLocale();
  const { data, isLoading } = useDiseaseGenetics(slug);
  const deleteMut = useDeleteGenetic(slug, diseaseId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiseaseGenetic | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiseaseGenetic | null>(null);

  const handleEdit = (g: DiseaseGenetic) => {
    setEditing(g);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success(t('kb.metadata.deleted'));
      setDeleteTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold">{t('disease.genetics.title')}</h3>
          {data && <span className="text-xs text-muted-foreground">({data.length})</span>}
        </div>
        <Button size="sm" onClick={handleCreate} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {t('kb.metadata.add')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      )}

      {!isLoading && data && data.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
          {t('disease.genetics.empty')}
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((g) => (
            <li
              key={g.id}
              className="rounded-lg border border-border bg-card p-3 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {g.geneSymbol && (
                    <Badge variant="default" className="font-mono text-[10px]">
                      {g.geneSymbol}
                    </Badge>
                  )}
                  {g.variantType && (
                    <span className="text-xs text-muted-foreground">{g.variantType}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  {g.inheritancePattern && (
                    <span className="text-muted-foreground">
                      {t(`disease.genetics.inheritance.${g.inheritancePattern}` as TranslationKey)}
                    </span>
                  )}
                  {g.penetrance !== null && g.penetrance !== undefined && (
                    <span className="text-muted-foreground font-mono">
                      {formatPenetrance(g.penetrance)}
                    </span>
                  )}
                  {g.bloodGroupRisk && (
                    <span className="text-muted-foreground font-mono">
                      {BLOOD_LABEL[g.bloodGroupRisk] ?? g.bloodGroupRisk}
                    </span>
                  )}
                </div>
                {g.populationNoteMd && (
                  <p className="text-xs text-foreground/80 line-clamp-2">
                    {g.populationNoteMd}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleEdit(g)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(g)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <GeneticFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        slug={slug}
        diseaseId={diseaseId}
        genetic={editing}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('kb.metadata.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('kb.metadata.deleteConfirmDesc')}
              {deleteTarget?.geneSymbol && (
                <span className="block mt-1 font-mono font-medium text-foreground">
                  {deleteTarget.geneSymbol}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('kb.metadata.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatPenetrance(val: string | number): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (Number.isNaN(num)) return '';
  return `${(num * 100).toFixed(1)}%`;
}
