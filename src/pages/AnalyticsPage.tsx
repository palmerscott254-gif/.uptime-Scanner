import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../components/ui/Card';
import { StatsCard } from '../components/StatsCard';
import { averageResponse, getUptimePercent, projectSummary } from '../utils';
import type { Project } from '../types';
import { ShieldCheck, Clock3, TrendingUp } from 'lucide-react';

interface AnalyticsPageProps {
  projects: Project[];
}

export default function AnalyticsPage({ projects }: AnalyticsPageProps) {
  const summary = projectSummary(projects);
  const [range] = useState('7d');

  const uptimeOverall = projects.length ? Math.round((projects.reduce((s, p) => s + (p.uptimePercent ?? getUptimePercent(p, '7d')), 0) / projects.length) * 100) / 100 : 0;
  const avgResponse = averageResponse(projects);

  const incidentTrends = useMemo(() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return days.map((d, i) => ({ day: d, incidents: projects.reduce((s, p) => s + (p.logs[i] && p.logs[i].type !== 'up' ? 1 : 0), 0) }));
  }, [projects]);

  const responseBars = useMemo(() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return days.map((d, i) => ({ day: d, response: Math.round(projects.reduce((s, p) => s + (p.responseSeries['7d'][i]?.response ?? 0), 0) / (projects.length || 1)) }));
  }, [projects]);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Analytics</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">System analytics & trends</h1>
            <p className="mt-2 text-gray-400">Key performance indicators and incident insights.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Global Uptime %" value={`${uptimeOverall}%`} icon={ShieldCheck} change="7d average" trend="up" />
        <StatsCard label="Avg Response" value={`${avgResponse}ms`} icon={Clock3} change="-3.2%" trend="up" />
        <StatsCard label="Monitors" value={String(summary.total)} icon={TrendingUp} change="-" />
      </section>

      <section className="space-y-5">
        <Card>
          <h3 className="text-lg font-semibold">Incident trends</h3>
          <p className="mt-1 text-sm text-gray-400">Incidents over the last 7 days</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incidentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="incidents" stroke="#F97316" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Response time</h3>
          <p className="mt-1 text-sm text-gray-400">Average response time by day</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responseBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="response" fill="#60A5FA" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </div>
  );
}
