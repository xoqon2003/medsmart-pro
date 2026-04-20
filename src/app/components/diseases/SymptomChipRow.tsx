import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AnswerValue } from '../../types/api/triage';
import type { DiseaseSymptomWithWeight } from '../../types/api/symptom';

interface Props {
  symptom: DiseaseSymptomWithWeight;
  answer: AnswerValue | undefined;
  onChange: (code: string, answer: AnswerValue) => void;
}

const CHIP_STYLES: Record<AnswerValue, string> = {
  YES: 'bg-green-100 text-green-800 border-green-300',
  NO: 'bg-red-100 text-red-800 border-red-300',
  UNKNOWN: 'bg-gray-100 text-gray-600 border-gray-300',
  SOMETIMES: 'bg-blue-100 text-blue-800 border-blue-300',
};

const CHIP_LABELS: Record<AnswerValue, string> = {
  YES: 'Ha',
  NO: "Yo'q",
  UNKNOWN: 'Bilmayman',
  SOMETIMES: "Ba'zan",
};

const ALL_VALUES: AnswerValue[] = ['YES', 'NO', 'UNKNOWN', 'SOMETIMES'];

export function SymptomChipRow({ symptom, answer, onChange }: Props) {
  return (
    <div className="py-3 border-b border-border/50 last:border-0">
      <div className="flex items-start gap-1.5 mb-2">
        {symptom.isRedFlag && (
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
        )}
        <span className="text-sm text-foreground leading-snug">{symptom.nameUz}</span>
        {symptom.isRequired && (
          <span className="text-red-500 text-xs shrink-0 mt-0.5">*</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL_VALUES.map((val) => {
          const selected = answer === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(symptom.code, val)}
              className={`px-3 py-1 rounded-full text-xs border transition-all select-none ${
                selected
                  ? CHIP_STYLES[val] + ' ring-2 ring-offset-1 ring-current font-medium'
                  : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
              }`}
            >
              {CHIP_LABELS[val]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
