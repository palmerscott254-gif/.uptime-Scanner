import type { PropsWithChildren } from 'react';
import { cn } from '../../utils';

interface SkeletonProps extends PropsWithChildren {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ children, className, variant = 'rect' }: SkeletonProps) {
  const base = 'animate-pulse bg-gradient-to-r from-white/6 via-white/4 to-white/6';
  const shape =
    variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'h-4 rounded-md' : 'rounded-xl';

  return <div className={cn(base, shape, className)}>{children}</div>;
}
