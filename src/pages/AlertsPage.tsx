import { useMemo, useState } from 'react';
import { AlertTriangle, Siren, Slash } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatsCard } from '../components/StatsCard';
import { RecentIncidents } from '../components/dashboard/RecentIncidents';
import type { Project } from '../types';
import { cn, projectSummary } from '../utils';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface AlertsPageProps {
  projects: Project[];
  search: string;
}

export default function AlertsPage({ projects, search }: AlertsPageProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'resolved'>('all');

  const summary = projectSummary(projects);

  const activeAlerts = useMemo(() => projects.filter((p) => p.status !== 'up'), [projects]);
  const critical = activeAlerts.filter((p) => p.status === 'down');
  const warning = activeAlerts.filter((p) => p.status === 'slow');
  const resolved = projects.filter((p) => p.status === 'up');

  const list = useMemo(() => {
    const source = filter === 'all' ? [...critical, ...warning] : filter === 'critical' ? critical : filter === 'warning' ? warning : resolved;
    const needle = search.trim().toLowerCase();
    if (!needle) return source;
    return source.filter((project) => `${project.name} ${project.url} ${project.lastIncident ?? ''} ${project.logs.map((log) => log.message).join(' ')}`.toLowerCase().includes(needle));
  }, [filter, critical, warning, resolved, search]);

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
            <Button variant="primary">Settings</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Total Monitors" value={String(summary.total)} icon={Siren} change="-" />
        <StatsCard label="Critical" value={String(critical.length)} icon={AlertTriangle} change="Needs attention" />
        <StatsCard label="Warning" value={String(warning.length)} icon={Slash} change="Performance" />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Alert history</h3>
              <div className="flex items-center gap-2">
                <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'critical' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('critical')}>Critical</Button>
                <Button variant={filter === 'warning' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('warning')}>Warning</Button>
                <Button variant={filter === 'resolved' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('resolved')}>Resolved</Button>
              </div>
            </div>

            {list.length ? (
              <div className="grid gap-3">
                {list.map((p) => (
                  <div key={p.id} className={cn('rounded-2xl border bg-white/[0.02] p-4', p.status === 'down' ? 'border-danger/30' : 'border-warning/30')}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{p.name}</p>
                        <p className="mt-1 text-xs text-gray-400">{p.lastIncident || `Status: ${p.status}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={p.status === 'down' ? 'danger' : 'warning'}>
                          {p.status === 'down' ? 'CRITICAL' : 'WARNING'}
                        </Badge>
                        <span className="text-sm text-gray-400">{p.region || 'Global'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No alerts — everything looks good!</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <RecentIncidents projects={projects} />

          <Card>
            <h3 className="text-lg font-semibold">Alert summary</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <span className="text-sm text-gray-400">Critical alerts</span>
                <span className="font-semibold text-danger">{critical.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <span className="text-sm text-gray-400">Warning alerts</span>
                <span className="font-semibold text-warning">{warning.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <span className="text-sm text-gray-400">Resolved</span>
                <span className="font-semibold text-success">{resolved.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
