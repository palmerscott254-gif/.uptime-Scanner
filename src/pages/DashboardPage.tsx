import { AlertTriangle, Activity, Filter, Search, ShieldCheck, TrendingUp } from 'lucide-react';
import type { MonitorStatus, Project } from '../types';
import { averageResponse, cn, projectSummary } from '../utils';
import { ProjectCard } from '../components/ProjectCard';
import { StatsCard } from '../components/StatsCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DashboardSkeleton } from '../components/Skeletons';

interface DashboardPageProps {
  projects: Project[];
  loading: boolean;
  search: string;
  statusFilter: MonitorStatus | 'all';
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: MonitorStatus | 'all') => void;
  onAddProject: () => void;
  onViewProject: (project: Project) => void;
  onLogsProject: (project: Project) => void;
}

export function DashboardPage({
  projects,
  loading,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onAddProject,
  onViewProject,
  onLogsProject,
}: DashboardPageProps) {
  const stats = projectSummary(projects);

  const filtered = projects.filter((project) => {
    const searchMatch = `${project.name} ${project.url} ${project.tags.join(' ')}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const statusMatch = statusFilter === 'all' || project.status === statusFilter;
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Total Monitors" value={String(stats.total)} icon={ShieldCheck} accentClassName="bg-success/10 text-success" />
        <StatsCard label="Online" value={String(stats.online)} change="All systems nominal" icon={Activity} accentClassName="bg-success/10 text-success" />
        <StatsCard label="Down" value={String(stats.down)} change="Needs immediate attention" icon={AlertTriangle} accentClassName="bg-danger/10 text-danger" />
        <StatsCard label="Avg Response Time" value={`${averageResponse(projects)}ms`} change="Across all active monitors" icon={TrendingUp} accentClassName="bg-warning/10 text-warning" />
      </section>

      <section className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-4 md:grid-cols-[1.5fr_0.9fr]">
          <Input
            label="Search"
            placeholder="Search projects, URLs, or tags"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
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
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={<Filter className="h-4 w-4" />} onClick={() => onStatusFilterChange('all')}>
            Reset Filters
          </Button>
          <Button variant="primary" onClick={onAddProject}>
            Add Project
          </Button>
        </div>
      </section>

      {loading ? (
        <DashboardSkeleton />
      ) : filtered.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={onViewProject}
              onLogs={onLogsProject}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-[1.75rem] border border-dashed border-white/15 bg-app-card/70 p-10 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/[0.04] text-success ring-1 ring-white/10">
            <Search className="h-8 w-8" />
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
    </div>
  );
}
