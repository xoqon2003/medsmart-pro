import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { updateTriageSession } from '../../../api/triage';

interface Props {
  messageId: string;
}

type ActionState = 'idle' | 'composing' | 'submitting' | 'rejecting';

const NOTE_PLACEHOLDER =
  "Shifokor tavsiyasi (ixtiyoriy):\n" +
  "– Qo'shimcha tekshiruvlar...\n" +
  "– Dori-darmonlar...\n" +
  "– Kasalxonaga murojaat qilish...";

export function TriageActionBar({ messageId }: Props) {
  const [state, setState] = useState<ActionState>('idle');
  const [note, setNote]   = useState('');
  const qc                = useQueryClient();
  const navigate          = useNavigate();

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['triage-session', messageId] });
    await qc.invalidateQueries({ queryKey: ['doctor-inbox'] });
  };

  // ── Confirm — opens note composer first ────────────────────────────────────
  const handleOpenCompose = () => {
    if (state !== 'idle') return;
    setState('composing');
  };

  const handleConfirm = async () => {
    setState('submitting');
    try {
      await updateTriageSession(messageId, 'ARCHIVED', note.trim() || undefined);
      await invalidate();
      toast.success('Diagnoz tasdiqlandi', {
        description: note.trim()
          ? 'Tavsiyangiz bemorga yuborildi.'
          : undefined,
        duration: 4000,
      });
      navigate('/shifokor/inbox');
    } catch {
      toast.error("Xato yuz berdi. Qayta urinib ko'ring.");
      setState('composing');
    }
  };

  // ── Reject — direct (no note required) ────────────────────────────────────
  const handleReject = async () => {
    if (state !== 'idle' && state !== 'composing') return;
    setState('rejecting');
    try {
      await updateTriageSession(messageId, 'ARCHIVED');
      await invalidate();
      toast.info('Sessiya rad etildi va arxivlandi');
      navigate('/shifokor/inbox');
    } catch {
      toast.error("Xato yuz berdi. Qayta urinib ko'ring.");
      setState('idle');
    }
  };

  const busy = state === 'submitting' || state === 'rejecting';

  return (
    <div className="space-y-3 pt-4 border-t border-border">

      {/* Note composer — shown when doctor clicks "Tasdiqlash" */}
      {(state === 'composing' || state === 'submitting') && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Bemor uchun tavsiya (ixtiyoriy, max 2000 belgi)
          </label>
          <textarea
            className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm
                       resize-none placeholder:text-muted-foreground/50 focus:outline-none
                       focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            rows={4}
            maxLength={2000}
            placeholder={NOTE_PLACEHOLDER}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={state === 'submitting'}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{note.length} / 2000</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => { setState('idle'); setNote(''); }}
              >
                Bekor
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                disabled={busy}
                onClick={() => void handleConfirm()}
              >
                {state === 'submitting' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                Yuborish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {state === 'idle' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleOpenCompose}
          >
            <CheckCircle className="w-4 h-4" />
            Diagnoz tasdiqlash
            <ChevronDown className="w-3 h-3 ml-auto opacity-60" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => void handleReject()}
          >
            <XCircle className="w-4 h-4" />
            Rad etish
          </Button>
        </div>
      )}

      {/* While rejecting */}
      {state === 'rejecting' && (
        <div className="flex gap-2">
          <Button size="sm" disabled className="flex-1 gap-1.5">
            <Loader2 className="w-4 h-4 animate-spin" />
            Rad etilmoqda...
          </Button>
        </div>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground text-center">
        Tasdiqlash yoki rad etish sessiyani arxivlaydi.
        Bemorga tavsiya matnini <span className="text-foreground font-medium">tasdiqlash</span> orqali yuborish mumkin.
      </p>
    </div>
  );
}
