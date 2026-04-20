import React from 'react';
import { CheckCircle, XCircle, MessageCircleQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';

interface Props {
  messageId: string;
}

export function TriageActionBar({ messageId: _messageId }: Props) {
  return (
    <div className="flex gap-2 pt-4 border-t border-border">
      <Button
        size="sm"
        className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
        onClick={() => toast.success("Tasdiqlandi")}
      >
        <CheckCircle className="w-4 h-4" />
        Diagnoz tasdiqlash
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => toast.info("Rad etildi")}
      >
        <XCircle className="w-4 h-4" />
        Rad etish
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="flex-1 gap-1.5"
        onClick={() => toast.info("Chat moduli tez orada")}
      >
        <MessageCircleQuestion className="w-4 h-4" />
        Savol
      </Button>
    </div>
  );
}
