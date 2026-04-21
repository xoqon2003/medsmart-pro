import React, { useState } from 'react';
import { CheckCircle, XCircle, MessageCircleQuestion, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Button } from '../../ui/button';
import { updateTriageSession } from '../../../api/triage';

interface Props {
  messageId: string;
}

type ActionState = 'idle' | 'confirming' | 'rejecting';

export function TriageActionBar({ messageId }: Props) {
  const [state, setState] = useState<ActionState>('idle');
  const qc = useQueryClient();
  const navigate = useNavigate();

  const handleAction = async (action: 'confirm' | 'reject') => {
    if (state !== 'idle') return;
    setState(action === 'confirm' ? 'confirming' : 'rejecting');

    try {
      await updateTriageSession(messageId, 'ARCHIVED');
      // invalidate both the detail and the inbox list
      await qc.invalidateQueries({ queryKey: ['triage-session', messageId] });
      await qc.invalidateQueries({ queryKey: ['doctor-inbox'] });

      if (action === 'confirm') {
        toast.success('Diagnoz tasdiqlandi va arxivlandi');
      } else {
        toast.info('Sessiya rad etildi va arxivlandi');
      }
      navigate('/shifokor/inbox');
    } catch {
      toast.error("Xato yuz berdi. Qayta urinib ko'ring.");
      setState('idle');
    }
  };

  const busy = state !== 'idle';

  return (
    <div className="flex gap-2 pt-4 border-t border-border">
      <Button
        size="sm"
        disabled={busy}
        className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
        onClick={() => void handleAction('confirm')}
      >
        {state === 'confirming' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        Diagnoz tasdiqlash
      </Button>

      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => void handleAction('reject')}
      >
        {state === 'rejecting' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        Rad etish
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="flex-1 gap-1.5"
        onClick={() => toast.info('Chat moduli tez orada')}
      >
        <MessageCircleQuestion className="w-4 h-4" />
        Savol
      </Button>
    </div>
  );
}
