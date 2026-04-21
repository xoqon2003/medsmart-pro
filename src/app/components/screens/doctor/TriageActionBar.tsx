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

type ActionState =
  | 'idle'
  | 'composing-confirm'
  | 'composing-reject'
  | 'submitting-confirm'
  | 'submitting-reject';

/**
 * Reject marker — doctorNote'ning birinchi qatoriga qo'yiladi.
 * MyDiseasesPage buni aniqlab, qizil "Rad etildi" banner ko'rsatadi.
 * Bu yondashuv DB schema o'zgarishisiz confirmed vs rejected holatini ajratadi.
 */
export const REJECT_PREFIX = '[REJECT]';

const CONFIRM_PLACEHOLDER =
  "Tasdiqlash izohi (majburiy):\n" +
  "– Qo'shimcha tekshiruvlar...\n" +
  "– Dori-darmonlar...\n" +
  "– Kasalxonaga murojaat qilish...";

const REJECT_PLACEHOLDER =
  "Rad etish sababi (majburiy):\n" +
  "– Simptomlar bu tashxisga to'g'ri kelmaydi...\n" +
  "– Qo'shimcha ma'lumot kerak...\n" +
  "– Boshqa mutaxassisga murojaat qiling...";

export function TriageActionBar({ messageId }: Props) {
  const [state, setState] = useState<ActionState>('idle');
  const [note, setNote]   = useState('');
  const qc                = useQueryClient();
  const navigate          = useNavigate();

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['triage-session', messageId] });
    await qc.invalidateQueries({ queryKey: ['doctor-inbox'] });
  };

  const resetToIdle = () => {
    setState('idle');
    setNote('');
  };

  // ── Confirm flow ───────────────────────────────────────────────────────────
  const handleOpenConfirm = () => {
    if (state !== 'idle') return;
    setState('composing-confirm');
  };

  const handleConfirm = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;           // UI disabled, double safety
    setState('submitting-confirm');
    try {
      await updateTriageSession(messageId, 'ARCHIVED', trimmed);
      await invalidate();
      toast.success('Diagnoz tasdiqlandi', {
        description: 'Tavsiyangiz bemorga yuborildi.',
        duration: 4000,
      });
      navigate('/shifokor/inbox');
    } catch {
      toast.error("Xato yuz berdi. Qayta urinib ko'ring.");
      setState('composing-confirm');
    }
  };

  // ── Reject flow ────────────────────────────────────────────────────────────
  const handleOpenReject = () => {
    if (state !== 'idle') return;
    setState('composing-reject');
  };

  const handleReject = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;           // UI disabled, double safety
    setState('submitting-reject');
    try {
      // Prefix REJECT marker so patient sees this was a rejection,
      // not a confirmation. Frontend strips the prefix before display.
      const rejectNote = `${REJECT_PREFIX}\n${trimmed}`;
      await updateTriageSession(messageId, 'ARCHIVED', rejectNote);
      await invalidate();
      toast.info('Sessiya rad etildi', {
        description: 'Sababingiz bemorga yuborildi.',
        duration: 4000,
      });
      navigate('/shifokor/inbox');
    } catch {
      toast.error("Xato yuz berdi. Qayta urinib ko'ring.");
      setState('composing-reject');
    }
  };

  const isComposingConfirm = state === 'composing-confirm' || state === 'submitting-confirm';
  const isComposingReject  = state === 'composing-reject'  || state === 'submitting-reject';
  const isSubmitting       = state === 'submitting-confirm' || state === 'submitting-reject';
  const canSubmit          = note.trim().length > 0 && !isSubmitting;

  return (
    <div className="space-y-3 pt-4 border-t border-border">

      {/* Compose (confirm OR reject — same textarea, different CTAs) */}
      {(isComposingConfirm || isComposingReject) && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            {isComposingReject
              ? 'Bemor uchun rad etish sababi (majburiy, max 2000 belgi)'
              : 'Bemor uchun tavsiya (majburiy, max 2000 belgi)'}
          </label>
          <textarea
            className={[
              'w-full rounded-xl border px-3 py-2.5 text-sm resize-none',
              'placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2',
              'disabled:opacity-50',
              isComposingReject
                ? 'border-red-200 bg-red-50/40 focus:ring-red-500/30'
                : 'border-border bg-muted/40 focus:ring-primary/30',
            ].join(' ')}
            rows={4}
            maxLength={2000}
            placeholder={isComposingReject ? REJECT_PLACEHOLDER : CONFIRM_PLACEHOLDER}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSubmitting}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{note.length} / 2000</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={isSubmitting}
                onClick={resetToIdle}
              >
                Bekor
              </Button>
              {isComposingReject ? (
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                  disabled={!canSubmit}
                  onClick={() => void handleReject()}
                >
                  {state === 'submitting-reject' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Rad etishni yuborish
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                  disabled={!canSubmit}
                  onClick={() => void handleConfirm()}
                >
                  {state === 'submitting-confirm' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  Tasdiqlashni yuborish
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Idle — two entry buttons */}
      {state === 'idle' && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleOpenConfirm}
          >
            <CheckCircle className="w-4 h-4" />
            Diagnoz tasdiqlash
            <ChevronDown className="w-3 h-3 ml-auto opacity-60" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
            onClick={handleOpenReject}
          >
            <XCircle className="w-4 h-4" />
            Rad etish
            <ChevronDown className="w-3 h-3 ml-auto opacity-60" />
          </Button>
        </div>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground text-center">
        Har ikkala qaror ham bemorga yuboriladi. Izoh majburiy — bemor sizning
        fikringiz haqida xabar oladi.
      </p>
    </div>
  );
}
