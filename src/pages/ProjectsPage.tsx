import { useMemo } from 'react';
import { ChevronRight, Globe, ShieldCheck } from 'lucide-react';
import type { Project } from '../types';
import { averageResponse, cn, projectSummary } from '../utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatsCard } from '../components/StatsCard';
import { ProjectCard } from '../components/ProjectCard';

interface ProjectsPageProps {
  projects: Project[];
  loading: boolean;
  search: string;
  onViewProject: (project: Project) => void;
  onLogsProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onAddProject: () => void;
}

export default function ProjectsPage({ projects, loading, search, onViewProject, onLogsProject, onDeleteProject, onAddProject }: ProjectsPageProps) {
  const summary = projectSummary(projects);

  const featuredProjects = useMemo(
    () => {
      const needle = search.trim().toLowerCase();
      return projects
        .slice()
        .filter((project) => !needle || `${project.name} ${project.url} ${project.region ?? ''} ${project.tags.join(' ')}`.toLowerCase().includes(needle))
        .sort((a, b) => (b.uptimePercent ?? 0) - (a.uptimePercent ?? 0))
        .slice(0, 6);
    },
    [projects, search],
  );

  const strongest = featuredProjects[0];

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Projects</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Project portfolio</h1>
            <p className="mt-2 text-gray-400">Track uptime, linked monitors, and the latest check result across your services.</p>
          </div>
          <Button onClick={onAddProject}>New project</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Projects" value={String(summary.total)} icon={Globe} change="Managed services" />
        <StatsCard label="Healthy" value={String(summary.online)} icon={ShieldCheck} change="Available now" trend="up" />
        <StatsCard label="Avg Response" value={`${averageResponse(projects)}ms`} icon={ChevronRight} change="Recent window" />
        <StatsCard label="Top Uptime" value={`${strongest?.uptimePercent ?? 0}%`} icon={ShieldCheck} change={strongest?.name ?? 'No projects'} trend="up" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">New projects</h2>
            <p className="text-sm text-gray-400">Click any card to open full details</p>
          </div>

          {loading ? null : featuredProjects.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onView={onViewProject} onLogs={onLogsProject} onDelete={onDeleteProject} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-sm text-gray-400">No projects yet. Create your first project to begin monitoring.</p>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <h3 className="text-lg font-semibold text-white">Project summary</h3>
            <div className="mt-4 space-y-3">
              {projects.slice(0, 5).map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.04]',
                  )}
                  onClick={() => onViewProject(project)}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{project.name}</p>
                    <p className="mt-1 text-xs text-gray-400">{project.url}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>{project.status.toUpperCase()}</p>
                    <p>{project.lastChecked}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
