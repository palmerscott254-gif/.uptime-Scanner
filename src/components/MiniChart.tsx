import { Line, LineChart, ResponsiveContainer } from 'recharts';
import type { SparkPoint } from '../types';

interface MiniChartProps {
  data: SparkPoint[];
  status: 'up' | 'down' | 'slow';
}

export function MiniChart({ data, status }: MiniChartProps) {
  const stroke = status === 'down' ? '#EF4444' : status === 'slow' ? '#F59E0B' : '#22C55E';

  return (
    <div className="h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            dot={false}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
