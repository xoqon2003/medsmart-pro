import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, BookOpen, Award } from 'lucide-react';
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
  useDiseaseResearch,
  useDeleteResearch,
} from '../../../hooks/useDiseases';
import { useLocale } from '../../../store/LocaleContext';
import { ResearchFormDialog } from './ResearchFormDialog';
import type { DiseaseResearch } from '../../../types/api/disease';
import type { TranslationKey } from '../../../lib/i18n';

interface Props {
  slug: string;
  diseaseId: string;
}

export function ResearchPanel({ slug, diseaseId }: Props) {
  const { t } = useLocale();
  const { data, isLoading } = useDiseaseResearch(slug);
  const deleteMut = useDeleteResearch(slug, diseaseId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiseaseResearch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DiseaseResearch | null>(null);

  const handleEdit = (r: DiseaseResearch) => {
    setEditing(r);
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
          <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold">{t('disease.research.title')}</h3>
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
          {t('disease.research.empty')}
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <ul className="space-y-2">
          {data.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-border bg-card p-3 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start gap-1.5 flex-wrap">
                  {r.isLandmark && (
                    <Award
                      className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5"
                      aria-label={t('disease.research.landmark')}
                    />
                  )}
                  <span className="font-semibold text-sm leading-snug">{r.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.authors}
                  {r.journal ? ` — ${r.journal}` : ''} · {r.year}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    {t(`disease.research.type.${r.type}` as TranslationKey)}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {r.evidenceLevel}
                  </Badge>
                  {r.doi && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      DOI: {r.doi}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleEdit(r)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(r)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ResearchFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        slug={slug}
        diseaseId={diseaseId}
        research={editing}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('kb.metadata.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('kb.metadata.deleteConfirmDesc')}
              {deleteTarget && (
                <span className="block mt-1 font-medium text-foreground line-clamp-2">
                  {deleteTarget.title}
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
