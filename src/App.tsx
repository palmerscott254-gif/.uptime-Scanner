import { useEffect, useMemo, useState } from 'react';
import { AddProjectModal } from './components/forms/AddProjectModal';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NAV_ITEMS, type NavKey } from './constants/navigation';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { PublicStatusPage } from './pages/PublicStatusPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StatusPage from './pages/StatusPage';
import type { MonitorStatus, PageView, Project, ProjectFormValues, SortKey, TimeRange } from './types';
import { ConfirmModal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { buildSparklineSeries, enrichProject, extractProjectName, normalizeUrl } from './utils';
import { mockProjects } from './data/mock';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// Production implementation notes:
// - Replace mock data generators with API calls to fetch real metrics
// - Use WebSockets or polling for real-time status updates
// - Implement proper error handling and retry logic
// - See /api/README.md for backend API documentation

const defaultForm: ProjectFormValues = {
  url: '',
  name: '',
  interval: 1,
  email: '',
  keepAlive: true,
  retryThreshold: 2,
};

function createLocalProject(values: ProjectFormValues): Project {
  const normalizedUrl = normalizeUrl(values.url);
  const name = values.name.trim() || extractProjectName(normalizedUrl);
  const seed = name.length + values.interval + values.retryThreshold;

  const chart = (length: number, baseUptime: number, baseResponse: number) =>
    Array.from({ length }, (_, index) => ({
      label: `${index + 1}`,
      uptime: Math.max(80, Math.min(100, baseUptime + ((index + seed) % 4) - (index % 5 === 0 ? 2 : 0))),
      response: Math.max(90, Math.min(1200, baseResponse + seed * 12 + index * 11 + (index % 3) * 16)),
    }));

  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `project-${Date.now()}`,
    name,
    url: normalizedUrl,
    status: 'up',
    responseTime: 140 + seed,
    lastChecked: 'Just now',
    interval: values.interval,
    email: values.email,
    alertsEnabled: true,
    keepAlive: values.keepAlive,
    tags: ['Custom', 'New'],
    region: 'US-East',
    sslValid: true,
    uptimePercent: 99,
    lastIncident: 'No incidents',
    incidentCount: 0,
    uptimeSeries: {
      '24h': chart(12, 96, 180),
      '7d': chart(7, 97, 190),
      '30d': chart(10, 98, 170),
    },
    responseSeries: {
      '24h': chart(12, 96, 180),
      '7d': chart(7, 97, 190),
      '30d': chart(10, 98, 170),
    },
    miniSeries: buildSparklineSeries(
      Array.from({ length: 12 }, (_, index) => Math.max(78, Math.min(100, 92 + ((index + seed) % 4) - (index % 5 === 0 ? 2 : 0)))),
    ),
    logs: [
      {
        id: `${name}-log-1`,
        type: 'up',
        message: `${name} probe succeeded`,
        timestamp: 'Just now',
        details: 'Endpoint returned 200 OK within the expected latency window.',
      },
      {
        id: `${name}-log-2`,
        type: 'up',
        message: 'Next probe scheduled',
        timestamp: '6 min ago',
        details: 'Monitoring will continue on the configured interval.',
      },
      {
        id: `${name}-log-3`,
        type: 'up',
        message: 'Configuration saved',
        timestamp: '19 min ago',
        details: 'Monitor settings were created successfully.',
      },
    ],
  };
}

