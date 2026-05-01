import type { PropsWithChildren } from 'react';
import { cn } from '../../utils';

interface BadgeProps extends PropsWithChildren {
  variant?: 'neutral' | 'success' | 'danger' | 'warning';
  className?: string;
}

const styles = {
  neutral: 'bg-white/6 text-white',
  success: 'bg-success/10 text-success ring-success/20',
  danger: 'bg-danger/10 text-danger ring-danger/20',
  warning: 'bg-warning/10 text-warning ring-warning/20',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-white/6',
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
