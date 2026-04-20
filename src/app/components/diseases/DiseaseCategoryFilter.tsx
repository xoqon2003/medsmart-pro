interface DiseaseCategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const CATEGORIES = [
  { value: '', label: 'Barchasi' },
  { value: 'yurak-qon-tomir', label: 'Yurak-qon tomir' },
  { value: 'nafas-olish', label: 'Nafas olish' },
  { value: 'hazm-qilish', label: 'Hazm qilish' },
  { value: 'endokrin', label: 'Endokrin' },
  { value: 'nevrologiya', label: 'Nevrologiya' },
  { value: 'infeksion', label: 'Infeksion' },
  { value: 'ortopediya', label: 'Ortopediya' },
];

export function DiseaseCategoryFilter({ selected, onChange }: DiseaseCategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-1 scrollbar-none">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selected === cat.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
