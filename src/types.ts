export type MonitorStatus = 'up' | 'down' | 'slow';
export type PageView = 'dashboard' | 'details' | 'status';
export type TimeRange = '24h' | '7d' | '30d';
export type SortKey = 'uptime' | 'response';

export interface ChartPoint {
  label: string;
  uptime: number;
  response: number;
}

export interface SparkPoint {
  label: string;
  value: number;
}

export interface LogEntry {
  id: string;
  type: MonitorStatus;
  message: string;
  timestamp: string;
  details?: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  status: MonitorStatus;
  responseTime: number;
  lastChecked: string;
  interval: number;
  email: string;
  alertsEnabled: boolean;
  keepAlive: boolean;
  retryThreshold?: number;
  tags: string[];
  region?: string;
  sslValid?: boolean;
  uptimePercent?: number;
  lastIncident?: string;
  incidentCount?: number;
  uptimeSeries: Record<TimeRange, ChartPoint[]>;
  responseSeries: Record<TimeRange, ChartPoint[]>;
  miniSeries: SparkPoint[];
  logs: LogEntry[];
}

export interface ProjectFormValues {
  url: string;
  name: string;
  interval: number;
  email: string;
  keepAlive: boolean;
  retryThreshold: number;
}
