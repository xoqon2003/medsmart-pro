import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useDiseaseDetail } from '../../hooks/useDiseases';

interface DiseaseModalPreviewProps {
  slug: string;
  open: boolean;
  onClose: () => void;
}

export function DiseaseModalPreview({ slug, open, onClose }: DiseaseModalPreviewProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDiseaseDetail(slug);

  function handleOpenFull() {
    onClose();
    navigate('/kasalliklar/' + slug);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {isError && (
          <div className="py-6 text-center text-destructive text-sm">
            Ma&apos;lumot yuklanmadi
          </div>
        )}

        {data && (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg leading-snug">{data.nameUz}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                  {data.icd10}
                </span>
                {data.nameLat && (
                  <span className="text-xs text-muted-foreground italic">{data.nameLat}</span>
                )}
              </div>
            </DialogHeader>

            {/* Birinchi 2-3 blok */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {data.blocks.slice(0, 3).map((block) => (
                <div key={block.id} className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    {block.label}
                  </p>
                  <p className="text-sm leading-relaxed line-clamp-4">{block.contentMd}</p>
                </div>
              ))}
              {data.blocks.length === 0 && (
                <p className="text-sm text-muted-foreground">Bloklar mavjud emas</p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button onClick={handleOpenFull} size="sm">
                To&apos;liq ochish
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
