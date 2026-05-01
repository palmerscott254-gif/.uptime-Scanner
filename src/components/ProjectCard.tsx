import { ChevronRight, Clock3, Globe, ListChecks, MapPin, ShieldCheck, Trash2 } from 'lucide-react';
import type { Project } from '../types';
import { cn, formatResponseTime, statusMeta } from '../utils';
import { Button } from './ui/Button';
import { MiniChart } from './MiniChart';
import { StatusBadge } from './StatusBadge';

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onLogs: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, onView, onLogs, onDelete }: ProjectCardProps) {
  const meta = statusMeta[project.status];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onView(project)}
      onKeyDown={(e) => ((e.key === 'Enter' || e.key === ' ') && onView(project))}
      className={cn(
        'group overflow-hidden rounded-[1.75rem] border border-white/10 bg-app-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-app-cardAlt cursor-pointer',
        'border-l-4',
        meta.border,
      )}
    >
      <div className={cn('h-1 w-full bg-gradient-to-r', meta.accent)} />
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot, 'animate-pulseSoft')} />
              <p className="truncate text-lg font-semibold text-white">{project.name}</p>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <Globe className="h-4 w-4" />
              <span className="truncate">{project.url}</span>
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Response</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {project.status === 'down' ? '—' : formatResponseTime(project.responseTime)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Last checked</p>
            <p className="mt-2 text-xl font-semibold text-white">{project.lastChecked}</p>
          </div>
        </div>

        <div className="grid gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-3 text-sm text-gray-300 sm:grid-cols-2">
          <div className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{project.region ?? 'Region N/A'}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>{project.sslValid ? 'SSL Valid' : 'SSL Expiring'}</span>
          </div>
          <div className="sm:col-span-2 text-gray-400">Last incident: {project.lastIncident ?? 'No incidents'}</div>
        </div>

        <MiniChart data={project.miniSeries} status={project.status} />

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            variant="secondary"
            size="sm"
            icon={<ListChecks className="h-4 w-4" />}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onLogs(project);
            }}
          >
            Logs
          </Button>
            {onDelete ? (
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete(project);
                }}
                aria-label={`Delete ${project.name}`}
              >
                Delete
              </Button>
            ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-white/8 pt-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            <span>Checks every {project.interval} min</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 transition-colors group-hover:text-gray-300">
            <span>{project.tags.map((tag) => `#${tag}`).join(' ')}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
