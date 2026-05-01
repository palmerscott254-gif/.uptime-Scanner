import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../utils';

interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  accentClassName?: string;
  onClick?: () => void;
}

export function StatsCard({ label, value, change, trend, icon: Icon, accentClassName, onClick }: StatsCardProps) {
  return (
    <article
      onClick={onClick}
      className={cn(
        'group rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-app-cardAlt',
        onClick && 'cursor-pointer',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <h3 className="mt-3 text-4xl font-bold tracking-tight text-white">{value}</h3>
          {change ? (
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-gray-400">
              {trend === 'up' ? <TrendingUp className="h-4 w-4 text-success" /> : null}
              {trend === 'down' ? <TrendingDown className="h-4 w-4 text-danger" /> : null}
              {change}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-gray-200 transition-colors group-hover:text-white',
            accentClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
