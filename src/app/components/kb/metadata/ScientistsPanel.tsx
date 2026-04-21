import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Users } from 'lucide-react';
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
  useDiseaseScientists,
  useDeleteScientist,
} from '../../../hooks/useDiseases';
import { useLocale } from '../../../store/LocaleContext';
import { ScientistFormDialog } from './ScientistFormDialog';
import type { DiseaseScientist } from '../../../types/api/disease';
import type { TranslationKey } from '../../../lib/i18n';

interface Props {
  slug: string;
  diseaseId: string;
}

export function ScientistsPanel({ slug, diseaseId }: Props) {
  const { t } = useLocale();
  const { data, isLoading } = useDiseaseScientists(slug);
  const deleteMut = useDeleteScientist(slug, diseaseId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiseaseScientist | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiseaseScientist | null>(null);

  const handleEdit = (s: DiseaseScientist) => {
    setEditing(s);
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
          <Users className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold">{t('disease.scientists.title')}</h3>
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
          {t('disease.scientists.empty')}
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-border bg-card p-3 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{s.fullName}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {t(`disease.scientists.role.${s.role}` as TranslationKey)}
                  </Badge>
                </div>
                {(s.country || s.birthYear || s.deathYear) && (
                  <div className="text-xs text-muted-foreground">
                    {[s.country, [s.birthYear, s.deathYear].filter(Boolean).join('–')]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                )}
                {s.bioMd && (
                  <p className="text-xs text-foreground/80 line-clamp-2">{s.bioMd}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleEdit(s)}
                  title={t('common.save')}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(s)}
                  title={t('kb.metadata.delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ScientistFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        slug={slug}
        diseaseId={diseaseId}
        scientist={editing}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('kb.metadata.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('kb.metadata.deleteConfirmDesc')}
              {deleteTarget && (
                <span className="block mt-1 font-medium text-foreground">
                  {deleteTarget.fullName}
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
