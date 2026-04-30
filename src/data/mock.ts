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
  const primary =
    status === 'down'
      ? {
          message: `${name} probe failed`,
          details: 'Connection timed out after the configured threshold.',
        }
      : status === 'slow'
        ? {
            message: `${name} latency above threshold`,
            details: 'Endpoint returned 200 OK with elevated response time.',
          }
        : {
            message: `${name} probe succeeded`,
            details: 'Endpoint returned 200 OK within the expected latency window.',
          };

  return [
    {
      id: `${name}-1`,
      type: 'up' as const,
      message: primary.message,
      timestamp: 'Just now',
      details: primary.details,
    },
    {
      id: `${name}-2`,
      type: status === 'down' ? ('down' as const) : ('slow' as const),
      message:
        status === 'down'
          ? `${name} incident opened`
          : `${name} latency evaluation in progress`,
      timestamp: '6 min ago',
      details:
        status === 'down'
          ? 'Retry threshold reached after consecutive timeouts.'
          : 'Latency spiked above the warning threshold on the last check.',
    },
    {
      id: `${name}-3`,
      type: 'up' as const,
      message: 'Next probe scheduled',
      timestamp: '18 min ago',
      details: 'Monitoring will continue on the configured interval.',
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

export const mockProjects: Project[] = [];
