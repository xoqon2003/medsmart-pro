import React from 'react';
import { AlertTriangle, AlertCircle, Info, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { MEDICAL_COPY } from '../../lib/medical-copy';

export interface RedFlagRule {
  conditionLabel: string;
  urgencyLevel: 'IMMEDIATE' | 'URGENT' | 'SOON';
  messageUz: string;
  callEmergency: boolean;
}

interface EmergencyCallBannerProps {
  rules: RedFlagRule[];
}

interface BannerConfig {
  containerClass: string;
  iconClass: string;
  textClass: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const BANNER_CONFIG: Record<RedFlagRule['urgencyLevel'], BannerConfig> = {
  IMMEDIATE: {
    containerClass:
      'bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    textClass: 'text-red-800 dark:text-red-300',
    Icon: AlertTriangle,
  },
  URGENT: {
    containerClass:
      'bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    textClass: 'text-amber-800 dark:text-amber-300',
    Icon: AlertCircle,
  },
  SOON: {
    containerClass:
      'bg-blue-50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    textClass: 'text-blue-800 dark:text-blue-300',
    Icon: Info,
  },
};

/**
 * Red-flag holatlar uchun banner.
 * IMMEDIATE → qizil, URGENT → sariq, SOON → moviy.
 * `callEmergency: true` bo'lganda "103 ga qo'ng'iroq qiling" tugmasi ko'rsatiladi.
 */
export function EmergencyCallBanner({ rules }: EmergencyCallBannerProps) {
  if (rules.length === 0) return null;

  return (
    <div className="space-y-2">
      {rules.map((rule, index) => {
        const config = BANNER_CONFIG[rule.urgencyLevel];
        const { Icon } = config;

        return (
          <div
            key={`${rule.conditionLabel}-${index}`}
            className={`rounded-lg p-3 ${config.containerClass}`}
          >
            <div className="flex items-start gap-2">
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconClass}`} />
              <div className="flex-1 space-y-1.5">
                <p className={`text-xs font-semibold ${config.textClass}`}>
                  {rule.conditionLabel}
                </p>
                <p className={`text-xs leading-relaxed ${config.textClass}`}>
                  {rule.messageUz}
                </p>
                {rule.callEmergency && (
                  <Button
                    asChild
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs gap-1.5 mt-1"
                  >
                    <a href="tel:103">
                      <Phone className="w-3 h-3" />
                      {MEDICAL_COPY.emergencyCallText}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
