import React from 'react';
import { Lock } from 'lucide-react';

type Level = 'L1' | 'L2' | 'L3';

interface Props {
  value: Level;
  onChange: (level: Level) => void;
}

interface Option {
  level: Level;
  label: string;
  description: string;
}

const OPTIONS: Option[] = [
  { level: 'L1', label: 'Bemor', description: 'Oddiy tilda' },
  { level: 'L2', label: 'Talaba / Hamshira', description: 'Tibbiy atamalar' },
  { level: 'L3', label: 'Shifokor', description: 'Klinik protokol' },
];

const L3_ROLES = ['DOCTOR', 'SPECIALIST', 'ADMIN', 'MEDICAL_EDITOR'];

function getAuthState(): { isLoggedIn: boolean; canL3: boolean } {
  const isLoggedIn = !!localStorage.getItem('token');
  if (!isLoggedIn) return { isLoggedIn: false, canL3: false };

  try {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}') as {
      role?: string;
    };
    const canL3 = typeof user.role === 'string' && L3_ROLES.includes(user.role);
    return { isLoggedIn, canL3 };
  } catch {
    return { isLoggedIn, canL3: false };
  }
}

function getLockReason(level: Level, isLoggedIn: boolean, canL3: boolean): string | null {
  if (level === 'L1') return null;
  if (level === 'L2' && !isLoggedIn) return 'Kirish kerak';
  if (level === 'L3' && !canL3) return 'Faqat shifokorlar uchun';
  return null;
}

export function AudienceSwitcher({ value, onChange }: Props) {
  const { isLoggedIn, canL3 } = getAuthState();

  return (
    <div className="flex gap-2 flex-wrap mt-4" role="group" aria-label="Auditoriya darajasi">
      {OPTIONS.map(({ level, label, description }) => {
        const isActive = value === level;
        const lockReason = getLockReason(level, isLoggedIn, canL3);
        const isLocked = lockReason !== null;

        return (
          <div key={level} className="relative group">
            <button
              type="button"
              aria-pressed={isActive}
              aria-label={`${label} — ${description}${isLocked ? ` (${lockReason})` : ''}`}
              onClick={() => {
                if (!isLocked) onChange(level);
              }}
              className={[
                'flex flex-col items-start px-3 py-2 rounded-xl border text-left transition-all',
                isActive
                  ? 'border-primary bg-primary/5 text-primary'
                  : isLocked
                    ? 'border-border bg-muted/40 text-muted-foreground cursor-not-allowed'
                    : 'border-border bg-background text-foreground hover:border-primary/50',
              ].join(' ')}
            >
              <span className="flex items-center gap-1 text-sm font-medium">
                {label}
                {isLocked && <Lock className="w-3 h-3 opacity-60" aria-hidden="true" />}
              </span>
              <span className="text-[10px] opacity-70">{description}</span>
              {isLocked && (
                <span className="text-[9px] text-muted-foreground mt-0.5">{lockReason}</span>
              )}
            </button>

            {/* Tooltip on hover for locked levels */}
            {isLocked && (
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-popover border border-border shadow-md text-[11px] text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                {lockReason}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
