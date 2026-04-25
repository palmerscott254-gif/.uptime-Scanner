import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils';

interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  accentClassName?: string;
}

export function StatsCard({ label, value, change, icon: Icon, accentClassName }: StatsCardProps) {
  return (
    <article className="group rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-app-cardAlt">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</h3>
          {change ? <p className="mt-2 text-sm text-gray-500">{change}</p> : null}
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
