import { useEffect, useRef, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { useLocale } from '../../store/LocaleContext';

interface DiseaseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function DiseaseSearchBar({ value, onChange }: DiseaseSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setLocalValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(v);
    }, 300);
  }

  return (
    <div className="relative mb-3">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={t('diseases.search.placeholder')}
        className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
      />
    </div>
  );
}
