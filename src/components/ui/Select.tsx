import type { ReactNode } from 'react';
import { cn } from '../../utils';

interface SelectProps {
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
  id?: string;
  children?: ReactNode;
}

export function Select({ value, onChange, children, className, id }: SelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        'h-12 w-full rounded-2xl border border-white/10 bg-app-card px-4 text-sm text-white outline-none transition focus:border-info/60',
        className,
      )}
    >
      {children}
    </select>
  );
}
