import { Circle } from 'lucide-react';
import { cn, statusMeta } from '../utils';
import type { MonitorStatus } from '../types';

interface StatusBadgeProps {
  status: MonitorStatus;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-sm font-semibold',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const meta = statusMeta[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full ring-1 backdrop-blur-sm',
        meta.badge,
        sizeStyles[size],
      )}
    >
      <Circle className={cn('h-3 w-3 fill-current', meta.dot, 'animate-pulseSoft')} />
      {meta.label}
    </span>
  );
}
