import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-8 w-8 text-${color}-500`} />
        {change !== undefined && (
          <span
            className={`text-sm font-semibold ${
              change > 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-gray-600 text-sm mt-1">{title}</p>
    </div>
  );
}
