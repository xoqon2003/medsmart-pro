import React from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import type { AnswerValue } from '../../types/api/triage';
import type { DiseaseSymptomWithWeight } from '../../types/api/symptom';

interface Props {
  symptoms: DiseaseSymptomWithWeight[];
  answers: Map<string, AnswerValue>;
}

interface Group {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
  items: DiseaseSymptomWithWeight[];
}

export function MatchDiffSummary({ symptoms, answers }: Props) {
  const matched: DiseaseSymptomWithWeight[] = [];
  const missing: DiseaseSymptomWithWeight[] = [];
  const unknown: DiseaseSymptomWithWeight[] = [];

  for (const sym of symptoms) {
    const ans = answers.get(sym.code);
    if (ans === 'YES' || ans === 'SOMETIMES') {
      matched.push(sym);
    } else if (ans === 'NO') {
      missing.push(sym);
    } else {
      unknown.push(sym);
    }
  }

  const groups: Group[] = [
    {
      label: 'Mavjud',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />,
      badgeClass: 'bg-green-100 text-green-700 border-green-200',
      items: matched,
    },
    {
      label: "Yo'q",
      icon: <XCircle className="w-3.5 h-3.5 text-red-500" />,
      badgeClass: 'bg-red-100 text-red-700 border-red-200',
      items: missing,
    },
    {
      label: "Noma'lum",
      icon: <HelpCircle className="w-3.5 h-3.5 text-yellow-500" />,
      badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      items: unknown,
    },
  ];

  if (symptoms.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Natijalar xulosasi
      </p>
      {groups.map((g) => (
        <div key={g.label}>
          <div className="flex items-center gap-1.5 mb-1.5">
            {g.icon}
            <span className="text-xs font-medium text-foreground">{g.label}</span>
            <span
              className={`ml-auto px-2 py-0.5 rounded-full text-xs border ${g.badgeClass}`}
            >
              {g.items.length}
            </span>
          </div>
          {g.items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pl-5">
              {g.items.map((sym) => (
                <span
                  key={sym.code}
                  className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs"
                >
                  {sym.nameUz}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
