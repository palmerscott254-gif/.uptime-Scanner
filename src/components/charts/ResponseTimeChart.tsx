import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartPoint } from '../../types';

interface ResponseTimeChartProps {
  data: ChartPoint[];
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
        <p className="text-white">Response: {payload[0].value}ms</p>
      </div>
    </div>
  );
}

export function ResponseTimeChart({ data }: ResponseTimeChartProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft">
      <div>
        <h3 className="text-lg font-semibold text-white">Response Time</h3>
        <p className="mt-1 text-sm text-gray-400">Latency profile across the selected period</p>
      </div>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="response"
              stroke="#60A5FA"
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 0, fill: '#60A5FA' }}
              activeDot={{ r: 5 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
