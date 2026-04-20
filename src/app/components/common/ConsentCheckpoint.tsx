import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { MEDICAL_COPY } from '../../lib/medical-copy';

const CONSENT_KEY = 'medsmart_consent_v1';

/** localStorage dan xavfsiz o'qish (SSR / try-catch) */
function readConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'true';
  } catch {
    return false;
  }
}

/** localStorage ga xavfsiz yozish */
function writeConsent(): void {
  try {
    localStorage.setItem(CONSENT_KEY, 'true');
  } catch {
    // storage unavailable — davom etamiz
  }
}

interface ConsentCheckpointProps {
  children: React.ReactNode;
  /** Qaysi feature uchun (triage, diseases, va h.k.) — faqat ko'rsatish uchun */
  feature?: string;
}

/**
 * Bir martalik consent gate.
 * Agar foydalanuvchi rozi bo'lmagan bo'lsa — children o'rniga consent kartasi.
 * Rozi bo'lgandan so'ng localStorage'ga yoziladi va children render qilinadi.
 */
export function ConsentCheckpoint({ children, feature }: ConsentCheckpointProps) {
  const [consented, setConsented] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // SSR-safe hydration: localStorage faqat client-side mavjud
  useEffect(() => {
    setConsented(readConsent());
    setHydrated(true);
  }, []);

  // Hydration tugamaguncha hech narsa ko'rsatmaymiz (flash oldini olish)
  if (!hydrated) return null;

  if (consented) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-sm mx-auto my-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {MEDICAL_COPY.disclaimerTitle}
          </p>
          {feature && (
            <p className="text-xs text-muted-foreground capitalize">{feature}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
        {MEDICAL_COPY.consentText}
      </p>

      <Button
        className="w-full"
        onClick={() => {
          writeConsent();
          setConsented(true);
        }}
      >
        Qabul qilaman
      </Button>
    </div>
  );
}
