import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartPoint, TimeRange } from '../../types';
import { cn } from '../../utils';
import { StatusBadge } from '../StatusBadge';

interface UptimeChartProps {
  data: ChartPoint[];
  status: 'up' | 'down' | 'slow';
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
};

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 shadow-soft backdrop-blur-xl">
      <p className="text-xs text-gray-400">{label}</p>
      <div className="mt-2 space-y-1 text-sm">
        <p className="text-white">Uptime: {payload[0].value}%</p>
      </div>
    </div>
  );
}

export function UptimeChart({ data, status, range, onRangeChange }: UptimeChartProps) {
  const stroke = status === 'down' ? '#EF4444' : status === 'slow' ? '#F59E0B' : '#22C55E';

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Uptime</h3>
          <p className="mt-1 text-sm text-gray-400">Availability over time</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          {(['24h', '7d', '30d'] as TimeRange[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onRangeChange(item)}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                range === item ? 'bg-success text-slate-950' : 'text-gray-400 hover:text-white',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stroke} stopOpacity={0.35} />
                <stop offset="95%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} domain={[80, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="uptime"
              stroke={stroke}
              fill="url(#uptimeGradient)"
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 0, fill: stroke }}
              activeDot={{ r: 5 }}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-sm text-gray-400">
        <StatusBadge status={status} size="sm" />
        <span>Higher is better. Real-time health snapshot.</span>
      </div>
    </section>
  );
}
