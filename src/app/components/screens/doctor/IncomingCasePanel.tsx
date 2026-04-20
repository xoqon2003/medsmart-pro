import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { SymptomAnswerGroupedList } from './SymptomAnswerGroupedList';
import { TriageActionBar } from './TriageActionBar';

interface FhirItem {
  linkId: string;
  text?: string;
  answer?: Array<{ valueCoding?: { code: string; display?: string } }>;
}

interface FhirQuestionnaireResponse {
  resourceType: 'QuestionnaireResponse';
  status: string;
  subject?: { display?: string };
  extension?: Array<{ url: string; valueDecimal?: number; valueString?: string }>;
  item: FhirItem[];
}

interface Props {
  /** ID of a TRIAGE_RESULT type message */
  messageId: string;
  /** Raw JSON content of the message (already fetched by parent) */
  content: string;
}

function getExtensionValue<T>(
  response: FhirQuestionnaireResponse,
  url: string,
): T | undefined {
  const ext = response.extension?.find((e) => e.url === url);
  if (!ext) return undefined;
  return (ext.valueDecimal ?? ext.valueString) as T;
}

export function IncomingCasePanel({ messageId, content }: Props) {
  const parsed = useMemo<FhirQuestionnaireResponse | null>(() => {
    try {
      return JSON.parse(content) as FhirQuestionnaireResponse;
    } catch {
      return null;
    }
  }, [content]);

  if (!parsed) {
    return (
      <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Triage natijasini o'qib bo'lmadi.
      </div>
    );
  }

  const matchScore = getExtensionValue<number>(parsed, 'matchScore') ?? 0;
  const diseaseName = getExtensionValue<string>(parsed, 'diseaseName') ?? 'Noma\'lum kasallik';
  const icd10 = getExtensionValue<string>(parsed, 'icd10') ?? '';
  const diseaseSlug = getExtensionValue<string>(parsed, 'diseaseSlug') ?? '';

  const scorePct = Math.round(Math.min(1, Math.max(0, matchScore)) * 100);
  const scoreColor =
    scorePct >= 60
      ? 'bg-green-100 text-green-700 border-green-200'
      : scorePct >= 30
      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
      : 'bg-red-100 text-red-700 border-red-200';

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {icd10 && (
              <Badge variant="outline" className="font-mono text-xs">
                {icd10}
              </Badge>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs border font-semibold ${scoreColor}`}
            >
              Moslik: {scorePct}%
            </span>
          </div>

          <p className="text-sm font-semibold text-foreground">{diseaseName}</p>
        </div>

        {diseaseSlug && (
          <Link
            to={`/kasalliklar/${diseaseSlug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
          >
            Kasallik sahifasi
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>

      <Separator />

      {/* Symptom answers */}
      {parsed.item.length > 0 ? (
        <SymptomAnswerGroupedList items={parsed.item} />
      ) : (
        <p className="text-sm text-muted-foreground">Simptom javoblari mavjud emas.</p>
      )}

      {/* Action bar */}
      <TriageActionBar messageId={messageId} />
    </div>
  );
}
