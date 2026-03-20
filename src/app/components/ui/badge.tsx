import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'purple' | 'gray' | 'cyan' | 'indigo';
  size?: 'sm' | 'md';
}

export function Badge({ children, color = 'blue', size = 'sm' }: BadgeProps) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-700',
    cyan: 'bg-cyan-100 text-cyan-800',
    indigo: 'bg-indigo-100 text-indigo-800',
  };
  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };
  return (
    <span className={`inline-flex items-center rounded-full ${colorMap[color]} ${sizeMap[size]}`}>
      {children}
    </span>
  );
}
