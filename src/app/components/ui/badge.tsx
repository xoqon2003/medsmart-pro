import React from 'react';

/**
 * Badge — inline label component.
 *
 * Two styling APIs are supported to keep legacy callers working while
 * the codebase migrates to shadcn/ui conventions:
 *
 * 1) `color`      — legacy: 'blue' | 'green' | 'red' | 'yellow' | ...
 * 2) `variant`    — shadcn-style: 'default' | 'secondary' | 'outline' | 'destructive'
 *
 * If both are provided, `variant` wins. `className` is appended last so
 * callers can override any Tailwind class.
 */

type BadgeColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'gray'
  | 'cyan'
  | 'indigo';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const COLOR_MAP: Record<BadgeColor, string> = {
  blue:   'bg-blue-100 text-blue-800',
  green:  'bg-green-100 text-green-800',
  red:    'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  purple: 'bg-purple-100 text-purple-800',
  gray:   'bg-gray-100 text-gray-700',
  cyan:   'bg-cyan-100 text-cyan-800',
  indigo: 'bg-indigo-100 text-indigo-800',
};

const VARIANT_MAP: Record<BadgeVariant, string> = {
  default:     'bg-slate-900 text-white',
  secondary:   'bg-slate-100 text-slate-900',
  outline:     'border border-slate-300 text-slate-700 bg-transparent',
  destructive: 'bg-red-100 text-red-800',
};

const SIZE_MAP = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
} as const;

export function Badge({
  children,
  color = 'blue',
  variant,
  size = 'sm',
  className = '',
  ...rest
}: BadgeProps) {
  const toneClass = variant ? VARIANT_MAP[variant] : COLOR_MAP[color];

  return (
    <span
      {...rest}
      className={`inline-flex items-center rounded-full ${toneClass} ${SIZE_MAP[size]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
