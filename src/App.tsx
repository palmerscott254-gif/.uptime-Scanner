import { useEffect, useMemo, useState } from 'react';
import { Activity, LayoutDashboard, MonitorSmartphone } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AddProjectModal } from './components/forms/AddProjectModal';
import { Button } from './components/ui/Button';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { PublicStatusPage } from './pages/PublicStatusPage';
import type { MonitorStatus, PageView, Project, ProjectFormValues, TimeRange } from './types';
import { extractProjectName, normalizeUrl, slugify } from './utils';

// Production implementation notes:
// - Replace mock data generators with API calls to fetch real metrics
// - Use WebSockets or polling for real-time status updates
// - Implement proper error handling and retry logic
// - See /api/README.md for backend API documentation

function buildProject(values: ProjectFormValues): Project {
  const id = slugify(values.name || extractProjectName(values.url)) || `project-${Date.now()}`;
  const seed = id.length + values.interval;
  const safeName = values.name.trim() || extractProjectName(values.url);
  const url = normalizeUrl(values.url);

  // In production, this should POST to /api/projects
  return {
    id,
    name: safeName,
    url,
    status: 'up',
    responseTime: 0,
    lastChecked: 'Pending...',
    interval: values.interval,
    email: values.email,
    alertsEnabled: true,
    keepAlive: false,
    tags: ['Custom'],
    uptimeSeries: { '24h': [], '7d': [], '30d': [] },
    responseSeries: { '24h': [], '7d': [], '30d': [] },
    miniSeries: [],
    logs: [],
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [range, setRange] = useState<TimeRange>('24h');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<ProjectFormValues>(defaultForm);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Initialize projects from API endpoint in production
  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     try {
  //       const response = await fetch('/api/projects');
  //       const data = await response.json();
  //       setProjects(data);
  //     } catch (error) {
  //       console.error('Failed to fetch projects:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchProjects();
  // }, []);

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
    const created = buildProject({ ...formValues, url: normalizedUrl, name: nextName });
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
