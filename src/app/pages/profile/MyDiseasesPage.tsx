import React from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Activity, ChevronRight, Loader2,
  Send, Clock, CheckCircle2, AlertCircle, Stethoscope, XCircle,
} from 'lucide-react';
import { apiFetch } from '../../api/http';

// Shifokor "Rad etish" flow doctorNote'ga [REJECT] prefix qo'yadi.
// Bu konventsiya TriageActionBar (REJECT_PREFIX) bilan sinxron bo'lishi shart.
const REJECT_PREFIX = '[REJECT]';

interface ParsedDoctorNote {
  kind: 'confirmed' | 'rejected';
  body: string;
}

function parseDoctorNote(raw: string | null): ParsedDoctorNote | null {
  if (!raw) return null;
  const trimmed = raw.trimStart();
  if (trimmed.startsWith(REJECT_PREFIX)) {
    return {
      kind: 'rejected',
      body: trimmed.slice(REJECT_PREFIX.length).trimStart(),
    };
  }
  return { kind: 'confirmed', body: raw };
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface MySession {
  id: string;
  matchScore: number;
  status: 'ACTIVE' | 'SENT_TO_DOCTOR' | 'EXPIRED' | 'ARCHIVED';
  doctorNote: string | null;
  doctorRespondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  disease: { id: string; slug: string; icd10: string; nameUz: string } | null;
  matchedSymptomCount: number;
  missingSymptomCount: number;
}

interface MySessionsResponse {
  items: MySession[];
  total: number;
  page: number;
  limit: number;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

function useMyDiseases() {
  return useQuery({
    queryKey: ['my-sessions'],
    queryFn: () => apiFetch<MySessionsResponse>('/triage/my-sessions'),
    staleTime: 60_000,
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getStatusConfig(session: MySession) {
  // ARCHIVED with doctorNote — decision was either confirmed or rejected
  if (session.status === 'ARCHIVED' && session.doctorNote) {
    const parsed = parseDoctorNote(session.doctorNote);
    if (parsed?.kind === 'rejected') {
      return {
        label: 'Shifokor rad etdi',
        icon: <XCircle className="w-3 h-3" />,
        color: 'text-red-500 bg-red-500/10',
      };
    }
    return {
      label: "Shifokor javob berdi",
      icon: <Stethoscope className="w-3 h-3" />,
      color: 'text-violet-500 bg-violet-500/10',
    };
  }
  const map: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    ACTIVE: {
      label: 'Faol',
      icon: <Activity className="w-3 h-3" />,
      color: 'text-blue-400 bg-blue-500/10',
    },
    SENT_TO_DOCTOR: {
      label: 'Shifokorga yuborilgan',
      icon: <Send className="w-3 h-3" />,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    EXPIRED: {
      label: "Muddati o'tgan",
      icon: <Clock className="w-3 h-3" />,
      color: 'text-slate-400 bg-slate-500/10',
    },
    ARCHIVED: {
      label: 'Arxivlangan',
      icon: <CheckCircle2 className="w-3 h-3" />,
      color: 'text-slate-400 bg-slate-500/10',
    },
  };
  return map[session.status] ?? map.ACTIVE;
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 0.7) return { text: 'Yuqori moslik', color: 'text-emerald-400' };
  if (score >= 0.4) return { text: "O'rtacha moslik", color: 'text-amber-400' };
  return { text: 'Past moslik', color: 'text-red-400' };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function MyDiseasesPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useMyDiseases();
  const sessions = data?.items ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Orqaga"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-semibold">Mening tahlillarim</h1>
            <p className="text-xs text-muted-foreground">
              {data ? `${data.total} ta simptom tahlili` : 'Yuklanmoqda...'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Yuklab bo'lmadi</p>
                <p className="text-xs text-muted-foreground mt-0.5">Serverga ulanish mavjud emas.</p>
              </div>
            </div>
            <button
              onClick={() => void refetch()}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Qayta urinish
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && sessions.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm">
              Hali hech qanday simptom tahlili yo'q.
            </p>
            <p className="text-xs text-muted-foreground">
              Kasallik kartasidan "Meni tekshirib ko'ring" tugmasini bosing.
            </p>
            <button
              onClick={() => navigate('/kasalliklar')}
              className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl
                         text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Kasalliklar bazasiga o'tish
            </button>
          </div>
        )}

        {/* Session cards */}
        {sessions.map((session) => {
          const statusCfg = getStatusConfig(session);
          const { text: scoreText, color: scoreColor } = scoreLabel(session.matchScore);
          const parsedNote = parseDoctorNote(session.doctorNote);
          const isRejected = parsedNote?.kind === 'rejected';
          const hasDoctorNote = !!parsedNote;

          return (
            <div
              key={session.id}
              className={[
                'bg-card border rounded-2xl overflow-hidden transition-colors cursor-pointer group',
                isRejected
                  ? 'border-red-300 hover:border-red-400'
                  : hasDoctorNote
                    ? 'border-violet-300 hover:border-violet-400'
                    : 'border-border hover:border-foreground/20',
              ].join(' ')}
              onClick={() => navigate(`/kasalliklar/${session.disease?.slug ?? ''}`)}
            >
              <div className="px-5 py-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {session.disease?.nameUz ?? "Noma'lum kasallik"}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {session.disease?.icd10 && (
                      <span className="font-mono text-xs text-muted-foreground bg-muted
                                       px-2 py-0.5 rounded">
                        {session.disease.icd10}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(session.updatedAt)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1
                                         group-hover:text-foreground transition-colors" />
              </div>

              {/* Doctor note banner — violet for confirmed, red for rejected */}
              {hasDoctorNote && parsedNote && (
                <div
                  className={[
                    'mx-5 mb-3 rounded-xl border px-4 py-3',
                    isRejected
                      ? 'bg-red-50 border-red-200'
                      : 'bg-violet-50 border-violet-200',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {isRejected ? (
                      <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    ) : (
                      <Stethoscope className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    )}
                    <span
                      className={[
                        'text-xs font-semibold',
                        isRejected ? 'text-red-700' : 'text-violet-700',
                      ].join(' ')}
                    >
                      {isRejected ? 'Shifokor rad etdi' : 'Shifokor tavsiyasi'}
                      {session.doctorRespondedAt && (
                        <span
                          className={[
                            'font-normal ml-1.5',
                            isRejected ? 'text-red-500' : 'text-violet-500',
                          ].join(' ')}
                        >
                          · {formatDate(session.doctorRespondedAt)}
                        </span>
                      )}
                    </span>
                  </div>
                  <p
                    className={[
                      'text-sm leading-relaxed whitespace-pre-wrap',
                      isRejected ? 'text-red-900' : 'text-violet-900',
                    ].join(' ')}
                  >
                    {parsedNote.body}
                  </p>
                </div>
              )}

              {/* Stats bar */}
              <div className="border-t border-border px-5 py-3 flex items-center gap-4 flex-wrap">
                {/* Match score gauge */}
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={[
                        'h-full rounded-full',
                        session.matchScore >= 0.7 ? 'bg-emerald-500' :
                        session.matchScore >= 0.4 ? 'bg-amber-500' : 'bg-red-500',
                      ].join(' ')}
                      style={{ width: `${Math.round(session.matchScore * 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${scoreColor}`}>
                    {Math.round(session.matchScore * 100)}% — {scoreText}
                  </span>
                </div>

                <span className="text-xs text-muted-foreground">
                  {session.matchedSymptomCount} mos simptom
                </span>

                {/* Status */}
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5
                                   rounded-full ml-auto ${statusCfg.color}`}>
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              </div>
            </div>
          );
        })}

        {data && data.total > sessions.length && (
          <p className="text-center text-xs text-muted-foreground py-2">
            Ko'rsatilmoqda: {sessions.length} / {data.total}
          </p>
        )}
      </div>
    </div>
  );
}
