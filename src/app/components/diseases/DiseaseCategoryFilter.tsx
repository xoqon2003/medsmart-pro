import { DISEASE_CATEGORIES, ALL_CATEGORY_OPTION } from '../../constants/disease-categories';

interface DiseaseCategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const FILTER_OPTIONS = [ALL_CATEGORY_OPTION, ...DISEASE_CATEGORIES];

export function DiseaseCategoryFilter({ selected, onChange }: DiseaseCategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-1 scrollbar-none">
      {FILTER_OPTIONS.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selected === cat.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <span role="img" aria-label={cat.labelUz}>{cat.emoji}</span>
          {cat.labelUz}
        </button>
      ))}
    </div>
  );
}
