'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string | number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  className?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-100',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-100',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-100',
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    border: 'border-indigo-100',
  },
} as const;

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  change,
  color = 'blue',
  className = '',
}) => {
  const styles = colorStyles[color];

  return (
    <div className={cn('p-6 rounded-lg border', styles.border, styles.bg, className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {change !== undefined && (
            <p className={cn(
              'mt-1 text-sm',
              typeof change === 'number'
                ? change >= 0 ? 'text-green-600' : 'text-red-600'
                : 'text-gray-600'
            )}>
              {typeof change === 'number' && change >= 0 ? '+' : ''}{change}
              {typeof change === 'number' && '%'}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', styles.bg)}>
          <Icon className={cn('w-6 h-6', styles.icon)} />
        </div>
      </div>
    </div>
  );
};
