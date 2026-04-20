import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, Minus } from 'lucide-react';

interface FhirItem {
  linkId: string;
  text?: string;
  answer?: Array<{ valueCoding?: { code: string; display?: string } }>;
}

interface Props {
  items: FhirItem[];
}

type AnswerGroup = 'YES' | 'NO' | 'SOMETIMES' | 'UNKNOWN';

function getGroup(code: string | undefined): AnswerGroup {
  if (!code) return 'UNKNOWN';
  const upper = code.toUpperCase();
  if (upper === 'YES') return 'YES';
  if (upper === 'NO') return 'NO';
  if (upper === 'SOMETIMES') return 'SOMETIMES';
  return 'UNKNOWN';
}

const GROUP_CONFIG: Record<
  AnswerGroup,
  { label: string; icon: React.ReactNode; cardClass: string }
> = {
  YES: {
    label: 'Ha ✓',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />,
    cardClass: 'bg-green-50 border-green-200 text-green-800',
  },
  NO: {
    label: "Yo'q ✗",
    icon: <XCircle className="w-3.5 h-3.5 text-gray-500" />,
    cardClass: 'bg-gray-50 border-gray-200 text-gray-700',
  },
  SOMETIMES: {
    label: "Ba'zan ~",
    icon: <Minus className="w-3.5 h-3.5 text-blue-500" />,
    cardClass: 'bg-blue-50 border-blue-200 text-blue-800',
  },
  UNKNOWN: {
    label: "Noma'lum ?",
    icon: <HelpCircle className="w-3.5 h-3.5 text-yellow-500" />,
    cardClass: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  },
};

export function SymptomAnswerGroupedList({ items }: Props) {
  const groups: Record<AnswerGroup, FhirItem[]> = {
    YES: [],
    NO: [],
    SOMETIMES: [],
    UNKNOWN: [],
  };

  for (const item of items) {
    const code = item.answer?.[0]?.valueCoding?.code;
    groups[getGroup(code)].push(item);
  }

  const order: AnswerGroup[] = ['YES', 'SOMETIMES', 'NO', 'UNKNOWN'];

  return (
    <div className="space-y-4">
      {order.map((groupKey) => {
        const cfg = GROUP_CONFIG[groupKey];
        const groupItems = groups[groupKey];
        if (groupItems.length === 0) return null;
        return (
          <div key={groupKey}>
            <div className="flex items-center gap-1.5 mb-2">
              {cfg.icon}
              <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{groupItems.length} ta</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pl-5">
              {groupItems.map((item) => (
                <span
                  key={item.linkId}
                  className={`px-2.5 py-1 rounded-full text-xs border ${cfg.cardClass}`}
                >
                  {item.text ?? item.linkId}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
