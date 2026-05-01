import { Pause, Play, Pencil, Trash2, Eye } from 'lucide-react';
import type { Project, MonitorStatus } from '../../types';

interface MonitorTableProps {
  projects: Project[];
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  onTogglePause: (p: Project) => void;
  onView: (p: Project) => void;
  search?: string;
  filterStatus?: MonitorStatus | 'all';
}

export function MonitorTable({ projects, onEdit, onDelete, onTogglePause, onView, search = '', filterStatus = 'all' }: MonitorTableProps) {
  const q = search.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    if (filterStatus !== 'all') {
      if (filterStatus === 'paused') return p.keepAlive === false;
      if (p.status !== filterStatus) return false;
    }
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.url.toLowerCase().includes(q) || (p.tags || []).join(' ').toLowerCase().includes(q);
  });

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-fixed">
          <thead>
            <tr className="text-left text-xs text-gray-400">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">URL / IP</th>
              <th className="pb-3 pr-4">Current</th>
              <th className="pb-3 pr-4">Uptime %</th>
              <th className="pb-3 pr-4">Response</th>
              <th className="pb-3 pr-4">Last check</th>
              <th className="pb-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-white/6 hover:bg-white/[0.02]">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.tags?.join(', ')}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-sm text-gray-300 truncate">{p.url}</td>
                <td className="py-3 pr-4 text-sm">
                  {p.keepAlive === false ? (
                    <span className="rounded-full bg-yellow-600/20 px-2 py-1 text-xs text-yellow-300">Paused</span>
                  ) : p.status === 'up' ? (
                    <span className="rounded-full bg-green-600/10 px-2 py-1 text-xs text-green-300">Up</span>
                  ) : p.status === 'down' ? (
                    <span className="rounded-full bg-red-600/10 px-2 py-1 text-xs text-red-300">Down</span>
                  ) : (
                    <span className="rounded-full bg-amber-600/10 px-2 py-1 text-xs text-amber-300">{p.status}</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-sm">{p.uptimePercent ?? '—'}%</td>
                <td className="py-3 pr-4 text-sm">{p.responseTime ?? '—'}ms</td>
                <td className="py-3 pr-4 text-sm text-gray-400">{p.lastChecked}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-2">
                    <button title="View" onClick={() => onView(p)} className="rounded-lg p-2 text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button title="Edit" onClick={() => onEdit(p)} className="rounded-lg p-2 text-gray-400 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button title={p.keepAlive === false ? 'Resume' : 'Pause'} onClick={() => onTogglePause(p)} className="rounded-lg p-2 text-gray-400 hover:text-white">
                      {p.keepAlive === false ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>
                    <button title="Delete" onClick={() => onDelete(p)} className="rounded-lg p-2 text-red-400 hover:text-white">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? <div className="mt-4 text-center text-sm text-gray-400">No monitors match your query.</div> : null}
    </div>
  );
}

export default MonitorTable;
