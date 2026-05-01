import type { PropsWithChildren } from 'react';
import { cn } from '../../utils';

interface CardProps extends PropsWithChildren {
  className?: string;
  borderless?: boolean;
}

export function Card({ children, className, borderless = false }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-[1.25rem] bg-app-card/60 p-4 sm:p-6 transition-shadow shadow-soft border border-white/6',
        borderless && 'border-0 shadow-none',
        className,
      )}
    >
      {children}
    </section>
  );
}
