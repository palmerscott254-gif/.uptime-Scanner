import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import MonitorTable from '../components/monitor/MonitorTable';
import MonitorModal from '../components/monitor/MonitorModal';
import type { Project, MonitorStatus } from '../types';
import { Button } from '../components/ui/Button';

interface StatusPageProps {
  projects: Project[];
  onCreate: () => void;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  onTogglePause: (p: Project) => void;
  onView: (p: Project) => void;
  onUpdateProject: (updated: Project) => void;
}

export default function StatusPage({ projects, onCreate, onEdit, onDelete, onTogglePause, onView, onUpdateProject }: StatusPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorStatus | 'all' | 'paused'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const handleOpenCreate = () => {
    onCreate();
  };

  const handleEdit = (p: Project) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleModalSubmit = async (values: Partial<Project>) => {
    if (!editing) return;
    const merged = { ...editing, ...values } as Project;
    // call parent update
    onUpdateProject(merged);
  };

  const counts = useMemo(() => {
    return {
      total: projects.length,
      down: projects.filter((p) => p.status === 'down').length,
      up: projects.filter((p) => p.status === 'up').length,
      paused: projects.filter((p) => p.keepAlive === false).length,
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-app-card p-6 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-gray-500">Monitors</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Monitor management</h1>
            <p className="mt-2 text-gray-400">Add, edit, pause and remove monitors from your account.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-2 sm:flex">
              <input className="h-10 w-64 bg-transparent px-3 text-sm text-white outline-none" placeholder="Search monitors" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button onClick={handleOpenCreate}>Add monitor</Button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-4">
          <div className="text-sm text-gray-400">Total: <span className="text-white">{counts.total}</span></div>
          <div className="text-sm text-gray-400">Up: <span className="text-white">{counts.up}</span></div>
          <div className="text-sm text-gray-400">Down: <span className="text-white">{counts.down}</span></div>
          <div className="text-sm text-gray-400">Paused: <span className="text-white">{counts.paused}</span></div>
        </div>

        <MonitorTable
          projects={projects}
          onEdit={(p) => handleEdit(p)}
          onDelete={(p) => onDelete(p)}
          onTogglePause={(p) => onTogglePause(p)}
          onView={(p) => onView(p)}
          search={search}
          filterStatus={statusFilter as MonitorStatus | 'all'}
        />
      </section>

      <MonitorModal open={modalOpen} project={editing} onClose={() => setModalOpen(false)} onSubmit={handleModalSubmit} />
    </div>
  );
}
