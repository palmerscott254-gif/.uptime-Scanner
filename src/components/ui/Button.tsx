import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-success text-slate-950 hover:bg-emerald-400 shadow-[0_12px_30px_rgba(34,197,94,0.18)]',
  secondary:
    'bg-white/6 text-white ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/20',
  ghost: 'bg-transparent text-gray-300 hover:bg-white/5 hover:text-white',
  danger: 'bg-danger/15 text-danger ring-1 ring-danger/20 hover:bg-danger/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
