export type MonitorStatus = 'up' | 'down' | 'slow';
export type PageView = 'dashboard' | 'details' | 'status';
export type TimeRange = '24h' | '7d' | '30d';

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
  tags: string[];
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
}
