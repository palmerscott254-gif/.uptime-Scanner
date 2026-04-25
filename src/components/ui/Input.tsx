import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  className?: string;
  id?: string;
}

export function Input({
  label,
  helperText,
  error,
  leftIcon,
  rightSlot,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-medium text-gray-300">{label}</span>
      ) : null}
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 transition-colors focus-within:border-success/60 focus-within:bg-white/[0.06]',
          error && 'border-danger/60 focus-within:border-danger/60',
        )}
      >
        {leftIcon ? <span className="text-gray-400">{leftIcon}</span> : null}
        <input
          id={id}
          className={cn(
            'h-12 w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none',
            className,
          )}
          {...props}
        />
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
      {helperText && !error ? <p className="text-xs text-gray-500">{helperText}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </label>
  );
}
