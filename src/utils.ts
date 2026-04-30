import type { MonitorStatus, Project, SparkPoint, TimeRange } from './types';

export const statusMeta: Record<
  MonitorStatus,
  { label: string; dot: string; border: string; badge: string; accent: string }
> = {
  up: {
    label: 'UP',
    dot: 'bg-success',
    border: 'border-l-success',
    badge: 'bg-success/15 text-success ring-success/20',
    accent: 'from-success/20 to-transparent',
  },
  down: {
    label: 'DOWN',
    dot: 'bg-danger',
    border: 'border-l-danger',
    badge: 'bg-danger/15 text-danger ring-danger/20',
    accent: 'from-danger/20 to-transparent',
  },
  slow: {
    label: 'SLOW',
    dot: 'bg-warning',
    border: 'border-l-warning',
    badge: 'bg-warning/15 text-warning ring-warning/20',
    accent: 'from-warning/20 to-transparent',
  },
};

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatResponseTime(ms: number) {
  return `${Math.round(ms)}ms`;
}

export function formatInterval(minutes: number) {
  return minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`;
}

export function formatRelativeTime(value: string) {
  if (!value) return '—';
  return value;
}

export function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function extractProjectName(url: string) {
  try {
    const parsed = new URL(normalizeUrl(url));
    const host = parsed.hostname.replace(/^www\./i, '');
    const segments = parsed.pathname.split('/').filter(Boolean);
    const base = segments[0] ? `${host}/${segments[0]}` : host;
    return base
      .split(/[./-]/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return 'New Project';
  }
}

export function generatePublicUrl(name: string) {
  return `https://${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.example.com`;
}

export function averageResponse(projects: Project[]) {
  if (!projects.length) return 0;
  return Math.round(projects.reduce((sum, project) => sum + project.responseTime, 0) / projects.length);
}

export function getUptimePercent(project: Project, range: TimeRange = '7d') {
  const points = project.uptimeSeries?.[range] ?? [];
  if (!points.length) return 0;
  const total = points.reduce((sum, point) => sum + point.uptime, 0);
  return Number((total / points.length).toFixed(2));
}

export function enrichProject(project: Project): Project {
  return {
    ...project,
    region: project.region ?? (project.tags.includes('API') ? 'US-East' : 'EU-West'),
    sslValid: project.sslValid ?? true,
    uptimePercent: project.uptimePercent ?? getUptimePercent(project, '7d'),
    lastIncident: project.lastIncident ?? project.logs.find((log) => log.type !== 'up')?.timestamp ?? 'No incidents',
    incidentCount: project.incidentCount ?? project.logs.filter((log) => log.type !== 'up').length,
  };
}

export function projectSummary(projects: Project[]) {
  const total = projects.length;
  const online = projects.filter((project) => project.status === 'up').length;
  const down = projects.filter((project) => project.status === 'down').length;
  return { total, online, down, avgResponse: averageResponse(projects) };
}

export function buildSparklineSeries(points: number[]) {
  return points.map((value, index) => ({ label: `${index}`, value }));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatSeriesPoints(points: SparkPoint[]) {
  return points.map((point) => ({ ...point, label: point.label }));
}
