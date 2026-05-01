import { useMemo, useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Slash } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatsCard } from '../components/StatsCard';
import { RecentIncidents } from '../components/dashboard/RecentIncidents';
import { ProjectCard } from '../components/ProjectCard';
import { cn, projectSummary } from '../utils';
import { Button } from '../components/ui/Button';
import type { Project } from '../types';

interface AlertsPageProps {
  projects: Project[];
}

export default function AlertsPage({ projects }: AlertsPageProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'resolved'>('all');

  const summary = projectSummary(projects);

  const activeAlerts = useMemo(() => projects.filter((p) => p.status !== 'up'), [projects]);
  const critical = activeAlerts.filter((p) => p.status === 'down');
  const warning = activeAlerts.filter((p) => p.status === 'slow');
  const resolved = projects.filter((p) => p.status === 'up');

  const list = useMemo(() => {
    if (filter === 'all') return [...critical, ...warning];
    if (filter === 'critical') return critical;
    if (filter === 'warning') return warning;
    return resolved;
  }, [filter, critical, warning, resolved]);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Alerts</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Active alerts & notifications</h1>
            <p className="mt-2 text-gray-400">Manage incidents, triage critical systems, and clear resolved issues.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" icon={<Bell className="h-4 w-4" />}>Notifications</Button>
            <Button variant="primary">Create alert</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Monitors" value={String(summary.total)} icon={Bell} change="-" />
        <StatsCard label="Critical" value={String(critical.length)} icon={AlertTriangle} change="Needs attention" />
        <StatsCard label="Warning" value={String(warning.length)} icon={Slash} change="Performance" />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent alerts</h3>
              <div className="flex items-center gap-2">
                <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'critical' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('critical')}>Critical</Button>
                <Button variant={filter === 'warning' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('warning')}>Warning</Button>
                <Button variant={filter === 'resolved' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('resolved')}>Resolved</Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {list.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="mt-1 text-xs text-gray-400">{p.lastIncident ?? 'Incident detected'}</p>
                    </div>
                    <div className="text-sm text-gray-400">{p.region}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">Recent alerts</h3>
            <div className="mt-3">
              <RecentIncidents projects={projects} limit={5} />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <RecentIncidents projects={projects} />

          <Card>
            <h3 className="text-lg font-semibold">Filters</h3>
            <div className="mt-3 space-y-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm text-gray-300">By region</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['US-East', 'EU-West', 'AP-South', 'GLOBAL'].map((r) => (
                    <Button key={r} variant="secondary" size="sm">{r}</Button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm text-gray-300">By tag</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['API', 'Web', 'CDN', 'Auth', 'Payments'].map((t) => (
                    <Button key={t} variant="secondary" size="sm">#{t}</Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
