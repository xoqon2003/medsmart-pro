import { useNavigate } from 'react-router';
import { ChevronRightIcon } from 'lucide-react';
import type { DiseaseListItem as DiseaseListItemType } from '../../types/api/disease';

interface DiseaseListItemProps {
  disease: DiseaseListItemType;
}

const STATUS_COLOR: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-700',
  APPROVED:  'bg-blue-100 text-blue-700',
  REVIEW:    'bg-yellow-100 text-yellow-700',
  DRAFT:     'bg-gray-100 text-gray-600',
  REJECTED:  'bg-red-100 text-red-700',
  ARCHIVED:  'bg-gray-100 text-gray-400',
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Nashr',
  APPROVED:  'Tasdiqlangan',
  REVIEW:    'Ko\'rib chiqilmoqda',
  DRAFT:     'Qoralama',
  REJECTED:  'Rad etilgan',
  ARCHIVED:  'Arxiv',
};

export function DiseaseListItem({ disease }: DiseaseListItemProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/kasalliklar/' + disease.slug)}
      className="w-full text-left bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-3 hover:bg-accent/40 transition-colors active:scale-[0.99]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-xs text-muted-foreground">{disease.icd10}</span>
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLOR[disease.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {STATUS_LABEL[disease.status] ?? disease.status}
          </span>
        </div>
        <p className="text-sm font-medium truncate">{disease.nameUz}</p>
        {disease.nameLat && (
          <p className="text-xs text-muted-foreground truncate italic">{disease.nameLat}</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{disease.category}</p>
      </div>
      <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
    </button>
  );
}
