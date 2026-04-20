import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { SymptomAnswerGroupedList } from '../../components/screens/doctor/SymptomAnswerGroupedList';
import { TriageActionBar } from '../../components/screens/doctor/TriageActionBar';
import { useTriageSession } from '../../hooks/useDoctorInbox';

// ─── Tip: backend'dan keluvchi session obyekti ────────────────────────────────
interface SessionDisease {
  id: string;
  slug: string;
  icd10: string;
  nameUz: string;
}

interface RawSession {
  id: string;
  userId: number | null;
  matchScore: number;
  matchedSymptoms: string[];
  missingSymptoms: string[];
  userAnswers: Record<string, string>;
  status: string;
  createdAt: string;
  updatedAt: string;
  disease: SessionDisease | null;
}

// ─── userAnswers → SymptomAnswerGroupedList uchun FhirItem'ga aylantirish ────
function answersToFhirItems(
  userAnswers: Record<string, string>,
  matchedSymptoms: string[],
) {
  return Object.entries(userAnswers).map(([code, answer]) => ({
    linkId: code,
    text: matchedSymptoms.includes(code) ? `${code} ✓` : code,
    answer: [{ valueCoding: { code: answer.toUpperCase(), display: answer } }],
  }));
}

// ─── Yordamchi: match score rangi ────────────────────────────────────────────
function scoreColorClass(pct: number) {
  if (pct >= 60) return 'bg-green-100 text-green-700 border-green-200';
  if (pct >= 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

// ─── CaseDetailPage ───────────────────────────────────────────────────────────
export function CaseDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useTriageSession(id);
  const session = data as RawSession | undefined;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm">Yuklanmoqda…</span>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError || !session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Orqaga
        </button>
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Sessiya topilmadi yoki ruxsat yo'q.
        </div>
      </div>
    );
  }

  const pct = Math.round(Math.min(1, Math.max(0, session.matchScore)) * 100);
  const fhirItems = answersToFhirItems(
    session.userAnswers ?? {},
    session.matchedSymptoms ?? [],
  );
  const date = new Date(session.createdAt).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Orqaga tugma */}
      <button
        type="button"
        onClick={() => navigate('/shifokor/inbox')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Inbox
      </button>

      {/* Asosiy karta */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {session.disease?.icd10 && (
                <Badge variant="outline" className="font-mono text-xs">
                  {session.disease.icd10}
                </Badge>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-xs border font-semibold ${scoreColorClass(pct)}`}>
                Moslik: {pct}%
              </span>
            </div>
            <p className="text-base font-semibold text-foreground">
              {session.disease?.nameUz ?? "Noma'lum kasallik"}
            </p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>

          {session.disease?.slug && (
            <Link
              to={`/kasalliklar/${session.disease.slug}`}
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

        {/* Ko'rsatgichlar */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="text-2xl font-bold text-green-700">
              {session.matchedSymptoms?.length ?? 0}
            </div>
            <div className="text-xs text-green-600 mt-0.5">Mos simptom</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="text-2xl font-bold text-gray-600">
              {session.missingSymptoms?.length ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Etishmaydi</div>
          </div>
        </div>

        <Separator />

        {/* Simptom javoblari */}
        {fhirItems.length > 0 ? (
          <SymptomAnswerGroupedList items={fhirItems} />
        ) : (
          <p className="text-sm text-muted-foreground">Simptom javoblari mavjud emas.</p>
        )}

        {/* Harakatlar */}
        <TriageActionBar messageId={session.id} />
      </div>
    </div>
  );
}
