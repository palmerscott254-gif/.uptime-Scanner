import { AlertTriangle, ArrowDownUp, Clock3, Filter, ShieldCheck, TrendingUp } from 'lucide-react';
import type { MonitorStatus, Project, SortKey } from '../types';
import { averageResponse, cn, getUptimePercent, projectSummary } from '../utils';
import { ProjectCard } from '../components/ProjectCard';
import { StatsCard } from '../components/StatsCard';
import { RecentIncidents } from '../components/dashboard/RecentIncidents';
import { Button } from '../components/ui/Button';
import { DashboardSkeleton } from '../components/Skeletons';

interface DashboardPageProps {
  projects: Project[];
  loading: boolean;
  search: string;
  statusFilter: MonitorStatus | 'all';
  tagFilter: string;
  sortBy: SortKey;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: MonitorStatus | 'all') => void;
  onTagFilterChange: (value: string) => void;
  onSortChange: (value: SortKey) => void;
  onAddProject: () => void;
  onViewProject: (project: Project) => void;
  onLogsProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

export function DashboardPage({
  projects,
  loading,
  search,
  statusFilter,
  tagFilter,
  sortBy,
  onSearchChange,
  onStatusFilterChange,
  onTagFilterChange,
  onSortChange,
  onAddProject,
  onViewProject,
  onLogsProject,
  onDeleteProject,
}: DashboardPageProps) {
  const stats = projectSummary(projects);
  const uptime = stats.total ? Math.round((stats.online / stats.total) * 100) : 0;
  const incidents = projects.reduce((sum, project) => sum + (project.incidentCount ?? 0), 0);
  const tagOptions = ['all', ...new Set(projects.flatMap((project) => project.tags))];

  const filtered = projects
    .filter((project) => {
      const searchMatch = `${project.name} ${project.url} ${project.tags.join(' ')} ${project.region ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const statusMatch = statusFilter === 'all' || project.status === statusFilter;
      const tagMatch = tagFilter === 'all' || project.tags.includes(tagFilter);
      return searchMatch && statusMatch && tagMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'response') {
        return a.responseTime - b.responseTime;
      }
      return (b.uptimePercent ?? getUptimePercent(b)) - (a.uptimePercent ?? getUptimePercent(a));
    });

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Dashboard</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Monitor Overview</h1>
            <p className="mt-2 max-w-2xl text-gray-400">Track status and performance of your monitored endpoints.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs text-gray-500">Global Uptime</p>
              <p className="mt-1 text-2xl font-bold text-white">{uptime}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs text-gray-500">Incidents (30d)</p>
              <p className="mt-1 text-2xl font-bold text-white">{incidents}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs text-gray-500">Monitors</p>
              <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs text-gray-500">Avg Response</p>
              <p className="mt-1 text-2xl font-bold text-white">{averageResponse(projects)}ms</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total Monitors"
          value={String(stats.total)}
          change="—"
          icon={ShieldCheck}
          accentClassName="bg-info/10 text-info"
          onClick={() => {
            const ev = new CustomEvent('navigate-monitors', { detail: { filter: 'all' } });
            window.dispatchEvent(ev as Event);
          }}
        />
        <StatsCard
          label="Online"
          value={String(stats.online)}
          change="—"
          icon={TrendingUp}
          accentClassName="bg-success/10 text-success"
          onClick={() => {
            onStatusFilterChange('up');
            const ev = new CustomEvent('navigate-monitors', { detail: { filter: 'up' } });
            window.dispatchEvent(ev as Event);
          }}
        />
        <StatsCard
          label="Down"
          value={String(stats.down)}
          change="—"
          icon={AlertTriangle}
          accentClassName="bg-danger/10 text-danger"
          onClick={() => {
            onStatusFilterChange('down');
            const ev = new CustomEvent('navigate-monitors', { detail: { filter: 'down' } });
            window.dispatchEvent(ev as Event);
          }}
        />
        <StatsCard
          label="Avg Response"
          value={`${averageResponse(projects)}ms`}
          change="—"
          icon={Clock3}
          accentClassName="bg-warning/10 text-warning"
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Projects</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">New projects and monitored services</h2>
          </div>
          <Button variant="secondary" onClick={() => window.dispatchEvent(new CustomEvent('navigate-projects'))}>
            View all projects
          </Button>
        </div>

        {loading ? null : filtered.length ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.slice(0, 6).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={onViewProject}
                onLogs={onLogsProject}
                onDelete={onDeleteProject}
              />
            ))}
          </section>
        ) : null}
      </section>

      <section className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-4 md:grid-cols-[1fr_0.8fr]">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-300">Filter by status</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
              {(['all', 'up', 'slow', 'down'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onStatusFilterChange(value)}
                  className={cn(
                    'flex-1 rounded-xl px-3 py-2 text-sm font-medium capitalize transition-colors',
                    statusFilter === value ? 'bg-success text-slate-950' : 'text-gray-400 hover:text-white',
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-gray-300">Tag filter</span>
            <select
              className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-app-card px-4 text-sm text-white outline-none transition focus:border-info/60"
              value={tagFilter}
              onChange={(event) => onTagFilterChange(event.target.value)}
            >
              {tagOptions.map((tag) => (
                <option className="bg-app-card text-white" key={tag} value={tag}>
                  {tag === 'all' ? 'All tags' : tag}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<ArrowDownUp className="h-4 w-4" />}
            onClick={() => onSortChange(sortBy === 'uptime' ? 'response' : 'uptime')}
          >
            Sort: {sortBy === 'uptime' ? 'Uptime' : 'Response'}
          </Button>
          <Button variant="secondary" icon={<Filter className="h-4 w-4" />} onClick={() => onStatusFilterChange('all')}>
            Reset Filters
          </Button>
          <Button variant="primary" onClick={onAddProject}>
            Add Monitor
          </Button>
        </div>
      </section>

      {loading ? (
        <DashboardSkeleton />
      ) : filtered.length ? (
        <></>
      ) : (
        <section className="rounded-[1.75rem] border border-dashed border-white/15 bg-app-card/70 p-10 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/[0.04] text-success ring-1 ring-white/10">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-white">No monitors match your filters</h3>
          <p className="mx-auto mt-2 max-w-xl text-gray-400">
            Try a different search query or status filter, or add a new project to begin monitoring.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => onStatusFilterChange('all')}>
              Clear filters
            </Button>
            <Button variant="primary" onClick={onAddProject}>
              Add your first monitor
            </Button>
          </div>
        </section>
      )}

      <RecentIncidents projects={projects} limit={10} />
    </div>
  );
}
