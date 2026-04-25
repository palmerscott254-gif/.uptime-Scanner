import { CheckCircle2, Globe, RefreshCcw, ServerCrash } from 'lucide-react';
import type { Project } from '../types';
import { projectSummary } from '../utils';
import { StatusBadge } from '../components/StatusBadge';

interface PublicStatusPageProps {
  projects: Project[];
}

export function PublicStatusPage({ projects }: PublicStatusPageProps) {
  const summary = projectSummary(projects);
  const uptime = summary.total ? Math.round((summary.online / summary.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              Public status page
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Everything is running smoothly</h2>
            <p className="mt-3 max-w-2xl text-gray-400">
              Live service health, component details, and incident visibility for your users and support team.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[32rem]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Uptime</p>
              <p className="mt-2 text-3xl font-semibold text-white">{uptime}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Online</p>
              <p className="mt-2 text-3xl font-semibold text-white">{summary.online}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Issues</p>
              <p className="mt-2 text-3xl font-semibold text-white">{summary.down}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Monitored components</h3>
              <p className="mt-1 text-sm text-gray-400">Service level overview for all public monitors.</p>
            </div>
            <Globe className="h-5 w-5 text-gray-500" />
          </div>

          <div className="mt-5 space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <div>
                  <p className="font-medium text-white">{project.name}</p>
                  <p className="mt-1 text-sm text-gray-400">{project.url}</p>
                </div>
                <StatusBadge status={project.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-success">
              <RefreshCcw className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-white">Recent incident summary</h3>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              No open incidents. The last issue resolved automatically after a brief timeout spike.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-app-card p-5 shadow-soft">
            <div className="flex items-center gap-2 text-danger">
              <ServerCrash className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-white">Incident response</h3>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              If an outage occurs, subscribers receive a branded update with timelines, remediation notes, and recovery details.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
