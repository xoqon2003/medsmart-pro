import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Inbox, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useDoctorInbox } from '../../hooks/useDoctorInbox';
import type { InboxSession } from '../../api/triage';

// ─── Yordamchi: match score rangi ────────────────────────────────────────────
function scoreColor(pct: number) {
  if (pct >= 60) return 'bg-green-100 text-green-700 border-green-200';
  if (pct >= 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

// ─── SessionCard ─────────────────────────────────────────────────────────────
function SessionCard({ session, onClick }: { session: InboxSession; onClick: () => void }) {
  const pct = Math.round(Math.min(1, Math.max(0, session.matchScore)) * 100);
  const date = new Date(session.createdAt).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-border shadow-sm p-4 hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Chap: kasallik + bemor */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {session.disease?.icd10 && (
              <Badge variant="outline" className="font-mono text-xs shrink-0">
                {session.disease.icd10}
              </Badge>
            )}
            <span className="font-semibold text-sm text-foreground truncate">
              {session.disease?.nameUz ?? "Noma'lum kasallik"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="truncate">
              👤 {session.patient?.displayName ?? 'Anonim'}
            </span>
            <span>{date}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="text-green-600">✓ {session.matchedSymptomCount} simptom mos</span>
            {session.missingSymptomCount > 0 && (
              <span className="text-gray-400">· {session.missingSymptomCount} etishmaydi</span>
            )}
          </div>
        </div>

        {/* O'ng: score + arrow */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`px-2.5 py-0.5 rounded-full text-xs border font-semibold ${scoreColor(pct)}`}>
            {pct}%
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
}

// ─── CasesInboxPage ───────────────────────────────────────────────────────────
export function CasesInboxPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const { data, isLoading, isError, refetch, isFetching } = useDoctorInbox({
    status: 'SENT_TO_DOCTOR',
    page,
    limit: LIMIT,
  });

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold">Kelgan natijalar</h1>
          {data && (
            <Badge variant="secondary" className="text-xs">
              {data.total}
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Yangilash"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Ma'lumotlarni yuklashda xatolik yuz berdi.
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => refetch()}>
            Qayta urish
          </Button>
        </div>
      )}

      {/* Bo'sh holat */}
      {!isLoading && !isError && data?.items.length === 0 && (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <Inbox className="w-12 h-12 mx-auto text-gray-300" />
          <p className="font-medium">Hozircha natija yo'q</p>
          <p className="text-sm">Bemor triage natijasini yuborganda bu yerda ko'rinadi.</p>
        </div>
      )}

      {/* List */}
      {data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => navigate(`/shifokor/inbox/${session.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Oldingi
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Keyingi →
          </Button>
        </div>
      )}
    </div>
  );
}
