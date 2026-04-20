import React, { useState } from 'react';

const LABEL_VARIANTS: Record<string, string[]> = {
  symptoms:   ['Simptomlar', 'Kasallik belgilari', 'Klinik belgilar'],
  diagnosis:  ['Diagnostika', "Tashxis qo'yish", 'Tekshiruv usullari'],
  treatment:  ['Davolash', "Davolash usullari", 'Terapiya'],
  prevention: ['Oldini olish', 'Profilaktika', "Kasallikning oldini olish"],
  prognosis:  ['Prognoz', 'Natija', "Kasallik oqibati"],
};

interface SynonymLabelPickerProps {
  marker: string;
  value: string;
  onChange: (label: string) => void;
}

export function SynonymLabelPicker({ marker, value, onChange }: SynonymLabelPickerProps) {
  const [custom, setCustom] = useState(false);
  const variants = LABEL_VARIANTS[marker];

  if (!variants) return null;

  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-400 block">Label varianti</label>
      {custom ? (
        <div className="flex gap-2">
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Custom label..."
            className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => setCustom(false)}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
          >
            Ro'yxatdan
          </button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {variants.map(v => (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                value === v
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
          <button
            onClick={() => setCustom(true)}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-500 hover:text-white"
          >
            + Custom
          </button>
        </div>
      )}
    </div>
  );
}
