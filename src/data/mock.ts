import type { Project } from '../types';
import { buildSparklineSeries, generatePublicUrl } from '../utils';

function createChartSeries(values: Array<{ uptime: number; response: number }>, labels: string[]) {
  return values.map((entry, index) => ({ label: labels[index] ?? `${index}`, ...entry }));
}

const uptime24Labels = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];
const uptime7Labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const uptime30Labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'];

const makeSeries = (seed: number) => {
  const a = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const map24 = Array.from({ length: 12 }, (_, index) => ({
    uptime: a(94 + ((index + seed) % 3) - (index % 4 === 0 ? 1 : 0), 86, 100),
    response: a(180 + seed * 16 + (index % 4) * 18 + (index % 3) * 6, 90, 900),
  }));
  const map7 = Array.from({ length: 7 }, (_, index) => ({
    uptime: a(97 - (index === 5 ? 5 : 0) - (index === 2 ? 1 : 0) + (seed % 2), 80, 100),
    response: a(170 + seed * 20 + index * 8 + (index % 2) * 18, 90, 900),
  }));
  const map30 = Array.from({ length: 10 }, (_, index) => ({
    uptime: a(98 - (index % 5 === 0 ? 2 : 0) - (index === 7 ? 4 : 0), 80, 100),
    response: a(160 + seed * 18 + index * 7 + (index % 4) * 14, 90, 900),
  }));

  return {
    '24h': createChartSeries(map24, uptime24Labels),
    '7d': createChartSeries(map7, uptime7Labels),
    '30d': createChartSeries(map30, uptime30Labels),
  };
};

function createLogs(name: string, status: 'up' | 'down' | 'slow') {
  return [
    {
      id: `${name}-1`,
      type: 'up' as const,
      message: `${name} responded within SLA`,
      timestamp: 'Just now',
      details: 'TLS handshake completed in 48ms.',
    },
    {
      id: `${name}-2`,
      type: status === 'down' ? ('down' as const) : ('slow' as const),
      message: status === 'down' ? 'Site DOWN (timeout)' : 'Site SLOW (recovered)',
      timestamp: '6 min ago',
      details: status === 'down' ? 'Request timed out after 10s.' : 'Latency peaked at 980ms before recovery.',
    },
    {
      id: `${name}-3`,
      type: 'up' as const,
      message: 'Monitoring interval completed',
      timestamp: '18 min ago',
      details: 'Next check scheduled in 60 seconds.',
    },
  ];
}

const makeMiniSeries = (seed: number) =>
  buildSparklineSeries(
    Array.from({ length: 12 }, (_, index) => {
      const base = 92 + ((index + seed) % 4) - (index % 5 === 0 ? 2 : 0);
      return Math.max(78, Math.min(100, base));
    }),
  );

export const mockProjects: Project[] = [
  {
    id: 'nebula',
    name: 'Nebula Commerce',
    url: generatePublicUrl('Nebula Commerce'),
    status: 'up',
    responseTime: 184,
    lastChecked: '30 seconds ago',
    interval: 1,
    email: 'ops@nebula.com',
    alertsEnabled: true,
    keepAlive: true,
    tags: ['Storefront', 'API'],
    uptimeSeries: makeSeries(1),
    responseSeries: makeSeries(2),
    miniSeries: makeMiniSeries(1),
    logs: createLogs('Nebula Commerce', 'up'),
  },
  {
    id: 'pulse-api',
    name: 'Pulse API',
    url: generatePublicUrl('Pulse API'),
    status: 'slow',
    responseTime: 864,
    lastChecked: '2 minutes ago',
    interval: 5,
    email: 'alerts@pulse.dev',
    alertsEnabled: true,
    keepAlive: false,
    tags: ['API', 'Backend'],
    uptimeSeries: makeSeries(2),
    responseSeries: makeSeries(3),
    miniSeries: makeMiniSeries(2),
    logs: createLogs('Pulse API', 'slow'),
  },
  {
    id: 'flux-frontend',
    name: 'Flux Frontend',
    url: generatePublicUrl('Flux Frontend'),
    status: 'up',
    responseTime: 122,
    lastChecked: '12 seconds ago',
    interval: 1,
    email: 'team@flux.dev',
    alertsEnabled: false,
    keepAlive: true,
    tags: ['Frontend', 'CDN'],
    uptimeSeries: makeSeries(3),
    responseSeries: makeSeries(1),
    miniSeries: makeMiniSeries(3),
    logs: createLogs('Flux Frontend', 'up'),
  },
  {
    id: 'atlas-docs',
    name: 'Atlas Docs',
    url: generatePublicUrl('Atlas Docs'),
    status: 'down',
    responseTime: 0,
    lastChecked: '8 minutes ago',
    interval: 10,
    email: 'docs@atlas.io',
    alertsEnabled: true,
    keepAlive: false,
    tags: ['Docs', 'Public'],
    uptimeSeries: makeSeries(4),
    responseSeries: makeSeries(4),
    miniSeries: makeMiniSeries(4),
    logs: createLogs('Atlas Docs', 'down'),
  },
  {
    id: 'nova-status',
    name: 'Nova Status Page',
    url: generatePublicUrl('Nova Status Page'),
    status: 'up',
    responseTime: 96,
    lastChecked: '55 seconds ago',
    interval: 1,
    email: 'status@nova.co',
    alertsEnabled: true,
    keepAlive: true,
    tags: ['Status', 'Frontend'],
    uptimeSeries: makeSeries(5),
    responseSeries: makeSeries(5),
    miniSeries: makeMiniSeries(5),
    logs: createLogs('Nova Status Page', 'up'),
  },
];
