import { useEffect, useMemo, useState } from 'react';
import { AddProjectModal } from './components/forms/AddProjectModal';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NAV_ITEMS, type NavKey } from './constants/navigation';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { PublicStatusPage } from './pages/PublicStatusPage';
import type { MonitorStatus, PageView, Project, ProjectFormValues, SortKey, TimeRange } from './types';
import { enrichProject, extractProjectName, normalizeUrl } from './utils';

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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        const data = (await response.json()) as { data?: Project[] } | Project[];
        const nextProjects = Array.isArray(data) ? data : data.data ?? [];
        setProjects(nextProjects.map(enrichProject));
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

      setProjects((current) => [enrichProject(created), ...current]);
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
    setActiveNav('dashboard');
    setView('details');
  };

  const handleLogsProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setActiveNav('dashboard');
    setView('details');
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
    if (['alerts', 'analytics', 'settings'].includes(activeNav)) {
      const current = NAV_ITEMS.find((item) => item.key === activeNav);
      return (
        <section className="rounded-[1.75rem] border border-dashed border-white/15 bg-app-card/60 p-12 text-center shadow-soft">
          <h2 className="text-3xl font-semibold text-white">{current?.label}</h2>
          <p className="mt-3 text-gray-400">This module shell is ready for the next backend integration pass.</p>
        </section>
      );
    }

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
        tagFilter={tagFilter}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
        onTagFilterChange={setTagFilter}
        onSortChange={setSortBy}
        onAddProject={openModal}
        onViewProject={handleViewProject}
        onLogsProject={handleLogsProject}
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
        <Topbar search={search} onSearchChange={setSearch} onAddProject={openModal} />

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
    </div>
  );
}