export default function App() {
  const [activeNav, setActiveNav] = useState<NavKey>('dashboard');
  const [view, setView] = useState<PageView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [range, setRange] = useState<TimeRange>('24h');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('uptime');
  const [modalOpen, setModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<ProjectFormValues>(defaultForm);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; projectId?: string; projectName?: string }>({ open: false });
  const [undoToast, setUndoToast] = useState<{ show: boolean; project?: Project | null }>({ show: false, project: null });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        const text = await response.text();
        if (!response.ok) {
          console.error('API error', response.status, text);
          throw new Error(`API returned status ${response.status}`);
        }
        if (!text) {
          console.error('Empty response from API');
          throw new Error('Empty response from API');
        }
        const parsed = JSON.parse(text) as { data?: Project[] } | Project[];
        const nextProjects = Array.isArray(parsed) ? parsed : parsed.data ?? [];
        setProjects(nextProjects.map(enrichProject));
        setSelectedProjectId((current) => current || nextProjects[0]?.id || '');
      } catch (error) {
        console.error('Failed to load projects:', error);
        // Fallback to local mock data for offline / demo mode
        setProjects(mockProjects.map(enrichProject));
        setSelectedProjectId((current) => current || mockProjects[0]?.id || '');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    function onRequest(e: Event) {
      const detail = (e as CustomEvent).detail as { id?: string; name?: string } | undefined;
      if (!detail?.id) return;
      setConfirmDelete({ open: true, projectId: detail.id, projectName: detail.name });
    }
    window.addEventListener('request-delete', onRequest as EventListener);
    return () => window.removeEventListener('request-delete', onRequest as EventListener);
  }, []);

  useEffect(() => {
    if (selectedProjectId && !projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0]?.id ?? '');
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId && projects[0]?.id) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId],
  );

  const openModal = () => {
    setModalOpen(true);
    setTestStatus('idle');
    setFormValues({ ...defaultForm, name: '', url: '', interval: 1, email: '', keepAlive: true, retryThreshold: 2 });
  };

  const handleFormChange = (next: ProjectFormValues) => {
    const nextName = next.name.trim() || extractProjectName(next.url);
    setFormValues({ ...next, name: nextName });
  };

  const handleTestUrl = async () => {
    setTestStatus('loading');
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formValues.url }),
      });

      const result = (await response.json()) as { reachable?: boolean };
      setTestStatus(result.reachable ? 'success' : 'error');
      if (!formValues.name.trim()) {
        setFormValues((current) => ({ ...current, name: extractProjectName(current.url) }));
      }
    } catch (error) {
      console.error('Failed to test URL:', error);
      setTestStatus('error');
    }
  };

  const handleCreateProject = async () => {
    if (!formValues.url.trim()) return;
    const normalizedUrl = normalizeUrl(formValues.url);
    const nextName = formValues.name.trim() || extractProjectName(normalizedUrl);
    const nextValues = { ...formValues, url: normalizedUrl, name: nextName };

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizedUrl,
          name: nextName,
          interval: formValues.interval,
          email: formValues.email,
          keepAlive: formValues.keepAlive,
          retryThreshold: formValues.retryThreshold,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.status}`);
      }

      const payload = (await response.json()) as { data?: Project } | Project;
      const created = 'data' in payload ? payload.data : payload;
      if (!created || !('id' in created)) {
        throw new Error('Invalid project payload returned from API');
      }

      setProjects((current) => [enrichProject(created), ...current]);
      setSelectedProjectId(created.id);
      setModalOpen(false);
      setView('dashboard');
      setTestStatus('idle');
      setFormValues(defaultForm);
    } catch (error) {
      console.error('Failed to create project:', error);
      const created = enrichProject(createLocalProject(nextValues));
      setProjects((current) => [created, ...current]);
      setSelectedProjectId(created.id);
      setModalOpen(false);
      setView('dashboard');
      setTestStatus('idle');
      setFormValues(defaultForm);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setActiveNav('dashboard');
    setView('details');
  };

  const handleLogsProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setActiveNav('dashboard');
    setView('details');
  };

  const handleRequestDelete = (project: Project) => {
    setConfirmDelete({ open: true, projectId: project.id, projectName: project.name });
  };

  const performDelete = async (projectId?: string) => {
    if (!projectId) return;
    // Optimistic UI removal
    const removed = projects.find((p) => p.id === projectId) ?? null;
    setProjects((current) => current.filter((p) => p.id !== projectId));
    setConfirmDelete({ open: false });
    setUndoToast({ show: true, project: removed });

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      // persist handled by backend
    } catch (err) {
      console.error('Delete failed, rolling back', err);
      // rollback
      if (removed) setProjects((current) => [removed!, ...current]);
      setUndoToast({ show: false, project: null });
    }
  };

  const handleUndo = () => {
    if (!undoToast.project) return;
    // Re-create the project locally (best-effort)
    setProjects((current) => [undoToast.project as Project, ...current]);
    setUndoToast({ show: false, project: null });
  };

  const handleNavChange = (key: NavKey) => {
    setActiveNav(key);
    if (key === 'dashboard') {
      setView('dashboard');
      return;
    }
    if (key === 'status') {
      setView('status');
      return;
    }
    setView('dashboard');
  };

  const renderView = () => {
    if (activeNav === 'alerts') {
      return <AlertsPage />;
    }

    if (activeNav === 'analytics') {
      return <AnalyticsPage />;
    }

    if (view === 'details' && selectedProject) {
      return <ProjectDetailsPage project={selectedProject} range={range} onRangeChange={setRange} onBack={() => setView('dashboard')} />;
    }

    if (view === 'status') {
      return (
        <StatusPage
          projects={projects}
          onCreate={openModal}
          onEdit={(p) => {
            setFormValues({ url: p.url, name: p.name, interval: p.interval, email: p.email, keepAlive: p.keepAlive ?? true, retryThreshold: p.retryThreshold ?? 2 });
            setModalOpen(true);
          }}
          onDelete={(p) => handleRequestDelete(p)}
          onTogglePause={(p) => {
            // toggle keepAlive flag
            const next = projects.map((proj) => (proj.id === p.id ? { ...proj, keepAlive: !proj.keepAlive } : proj));
            setProjects(next);
            // persist to backend
            fetch(`${API_BASE_URL}/api/projects/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keepAlive: !p.keepAlive }) }).catch(() => {});
          }}
          onView={(p) => {
            setSelectedProjectId(p.id);
            setView('details');
          }}
          onUpdateProject={(updated) => {
            setProjects((current) => current.map((proj) => (proj.id === updated.id ? updated : proj)));
            fetch(`${API_BASE_URL}/api/projects/${updated.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) }).catch(() => {});
          }}
        />
      );
    }

    return (
      <DashboardPage
        projects={projects}
        loading={loading}
        search={search}
        statusFilter={statusFilter}
        tagFilter={tagFilter}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onTagFilterChange={setTagFilter}
        onSortChange={setSortBy}
        onAddProject={openModal}
        onViewProject={handleViewProject}
        onLogsProject={handleLogsProject}
        onDeleteProject={handleRequestDelete}
      />
    );
  };

  return (
    <div className="min-h-screen bg-app-bg text-white">
      <Sidebar
        active={activeNav}
        onChange={handleNavChange}
        collapsed={sidebarCollapsed}
        onCollapseToggle={() => setSidebarCollapsed((current) => !current)}
        mobileOpen={sidebarOpenMobile}
        onMobileToggle={() => setSidebarOpenMobile((current) => !current)}
      />

      <div className={sidebarCollapsed ? 'lg:pl-[84px]' : 'lg:pl-[264px]'}>
        <Topbar
          search={(activeNav === 'dashboard' && view === 'dashboard') || activeNav === 'status' ? search : undefined}
          onSearchChange={(activeNav === 'dashboard' && view === 'dashboard') || activeNav === 'status' ? setSearch : undefined}
          onAddProject={activeNav === 'dashboard' && view === 'dashboard' ? openModal : activeNav === 'status' ? openModal : undefined}
        />

        <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">{renderView()}</main>
      </div>

      <AddProjectModal
        open={modalOpen}
        values={formValues}
        onChange={handleFormChange}
        onClose={() => setModalOpen(false)}
        onTest={handleTestUrl}
        testStatus={testStatus}
        onSubmit={handleCreateProject}
      />

      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmDelete.open}
        title={`Delete monitor${confirmDelete.projectName ? ` — ${confirmDelete.projectName}` : ''}`}
        description="This will permanently remove the monitor and its history."
        onClose={() => setConfirmDelete({ open: false })}
        onConfirm={() => performDelete(confirmDelete.projectId)}
        confirmLabel="Delete"
      >
        <p className="text-sm text-gray-400">Are you sure you want to delete this monitor? This action cannot be undone.</p>
      </ConfirmModal>

      {/* Undo toast */}
      {undoToast.show ? (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="rounded-2xl border border-white/10 bg-app-card px-4 py-3 shadow-lg">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium">Monitor deleted</p>
                <p className="text-xs text-gray-400">You can undo this action.</p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleUndo}>Undo</Button>
                <Button variant="ghost" size="sm" onClick={() => setUndoToast({ show: false, project: null })}>Dismiss</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
