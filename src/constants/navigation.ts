import type { LucideIcon } from 'lucide-react';
import { Bell, ChartNoAxesCombined, LayoutDashboard, MonitorCog, Settings, Siren } from 'lucide-react';

export type NavKey = 'dashboard' | 'monitors' | 'alerts' | 'analytics' | 'status' | 'settings';

export interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'monitors', label: 'Monitors', icon: MonitorCog },
  { key: 'alerts', label: 'Alerts', icon: Siren },
  { key: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { key: 'status', label: 'Status Pages', icon: Bell },
  { key: 'settings', label: 'Settings', icon: Settings },
];
