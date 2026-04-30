import { useEffect, useMemo, useState } from 'react';
import { Activity, LayoutDashboard, MonitorSmartphone } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AddProjectModal } from './components/forms/AddProjectModal';
import { Button } from './components/ui/Button';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { PublicStatusPage } from './pages/PublicStatusPage';
import type { MonitorStatus, PageView, Project, ProjectFormValues, TimeRange } from './types';
import { extractProjectName, normalizeUrl } from './utils';

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
};

export default function App() {
  const [view, setView] = useState<PageView>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [range, setRange] = useState<TimeRange>('24h');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MonitorStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<ProjectFormValues>(defaultForm);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        const data = (await response.json()) as { data?: Project[] } | Project[];
        const nextProjects = Array.isArray(data) ? data : data.data ?? [];
        setProjects(nextProjects);
        setSelectedProjectId((current) => current || nextProjects[0]?.id || '');
      } catch (error) {
        console.error('Failed to load projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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
    setFormValues({ ...defaultForm, name: '', url: '', interval: 1, email: '' });
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

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizedUrl,
          name: nextName,
          interval: formValues.interval,
          email: formValues.email,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.status}`);
      }

      const payload = (await response.json()) as { data?: Project } | Project;
      const created = 'data' in payload ? payload.data : payload;
      if (!created || !('id' in created)) return;

      setProjects((current) => [created, ...current]);
      setSelectedProjectId(created.id);
      setModalOpen(false);
      setView('dashboard');
      setTestStatus('idle');
      setFormValues(defaultForm);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
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
