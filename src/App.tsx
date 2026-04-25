import { useEffect, useMemo, useState } from 'react';
import { Activity, LayoutDashboard, MonitorSmartphone } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AddProjectModal } from './components/forms/AddProjectModal';
import { Button } from './components/ui/Button';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { PublicStatusPage } from './pages/PublicStatusPage';
import { mockProjects } from './data/mock';
import type { MonitorStatus, PageView, Project, ProjectFormValues, TimeRange } from './types';
import { extractProjectName, normalizeUrl, slugify } from './utils';

function createSeries(seed: number) {
  const make = (length: number, baseUptime: number, baseResponse: number) =>
    Array.from({ length }, (_, index) => ({
      label: `${index + 1}`,
      uptime: Math.max(80, Math.min(100, baseUptime + ((index + seed) % 4) - (index % 5 === 0 ? 2 : 0))),
      response: Math.max(90, Math.min(1200, baseResponse + seed * 14 + index * 10 + (index % 3) * 16)),
    }));

  return {
    '24h': make(12, 95, 160),
    '7d': make(7, 97, 175),
    '30d': make(10, 98, 165),
  } satisfies Project['uptimeSeries'];
}

function createLogs(name: string, status: MonitorStatus) {
  return [
    {
      id: `${name}-log-1`,
      type: 'up' as const,
      message: `${name} responded normally`,
      timestamp: 'Just now',
      details: 'Health check returned 200 OK in 112ms.',
    },
    {
      id: `${name}-log-2`,
      type: status,
      message: status === 'down' ? 'Site DOWN (timeout)' : status === 'slow' ? 'Site SLOW (latency spike)' : 'Site UP',
      timestamp: '7 min ago',
      details:
        status === 'down'
          ? 'Request timed out after the configured threshold.'
          : 'Response times recovered after a brief congestion window.',
    },
    {
      id: `${name}-log-3`,
      type: 'up' as const,
      message: 'Monitoring cycle completed',
      timestamp: '19 min ago',
      details: 'Next interval is queued and ready.',
    },
  ];
}

function createMiniSeries(seed: number) {
  return Array.from({ length: 12 }, (_, index) => ({
    label: `${index}`,
    value: Math.max(78, Math.min(100, 92 + ((index + seed) % 4) - (index % 5 === 0 ? 2 : 0))),
  }));
}

function buildProject(values: ProjectFormValues, status: MonitorStatus): Project {
  const id = slugify(values.name || extractProjectName(values.url)) || `project-${Date.now()}`;
  const seed = id.length + values.interval;
  const safeName = values.name.trim() || extractProjectName(values.url);
  const url = normalizeUrl(values.url);

  return {
    id,
    name: safeName,
    url,
    status,
    responseTime: status === 'down' ? 0 : status === 'slow' ? 790 : 142 + seed,
    lastChecked: 'Just now',
    interval: values.interval,
    email: values.email,
    alertsEnabled: true,
    keepAlive: false,
    tags: ['Custom', 'New'],
    uptimeSeries: createSeries(seed),
    responseSeries: createSeries(seed + 1),
    miniSeries: createMiniSeries(seed),
    logs: createLogs(safeName, status),
  };
}

const defaultForm: ProjectFormValues = {
  url: '',
  name: '',
  interval: 1,
  email: '',
};

export default function App() {
  const [view, setView] = useState<PageView>('dashboard');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0]?.id ?? '');
  const [range, setRange] = useState<TimeRange>('24h');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<ProjectFormValues>(defaultForm);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (view === 'details' && selectedProjectId && !projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0]?.id ?? '');
    }
  }, [projects, selectedProjectId, view]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? projects[0],
    [projects, selectedProjectId],
  );

  const openModal = () => {
    setModalOpen(true);
    setTestStatus('idle');
    setFormValues({ ...defaultForm, name: '', url: '', interval: 1, email: '' });
  };

  const handleFormChange = (next: ProjectFormValues) => {
    const nextName = next.name.trim() || extractProjectName(next.url);
    setFormValues({ ...next, name: nextName });
  };

  const handleTestUrl = () => {
    setTestStatus('loading');
    window.setTimeout(() => {
      const normalized = normalizeUrl(formValues.url);
      const isReachable = /^https?:\/\//i.test(normalized) && !/offline|down|fail/i.test(normalized);
      setTestStatus(isReachable ? 'success' : 'error');
      if (!formValues.name.trim()) {
        setFormValues((current) => ({ ...current, name: extractProjectName(current.url) }));
      }
    }, 800);
  };

  const handleCreateProject = () => {
    if (!formValues.url.trim()) return;
    const normalizedUrl = normalizeUrl(formValues.url);
    const nextName = formValues.name.trim() || extractProjectName(normalizedUrl);
    const status: MonitorStatus = testStatus === 'error' ? 'slow' : 'up';
    const created = buildProject({ ...formValues, url: normalizedUrl, name: nextName }, status);
    setProjects((current) => [created, ...current]);
    setSelectedProjectId(created.id);
    setModalOpen(false);
    setView('dashboard');
    setTestStatus('idle');
    setFormValues(defaultForm);
  };

  const handleViewProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setView('details');
  };

  const handleLogsProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setView('details');
  };

  const renderView = () => {
    if (view === 'details' && selectedProject) {
      return <ProjectDetailsPage project={selectedProject} range={range} onRangeChange={setRange} onBack={() => setView('dashboard')} />;
    }

    if (view === 'status') {
      return <PublicStatusPage projects={projects} />;
    }

    return (
      <DashboardPage
        projects={projects}
        loading={loading}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onAddProject={openModal}
        onViewProject={handleViewProject}
        onLogsProject={handleLogsProject}
      />
    );
  };

  return (
    <div className="min-h-screen bg-app-bg text-white">
      <Navbar onAddProject={openModal} />

      <div className="border-b border-white/8 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          <Button
            variant={view === 'dashboard' ? 'primary' : 'ghost'}
            size="sm"
            icon={<LayoutDashboard className="h-4 w-4" />}
            onClick={() => setView('dashboard')}
          >
            Dashboard
          </Button>
          <Button
            variant={view === 'details' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Activity className="h-4 w-4" />}
            onClick={() => setView('details')}
          >
            Project Details
          </Button>
          <Button
            variant={view === 'status' ? 'primary' : 'ghost'}
            size="sm"
            icon={<MonitorSmartphone className="h-4 w-4" />}
            onClick={() => setView('status')}
          >
            Public Status
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{renderView()}</main>

      <AddProjectModal
        open={modalOpen}
        values={formValues}
        onChange={handleFormChange}
        onClose={() => setModalOpen(false)}
        onTest={handleTestUrl}
        testStatus={testStatus}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
