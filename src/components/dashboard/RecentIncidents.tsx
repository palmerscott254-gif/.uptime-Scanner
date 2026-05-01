import type { Project } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface RecentIncidentsProps {
  projects: Project[];
  limit?: number;
}

export function RecentIncidents({ projects, limit = 5 }: RecentIncidentsProps) {
  const incidents = projects
    .flatMap((p) => p.logs.map((l) => ({ ...l, projectName: p.name, projectId: p.id })))
    .filter((l) => l.type !== 'up')
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, limit);

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recent incidents</h3>
        <Badge variant="danger">{incidents.length}</Badge>
      </div>

      {incidents.length ? (
        <ul className="space-y-2">
          {incidents.map((i) => (
            <li key={i.id} className="rounded-lg border border-white/6 bg-white/[0.02] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{i.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{i.details}</p>
                  <p className="mt-1 text-xs text-gray-500">{i.projectName} • {i.timestamp}</p>
                </div>
                <div>
                  <Badge variant={i.type === 'down' ? 'danger' : 'warning'}>{i.type.toUpperCase()}</Badge>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">No recent incidents — everything looks good.</p>
      )}
    </Card>
  );
}
